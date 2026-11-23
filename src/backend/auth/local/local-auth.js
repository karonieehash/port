import { AuthInterface } from '../auth-interface.js';

/**
 * Local / Mock Authentication Adapter
 *
 * Used for local offline development or mock testing.
 */
export class LocalAuth extends AuthInterface {
  constructor(ownerEmail = 'owner@example.com') {
    super();
    this.ownerEmail = ownerEmail.toLowerCase();
    this.currentUser = null;
    this.listeners = new Set();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getSession() {
    return this.currentUser ? { user: this.currentUser, access_token: 'local-mock-token' } : null;
  }

  isAuthenticated() {
    return Boolean(this.currentUser);
  }

  isOwner() {
    return Boolean(this.currentUser && this.currentUser.email.toLowerCase() === this.ownerEmail);
  }

  async signIn(email, password) {
    if (email.trim().toLowerCase() !== this.ownerEmail) {
      throw new Error('Invalid email or password.');
    }
    this.currentUser = { id: 'local-owner-uuid', email: email.trim().toLowerCase(), role: 'owner' };
    this._notifyListeners();
    return { user: this.currentUser, token: 'local-mock-token' };
  }

  async signOut() {
    this.currentUser = null;
    this._notifyListeners();
  }

  _notifyListeners() {
    const state = {
      isAuthenticated: this.isAuthenticated(),
      isOwner: this.isOwner(),
      user: this.getCurrentUser()
    };
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  onAuthStateChange(callback) {
    this.listeners.add(callback);
    callback({
      isAuthenticated: this.isAuthenticated(),
      isOwner: this.isOwner(),
      user: this.getCurrentUser()
    });
    return () => this.listeners.delete(callback);
  }
}
