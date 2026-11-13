import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (script, args) => spawnSync(process.execPath, [join(root, 'scripts', script), ...args], { encoding: 'utf8', windowsHide: true });
function workspace(t) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'chojema-visual-test-')));
  t.after(() => {
    assert.ok(dir.startsWith(realpathSync(tmpdir()) + sep));
    rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}
const json = (path, data) => writeFileSync(path, JSON.stringify(data));
const readJSON = (path) => JSON.parse(readFileSync(path, 'utf8'));
const transcript = { audio_duration_secs: 8, words: [
  { text: '안녕하세요.', start: 1, end: 2 },
  { text: '시작합니다.', start: 4, end: 5 },
] };
function fixture(t) {
  const dir = workspace(t);
  const input = join(dir, 'source.json');
  const cuts = join(dir, 'cuts.json');
  json(input, transcript);
  json(cuts, { cuts: [{ start: 2, end: 3 }, { start: 2.5, end: 4 }] });
  return { dir, input, cuts };
}

test('beat grid covers the full requested frame range', () => {
  const result = run('beatgrid.mjs', ['--bpm', '120', '--fps', '30', '--length', '8', '--chapters', '도입:4,변형:8,마무리:rest']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /180-240/);
  assert.match(result.stdout, /total 8\.00s = 240 frames/);
});

test('beat grid rejects infinite, negative, incomplete and nonfinal rest ranges', () => {
  for (const args of [
    ['--bpm', 'Infinity', '--chapters', 'A:rest'],
    ['--bpm', '-120', '--chapters', 'A:rest'],
    ['--bpm', '120', '--length', '2', '--chapters', 'A:8'],
    ['--bpm', '120', '--length', '2', '--chapters', 'A:1'],
    ['--bpm', '120', '--length', '2', '--chapters', 'A:rest,B:1'],
    ['--bpm', '120', '--length', '2', '--chapters', 'A:0,B:rest'],
  ]) assert.notEqual(run('beatgrid.mjs', args).status, 0, args.join(' '));
});

test('overlapping cuts merge once and the surviving words are retimed', (t) => {
  const { dir, input, cuts } = fixture(t);
  const result = run('apply-cuts.mjs', [input, '--cuts', cuts, '--out-dir', join(dir, 'edit')]);
  assert.equal(result.status, 0, result.stderr);
  const edl = readJSON(join(dir, 'edit/source.mistakes-edl.json'));
  const output = readJSON(join(dir, 'edit/source.mistakes-transcript.json'));
  assert.equal(edl.removed, 2);
  assert.equal(edl.edited_duration, 6);
  assert.equal(edl.delete_ranges.length, 1);
  assert.deepEqual(output.words.map(w => [w.text, w.start, w.end]), [
    ['안녕하세요.', 1, 2], ['시작합니다.', 2, 3],
  ]);
  assert.deepEqual(readJSON(input), transcript);
});

test('empty cuts preserve the timeline', (t) => {
  const { dir, input, cuts } = fixture(t);
  json(cuts, { cuts: [] });
  const result = run('apply-cuts.mjs', [input, '--cuts', cuts, '--out-dir', join(dir, 'edit')]);
  assert.equal(result.status, 0, result.stderr);
  const output = readJSON(join(dir, 'edit/source.mistakes-transcript.json'));
  assert.equal(output.audio_duration_secs, 8);
  assert.deepEqual(output.words.map(w => [w.start, w.end]), [[1, 2], [4, 5]]);
});

test('silence trimming preserves all spoken words and shortens only the gaps', (t) => {
  const { dir, input } = fixture(t);
  const result = run('cut-silences.mjs', [input, '--out-dir', join(dir, 'edit')]);
  assert.equal(result.status, 0, result.stderr);
  const output = readJSON(join(dir, 'edit/source.silence-transcript.json'));
  assert.equal(output.audio_duration_secs, 2.76);
  assert.deepEqual(output.words.map(w => [w.text, w.start, w.end]), [
    ['안녕하세요.', 0.22, 1.22], ['시작합니다.', 1.42, 2.42],
  ]);
  assert.deepEqual(readJSON(input), transcript);
});

test('invalid transcript times and padding fail before writing outputs', (t) => {
  const { dir, input, cuts } = fixture(t);
  for (const script of ['cut-silences.mjs', 'apply-cuts.mjs']) {
    for (const words of [
      [{ text: 'bad', start: -1, end: 2 }],
      [{ text: 'bad', start: 2, end: 1 }],
      [{ text: 'bad', start: '1', end: 2 }],
      [{ text: 'bad', start: 1, end: 9 }],
      [{ text: 'a', start: 1, end: 3 }, { text: 'b', start: 2, end: 4 }],
    ]) {
      json(input, { audio_duration_secs: 8, words });
      const outDir = join(dir, 'invalid');
      const args = [input, '--out-dir', outDir, ...(script === 'apply-cuts.mjs' ? ['--cuts', cuts] : [])];
      assert.notEqual(run(script, args).status, 0);
      assert.equal(existsSync(outDir), false);
    }
  }
  json(input, transcript);
  assert.notEqual(run('cut-silences.mjs', [input, '--head-pad', '-1']).status, 0);
  assert.notEqual(run('cut-silences.mjs', [input, '--tail-pad', 'NaN']).status, 0);
});

test('a silence edit feeds the next cut without changing its time basis', (t) => {
  const { dir, input, cuts } = fixture(t);
  const silenceDirectory = join(dir, 'silence');
  assert.equal(run('cut-silences.mjs', [input, '--out-dir', silenceDirectory]).status, 0);
  const current = join(silenceDirectory, 'source.silence-transcript.json');
  json(cuts, [{ start: 1.22, end: 1.42 }]);
  const result = run('apply-cuts.mjs', [current, '--cuts', cuts, '--out-dir', join(dir, 'final')]);
  assert.equal(result.status, 0, result.stderr);
  const output = readJSON(join(dir, 'final/source.mistakes-transcript.json'));
  assert.equal(output.audio_duration_secs, 2.56);
  assert.deepEqual(output.words.map(word => [word.start, word.end]), [[0.22, 1.22], [1.22, 2.22]]);
});

test('missing CLI values and apply without a video do not create files', (t) => {
  const { dir, input, cuts } = fixture(t);
  for (const script of ['cut-silences.mjs', 'apply-cuts.mjs']) {
    const extras = script === 'apply-cuts.mjs' ? ['--cuts', cuts] : [];
    const destination = join(dir, 'invalid');
    assert.notEqual(run(script, [input, ...extras, '--out-dir', destination, '--video']).status, 0);
    assert.notEqual(run(script, [input, ...extras, '--out-dir', destination, '--apply']).status, 0);
    assert.equal(existsSync(destination), false);
  }
});

test('invalid, out-of-bounds and total-deletion cuts fail before output', (t) => {
  const { dir, input, cuts } = fixture(t);
  for (const range of [{ start: -1, end: 1 }, { start: 3, end: 2 }, { start: 0, end: 9 }, { start: 0, end: 8 }]) {
    json(cuts, { cuts: [range] });
    const outDir = join(dir, 'invalid');
    assert.notEqual(run('apply-cuts.mjs', [input, '--cuts', cuts, '--out-dir', outDir]).status, 0);
    assert.equal(existsSync(outDir), false);
  }
});

test('existing video and metadata are protected in both editors', (t) => {
  const { dir, input, cuts } = fixture(t);
  const video = join(dir, 'source.mp4');
  writeFileSync(video, 'source sentinel');
  for (const script of ['cut-silences.mjs', 'apply-cuts.mjs']) {
    const extras = script === 'apply-cuts.mjs' ? ['--cuts', cuts] : [];
    const outDir = join(dir, script);
    assert.notEqual(run(script, [input, ...extras, '--video', video, '--output', video, '--out-dir', outDir]).status, 0);
    assert.equal(readFileSync(video, 'utf8'), 'source sentinel');
    assert.equal(existsSync(outDir), false);
    assert.equal(run(script, [input, ...extras, '--out-dir', outDir]).status, 0);
    const output = join(outDir, script === 'cut-silences.mjs' ? 'source.silence-transcript.json' : 'source.mistakes-transcript.json');
    const before = readFileSync(output);
    assert.notEqual(run(script, [input, ...extras, '--out-dir', outDir]).status, 0);
    assert.deepEqual(readFileSync(output), before);
  }
});

test('both editors render synthetic audio/video cuts when FFmpeg is installed', (t) => {
  if (spawnSync('ffmpeg', ['-version'], { windowsHide: true }).status !== 0) return t.skip('FFmpeg unavailable');
  const { dir, input, cuts } = fixture(t);
  const video = join(dir, 'source.mp4');
  const generated = spawnSync('ffmpeg', ['-v', 'error', '-nostdin', '-n', '-f', 'lavfi', '-i', 'color=c=blue:s=160x90:r=30:d=8', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=8', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', video], { encoding: 'utf8', windowsHide: true });
  assert.equal(generated.status, 0, generated.stderr);
  for (const [script, duration] of [['cut-silences.mjs', 2.76], ['apply-cuts.mjs', 6]]) {
    const output = join(dir, `${script}.mp4`);
    const result = run(script, [input, ...(script === 'apply-cuts.mjs' ? ['--cuts', cuts] : []), '--video', video, '--output', output, '--out-dir', join(dir, script), '--apply']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).video.rendered, true);
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', output], { encoding: 'utf8', windowsHide: true });
    assert.equal(probe.status, 0, probe.stderr);
    const info = JSON.parse(probe.stdout);
    assert.ok(Math.abs(Number(info.format.duration) - duration) <= 0.1);
    assert.deepEqual(info.streams.map(stream => stream.codec_type).sort(), ['audio', 'video']);
  }
});

test('whisper outputs from FFmpeg, whisper.cpp and segment JSON become a valid transcript', (t) => {
  const dir = workspace(t);
  const sources = {
    'ffmpeg.jsonl': '{"start":0,"end":1560,"text":" Hello."}\n{"start":2971,"end":5951,"text":"Next part"}\n{"start":5943,"end":9000,"text":"ends"}\n',
    'cpp.json': JSON.stringify({ transcription: [{ offsets: { from: 0, to: 1560 }, text: ' Hello.' }, { offsets: { from: 2971, to: 5951 }, text: 'Next part' }] }),
    'segments.json': JSON.stringify({ segments: [{ start: 0, end: 2, text: 'Hi there', words: [{ word: ' Hi', start: 0, end: 0.5 }, { word: ' there', start: 0.6, end: 1 }] }, { start: 3, end: 4, text: 'later' }] }),
  };
  for (const [name, content] of Object.entries(sources)) {
    writeFileSync(join(dir, name), content);
    const out = join(dir, name + '.transcript.json');
    const result = run('whisper-transcript.mjs', [join(dir, name), '--duration', '8', '--out', out]);
    assert.equal(result.status, 0, result.stderr);
    const { words, audio_duration_secs } = readJSON(out);
    assert.equal(audio_duration_secs, 8);
    assert.equal(words[0].text, words[0].text.trim());
    for (let i = 0; i < words.length; i++) {
      assert.ok(words[i].start < words[i].end && words[i].end <= 8);
      if (i) assert.ok(words[i].start >= words[i - 1].end, 'entries must not overlap');
    }
    assert.equal(run('cut-silences.mjs', [out, '--out-dir', join(dir, name + '-plan')]).status, 0);
  }
  assert.equal(readJSON(join(dir, 'segments.json.transcript.json')).words.length, 3, 'word timings are preferred over segments');
  assert.notEqual(run('whisper-transcript.mjs', [join(dir, 'cpp.json'), '--duration', '8', '--out', join(dir, 'cpp.json.transcript.json')]).status, 0, 'existing output is protected');
  assert.notEqual(run('whisper-transcript.mjs', [join(dir, 'cpp.json'), '--out', join(dir, 'x.json')]).status, 0, 'duration is required');
});

test('HTML renderer rejects bad arguments before creating output', (t) => {
  const dir = workspace(t);
  const out = join(dir, 'out.mp4');
  for (const args of [
    [join(root, 'assets/demo.html'), out],
    [join(root, 'assets/demo.html'), out, '--width', '481', '--height', '270', '--fps', '30', '--frames', '1'],
    [join(root, 'assets/demo.html'), join(dir, 'out.mov'), '--width', '480', '--height', '270', '--fps', '30', '--frames', '1'],
  ]) assert.notEqual(run('render-html.mjs', args).status, 0, args.join(' '));
  assert.equal(existsSync(out), false);
});

test('HTML renderer outputs the requested frames when CHOJEMA_PLAYWRIGHT is set', (t) => {
  if (!process.env.CHOJEMA_PLAYWRIGHT) return t.skip('Set CHOJEMA_PLAYWRIGHT (and optionally CHOJEMA_BROWSER) to run');
  const dir = workspace(t);
  const out = join(dir, 'demo.mp4');
  const browser = process.env.CHOJEMA_BROWSER ? ['--browser', process.env.CHOJEMA_BROWSER] : [];
  const result = run('render-html.mjs', [join(root, 'assets/demo.html'), out, '--playwright', process.env.CHOJEMA_PLAYWRIGHT, ...browser, '--width', '320', '--height', '180', '--fps', '30', '--frames', '6']);
  assert.equal(result.status, 0, result.stderr);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames,color_space,color_transfer,color_primaries', '-of', 'json', out], { encoding: 'utf8' });
  const stream = JSON.parse(probe.stdout).streams[0];
  assert.equal(stream.nb_read_frames, '6');
  assert.deepEqual([stream.color_space, stream.color_transfer, stream.color_primaries], ['bt709', 'bt709', 'bt709']);
});

test('HTML renderer draws WebGL from a local ES module on the first frame when CHOJEMA_PLAYWRIGHT is set', (t) => {
  if (!process.env.CHOJEMA_PLAYWRIGHT) return t.skip('Set CHOJEMA_PLAYWRIGHT (and optionally CHOJEMA_BROWSER) to run');
  const dir = workspace(t);
  writeFileSync(join(dir, 'color.mjs'), 'export const red = [1, 0, 0, 1];');
  writeFileSync(join(dir, 'gl.html'), `<!doctype html><style>html,body{margin:0;overflow:hidden;background:#000}canvas{display:block;width:100vw;height:100vh}</style>
<canvas></canvas><script type="module">
import { red } from './color.mjs';
const gl = document.querySelector('canvas').getContext('webgl2', { preserveDrawingBuffer: true });
window.renderFrame = () => { gl.clearColor(...red); gl.clear(gl.COLOR_BUFFER_BIT); };
</script>`);
  const out = join(dir, 'gl.mp4');
  const browser = process.env.CHOJEMA_BROWSER ? ['--browser', process.env.CHOJEMA_BROWSER] : [];
  const result = run('render-html.mjs', [join(dir, 'gl.html'), out, '--playwright', process.env.CHOJEMA_PLAYWRIGHT, ...browser, '--width', '64', '--height', '36', '--fps', '30', '--frames', '2']);
  assert.equal(result.status, 0, result.stderr);
  const pixel = spawnSync('ffmpeg', ['-v', 'error', '-i', out, '-frames:v', '1', '-vf', 'scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:']).stdout;
  assert.ok(pixel[0] > 200 && pixel[1] < 50, `frame 0 must show the WebGL canvas, got rgb(${[...pixel]})`);
});

test('Blender sample scene builds and renders when CHOJEMA_BLENDER is set', (t) => {
  if (!process.env.CHOJEMA_BLENDER) return t.skip('Set CHOJEMA_BLENDER to blender.exe (not blender-launcher.exe) to run');
  const dir = workspace(t);
  const blend = join(dir, 'scene.blend');
  const blender = (args) => spawnSync(process.env.CHOJEMA_BLENDER, args, { encoding: 'utf8', windowsHide: true });
  const built = blender(['-b', '--factory-startup', '--disable-autoexec', '--python-exit-code', '1', '--python', join(root, 'assets/build-scene.py'), '--', blend]);
  assert.equal(built.status, 0, built.stderr);
  assert.doesNotMatch(built.stdout + built.stderr, /DeprecationWarning/);
  const rendered = blender(['-b', '--disable-autoexec', blend, '-o', join(dir, 'frame_####'), '-F', 'PNG', '-x', '1', '-f', '1']);
  assert.equal(rendered.status, 0, rendered.stderr);
  assert.ok(existsSync(join(dir, 'frame_0001.png')));
  const again = blender(['-b', '--factory-startup', '--disable-autoexec', '--python-exit-code', '1', '--python', join(root, 'assets/build-scene.py'), '--', blend]);
  assert.notEqual(again.status, 0, 'an existing .blend must not be overwritten');
});

test('editors use the FFmpeg and FFprobe paths given on the command line', (t) => {
  const { dir } = fixture(t);
  writeFileSync(join(dir, 'source.mp4'), '');
  const missing = join(dir, 'no-such-ffmpeg.exe');
  const probe = run('cut-silences.mjs', [join(dir, 'source.json'), '--video', join(dir, 'source.mp4'), '--out-dir', join(dir, 'a'), '--apply', '--ffmpeg', missing]);
  assert.notEqual(probe.status, 0, 'a missing --ffmpeg must fail');
  assert.equal(existsSync(join(dir, 'a/source.silenced.mp4')), false);
  const noDuration = join(dir, 'nodur.json');
  json(noDuration, { words: transcript.words });
  assert.notEqual(run('cut-silences.mjs', [noDuration, '--video', join(dir, 'source.mp4'), '--out-dir', join(dir, 'b'), '--ffprobe', missing]).status, 0, 'a missing --ffprobe must fail');
});

test('every bundled font ships with its OFL notice', () => {
  const fonts = join(root, 'assets/fonts');
  const files = readdirSync(fonts);
  const families = new Set(files.filter((f) => f.endsWith('.woff2')).map((f) => f.replace(/(-(Regular|Bold))?\.woff2$|Variable\.woff2$/, '')));
  assert.ok(families.size >= 3);
  for (const family of families) {
    const notice = join(fonts, family + '-OFL.txt');
    assert.ok(existsSync(notice), 'missing ' + notice);
    assert.match(readFileSync(notice, 'utf8'), /SIL OPEN FONT LICENSE Version 1\.1/);
  }
});
