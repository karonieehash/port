/**
 * Repository Interface
 *
 * Defines the contract that every database provider must implement.
 * The application depends on this contract, not any specific database provider.
 */
export class RepositoryInterface {
  /**
   * Fetches the entire portfolio data.
   * @returns {Promise<object>} Normalized portfolio object
   */
  async getPortfolio() {
    throw new Error('getPortfolio() must be implemented.');
  }

  /**
   * Saves or updates the entire portfolio data.
   * @param {object} portfolioData
   * @returns {Promise<object>} Updated portfolio object
   */
  async updatePortfolio(portfolioData) {
    throw new Error('updatePortfolio() must be implemented.');
  }

  /**
   * Fetches an individual archive record by ID.
   * @param {string} recordId
   * @returns {Promise<object|null>}
   */
  async getRecord(recordId) {
    throw new Error('getRecord() must be implemented.');
  }

  /**
   * Creates a new archive record.
   * @param {object} recordData
   * @returns {Promise<object>}
   */
  async createRecord(recordData) {
    throw new Error('createRecord() must be implemented.');
  }

  /**
   * Updates an existing archive record.
   * @param {string} recordId
   * @param {object} recordData
   * @returns {Promise<object>}
   */
  async updateRecord(recordId, recordData) {
    throw new Error('updateRecord() must be implemented.');
  }

  /**
   * Deletes an archive record.
   * @param {string} recordId
   * @returns {Promise<boolean>}
   */
  async deleteRecord(recordId) {
    throw new Error('deleteRecord() must be implemented.');
  }
}
