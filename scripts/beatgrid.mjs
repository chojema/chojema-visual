import { parseArgs } from 'node:util';

try {
  const { values } = parseArgs({ options: {
    bpm: { type: 'string' }, period: { type: 'string' },
    fps: { type: 'string', default: '60' },
    length: { type: 'string', default: '15' },
    chapters: { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('Usage: node beatgrid.mjs (--bpm BPM | --period SECONDS) --chapters "Name:beats,Name:rest" [--fps 60] [--length 15]');
  } else {
    const positive = (value, label) => {
      const number = Number(value);
      if (!Number.isFinite(number) || number <= 0) throw new Error(label + ' must be positive and finite.');
      return number;
    };
    const fps = positive(values.fps, 'fps');
    const length = positive(values.length, 'length');
    if (values.bpm !== undefined) positive(values.bpm, 'bpm');
    const period = values.period === undefined ? 60 / positive(values.bpm, 'bpm') : positive(values.period, 'period');
    if (!values.chapters) throw new Error('Provide --chapters.');
    const chapters = values.chapters.split(',');
    const rows = [];
    let time = 0;
    for (const [i, chapter] of chapters.entries()) {
      const colon = chapter.lastIndexOf(':');
      const name = chapter.slice(0, colon).trim();
      const count = chapter.slice(colon + 1).trim();
      if (colon < 1 || !name || (count === 'rest' && i !== chapters.length - 1)) throw new Error('Invalid chapter or nonfinal rest.');
      const end = count === 'rest' ? length : time + positive(count, 'beats') * period;
      const firstFrame = Math.round(time * fps);
      const lastFrame = Math.round(end * fps);
      if (end > length + 1e-8 || end <= time || lastFrame <= firstFrame) throw new Error('Chapter exceeds length or has no frames.');
      rows.push(name + '\t' + time.toFixed(3) + '–' + end.toFixed(3) + ' s\t' + firstFrame + '-' + lastFrame);
      if (name.toLowerCase().startsWith('flurry')) {
        const beatCount = (end - time) / period;
        for (let beat = 0; beat < beatCount - 1e-8; beat += beat < beatCount / 2 ? 1 : 0.5) {
          const cutTime = time + beat * period;
          rows.push('  cut\t' + cutTime.toFixed(3) + ' s\t' + Math.round(cutTime * fps));
        }
      }
      time = end;
    }
    if (Math.abs(time - length) > 1e-8) throw new Error('Chapters must fill the length; use a final Name:rest.');
    console.log('chapter\tseconds\tframes [start,end)');
    console.log(rows.join('\n'));
    console.log('total ' + length.toFixed(2) + 's = ' + Math.round(length * fps) + ' frames');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
