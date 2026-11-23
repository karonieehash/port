import assert from 'node:assert/strict';
import { PortfolioApi } from '../src/api/portfolio-api.js';
import { LocalRepository } from '../src/backend/database/local/local-repository.js';
import { AppError, ErrorTypes } from '../src/services/error-service.js';

console.log('Testing PortfolioApi & Error Normalization (Phase 5)...');

const repo = new LocalRepository();
const api = new PortfolioApi(repo);

// 1. Get initial portfolio
const portfolio = await api.getPortfolio();
assert.equal(portfolio.schemaVersion, 1);

// 2. Reading operations
await api.updateReading('kirschenbaum', {
  annotation: 'https://example.com/scan.pdf',
  analysis: 'Close analysis of Kirschenbaum',
  notes: 'https://example.com/notes.pdf',
  summary: 'Summary text'
});
const readings = await api.getReadings();
assert.equal(readings.kirschenbaum.analysis, 'Close analysis of Kirschenbaum');
assert.equal(readings.kirschenbaum.annotation, 'https://example.com/scan.pdf');

// 3. Project operations
await api.updateProject({
  title: 'Living Archives of Malleswaram',
  site: 'Malleswaram, Bengaluru',
  question: 'How do heritage streetscapes transform in digital memory?'
});
const project = await api.getProject();
assert.equal(project.title, 'Living Archives of Malleswaram');
assert.equal(project.site, 'Malleswaram, Bengaluru');

// 4. Archive CRUD via API
const record = await api.createArchiveRecord({
  title: 'Conservancy Lane Photograph',
  type: 'Photograph',
  location: '8th Cross, Malleswaram',
  source: 'https://example.com/archive/photo1'
});
assert.ok(record.id);

const archiveList = await api.getArchive();
assert.equal(archiveList.length, 1);
assert.equal(archiveList[0].title, 'Conservancy Lane Photograph');

await api.updateArchiveRecord(record.id, {
  date: '2026-11-20'
});
const updatedArchive = await api.getArchive();
assert.equal(updatedArchive[0].date, '2026-11-20');

await api.deleteArchiveRecord(record.id);
const emptyArchive = await api.getArchive();
assert.equal(emptyArchive.length, 0);

// 5. Process operations
await api.updateProcess({
  log: 'Group discussed field protocol',
  reflection: 'Fieldwork connects theoretical DH with lived urban spaces.'
});
const processData = await api.getProcess();
assert.equal(processData.reflection, 'Fieldwork connects theoretical DH with lived urban spaces.');

console.log('✓ PortfolioApi tests passed.');
