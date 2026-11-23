import { RepositoryInterface } from '../repository-interface.js';
import { normalizePortfolio, defaultPortfolioData } from '../../../utils/normalize.js';
import { AppError, ErrorTypes } from '../../../services/error-service.js';

/**
 * Supabase Repository Implementation
 *
 * Interacts with PostgreSQL via the Supabase PostgREST API using standard fetch.
 * Does not require external SDK bundling, keeping the build lightweight and compatible.
 *
 * Schema:
 * Table `portfolio`:
 *   id TEXT PRIMARY KEY,
 *   schema_version INTEGER NOT NULL DEFAULT 1,
 *   updated_at BIGINT NOT NULL,
 *   data JSONB NOT NULL,
 *   owner_id UUID REFERENCES auth.users(id)
 */
export class SupabaseRepository extends RepositoryInterface {
  /**
   * @param {{ url: string, anonKey: string, getAuthToken?: () => string|null }} options
   */
  constructor({ url, anonKey, getAuthToken }) {
    super();
    this.url = (url || '').replace(/\/$/, '');
    this.anonKey = anonKey || '';
    this.getAuthToken = getAuthToken || (() => null);
    this.portfolioId = 'default';
  }

  /**
   * Helper to build standard Supabase request headers
   * @param {boolean} isWrite
   * @returns {Record<string, string>}
   */
  _getHeaders(isWrite = false) {
    const headers = {
      'apikey': this.anonKey,
      'Content-Type': 'application/json'
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Authorization'] = `Bearer ${this.anonKey}`;
    }
    if (isWrite) {
      headers['Prefer'] = 'return=representation,resolution=merge-duplicates';
    }
    return headers;
  }

  /**
   * Fetches the portfolio document from Supabase.
   * If table is empty, returns default normalized data.
   */
  async getPortfolio() {
    try {
      const endpoint = `${this.url}/rest/v1/portfolio?id=eq.${this.portfolioId}&select=*`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this._getHeaders(false)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(`Supabase error (${response.status}): ${errorText}`, ErrorTypes.DATABASE);
      }

      const rows = await response.json();
      if (!rows || rows.length === 0) {
        // No row in database yet; return default structure
        return normalizePortfolio(defaultPortfolioData);
      }

      const row = rows[0];
      const payload = row.data || defaultPortfolioData;
      return normalizePortfolio(payload);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Failed to fetch portfolio from Supabase: ${err.message}`, ErrorTypes.NETWORK, err);
    }
  }

  /**
   * Writes the updated portfolio to Supabase.
   * RLS ensures that only the authenticated owner can succeed.
   * @param {object} nextData
   */
  async updatePortfolio(nextData) {
    const normalized = normalizePortfolio(nextData);
    normalized.updatedAt = Date.now();

    try {
      const endpoint = `${this.url}/rest/v1/portfolio`;
      const body = {
        id: this.portfolioId,
        schema_version: normalized.schemaVersion,
        updated_at: normalized.updatedAt,
        data: normalized
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this._getHeaders(true),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401 || response.status === 403 || errorText.toLowerCase().includes('row-level security')) {
          throw new AppError('Permission denied: You must be signed in as the owner to save changes.', ErrorTypes.PERMISSION);
        }
        throw new AppError(`Supabase save failed (${response.status}): ${errorText}`, ErrorTypes.DATABASE);
      }

      return normalized;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Failed to save portfolio to Supabase: ${err.message}`, ErrorTypes.NETWORK, err);
    }
  }

  async getRecord(recordId) {
    const portfolio = await this.getPortfolio();
    return portfolio.archive.find(a => a.id === recordId) || null;
  }

  async createRecord(recordData) {
    const portfolio = await this.getPortfolio();
    const newRecord = {
      ...recordData,
      id: recordData.id || `record-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    };
    portfolio.archive.push(newRecord);
    await this.updatePortfolio(portfolio);
    return newRecord;
  }

  async updateRecord(recordId, recordData) {
    const portfolio = await this.getPortfolio();
    const index = portfolio.archive.findIndex(a => a.id === recordId);
    if (index === -1) {
      throw new AppError(`Record with id '${recordId}' not found.`, ErrorTypes.NOT_FOUND);
    }
    portfolio.archive[index] = { ...portfolio.archive[index], ...recordData, id: recordId };
    await this.updatePortfolio(portfolio);
    return portfolio.archive[index];
  }

  async deleteRecord(recordId) {
    const portfolio = await this.getPortfolio();
    const initialLen = portfolio.archive.length;
    portfolio.archive = portfolio.archive.filter(a => a.id !== recordId);
    if (portfolio.archive.length === initialLen) {
      throw new AppError(`Record with id '${recordId}' not found.`, ErrorTypes.NOT_FOUND);
    }
    await this.updatePortfolio(portfolio);
    return true;
  }
}
