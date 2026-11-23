/**
 * Archive Service
 * Interacts with PortfolioApi for archive records
 */
export class ArchiveService {
  /**
   * @param {import('../../api/portfolio-api.js').PortfolioApi} api
   */
  constructor(api) {
    this.api = api;
  }

  async getArchive() {
    return await this.api.getArchive();
  }

  async createRecord(recordData) {
    return await this.api.createArchiveRecord(recordData);
  }

  async updateRecord(recordId, recordData) {
    return await this.api.updateArchiveRecord(recordId, recordData);
  }

  async deleteRecord(recordId) {
    return await this.api.deleteArchiveRecord(recordId);
  }
}
