import { esc } from '../../utils/escape-html.js';
import { icon } from '../../ui/icons.js';
import { dialog } from '../../ui/dialog.js';
import { showToast } from '../../ui/toast.js';

/**
 * Authentication Modal UI
 * Manages Owner Sign-In, Session Status, and Sign-Out dialogs.
 */
export class AuthModal {
  /**
   * @param {import('./auth-service.js').AuthService} authService
   * @param {() => void} onAuthChange
   * @param {() => void} onOpenMigration
   */
  constructor(authService, onAuthChange, onOpenMigration) {
    this.auth = authService;
    this.onAuthChange = onAuthChange;
    this.onOpenMigration = onOpenMigration;
  }

  init() {
    this._bindEvents();
    this.updateNavButton();
    this.auth.onAuthStateChange(() => {
      this.updateNavButton();
      this.onAuthChange?.();
    });
  }

  updateNavButton() {
    const editBtn = document.querySelector('.nav-edit');
    if (!editBtn) return;
    const isOwner = this.auth.isOwner();
    const label = editBtn.querySelector('.edit-label');
    if (label) {
      label.textContent = isOwner ? 'Owner workspace' : 'Edit portfolio';
    }
    editBtn.title = isOwner ? 'Owner workspace (Signed in)' : 'Owner login / Edit portfolio';
  }

  _bindEvents() {
    document.addEventListener('click', (e) => {
      const loginBtn = e.target.closest('[data-action="owner-login"]');
      if (loginBtn) {
        this.showLoginModal();
        return;
      }

      const logoutBtn = e.target.closest('[data-action="owner-logout"]');
      if (logoutBtn) {
        this.signOut();
        return;
      }

      const statusBtn = e.target.closest('[data-action="auth-status"]');
      if (statusBtn) {
        this.showStatusModal();
        return;
      }
    });

    document.addEventListener('submit', async (e) => {
      if (e.target.id !== 'owner-login-form') return;
      e.preventDefault();

      const fd = new FormData(e.target);
      const email = String(fd.get('email') || '').trim();
      const password = String(fd.get('password') || '');
      const errEl = document.getElementById('login-error');
      const submitBtn = e.target.querySelector('button[type="submit"]');

      if (!email || !password) {
        if (errEl) errEl.textContent = 'Please provide both email and password.';
        return;
      }

      try {
        if (submitBtn) submitBtn.disabled = true;
        if (errEl) errEl.textContent = 'Signing in…';
        await this.auth.signIn(email, password);
        showToast('Signed in successfully as portfolio owner.');
        dialog.close();
      } catch (err) {
        if (errEl) errEl.textContent = err.message || 'Login failed.';
        showToast(`Login failed: ${err.message}`);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  showLoginModal(message = '') {
    dialog.open(
      'OWNER AUTHENTICATION',
      'Sign in to edit',
      `<form id="owner-login-form">
        <p class="form-help">${message || 'Public visitors have read-only access. Only the designated portfolio owner can save changes to the cloud database.'}</p>
        <div class="field">
          <label for="f-email">Owner Email</label>
          <input type="email" id="f-email" name="email" required autocomplete="email" placeholder="owner@example.com">
        </div>
        <div class="field">
          <label for="f-password">Password</label>
          <input type="password" id="f-password" name="password" required autocomplete="current-password">
        </div>
        <p class="error-note" id="login-error" role="alert"></p>
        <div class="form-actions">
          <button type="button" class="btn small" onclick="document.getElementById('detail-dialog').close()">Cancel</button>
          <button class="btn primary small" type="submit">Sign in ${icon('arrow', 'sm')}</button>
        </div>
      </form>`
    );
  }

  showStatusModal() {
    const user = this.auth.getCurrentUser();
    const isOwner = this.auth.isOwner();

    dialog.open(
      'OWNER WORKSPACE',
      'Session Status',
      `<p>You are signed in as: <strong>${esc(user?.email || 'Authenticated user')}</strong></p>
       <p class="small-notice">Role: ${isOwner ? 'Designated Owner (Editing enabled)' : 'Viewer (Read-only)'}</p>
       <div class="edit-bottom" style="margin-top:20px">
         <button class="btn small" data-action="open-migration">${icon('upload', 'sm')} Local data migration tool</button>
         <button class="btn small delete-btn" data-action="owner-logout">Sign out</button>
       </div>`
    );

    document.querySelector('[data-action="open-migration"]')?.addEventListener('click', () => {
      this.onOpenMigration?.();
    });
  }

  async signOut() {
    try {
      await this.auth.signOut();
      showToast('Signed out. Editing permissions removed.');
      dialog.close();
    } catch (err) {
      showToast(`Sign out failed: ${err.message}`);
    }
  }

  promptLogin() {
    this.showLoginModal('Editing is protected. Please sign in as the portfolio owner to make and save changes.');
  }
}
