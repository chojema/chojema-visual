import { parseArgs } from 'node:util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

export function execute(action) {
  try { action(); } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

export const readJSON = (path) => JSON.parse(readFileSync(path, 'utf8'));
const fail = (message) => { throw new Error(message); };
const seconds = (value) => Number(value.toFixed(6));

export function openEdit(mode, extraOptions) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean' }, apply: { type: 'boolean' },
      video: { type: 'string' }, output: { type: 'string', short: 'o' },
      'out-dir': { type: 'string' }, ffmpeg: { type: 'string', default: 'ffmpeg' },
      ffprobe: { type: 'string', default: 'ffprobe' }, ...extraOptions,
    },
  });
  if (values.help) {
    console.log(mode === 'silence'
      ? 'Usage: node cut-silences.mjs TRANSCRIPT.json [--gap 0.55] [--head-pad 0.22] [--tail-pad 0.34] [--video SOURCE.mp4] [--output NEW.mp4] [--out-dir DIR] [--apply] [--ffmpeg PATH] [--ffprobe PATH]'
      : 'Usage: node apply-cuts.mjs TRANSCRIPT.json --cuts CUTS.json [--video SOURCE.mp4] [--output NEW.mp4] [--out-dir DIR] [--apply] [--ffmpeg PATH] [--ffprobe PATH]');
    return null;
  }
  if (positionals.length !== 1) fail('Provide one transcript JSON path; use --help for usage.');
  if ((values.apply || values.output) && !values.video) fail('--apply and --output require --video.');
  const input = resolve(positionals[0]);
  const data = readJSON(input);
  if (!Array.isArray(data?.words)) fail('Transcript must contain a words array.');
  const words = [];
  for (const entry of data.words) {
    if (!entry || typeof entry !== 'object') fail('Invalid transcript entry.');
    if (entry.type && entry.type !== 'word') continue;
    if (typeof entry.text !== 'string' || !Number.isFinite(entry.start) ||
        !Number.isFinite(entry.end) || entry.start < 0 || entry.end <= entry.start ||
        (words.length && entry.start < words.at(-1).end)) {
      fail('Words need text and ordered, non-overlapping numeric start/end times.');
    }
    words.push(entry);
  }
  if (!words.length) fail('No timed spoken words found.');
  const video = values.video ? resolve(values.video) : null;
  if (video && !existsSync(video)) fail('Source video does not exist.');
  let duration = data.audio_duration_secs;
  if (duration !== undefined && (!Number.isFinite(duration) || duration <= 0)) fail('Invalid audio_duration_secs.');
  if (duration === undefined && video) {
    const probe = spawnSync(values.ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', video], { encoding: 'utf8', windowsHide: true });
    if (probe.error) throw probe.error;
    if (probe.status !== 0) fail('FFprobe failed: ' + probe.stderr.trim());
    duration = Number(JSON.parse(probe.stdout).format.duration);
  }
  if (duration === undefined) duration = words.at(-1).end + Number(values['tail-pad'] ?? 0.2);
  if (!Number.isFinite(duration) || duration <= 0 || words.at(-1).end > duration) fail('Words exceed source duration.');
  return { mode, values, input, video, words, duration, language: data.language_code };
}

// FFmpeg 7+ reads option values from files with `-/option`; -filter_complex_script is deprecated there.
function filterScriptArgs(ffmpeg, path) {
  const probe = spawnSync(ffmpeg, ['-hide_banner', '-version'], { encoding: 'utf8', windowsHide: true });
  if (probe.error) throw probe.error;
  const major = Number(/ffmpeg version n?(\d+)\./.exec(probe.stdout)?.[1]);
  return Number.isFinite(major) && major < 7 ? ['-filter_complex_script', path] : ['-/filter_complex', path];
}

export function saveEdit(job, requestedCuts) {
  const { mode, values, input, video, words, duration, language } = job;
  if (!Array.isArray(requestedCuts)) fail('Cuts must be an array.');
  const cuts = requestedCuts.map((cut) => {
    if (!cut || !Number.isFinite(cut.start) || !Number.isFinite(cut.end) ||
        cut.start < 0 || cut.end > duration || cut.start >= cut.end) fail('Invalid cut interval.');
    return { start: cut.start, end: cut.end, reasons: cut.reason ? [String(cut.reason)] : [] };
  }).sort((left, right) => left.start - right.start);
  const deleted = [];
  for (const cut of cuts) {
    const last = deleted.at(-1);
    if (last && cut.start <= last.end) {
      last.end = Math.max(last.end, cut.end);
      last.reasons.push(...cut.reasons);
    } else deleted.push(cut);
  }
  const kept = [];
  let boundary = 0;
  for (const cut of deleted) {
    if (boundary < cut.start) kept.push({ start: boundary, end: cut.start });
    boundary = cut.end;
  }
  if (boundary < duration) kept.push({ start: boundary, end: duration });
  if (!kept.length) fail('Cuts remove the entire source.');
  let editedDuration = 0;
  const timeline = kept.map((range) => {
    const segment = { ...range, offset: editedDuration - range.start };
    editedDuration += range.end - range.start;
    return segment;
  });
  const retimed = [];
  for (const word of words) {
    const segment = timeline.find((range) => word.start >= range.start && word.end <= range.end);
    if (segment) retimed.push({
      text: word.text, source_start: word.start, source_end: word.end,
      start: seconds(word.start + segment.offset), end: seconds(word.end + segment.offset),
    });
  }
  const stem = basename(input, extname(input)).replace(/(?:[.-](?:silence|mistakes))?-transcript$/, '');
  const directory = resolve(values['out-dir'] ?? dirname(input));
  const files = {
    edl: join(directory, stem + '.' + mode + '-edl.json'),
    transcript: join(directory, stem + '.' + mode + '-transcript.json'),
    decisions: join(directory, stem + '.' + mode + '-decisions.md'),
  };
  const output = video ? resolve(values.output ?? join(directory, basename(video, extname(video)) + (mode === 'silence' ? '.silenced.mp4' : '.mistakes-cut.mp4'))) : null;
  if (output && extname(output).toLowerCase() !== '.mp4') fail('Output must end in .mp4.');
  const filterPath = join(directory, stem + '.' + mode + '-filter.txt');
  const destinations = [...Object.values(files), ...(video ? [filterPath, output] : [])];
  const inputs = [input, video, values.cuts ? resolve(values.cuts) : null].filter(Boolean);
  for (const destination of destinations) {
    if (inputs.includes(destination) || existsSync(destination)) fail('Output already exists or is an input: ' + destination);
  }
  if (new Set(destinations).size !== destinations.length) fail('Output paths must be distinct.');
  const edl = {
    operation: mode, source_duration: duration, edited_duration: seconds(editedDuration),
    removed: seconds(duration - editedDuration), delete_ranges: deleted, keep_ranges: kept,
  };
  const transcript = {
    language_code: language, source_audio_duration_secs: duration,
    audio_duration_secs: edl.edited_duration, produced_by: 'chojema-visual', words: retimed,
  };
  const documents = [
    [files.edl, JSON.stringify(edl, null, 2)],
    [files.transcript, JSON.stringify(transcript, null, 2)],
    [files.decisions, ['# 편집 계획', '', ...deleted.map((cut) => '- ' + cut.start + '–' + cut.end + '초: ' + cut.reasons.join(', '))].join('\n')],
  ];
  let filter;
  if (video) {
    const chains = timeline.flatMap((range, i) => [
      '[0:v]trim=start=' + range.start + ':end=' + range.end + ',setpts=PTS-STARTPTS[v' + i + ']',
      '[0:a]atrim=start=' + range.start + ':end=' + range.end + ',asetpts=PTS-STARTPTS[a' + i + ']',
    ]);
    chains.push(timeline.map((_, i) => '[v' + i + '][a' + i + ']').join('') + 'concat=n=' + timeline.length + ':v=1:a=1[v][a]');
    filter = chains.join(';\n');
    documents.push([filterPath, filter]);
  }
  mkdirSync(directory, { recursive: true });
  for (const [path, content] of documents) writeFileSync(path, content, { flag: 'wx' });
  const summary = { editedDuration: edl.edited_duration, removed: edl.removed, outputs: files };
  if (video) {
    summary.video = { input: video, output, rendered: false };
    if (values.apply) {
      mkdirSync(dirname(output), { recursive: true });
      const result = spawnSync(values.ffmpeg, [
        '-nostdin', '-n', '-i', video, ...filterScriptArgs(values.ffmpeg, filterPath),
        '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '18',
        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', output,
      ], { stdio: ['ignore', 'ignore', 'inherit'], windowsHide: true });
      if (result.error) throw result.error;
      if (result.status !== 0) fail('FFmpeg failed; inspect the saved edit plan and use a new output path on retry.');
      summary.video.rendered = true;
    }
  }
  console.log(JSON.stringify(summary, null, 2));
}
