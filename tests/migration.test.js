import assert from 'node:assert/strict';
import { normalizePortfolio, LEGACY_STORAGE_KEY } from '../src/utils/normalize.js';
import { MediaService } from '../src/services/media-service.js';

console.log('Testing Data Migration Logic (Phase 11)...');

// Sample legacy browser payload from localStorage key deepak-dh-2633115-v1
const legacyStorageJson = JSON.stringify({
  schemaVersion: 1,
  updatedAt: 1700000000000,
  readings: {
    kirschenbaum: {
      annotation: 'https://example.com/scan.pdf',
      analysis: 'Student analysis text',
      notes: '',
      summary: ''
    }
  },
  project: {
    title: 'Malleswaram Field Project',
    site: 'Malleswaram'
  },
  archive: [
    {
      id: 'rec-legacy-1',
      title: 'Old Street Sign',
      type: 'Photograph',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    },
    {
      id: 'rec-legacy-2',
      title: 'Field Notes',
      type: 'Field note',
      image: 'https://images.example.com/field-note.jpg'
    }
  ],
  process: {
    log: 'Meeting 1 log',
    acknowledgements: 'Course instructors'
  }
});

// 1. Validate reading from legacy key
const parsed = JSON.parse(legacyStorageJson);
const validated = normalizePortfolio(parsed);
assert.equal(validated.schemaVersion, 1);
assert.equal(validated.readings.kirschenbaum.analysis, 'Student analysis text');
assert.equal(validated.project.title, 'Malleswaram Field Project');

// 2. Identify base64 records for advisory report
const base64Records = validated.archive.filter(r => MediaService.isBase64(r.image));
assert.equal(base64Records.length, 1);
assert.equal(base64Records[0].title, 'Old Street Sign');

// 3. Ensure non-base64 records are recognized as external URLs
const webUrlRecords = validated.archive.filter(r => !MediaService.isBase64(r.image) && MediaService.validateImageUrl(r.image));
assert.equal(webUrlRecords.length, 1);
assert.equal(webUrlRecords[0].title, 'Field Notes');

console.log('✓ Data Migration Logic tests passed.');
