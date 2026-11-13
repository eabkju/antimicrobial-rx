/**
 * AntimicrobialRx - Multi-Theme & Visually Distinct Clinical Decision Support
 * 100% Offline & Standalone
 * 3-Tier Navigation with Auto-Closing Topic Selection & 5 Color Themes
 */

(function () {
  'use strict';

  // --- App State ---
  const state = {
    protocols: [],
    activeTab: 'conditions', // 'conditions' | 'drugs' | 'orderpad'
    selectedSystem: 'ALL',
    selectedSubsystem: 'ALL',
    selectedPopulation: 'ALL', // 'ALL' | 'ADULT' | 'PAED'
    selectedTopicId: null, // Specific disease protocol focused
    searchQuery: '',
    expandedSystems: new Set(),
    selectedDrug: null,
    recentSearches: [],
    orderPad: [],
    colorTheme: 'teal',
    isDarkMode: false,
    sidebarOpen: false,
    deferredPrompt: null
  };

  // --- DOM Elements ---
  const dom = {
    // Nav & Tabs
    tabConditions: document.getElementById('tab-conditions'),
    tabDrugs: document.getElementById('tab-drugs'),
    tabOrderpad: document.getElementById('tab-orderpad'),
    mobTabConditions: document.getElementById('mob-tab-conditions'),
    mobTabDrugs: document.getElementById('mob-tab-drugs'),
    mobTabOrderpad: document.getElementById('mob-tab-orderpad'),
    viewConditions: document.getElementById('view-conditions'),
    viewDrugs: document.getElementById('view-drugs'),
    viewOrderpad: document.getElementById('view-orderpad'),
    colorThemeSelect: document.getElementById('color-theme-select'),
    themeToggle: document.getElementById('theme-toggle'),
    installPwaBtn: document.getElementById('install-pwa-btn'),
    orderpadBadge: document.getElementById('orderpad-badge-count'),
    mobOrderpadBadge: document.getElementById('mob-orderpad-badge-count'),

    // Sidebar & Navigation Controls
    toggleSidebarBtn: document.getElementById('toggle-sidebar-btn'),
    openTopicsBtn: document.getElementById('open-topics-btn'),
    sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    appSidebar: document.getElementById('app-sidebar'),
    sidebarToggleText: document.getElementById('sidebar-toggle-text'),
    popSwitch: document.getElementById('population-switch'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    sidebarTree: document.getElementById('sidebar-tree-container'),
    totalProtocolsBadge: document.getElementById('total-protocols-badge'),

    // Search & Breadcrumbs
    searchInput: document.getElementById('global-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    recentBox: document.getElementById('recent-searches-box'),
    recentChips: document.getElementById('recent-chips-list'),
    clearRecentAll: document.getElementById('clear-recent-all'),
    contextBreadcrumb: document.getElementById('context-breadcrumb'),
    contextCount: document.getElementById('context-count'),

    // Views Content
    cardsContainer: document.getElementById('cards-container'),
    drugPillsList: document.getElementById('drug-pills-list'),
    drugIndications: document.getElementById('drug-indications-container'),
    orderpadList: document.getElementById('orderpad-items-list'),
    copyAllPadBtn: document.getElementById('copy-all-pad-orders'),
    clearAllPadBtn: document.getElementById('clear-all-pad-orders'),

    // Toast
    toast: document.getElementById('app-toast'),
    toastText: document.getElementById('toast-text')
  };

  // --- Initialization ---
  function init() {
    loadLocalPreferences();
    setupEvents();
    loadDataset();
    renderSidebarTree();
    renderRecentSearches();
    render();
  }

  // --- Preferences & Theme Loading ---
  function loadLocalPreferences() {
    try {
      // Color Theme
      const savedColorTheme = localStorage.getItem('am_rx_color_theme') || 'teal';
      state.colorTheme = savedColorTheme;
      document.documentElement.setAttribute('data-theme', savedColorTheme);
      if (dom.colorThemeSelect) dom.colorThemeSelect.value = savedColorTheme;

      // Dark Mode
      const savedTheme = localStorage.getItem('am_rx_dark_mode');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        state.isDarkMode = true;
        document.documentElement.classList.add('dark');
      } else {
        state.isDarkMode = false;
        document.documentElement.classList.remove('dark');
      }

      // Recents & Order Pad
      const recents = localStorage.getItem('am_rx_recents');
      if (recents) state.recentSearches = JSON.parse(recents);

      const pad = localStorage.getItem('am_rx_orderpad');
      if (pad) {
        state.orderPad = JSON.parse(pad);
        updateOrderPadBadge();
      }
    } catch (e) {
      console.warn('Storage preference error:', e);
    }
  }

  // --- Load Dataset ---
  function loadDataset() {
    if (window.ANTIBIOTIC_DATA && Array.isArray(window.ANTIBIOTIC_DATA)) {
      state.protocols = window.ANTIBIOTIC_DATA;
    }
    if (dom.totalProtocolsBadge) {
      dom.totalProtocolsBadge.textContent = state.protocols.length;
    }
  }

  // --- Event Listeners ---
  function setupEvents() {
    // Tab switching (Desktop + Mobile)
    dom.tabConditions.addEventListener('click', () => switchTab('conditions'));
    dom.tabDrugs.addEventListener('click', () => switchTab('drugs'));
    dom.tabOrderpad.addEventListener('click', () => switchTab('orderpad'));

    if (dom.mobTabConditions) dom.mobTabConditions.addEventListener('click', () => switchTab('conditions'));
    if (dom.mobTabDrugs) dom.mobTabDrugs.addEventListener('click', () => switchTab('drugs'));
    if (dom.mobTabOrderpad) dom.mobTabOrderpad.addEventListener('click', () => switchTab('orderpad'));

    // Theme selector
    if (dom.colorThemeSelect) {
      dom.colorThemeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        state.colorTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('am_rx_color_theme', theme);
        showToast(`Theme updated: ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    // Dark/Light toggle
    dom.themeToggle.addEventListener('click', () => {
      state.isDarkMode = !state.isDarkMode;
      document.documentElement.classList.toggle('dark', state.isDarkMode);
      localStorage.setItem('am_rx_dark_mode', state.isDarkMode ? 'dark' : 'light');
    });

    // PWA Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredPrompt = e;
      if (dom.installPwaBtn) dom.installPwaBtn.style.display = 'inline-flex';
    });

    if (dom.installPwaBtn) {
      dom.installPwaBtn.addEventListener('click', async () => {
        if (!state.deferredPrompt) return;
        state.deferredPrompt.prompt();
        const { outcome } = await state.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          dom.installPwaBtn.style.display = 'none';
        }
        state.deferredPrompt = null;
      });
    }

    // Sidebar Toggles
    const openSidebar = () => {
      state.sidebarOpen = true;
      dom.appSidebar.classList.remove('collapsed');
      dom.appSidebar.classList.add('mobile-open');
      dom.sidebarBackdrop.classList.add('active');
      if (dom.sidebarToggleText) dom.sidebarToggleText.textContent = '✕ Close Navigator';
    };

    const closeSidebar = () => {
      state.sidebarOpen = false;
      dom.appSidebar.classList.add('collapsed');
      dom.appSidebar.classList.remove('mobile-open');
      dom.sidebarBackdrop.classList.remove('active');
      if (dom.sidebarToggleText) dom.sidebarToggleText.textContent = '📂 Browse Topics';
    };

    dom.toggleSidebarBtn.addEventListener('click', () => {
      if (state.sidebarOpen) closeSidebar();
      else openSidebar();
    });

    if (dom.openTopicsBtn) {
      dom.openTopicsBtn.addEventListener('click', openSidebar);
    }

    if (dom.sidebarCloseBtn) {
      dom.sidebarCloseBtn.addEventListener('click', closeSidebar);
    }

    if (dom.sidebarBackdrop) {
      dom.sidebarBackdrop.addEventListener('click', closeSidebar);
    }

    // Population switch in sidebar
    dom.popSwitch.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-pop]');
      if (!btn) return;
      state.selectedPopulation = btn.dataset.pop;
      dom.popSwitch.querySelectorAll('.pop-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSidebarTree();
      render();
    });

    // Reset filters
    dom.resetFiltersBtn.addEventListener('click', () => {
      state.selectedSystem = 'ALL';
      state.selectedSubsystem = 'ALL';
      state.selectedTopicId = null;
      state.searchQuery = '';
      dom.searchInput.value = '';
      dom.clearSearchBtn.style.display = 'none';
      renderSidebarTree();
      render();
      closeSidebar();
    });

    // Search Input
    let searchTimer;
    dom.searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.searchQuery = val;
      state.selectedTopicId = null; // Clear individual topic selection when searching
      dom.clearSearchBtn.style.display = val ? 'block' : 'none';

      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        if (val.trim().length >= 3) {
          saveRecentSearch(val.trim());
        }
        render();
      }, 150);
    });

    dom.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && state.searchQuery.trim()) {
        saveRecentSearch(state.searchQuery.trim());
        render();
      }
    });

    dom.clearSearchBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      state.searchQuery = '';
      state.selectedTopicId = null;
      dom.clearSearchBtn.style.display = 'none';
      dom.searchInput.focus();
      render();
    });

    // Clear Recents
    dom.clearRecentAll.addEventListener('click', () => {
      state.recentSearches = [];
      localStorage.removeItem('am_rx_recents');
      renderRecentSearches();
    });

    // Order Pad Actions
    dom.clearAllPadBtn.addEventListener('click', () => {
      if (!state.orderPad.length) return;
      if (confirm('Clear all orders from your Prescription Order Pad?')) {
        state.orderPad = [];
        localStorage.removeItem('am_rx_orderpad');
        updateOrderPadBadge();
        renderOrderPadView();
        showToast('Prescription Order Pad cleared.');
      }
    });

    dom.copyAllPadBtn.addEventListener('click', () => {
      if (!state.orderPad.length) return;
      const allText = state.orderPad
        .map((item, idx) => `[${idx + 1}] ${item.condition}:\n    ${item.order}`)
        .join('\n\n');
      copyToClipboard(allText, 'All orders copied to clipboard!');
    });

    // Global keyboard shortcut ('/' focuses search)
    window.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== dom.searchInput) {
        e.preventDefault();
        dom.searchInput.focus();
      } else if (e.key === 'Escape') {
        if (state.sidebarOpen) closeSidebar();
        else if (document.activeElement === dom.searchInput) dom.searchInput.blur();
      }
    });
  }

  // --- Switch Tabs ---
  function switchTab(tabName) {
    state.activeTab = tabName;
    const tabs = [
      { name: 'conditions', btn: dom.tabConditions, mobBtn: dom.mobTabConditions, view: dom.viewConditions },
      { name: 'drugs', btn: dom.tabDrugs, mobBtn: dom.mobTabDrugs, view: dom.viewDrugs },
      { name: 'orderpad', btn: dom.tabOrderpad, mobBtn: dom.mobTabOrderpad, view: dom.viewOrderpad }
    ];

    tabs.forEach(t => {
      if (t.name === tabName) {
        if (t.btn) t.btn.classList.add('active');
        if (t.mobBtn) t.mobBtn.classList.add('active');
        t.view.style.display = 'block';
      } else {
        if (t.btn) t.btn.classList.remove('active');
        if (t.mobBtn) t.mobBtn.classList.remove('active');
        t.view.style.display = 'none';
      }
    });

    // Scroll to top on tab switch for smooth feel
    window.scrollTo({ top: 0, behavior: 'smooth' });

    render();
  }

  // --- Render Sidebar Tree with Topics ---
  function renderSidebarTree() {
    const pop = state.selectedPopulation;
    const filteredByPop = state.protocols.filter(p => {
      if (pop === 'ADULT' && p.is_paediatric) return false;
      if (pop === 'PAED' && !p.is_paediatric) return false;
      return true;
    });

    // Build hierarchy: System -> Subsystem -> Protocols
    const hierarchy = new Map();
    filteredByPop.forEach(p => {
      const sys = p.system;
      const sub = p.subsystem;
      const icon = p.system_icon || '📋';

      if (!hierarchy.has(sys)) {
        hierarchy.set(sys, { icon, total: 0, subsystems: new Map() });
      }
      const sysObj = hierarchy.get(sys);
      sysObj.total++;

      if (!sysObj.subsystems.has(sub)) {
        sysObj.subsystems.set(sub, []);
      }
      sysObj.subsystems.get(sub).push(p);
    });

    let treeHtml = '';
    hierarchy.forEach((sysObj, sysName) => {
      const isSystemActive = state.selectedSystem === sysName;
      const isExpanded = state.expandedSystems.has(sysName) || isSystemActive;

      let subsHtml = '';
      if (isExpanded) {
        subsHtml = '<div class="subsystems-list">';
        sysObj.subsystems.forEach((items, subName) => {
          const isSubActive = isSystemActive && state.selectedSubsystem === subName;
          
          let topicsListHtml = '<div class="topic-items-list">';
          items.forEach(p => {
            const isTopicSelected = state.selectedTopicId === p.id;
            topicsListHtml += `
              <button type="button" class="topic-item-btn" data-topic-id="${p.id}" style="${isTopicSelected ? 'background-color: var(--primary-bg); color: var(--primary-text); font-weight: 700;' : ''}">
                <span class="topic-bullet">▸</span>
                <span>${escapeHtml(p.condition)}</span>
              </button>
            `;
          });
          topicsListHtml += '</div>';

          subsHtml += `
            <div class="subsystem-block">
              <button type="button" class="subsystem-title-btn" data-sys-filter="${escapeHtml(sysName)}" data-sub-filter="${escapeHtml(subName)}">
                <span>📁 ${escapeHtml(subName)}</span>
                <span style="font-size: 0.65rem; opacity: 0.8;">(${items.length})</span>
              </button>
              ${topicsListHtml}
            </div>
          `;
        });
        subsHtml += '</div>';
      }

      treeHtml += `
        <div class="tree-system-item ${isExpanded ? 'expanded' : ''}">
          <button type="button" class="tree-system-header ${isSystemActive ? 'active' : ''}" data-sys-expand="${escapeHtml(sysName)}">
            <div class="system-title-group">
              <span class="system-icon">${sysObj.icon}</span>
              <span class="system-name">${escapeHtml(sysName)}</span>
            </div>
            <span class="system-badge">${sysObj.total}</span>
          </button>
          ${subsHtml}
        </div>
      `;
    });

    dom.sidebarTree.innerHTML = treeHtml;

    // Attach tree event listeners
    // 1. System header: expands/collapses system (keeps sidebar open)
    dom.sidebarTree.querySelectorAll('[data-sys-expand]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sys = btn.dataset.sysExpand;
        if (state.expandedSystems.has(sys)) {
          state.expandedSystems.delete(sys);
        } else {
          state.expandedSystems.add(sys);
        }
        renderSidebarTree();
      });
    });

    // 2. Subsystem filter header: filters main view to subsystem (keeps sidebar open)
    dom.sidebarTree.querySelectorAll('[data-sub-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedSystem = btn.dataset.sysFilter;
        state.selectedSubsystem = btn.dataset.subFilter;
        state.selectedTopicId = null;
        renderSidebarTree();
        render();
      });
    });

    // 3. FINAL TOPIC SELECTION: Click individual disease -> closes sidebar and opens selected topic!
    dom.sidebarTree.querySelectorAll('[data-topic-id]').forEach(topicBtn => {
      topicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const topicId = topicBtn.dataset.topicId;
        const targetProtocol = state.protocols.find(p => p.id === topicId);
        if (targetProtocol) {
          state.selectedTopicId = topicId;
          state.selectedSystem = targetProtocol.system;
          state.selectedSubsystem = targetProtocol.subsystem;
          state.searchQuery = '';
          dom.searchInput.value = '';
          dom.clearSearchBtn.style.display = 'none';

          // Close sidebar and backdrop (as requested: "after final selection close the sidebar and open the selected topic")
          closeSidebarAction();

          // Render selected topic
          render();

          // Scroll smoothly to the focused card and apply highlight pulse
          setTimeout(() => {
            const cardEl = document.querySelector(`.clinical-card[data-id="${topicId}"]`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              cardEl.classList.add('card-highlight-flash');
              setTimeout(() => cardEl.classList.remove('card-highlight-flash'), 1800);
            }
          }, 100);
        }
      });
    });
  }

  function closeSidebarAction() {
    state.sidebarOpen = false;
    dom.appSidebar.classList.add('collapsed');
    dom.appSidebar.classList.remove('mobile-open');
    dom.sidebarBackdrop.classList.remove('active');
    if (dom.sidebarToggleText) dom.sidebarToggleText.textContent = '📂 Browse Topics';
  }

  // --- Filter Protocols ---
  function getFilteredProtocols() {
    // If a specific individual topic was selected from sidebar
    if (state.selectedTopicId) {
      const single = state.protocols.filter(p => p.id === state.selectedTopicId);
      if (single.length) return single;
    }

    const q = state.searchQuery.toLowerCase().trim();
    const sys = state.selectedSystem;
    const sub = state.selectedSubsystem;
    const pop = state.selectedPopulation;

    return state.protocols.filter(p => {
      // Population filter
      if (pop === 'ADULT' && p.is_paediatric) return false;
      if (pop === 'PAED' && !p.is_paediatric) return false;

      // System filter
      if (sys !== 'ALL' && p.system !== sys) return false;

      // Subsystem filter
      if (sub !== 'ALL' && p.subsystem !== sub) return false;

      // Search Query
      if (!q) return true;

      if (p.condition.toLowerCase().includes(q)) return true;
      if (p.code && p.code.toLowerCase().includes(q)) return true;
      if (p.subsystem.toLowerCase().includes(q)) return true;
      if (p.system.toLowerCase().includes(q)) return true;
      if (p.causative_agents && p.causative_agents.some(a => a.toLowerCase().includes(q))) return true;
      if (p.drugs && p.drugs.some(d => d.toLowerCase().includes(q))) return true;
      if (p.preferred_raw && p.preferred_raw.toLowerCase().includes(q)) return true;
      if (p.alternative_raw && p.alternative_raw.toLowerCase().includes(q)) return true;

      return false;
    });
  }

  // --- Render Orchestrator ---
  function render() {
    updateContextBar();

    if (state.activeTab === 'conditions') {
      renderConditionsView();
    } else if (state.activeTab === 'drugs') {
      renderDrugIndexView();
    } else if (state.activeTab === 'orderpad') {
      renderOrderPadView();
    }
  }

  // --- Update Breadcrumb & Context ---
  function updateContextBar() {
    let breadcrumbHtml = '<span>Clinical Guidelines</span>';

    if (state.selectedTopicId) {
      const p = state.protocols.find(i => i.id === state.selectedTopicId);
      if (p) {
        breadcrumbHtml += `<span class="context-separator">›</span> <span>${escapeHtml(p.system)}</span>`;
        breadcrumbHtml += `<span class="context-separator">›</span> <span>${escapeHtml(p.subsystem)}</span>`;
        breadcrumbHtml += `<span class="context-separator">›</span> <span style="color: var(--primary); font-weight: 700;">${escapeHtml(p.condition)}</span>`;
      }
    } else {
      if (state.selectedSystem !== 'ALL') {
        breadcrumbHtml += `<span class="context-separator">›</span> <span>${escapeHtml(state.selectedSystem)}</span>`;
      }
      if (state.selectedSubsystem !== 'ALL') {
        breadcrumbHtml += `<span class="context-separator">›</span> <span style="color: var(--primary); font-weight: 700;">${escapeHtml(state.selectedSubsystem)}</span>`;
      }
      if (state.searchQuery) {
        breadcrumbHtml += `<span class="context-separator">›</span> <span>Search: "${escapeHtml(state.searchQuery)}"</span>`;
      }
    }

    dom.contextBreadcrumb.innerHTML = breadcrumbHtml;

    const filtered = getFilteredProtocols();
    dom.contextCount.textContent = `Showing ${filtered.length} protocol${filtered.length === 1 ? '' : 's'}`;
  }

  // --- Render Conditions View with Distinct Cards ---
  function renderConditionsView() {
    const protocols = getFilteredProtocols();

    if (!protocols.length) {
      dom.cardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
          <div style="font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">No matching clinical protocols found</div>
          <div style="font-size: 0.8125rem; margin-bottom: 1.25rem;">Try searching another keyword or clearing current filters.</div>
          <button type="button" style="padding: 0.5rem 1.25rem; border-radius: 0.5rem; background-color: var(--primary); color: #ffffff; font-size: 0.8125rem; font-weight: 700;" onclick="document.getElementById('reset-filters-btn').click()">
            Show All Protocols
          </button>
        </div>
      `;
      return;
    }

    dom.cardsContainer.innerHTML = protocols.map(p => renderClinicalCard(p)).join('');

    // Attach copy button listeners
    dom.cardsContainer.querySelectorAll('.copy-order-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const orderText = btn.dataset.order;
        const condition = btn.dataset.cond;
        recordAndCopyOrder(orderText, condition);
      });
    });
  }

  // --- Render Individual Visually Distinct Clinical Card ---
  function renderClinicalCard(p) {
    const isPaed = p.is_paediatric;
    const condTitle = highlight(p.condition, state.searchQuery);
    const themeTag = p.theme_tag || 'resp';

    // Pathogens chips
    let pathogensHtml = '';
    if (p.causative_agents && p.causative_agents.length) {
      pathogensHtml = `
        <div class="pathogens-block">
          <span class="pathogens-label">Likely Causative Pathogens:</span>
          <div class="pathogen-chips">
            ${p.causative_agents.map(a => `<span class="pathogen-chip">${escapeHtml(a)}</span>`).join('')}
          </div>
        </div>
      `;
    }

    // Preferred Regimen Orders
    const prefOrdersHtml = renderOrdersBlock(p.preferred_orders, p.preferred_raw, p.condition);

    // Alternative Regimen Orders
    const altOrdersHtml = renderOrdersBlock(p.alternative_orders, p.alternative_raw, p.condition);

    return `
      <article class="clinical-card theme-${themeTag}" data-id="${p.id}">
        <!-- Distinct Header with System Identity & Code -->
        <div class="card-header">
          <div class="card-meta-row">
            <div class="meta-badges">
              <span class="badge-code">${p.code || 'RX'}</span>
              <span class="badge-system">${p.system_icon || '🩺'} ${escapeHtml(p.subsystem || p.system)}</span>
              ${isPaed ? `<span class="badge-pop-paed">👶 Paediatric</span>` : `<span class="badge-pop-adult">Adult</span>`}
            </div>
          </div>
          <h3 class="condition-title">${condTitle}</h3>
          ${pathogensHtml}
        </div>

        <!-- Mandatory Route & Dose Safety Callout -->
        <div class="route-caution-callout">
          <span class="caution-icon">⚠️</span>
          <div class="caution-text">
            <strong>Prescriber Route & Dose Caution:</strong> Verify and specify suitable administration route (IV infusion/bolus, IM, or Oral) and check renal/hepatic dose titration manually before prescribing.
          </div>
        </div>

        <!-- Regimens Body -->
        <div class="card-body">
          <!-- Preferred Regimen (1st Line) -->
          <div class="regimen-section regimen-preferred">
            <div class="regimen-header">
              <div class="regimen-badge">
                <span class="regimen-indicator"></span>
                <span>Preferred Regimen (1st Line)</span>
              </div>
            </div>
            <div class="orders-list">
              ${prefOrdersHtml}
            </div>
          </div>

          <!-- Alternative Regimen (2nd Line / Allergy / Resistant) -->
          <div class="regimen-section regimen-alternative">
            <div class="regimen-header">
              <div class="regimen-badge">
                <span class="regimen-indicator"></span>
                <span>Alternative Regimen (2nd Line / Allergy / Resistant)</span>
              </div>
            </div>
            <div class="orders-list">
              ${altOrdersHtml}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // --- Render Medication Order Lines with Copy Button ---
  function renderOrdersBlock(orders, rawFallback, conditionName) {
    if (orders && orders.length) {
      return orders.map(ord => {
        const highlighted = highlight(ord, state.searchQuery);
        return `
          <div class="order-row">
            <div class="order-text">${highlighted}</div>
            <button type="button" class="copy-order-btn" data-order="${escapeHtml(ord)}" data-cond="${escapeHtml(conditionName)}" title="Copy formatted prescription order to clipboard">
              <span>📋</span>
              <span>Copy</span>
            </button>
          </div>
        `;
      }).join('');
    } else if (rawFallback) {
      const highlighted = highlight(rawFallback, state.searchQuery);
      return `
        <div class="order-row">
          <div class="order-text" style="white-space: pre-line;">${highlighted}</div>
          <button type="button" class="copy-order-btn" data-order="${escapeHtml(rawFallback)}" data-cond="${escapeHtml(conditionName)}">
            <span>📋</span>
            <span>Copy</span>
          </button>
        </div>
      `;
    }
    return `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No specific antimicrobial order recorded.</div>`;
  }

  // --- Drug Index View ---
  function renderDrugIndexView() {
    const drugMap = new Map();
    state.protocols.forEach(p => {
      if (p.drugs && p.drugs.length) {
        p.drugs.forEach(d => {
          if (!drugMap.has(d)) drugMap.set(d, []);
          drugMap.get(d).push(p);
        });
      }
    });

    const sortedDrugs = Array.from(drugMap.keys()).sort((a, b) => a.localeCompare(b));
    const activeDrug = state.selectedDrug || sortedDrugs[0];
    const protocols = drugMap.get(activeDrug) || [];

    // Render drug chips
    dom.drugPillsList.innerHTML = sortedDrugs.map(d => {
      const isSel = d === activeDrug;
      const count = drugMap.get(d).length;
      return `
        <button type="button" class="recent-chip" style="${isSel ? 'background-color: var(--primary); color: #ffffff; border-color: var(--primary); font-weight: 700;' : ''}" data-drug-select="${escapeHtml(d)}">
          ${escapeHtml(d)} <span style="opacity: 0.8; font-size: 0.65rem;">(${count})</span>
        </button>
      `;
    }).join('');

    // Render Indications
    dom.drugIndications.innerHTML = `
      <div style="margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 1.125rem; font-weight: 800; color: var(--text-main);">
          💊 ${escapeHtml(activeDrug)}
          <span style="font-size: 0.8125rem; font-weight: 500; color: var(--text-muted); margin-left: 0.5rem;">
            Recommended in ${protocols.length} clinical indication${protocols.length === 1 ? '' : 's'}
          </span>
        </h3>
      </div>
      <div class="cards-grid">
        ${protocols.map(p => renderClinicalCard(p)).join('')}
      </div>
    `;

    // Attach listeners
    dom.drugPillsList.querySelectorAll('[data-drug-select]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedDrug = btn.dataset.drugSelect;
        renderDrugIndexView();
      });
    });

    dom.drugIndications.querySelectorAll('.copy-order-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        recordAndCopyOrder(btn.dataset.order, btn.dataset.cond);
      });
    });
  }

  // --- Order Pad View ---
  function renderOrderPadView() {
    if (!state.orderPad.length) {
      dom.orderpadList.innerHTML = `
        <div style="padding: 3rem 1rem; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📋</div>
          <div style="font-size: 1.125rem; font-weight: 700; color: var(--text-main);">Prescription Order Pad is empty</div>
          <div style="font-size: 0.8125rem; margin-top: 0.25rem;">Click the "Copy" button on any medication order to save it here for quick hospital EHR charting.</div>
        </div>
      `;
      dom.copyAllPadBtn.disabled = true;
      dom.clearAllPadBtn.disabled = true;
      return;
    }

    dom.copyAllPadBtn.disabled = false;
    dom.clearAllPadBtn.disabled = false;

    dom.orderpadList.innerHTML = state.orderPad.map((item, idx) => `
      <div class="order-row" style="padding: 0.75rem 1rem;">
        <div style="flex: 1;">
          <div style="font-size: 0.6875rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 0.2rem;">
            #${idx + 1} • ${escapeHtml(item.condition)}
          </div>
          <div class="order-text" style="font-size: 0.8125rem;">
            ${escapeHtml(item.order)}
          </div>
          <div style="font-size: 0.65rem; color: var(--text-subtle); margin-top: 0.25rem;">
            Recorded: ${new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div style="display: flex; gap: 0.35rem; align-items: center;">
          <button type="button" class="copy-order-btn" data-pad-copy="${escapeHtml(item.order)}">
            Copy
          </button>
          <button type="button" class="icon-btn" data-pad-delete="${idx}" title="Remove order" style="color: #ef4444;">
            ✕
          </button>
        </div>
      </div>
    `).join('');

    // Attach listeners
    dom.orderpadList.querySelectorAll('[data-pad-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        copyToClipboard(btn.dataset.padCopy, 'Order copied!');
      });
    });

    dom.orderpadList.querySelectorAll('[data-pad-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.padDelete, 10);
        state.orderPad.splice(idx, 1);
        localStorage.setItem('am_rx_orderpad', JSON.stringify(state.orderPad));
        updateOrderPadBadge();
        renderOrderPadView();
      });
    });
  }

  // --- Copy & Record Prescription Order ---
  function recordAndCopyOrder(orderText, conditionName) {
    if (!orderText) return;

    copyToClipboard(orderText, `Copied: "${orderText.slice(0, 45)}${orderText.length > 45 ? '...' : ''}"`);

    // Record in Order Pad
    const exists = state.orderPad.find(o => o.order === orderText);
    if (!exists) {
      state.orderPad.unshift({
        order: orderText,
        condition: conditionName || 'General Order',
        time: new Date().toISOString()
      });
      if (state.orderPad.length > 30) state.orderPad = state.orderPad.slice(0, 30);
      localStorage.setItem('am_rx_orderpad', JSON.stringify(state.orderPad));
      updateOrderPadBadge();
    }
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      showToast('Copy failed. Please manually copy.');
    }
    document.body.removeChild(ta);
  }

  function updateOrderPadBadge() {
    const count = state.orderPad.length;
    if (dom.orderpadBadge) dom.orderpadBadge.textContent = count;
    if (dom.mobOrderpadBadge) dom.mobOrderpadBadge.textContent = count;
  }

  // --- Recent Searches ---
  function saveRecentSearch(query) {
    if (!query || query.length < 2) return;
    let list = state.recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
    list.unshift(query);
    if (list.length > 7) list = list.slice(0, 7);
    state.recentSearches = list;
    localStorage.setItem('am_rx_recents', JSON.stringify(list));
    renderRecentSearches();
  }

  function renderRecentSearches() {
    if (!state.recentSearches.length) {
      dom.recentBox.style.display = 'none';
      return;
    }
    dom.recentBox.style.display = 'flex';
    dom.recentChips.innerHTML = state.recentSearches.map(q => `
      <div class="recent-chip" data-search-term="${escapeHtml(q)}">
        <span>${escapeHtml(q)}</span>
        <span class="chip-remove" data-remove-term="${escapeHtml(q)}">×</span>
      </div>
    `).join('');

    dom.recentChips.querySelectorAll('[data-search-term]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.closest('[data-remove-term]')) return;
        const term = chip.dataset.searchTerm;
        dom.searchInput.value = term;
        state.searchQuery = term;
        state.selectedTopicId = null;
        dom.clearSearchBtn.style.display = 'block';
        render();
      });
    });

    dom.recentChips.querySelectorAll('[data-remove-term]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const term = btn.dataset.removeTerm;
        state.recentSearches = state.recentSearches.filter(q => q !== term);
        localStorage.setItem('am_rx_recents', JSON.stringify(state.recentSearches));
        renderRecentSearches();
      });
    });
  }

  // --- Toast ---
  let toastTimer;
  function showToast(msg) {
    dom.toastText.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 2600);
  }

  // --- Utilities ---
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlight(text, q) {
    if (!text) return '';
    if (!q || q.trim().length < 2) return escapeHtml(text);
    const regex = new RegExp(`(${q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark style="background-color: #fde047; color: #1e293b; padding: 0 2px; border-radius: 2px;">$1</mark>');
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
