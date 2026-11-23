import { readings } from '../constants/readings-data.js';

export const CURRENT_SCHEMA_VERSION = 1;
export const LEGACY_STORAGE_KEY = 'deepak-dh-2633115-v1';

export const projectFields = [
  ['question', 'Research question'],
  ['description', 'Project description'],
  ['rationale', 'Rationale and research value'],
  ['concepts', 'DH concepts and theoretical foundation'],
  ['variables', 'Materials, variables, and sources'],
  ['method', 'Data collection method'],
  ['ethics', 'Consent, permissions, and ethical / IRB requirements'],
  ['objectives', 'Objectives'],
  ['outcomes', 'Intended outcomes and social impact'],
  ['team', 'Group members and responsibilities']
];

export const defaultPortfolioData = {
  schemaVersion: 1,
  updatedAt: 0,
  readings: {},
  project: {},
  archive: [],
  process: {
    log: '',
    contribution: '',
    reflection: '',
    sources: '',
    acknowledgements: 'Website design and interface were created with assistance from ChatGPT. Reading analyses, learning summaries, project findings, and personal reflections must be added by Deepak. This declaration should be reviewed before academic submission.'
  }
};

/**
 * Validates and normalizes raw portfolio data according to Schema Version 1.
 * Throws an Error if data is invalid or incompatible.
 * @param {object} raw
 * @returns {object} Normalized portfolio data
 */
export function normalizePortfolio(raw) {
  if (!raw || raw.schemaVersion !== 1 || typeof raw !== 'object') {
    throw new Error('This is not a compatible portfolio backup (requires schemaVersion 1).');
  }

  const textKeys = ['annotation', 'notes', 'analysis', 'summary'];
  const rr = {};
  for (const r of readings) {
    const source = raw.readings?.[r.id];
    if (source && typeof source === 'object') {
      rr[r.id] = {};
      for (const k of textKeys) {
        rr[r.id][k] = typeof source[k] === 'string' ? source[k].slice(0, 100000) : '';
      }
    }
  }

  const pp = {};
  const projectKeys = ['title', 'site', 'question', 'description', 'rationale', 'concepts', 'method', 'variables', 'ethics', 'objectives', 'outcomes', 'team', 'status'];
  for (const k of projectKeys) {
    pp[k] = typeof raw.project?.[k] === 'string' ? raw.project[k].slice(0, 100000) : '';
  }

  const pr = {};
  const processKeys = ['log', 'contribution', 'reflection', 'sources', 'acknowledgements'];
  for (const k of processKeys) {
    pr[k] = typeof raw.process?.[k] === 'string' ? raw.process[k].slice(0, 150000) : '';
  }

  const aa = Array.isArray(raw.archive)
    ? raw.archive.slice(0, 100).filter(x => x && typeof x === 'object').map((x, i) => {
        const a = {};
        for (const k of ['id', 'title', 'type', 'date', 'location', 'creator', 'source', 'permission', 'description', 'interpretation', 'image']) {
          a[k] = typeof x[k] === 'string' ? x[k].slice(0, k === 'image' ? 2200000 : 100000) : '';
        }
        if (!a.id) a.id = 'record-' + i;
        return a;
      })
    : [];

  return {
    schemaVersion: 1,
    updatedAt: Number(raw.updatedAt) || 0,
    readings: rr,
    project: pp,
    archive: aa,
    process: pr
  };
}
