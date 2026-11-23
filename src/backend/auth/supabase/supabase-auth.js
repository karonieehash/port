import { AuthInterface } from '../auth-interface.js';
import { AppError, ErrorTypes } from '../../../services/error-service.js';

const SESSION_STORAGE_KEY = 'deepak_portfolio_session';

/**
 * Supabase Authentication Adapter
 *
 * Implements the AuthInterface using Supabase GoTrue Auth REST endpoints.
 * Handles owner identification, session restoration, and token persistence safely.
 */
export class SupabaseAuth extends AuthInterface {
  /**
   * @param {{ url: string, anonKey: string, ownerEmail?: string }} options
   */
  constructor({ url, anonKey, ownerEmail }) {
    super();
    this.url = (url || '').replace(/\/$/, '');
    this.anonKey = anonKey || '';
    this.ownerEmail = (ownerEmail || '').trim().toLowerCase();
    this.session = null;
    this.listeners = new Set();

    this._restoreSession();
  }

  _restoreSession() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if token has expired
        if (parsed.expires_at && parsed.expires_at * 1000 > Date.now()) {
          this.session = parsed;
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {
      this.session = null;
    }
  }

  _saveSession(session) {
    this.session = session;
    if (session) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {}
    } else {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
    }
    this._notifyListeners();
  }

  _notifyListeners() {
    const state = {
      isAuthenticated: this.isAuthenticated(),
      isOwner: this.isOwner(),
      user: this.getCurrentUser()
    };
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('Auth listener error:', err);
      }
    }
  }

  getAccessToken() {
    return this.session?.access_token || null;
  }

  getCurrentUser() {
    return this.session?.user || null;
  }

  getSession() {
    return this.session;
  }

  isAuthenticated() {
    return Boolean(this.session?.access_token);
  }

  isOwner() {
    if (!this.isAuthenticated()) return false;
    const user = this.getCurrentUser();
    if (!user) return false;
    if (!this.ownerEmail) return true; // If no owner email configured, any authenticated user in this project is owner
    return (user.email || '').toLowerCase() === this.ownerEmail;
  }

  async signIn(email, password) {
    try {
      const endpoint = `${this.url}/auth/v1/token?grant_type=password`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new AppError(errJson.error_description || errJson.msg || 'Invalid email or password.', ErrorTypes.AUTH);
      }

      const sessionData = await response.json();
      this._saveSession(sessionData);

      if (!this.isOwner()) {
        await this.signOut();
        throw new AppError('Unauthorized: This account is not designated as the portfolio owner.', ErrorTypes.PERMISSION);
      }

      return { user: sessionData.user, token: sessionData.access_token };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Authentication failed: ${err.message}`, ErrorTypes.AUTH, err);
    }
  }

  async signOut() {
    const token = this.getAccessToken();
    if (token) {
      try {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': this.anonKey,
            'Authorization': `Bearer ${token}`
          }
        });
      } catch {}
    }
    this._saveSession(null);
  }

  onAuthStateChange(callback) {
    this.listeners.add(callback);
    // Fire immediately with initial state
    callback({
      isAuthenticated: this.isAuthenticated(),
      isOwner: this.isOwner(),
      user: this.getCurrentUser()
    });
    return () => this.listeners.delete(callback);
  }
}
