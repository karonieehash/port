import { esc } from '../../utils/escape-html.js';
import { icon } from '../../ui/icons.js';
import { dialog } from '../../ui/dialog.js';
import { showToast } from '../../ui/toast.js';
import { MediaService } from '../../services/media-service.js';

/**
 * Archive Feature Module
 * Supports external media URLs, safe rendering, and CRUD operations.
 */
export class ArchiveModule {
  /**
   * @param {import('./archive-service.js').ArchiveService} archiveService
   * @param {() => object} getPortfolioData
   * @param {() => boolean} isOwnerCheck
   * @param {() => void} requestOwnerLogin
   */
  constructor(archiveService, getPortfolioData, isOwnerCheck, requestOwnerLogin) {
    this.service = archiveService;
    this.getPortfolioData = getPortfolioData;
    this.isOwnerCheck = isOwnerCheck;
    this.requestOwnerLogin = requestOwnerLogin;
  }

  init() {
    this._bindEvents();
    this.renderArchive();
  }

  _bindEvents() {
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-action="archive-add"]');
      if (addBtn) {
        if (!this.isOwnerCheck()) {
          this.requestOwnerLogin();
          return;
        }
        this.editArchive();
        return;
      }

      const card = e.target.closest('[data-record]');
      if (card) {
        this.showArchive(card.dataset.record);
        return;
      }

      const editBtn = e.target.closest('[data-record-edit]');
      if (editBtn) {
        if (!this.isOwnerCheck()) {
          this.requestOwnerLogin();
          return;
        }
        this.editArchive(editBtn.dataset.recordEdit);
        return;
      }

      const delBtn = e.target.closest('[data-delete-record]');
      if (delBtn) {
        if (!this.isOwnerCheck()) {
          this.requestOwnerLogin();
          return;
        }
        const recordId = delBtn.dataset.deleteRecord;
        if (confirm('Delete this archive record? Export a backup first if you want to keep a copy.')) {
          this.deleteArchive(recordId);
        }
        return;
      }
    });

    document.addEventListener('submit', async (e) => {
      if (e.target.id !== 'archive-form') return;
      e.preventDefault();
      if (!this.isOwnerCheck()) {
        this.requestOwnerLogin();
        return;
      }

      const f = e.target;
      const fd = new FormData(f);
      const val = k => String(fd.get(k) || '').trim();
      const errEl = document.getElementById('archive-error');
      if (errEl) errEl.textContent = '';

      const recordId = f.dataset.id;
      const title = val('title');
      if (!title) {
        if (errEl) errEl.textContent = 'Please add a record title.';
        return;
      }

      // External media URL handling (Phase 9)
      let imageUrl = val('image');
      if (imageUrl && !MediaService.validateImageUrl(imageUrl)) {
        if (errEl) errEl.textContent = 'Please provide a valid https:// image URL or leave blank.';
        return;
      }

      if (fd.get('removeImage')) {
        imageUrl = '';
      }

      const recordData = {
        title,
        type: val('type') || 'Photograph',
        date: val('date'),
        location: val('location'),
        creator: val('creator'),
        source: val('source'),
        permission: val('permission'),
        image: imageUrl,
        description: val('description'),
        interpretation: val('interpretation')
      };

      try {
        if (recordId) {
          await this.service.updateRecord(recordId, recordData);
          showToast('Archive record updated.');
          this.renderArchive();
          this.showArchive(recordId);
        } else {
          const created = await this.service.createRecord(recordData);
          showToast('New archive record added.');
          this.renderArchive();
          this.showArchive(created.id);
        }
      } catch (err) {
        if (errEl) errEl.textContent = `Save failed: ${err.message}`;
        showToast(`Save failed: ${err.message}`);
      }
    });
  }

  async deleteArchive(recordId) {
    try {
      await this.service.deleteRecord(recordId);
      showToast('Record deleted.');
      this.renderArchive();
      dialog.close();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`);
    }
  }

  renderArchive() {
    const list = this.getPortfolioData().archive || [];
    const countEl = document.getElementById('archive-count');
    const container = document.getElementById('archive-container');

    const n = list.length;
    if (countEl) {
      countEl.textContent = String(n).padStart(2, '0') + ' RECORD' + (n === 1 ? '' : 'S') + (n ? ' / THE COLLECTION' : ' / READY TO BEGIN');
    }

    if (!container) return;

    if (!n) {
      container.innerHTML = `
        <div class="archive-empty">
          <svg viewBox="0 0 320 190" fill="none" role="img" aria-label="An open archive with pages ready for collected records">
            <ellipse cx="158" cy="156" rx="117" ry="19" stroke="var(--line)" stroke-dasharray="3 6"/>
            <g transform="rotate(-9 109 86)">
              <rect x="64" y="27" width="94" height="114" rx="5" fill="var(--bg)" stroke="var(--line)"/>
              <path d="M79 55h47m-47 10h62m-62 10h51m-51 10h57m-57 10h37" stroke="var(--muted)" stroke-width="1" opacity=".5"/>
            </g>
            <g transform="rotate(10 208 84)">
              <rect x="154" y="20" width="92" height="118" rx="5" fill="var(--bg)" stroke="var(--line)"/>
              <rect x="167" y="35" width="65" height="54" rx="2" stroke="var(--accent)" stroke-opacity=".6"/>
              <path d="m168 80 19-21 16 16 13-11 16 16" stroke="var(--accent)" stroke-opacity=".6"/>
              <circle cx="215" cy="49" r="4" stroke="var(--accent)" stroke-opacity=".6"/>
              <path d="M169 105h58m-58 10h37" stroke="var(--muted)" opacity=".5"/>
            </g>
            <path d="m54 106 99 12 103-12-13 61H68Z" fill="var(--bg2)" stroke="var(--accent)" stroke-opacity=".7"/>
            <path d="M153 118v49" stroke="var(--accent)" stroke-opacity=".4"/>
            <path d="m93 138 17 2m85-1 19-2" stroke="var(--accent)"/>
            <circle cx="264" cy="42" r="15" fill="var(--soft)" stroke="var(--accent)" stroke-opacity=".4"/>
            <path d="M264 35v14m-7-7h14" stroke="var(--accent)"/>
          </svg>
          <div>
            <h3>Every archive begins<br>with a first record.</h3>
            <p>Add your original photographs, field notes, maps, or linked oral narratives. Record where each item came from and why it matters.</p>
            <button class="btn small" data-action="archive-add">Create the first record ${icon('arrow', 'sm')}</button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = '<div class="archive-grid">' + list.map(a => {
      const validImg = MediaService.validateImageUrl(a.image);
      const symbolIcon = a.type === 'Photograph' ? 'image' : a.type === 'Map' ? 'map' : 'notes';

      return `
        <button class="archive-card" data-record="${esc(a.id)}">
          ${validImg
            ? `<img class="archive-card-img" src="${esc(validImg)}" alt="${esc(a.title)}" loading="lazy">`
            : `<span class="archive-card-symbol">${icon(symbolIcon)}</span>`}
          <span class="archive-card-body">
            <span>${esc(a.type || 'Archive record')}</span>
            <h3>${esc(a.title || 'Untitled record')}</h3>
            <p>${esc(a.location || 'Location not yet recorded')}${a.date ? ' · ' + esc(a.date) : ''}</p>
          </span>
        </button>
      `;
    }).join('') + '</div>';
  }

  showArchive(id) {
    const list = this.getPortfolioData().archive || [];
    const a = list.find(r => r.id === id);
    if (!a) return;

    const validImg = MediaService.validateImageUrl(a.image);
    const sourceUrl = MediaService.validateWebUrl(a.source);

    const metaFields = [
      ['Date', a.date],
      ['Location', a.location],
      ['Creator', a.creator],
      ['Permission / consent', a.permission]
    ];

    dialog.open(
      a.type || 'ARCHIVE RECORD',
      a.title || 'Untitled record',
      `${validImg ? `<img class="archive-detail-image" src="${esc(validImg)}" alt="${esc(a.title)}">` : ''}
       <dl class="meta-grid">
         ${metaFields.map(([k, v]) => `
           <div>
             <dt>${k}</dt>
             <dd>${esc(v || 'Not yet recorded')}</dd>
           </div>
         `).join('')}
       </dl>
       <h3>Description and context</h3>
       <div class="written-content">${esc(a.description || 'To be added.')}</div>
       <h3>Interpretation and connections</h3>
       <div class="written-content">${esc(a.interpretation || 'To be added.')}</div>
       ${sourceUrl ? `<p><a class="link-btn" href="${esc(sourceUrl)}" ${MediaService.getSafeLinkAttributes()}>Original source / linked media ${icon('up-right', 'sm')}</a></p>` : ''}
       <div class="form-actions">
         <button class="btn small" data-record-edit="${esc(id)}">${icon('edit', 'sm')} Edit record</button>
       </div>`
    );
  }

  editArchive(id = '') {
    const list = this.getPortfolioData().archive || [];
    const a = list.find(r => r.id === id) || {};

    const field = (name, label, value = '', type = 'text', help = '', full = false) => `
      <div class="field${full ? ' full' : ''}">
        <label for="f-${name}">${esc(label)}</label>
        ${type === 'textarea'
          ? `<textarea id="f-${name}" name="${name}" rows="5">${esc(value)}</textarea>`
          : `<input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}"${type === 'url' ? ' placeholder="https://…"' : ''}>`}
        ${help ? `<small>${esc(help)}</small>` : ''}
      </div>
    `;

    const types = ['Photograph', 'Field note', 'Map', 'Oral narrative', 'Document', 'Other'];

    dialog.open(
      'THE DIGITAL ARCHIVE',
      id ? 'Edit archive record' : 'Add an archive record',
      `<form id="archive-form" data-id="${esc(id)}">
        <p class="form-help">Keep original evidence, attribution, and interpretation together. Use external media URLs for images and source documents.</p>
        <div class="form-grid">
          ${field('title', 'Record title *', a.title)}
          <div class="field">
            <label for="f-type">Record type</label>
            <select id="f-type" name="type">
              ${types.map(t => `<option${a.type === t ? ' selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          ${field('date', 'Date of record', a.date, 'date')}
          ${field('location', 'Location', a.location)}
          ${field('creator', 'Creator / photographer', a.creator)}
          ${field('source', 'Original source or external media link', a.source, 'url')}
          ${field('permission', 'Permission / licence / consent', a.permission, 'text', 'Record the terms under which this item can be shared.', true)}
          <div class="field full">
            <label for="f-image">External Photograph URL (https://…)</label>
            <input type="url" id="f-image" name="image" placeholder="https://images.example.com/item.jpg" value="${esc(a.image || '')}">
            <small>Provide a public direct link to an image file (JPG, PNG, WebP). ${a.image ? 'An image is currently attached.' : ''}</small>
            ${a.image ? '<label style="font-size:11px;display:flex;gap:8px;align-items:center;margin-top:6px"><input type="checkbox" name="removeImage" style="width:auto"> Remove existing image</label>' : ''}
          </div>
          ${field('description', 'Description and context', a.description, 'textarea', '', true)}
          ${field('interpretation', 'Your interpretation and DH connections', a.interpretation, 'textarea', '', true)}
        </div>
        <p class="error-note" id="archive-error" role="alert"></p>
        <div class="form-actions">
          ${id ? `<button type="button" class="btn small delete-btn" data-delete-record="${esc(id)}">Delete record</button>` : ''}
          <button class="btn primary small" type="submit">Save record ${icon('arrow', 'sm')}</button>
        </div>
      </form>`
    );

    const titleInput = document.getElementById('f-title');
    if (titleInput) titleInput.required = true;
  }
}
