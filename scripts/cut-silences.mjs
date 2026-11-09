import { execute, openEdit, saveEdit } from './media-edit.mjs';

execute(() => {
  const job = openEdit('silence', {
    gap: { type: 'string', default: '0.55' },
    'head-pad': { type: 'string', default: '0.22' },
    'tail-pad': { type: 'string', default: '0.34' },
  });
  if (!job) return;
  const gap = Number(job.values.gap);
  const head = Number(job.values['head-pad']);
  const tail = Number(job.values['tail-pad']);
  if (!Number.isFinite(gap) || gap <= 0 || ![head, tail].every((n) => Number.isFinite(n) && n >= 0)) {
    throw new Error('Gap must be positive; padding must be finite and non-negative.');
  }
  const intervals = [];
  const add = (start, end, reason) => { if (end > start) intervals.push({ start, end, reason }); };
  add(0, job.words[0].start - head, '발화 전 대기');
  for (let i = 1; i < job.words.length; i++) {
    const before = job.words[i - 1].end;
    const after = job.words[i].start;
    if (after - before >= gap) {
      const margin = Math.min(gap, 0.2) / 2;
      add(before + margin, after - margin, '긴 발화 간격');
    }
  }
  add(job.words.at(-1).end + tail, job.duration, '발화 후 대기');
  saveEdit(job, intervals);
});
