import { projectFields } from '../../utils/normalize.js';
import { esc } from '../../utils/escape-html.js';
import { icon } from '../../ui/icons.js';
import { dialog } from '../../ui/dialog.js';
import { showToast } from '../../ui/toast.js';

/**
 * Project Feature Module
 */
export class ProjectModule {
  /**
   * @param {import('./project-service.js').ProjectService} projectService
   * @param {() => object} getPortfolioData
   * @param {() => boolean} isOwnerCheck
   * @param {() => void} requestOwnerLogin
   */
  constructor(projectService, getPortfolioData, isOwnerCheck, requestOwnerLogin) {
    this.service = projectService;
    this.getPortfolioData = getPortfolioData;
    this.isOwnerCheck = isOwnerCheck;
    this.requestOwnerLogin = requestOwnerLogin;
  }

  init() {
    this._bindEvents();
    this.renderProject();
  }

  _bindEvents() {
    document.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-action="project-view"]');
      if (viewBtn) {
        this.viewProject();
        return;
      }
      const editBtn = e.target.closest('[data-action="project-edit"]');
      if (editBtn) {
        if (!this.isOwnerCheck()) {
          this.requestOwnerLogin();
          return;
        }
        this.editProject();
        return;
      }
    });

    document.addEventListener('submit', async (e) => {
      if (e.target.id !== 'project-form') return;
      e.preventDefault();
      if (!this.isOwnerCheck()) {
        this.requestOwnerLogin();
        return;
      }

      const fd = new FormData(e.target);
      const val = k => String(fd.get(k) || '').trim();

      const nextProject = {
        title: val('title'),
        site: val('site'),
        status: val('status')
      };
      for (const [k] of projectFields) {
        nextProject[k] = val(k);
      }

      try {
        await this.service.updateProject(nextProject);
        showToast('Field project proposal saved.');
        this.renderProject();
        this.viewProject();
      } catch (err) {
        showToast(`Save failed: ${err.message}`);
      }
    });
  }

  renderProject() {
    const p = this.getPortfolioData().project || {};

    const titleEl = document.getElementById('project-title');
    const descEl = document.getElementById('project-description');
    const siteEl = document.getElementById('project-site');
    const statusEl = document.getElementById('project-status');
    const editBtn = document.querySelector('[data-action="project-edit"]');

    if (titleEl) titleEl.textContent = p.title || 'A Bengaluru story, waiting to be explored.';
    if (descEl) descEl.textContent = p.description || 'Begin with a place, a question, and the people connected to it. Use this workspace to develop the project proposal and document the research process.';
    if (siteEl) siteEl.textContent = p.site || 'To be confirmed';
    if (statusEl) statusEl.textContent = p.status || 'Proposal workspace';
    if (editBtn) editBtn.innerHTML = (p.title ? 'Edit proposal' : 'Add proposal') + icon('edit', 'sm');
  }

  viewProject() {
    const p = this.getPortfolioData().project || {};
    const any = projectFields.some(([k]) => p[k]);

    const content = any
      ? projectFields.map(([k, label]) => `
          <h3>${label}</h3>
          ${p[k] ? `<div class="written-content">${esc(p[k])}</div>` : '<p>To be added.</p>'}
        `).join('')
      : `<div class="missing-work">${icon('map')}<h3>Start with a place and a question</h3><p>Add your site, research question, rationale, method, sources, objectives, and permissions. This workspace is ready for your proposal.</p></div>`;

    dialog.open(
      'BENGALURU FIELD PROJECT',
      p.title || 'Project proposal workspace',
      `<div class="tag-row">
        <span class="tag">CIA I → CIA III</span>
        <span class="tag">Group of four</span>
        <span class="tag">${esc(p.site || 'Site to be confirmed')}</span>
      </div>
      ${content}
      <div class="form-actions">
        <button class="btn primary small" data-action="project-edit">${icon('edit', 'sm')} Edit the proposal</button>
      </div>`
    );
  }

  editProject() {
    const p = this.getPortfolioData().project || {};

    const field = (name, label, value = '', type = 'text', full = false) => `
      <div class="field${full ? ' full' : ''}">
        <label for="f-${name}">${esc(label)}</label>
        ${type === 'textarea'
          ? `<textarea id="f-${name}" name="${name}" rows="5">${esc(value)}</textarea>`
          : `<input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}">`}
      </div>
    `;

    const statuses = [
      'Proposal workspace',
      'Proposal in progress',
      'Awaiting instructor approval',
      'Approved for fieldwork',
      'Fieldwork in progress',
      'Analysis in progress',
      'Archive ready'
    ];

    dialog.open(
      'BUILD THE FIELD PROJECT',
      'Your project proposal',
      `<form id="project-form">
        <p class="form-help">Develop the proposal from your group’s research and your own understanding. Changes persist to the cloud portfolio.</p>
        <div class="form-grid">
          ${field('title', 'Project title', p.title)}
          ${field('site', 'Selected site / locality', p.site)}
          <div class="field full">
            <label for="f-status">Current project status</label>
            <select name="status" id="f-status">
              ${statuses.map(s => `<option${p.status === s ? ' selected' : ''}>${s}</option>`).join('')}
            </select>
            <small>Choose a status that reflects your actual progress.</small>
          </div>
        </div>
        <div style="margin-top:22px">
          ${projectFields.map(([k, label]) => field(k, label, p[k], 'textarea')).join('')}
        </div>
        <div class="form-actions">
          <button type="button" class="btn small" data-action="project-view">Cancel</button>
          <button class="btn primary small" type="submit">Save proposal ${icon('arrow', 'sm')}</button>
        </div>
      </form>`
    );
  }
}
