/**
 * Process Service
 * Interacts with PortfolioApi for process journal, sources, and acknowledgements
 */
export class ProcessService {
  /**
   * @param {import('../../api/portfolio-api.js').PortfolioApi} api
   */
  constructor(api) {
    this.api = api;
  }

  async getProcess() {
    return await this.api.getProcess();
  }

  async updateProcess(processData) {
    return await this.api.updateProcess(processData);
  }
}
