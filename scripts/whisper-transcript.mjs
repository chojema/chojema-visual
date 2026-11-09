import { parseArgs } from 'node:util';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { execute } from './media-edit.mjs';

const usage = 'Usage: node whisper-transcript.mjs WHISPER_OUTPUT --out TRANSCRIPT.json (--media SOURCE | --duration SECONDS) [--language CODE] [--ffprobe PATH]';

// Accepts FFmpeg whisper JSON lines (ms), whisper.cpp -oj (ms) and segments/words JSON in seconds.
function timedEntries(raw) {
  let data;
  try { data = JSON.parse(raw); } catch {
    return raw.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
      const item = JSON.parse(line);
      return { text: item.text, start: item.start / 1000, end: item.end / 1000 };
    });
  }
  if (Array.isArray(data?.transcription)) {
    return data.transcription.map((item) => ({ text: item.text, start: item.offsets.from / 1000, end: item.offsets.to / 1000 }));
  }
  if (Array.isArray(data?.words)) return data.words.map((w) => ({ text: w.text ?? w.word, start: w.start, end: w.end }));
  const segments = Array.isArray(data) ? data : data?.segments;
  if (!Array.isArray(segments)) throw new Error('Unrecognized whisper output.');
  return segments.flatMap((s) => Array.isArray(s.words) && s.words.length
    ? s.words.map((w) => ({ text: w.text ?? w.word, start: w.start, end: w.end }))
    : [{ text: s.text, start: s.start, end: s.end }]);
}

function normalize(entries, duration) {
  const words = [];
  for (const entry of entries) {
    const text = String(entry.text ?? '').trim();
    if (!text || !Number.isFinite(entry.start) || !Number.isFinite(entry.end)) continue;
    // Whisper segments can overlap slightly; clip to the previous end and the media length.
    const start = Math.max(entry.start, words.at(-1)?.end ?? 0);
    const end = Math.min(entry.end, duration);
    if (end > start) words.push({ text, start: Number(start.toFixed(3)), end: Number(end.toFixed(3)) });
  }
  if (!words.length) throw new Error('No timed text found in the whisper output.');
  return words;
}

execute(() => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean' }, out: { type: 'string' }, media: { type: 'string' },
      duration: { type: 'string' }, language: { type: 'string' },
      ffprobe: { type: 'string', default: 'ffprobe' },
    },
  });
  if (values.help) return console.log(usage);
  if (positionals.length !== 1 || !values.out || !(values.media || values.duration)) throw new Error(usage);
  let duration = Number(values.duration);
  if (values.media) {
    const media = resolve(values.media);
    if (!existsSync(media)) throw new Error('Media file does not exist.');
    const probe = spawnSync(values.ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', media], { encoding: 'utf8', windowsHide: true });
    if (probe.error) throw probe.error;
    if (probe.status !== 0) throw new Error('FFprobe failed: ' + probe.stderr.trim());
    duration = Number(JSON.parse(probe.stdout).format.duration);
  }
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Duration must be a positive number.');
  const words = normalize(timedEntries(readFileSync(resolve(positionals[0]), 'utf8')), duration);
  const transcript = { language_code: values.language, audio_duration_secs: duration, words };
  writeFileSync(resolve(values.out), JSON.stringify(transcript, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ output: resolve(values.out), entries: words.length, duration }));
});
