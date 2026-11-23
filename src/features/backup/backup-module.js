import { normalizePortfolio } from '../../utils/normalize.js';
import { saveBlob } from '../../utils/blob-download.js';
import { icon } from '../../ui/icons.js';
import { dialog } from '../../ui/dialog.js';
import { showToast } from '../../ui/toast.js';

/**
 * Backup Module (Phase 4 & Phase 11)
 * Handles JSON Export, JSON Import, and self-contained HTML snapshot download.
 */
export class BackupModule {
  /**
   * @param {() => object} getPortfolioData
   * @param {(data: object) => Promise<void>} onSavePortfolio
   * @param {() => boolean} isOwnerCheck
   * @param {() => void} requestOwnerLogin
   */
  constructor(getPortfolioData, onSavePortfolio, isOwnerCheck, requestOwnerLogin) {
    this.getPortfolioData = getPortfolioData;
    this.onSavePortfolio = onSavePortfolio;
    this.isOwnerCheck = isOwnerCheck;
    this.requestOwnerLogin = requestOwnerLogin;
  }

  init() {
    this._bindEvents();
  }

  _bindEvents() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b) return;

      const act = b.dataset.action;
      if (act === 'backup') {
        this.exportJSON();
      } else if (act === 'download') {
        this.downloadHTML();
      } else if (e.target.closest('#import-button')) {
        if (!this.isOwnerCheck()) {
          this.requestOwnerLogin();
          return;
        }
        document.getElementById('import-file')?.click();
      }
    });

    document.addEventListener('change', async (e) => {
      if (e.target.id !== 'import-file' || !e.target.files?.[0]) return;
      if (!this.isOwnerCheck()) {
        this.requestOwnerLogin();
        return;
      }

      const file = e.target.files[0];
      if (file.size > 20000000) {
        showToast('Choose a portfolio JSON backup smaller than 20 MB.');
        return;
      }

      try {
        const text = await file.text();
        const incoming = normalizePortfolio(JSON.parse(text));
        if (confirm('Replace current portfolio with this backup? Export current work first if needed.')) {
          await this.onSavePortfolio(incoming);
          showToast('Backup restored successfully.');
          dialog.close();
        }
      } catch (err) {
        showToast('This file is not a compatible portfolio backup. No changes were made.');
      } finally {
        e.target.value = '';
      }
    });
  }

  exportJSON() {
    const data = this.getPortfolioData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveBlob(blob, 'Deepak_2633115_portfolio_backup.json');
    showToast('Portfolio backup exported as JSON.');
  }

  downloadHTML() {
    const data = this.getPortfolioData();
    const clone = document.documentElement.cloneNode(true);

    const dataEl = clone.querySelector('#portfolio-data');
    if (dataEl) {
      dataEl.textContent = JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
    }

    const d = clone.querySelector('#detail-dialog');
    if (d) {
      d.removeAttribute('open');
      const b = clone.querySelector('#dialog-body');
      if (b) b.innerHTML = '';
      const t = clone.querySelector('#dialog-title');
      if (t) t.textContent = '';
      const k = clone.querySelector('#dialog-kicker');
      if (k) k.textContent = '';
    }

    const toastEl = clone.querySelector('#toast');
    if (toastEl) {
      toastEl.classList.remove('show');
      toastEl.textContent = '';
    }

    const mobNav = clone.querySelector('#mobile-nav');
    if (mobNav) mobNav.classList.remove('is-open');

    const mobToggle = clone.querySelector('#mobile-toggle');
    if (mobToggle) mobToggle.setAttribute('aria-expanded', 'false');

    const searchInput = clone.querySelector('#reading-search');
    if (searchInput) {
      searchInput.value = '';
      searchInput.removeAttribute('value');
    }

    const htmlString = '<!doctype html>\n' + clone.outerHTML;
    saveBlob(new Blob([htmlString], { type: 'text/html;charset=utf-8' }), 'Deepak_2633115_Digital_Humanities.html');
    showToast('Downloaded portable HTML portfolio snapshot.');
  }
}
