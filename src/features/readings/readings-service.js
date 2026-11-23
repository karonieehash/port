/**
 * Readings Service
 * Interacts with PortfolioApi for reading journals
 */
export class ReadingsService {
  /**
   * @param {import('../../api/portfolio-api.js').PortfolioApi} api
   */
  constructor(api) {
    this.api = api;
  }

  async getReadings() {
    return await this.api.getReadings();
  }

  async updateReading(readingId, readingData) {
    return await this.api.updateReading(readingId, readingData);
  }
}
