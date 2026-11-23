import { normalizeError, AppError } from '../services/error-service.js';

/**
 * Central Portfolio API
 *
 * Sits between the feature services and the database repository.
 * Guarantees standard operations, schema checks, and unified error handling.
 */
export class PortfolioApi {
  /**
   * @param {import('../backend/database/repository-interface.js').RepositoryInterface} repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  async getPortfolio() {
    try {
      return await this.repository.getPortfolio();
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async updatePortfolio(portfolioData) {
    try {
      return await this.repository.updatePortfolio(portfolioData);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async getReadings() {
    const portfolio = await this.getPortfolio();
    return portfolio.readings || {};
  }

  async updateReading(readingId, readingData) {
    try {
      const portfolio = await this.getPortfolio();
      portfolio.readings[readingId] = {
        annotation: String(readingData.annotation || '').trim(),
        analysis: String(readingData.analysis || '').trim(),
        notes: String(readingData.notes || '').trim(),
        summary: String(readingData.summary || '').trim()
      };
      await this.updatePortfolio(portfolio);
      return portfolio.readings[readingId];
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async getProject() {
    const portfolio = await this.getPortfolio();
    return portfolio.project || {};
  }

  async updateProject(projectData) {
    try {
      const portfolio = await this.getPortfolio();
      portfolio.project = {
        ...portfolio.project,
        ...projectData
      };
      await this.updatePortfolio(portfolio);
      return portfolio.project;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async getArchive() {
    const portfolio = await this.getPortfolio();
    return portfolio.archive || [];
  }

  async createArchiveRecord(recordData) {
    try {
      return await this.repository.createRecord(recordData);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async updateArchiveRecord(recordId, recordData) {
    try {
      return await this.repository.updateRecord(recordId, recordData);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async deleteArchiveRecord(recordId) {
    try {
      return await this.repository.deleteRecord(recordId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async getProcess() {
    const portfolio = await this.getPortfolio();
    return portfolio.process || {};
  }

  async updateProcess(processData) {
    try {
      const portfolio = await this.getPortfolio();
      portfolio.process = {
        ...portfolio.process,
        ...processData
      };
      await this.updatePortfolio(portfolio);
      return portfolio.process;
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
