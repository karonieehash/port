import { readings } from '../../constants/readings-data.js';
import { units } from '../../constants/course-units.js';
import { esc } from '../../utils/escape-html.js';
import { icon } from '../../ui/icons.js';
import { dialog } from '../../ui/dialog.js';
import { showToast } from '../../ui/toast.js';
import { MediaService } from '../../services/media-service.js';

/**
 * Readings Feature Module
 */
export class ReadingsModule {
  /**
   * @param {import('./readings-service.js').ReadingsService} readingsService
   * @param {() => object} getPortfolioData
   * @param {() => boolean} isOwnerCheck
   * @param {() => void} requestOwnerLogin
   */
  constructor(readingsService, getPortfolioData, isOwnerCheck, requestOwnerLogin) {
    this.service = readingsService;
    this.getPortfolioData = getPortfolioData;
    this.isOwnerCheck = isOwnerCheck;
    this.requestOwnerLogin = requestOwnerLogin;

    this.activeFilter = 'all';
    this.showAll = false;
    this.query = '';
    this.currentUnit = 0;
  }

  init() {
    this._bindEvents();
    this.renderUnit(0);
    this.renderReadings();
  }

  _bindEvents() {
    // Course unit tabs
    const moduleTabs = document.getElementById('module-tabs');
    moduleTabs?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-unit]');
      if (b) this.renderUnit(Number(b.dataset.unit), true);
    });

    moduleTabs?.addEventListener('keydown', (e) => {
      let n = this.currentUnit;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (n + 1) % 4;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (n + 3) % 4;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = 3;
      else return;
      e.preventDefault();
      this.renderUnit(n, true);
    });

    // Reading filters & search
    document.getElementById('reading-filters')?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (b) {
        this.activeFilter = b.dataset.filter;
        this.renderReadings();
      }
    });

    document.getElementById('reading-search')?.addEventListener('input', (e) => {
      this.query = e.target.value.toLowerCase().trim();
      this.renderReadings();
    });

    document.getElementById('show-all-readings')?.addEventListener('click', () => {
      this.showAll = !this.showAll;
      this.renderReadings();
    });

    // Global document listeners for readings actions
    document.addEventListener('click', (e) => {
      const r = e.target.closest('[data-reading]');
      if (r) {
        this.showReading(r.dataset.reading);
        return;
      }
      const re = e.target.closest('[data-reading-edit]');
      if (re) {
        if (!this.isOwnerCheck()) {
          this.requestOwnerLogin();
          return;
        }
        this.editReading(re.dataset.readingEdit);
        return;
      }
      const rt = e.target.closest('[data-reading-tab]');
      if (rt) {
        this.showReading(rt.dataset.id, rt.dataset.readingTab);
        document.querySelector(`#dialog-body [data-reading-tab="${rt.dataset.readingTab}"]`)?.focus();
        return;
      }
      const ur = e.target.closest('[data-unit-readings]');
      if (ur) {
        this.activeFilter = ur.dataset.unitReadings;
        this.query = '';
        const searchInput = document.getElementById('reading-search');
        if (searchInput) searchInput.value = '';
        this.renderReadings();
        document.getElementById('readings')?.scrollIntoView({
          behavior: document.documentElement.classList.contains('motion-paused') ? 'auto' : 'smooth'
        });
        return;
      }
    });

    document.addEventListener('keydown', (e) => {
      const b = e.target.closest('[data-reading-tab]');
      if (!b) return;
      const tabs = Array.from(document.querySelectorAll('[data-reading-tab]'));
      let i = tabs.indexOf(b);
      if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') i = (i + tabs.length - 1) % tabs.length;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = tabs.length - 1;
      else return;
      e.preventDefault();
      const next = tabs[i];
      this.showReading(next.dataset.id, next.dataset.readingTab);
      document.querySelector(`[data-reading-tab="${next.dataset.readingTab}"]`)?.focus();
    });

    document.addEventListener('submit', async (e) => {
      if (e.target.id !== 'reading-form') return;
      e.preventDefault();
      if (!this.isOwnerCheck()) {
        this.requestOwnerLogin();
        return;
      }

      const f = e.target;
      const fd = new FormData(f);
      const val = k => String(fd.get(k) || '').trim();
      const readingId = f.dataset.id;

      try {
        await this.service.updateReading(readingId, {
          annotation: val('annotation'),
          analysis: val('analysis'),
          notes: val('notes'),
          summary: val('summary')
        });
        showToast('Reading updated successfully.');
        this.renderReadings();
        this.showReading(readingId);
      } catch (err) {
        showToast(`Save failed: ${err.message}`);
      }
    });
  }

  renderUnit(index, focus = false) {
    this.currentUnit = index;
    const moduleTabs = document.getElementById('module-tabs');
    const moduleDetail = document.getElementById('module-detail');

    if (moduleTabs) {
      moduleTabs.innerHTML = units.map((u, i) => `
        <button class="module-tab" role="tab" id="unit-${i}" aria-controls="module-detail" aria-selected="${i === index}" tabindex="${i === index ? 0 : -1}" data-unit="${i}">
          <span class="module-number">0${i + 1}</span>
          <strong>${esc(u.short)}</strong>
          ${icon('arrow')}
        </button>
      `).join('');
    }

    const u = units[index];
    if (moduleDetail && u) {
      moduleDetail.setAttribute('aria-labelledby', `unit-${index}`);
      moduleDetail.innerHTML = `
        <svg class="module-art" viewBox="0 0 400 105" role="img" aria-label="Connected ideas illustration for ${esc(u.short)}">
          <g fill="none" stroke="var(--line)">
            <path d="M5 52h390" stroke-dasharray="3 7"/>
            <ellipse cx="200" cy="52" rx="150" ry="44"/>
            <ellipse cx="200" cy="52" rx="97" ry="33"/>
            <ellipse cx="200" cy="52" rx="43" ry="48" transform="rotate(35 200 52)"/>
          </g>
          <g fill="var(--bg2)" stroke="var(--accent)">
            <circle cx="50" cy="52" r="8"/>
            <circle cx="350" cy="52" r="8"/>
            <circle cx="${[280, 150, 230, 100][index]}" cy="${[16, 83, 11, 75][index]}" r="5"/>
          </g>
          <circle cx="200" cy="52" r="25" fill="var(--soft)" stroke="var(--accent)" stroke-width=".6"/>
          <svg x="187" y="39" width="26" height="26" class="icon" style="color:var(--accent)"><use href="#i-${u.symbol}"/></svg>
        </svg>
        <div class="eyebrow">UNIT 0${index + 1} / ${u.label}</div>
        <h3>${esc(u.display)}</h3>
        <p>${esc(u.summary)}</p>
        <div class="tag-row">${u.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <button class="link-btn" style="font-size:11px;margin-top:22px" data-unit-readings="${index + 1}">
          Readings for this unit ${icon('arrow', 'sm')}
        </button>
      `;
    }

    if (focus) {
      document.getElementById(`unit-${index}`)?.focus();
    }
  }

  readingCount(id) {
    const data = this.getPortfolioData();
    const r = data.readings?.[id] || {};
    return ['annotation', 'notes', 'analysis', 'summary'].filter(k => String(r[k] || '').trim()).length;
  }

  renderReadings() {
    const listEl = document.getElementById('reading-list');
    const footEl = document.getElementById('reading-footnote');
    const showAllBtn = document.getElementById('show-all-readings');
    const filterBtns = document.querySelectorAll('#reading-filters .filter');

    const list = readings.filter(r =>
      (this.activeFilter === 'all' || String(r.unit) === this.activeFilter) &&
      (r.title + ' ' + r.author).toLowerCase().includes(this.query)
    );

    const shown = (this.showAll || this.activeFilter !== 'all' || this.query) ? list : list.slice(0, 5);

    if (listEl) {
      listEl.innerHTML = shown.length ? shown.map(r => {
        const count = this.readingCount(r.id);
        return `
          <button class="reading-row" data-reading="${r.id}">
            <span class="reading-num">${String(readings.indexOf(r) + 1).padStart(2, '0')}</span>
            <span class="reading-main">
              <span class="reading-author" style="display:block">${esc(r.author)} / ${r.year}${r.alternative ? ' · ALTERNATIVE READING' : ''}</span>
              <span class="reading-title">${esc(r.title)}</span>
            </span>
            <span class="reading-unit">
              <span>UNIT 0${r.unit}</span>
              <small class="${count ? 'has-work' : ''}">${count ? count + '/4 parts added' : 'Ready for your notes'}</small>
            </span>
            <span class="reading-arrow">${icon('up-right', 'sm')}</span>
          </button>
        `;
      }).join('') : '<div class="empty-result">No readings match your search. Try another author, title, or unit.</div>';
    }

    if (showAllBtn) {
      showAllBtn.hidden = this.activeFilter !== 'all' || Boolean(this.query);
      showAllBtn.innerHTML = (this.showAll ? 'Show fewer readings' : 'All 9 readings') + icon(this.showAll ? 'down' : 'arrow', 'sm');
    }

    if (footEl) {
      footEl.textContent = `Showing ${shown.length} of ${list.length} readings. ${this.activeFilter === 'all' ? 'The two alternative Unit 02 readings are listed separately.' : 'Student work appears when added.'}`;
    }

    filterBtns.forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.filter === this.activeFilter));
    });
  }

  showReading(id, tab = 'annotation') {
    const r = readings.find(x => x.id === id);
    if (!r) return;

    const portfolio = this.getPortfolioData();
    const work = portfolio.readings?.[id] || {};
    const tabs = [
      ['annotation', 'Annotations', 'Add a link to scans of your physical annotations.'],
      ['analysis', 'Analysis', 'Add your own analytical response to this reading.'],
      ['notes', 'Class notes', 'Add a link to scans of your classroom notes.'],
      ['summary', 'Learning summary', 'Explain what you learned in your own words.']
    ];

    let body = '';
    const spec = tabs.find(x => x[0] === tab) || tabs[0];
    if (work[tab]) {
      if (tab === 'annotation' || tab === 'notes') {
        const url = MediaService.validateWebUrl(work[tab]);
        body = url
          ? `<p>Your ${esc(spec[1].toLowerCase())} are linked below.</p>
             <a class="btn primary" href="${esc(url)}" ${MediaService.getSafeLinkAttributes()}>Open ${esc(spec[1].toLowerCase())} ${icon('up-right', 'sm')}</a>
             <p class="small-notice">Opens the linked file in a new tab. Access depends on that file’s sharing settings.</p>`
          : `<div class="missing-work">${icon('notes')}<h3>This link needs an update</h3><p>Edit this reading and provide a complete https:// or http:// link.</p></div>`;
      } else {
        body = `<div class="written-content">${esc(work[tab])}</div>`;
      }
    } else {
      body = `<div class="missing-work">${icon('notes')}<h3>A space for your ${esc(spec[1].toLowerCase())}</h3><p>${esc(spec[2])}</p></div>`;
    }

    dialog.open(
      `READING ${String(readings.indexOf(r) + 1).padStart(2, '0')} / UNIT 0${r.unit}`,
      r.title,
      `<p style="margin-top:0">${esc(r.author)} · ${r.year}${r.alternative ? ' · The course plan lists this as an alternative Unit 02 reading.' : ''}</p>
       <div class="dialog-tabs" role="tablist" aria-label="Reading components">
         ${tabs.map(t => `<button role="tab" aria-selected="${t[0] === tab}" tabindex="${t[0] === tab ? 0 : -1}" data-reading-tab="${t[0]}" data-id="${id}">${t[1]}</button>`).join('')}
       </div>
       <div role="tabpanel">${body}</div>
       <div class="form-actions">
         <button class="btn small" data-reading-edit="${id}">${icon('edit', 'sm')} Edit this reading</button>
       </div>
       <p class="citation">${esc(r.citation)}${r.url ? `<br><a href="${esc(r.url)}" ${MediaService.getSafeLinkAttributes()} class="accent">Source reference ↗</a>` : ''}</p>`
    );
  }

  editReading(id) {
    const r = readings.find(x => x.id === id);
    if (!r) return;

    const portfolio = this.getPortfolioData();
    const w = portfolio.readings?.[id] || {};

    const field = (name, label, value = '', type = 'text', help = '') => `
      <div class="field">
        <label for="f-${name}">${esc(label)}</label>
        ${type === 'textarea'
          ? `<textarea id="f-${name}" name="${name}" rows="5">${esc(value)}</textarea>`
          : `<input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}"${type === 'url' ? ' placeholder="https://…"' : ''}>`}
        ${help ? `<small>${esc(help)}</small>` : ''}
      </div>
    `;

    dialog.open(
      'ADD YOUR COURSEWORK',
      r.title,
      `<form id="reading-form" data-id="${id}">
        <p class="form-help">Link your scanned pages and add your original writing. Changes persist to the cloud portfolio for all visitors.</p>
        ${field('annotation', 'Physical annotations — scan link', w.annotation, 'url', 'Use a shareable link to a PDF or image file.')}
        ${field('analysis', 'Analytical response', w.analysis, 'textarea')}
        ${field('notes', 'Scanned class notes — link', w.notes, 'url')}
        ${field('summary', 'Learning summary in your own words', w.summary, 'textarea')}
        <div class="form-actions">
          <button type="button" class="btn small" data-reading="${id}">Back to reading</button>
          <button class="btn primary small" type="submit">Save reading ${icon('arrow', 'sm')}</button>
        </div>
      </form>`
    );
  }
}
