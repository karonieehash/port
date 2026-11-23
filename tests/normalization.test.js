import assert from 'node:assert/strict';
import { normalizePortfolio, defaultPortfolioData } from '../src/utils/normalize.js';

console.log('Testing Normalization & Schema Validation...');

// 1. Accepts valid default data
const normalizedDefault = normalizePortfolio(defaultPortfolioData);
assert.equal(normalizedDefault.schemaVersion, 1);
assert.equal(typeof normalizedDefault.readings, 'object');
assert.equal(typeof normalizedDefault.project, 'object');
assert.ok(Array.isArray(normalizedDefault.archive));
assert.equal(typeof normalizedDefault.process, 'object');

// 2. Rejects invalid or missing schemaVersion
assert.throws(() => {
  normalizePortfolio(null);
}, /compatible portfolio backup/);

assert.throws(() => {
  normalizePortfolio({ schemaVersion: 2 });
}, /compatible portfolio backup/);

assert.throws(() => {
  normalizePortfolio({ schemaVersion: '1' });
}, /compatible portfolio backup/);

// 3. Normalizes and trims readings
const sampleWithReadings = {
  schemaVersion: 1,
  updatedAt: 123456,
  readings: {
    kirschenbaum: {
      annotation: 'https://example.com/scan.pdf',
      analysis: 'Deep analysis of DH',
      notes: 'https://example.com/notes.pdf',
      summary: 'Kirschenbaum explains English department origins.'
    }
  },
  project: {
    title: 'Bengaluru Heritage',
    site: 'Malleswaram'
  },
  archive: [
    {
      id: 'rec-1',
      title: 'Old Temple',
      type: 'Photograph',
      location: 'Malleswaram',
      image: 'https://images.example.com/temple.jpg'
    }
  ],
  process: {
    log: 'Meeting on Nov 10',
    acknowledgements: 'Self'
  }
};

const normalized = normalizePortfolio(sampleWithReadings);
assert.equal(normalized.readings.kirschenbaum.analysis, 'Deep analysis of DH');
assert.equal(normalized.project.title, 'Bengaluru Heritage');
assert.equal(normalized.archive[0].title, 'Old Temple');
assert.equal(normalized.process.log, 'Meeting on Nov 10');

// 4. Clamps excessively large input
const hugeString = 'a'.repeat(200000);
const hugeData = {
  schemaVersion: 1,
  readings: { kirschenbaum: { analysis: hugeString } },
  project: { description: hugeString },
  archive: [],
  process: {}
};
const clamped = normalizePortfolio(hugeData);
assert.ok(clamped.readings.kirschenbaum.analysis.length <= 100000);
assert.ok(clamped.project.description.length <= 100000);

console.log('✓ Normalization & Schema Validation tests passed.');
