import assert from 'node:assert/strict';
import { LocalRepository } from '../src/backend/database/local/local-repository.js';
import { RepositoryInterface } from '../src/backend/database/repository-interface.js';
import { defaultPortfolioData } from '../src/utils/normalize.js';

console.log('Testing Repository Interface & Local Adapter...');

const repo = new LocalRepository(defaultPortfolioData);
assert.ok(repo instanceof RepositoryInterface);

// 1. Get initial portfolio
const initial = await repo.getPortfolio();
assert.equal(initial.schemaVersion, 1);
assert.deepEqual(initial.archive, []);

// 2. Create archive record
const created = await repo.createRecord({
  title: 'Test Artifact',
  type: 'Photograph',
  location: 'Bengaluru',
  source: 'https://example.com'
});
assert.ok(created.id);
assert.equal(created.title, 'Test Artifact');

// 3. Get individual record
const fetched = await repo.getRecord(created.id);
assert.equal(fetched.title, 'Test Artifact');

// 4. Update individual record
const updated = await repo.updateRecord(created.id, {
  location: 'Cubbon Park'
});
assert.equal(updated.location, 'Cubbon Park');
assert.equal(updated.title, 'Test Artifact');

// 5. Delete individual record
const deleted = await repo.deleteRecord(created.id);
assert.equal(deleted, true);
const afterDelete = await repo.getRecord(created.id);
assert.equal(afterDelete, null);

// 6. Update portfolio atomically
const updatedPort = await repo.updatePortfolio({
  schemaVersion: 1,
  readings: {
    kirschenbaum: { annotation: 'https://example.com', analysis: 'Read', notes: '', summary: '' }
  },
  project: { title: 'New Project' },
  archive: [],
  process: {}
});
assert.equal(updatedPort.project.title, 'New Project');
assert.ok(updatedPort.updatedAt > 0);

console.log('✓ Repository Interface & Local Adapter tests passed.');
