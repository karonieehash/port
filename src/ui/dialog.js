/**
 * Dialog Modal Manager with Accessibility and Focus Management
 */
let previousFocus = null;
let focusReturn = null;

export class DialogManager {
  constructor() {
    this.dialog = document.getElementById('detail-dialog');
    this.kicker = document.getElementById('dialog-kicker');
    this.title = document.getElementById('dialog-title');
    this.body = document.getElementById('dialog-body');
    this.closeBtn = document.getElementById('dialog-close');

    if (this.dialog) {
      this._bindEvents();
    }
  }

  _bindEvents() {
    this.closeBtn?.addEventListener('click', () => this.close());

    this.dialog.addEventListener('close', () => {
      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      } else if (focusReturn) {
        const target = Array.from(document.querySelectorAll(`[${focusReturn.key}]`))
          .find(el => el.getAttribute(focusReturn.key) === focusReturn.value && el.getClientRects().length);
        (target || document.querySelector('.nav-edit'))?.focus();
      }
    });

    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) {
        const r = this.dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          this.close();
        }
      }
    });
  }

  /**
   * Opens the modal dialog with kicker, title, and HTML content.
   * @param {string} kickerText
   * @param {string} titleText
   * @param {string} htmlContent
   */
  open(kickerText, titleText, htmlContent) {
    if (!this.dialog) return;

    if (!this.dialog.open) {
      previousFocus = document.activeElement;
      const k = ['data-reading', 'data-record', 'data-action'].find(a => previousFocus?.hasAttribute(a));
      focusReturn = k ? { key: k, value: previousFocus.getAttribute(k) } : null;
    }

    if (this.kicker) this.kicker.textContent = kickerText;
    if (this.title) this.title.textContent = titleText;
    if (this.body) this.body.innerHTML = htmlContent;

    if (!this.dialog.open) {
      this.dialog.showModal();
    }
    this.dialog.scrollTop = 0;
    this.closeBtn?.focus();
  }

  close() {
    if (this.dialog?.open) {
      this.dialog.close();
    }
  }
}

export const dialog = new DialogManager();
