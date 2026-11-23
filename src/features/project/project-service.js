/**
 * Project Service
 * Interacts with PortfolioApi for field project proposal data
 */
export class ProjectService {
  /**
   * @param {import('../../api/portfolio-api.js').PortfolioApi} api
   */
  constructor(api) {
    this.api = api;
  }

  async getProject() {
    return await this.api.getProject();
  }

  async updateProject(projectData) {
    return await this.api.updateProject(projectData);
  }
}
