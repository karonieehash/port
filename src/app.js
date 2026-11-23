import { config, configValidation } from './config/index.js';
import { createBackend } from './backend/backend-factory.js';
import { PortfolioApi } from './api/portfolio-api.js';
import { ReadingsService } from './features/readings/readings-service.js';
import { ReadingsModule } from './features/readings/readings-module.js';
import { ProjectService } from './features/project/project-service.js';
import { ProjectModule } from './features/project/project-module.js';
import { ArchiveService } from './features/archive/archive-service.js';
import { ArchiveModule } from './features/archive/archive-module.js';
import { ProcessService } from './features/process/process-service.js';
import { ProcessModule } from './features/process/process-module.js';
import { AuthService } from './features/auth/auth-service.js';
import { AuthModal } from './features/auth/auth-modal.js';
import { BackupModule } from './features/backup/backup-module.js';
import { MigrationTool } from './features/backup/migration-tool.js';
import { normalizePortfolio, defaultPortfolioData } from './utils/normalize.js';
import { initTheme } from './ui/theme.js';
import { initMotion } from './ui/motion.js';
import { initNavigation } from './ui/navigation.js';
import { dialog } from './ui/dialog.js';
import { icon } from './ui/icons.js';
import { showToast } from './ui/toast.js';
import { readings } from './constants/readings-data.js';
import { esc } from './utils/escape-html.js';

/**
 * Main Application Orchestrator
 */
class PortfolioApp {
  constructor() {
    this.data = normalizePortfolio(defaultPortfolioData);
  }

  async start() {
    // 1. Initialize UI baseline (theme, motion, navigation)
    initTheme();
    initMotion();
    initNavigation();

    // 2. Read embedded HTML baseline data
    const embeddedEl = document.getElementById('portfolio-data');
    if (embeddedEl?.textContent) {
      try {
        this.data = normalizePortfolio(JSON.parse(embeddedEl.textContent));
      } catch (err) {
        console.warn('Could not parse embedded portfolio-data, using defaults.', err);
      }
    }

    // 3. Initialize Backend & Services
    const { authAdapter, repositoryAdapter, isLocalFallback } = createBackend(config);
    this.authAdapter = authAdapter;
    this.repository = repositoryAdapter;
    this.api = new PortfolioApi(this.repository);

    this.authService = new AuthService(this.authAdapter);
    this.readingsService = new ReadingsService(this.api);
    this.projectService = new ProjectService(this.api);
    this.archiveService = new ArchiveService(this.api);
    this.processService = new ProcessService(this.api);

    // 4. Fetch initial portfolio data from repository
    try {
      const remoteData = await this.api.getPortfolio();
      if (remoteData && remoteData.updatedAt >= this.data.updatedAt) {
        this.data = remoteData;
      }
    } catch (err) {
      console.warn('Initial data fetch notice:', err.message);
      if (!isLocalFallback) {
        showToast('Could not sync with cloud backend. Displaying cached/local portfolio.');
      }
    }

    // 5. Initialize Feature Modules
    const isOwnerCheck = () => this.authService.isOwner();
    const requestOwnerLogin = () => this.authModal.promptLogin();
    const getPortfolioData = () => this.data;

    this.readingsModule = new ReadingsModule(this.readingsService, getPortfolioData, isOwnerCheck, requestOwnerLogin);
    this.projectModule = new ProjectModule(this.projectService, getPortfolioData, isOwnerCheck, requestOwnerLogin);
    this.archiveModule = new ArchiveModule(this.archiveService, getPortfolioData, isOwnerCheck, requestOwnerLogin);
    this.processModule = new ProcessModule(this.processService, getPortfolioData, isOwnerCheck, requestOwnerLogin);

    this.authModal = new AuthModal(
      this.authService,
      () => this.onAuthStateChanged(),
      () => this.migrationTool.showMigrationDialog()
    );

    this.backupModule = new BackupModule(
      getPortfolioData,
      async (incoming) => {
        await this.api.updatePortfolio(incoming);
        this.data = incoming;
        this.renderAll();
      },
      isOwnerCheck,
      requestOwnerLogin
    );

    this.migrationTool = new MigrationTool(
      getPortfolioData,
      async (incoming) => {
        await this.api.updatePortfolio(incoming);
        this.data = incoming;
        this.renderAll();
      },
      isOwnerCheck,
      requestOwnerLogin
    );

    // 6. Start modules
    this.readingsModule.init();
    this.projectModule.init();
    this.archiveModule.init();
    this.processModule.init();
    this.authModal.init();
    this.backupModule.init();

    // 7. Bind editor workspace button & choose reading
    this._bindEditorWorkspace();

    if (isLocalFallback && config.backendProvider === 'supabase') {
      console.info('Supabase credentials not configured in window.__ENV__. Operating in local mode.');
    }
  }

  onAuthStateChanged() {
    this.renderAll();
  }

  renderAll() {
    this.readingsModule.renderReadings();
    this.projectModule.renderProject();
    this.archiveModule.renderArchive();
  }

  _bindEditorWorkspace() {
    document.addEventListener('click', (e) => {
      const editorBtn = e.target.closest('[data-action="editor"]');
      if (editorBtn) {
        this.showEditorWorkspace();
        return;
      }

      const chooseReadingBtn = e.target.closest('[data-action="choose-reading"]');
      if (chooseReadingBtn) {
        this.showChooseReading();
        return;
      }
    });
  }

  showEditorWorkspace() {
    const isOwner = this.authService.isOwner();
    const isAuth = this.authService.isAuthenticated();

    dialog.open(
      'YOUR PORTFOLIO WORKSPACE',
      'Make this space your own',
      `<p class="form-help">
        ${isOwner
          ? '<span class="accent">● Signed in as Owner</span> — Any edits you make and save will immediately update the cloud database for all visitors.'
          : 'Public visitors have read-only view. Sign in as the designated owner to make and save changes.'}
       </p>
       <div class="editor-choices">
         <button class="editor-choice" data-action="choose-reading">
           ${icon('book')}<strong>Reading journal</strong>
           <span>Add scans, analysis, class notes, and learning summaries.</span>
         </button>
         <button class="editor-choice" data-action="project-edit">
           ${icon('map')}<strong>Project proposal</strong>
           <span>Define the site, question, method, team, and objectives.</span>
         </button>
         <button class="editor-choice" data-action="archive-add">
           ${icon('grid')}<strong>Archive record</strong>
           <span>Add original material with its context and attribution.</span>
         </button>
         <button class="editor-choice" data-action="process-edit">
           ${icon('notes')}<strong>Process journal</strong>
           <span>Document meetings, contributions, and reflection.</span>
         </button>
       </div>
       <div class="edit-bottom">
         <button class="btn primary small" data-action="download">${icon('download', 'sm')} Download HTML</button>
         <button class="btn small" data-action="backup">Export data</button>
         <button class="btn small" id="import-button">Import data</button>
         <input type="file" id="import-file" accept="application/json,.json" hidden>
         ${isOwner
           ? `<button class="btn small" data-action="auth-status">${icon('shield', 'sm')} Owner Status</button>`
           : `<button class="btn small" data-action="owner-login">${icon('shield', 'sm')} Owner Sign In</button>`}
         <button class="btn small" data-action="acknowledgements">Acknowledgements</button>
       </div>
       <p class="small-notice">Export data creates a JSON backup. Import restores a compatible backup after confirmation. Download HTML produces a self-contained, portable offline copy.</p>`
    );
  }

  showChooseReading() {
    dialog.open(
      'YOUR READING JOURNAL',
      'Choose a reading to edit',
      `<div class="source-list">
        ${readings.map(r => `
          <div class="source-item">
            <p class="eyebrow">UNIT 0${r.unit} / ${esc(r.author)}</p>
            <button class="link-btn" style="text-align:left" data-reading-edit="${r.id}">
              ${esc(r.title)} ${icon('up-right', 'sm')}
            </button>
          </div>
        `).join('')}
      </div>`
    );
  }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioApp();
  app.start().catch(err => {
    console.error('Failed to start portfolio app:', err);
  });
});
