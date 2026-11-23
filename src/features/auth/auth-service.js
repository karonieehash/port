/**
 * Authentication Service
 * Delegates to the configured AuthAdapter
 */
export class AuthService {
  /**
   * @param {import('../../backend/auth/auth-interface.js').AuthInterface} authAdapter
   */
  constructor(authAdapter) {
    this.adapter = authAdapter;
  }

  async signIn(email, password) {
    return await this.adapter.signIn(email, password);
  }

  async signOut() {
    return await this.adapter.signOut();
  }

  getCurrentUser() {
    return this.adapter.getCurrentUser();
  }

  getSession() {
    return this.adapter.getSession();
  }

  isAuthenticated() {
    return this.adapter.isAuthenticated();
  }

  isOwner() {
    return this.adapter.isOwner();
  }

  onAuthStateChange(callback) {
    return this.adapter.onAuthStateChange(callback);
  }
}
