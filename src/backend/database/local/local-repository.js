import { RepositoryInterface } from '../repository-interface.js';
import { normalizePortfolio, defaultPortfolioData } from '../../../utils/normalize.js';
import { AppError, ErrorTypes } from '../../../services/error-service.js';

/**
 * Local / Offline Repository Implementation
 *
 * Used for local offline testing, development, or when backend credentials are not set.
 */
export class LocalRepository extends RepositoryInterface {
  constructor(initialData = null) {
    super();
    this.data = initialData ? normalizePortfolio(initialData) : normalizePortfolio(defaultPortfolioData);
  }

  async getPortfolio() {
    return structuredClone(this.data);
  }

  async updatePortfolio(portfolioData) {
    const normalized = normalizePortfolio(portfolioData);
    normalized.updatedAt = Date.now();
    this.data = structuredClone(normalized);
    return structuredClone(this.data);
  }

  async getRecord(recordId) {
    return this.data.archive.find(r => r.id === recordId) || null;
  }

  async createRecord(recordData) {
    const record = {
      ...recordData,
      id: recordData.id || `record-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    };
    this.data.archive.push(record);
    this.data.updatedAt = Date.now();
    return structuredClone(record);
  }

  async updateRecord(recordId, recordData) {
    const idx = this.data.archive.findIndex(r => r.id === recordId);
    if (idx === -1) {
      throw new AppError(`Record '${recordId}' not found.`, ErrorTypes.NOT_FOUND);
    }
    this.data.archive[idx] = { ...this.data.archive[idx], ...recordData, id: recordId };
    this.data.updatedAt = Date.now();
    return structuredClone(this.data.archive[idx]);
  }

  async deleteRecord(recordId) {
    const before = this.data.archive.length;
    this.data.archive = this.data.archive.filter(r => r.id !== recordId);
    if (this.data.archive.length === before) {
      throw new AppError(`Record '${recordId}' not found.`, ErrorTypes.NOT_FOUND);
    }
    this.data.updatedAt = Date.now();
    return true;
  }
}
