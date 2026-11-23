import { readings } from '../../constants/readings-data.js';
import { milestones } from '../../constants/milestones-data.js';
import { esc } from '../../utils/escape-html.js';
import { icon } from '../../ui/icons.js';
import { dialog } from '../../ui/dialog.js';
import { showToast } from '../../ui/toast.js';
import { MediaService } from '../../services/media-service.js';

/**
 * Process Feature Module
 * Responsible for meeting logs, reflection, sources shelf, schedule timeline, and acknowledgements declaration.
 */
export class ProcessModule {
  /**
   * @param {import('./process-service.js').ProcessService} processService
   * @param {() => object} getPortfolioData
   * @param {() => boolean} isOwnerCheck
   * @param {() => void} requestOwnerLogin
   */
  constructor(processService, getPortfolioData, isOwnerCheck, requestOwnerLogin) {
    this.service = processService;
    this.getPortfolioData = getPortfolioData;
    this.isOwnerCheck = isOwnerCheck;
    this.requestOwnerLogin = requestOwnerLogin;
  }

  init() {
    this._bindEvents();
    this.renderTimeline();
  }

  _bindEvents() {
    document.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');
      if (!action) return;

      const act = action.dataset.action;
      if (act === 'milestones') {
        this.showSchedule();
      } else if (act === 'sources') {
        this.showSources();
      } else if (act === 'process') {
        this.showProcess(false);
      } else if (act === 'process-edit') {
        if (!this.isOwnerCheck()) {
          this.requestOwnerLogin();
          return;
        }
        this.showProcess(true);
      } else if (act === 'acknowledgements') {
        this.showAcknowledgements(false);
      } else if (act === 'acknowledgements-edit') {
        if (!this.isOwnerCheck()) {
          this.requestOwnerLogin();
          return;
        }
        this.showAcknowledgements(true);
      }
    });

    document.addEventListener('submit', async (e) => {
      const formId = e.target.id;
      if (formId !== 'process-form' && formId !== 'acknowledgements-form') return;
      e.preventDefault();
      if (!this.isOwnerCheck()) {
        this.requestOwnerLogin();
        return;
      }

      const fd = new FormData(e.target);
      const val = k => String(fd.get(k) || '').trim();

      try {
        if (formId === 'process-form') {
          await this.service.updateProcess({
            log: val('log'),
            contribution: val('contribution'),
            reflection: val('reflection'),
            sources: val('sources')
          });
          showToast('Process journal saved.');
          this.showProcess(false);
        } else if (formId === 'acknowledgements-form') {
          await this.service.updateProcess({
            acknowledgements: val('acknowledgements')
          });
          showToast('Acknowledgements declaration saved.');
          this.showAcknowledgements(false);
        }
      } catch (err) {
        showToast(`Save failed: ${err.message}`);
      }
    });
  }

  renderTimeline() {
    const listEl = document.getElementById('timeline-list');
    if (!listEl) return;

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const key = milestones.filter(x => x.key);
    const next = key.find(x => x.date >= today);

    listEl.innerHTML = key.map(m => `
      <div class="timeline-item${m === next ? ' next' : ''}">
        <time class="timeline-date" datetime="${m.date}">${m.label}</time>
        <div>
          <h3>${esc(m.title)}</h3>
          <p>${esc(m.detail)}</p>
        </div>
      </div>
    `).join('');
  }

  showSchedule() {
    dialog.open(
      '2026–27 / COURSE PLAN',
      'The semester at a glance',
      `<p>Scheduled dates from the supplied course plan. They do not indicate that an activity has been completed.</p>
       <div class="timeline-list" style="margin-top:27px">
         ${milestones.map(m => `
           <div class="timeline-item">
             <time class="timeline-date" datetime="${m.date}">${m.label}</time>
             <div>
               <h3>${esc(m.title)}</h3>
               <p>${esc(m.detail)}</p>
             </div>
           </div>
         `).join('')}
       </div>
       <p class="small-notice" style="margin-top:28px">The brief gives 28 November 2026 for the CIA I individual submission while also referring to essays covered through 2 December. Confirm any timetable updates with the course instructor.</p>`
    );
  }

  showSources() {
    const p = this.getPortfolioData().process || {};
    dialog.open(
      'SOURCES & REFERENCES',
      'The course reading shelf',
      `<p>Bibliographic details and source links transcribed from the supplied ENG101-2B course plan.</p>
       <div class="source-list">
         ${readings.map((r, i) => `
           <div class="source-item">
             <p>
               <span class="accent mono" style="font-size:10px">${String(i + 1).padStart(2, '0')} / UNIT 0${r.unit}</span><br>
               ${esc(r.citation)}
             </p>
             ${r.url ? `<a href="${esc(r.url)}" ${MediaService.getSafeLinkAttributes()}>Open source reference ↗</a>` : '<span class="source-caption">Print / library reading listed in the course plan.</span>'}
             ${r.alternative ? '<p class="small-notice">Listed as an alternative reading in Unit 02.</p>' : ''}
           </div>
         `).join('')}
       </div>
       <h3>Portfolio structure and dates</h3>
       <p class="small-notice">Source: ENG101-2B — Introduction to Digital Humanities Course Plan, Even Semester 2026–27. Institution, programme, units, reading list, assessment structure, and dates are drawn from this document.</p>
       ${p.sources ? `<h3>Additional sources added by Deepak</h3><div class="written-content">${esc(p.sources)}</div>` : ''}`
    );
  }

  showProcess(edit = false) {
    const p = this.getPortfolioData().process || {};
    const field = (name, label, value = '') => `
      <div class="field">
        <label for="f-${name}">${esc(label)}</label>
        <textarea id="f-${name}" name="${name}" rows="5">${esc(value)}</textarea>
      </div>
    `;

    if (edit) {
      dialog.open(
        'PROCESS JOURNAL',
        'Record the work behind the work',
        `<form id="process-form">
          <p class="form-help">Add your actual meeting records, responsibilities, sources, and individual reflection.</p>
          ${field('log', 'Group meeting and task log', p.log)}
          ${field('contribution', 'My individual contribution', p.contribution)}
          ${field('reflection', 'My reflection on the project', p.reflection)}
          ${field('sources', 'Additional sources and citations', p.sources)}
          <div class="form-actions">
            <button class="btn primary small" type="submit">Save process journal ${icon('arrow', 'sm')}</button>
          </div>
        </form>`
      );
      return;
    }

    const sections = [
      ['log', 'Group meeting and task log'],
      ['contribution', 'Individual contribution'],
      ['reflection', 'Individual reflection'],
      ['sources', 'Additional sources']
    ];

    dialog.open(
      'PROCESS & CONTRIBUTIONS',
      'Behind the portfolio',
      `${sections.map(([k, label]) => `
        <h3>${label}</h3>
        ${p[k] ? `<div class="written-content">${esc(p[k])}</div>` : '<p>Ready for your own entry.</p>'}
      `).join('')}
      <div class="form-actions">
        <button class="btn primary small" data-action="process-edit">${icon('edit', 'sm')} Add an entry</button>
      </div>`
    );
  }

  showAcknowledgements(edit = false) {
    const p = this.getPortfolioData().process || {};

    if (edit) {
      dialog.open(
        'TOOLS & ACKNOWLEDGEMENTS',
        'Make assistance visible',
        `<form id="acknowledgements-form">
          <div class="field">
            <label for="f-acknowledgements">Tools, assistance, and acknowledgements</label>
            <textarea id="f-acknowledgements" name="acknowledgements" rows="6">${esc(p.acknowledgements || '')}</textarea>
            <small>State accurately how each person or tool contributed.</small>
          </div>
          <div class="form-actions">
            <button class="btn primary small" type="submit">Save declaration</button>
          </div>
        </form>`
      );
      return;
    }

    dialog.open(
      'TOOLS & ACKNOWLEDGEMENTS',
      'A transparent creative process',
      `<div class="written-content">${esc(p.acknowledgements || 'Add your acknowledgements before submission.')}</div>
       <h3>Course guidance</h3>
       <p>The supplied brief requires original student analysis, interpretation, and conclusions, with sources and AI assistance acknowledged. Review the declaration before submitting the portfolio.</p>
       <div class="form-actions">
         <button class="btn small" data-action="acknowledgements-edit">${icon('edit', 'sm')} Edit declaration</button>
       </div>`
    );
  }
}
