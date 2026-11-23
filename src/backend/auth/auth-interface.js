/**
 * Authentication Interface
 *
 * Defines the contract that every authentication provider must implement.
 */
export class AuthInterface {
  /**
   * Signs in a user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, token: string }>}
   */
  async signIn(email, password) {
    throw new Error('signIn() must be implemented.');
  }

  /**
   * Signs out the currently authenticated user.
   * @returns {Promise<void>}
   */
  async signOut() {
    throw new Error('signOut() must be implemented.');
  }

  /**
   * Gets the currently authenticated user or null.
   * @returns {object|null}
   */
  getCurrentUser() {
    throw new Error('getCurrentUser() must be implemented.');
  }

  /**
   * Gets the active session or null.
   * @returns {object|null}
   */
  getSession() {
    throw new Error('getSession() must be implemented.');
  }

  /**
   * Checks if any user is authenticated.
   * @returns {boolean}
   */
  isAuthenticated() {
    throw new Error('isAuthenticated() must be implemented.');
  }

  /**
   * Checks if the current user is the designated owner.
   * @returns {boolean}
   */
  isOwner() {
    throw new Error('isOwner() must be implemented.');
  }

  /**
   * Registers a callback for authentication state changes.
   * @param {(state: { isAuthenticated: boolean, isOwner: boolean, user: object|null }) => void} callback
   * @returns {() => void} Unsubscribe function
   */
  onAuthStateChange(callback) {
    throw new Error('onAuthStateChange() must be implemented.');
  }
}
