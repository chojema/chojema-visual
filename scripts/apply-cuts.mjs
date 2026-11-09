import { execute, openEdit, readJSON, saveEdit } from './media-edit.mjs';

execute(() => {
  const job = openEdit('mistakes', { cuts: { type: 'string' } });
  if (!job) return;
  if (!job.values.cuts) throw new Error('Provide --cuts with a reviewed cut-list JSON path.');
  const document = readJSON(job.values.cuts);
  saveEdit(job, Array.isArray(document) ? document : document?.cuts);
});
