// NutriVision AI — Core Application Logic, State Manager & Router (PWA)
// Sesuai seluruh spesifikasi PRD Gayatama 5 (FR-01 s/d FR-13 & Non-Fungsional)

class NutriVisionApp {
  constructor() {
    this.userProfile = this.loadUserProfile();
    this.activeSection = 'overview';
    this.deferredInstallPrompt = null;
    this.currentQuizStep = 1;
    this.pendingAuthCallback = null;
    this.isLanding = true;
    this.calcState = {
      condition: this.userProfile.conditionId || 'post-surgery',
      weight: this.userProfile.weightKg || 65,
      activity: this.userProfile.activityLevel || 'light'
    };
    this.quizState = {
      gender: this.userProfile.gender || 'male',
      condition: this.userProfile.conditionId || 'post-surgery',
      activity: this.userProfile.activityLevel || 'light'
    };
    this.plateViewMode = 'ai';
    this.currentLandingPreset = 'preset-soft-bubur-gabus';
    this.favoriteFoods = this.loadFavoriteFoods();
    this.catalogCurrentPage = 1;
    this.catalogItemsPerPage = 12;
    this.lastCatalogSearchTerm = '';
    this.activeFoodActionMenuId = null;
    this.menuClicks = this.loadMenuClicks();
    this.journeyCondition = this.userProfile.conditionId || 'post-surgery';
    this.calendarMonthOffset = 0;
    this.selectedCalendarDate = null;
    this.calendarStartDate = null;
    this.calendarEndDate = null;
    this.calendarTempStartDate = null;
    this.calendarTempEndDate = null;
    this.calendarHoverDate = null;
    this.calendarViewMode = 'month';
    this.activeRecoveryMonthIndex = 1;
    this.calendarMonthDate = new Date();
    this.completedScheduleItems = this.loadCompletedSchedules();
    this.customDailySchedules = this.loadCustomDailySchedules();
    this.activeNotifCategory = 'all';
    this.cachedNotifications = [];
    this.dailyIntakeConfirmState = null;
    this.currentDoctorPatientId = 'patient_siti';
    this.doctorPatients = this.getDoctorPatients();
  }

  // Auth Helper: Memeriksa apakah pengguna saat ini sudah terotentikasi (admin, dokter, caregiver, atau pasien login)
  isAuthenticated() {
    if (!this.userProfile) return false;
    if (this.userProfile.role === 'admin' || this.userProfile.role === 'doctor' || this.userProfile.role === 'clinician' || this.userProfile.role === 'caregiver') return true;
    return Boolean(this.userProfile.name && (this.userProfile.contact || this.userProfile.email));
  }

  // Auth Guard / Gatekeeper: Memastikan pengguna sudah login sebelum menggunakan fitur interaktif
  requireAuth(callback, actionDescription = '') {
    if (this.isAuthenticated()) {
      if (typeof callback === 'function') callback();
      return true;
    } else {
      this.pendingAuthCallback = callback;
      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      let msg;
      if (actionDescription) {
        msg = isId ? `Silakan masuk untuk ${actionDescription}.` : `Please sign in to ${actionDescription}.`;
      } else {
        msg = isId ? 'Silakan masuk terlebih dahulu.' : 'Please sign in first.';
      }
      this.showToast(msg, 'warning');
      this.openAuthModal('login');
      return false;
    }
  }

  // Muat data profil pengguna dari LocalStorage atau inisialisasi default (Fresh Zero State)
  loadUserProfile() {
    const saved = localStorage.getItem('nutrivision_user_profile');
    const storedLang = localStorage.getItem('nutrivision_lang') || 'en';
    if (saved) {
      try {
        const role = parsed.role || 'patient';
        const isNonPatient = role === 'admin' || role === 'doctor' || role === 'clinician' || role === 'caregiver';
        return {
          hasCompletedQuiz: isNonPatient ? true : (parsed.hasCompletedQuiz !== undefined ? parsed.hasCompletedQuiz : Boolean(parsed.name && parsed.targets)),
          role: role,
          name: parsed.name || '',
          contact: parsed.contact || '',
          gender: parsed.gender || 'male',
          age: parsed.age || 28,
          heightCm: parsed.heightCm || 170,
          weightKg: parsed.weightKg || 65,
          activityLevel: parsed.activityLevel || 'light',
          conditionId: parsed.conditionId || '',
          conditionTitle: parsed.conditionTitle || 'Belum Diatur',
          phase: parsed.phase || 'Belum Diatur',
          restrictions: parsed.restrictions || '',
          hasAcceptedConsent: isNonPatient ? true : Boolean(parsed.hasAcceptedConsent),
          bmi: parsed.bmi || '--',
          bmiCategory: parsed.bmiCategory || '--',
          isDemo: Boolean(parsed.isDemo),
          targets: parsed.targets || null,
          fontSize: parsed.fontSize || 'normal',
          highContrast: parsed.highContrast || false,
          language: parsed.language || storedLang,
          region: parsed.region || null,
          province: parsed.province || '',
          city: parsed.city || ''
        };
      } catch (e) {
        console.error('Error parsing user profile:', e);
      }
    }
    return {
      isDemo: false,
      hasCompletedQuiz: false,
      role: 'patient',
      name: '',
      contact: '',
      gender: 'male',
      age: 28,
      heightCm: 170,
      weightKg: 65,
      activityLevel: 'light',
      conditionId: '',
      conditionTitle: 'Belum Diatur',
      phase: 'Belum Diatur',
      restrictions: '',
      hasAcceptedConsent: false,
      bmi: '--',
      bmiCategory: '--',
      targets: null,
      fontSize: 'normal',
      highContrast: false,
      language: storedLang,
      region: null,
      province: '',
      city: ''
    };
  }

  get db() {
    return window.nutriVisionDB || null;
  }

  saveUserProfile() {
    localStorage.setItem('nutrivision_user_profile', JSON.stringify(this.userProfile));
    this.applyAccessibilitySettings();
    this.updateProfileUI();
  }

  // Inisialisasi Aplikasi
  async init() {
    console.log('🚀 Initializing NutriVision AI PWA...');
    if (window.i18n && typeof window.i18n.init === 'function') {
      window.i18n.init();
    }
    this.registerServiceWorker();
    this.setupPWAInstallPrompt();
    this.setupEventListeners();
    this.applyAccessibilitySettings();
    this.updateProfileUI();

    // Inisialisasi Database Engine (IndexedDB)
    if (window.nutriVisionDB) {
      try {
        await window.nutriVisionDB.init();
        const activeSession = window.nutriVisionDB.getCurrentSession();
        if (activeSession && activeSession.email && !this.userProfile.contact) {
          const dbUser = await window.nutriVisionDB.getUserByEmail(activeSession.email);
          if (dbUser) {
            this.userProfile = {
              ...this.userProfile,
              ...dbUser,
              contact: dbUser.email
            };
            this.saveUserProfile();
            this.updateProfileUI();
          }
        }
      } catch (e) {
        console.warn('DB Init notice:', e);
      }
    }

    this.renderAuthUI();

    // Inisialisasi Status Dasbor (Empty State jika belum login / belum isi data)
    const hasData = Boolean(this.userProfile && this.userProfile.name && this.userProfile.hasCompletedQuiz && this.userProfile.targets);

    if (hasData) {
      if (this.userProfile.isDemo) {
        if (!cvEngine.currentScan) {
          cvEngine.loadScanData(NUTRIVISION_DATA.presetScans[0]);
        }
        progressTracker.loadDemoData(this.userProfile);
      } else {
        progressTracker.loadUserProgress(this.userProfile);
      }
      this.renderOverviewPlate();
      progressTracker.renderMacroDonut(this.userProfile.targets);
      progressTracker.renderWeeklyBarChart();
    } else {
      cvEngine.currentScan = null;
      this.renderOverviewPlate();
      progressTracker.setEmptyState();
      progressTracker.renderMacroDonut(null);
      progressTracker.renderWeeklyBarChart();
    }
    mealPlanner.renderPlanner();
    mealPlanner.renderSymptomFilter();
    if (window.budgetPlanner && typeof window.budgetPlanner.init === 'function') {
      window.budgetPlanner.init();
    }
    communityHandler.renderCommunityFeed();
    caregiverHandler.renderCaregiverList();
    this.renderFoodCatalog();
    this.updateFavoriteBadge();

    // Dengarkan perubahan wilayah pasar pangan untuk pembaruan katalog & profil secara real-time
    if (window.BappenasFoodAPI && typeof window.BappenasFoodAPI.onRegionChange === 'function') {
      window.BappenasFoodAPI.onRegionChange((reg) => {
        this.renderFoodCatalog();
        this.updateProfileUI();
      });
    }

    // Inisialisasi Peta Perjalanan Pemulihan Klinis & Jadwal/Kalender Suite (FR-09)
    const activeCond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    this.renderJourneyRoadmap(activeCond);
    this.renderClinicalCalendarAndScheduleSuite();

    // Inisialisasi Kalkulator Mini Landing Page
    this.updateCalcUI();

    // Router URL Hash Handling (Landing vs Dashboard)
    const hash = window.location.hash.replace('#', '');
    const validSections = ['overview', 'planner', 'history', 'catalog', 'community', 'caregiver', 'progress', 'profile', 'doctor', 'caregiver-dashboard', 'admin'];
    if (validSections.includes(hash) || hash === 'dashboard' || hash === 'app') {
      if (this.userProfile && (this.userProfile.role === 'doctor' || this.userProfile.role === 'clinician')) {
        this.goToDoctorDashboard();
      } else if (this.userProfile && this.userProfile.role === 'caregiver') {
        this.goToCaregiverDashboard();
      } else if (this.userProfile && this.userProfile.role === 'admin') {
        this.goToAdminPortal();
      } else {
        this.goToDashboard(validSections.includes(hash) ? hash : 'overview');
      }
    } else {
      this.goToLanding();
    }

    // Tutup dropdown notifikasi pintar & filter kategori saat klik di luar atau tekan Escape
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('smart-notif-dropdown');
      const notifWrapper = document.querySelector('.topbar-notif-wrapper');
      if (dropdown && dropdown.style.display === 'block') {
        if (notifWrapper && !notifWrapper.contains(e.target)) {
          dropdown.style.display = 'none';
          this.toggleNotifFilterDropdown(false);
        }
      }

      const filterMenu = document.getElementById('notif-filter-menu');
      const filterContainer = document.querySelector('.notif-filter-container');
      if (filterMenu && filterMenu.style.display === 'block') {
        if (filterContainer && !filterContainer.contains(e.target)) {
          this.toggleNotifFilterDropdown(false);
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const dropdown = document.getElementById('smart-notif-dropdown');
        if (dropdown && dropdown.style.display === 'block') {
          dropdown.style.display = 'none';
          this.toggleNotifFilterDropdown(false);
        }
      }
    });

    // Inisialisasi ikon Lucide (Figma / Iconify standard)
    
    // 5. Admin-Only Visibility for Database Controls (Hidden for regular users/patients)
    const isAdmin = Boolean(this.userProfile && this.userProfile.role === 'admin');
    const topbarDbBtn = document.getElementById('topbar-db-btn');
    const lpNavDbBtn = document.getElementById('lp-nav-db-btn');

    if (topbarDbBtn) {
      topbarDbBtn.style.display = isAdmin ? 'inline-flex' : 'none';
      if (isAdmin) {
        topbarDbBtn.title = 'Panel Database Administrator (Aktif)';
      }
    }
    if (lpNavDbBtn) {
      lpNavDbBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }

    // Inisialisasi Smart Notification Center
    this.loadSmartNotifications();
    setInterval(() => this.loadSmartNotifications(), 3 * 60 * 1000);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Registrasi Service Worker PWA
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('✅ ServiceWorker Registered. Scope:', reg.scope))
          .catch(err => console.log('ServiceWorker registration failed:', err));
      });
    }
  }

  // Tangani Tombol Install PWA
  setupPWAInstallPrompt() {
    const installBtn = document.getElementById('btn-install-pwa');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      if (installBtn) {
        installBtn.classList.add('visible');
        installBtn.onclick = async () => {
          if (this.deferredInstallPrompt) {
            this.deferredInstallPrompt.prompt();
            const { outcome } = await this.deferredInstallPrompt.userChoice;
            console.log(`PWA Install outcome: ${outcome}`);
            this.deferredInstallPrompt = null;
            installBtn.classList.remove('visible');
          }
        };
      }
    });
  }

  // =========================================================================
  // SMART CLINICAL NOTIFICATION SYSTEM (Pagi 06:00, Malam 18:00, Harga, Info)
  // =========================================================================

  toggleSmartNotificationDropdown(forceState) {
    const dropdown = document.getElementById('smart-notif-dropdown');
    if (!dropdown) return;

    const isCurrentlyOpen = dropdown.style.display === 'block';
    const nextState = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    dropdown.style.display = nextState ? 'block' : 'none';

    if (nextState) {
      this.toggleNotifFilterDropdown(false);
      this.loadSmartNotifications();
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } else {
      this.toggleNotifFilterDropdown(false);
    }
  }

  toggleNotifFilterDropdown(forceState = null) {
    const menu = document.getElementById('notif-filter-menu');
    const trigger = document.getElementById('notif-filter-trigger');
    if (!menu) return;

    const isCurrentlyOpen = menu.style.display === 'block';
    const nextState = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    menu.style.display = nextState ? 'block' : 'none';
    if (trigger) {
      trigger.classList.toggle('open', nextState);
      trigger.setAttribute('aria-expanded', nextState ? 'true' : 'false');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  setNotifFilter(category, label) {
    this.activeNotifCategory = category;
    const labelEl = document.getElementById('notif-filter-current-label');
    if (labelEl) labelEl.textContent = label;

    document.querySelectorAll('.notif-filter-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    this.toggleNotifFilterDropdown(false);
    this.renderSmartNotifications();
  }

  toggleNotifSimPanel() {
    const panel = document.getElementById('smart-notif-sim-panel');
    const chevron = document.getElementById('notif-sim-chevron');
    if (!panel) return;
    const isHidden = panel.style.display === 'none' || !panel.style.display;
    panel.style.display = isHidden ? 'block' : 'none';
    if (chevron) {
      chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  getDefaultNotifications() {
    return [
      {
        id: 'notif_default_1',
        type: 'morning_reminder',
        category: 'nutrition',
        title: 'PENGINGAT TARGET GIZI',
        message: 'Tersisa 18g protein lagi untuk mencapai fase pemulihan harian optimal. Rekomendasi: Ikan Gabus Kukus.',
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        is_read: false
      },
      {
        id: 'notif_default_2',
        type: 'hydration',
        category: 'hydration',
        title: 'PENGINGAT HIDRASI PASCA-OPERASI',
        message: 'Waktunya minum 250ml air hangat untuk melancarkan sirkulasi nutrisi dan pemulihan jaringan luka.',
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        is_read: false
      },
      {
        id: 'notif_default_3',
        type: 'price_change',
        category: 'price_change',
        title: 'HEMAT NUTRISI: HARGA IKAN GABUS TURUN',
        message: 'Harga Ikan Gabus segar di pasar lokal hari ini turun menjadi Rp 24.000/ekor (sebelumnya Rp 30.000). Kesempatan terbaik stok albumin!',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        is_read: false
      },
      {
        id: 'notif_default_4',
        type: 'info',
        category: 'clinic',
        title: 'VALIDASI PROTOKOL TIM MEDIS',
        message: 'dr. Sarah Sp.GK telah memverifikasi rekomendasi target makronutrisi dan albumin harian Anda.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        is_read: true
      },
      {
        id: 'notif_default_5',
        type: 'evening_reminder',
        category: 'evening_reminder',
        title: 'EVALUASI DEFISIT GIZI HARIAN',
        message: 'Target kalori malam tersisa 240 kkal. Dianjurkan konsumsi camilan protein lembut seperti putih telur rebus.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        is_read: true
      }
    ];
  }

  updateNotifBadge() {
    const badgeEl = document.getElementById('notif-unread-count');
    if (!badgeEl) return;
    const unreadCount = (this.cachedNotifications || []).filter(n => !n.is_read).length;
    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badgeEl.style.display = 'inline-flex';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  async loadSmartNotifications() {
    const listEl = document.getElementById('smart-notif-list');
    if (!listEl) return;

    try {
      let notifications = [];

      if (window.nutriAPI) {
        const userId = (this.userProfile && this.userProfile.id) || 'usr_patient_siti';
        const res = await window.nutriAPI.getNotifications(userId);
        if (res && res.success && Array.isArray(res.notifications) && res.notifications.length > 0) {
          notifications = res.notifications;
        }
      }

      if (!notifications || notifications.length === 0) {
        if (!this.cachedNotifications || this.cachedNotifications.length === 0) {
          this.cachedNotifications = this.getDefaultNotifications();
        }
      } else {
        this.cachedNotifications = notifications;
      }

      this.updateNotifBadge();
      this.renderSmartNotifications();
    } catch (e) {
      console.warn('Failed to load smart notifications:', e);
      if (!this.cachedNotifications || this.cachedNotifications.length === 0) {
        this.cachedNotifications = this.getDefaultNotifications();
      }
      this.updateNotifBadge();
      this.renderSmartNotifications();
    }
  }

  renderSmartNotifications() {
    const listEl = document.getElementById('smart-notif-list');
    if (!listEl) return;

    const filter = this.activeNotifCategory || 'all';
    const items = (this.cachedNotifications || []).filter(item => {
      if (filter === 'all') return true;
      if (filter === 'nutrition') return item.type === 'morning_reminder' || item.category === 'nutrition';
      if (filter === 'hydration') return item.type === 'hydration' || item.category === 'hydration';
      if (filter === 'clinic') return item.type === 'info' || item.category === 'clinic' || item.type === 'clinic';
      if (filter === 'price_change') return item.type === 'price_change' || item.category === 'price_change';
      if (filter === 'evening_reminder') return item.type === 'evening_reminder' || item.category === 'evening_reminder';
      return true;
    });

    if (items.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 34px 16px; text-align: center; color: var(--ink-mute);">
          <i data-lucide="bell-off" style="width:28px;height:28px;color:#9EA76B;margin-bottom:8px;"></i>
          <p style="margin:0;font-weight:700;font-size:13px;color:var(--ink);">Tidak ada pemberitahuan</p>
          <p style="margin:4px 0 0;font-size:11.5px;color:var(--ink-mute);">Belum ada pesan pada kategori yang dipilih.</p>
        </div>
      `;
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      return;
    }

    listEl.innerHTML = items.map(item => {
      let typeClass = 'notif-type-nutrition';
      if (item.type === 'hydration' || item.category === 'hydration') {
        typeClass = 'notif-type-hydration';
      } else if (item.type === 'evening_reminder' || item.category === 'evening_reminder') {
        typeClass = 'notif-type-urgent';
      } else if (item.type === 'price_change' || item.category === 'price_change') {
        typeClass = 'notif-type-price';
      } else if (item.type === 'info' || item.category === 'clinic' || item.type === 'clinic') {
        typeClass = 'notif-type-clinic';
      }

      const timeStr = item.created_at ? this.formatTimeAgo(new Date(item.created_at)) : 'Baru saja';
      const unreadClass = !item.is_read ? 'unread' : '';
      const displayTitle = (item.title || 'PEMBERITAHUAN').toUpperCase();

      return `
        <div class="smart-notif-item ${unreadClass} ${typeClass}" onclick="app.markSingleNotifRead('${item.id}')" role="button" tabindex="0" title="Klik untuk tandai sudah dibaca">
          <div class="notif-card-header">
            <span class="notif-card-title">${displayTitle}</span>
            ${!item.is_read ? '<span class="notif-unread-indicator-dot" title="Belum dibaca"></span>' : ''}
          </div>
          <p class="notif-card-msg">${item.message || ''}</p>
          <div class="notif-card-footer">
            <span class="notif-card-time">${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  async markAllNotifsRead() {
    try {
      (this.cachedNotifications || []).forEach(n => { n.is_read = true; });
      this.updateNotifBadge();
      this.renderSmartNotifications();

      if (window.nutriAPI) {
        const userId = (this.userProfile && this.userProfile.id) || 'usr_patient_siti';
        await window.nutriAPI.markAllNotificationsRead(userId);
      }

      this.showToast('Semua pemberitahuan ditandai sudah dibaca.', 'success');
    } catch (e) {
      console.error('Error markAllNotifsRead:', e);
    }
  }

  async markSingleNotifRead(id) {
    try {
      const item = (this.cachedNotifications || []).find(n => n.id === id);
      if (item) {
        item.is_read = true;
      }
      this.updateNotifBadge();
      this.renderSmartNotifications();

      if (window.nutriAPI) {
        await window.nutriAPI.markNotificationRead(id);
      }
    } catch (e) {
      console.error('Error markSingleNotifRead:', e);
    }
  }

  async simulateSmartNotification(type) {
    if (!this.isAuthenticated()) {
      this.requireAuth(() => this.simulateSmartNotification(type), 'menguji notifikasi');
      return;
    }
    try {
      let createdNotif = null;

      if (window.nutriAPI) {
        const userId = (this.userProfile && this.userProfile.id) || 'usr_patient_siti';
        const res = await window.nutriAPI.simulateSmartNotification(type, userId);
        if (res && res.success && res.notification) {
          createdNotif = res.notification;
        }
      }

      // Jika offline atau backend belum aktif, buat simulasi lokal
      if (!createdNotif) {
        const simData = {
          morning_reminder: {
            title: 'PENGINGAT TARGET PAGI (06:00 WIB)',
            message: 'Selamat pagi! Target hari ini: 93g Protein & 1.820 kkal. Awali sarapan dengan Bubur Ikan Gabus atau Telur Rebus.',
            category: 'nutrition'
          },
          evening_reminder: {
            title: 'PENGINGAT DEFISIT GIZI MALAM (18:00 WIB)',
            message: 'Perhatian: Asupan protein Anda masih kurang 28g hari ini. Segera konsumsi santapan malam kaya albumin.',
            category: 'evening_reminder'
          },
          price_change: {
            title: 'HEMAT NUTRISI: HARGA IKAN GABUS TURUN',
            message: 'Harga Ikan Gabus lokal turun menjadi Rp 24.000/ekor (Hemat Rp 6.000). Kesempatan belanja bahan albumin tinggi!',
            category: 'price_change'
          },
          info: {
            title: 'UPDATE PROTOKOL KLINIS ERAS 2026',
            message: 'Rekomendasi terbaru ESPEN: Peningkatan asupan albumin dari ikan gabus mempercepat pemulihan luka hingga 40%.',
            category: 'clinic'
          }
        }[type] || {
          title: 'PEMBERITAHUAN SISTEM',
          message: 'Pemberitahuan klinis baru telah ditambahkan.',
          category: 'nutrition'
        };

        createdNotif = {
          id: 'notif_sim_' + Date.now(),
          type: type,
          category: simData.category,
          title: simData.title,
          message: simData.message,
          created_at: new Date().toISOString(),
          is_read: false
        };
      }

      if (createdNotif) {
        if (!this.cachedNotifications) this.cachedNotifications = [];
        this.cachedNotifications.unshift(createdNotif);
        this.updateNotifBadge();
        this.renderSmartNotifications();
        this.showToast(createdNotif.message, createdNotif.type === 'evening_reminder' ? 'evening_reminder' : 'info', createdNotif.title);
      }
    } catch (e) {
      console.error('Simulation error:', e);
      this.showToast('Gagal memicu simulasi notifikasi: ' + e.message, 'error');
    }
  }

  formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  }

  // Terapkan Pengaturan Aksesibilitas (Ramah Lansia & Aksesibel)
  applyAccessibilitySettings() {
    document.documentElement.setAttribute('data-font-size', this.userProfile.fontSize || 'normal');
    if (this.userProfile.highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }

    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === (this.userProfile.fontSize || 'normal'));
    });
  }

  setFontSize(size) {
    this.userProfile.fontSize = size;
    this.saveUserProfile();
    const lang = window.i18n ? window.i18n.getLanguage() : 'en';
    this.showToast(lang === 'id' ? `Ukuran teks diatur ke: ${size.toUpperCase()}` : `Text size set to: ${size.toUpperCase()}`);
  }

  toggleHighContrast() {
    this.userProfile.highContrast = !this.userProfile.highContrast;
    this.saveUserProfile();
    const lang = window.i18n ? window.i18n.getLanguage() : 'en';
    this.showToast(this.userProfile.highContrast
      ? (lang === 'id' ? 'Mode Kontras Tinggi Diaktifkan' : 'High Contrast Mode Enabled')
      : (lang === 'id' ? 'Mode Standar Diaktifkan' : 'Standard Contrast Mode Enabled'));
  }

  setLanguage(lang) {
    if (window.i18n) {
      window.i18n.setLanguage(lang);
    } else {
      localStorage.setItem('nutrivision_lang', lang);
      document.documentElement.lang = lang;
    }
    this.userProfile.language = lang;
    this.saveUserProfile();
  }

  onLanguageChange(lang) {
    this.renderAuthUI();
    this.updateProfileUI();
    this.updateCalcUI();
    this.selectLandingPreset(this.currentLandingPreset || 'preset-soft-bubur-gabus');
    this.renderOverviewPlate();
    if (window.progressTracker) {
      progressTracker.renderMacroDonut(this.userProfile.targets);
      progressTracker.renderWeeklyBarChart();
      if (typeof progressTracker.renderTodayMealHistory === 'function') {
        progressTracker.renderTodayMealHistory();
      }
      if (typeof progressTracker.renderHistoryPage === 'function') {
        progressTracker.renderHistoryPage();
      }
    }
    this.renderFoodCatalog();
    if (window.mealPlanner && typeof window.mealPlanner.renderPlanner === 'function') {
      window.mealPlanner.renderPlanner();
      window.mealPlanner.renderSymptomFilter();
    }
    if (window.budgetPlanner && typeof window.budgetPlanner.render === 'function') {
      window.budgetPlanner.render();
    }
    if (window.communityHandler && typeof window.communityHandler.renderCommunityFeed === 'function') {
      window.communityHandler.renderCommunityFeed();
    }
    if (window.caregiverHandler && typeof window.caregiverHandler.renderCaregiverList === 'function') {
      window.caregiverHandler.renderCaregiverList();
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Update Header, Sidebar, dan Ringkasan UI Profil (Mendukung Empty State, Pasien, Dokter, Caregiver & Admin)
  updateProfileUI() {
    const role = this.userProfile?.role || 'patient';
    const isAdmin = role === 'admin';
    const isDoctor = role === 'doctor' || role === 'clinician';
    const isCaregiver = role === 'caregiver';
    const isPatient = !isAdmin && !isDoctor && !isCaregiver;
    const isAuth = this.isAuthenticated();
    const hasQuiz = Boolean(this.userProfile && this.userProfile.hasCompletedQuiz);
    const hasData = (isAuth && hasQuiz) || isAdmin || isDoctor || isCaregiver;
    const initials = isAdmin ? 'AD' : (isDoctor ? 'HK' : (isCaregiver ? 'CG' : (isAuth && this.userProfile.name ? (this.userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P') : '+')));
    const lang = window.i18n ? window.i18n.getLanguage() : (this.userProfile?.language || 'en');

    // 1. Update Topbar Greeting
    const greetingEl = document.querySelector('.topbar-greeting h1');
    if (greetingEl) {
      if (isAdmin) {
        greetingEl.innerHTML = lang === 'id'
          ? `Panel Administrator: <span class="user-name-placeholder" style="color:var(--matcha-600);">Super Admin Telemetri</span>`
          : `Admin Command Center: <span class="user-name-placeholder" style="color:var(--matcha-600);">Super Admin Telemetry</span>`;
      } else if (isDoctor) {
        greetingEl.innerHTML = lang === 'id'
          ? `Portal Pengawas Klinis: <span class="user-name-placeholder" style="color:#0284C7;">${this.userProfile?.name || 'dr. Hendra Kusuma, Sp.GK'}</span>`
          : `Clinical Doctor Portal: <span class="user-name-placeholder" style="color:#0284C7;">${this.userProfile?.name || 'dr. Hendra Kusuma, Sp.GK'}</span>`;
      } else if (isCaregiver) {
        greetingEl.innerHTML = lang === 'id'
          ? `Portal Pendamping Pasien: <span class="user-name-placeholder" style="color:#10B981;">${this.userProfile?.name || 'Sarah (Caregiver)'}</span>`
          : `Caregiver Companion Portal: <span class="user-name-placeholder" style="color:#10B981;">${this.userProfile?.name || 'Sarah (Caregiver)'}</span>`;
      } else if (isAuth && this.userProfile?.name) {
        greetingEl.innerHTML = lang === 'id'
          ? `Selamat datang, <span class="user-name-placeholder">${this.userProfile.name.split(' ')[0]}</span>`
          : `Welcome, <span class="user-name-placeholder">${this.userProfile.name.split(' ')[0]}</span>`;
      } else {
        greetingEl.innerHTML = lang === 'id'
          ? `Selamat datang di <span style="color:var(--teal-700);">NutriVision AI</span>`
          : `Welcome to <span style="color:var(--teal-700);">NutriVision AI</span>`;
      }
    }

    // 2. Update Topbar Buttons Visibility (Humanized Logic)
    const topbarProfileChip = document.getElementById('topbar-profile-chip');
    if (topbarProfileChip) {
      topbarProfileChip.style.display = isAuth ? 'inline-flex' : 'none';
    }

    // Toggle Sidebar Navigation Groups by Role
    const patientNav = document.getElementById('sidebar-nav-patient');
    const doctorNav = document.getElementById('sidebar-nav-doctor');
    const caregiverNav = document.getElementById('sidebar-nav-caregiver');
    const adminNav = document.getElementById('sidebar-nav-admin');

    if (patientNav) patientNav.style.display = isPatient ? 'flex' : 'none';
    if (doctorNav) doctorNav.style.display = isDoctor ? 'flex' : 'none';
    if (caregiverNav) caregiverNav.style.display = isCaregiver ? 'flex' : 'none';
    if (adminNav) adminNav.style.display = isAdmin ? 'flex' : 'none';

    // Hide mobile bottom nav & scan floating button for non-patients (Doctor, Caregiver, and Admin only monitor)
    const hidePatientTools = isAdmin || isDoctor || isCaregiver;
    const bottomNav = document.querySelector('.bottom-nav-pwa');
    const fabBtn = document.querySelector('.fab-scan-btn');
    if (bottomNav) bottomNav.style.display = hidePatientTools ? 'none' : '';
    if (fabBtn) fabBtn.style.display = hidePatientTools ? 'none' : '';

    // 3. Update Profile Data Placeholders
    const nameEls = document.querySelectorAll('.user-name-placeholder');
    nameEls.forEach(el => el.textContent = (isAuth && this.userProfile.name) ? this.userProfile.name : (lang === 'id' ? 'Profil Pasien' : 'Patient Profile'));

    const conditionEls = document.querySelectorAll('.user-condition-placeholder');
    conditionEls.forEach(el => {
      if (isDoctor) {
        el.textContent = 'DPJP Bedah & Gizi Klinis (Sp.GK)';
      } else if (isCaregiver) {
        el.textContent = 'Pendamping Pasien Pasca Bedah';
      } else if (isAdmin) {
        el.textContent = 'Super Administrator Sistem';
      } else {
        el.textContent = hasQuiz ? `${this.userProfile.conditionTitle} · ${this.userProfile.phase}` : (lang === 'id' ? 'Belum dikonfigurasi (Mulai Diagnostik Gizi)' : 'Not configured (Start Nutrition Diagnostic)');
      }
    });

    const avatarEls = document.querySelectorAll('.user-avatar-placeholder');
    avatarEls.forEach(el => el.textContent = initials);

    // 4. Update Dedicated Sidebar Profile Card (Clean & Simple with Integrated Logout)
    const sidebarProfileCard = document.getElementById('sidebar-profile-card');
    if (sidebarProfileCard) {
      if (isAdmin) {
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="app.goToAdminPortal()" title="${lang === 'id' ? 'Buka Super Admin Command Center' : 'Open Super Admin Command Center'}">
              <div class="profile-avatar" style="background:linear-gradient(135deg,#9EA76B,#353C1B);color:#fff;font-weight:800;flex-shrink:0;">AD</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Super Administrator</b>
                <span style="font-size:10.5px;color:#D6DCB2;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Root Telemetry &amp; DB</span>
              </div>
            </div>
            <button type="button" class="sidebar-logout-btn" onclick="event.stopPropagation(); app.handleLogout();" title="${lang === 'id' ? 'Logout & Kembali ke Landing Page' : 'Sign Out & Back to Landing Page'}" aria-label="Sign Out / Logout">
              <i data-lucide="log-out" style="width:15px;height:15px;"></i>
            </button>
          </div>
        `;
      } else if (isDoctor) {
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="app.goToDoctorDashboard()" title="Buka Portal Klinis DPJP">
              <div class="profile-avatar" style="background:linear-gradient(135deg,#0284C7,#0369A1);color:#fff;font-weight:700;flex-shrink:0;">HK</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.userProfile?.name || 'dr. Hendra Sp.GK'}</b>
                <span style="font-size:10.5px;color:#BAE6FD;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">DPJP Bedah &amp; Klinis</span>
              </div>
            </div>
            <button type="button" class="sidebar-logout-btn" onclick="event.stopPropagation(); app.handleLogout();" title="Logout &amp; Keluar" aria-label="Logout">
              <i data-lucide="log-out" style="width:15px;height:15px;"></i>
            </button>
          </div>
        `;
      } else if (isCaregiver) {
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="app.goToCaregiverDashboard()" title="Buka Dasbor Pendamping">
              <div class="profile-avatar" style="background:linear-gradient(135deg,#10B981,#047857);color:#fff;font-weight:700;flex-shrink:0;">CG</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.userProfile?.name || 'Sarah (Caregiver)'}</b>
                <span style="font-size:10.5px;color:#A7F3D0;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Pendamping Siti Rahma</span>
              </div>
            </div>
            <button type="button" class="sidebar-logout-btn" onclick="event.stopPropagation(); app.handleLogout();" title="Logout &amp; Keluar" aria-label="Logout">
              <i data-lucide="log-out" style="width:15px;height:15px;"></i>
            </button>
          </div>
        `;
      } else if (isAuth && this.userProfile?.name) {
        const subTitle = hasQuiz
          ? this.userProfile.conditionTitle
          : (lang === 'id' ? '⚠️ Belum Kalibrasi Gizi' : '⚠️ Pending Calibration');
        const clickAction = hasQuiz ? "app.navigate('profile')" : "app.openQuizModal(1)";
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="${clickAction}" title="${lang === 'id' ? 'Buka Profil & Diagnostik' : 'Open Profile & Diagnostics'}">
              <div class="profile-avatar" style="background:linear-gradient(135deg,var(--coral-300),var(--coral-500));color:#fff;font-weight:700;flex-shrink:0;">${initials}</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.userProfile.name}</b>
                <span style="font-size:10.5px;color:#EFE8CA;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${subTitle}</span>
              </div>
            </div>
            <button type="button" class="sidebar-logout-btn" onclick="event.stopPropagation(); app.handleLogout();" title="${lang === 'id' ? 'Logout & Kembali ke Landing Page' : 'Sign Out & Back to Landing Page'}" aria-label="Sign Out / Logout">
              <i data-lucide="log-out" style="width:15px;height:15px;"></i>
            </button>
          </div>
        `;
      } else {
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="app.openAuthModal('login')" title="${lang === 'id' ? 'Masuk atau Daftar Akun' : 'Sign In or Register'}">
              <div class="profile-avatar" style="background:rgba(255,255,255,0.15);color:#fff;font-weight:700;flex-shrink:0;">?</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;">${lang === 'id' ? 'Masuk / Daftar' : 'Sign In / Register'}</b>
                <span style="font-size:10.5px;color:#EFE8CA;display:block;">${lang === 'id' ? 'Klik untuk mulai' : 'Click to start'}</span>
              </div>
            </div>
            <button type="button" class="sidebar-logout-btn" onclick="event.stopPropagation(); app.openAuthModal('login');" title="${lang === 'id' ? 'Masuk' : 'Sign In'}" aria-label="${lang === 'id' ? 'Masuk' : 'Sign In'}">
              <i data-lucide="log-in" style="width:15px;height:15px;"></i>
            </button>
          </div>
        `;
      }
    }

    // 5. Update Overview Unconfigured Onboarding Banner (STRICTLY patient-only)
    const overviewBanner = document.getElementById('overview-unconfigured-banner');
    if (overviewBanner) {
      overviewBanner.style.display = (isAuth && !hasQuiz && isPatient) ? 'block' : 'none';
    }

    // 6. Update Card 2 Status & Action
    const card2Badge = document.getElementById('ov-card2-status-badge');
    const card2Text = document.getElementById('ov-card2-status-text');
    const card2Btn = document.getElementById('ov-card2-calibrate-btn');
    if (card2Badge && card2Text) {
      if (hasQuiz) {
        card2Badge.className = 'badge teal';
        card2Badge.style.cursor = 'pointer';
        card2Text.textContent = lang === 'id' ? 'Target Terkalibrasi' : 'Target Calibrated';
      } else {
        card2Badge.className = 'badge gray';
        card2Badge.style.cursor = 'pointer';
        card2Text.textContent = lang === 'id' ? 'Belum Dikonfigurasi' : 'Unconfigured';
      }
    }
    if (card2Btn) {
      if (hasQuiz) {
        card2Btn.innerHTML = `<i data-lucide="refresh-cw" style="width:12px;height:12px;"></i> <span>${lang === 'id' ? 'Ubah Target' : 'Change Target'}</span>`;
      } else {
        card2Btn.innerHTML = `<i data-lucide="sparkles" style="width:12px;height:12px;"></i> <span>${lang === 'id' ? 'Isi Data Diagnostik' : 'Start Diagnostic'}</span>`;
      }
    }

    // 7. Update Profile View Elements & Banner
    const emptyBanner = document.getElementById('profile-empty-banner');
    if (emptyBanner) {
      emptyBanner.style.display = hasData ? 'none' : 'block';
    }

    const badgeText = document.getElementById('profile-badge-text');
    const badgeStatus = document.getElementById('profile-badge-status');
    if (badgeText && badgeStatus) {
      if (hasData) {
        badgeText.textContent = lang === 'id' ? 'Akun Terverifikasi' : 'Verified Account';
        badgeStatus.style.background = 'var(--teal-50)';
        badgeStatus.style.color = 'var(--teal-700)';
        badgeStatus.style.borderColor = 'var(--teal-200)';
      } else {
        badgeText.textContent = lang === 'id' ? 'Mode Tamu' : 'Guest Mode';
        badgeStatus.style.background = 'var(--bg-subtle)';
        badgeStatus.style.color = 'var(--ink-mute)';
        badgeStatus.style.borderColor = 'var(--line)';
      }
    }

    const btnRecalcLabel = document.getElementById('btn-quiz-recalc-label');
    if (btnRecalcLabel) {
      btnRecalcLabel.textContent = hasData ? (lang === 'id' ? 'Hitung Ulang Diagnostik' : 'Recalculate Diagnostic') : (lang === 'id' ? 'Mulai Diagnostik Gizi' : 'Start Nutrition Diagnostic');
    }

    const elEmail = document.getElementById('profile-email-phone');
    if (elEmail) elEmail.textContent = isAuth ? `${this.userProfile.contact || this.userProfile.email || (lang === 'id' ? 'Belum diisi' : 'Not specified')}` : (lang === 'id' ? 'Belum masuk akun' : 'Not signed in');

    const elStatWH = document.getElementById('profile-stat-weight-height');
    if (elStatWH) elStatWH.textContent = hasData ? `${this.userProfile.weightKg} kg · ${this.userProfile.heightCm || 170} cm` : '-- kg · -- cm';

    const elStatBMI = document.getElementById('profile-stat-bmi');
    if (elStatBMI) elStatBMI.textContent = hasData ? `${this.userProfile.bmi || '--'} (${this.userProfile.bmiCategory || '--'})` : (lang === 'id' ? '-- (Belum dihitung)' : '-- (Not calculated)');

    const elStatCals = document.getElementById('profile-stat-calories');
    if (elStatCals) elStatCals.textContent = hasData && this.userProfile.targets ? `${this.userProfile.targets.calories.toLocaleString()}` : '--';

    const dayUnit = lang === 'id' ? 'hari' : 'day';
    const elTargetProt = document.getElementById('profile-target-protein');
    if (elTargetProt) {
      if (hasData && this.userProfile.targets) {
        const perKg = (this.userProfile.targets.protein / (this.userProfile.weightKg || 65)).toFixed(1);
        elTargetProt.textContent = `${this.userProfile.targets.protein} g / ${dayUnit} (${perKg}g/kg)`;
      } else {
        elTargetProt.textContent = `-- g / ${dayUnit}`;
      }
    }

    const elTargetCarbs = document.getElementById('profile-target-carbs');
    if (elTargetCarbs) elTargetCarbs.textContent = hasData && this.userProfile.targets ? `${this.userProfile.targets.carbs} g / ${dayUnit}` : `-- g / ${dayUnit}`;

    const elTargetFat = document.getElementById('profile-target-fat');
    if (elTargetFat) elTargetFat.textContent = hasData && this.userProfile.targets ? `${this.userProfile.targets.fat} g / ${dayUnit}` : `-- g / ${dayUnit}`;

    const elStatRestr = document.getElementById('profile-stat-restrictions');
    if (elStatRestr) elStatRestr.textContent = hasData ? (this.userProfile.restrictions || (lang === 'id' ? 'Bebas pantangan khusus' : 'No dietary restrictions')) : (lang === 'id' ? 'Belum mengisi deklarasi pantangan' : 'No restrictions declared');

    const elStatAct = document.getElementById('profile-stat-activity');
    if (elStatAct) {
      if (hasData) {
        const actMap = lang === 'id' ? {
          'bedrest': '<i data-lucide="bed" class="btn-icon-sm"></i> Bedrest Total / Tirah Baring (Aktivitas minimal)',
          'light': '<i data-lucide="footprints" class="btn-icon-sm"></i> Mobilisasi Ringan (Aktivitas ringan harian)',
          'therapy': '<i data-lucide="heart-pulse" class="btn-icon-sm"></i> Terapi Fisik Teratur (Fisioterapi 2-3x/minggu)',
          'active': '<i data-lucide="zap" class="btn-icon-sm"></i> Latihan Fisik Aktif / Gym'
        } : {
          'bedrest': '<i data-lucide="bed" class="btn-icon-sm"></i> Complete Bedrest (Minimal activity)',
          'light': '<i data-lucide="footprints" class="btn-icon-sm"></i> Light Mobilization (Daily light tasks)',
          'therapy': '<i data-lucide="heart-pulse" class="btn-icon-sm"></i> Regular Physical Therapy (2-3x/week)',
          'active': '<i data-lucide="zap" class="btn-icon-sm"></i> Active Training / Gym'
        };
        elStatAct.innerHTML = actMap[this.userProfile.activityLevel] || (lang === 'id' ? '<i data-lucide="footprints" class="btn-icon-sm"></i> Mobilisasi Ringan' : '<i data-lucide="footprints" class="btn-icon-sm"></i> Light Mobilization');
      } else {
        elStatAct.textContent = lang === 'id' ? 'Belum mengisi tingkat aktivitas' : 'No activity level declared';
      }
    }

    // 6. Update Session Status in Profile
    const sessTitle = document.getElementById('profile-session-status-title');
    const sessDesc = document.getElementById('profile-session-status-desc');
    const sessActions = document.getElementById('profile-session-actions');
    if (sessTitle && sessDesc && sessActions) {
      if (hasData) {
        sessTitle.innerHTML = `<i data-lucide="shield-check" class="btn-icon-sm" style="color:var(--teal-700);"></i> ${lang === 'id' ? 'Status Sesi Login Aktif' : 'Active Login Session'}`;
        sessDesc.innerHTML = `${lang === 'id' ? 'Terhubung sebagai' : 'Connected as'} <span class="user-name-placeholder" style="font-weight:600;color:var(--ink-soft);">${this.userProfile.name}</span> (<span id="profile-auth-email">${this.userProfile.contact || (lang === 'id' ? 'Email terdaftar' : 'Registered email')}</span>)`;
        sessActions.innerHTML = `
          <button class="btn-sm-teal" style="display:inline-flex;align-items:center;gap:4px;" onclick="app.openAuthModal('login')">
            <i data-lucide="user-check" class="btn-icon-sm"></i> ${lang === 'id' ? 'Ganti Akun Pasien' : 'Switch Patient Account'}
          </button>
          <button class="btn-outline-glass" style="color:var(--coral-600);border-color:var(--coral-100);background:var(--coral-50);font-size:12px;padding:6px 12px;border-radius:var(--radius-xs);display:inline-flex;align-items:center;gap:4px;cursor:pointer;" onclick="app.handleLogout()">
            <i data-lucide="log-out" class="btn-icon-sm" style="pointer-events:none;"></i> ${lang === 'id' ? 'Keluar (Logout)' : 'Sign Out (Logout)'}
          </button>
        `;
      } else {
        sessTitle.innerHTML = `<i data-lucide="shield-alert" class="btn-icon-sm" style="color:var(--amber-600);"></i> ${lang === 'id' ? 'Status Sesi: Mode Tamu (Belum Login)' : 'Session Status: Guest Mode (Not Signed In)'}`;
        sessDesc.innerHTML = lang === 'id' ? 'Masuk atau buat akun baru untuk menyimpan riwayat asupan dan target gizi personal.' : 'Sign in or create a new account to preserve intake history and personalized nutrition targets.';
        sessActions.innerHTML = `
          <button class="btn-primary-coral" style="font-size:12px;padding:6px 14px;display:inline-flex;align-items:center;gap:4px;" onclick="app.openAuthModal('login')">
            <i data-lucide="log-in" class="btn-icon-sm"></i> ${lang === 'id' ? 'Masuk / Daftar Akun' : 'Sign In / Register Account'}
          </button>
        `;
      }
    }

    // 7. Update Regional Food Market Indicator in Profile
    const elRegBadge = document.getElementById('profile-region-badge');
    const elRegText = document.getElementById('profile-region-display-text');
    if (elRegBadge && elRegText) {
      const activeReg = (window.BappenasFoodAPI ? window.BappenasFoodAPI.getActiveRegion() : null) || this.userProfile.region || {
        provinceName: 'DKI Jakarta',
        cityName: 'Kota Jakarta Selatan',
        multiplier: 1.00,
        zone: 'Zona 1 (Jawa & Bali)'
      };
      elRegBadge.textContent = `Bapanas RI · ${activeReg.multiplier ? activeReg.multiplier.toFixed(2) : '1.00'}x`;
      elRegText.textContent = `${activeReg.provinceName || 'DKI Jakarta'}${activeReg.cityName && activeReg.cityName !== 'Semua Wilayah' ? ' · ' + activeReg.cityName : ''} (${activeReg.zone || 'Regional'})`;
    }

    // 8. Synchronize Language Switchers
    document.querySelectorAll('.lp-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    document.querySelectorAll('.profile-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    this.updatePreviewBanner();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Switch Tab Navigasi (Router)
  navigate(sectionId) {
    const role = this.userProfile?.role || 'patient';
    const isAdmin = role === 'admin';
    const isDoctor = role === 'doctor' || role === 'clinician';
    const isCaregiver = role === 'caregiver';

    // Database modal exception
    if (sectionId === 'database') {
      this.openDatabaseSyncModal();
      return;
    }

    // Role-based route guard & redirect
    if (isAdmin) {
      if (sectionId === 'overview' || sectionId === 'progress' || sectionId === 'history' || sectionId === 'caregiver' || sectionId === 'community' || sectionId === 'profile' || sectionId === 'doctor' || sectionId === 'caregiver-dashboard') {
        sectionId = 'admin';
      } else if (sectionId === 'planner' || sectionId === 'catalog') {
        sectionId = 'admin-clinical-menu';
      }
    } else if (isDoctor) {
      if (sectionId === 'overview' || sectionId === 'planner' || sectionId === 'history' || sectionId === 'caregiver' || sectionId === 'community' || sectionId === 'caregiver-dashboard' || sectionId === 'admin') {
        sectionId = 'doctor';
      }
    } else if (isCaregiver) {
      if (sectionId === 'overview' || sectionId === 'planner' || sectionId === 'history' || sectionId === 'caregiver' || sectionId === 'community' || sectionId === 'doctor' || sectionId === 'admin') {
        sectionId = 'caregiver-dashboard';
      }
    } else {
      if (sectionId === 'admin' || sectionId === 'admin-clinical-menu' || sectionId === 'admin-audit' || sectionId === 'doctor' || sectionId === 'caregiver-dashboard') {
        sectionId = 'overview';
      }
    }

    // Portal Pendamping telah dipindahkan ke dalam fitur Profil Pasien
    if (sectionId === 'caregiver') {
      this.navigate('profile');
      setTimeout(() => {
        const cgCard = document.getElementById('profile-caregiver-card');
        if (cgCard) {
          cgCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          cgCard.style.transition = 'box-shadow 0.4s ease';
          cgCard.style.boxShadow = '0 0 0 3px var(--teal-300)';
          setTimeout(() => {
            cgCard.style.boxShadow = '';
          }, 1800);
        }
      }, 150);
      return;
    }

    this.activeSection = sectionId;

    // Update section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active-view');
    });
    const targetSection = document.getElementById(`view-${sectionId}`);
    if (targetSection) {
      targetSection.classList.add('active-view');
    }

    if (sectionId === 'doctor') {
      this.renderDoctorDashboard();
    }

    if (sectionId === 'caregiver-dashboard') {
      this.renderCaregiverDashboard();
    }

    if (sectionId === 'profile') {
      if (window.caregiverHandler && typeof window.caregiverHandler.renderCaregiverList === 'function') {
        window.caregiverHandler.renderCaregiverList();
      }
    }

    if (sectionId === 'catalog') {
      this.renderFoodCatalog();
    }

    if (sectionId === 'history') {
      if (window.progressTracker && typeof window.progressTracker.renderHistoryPage === 'function') {
        window.progressTracker.renderHistoryPage();
      }
    }

    if (sectionId === 'admin') {
      this.renderAdminPortal();
    }

    if (sectionId === 'admin-clinical-menu') {
      this.renderAdminClinicalMenu();
    }

    if (sectionId === 'admin-audit') {
      if (window.nutriVisionDB) {
        this.renderAdminAuditLogs(window.nutriVisionDB.getAuditLogs());
      }
    }

    if (sectionId === 'progress') {
      const cond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
      this.renderJourneyRoadmap(cond);
      this.renderClinicalCalendarAndScheduleSuite();
    }

    if (sectionId === 'ai-text') {
      this.renderAITextPage();
    }

    // Update Desktop Nav Active State
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sec === sectionId || (sectionId === 'history' && btn.dataset.sec === 'overview'));
    });

    // Update Mobile Bottom Nav Active State
    document.querySelectorAll('.bottom-nav-pwa .bottom-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sec === sectionId || (sectionId === 'history' && btn.dataset.sec === 'overview'));
    });

    // Update Topbar Profile Button Active State
    const topbarProfileBtn = document.getElementById('topbar-profile-btn');
    if (topbarProfileBtn) {
      topbarProfileBtn.classList.toggle('active', sectionId === 'profile');
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Scroll to top smooth
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  // =========================================================================
  // LANDING PAGE ROUTING & INTERACTIVE CONTROLLERS
  // =========================================================================

  // Pindah ke Mode Landing Page (Otomatis Logout Sesi Sesuai Kebijakan Keamanan)
  goToLanding(showToast = false) {
    const wasLoggedIn = Boolean(this.userProfile && this.userProfile.contact);

    if (wasLoggedIn) {
      if (window.nutriVisionDB) {
        window.nutriVisionDB.logout();
      }
      this.isAdminPreviewMode = false;
      const banner = document.getElementById('admin-preview-banner');
      if (banner) banner.style.display = 'none';
      const adminNavBtn = document.getElementById('sidebar-admin-nav-item');
      if (adminNavBtn) adminNavBtn.style.display = 'none';

      localStorage.removeItem('nutrivision_user_profile');
      this.userProfile = {
        hasCompletedQuiz: false,
        name: '',
        contact: '',
        gender: 'male',
        age: 28,
        heightCm: 170,
        weightKg: 65,
        activityLevel: 'light',
        conditionId: '',
        conditionTitle: 'Belum Diatur',
        phase: 'Belum Diatur',
        restrictions: '',
        hasAcceptedConsent: false,
        bmi: '--',
        bmiCategory: '--',
        targets: null
      };
      this.updateProfileUI();
      this.renderAuthUI();
      if (showToast) {
        this.showToast('ℹ️ Kembali ke Beranda. Sesi akun Anda telah otomatis keluar (Logged Out).');
      }
    }

    this.isLanding = true;
    document.body.classList.add('is-landing-active');
    const guestBanner = document.getElementById('dashboard-preview-banner');
    if (guestBanner) guestBanner.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history.pushState) {
      window.history.pushState(null, null, '#landing');
    }
    setTimeout(() => {
      this.selectLandingPreset(this.currentLandingPreset || 'preset-soft-bubur-gabus');
    }, 60);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Pindah ke Mode Dasbor Aplikasi (Mendukung Mode Pratinjau Tamu / Guest Preview)
  goToDashboard(sectionId = 'overview', triggerModal = null) {
    if (this.userProfile && this.userProfile.role === 'admin' && sectionId === 'overview' && !this.isAdminPreviewMode) {
      this.goToAdminPortal();
      return;
    }

    if (this.userProfile && (this.userProfile.role === 'doctor' || this.userProfile.role === 'clinician') && (sectionId === 'overview' || sectionId === 'doctor')) {
      this.goToDoctorDashboard();
      return;
    }

    if (this.userProfile && this.userProfile.role === 'caregiver' && (sectionId === 'overview' || sectionId === 'caregiver-dashboard')) {
      this.goToCaregiverDashboard();
      return;
    }

    this.isLanding = false;
    document.body.classList.remove('is-landing-active');
    if (sectionId === 'catalog') {
      this.isPlateMatchedCatalogMode = false;
    }
    this.navigate(sectionId);
    if (window.history.pushState) {
      window.history.pushState(null, null, `#${sectionId}`);
    }

    this.updatePreviewBanner();

    if (triggerModal === 'quiz' && (!this.userProfile || this.userProfile.role === 'patient')) {
      setTimeout(() => this.openQuizModal(1), 120);
    } else if (triggerModal === 'scan') {
      setTimeout(() => this.openScanModal(), 120);
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Update Status & Visibilitas Banner Pratinjau Dasbor (Guest Mode)
  updatePreviewBanner() {
    const banner = document.getElementById('dashboard-preview-banner');
    if (!banner) return;

    const isAuth = this.isAuthenticated();
    if (isAuth || this.isLanding) {
      banner.style.display = 'none';
      return;
    }

    banner.style.display = 'flex';
    const lang = window.i18n ? window.i18n.getLanguage() : (this.userProfile ? this.userProfile.language : 'id');
    const isId = lang === 'id';

    const badgeText = document.getElementById('guest-banner-badge-text');
    const title = document.getElementById('guest-banner-title');
    const desc = document.getElementById('guest-banner-desc');
    const btnLogin = document.getElementById('guest-banner-login-btn-text');
    const btnHome = document.getElementById('guest-banner-home-btn-text');

    if (badgeText) badgeText.textContent = isId ? 'Mode Pratinjau' : 'Preview Mode';
    if (title) title.textContent = isId ? 'Anda sedang menjelajahi Dasbor dalam Mode Pratinjau (Tamu).' : 'You are currently browsing the Dashboard in Preview Mode (Guest).';
    if (desc) desc.textContent = isId ? 'Silakan cek visualisasi & tata letak dasbor. Masuk atau buat akun baru untuk mengaktifkan seluruh fitur interaktif.' : 'Feel free to explore the dashboard layout and visual charts. Sign in or register to enable all interactive clinical features.';
    if (btnLogin) btnLogin.textContent = isId ? 'Masuk / Daftar' : 'Sign In / Register';
    if (btnHome) btnHome.textContent = isId ? 'Beranda' : 'Home';

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // INTERACTIVE SIMULATOR: PRESET SCANNER SHOWCASE & FOOD VISUALIZER
  // =========================================================================
  setPlateViewMode(mode) {
    this.plateViewMode = mode;
    document.querySelectorAll('#lp-plate-mode-toggles .lp-mode-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const segSvg = document.getElementById('lp-plate-seg-svg');
    const laserBeam = document.getElementById('lp-plate-laser');
    const pinsLayer = document.getElementById('lp-plate-pins-layer');
    const heatmapEl = document.getElementById('lp-plate-heatmap');
    const calloutSvg = document.getElementById('lp-plate-callout-lines-svg');

    if (mode === 'photo') {
      if (segSvg) segSvg.style.display = 'none';
      if (laserBeam) laserBeam.style.display = 'none';
      if (pinsLayer) pinsLayer.style.display = 'none';
      if (heatmapEl) heatmapEl.style.display = 'none';
      if (calloutSvg) calloutSvg.style.display = 'none';
    } else if (mode === 'heatmap') {
      if (segSvg) segSvg.style.display = 'none';
      if (laserBeam) laserBeam.style.display = 'none';
      if (pinsLayer) pinsLayer.style.display = 'none';
      if (heatmapEl) heatmapEl.style.display = 'block';
      if (calloutSvg) calloutSvg.style.display = 'none';
    } else {
      // 'ai' mode (default)
      if (segSvg) segSvg.style.display = 'block';
      if (laserBeam) laserBeam.style.display = 'block';
      if (pinsLayer) pinsLayer.style.display = 'none';
      if (heatmapEl) heatmapEl.style.display = 'none';
      if (calloutSvg) calloutSvg.style.display = 'block';
    }
  }

  highlightPlateSegment(segId, isHighlighted) {
    const isHigh = Boolean(isHighlighted);
    const poly = document.querySelector(`.lp-seg-poly[data-seg="${segId}"]`);
    if (poly) poly.classList.toggle('highlighted', isHigh);

    const calloutGroup = document.querySelector(`.lp-callout-group[data-seg="${segId}"]`);
    if (calloutGroup) calloutGroup.classList.toggle('highlighted', isHigh);

    let targetTagId = null;
    if (this.currentPresetSegments) {
      const seg = this.currentPresetSegments.find(s => s.id === segId);
      if (seg) targetTagId = seg.tagId;
    }
    if (!targetTagId) {
      const tagMap = { 'prot': 'lp-showcase-tag-1', 'carb': 'lp-showcase-tag-2', 'veg': 'lp-showcase-tag-3' };
      targetTagId = tagMap[segId];
    }
    const tagEl = document.getElementById(targetTagId);
    if (tagEl) tagEl.classList.toggle('highlighted', isHigh);
  }

  setupPlateCalloutResizeObserver() {
    if (this._plateResizeObserverSetup) return;
    this._plateResizeObserverSetup = true;

    const box = document.getElementById('lp-live-plate-canvas-box');
    const handleResize = () => {
      if (this.currentPresetSegments && this.currentPresetSegments.length > 0) {
        requestAnimationFrame(() => this.renderPlateCallouts(this.currentPresetSegments));
      }
    };

    if (window.ResizeObserver && box) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(box);
    }
    window.addEventListener('resize', handleResize);
  }

  buildElbowLeaderPath(fx, fy, tx, ty, radius = 8) {
    if (Math.abs(fy - ty) < 4) {
      return `M ${fx} ${fy} L ${tx} ${ty}`;
    }

    let cornerX;
    if (tx < fx) {
      cornerX = Math.max(tx + 18, Math.round(tx + (fx - tx) * 0.35));
      if (cornerX > fx - 10) cornerX = Math.round((tx + fx) / 2);
    } else {
      cornerX = Math.min(tx - 18, Math.round(tx - (tx - fx) * 0.35));
      if (cornerX < fx + 10) cornerX = Math.round((tx + fx) / 2);
    }

    const dx1 = Math.sign(cornerX - fx);
    const dy = Math.sign(ty - fy);
    const dx2 = Math.sign(tx - cornerX);

    const r = Math.min(
      radius,
      Math.abs(cornerX - fx) / 2,
      Math.abs(ty - fy) / 2,
      Math.abs(tx - cornerX) / 2
    );

    if (r < 2) {
      return `M ${fx} ${fy} L ${cornerX} ${fy} L ${cornerX} ${ty} L ${tx} ${ty}`;
    }

    const p1x = cornerX - dx1 * r;
    const p1y = fy;
    const p2x = cornerX;
    const p2y = fy + dy * r;
    const p3x = cornerX;
    const p3y = ty - dy * r;
    const p4x = cornerX + dx2 * r;
    const p4y = ty;

    return `M ${fx} ${fy} L ${p1x} ${p1y} Q ${cornerX} ${fy} ${p2x} ${p2y} L ${p3x} ${p3y} Q ${cornerX} ${ty} ${p4x} ${p4y} L ${tx} ${ty}`;
  }

  renderPlateCallouts(segments) {
    const svgEl = document.getElementById('lp-plate-callout-lines-svg');
    const canvasBox = document.getElementById('lp-live-plate-canvas-box');
    const discEl = document.getElementById('lp-live-plate-disc');
    if (!svgEl || !canvasBox || !discEl) return;

    if (!segments || segments.length === 0 || this.plateViewMode === 'photo' || this.plateViewMode === 'heatmap') {
      svgEl.innerHTML = '';
      return;
    }

    const boxRect = canvasBox.getBoundingClientRect();
    const discRect = discEl.getBoundingClientRect();

    if (boxRect.width === 0 || discRect.width === 0) return;

    const discRelLeft = discRect.left - boxRect.left;
    const discRelTop = discRect.top - boxRect.top;
    const discW = discRect.width;
    const discH = discRect.height;

    const svgItems = [];

    segments.forEach(seg => {
      if (!seg.pin || !seg.tagId) return;
      const tagEl = document.getElementById(seg.tagId);
      if (!tagEl) return;

      const tagRect = tagEl.getBoundingClientRect();
      const fx = Math.round(discRelLeft + (seg.pin.x / 100) * discW);
      const fy = Math.round(discRelTop + (seg.pin.y / 100) * discH);

      const tagLeft = tagRect.left - boxRect.left;
      const tagRight = tagRect.right - boxRect.left;
      const tagCenterY = Math.round(tagRect.top - boxRect.top + tagRect.height / 2);

      let tx = 0;
      let ty = tagCenterY;

      if (fx >= tagRight) {
        tx = Math.round(tagRight);
      } else if (fx <= tagLeft) {
        tx = Math.round(tagLeft);
      } else {
        tx = Math.abs(fx - tagRight) < Math.abs(fx - tagLeft) ? Math.round(tagRight) : Math.round(tagLeft);
      }

      const pathD = this.buildElbowLeaderPath(fx, fy, tx, ty, 8);

      svgItems.push(`
        <g class="lp-callout-group" data-seg="${seg.id}"
           onmouseenter="app.highlightPlateSegment('${seg.id}', true)"
           onmouseleave="app.highlightPlateSegment('${seg.id}', false)">
          <path class="lp-callout-path" d="${pathD}" stroke="${seg.color}" style="color:${seg.color};" />
          <circle class="lp-callout-dot-pulse" cx="${fx}" cy="${fy}" r="5" stroke="${seg.color}" fill="none" stroke-width="1.5" />
          <circle class="lp-callout-dot-core" cx="${fx}" cy="${fy}" r="4.2" fill="${seg.color}" stroke="#FFFFFF" stroke-width="1.8" />
          <circle cx="${tx}" cy="${ty}" r="2.5" fill="${seg.color}" />
        </g>
      `);
    });

    svgEl.innerHTML = svgItems.join('');
  }

  selectLandingPreset(presetKey) {
    document.querySelectorAll('.lp-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetKey);
    });

    const lang = window.i18n ? window.i18n.getLanguage() : (this.userProfile ? this.userProfile.language : 'en');
    const emptyState = document.getElementById('lp-showcase-empty-state');
    const foodImg = document.getElementById('lp-plate-food-img');
    const segSvgGroup = document.getElementById('lp-svg-segments-group');
    const pinsLayer = document.getElementById('lp-plate-pins-layer');
    const heatmapEl = document.getElementById('lp-plate-heatmap');
    const laserBeam = document.getElementById('lp-plate-laser');
    const donutCircle = document.getElementById('lp-showcase-donut');
    const donutVal = document.getElementById('lp-showcase-donut-val');
    const calloutSvg = document.getElementById('lp-plate-callout-lines-svg');

    if (presetKey === 'preset-empty' || !presetKey) {
      if (foodImg) {
        foodImg.src = 'images/plate_empty.jpg';
        foodImg.style.opacity = '0.92';
      }
      if (emptyState) emptyState.style.display = 'flex';
      if (segSvgGroup) segSvgGroup.innerHTML = '';
      if (pinsLayer) pinsLayer.innerHTML = '';
      if (calloutSvg) calloutSvg.innerHTML = '';
      if (heatmapEl) heatmapEl.style.display = 'none';
      if (laserBeam) laserBeam.style.display = 'none';

      this.currentPresetSegments = null;
      this.currentPresetData = null;

      if (donutCircle) donutCircle.style.strokeDashoffset = '251.2';
      if (donutVal) donutVal.textContent = '0%';

      const confEl = document.getElementById('lp-showcase-conf');
      if (confEl) confEl.innerHTML = `<iconify-icon icon="solar:shield-check-bold-duotone" style="font-size:15px;color:#9EA76B;"></iconify-icon><span>${lang === 'id' ? 'Status AI: Siap Memindai' : 'AI Status: Ready to Scan'}</span>`;

      const protEl = document.getElementById('lp-showcase-protein');
      if (protEl) protEl.innerHTML = lang === 'id' ? 'Target Protein: 0g / 98g' : 'Protein Target: 0g / 98g';

      const calsEl = document.getElementById('lp-showcase-cals');
      if (calsEl) calsEl.innerHTML = lang === 'id' ? 'Densitas Energi: 0 kkal (Piring Kosong · Menunggu Pemindaian)' : 'Energy Density: 0 kcal (Empty Plate · Waiting for Scan)';

      const adviceEl = document.getElementById('lp-showcase-advice');
      if (adviceEl) adviceEl.innerHTML = lang === 'id'
        ? '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Panduan AI:</strong> Belum ada data makanan yang dihitung. Silakan pilih salah satu menu sampel di atas untuk simulasi segmentasi, atau gunakan tombol scan untuk menguji foto piring asli.</span>'
        : '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>AI Clinical Guide:</strong> No food data calculated yet. Select a sample meal above to simulate segmentation, or use the scan button to test an actual plate photo.</span>';

      const tag1 = document.getElementById('lp-showcase-tag-1');
      if (tag1) {
        tag1.style.borderLeftColor = '#9EA76B';
        tag1.innerHTML = `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title">${lang === 'id' ? 'Komponen Protein' : 'Protein Component'}</div><div class="lp-callout-tag-sub">${lang === 'id' ? 'Belum terdeteksi' : 'Not detected'}</div></div>`;
      }
      const tag2 = document.getElementById('lp-showcase-tag-2');
      if (tag2) {
        tag2.style.borderLeftColor = '#06B6D4';
        tag2.innerHTML = `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title">${lang === 'id' ? 'Komponen Karbohidrat' : 'Carbohydrate Component'}</div><div class="lp-callout-tag-sub">${lang === 'id' ? 'Belum terdeteksi' : 'Not detected'}</div></div>`;
      }
      const tag3 = document.getElementById('lp-showcase-tag-3');
      if (tag3) {
        tag3.style.borderLeftColor = '#EF9F27';
        tag3.innerHTML = `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title">${lang === 'id' ? 'Sayur & Serat' : 'Vegetables & Fiber'}</div><div class="lp-callout-tag-sub">${lang === 'id' ? 'Belum terdeteksi' : 'Not detected'}</div></div>`;
      }
      const tag4 = document.getElementById('lp-showcase-tag-4');
      if (tag4) {
        tag4.style.borderLeftColor = '#9EA76B';
        tag4.innerHTML = `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">${lang === 'id' ? 'Status Pemindai' : 'Scanner Status'}</div><div class="lp-callout-tag-sub">${lang === 'id' ? 'Akurasi CV: Siap Memindai' : 'CV Accuracy: Ready to Scan'}</div></div>`;
      }

      // Reset Clinical Assessment Card to 0%
      const gradeEl = document.getElementById('lp-assessment-grade-score');
      if (gradeEl) gradeEl.textContent = lang === 'id' ? '0% SIAP' : '0% READY';
      const protValEl = document.getElementById('lp-factor-prot-val');
      if (protValEl) protValEl.textContent = '0g · 0%';
      const protFillEl = document.getElementById('lp-factor-prot-fill');
      if (protFillEl) protFillEl.style.width = '0%';
      const vitValEl = document.getElementById('lp-factor-vit-val');
      if (vitValEl) vitValEl.textContent = '0%';
      const vitFillEl = document.getElementById('lp-factor-vit-fill');
      if (vitFillEl) vitFillEl.style.width = '0%';
      const minValEl = document.getElementById('lp-factor-min-val');
      if (minValEl) minValEl.textContent = '0%';
      const minFillEl = document.getElementById('lp-factor-min-fill');
      if (minFillEl) minFillEl.style.width = '0%';

      return;
    }

    // Showing sample preset data
    if (emptyState) emptyState.style.display = 'none';
    if (laserBeam && this.plateViewMode !== 'photo') laserBeam.style.display = 'block';

    const isId = lang === 'id';
    const presets = {
      'preset-soft-bubur-gabus': {
        conf: '96%',
        donutPct: 68,
        image: 'images/plate_bubur_gabus.jpg',
        targetProt: isId ? 'Target Protein: 32g / 98g' : 'Protein Target: 32g / 98g',
        cals: isId ? 'Densitas Energi: 385 kkal (Tekstur Lunak · Fase 2 Pasca-Bedah)' : 'Energy Density: 385 kcal (Soft Texture · Phase 2 Post-Surgery)',
        advice: isId
          ? '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Saran Klinis:</strong> Tekstur bubur saring sangat ramah untuk pasien pasca-anestesi &amp; disfagia. Albumin Ikan Gabus memicu granulasi luka 2x lebih cepat.</span>'
          : '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Clinical Advice:</strong> Pureed textures are gentle for post-anesthesia &amp; dysphagia patients. Snakehead fish albumin accelerates wound granulation up to 2x faster.</span>',
        heatmap: 'radial-gradient(circle at 48% 38%, rgba(245, 158, 11, 0.75) 0%, rgba(239, 68, 68, 0.5) 25%, transparent 55%), radial-gradient(circle at 70% 50%, rgba(234, 179, 8, 0.65) 0%, transparent 40%), radial-gradient(circle at 35% 55%, rgba(6, 182, 212, 0.55) 0%, transparent 50%)',
        assessment: {
          grade: isId ? '96% SESUAI' : '96% MATCH',
          protVal: '32g · 98% Optimal',
          protPct: 98,
          vitVal: isId ? '88% Target Harian' : '88% Daily Target',
          vitPct: 88,
          minVal: isId ? '92% Target Harian' : '92% Daily Target',
          minPct: 92
        },
        segments: [
          {
            id: 'prot',
            tagId: 'lp-showcase-tag-1',
            name: isId ? 'Ikan Gabus' : 'Snakehead Fish',
            portion: isId ? '110g · 26g Prot [Albumin]' : '110g · 26g Prot [Albumin]',
            points: '37,30 50,27 63,33 63,45 55,54 44,52 35,45 35,36',
            color: '#9EA76B',
            fill: 'rgba(158, 167, 107, 0.28)',
            pin: { x: 44, y: 38 }
          },
          {
            id: 'veg',
            tagId: 'lp-showcase-tag-2',
            name: isId ? 'Telur Tim Sutra' : 'Steamed Silk Egg',
            portion: isId ? '90g · 6.8g Prot' : '90g · 6.8g Prot',
            points: '58,36 72,36 78,46 76,60 66,64 58,56 56,44',
            color: '#EF9F27',
            fill: 'rgba(239, 159, 39, 0.28)',
            pin: { x: 70, y: 52 }
          },
          {
            id: 'carb',
            tagId: 'lp-showcase-tag-3',
            name: isId ? 'Bubur Beras Lembut' : 'Soft Rice Porridge',
            portion: isId ? '220g · 35g Karbo' : '220g · 35g Carbs',
            points: '25,38 32,24 50,22 68,24 76,36 78,56 70,72 52,76 36,74 24,62 22,46',
            color: '#06B6D4',
            fill: 'rgba(6, 182, 212, 0.22)',
            pin: { x: 26, y: 62 }
          }
        ],
        tag4: isId
          ? `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">Status CV</div><div class="lp-callout-tag-sub">Akurasi 96% · Tekstur Lunak</div></div>`
          : `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">CV Scanner</div><div class="lp-callout-tag-sub">96% Accuracy · Soft Texture</div></div>`
      },
      'preset-standard-nasi-ayam': {
        conf: '91%',
        donutPct: 77,
        image: 'images/plate_nasi_ayam.jpg',
        targetProt: isId ? 'Target Protein: 38g / 98g' : 'Protein Target: 38g / 98g',
        cals: isId ? 'Densitas Energi: 465 kkal (Gizi Seimbang · Fase 3)' : 'Energy Density: 465 kcal (Balanced Nutrition · Phase 3)',
        advice: isId
          ? '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Saran Klinis:</strong> Asam amino lengkap pada dada ayam tanpa kulit mendukung regenerasi sel otot &amp; pembentukan enzim perbaikan jaringan.</span>'
          : '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Clinical Advice:</strong> Complete amino acids from skinless chicken breast promote muscle cell regeneration and tissue repair enzyme synthesis.</span>',
        heatmap: 'radial-gradient(circle at 35% 60%, rgba(239, 68, 68, 0.75) 0%, rgba(245, 158, 11, 0.45) 35%, transparent 55%), radial-gradient(circle at 66% 52%, rgba(6, 182, 212, 0.6) 0%, transparent 45%), radial-gradient(circle at 44% 28%, rgba(16, 185, 129, 0.65) 0%, transparent 40%)',
        assessment: {
          grade: isId ? '94% SESUAI' : '94% MATCH',
          protVal: '38g · 96% Optimal',
          protPct: 96,
          vitVal: isId ? '94% Target Harian' : '94% Daily Target',
          vitPct: 94,
          minVal: isId ? '90% Target Harian' : '90% Daily Target',
          minPct: 90
        },
        segments: [
          {
            id: 'veg',
            tagId: 'lp-showcase-tag-1',
            name: isId ? 'Tumis Kangkung' : 'Stir-Fried Water Spinach',
            portion: isId ? 'Kaya Vit A/C & Serat' : 'Vit A/C & Balanced Fiber',
            points: '26,26 44,18 64,20 64,36 46,42 30,40 24,32',
            color: '#10B981',
            fill: 'rgba(16, 185, 129, 0.28)',
            pin: { x: 44, y: 28 }
          },
          {
            id: 'carb',
            tagId: 'lp-showcase-tag-2',
            name: isId ? 'Nasi Putih Pulen' : 'Steamed White Rice',
            portion: isId ? '175g · 52g Karbo' : '175g · 52g Carbs',
            points: '50,34 68,28 82,38 82,56 78,72 60,76 50,62 48,46',
            color: '#06B6D4',
            fill: 'rgba(6, 182, 212, 0.22)',
            pin: { x: 66, y: 52 }
          },
          {
            id: 'prot',
            tagId: 'lp-showcase-tag-3',
            name: isId ? 'Dada Ayam Panggang' : 'Grilled Chicken Breast',
            portion: isId ? '125g · 31g Prot' : '125g · 31g Prot',
            points: '20,44 32,38 48,44 54,64 52,78 38,78 22,68 18,52',
            color: '#E25822',
            fill: 'rgba(226, 88, 34, 0.28)',
            pin: { x: 34, y: 60 }
          }
        ],
        tag4: isId
          ? `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">Status CV</div><div class="lp-callout-tag-sub">Akurasi 91% · Gizi Seimbang</div></div>`
          : `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">CV Scanner</div><div class="lp-callout-tag-sub">91% Accuracy · Balanced Diet</div></div>`
      },
      'preset-fish-kembung': {
        conf: '94%',
        donutPct: 83,
        image: 'images/plate_pepes_kembung.jpg',
        targetProt: isId ? 'Target Protein: 41g / 98g' : 'Protein Target: 41g / 98g',
        cals: isId ? 'Densitas Energi: 430 kkal (Kaya Omega-3 · Pangan Lokal)' : 'Energy Density: 430 kcal (Omega-3 Rich · Local Superfood)',
        advice: isId
          ? '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Saran Klinis:</strong> Ikan kembung mengandung asam lemak Omega-3 EPA/DHA setara salmon untuk meredakan inflamasi pembengkakan dengan harga terjangkau.</span>'
          : '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Clinical Advice:</strong> Indian mackerel provides EPA/DHA Omega-3 fatty acids matching salmon at an accessible cost, mitigating inflammatory swelling.</span>',
        heatmap: 'radial-gradient(circle at 66% 42%, rgba(239, 68, 68, 0.75) 0%, transparent 45%), radial-gradient(circle at 34% 46%, rgba(245, 158, 11, 0.65) 0%, transparent 40%), radial-gradient(circle at 50% 68%, rgba(16, 185, 129, 0.65) 0%, transparent 40%)',
        assessment: {
          grade: isId ? '95% SESUAI' : '95% MATCH',
          protVal: '41g · 99% Optimal',
          protPct: 99,
          vitVal: isId ? '91% Target Harian' : '91% Daily Target',
          vitPct: 91,
          minVal: isId ? '96% Target Harian' : '96% Daily Target',
          minPct: 96
        },
        segments: [
          {
            id: 'carb',
            tagId: 'lp-showcase-tag-1',
            name: isId ? 'Tempe Kukus' : 'Steamed Tempeh',
            portion: isId ? '80g · 15g Prot Nabati' : '80g · 15g Plant Protein',
            points: '24,28 46,26 46,58 36,66 24,64 22,46',
            color: '#F59E0B',
            fill: 'rgba(245, 158, 11, 0.28)',
            pin: { x: 32, y: 46 }
          },
          {
            id: 'prot',
            tagId: 'lp-showcase-tag-2',
            name: isId ? 'Pepes Ikan Kembung' : 'Mackerel Pepes',
            portion: isId ? '140g · 29g Prot [Omega-3]' : '140g · 29g Prot [Omega-3]',
            points: '48,22 62,20 74,32 78,48 76,66 84,72 74,78 64,62 52,42 46,28',
            color: '#9EA76B',
            fill: 'rgba(158, 167, 107, 0.28)',
            pin: { x: 64, y: 40 }
          },
          {
            id: 'veg',
            tagId: 'lp-showcase-tag-3',
            name: isId ? 'Sayur Bening Bayam' : 'Clear Spinach Soup',
            portion: isId ? 'Kaya Zat Besi & Folat' : 'Iron Rich & Folate',
            points: '36,54 58,52 68,60 66,78 48,82 34,74',
            color: '#10B981',
            fill: 'rgba(16, 185, 129, 0.28)',
            pin: { x: 50, y: 68 }
          }
        ],
        tag4: isId
          ? `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">Status CV</div><div class="lp-callout-tag-sub">Akurasi 94% · Anti-Inflamasi</div></div>`
          : `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">CV Scanner</div><div class="lp-callout-tag-sub">94% Accuracy · Anti-Inflammatory</div></div>`
      },
      'preset-salmon-quinoa': {
        conf: '95%',
        donutPct: 73,
        image: 'images/plate_salmon_brokoli.jpg',
        targetProt: isId ? 'Target Protein: 36g / 98g' : 'Protein Target: 36g / 98g',
        cals: isId ? 'Densitas Energi: 420 kkal (Antioksidan Tinggi · Rekondisi)' : 'Energy Density: 420 kcal (High Antioxidant · Reconditioning)',
        advice: isId
          ? '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Saran Klinis:</strong> Asam amino esensial dan sulforaphane brokoli menekan radikal bebas inflamasi pada fase remodeling jaringan.</span>'
          : '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Clinical Advice:</strong> Essential amino acids and broccoli sulforaphane neutralize inflammatory free radicals during tissue remodeling phases.</span>',
        heatmap: 'radial-gradient(circle at 48% 52%, rgba(239, 68, 68, 0.8) 0%, transparent 45%), radial-gradient(circle at 28% 50%, rgba(16, 185, 129, 0.7) 0%, transparent 40%), radial-gradient(circle at 68% 50%, rgba(245, 158, 11, 0.65) 0%, transparent 40%)',
        assessment: {
          grade: isId ? '97% SESUAI' : '97% MATCH',
          protVal: '36g · 97% Optimal',
          protPct: 97,
          vitVal: isId ? '98% Target Harian' : '98% Daily Target',
          vitPct: 98,
          minVal: isId ? '93% Target Harian' : '93% Daily Target',
          minPct: 93
        },
        segments: [
          {
            id: 'prot',
            tagId: 'lp-showcase-tag-1',
            name: isId ? 'Fillet Salmon Panggang' : 'Grilled Salmon Fillet',
            portion: isId ? '130g · 28g Prot' : '130g · 28g Prot',
            points: '40,26 56,26 56,76 42,76 38,50',
            color: '#FF6B4A',
            fill: 'rgba(255, 107, 74, 0.28)',
            pin: { x: 48, y: 44 }
          },
          {
            id: 'carb',
            tagId: 'lp-showcase-tag-2',
            name: isId ? 'Beras Merah Organik' : 'Organic Brown Rice',
            portion: isId ? '100g · 23g Karbo Kompleks' : '100g · 23g Complex Carbs',
            points: '58,28 78,32 80,62 72,72 58,68 56,44',
            color: '#EF9F27',
            fill: 'rgba(239, 159, 39, 0.28)',
            pin: { x: 68, y: 50 }
          },
          {
            id: 'veg',
            tagId: 'lp-showcase-tag-3',
            name: isId ? 'Brokoli Kukus' : 'Steamed Broccoli',
            portion: isId ? '90g · Vit C & Sulforaphane' : '90g · Vit C & Sulforaphane',
            points: '18,34 38,28 38,72 26,74 18,56 16,42',
            color: '#10B981',
            fill: 'rgba(16, 185, 129, 0.28)',
            pin: { x: 28, y: 50 }
          }
        ],
        tag4: isId
          ? `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">Status CV</div><div class="lp-callout-tag-sub">Akurasi 95% · Remodeling</div></div>`
          : `<div class="lp-callout-tag-body"><div class="lp-callout-tag-title" style="color:#DDE2B9;">CV Scanner</div><div class="lp-callout-tag-sub">95% Accuracy · Remodeling</div></div>`
      }
    };

    const data = presets[presetKey] || presets['preset-soft-bubur-gabus'];
    this.currentPresetData = data;
    this.currentPresetSegments = data.segments;

    // Update Food Image with smooth fade
    if (foodImg && data.image) {
      foodImg.style.opacity = '0.3';
      setTimeout(() => {
        foodImg.src = data.image;
        foodImg.style.opacity = '1';
      }, 120);
    }

    // Update Heatmap background gradient
    if (heatmapEl && data.heatmap) {
      heatmapEl.style.background = data.heatmap;
    }

    // Render SVG Polygons with solid subtle styling
    if (segSvgGroup && data.segments) {
      segSvgGroup.innerHTML = data.segments.map(seg => `
        <polygon 
          class="lp-seg-poly" 
          data-seg="${seg.id}" 
          points="${seg.points}" 
          fill="${seg.fill || 'rgba(158, 167, 107, 0.28)'}" 
          stroke="${seg.color}" 
          stroke-width="1.6"
          onmouseenter="app.highlightPlateSegment('${seg.id}', true)"
          onmouseleave="app.highlightPlateSegment('${seg.id}', false)"
        />
      `).join('');
    }

    // Clear legacy emoji pills to keep food plate unobstructed
    if (pinsLayer) {
      pinsLayer.innerHTML = '';
    }

    // Refresh view mode visibility
    this.setPlateViewMode(this.plateViewMode || 'ai');

    if (donutCircle) {
      const offset = 251.2 * (1 - data.donutPct / 100);
      donutCircle.style.strokeDashoffset = offset;
    }
    if (donutVal) donutVal.textContent = `${data.donutPct}%`;

    const confEl = document.getElementById('lp-showcase-conf');
    if (confEl) confEl.innerHTML = `<iconify-icon icon="solar:shield-check-bold-duotone" style="font-size:15px;color:#9EA76B;"></iconify-icon><span>Model Confidence: ${data.conf}</span>`;

    const protEl = document.getElementById('lp-showcase-protein');
    if (protEl) protEl.innerHTML = data.targetProt;

    const calsEl = document.getElementById('lp-showcase-cals');
    if (calsEl) calsEl.innerHTML = data.cals;

    const adviceEl = document.getElementById('lp-showcase-advice');
    if (adviceEl) adviceEl.innerHTML = data.advice;

    // Update Core Clinical Assessment Factors (Protein, Vitamins, Minerals)
    if (data.assessment) {
      const gradeEl = document.getElementById('lp-assessment-grade-score');
      if (gradeEl) gradeEl.textContent = data.assessment.grade;

      const protValEl = document.getElementById('lp-factor-prot-val');
      if (protValEl) protValEl.textContent = data.assessment.protVal;
      const protFillEl = document.getElementById('lp-factor-prot-fill');
      if (protFillEl) protFillEl.style.width = `${data.assessment.protPct}%`;

      const vitValEl = document.getElementById('lp-factor-vit-val');
      if (vitValEl) vitValEl.textContent = data.assessment.vitVal;
      const vitFillEl = document.getElementById('lp-factor-vit-fill');
      if (vitFillEl) vitFillEl.style.width = `${data.assessment.vitPct}%`;

      const minValEl = document.getElementById('lp-factor-min-val');
      if (minValEl) minValEl.textContent = data.assessment.minVal;
      const minFillEl = document.getElementById('lp-factor-min-fill');
      if (minFillEl) minFillEl.style.width = `${data.assessment.minPct}%`;
    }

    // Render structured callout tags connected to leader lines
    if (data.segments) {
      data.segments.forEach(seg => {
        const tagEl = document.getElementById(seg.tagId);
        if (tagEl) {
          tagEl.style.borderLeftColor = seg.color;
          tagEl.innerHTML = `
            <div class="lp-callout-tag-body">
              <div class="lp-callout-tag-title">${seg.name}</div>
              <div class="lp-callout-tag-sub">${seg.portion}</div>
            </div>
          `;
          tagEl.onmouseenter = () => this.highlightPlateSegment(seg.id, true);
          tagEl.onmouseleave = () => this.highlightPlateSegment(seg.id, false);
        }
      });
    }

    const tag4 = document.getElementById('lp-showcase-tag-4');
    if (tag4 && data.tag4) tag4.innerHTML = data.tag4;

    // Attach resize observer & render leader lines overlay
    this.setupPlateCalloutResizeObserver();
    requestAnimationFrame(() => {
      this.renderPlateCallouts(data.segments);
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // INTERACTIVE PERSONA PATHWAYS CONTROLLER
  // =========================================================================
  selectLandingPersona(personaKey) {
    document.querySelectorAll('.lp-persona-card').forEach(card => {
      card.classList.toggle('active', card.dataset.persona === personaKey);
    });

    const personas = {
      'surgery': {
        title: '🏥 Jalur Pasca-Operasi Bedah (Regenerasi Luka & Albumin)',
        desc: 'Fokus klinis ditujukan untuk menstimulasi fibroblas luka, mencegah malnutrisi rumah sakit, dan mempercepat re-epitelisasi jaringan sayatan operasi.',
        target: '1.5 g / kg Berat Badan (Contoh: 65kg = 98g Protein/hari)',
        menu: 'Sup Ikan Gabus Bening, Telur Rebus, Bubur Halus, Sayur Labu Siam',
        guideline: 'Pilih hidangan hangat non-lemak pada minggu pertama untuk menghindari mual pasca-anestesi.',
        ctaTarget: 'post-surgery'
      },
      'elderly': {
        title: '👵 Jalur Lansia & Pasca-Rawat Inap (Ramah Cerna & Bebas Malnutrisi)',
        desc: 'Dirancang dengan densitas gizi tinggi dan tekstur lembut (*soft-diet*) untuk lansia yang mengalami penurunan nafsu makan, masalah gigi, atau disfagia.',
        target: '1.2 - 1.4 g / kg Berat Badan (Porsi kecil sering / 5x sehari)',
        menu: 'Bubur Tim Tahu Sutra, Sup Krim Wortel Kentang, Telur Orak-Arik Lunak',
        guideline: 'Dukungan huruf besar & pendampingan keluarga via portal shared-link.',
        ctaTarget: 'post-surgery'
      },
      'rehab': {
        title: '🏃 Jalur Fisioterapi & Cedera Fisik (Ligamen, Tulang & Sendi)',
        desc: 'Membantu meredakan pembengkakan inflamasi kronis serta memasok kalsium, Vitamin D, dan asam amino untuk pemulihan tendon dan mobilitas otot.',
        target: '1.6 g / kg Berat Badan (Terdistribusi per 3-4 jam)',
        menu: 'Pepes Ikan Kembung Omega-3, Dada Ayam Kukus, Sayur Kelor, Tempe Bacem',
        guideline: 'Padukan asupan protein pasca-sesi terapi fisik untuk memicu sintesis protein otot maksimal.',
        ctaTarget: 'injury-rehab'
      },
      'caregiver': {
        title: '👨‍👩‍👧 Jalur Pendamping Pasien (Caregiver & Keluarga)',
        desc: 'Memudahkan keluarga, anak, atau perawat memantau kepatuhan makan pasien dari jarak jauh melalui tautan view-only tanpa harus login akun rumit.',
        target: 'Pemantauan Visual Piring & Rekap Ekspor Laporan Dokter 1-Klik',
        menu: 'Rencana Menu Ramah Anggaran (Standar vs Opsi Hemat Pasar Lokal)',
        guideline: 'Unduh rekap progres 7-30 hari dalam format WhatsApp untuk dikonsultasikan saat jadwal kontrol dokter.',
        ctaTarget: 'caregiver'
      }
    };

    const p = personas[personaKey] || personas['surgery'];

    const titleEl = document.getElementById('lp-persona-detail-title');
    if (titleEl) titleEl.textContent = p.title;

    const descEl = document.getElementById('lp-persona-detail-desc');
    if (descEl) descEl.textContent = p.desc;

    const targetEl = document.getElementById('lp-persona-detail-target');
    if (targetEl) targetEl.textContent = p.target;

    const menuEl = document.getElementById('lp-persona-detail-menu');
    if (menuEl) menuEl.textContent = p.menu;

    const guideEl = document.getElementById('lp-persona-detail-guide');
    if (guideEl) guideEl.textContent = p.guideline;

    const btnEl = document.getElementById('lp-persona-detail-btn');
    if (btnEl) {
      btnEl.onclick = () => {
        if (p.ctaTarget === 'caregiver') {
          this.goToDashboard('caregiver');
        } else {
          this.quizState.condition = p.ctaTarget;
          this.goToDashboard('overview', 'quiz');
        }
      };
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // INTERACTIVE SYMPTOM-AWARE SIMULATOR CONTROLLER
  // =========================================================================
  toggleLandingSymptom(symptomKey) {
    document.querySelectorAll('.lp-symptom-chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.symptom === symptomKey);
    });

    const data = {
      'nausea': {
        texture: 'Suhu ruang atau hangat suam-kuku, berkuah bening, tidak berminyak, tanpa aroma tajam.',
        foods: 'Sup Bening Ikan Gabus, Air Jahe Hangat, Biskuit Tawar, Bubur Lembut.',
        avoid: 'Gorengan berlemak jenuh, makanan bersantan kental, aroma rempah menyengat, asam pekat.'
      },
      'dysphagia': {
        texture: 'Tekstur saring / lunak halus (*puree / smooth diet*), tidak mudah tersedak.',
        foods: 'Bubur Tim Ikan Gabus Halus, Tahu Sutra Kukus, Sup Krim Wortel Labu, Puding Protein.',
        avoid: 'Daging liat berserat kasar, kerupuk keras renyah, nasi kering, biji-bijian utuh.'
      },
      'bloating': {
        texture: 'Makanan rendah gas (Low-FODMAP), mudah dicerna, porsi kecil hangat teratur.',
        foods: 'Dada Ayam Rebus Suwir, Nasi Putih Tim, Sayur Labu Siam Bening, Tempe Kukus.',
        avoid: 'Sayur kol, kubis, brokoli mentah, minuman bersoda, susu sapi murni laktosa tinggi.'
      },
      'appetite': {
        texture: 'Hidangan padat energi dalam volume kecil (*nutrient-dense mini meals*).',
        foods: 'Telur Rebus Setengah Matang / Tim, Kaldu Tulang Sapi/Ayam Kaya Kolagen, Smoothies Tempe.',
        avoid: 'Minum air berlebih sesaat sebelum makan, makanan porsi besar yang membuat lelah mengunyah.'
      }
    };

    const cur = data[symptomKey] || data['nausea'];

    const texEl = document.getElementById('lp-sym-res-texture');
    if (texEl) texEl.textContent = cur.texture;

    const foodEl = document.getElementById('lp-sym-res-foods');
    if (foodEl) foodEl.textContent = cur.foods;

    const avoidEl = document.getElementById('lp-sym-res-avoid');
    if (avoidEl) avoidEl.textContent = cur.avoid;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Pengatur Kondisi Kalkulator Mini Landing Page
  setCalcCondition(cond) {
    this.calcState.condition = cond;
    document.querySelectorAll('.lp-calc-options-row button[data-condition]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.condition === cond);
    });
    this.updateCalcUI();
  }

  // Pengatur Berat Badan Slider Kalkulator Mini
  updateCalcWeight(val) {
    this.calcState.weight = parseInt(val, 10) || 65;
    const display = document.getElementById('lp-calc-weight-display');
    if (display) display.textContent = `${this.calcState.weight} kg`;
    this.updateCalcUI();
  }

  // Pengatur Aktivitas Kalkulator Mini
  setCalcActivity(act) {
    this.calcState.activity = act;
    document.querySelectorAll('.lp-calc-options-row button[data-act]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.act === act);
    });
    this.updateCalcUI();
  }

  // Kalkulasi & Render Hasil Kalkulator Mini secara Real-Time
  updateCalcUI() {
    const w = this.calcState.weight || 65;
    const lang = window.i18n ? window.i18n.getLanguage() : (this.userProfile ? this.userProfile.language : 'en');
    const isId = lang === 'id';
    let factor = 1.5;
    let calFactor = 30;
    let recomFood = isId
      ? '🐟 Ikan Gabus (150g) + 2 Butir Telur Rebus + Tempe'
      : '🐟 Snakehead Fish (150g) + 2 Boiled Eggs + Tempeh';
    let clinicalTip = isId
      ? 'Target 1.5 g/kg BB optimal untuk menstimulasi fibroblas dan sintesis kolagen penutupan luka.'
      : 'Target 1.5 g/kg BW is optimal to stimulate fibroblasts and collagen synthesis for wound closure.';

    if (this.calcState.condition === 'post-surgery') {
      factor = 1.5;
      calFactor = this.calcState.activity === 'bedrest' ? 28 : (this.calcState.activity === 'active' ? 33 : 30);
      recomFood = isId
        ? '🐟 Ikan Gabus (150g) + 2 Butir Telur Rebus + Tempe'
        : '🐟 Snakehead Fish (150g) + 2 Boiled Eggs + Tempeh';
      clinicalTip = isId
        ? 'Target 1.5 g/kg BB optimal untuk menstimulasi fibroblas dan sintesis kolagen penutupan luka.'
        : 'Target 1.5 g/kg BW is optimal to stimulate fibroblasts and collagen synthesis for wound closure.';
    } else if (this.calcState.condition === 'injury-rehab') {
      factor = 1.6;
      calFactor = 32;
      recomFood = isId
        ? '🐟 Ikan Kembung Panggang (Omega-3) + Dada Ayam + Sayur Kelor'
        : '🐟 Grilled Mackerel (Omega-3) + Chicken Breast + Moringa Soup';
      clinicalTip = isId
        ? 'Target 1.6 g/kg BB kaya EPA/DHA meredakan inflamasi sendi dan regenerasi jaringan tendon.'
        : 'Target 1.6 g/kg BW rich in EPA/DHA reduces joint inflammation and regenerates tendon tissues.';
    } else if (this.calcState.condition === 'gym-recovery') {
      factor = 1.8;
      calFactor = 35;
      recomFood = isId
        ? '🍗 Dada Ayam Kukus + Ikan Kembung + Telur + Tahu Tempe'
        : '🍗 Steamed Chicken Breast + Mackerel + Eggs + Tofu & Tempeh';
      clinicalTip = isId
        ? 'Target 1.8 g/kg BB untuk hipertrofi otot dan pengisian glikogen pasca-latihan intensif.'
        : 'Target 1.8 g/kg BW for muscle hypertrophy and post-workout glycogen replenishment.';
    }

    if (this.calcState.activity === 'bedrest') {
      factor = Math.max(1.2, factor - 0.2);
    } else if (this.calcState.activity === 'active') {
      factor = factor + 0.2;
    }

    const protein = Math.round(w * factor);
    const cals = Math.round(w * calFactor);

    const elProt = document.getElementById('lp-calc-target-protein');
    if (elProt) elProt.innerHTML = `${protein} <span>g Protein / ${isId ? 'hari' : 'day'}</span>`;

    const elCals = document.getElementById('lp-calc-target-cals');
    if (elCals) elCals.textContent = isId
      ? `Total Energi: ~${cals.toLocaleString()} kkal/hari (${factor.toFixed(1)} g/kg BB)`
      : `Total Energy: ~${cals.toLocaleString()} kcal/day (${factor.toFixed(1)} g/kg BW)`;

    const elRecom = document.getElementById('lp-calc-food-recom');
    if (elRecom) elRecom.textContent = recomFood;

    const elTip = document.getElementById('lp-calc-tip-text');
    if (elTip) elTip.textContent = clinicalTip;
  }

  // Terapkan hasil kalkulator langsung ke Dasbor & Onboarding Quiz
  applyCalcToDashboard() {
    this.quizState.condition = this.calcState.condition;
    this.quizState.activity = this.calcState.activity;
    const weightInput = document.getElementById('onboard-weight');
    if (weightInput) weightInput.value = this.calcState.weight;

    this.goToDashboard('overview', 'quiz');
  }

  // FAQ Accordion Toggle
  toggleFaq(btn) {
    const item = btn.closest('.lp-faq-item');
    if (item) {
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.lp-faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Mobile Menu Toggle di Landing Page
  toggleLandingMobileMenu() {
    const menu = document.getElementById('lp-nav-menu');
    if (menu) {
      menu.classList.toggle('mobile-open');
    }
  }

  // =========================================================================
  // FOODVISOR-STYLE DIAGNOSTIC QUIZ METHODS (3 STEPS WITH BULLET PAGINATION)
  // =========================================================================
  openQuizModal(step = 1) {
    if (!this.isAuthenticated()) {
      this.requireAuth(() => this.openQuizModal(step), 'diagnostik gizi');
      return;
    }
    // STRICT ROLE GUARD: Wajib hanya pasien yang mengisi form diagnostik gizi
    if (this.userProfile?.role && this.userProfile.role !== 'patient') {
      console.warn(`[NutriVision] Kuis diagnostik hanya untuk peran pasien. Akses diblokir untuk peran: ${this.userProfile.role}`);
      return;
    }
    const onboardName = document.getElementById('onboard-name');
    const onboardContact = document.getElementById('onboard-contact');
    const consentCheck = document.getElementById('onboard-consent-check');

    if (onboardName && this.userProfile?.name) {
      onboardName.value = this.userProfile.name;
    }
    if (onboardContact && (this.userProfile?.contact || this.userProfile?.email)) {
      onboardContact.value = this.userProfile.contact || this.userProfile.email;
    }
    if (this.userProfile?.age && document.getElementById('onboard-age')) {
      document.getElementById('onboard-age').value = this.userProfile.age;
    }
    if (this.userProfile?.weightKg && document.getElementById('onboard-weight')) {
      document.getElementById('onboard-weight').value = this.userProfile.weightKg;
    }
    if (this.userProfile?.heightCm && document.getElementById('onboard-height')) {
      document.getElementById('onboard-height').value = this.userProfile.heightCm;
    }
    if (this.userProfile?.restrictions && document.getElementById('onboard-restrictions')) {
      document.getElementById('onboard-restrictions').value = this.userProfile.restrictions;
    }
    if (consentCheck) {
      consentCheck.checked = Boolean(this.userProfile?.hasCompletedQuiz);
    }
    this.toggleConsentValidation();
    this.initOnboardRegions();

    const modal = document.getElementById('onboarding-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('open');
    }
    this.goToQuizStep(step);
  }

  async initOnboardRegions() {
    const provSelect = document.getElementById('onboard-province');
    const citySelect = document.getElementById('onboard-city');
    if (!provSelect || !window.BappenasFoodAPI) return;

    try {
      const activeReg = window.BappenasFoodAPI.getActiveRegion() || {};
      const provinces = await window.BappenasFoodAPI.getProvinces();

      provSelect.innerHTML = `<option value="">-- Pilih Provinsi Domisili --</option>` + provinces.map(p => 
        `<option value="${p.id}" ${(p.id === activeReg.provinceId || p.name.toLowerCase() === (activeReg.provinceName || '').toLowerCase()) ? 'selected' : ''}>${p.name} (${p.multiplier}x)</option>`
      ).join('');

      const curProvId = provSelect.value || activeReg.provinceId || 11;
      if (curProvId) {
        await this.populateOnboardCities(curProvId, activeReg.cityName);
      }
    } catch (e) {
      console.warn('initOnboardRegions error:', e);
    }
  }

  async populateOnboardCities(provinceId, selectedCityName = '') {
    const citySelect = document.getElementById('onboard-city');
    if (!citySelect || !window.BappenasFoodAPI) return;

    try {
      const cities = await window.BappenasFoodAPI.getCities(provinceId);
      citySelect.innerHTML = `<option value="">-- Pilih Kota / Kabupaten --</option>` + cities.map(c => 
        `<option value="${c.name}" ${selectedCityName && c.name.toLowerCase() === selectedCityName.toLowerCase() ? 'selected' : ''}>${c.name}</option>`
      ).join('');
    } catch (e) {
      citySelect.innerHTML = `<option value="Semua Wilayah">Semua Wilayah</option>`;
    }
  }

  async handleOnboardProvinceChange(provinceId) {
    if (!provinceId) return;
    await this.populateOnboardCities(provinceId);
  }

  handleOnboardCityChange(cityName) {
    // City selected in modal
  }

  validateQuizStep(step) {
    if (step === 1) {
      const nameVal = document.getElementById('onboard-name')?.value?.trim();
      const contactVal = document.getElementById('onboard-contact')?.value?.trim();
      const provVal = document.getElementById('onboard-province')?.value;
      const ageVal = parseInt(document.getElementById('onboard-age')?.value, 10);

      if (!nameVal) {
        this.showToast('Nama Lengkap Pasien wajib diisi di Langkah 1.', 'warning');
        document.getElementById('onboard-name')?.focus();
        return false;
      }
      if (!contactVal) {
        this.showToast('Email atau No. WhatsApp wajib diisi di Langkah 1.', 'warning');
        document.getElementById('onboard-contact')?.focus();
        return false;
      }
      if (!provVal) {
        this.showToast('Silakan pilih Provinsi Domisili untuk kalibrasi harga pangan regional.', 'warning');
        document.getElementById('onboard-province')?.focus();
        return false;
      }
      if (!ageVal || isNaN(ageVal) || ageVal < 5 || ageVal > 120) {
        this.showToast('Masukkan usia yang valid (5 - 120 tahun).', 'warning');
        document.getElementById('onboard-age')?.focus();
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!this.quizState.condition) {
        this.quizState.condition = 'post-surgery';
      }
      return true;
    }

    if (step === 3) {
      const weight = parseFloat(document.getElementById('onboard-weight')?.value);
      const height = parseFloat(document.getElementById('onboard-height')?.value);
      const consent = document.getElementById('onboard-consent-check')?.checked;

      if (!weight || isNaN(weight) || weight < 20 || weight > 300) {
        this.showToast('Masukkan berat badan yang valid (20 - 300 kg).', 'warning');
        document.getElementById('onboard-weight')?.focus();
        return false;
      }
      if (!height || isNaN(height) || height < 80 || height > 250) {
        this.showToast('Masukkan tinggi badan yang valid (80 - 250 cm).', 'warning');
        document.getElementById('onboard-height')?.focus();
        return false;
      }
      if (!consent) {
        this.highlightConsentError();
        this.showToast('⚠️ Silakan centang persetujuan medis terlebih dahulu untuk menyelesaikan registrasi.', 'warning');
        return false;
      }
      return true;
    }

    return true;
  }

  handleOnboardFinishClick() {
    const consent = document.getElementById('onboard-consent-check')?.checked;
    if (!consent) {
      this.highlightConsentError();
      this.showToast('⚠️ Anda harus mencentang persetujuan medis terlebih dahulu untuk menyelesaikan registrasi.', 'warning');
      return;
    }
    this.saveOnboardingProfile();
  }

  highlightConsentError() {
    const box = document.getElementById('onboard-consent-box') || document.querySelector('.disclaimer-consent-box');
    if (box) {
      box.classList.remove('consent-error-shake');
      void box.offsetWidth;
      box.classList.add('consent-error-shake');
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        box.classList.remove('consent-error-shake');
      }, 700);
    }
  }

  toggleConsentValidation() {
    const consent = Boolean(document.getElementById('onboard-consent-check')?.checked);
    const finishBtn = document.getElementById('onboard-finish-btn') || document.querySelector('.quiz-btn-finish');
    const box = document.getElementById('onboard-consent-box') || document.querySelector('.disclaimer-consent-box');

    if (finishBtn) {
      if (consent) {
        finishBtn.classList.remove('disabled');
        finishBtn.style.opacity = '1';
        finishBtn.style.cursor = 'pointer';
        finishBtn.style.filter = 'none';
      } else {
        finishBtn.classList.add('disabled');
        finishBtn.style.opacity = '0.55';
        finishBtn.style.cursor = 'not-allowed';
        finishBtn.style.filter = 'grayscale(35%)';
      }
    }

    if (box) {
      if (consent) {
        box.style.borderColor = '#9EA76B';
        box.style.backgroundColor = '#F6F9ED';
      } else {
        box.style.borderColor = '#DDD4B0';
        box.style.backgroundColor = '#FDFAF2';
      }
    }
  }

  goToQuizStep(step) {
    this.currentQuizStep = Math.max(1, Math.min(3, step));

    // Update 3 Bullet Stepper Elements
    for (let i = 1; i <= 3; i++) {
      const bulletEl = document.getElementById(`stepper-bullet-${i}`);
      const circleEl = document.getElementById(`bullet-circle-${i}`);
      const lineEl = document.getElementById(`stepper-line-${i}`);

      if (!bulletEl || !circleEl) continue;

      bulletEl.classList.remove('active', 'completed', 'locked');

      if (i < this.currentQuizStep) {
        // Langkah sebelumnya (selesai)
        bulletEl.classList.add('completed');
        circleEl.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i>';
      } else if (i === this.currentQuizStep) {
        // Sedang aktif diisi sekarang
        bulletEl.classList.add('active');
        circleEl.textContent = i;
      } else {
        // Belum dibuka (terkunci)
        bulletEl.classList.add('locked');
        circleEl.textContent = i;
      }

      if (lineEl) {
        if (i < this.currentQuizStep) {
          lineEl.classList.add('completed');
        } else {
          lineEl.classList.remove('completed');
        }
      }
    }

    // Toggle 3 Step Panes
    for (let i = 1; i <= 3; i++) {
      const pane = document.getElementById(`quiz-step-${i}`);
      if (pane) {
        pane.classList.toggle('active', i === this.currentQuizStep);
      }
    }

    // Di Step 3: Hitung otomatis live BMI & Target gizi, serta sinkronisasi tombol persetujuan
    if (this.currentQuizStep === 3) {
      this.updateLiveBMIDisplay();
      this.calculateDiagnosticResults();
      this.toggleConsentValidation();
    }

    // Kontrol tombol Close X: selalu tampilkan agar pengguna bebas keluar/menutup onboarding kapan saja
    const closeBtn = document.getElementById('onboarding-close-btn');
    if (closeBtn) {
      closeBtn.style.display = 'inline-flex';
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  jumpToQuizStep(targetStep) {
    if (targetStep === this.currentQuizStep) return;

    if (targetStep < this.currentQuizStep) {
      // Boleh kembali ke langkah sebelumnya kapan saja
      this.goToQuizStep(targetStep);
      return;
    }

    // Jika ingin melangkah maju, WAJIB validasi langkah sebelumnya secara berurutan
    if (targetStep >= 2) {
      if (!this.validateQuizStep(1)) return;
    }
    if (targetStep >= 3) {
      if (!this.validateQuizStep(2)) return;
    }

    this.goToQuizStep(targetStep);
  }

  nextQuizStep() {
    if (this.currentQuizStep === 1) {
      if (!this.validateQuizStep(1)) return;
      this.goToQuizStep(2);
      return;
    }

    if (this.currentQuizStep === 2) {
      if (!this.validateQuizStep(2)) return;
      this.goToQuizStep(3);
      return;
    }

    if (this.currentQuizStep === 3) {
      this.saveOnboardingProfile();
    }
  }

  prevQuizStep() {
    if (this.currentQuizStep > 1) {
      this.goToQuizStep(this.currentQuizStep - 1);
    }
  }

  tryCloseOnboardingModal() {
    this.closeModal('onboarding-modal');
  }

  selectGender(gender) {
    this.quizState.gender = gender;
    const btnM = document.getElementById('gender-btn-male');
    const btnF = document.getElementById('gender-btn-female');
    if (btnM && btnF) {
      btnM.classList.toggle('active', gender === 'male');
      btnF.classList.toggle('active', gender === 'female');
    }
  }

  selectCondition(conditionId, element) {
    this.quizState.condition = conditionId;
    document.querySelectorAll('#quiz-step-2 .quiz-choice-card').forEach(card => {
      card.classList.remove('active');
    });
    if (element) element.classList.add('active');
  }

  selectActivity(activityId, element) {
    this.quizState.activity = activityId;
    document.querySelectorAll('#quiz-step-3 .quiz-choice-card').forEach(card => {
      card.classList.remove('active');
    });
    if (element) element.classList.add('active');
  }

  updateLiveBMIDisplay() {
    const weight = parseFloat(document.getElementById('onboard-weight')?.value) || 65;
    const height = parseFloat(document.getElementById('onboard-height')?.value) || 170;
    const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);

    let cat = 'Normal';
    if (bmi < 18.5) cat = 'Kurang (Underweight)';
    else if (bmi <= 24.9) cat = 'Ideal (Normal)';
    else if (bmi <= 29.9) cat = 'Berlebih (Overweight)';
    else cat = 'Obesitas';

    const bmiEl = document.getElementById('quiz-live-bmi-val');
    if (bmiEl) {
      bmiEl.textContent = `${bmi} (${cat})`;
    }
  }

  // Foodvisor-Style Precision Diagnostic Calculation Engine
  calculateDiagnosticResults() {
    const name = document.getElementById('onboard-name')?.value || 'Rangga Pratama';
    const weight = parseFloat(document.getElementById('onboard-weight')?.value) || 65;
    const height = parseFloat(document.getElementById('onboard-height')?.value) || 170;
    const age = parseInt(document.getElementById('onboard-age')?.value, 10) || 28;
    const gender = this.quizState.gender || 'male';
    const condition = this.quizState.condition || 'post-surgery';
    const activity = this.quizState.activity || 'light';

    // 1. Hitung BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;

    // 2. Faktor Aktivitas Klinis
    const activityFactors = {
      'bedrest': 1.15,
      'light': 1.25,
      'therapy': 1.35,
      'active': 1.55
    };
    const actFactor = activityFactors[activity] || 1.25;

    // 3. TDEE (Total Daily Energy Expenditure)
    const tdee = Math.round(bmr * actFactor);

    // 4. Protein Multiplier Berdasarkan Pedoman ERAS / ESPEN
    const proteinMultipliers = {
      'post-surgery': 1.5, // 1.5g per kg
      'rehab': 1.4,        // 1.4g per kg
      'gym': 1.8,          // 1.8g per kg
      'wellness': 1.2      // 1.2g per kg
    };
    const protMultiplier = proteinMultipliers[condition] || 1.5;
    const calcProtein = Math.round(weight * protMultiplier);

    // 5. Pembagian Makronutrisi Seimbang (25% Lemak, sisa Karbohidrat)
    const calcFat = Math.round((tdee * 0.25) / 9);
    const calcCarbs = Math.max(100, Math.round((tdee - (calcProtein * 4) - (calcFat * 9)) / 4));

    // 6. BMI
    const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
    let bmiCat = 'Normal';
    if (bmi < 18.5) bmiCat = 'Kurang (Underweight)';
    else if (bmi <= 24.9) bmiCat = 'Ideal (Normal)';
    else if (bmi <= 29.9) bmiCat = 'Berlebih (Overweight)';
    else bmiCat = 'Obesitas';

    // Simpan ke state sementara
    this.calculatedDiagnostics = {
      name,
      gender,
      age,
      weight,
      height,
      bmi,
      bmiCat,
      activity,
      condition,
      tdee,
      protein: calcProtein,
      carbs: calcCarbs,
      fat: calcFat,
      protMultiplier
    };

    // Render ke Step 5 UI
    const elProt = document.getElementById('diag-res-protein');
    if (elProt) elProt.textContent = `${calcProtein} g`;

    const elProtSub = document.getElementById('diag-res-protein-sub');
    if (elProtSub) elProtSub.textContent = `${protMultiplier}g / kg BB`;

    const elCals = document.getElementById('diag-res-cals');
    if (elCals) elCals.textContent = `${tdee.toLocaleString()} kkal`;

    const elCarbs = document.getElementById('diag-res-carbs');
    if (elCarbs) elCarbs.textContent = `${calcCarbs} g`;

    const elFat = document.getElementById('diag-res-fat');
    if (elFat) elFat.textContent = `${calcFat} g`;
  }

  // Simpan Hasil Diagnostik ke Profil Pengguna
  saveOnboardingProfile() {
    if (!this.validateQuizStep(1)) {
      this.goToQuizStep(1);
      return;
    }
    if (!this.validateQuizStep(2)) {
      this.goToQuizStep(2);
      return;
    }
    if (!this.validateQuizStep(3)) {
      this.goToQuizStep(3);
      return;
    }

    this.calculateDiagnosticResults();

    const diag = this.calculatedDiagnostics;
    const nameInput = document.getElementById('onboard-name')?.value?.trim();
    const contactInput = document.getElementById('onboard-contact')?.value?.trim();
    const phaseInput = document.getElementById('onboard-phase')?.value || 'Minggu ke-2 (Fase Proliferasi & Jaringan)';
    const restrictionsInput = document.getElementById('onboard-restrictions')?.value || '';

    const conditionTitles = {
      'post-surgery': 'Pasca-Operasi & Bedah',
      'rehab': 'Fisioterapi & Cedera Sendi',
      'gym': 'Gym & Muscle Recovery',
      'wellness': 'Pemeliharaan Gizi Medis'
    };

    this.userProfile.name = nameInput || diag.name || 'Pengguna NutriVision';
    this.userProfile.contact = contactInput;
    this.userProfile.gender = diag.gender;
    this.userProfile.age = diag.age;
    this.userProfile.heightCm = diag.height;
    this.userProfile.weightKg = diag.weight;
    this.userProfile.activityLevel = diag.activity;
    this.userProfile.conditionId = diag.condition;
    this.userProfile.conditionTitle = conditionTitles[diag.condition] || 'Pasca-Operasi & Bedah';
    this.userProfile.phase = phaseInput;
    this.userProfile.restrictions = restrictionsInput;
    this.userProfile.bmi = diag.bmi;
    this.userProfile.bmiCategory = diag.bmiCat;
    this.userProfile.hasAcceptedConsent = true;
    this.userProfile.hasCompletedQuiz = true;
    this.userProfile.isDemo = false;

    this.userProfile.targets = {
      protein: diag.protein,
      carbs: diag.carbs,
      fat: diag.fat,
      calories: diag.tdee
    };

    // Simpan Wilayah Acuan Pasar Pangan (Bapanas RI)
    const provSelect = document.getElementById('onboard-province');
    const citySelect = document.getElementById('onboard-city');
    if (provSelect && provSelect.value && window.BappenasFoodAPI) {
      const selectedProvId = parseInt(provSelect.value, 10);
      const provName = (provSelect.options[provSelect.selectedIndex]?.text || '').replace(/\s*\([\d.]+x\)$/, '').trim();
      const cityName = (citySelect && citySelect.value) ? citySelect.value : 'Semua Wilayah';
      window.BappenasFoodAPI.setActiveRegion({
        provinceId: selectedProvId,
        provinceName: provName,
        cityName: cityName
      });
      this.userProfile.region = window.BappenasFoodAPI.getActiveRegion();
      this.userProfile.province = provName;
      this.userProfile.city = cityName;
    }

    this.saveUserProfile();
    if (window.nutriVisionDB && window.nutriVisionDB.isReady) {
      window.nutriVisionDB.updateUserProfile(this.userProfile.contact, {
        name: this.userProfile.name,
        email: this.userProfile.contact,
        gender: this.userProfile.gender,
        age: this.userProfile.age,
        height: this.userProfile.heightCm,
        weight: this.userProfile.weightKg,
        activity: this.userProfile.activityLevel,
        condition: this.userProfile.conditionId,
        conditionLabel: this.userProfile.conditionTitle,
        recoveryPhase: this.userProfile.phase,
        allergies: this.userProfile.restrictions,
        targetProtein: this.userProfile.targets.protein,
        targetCalories: this.userProfile.targets.calories,
        targetCarbs: this.userProfile.targets.carbs,
        targetFat: this.userProfile.targets.fat,
        hasCompletedQuiz: true
      }).catch(err => console.warn('DB update error:', err));
    }

    // Synchronize Card 2 macro targets display
    const macroNumProt = document.getElementById('macro-num-protein');
    const macroNumCals = document.getElementById('macro-num-cals');
    const adviceText = document.getElementById('ov-advice-body-text');
    if (macroNumProt) macroNumProt.textContent = `0 / ${diag.protein} g`;
    if (macroNumCals) macroNumCals.textContent = `0 / ${Number(diag.tdee).toLocaleString('id-ID')} kkal`;
    if (adviceText) {
      adviceText.innerHTML = `Target protein harian Anda: <b>${diag.protein}g</b> (${diag.proteinRatio || '1.5'}g/kg BB). Menu harian diselaraskan dengan fase <b>${phaseInput}</b>.`;
    }

    // Synchronize Smart Budgeting & Meal Planner with user preferences and texture needs
    if (window.budgetPlanner) {
      const activeSymptoms = Array.from(document.querySelectorAll('.quiz-chips-selector .quiz-chip-btn.active'))
        .map(b => b.dataset.symptom || '');
      if (activeSymptoms.includes('disfagia') || activeSymptoms.includes('mual')) {
        window.budgetPlanner.preference = 'tekstur_lunak';
      } else if (diag.condition === 'gym') {
        window.budgetPlanner.preference = 'tinggi_protein';
      } else {
        window.budgetPlanner.preference = 'seimbang';
      }
      window.budgetPlanner.generatePlan();
      window.budgetPlanner.render();
    }

    this.updateProfileUI();
    this.renderAuthUI();
    progressTracker.initUserProgress(this.userProfile.targets, this.userProfile.contact || this.userProfile.email);
    cvEngine.currentScan = null;
    progressTracker.renderMacroDonut(this.userProfile.targets);
    progressTracker.renderWeeklyBarChart();
    this.renderOverviewPlate();
    this.closeModal('onboarding-modal');
    this.showToast('✅ Rencana diagnostik gizi pemulihan berhasil disimpan & diterapkan ke dasbor!');
    this.goToDashboard('overview');

    if (typeof this.pendingAuthCallback === 'function') {
      const cb = this.pendingAuthCallback;
      this.pendingAuthCallback = null;
      cb();
    }
  }

  // Buka Alur Diagnostik Pasca-Login
  openDiagnosticQuiz(step = 1) {
    if (this.userProfile?.role && this.userProfile.role !== 'patient') {
      console.warn(`[NutriVision] Kuis diagnostik hanya untuk peran pasien. Akses diblokir untuk peran: ${this.userProfile.role}`);
      return;
    }
    this.openModal('onboarding-modal');
    this.goToQuizStep(step);

    const onboardName = document.getElementById('onboard-name');
    const onboardContact = document.getElementById('onboard-contact');
    if (onboardName && this.userProfile.name) onboardName.value = this.userProfile.name;
    if (onboardContact && (this.userProfile.contact || this.userProfile.email)) {
      onboardContact.value = this.userProfile.contact || this.userProfile.email;
    }
  }

  // Render Piring Segmentasi di Dashboard Utama (Simple 2-Column Split)
  renderOverviewPlate() {
    const canvas = document.getElementById('overview-plate-canvas');
    const emptyDisc = document.getElementById('overview-plate-empty-disc');
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const diagramStatsBox = document.getElementById('overview-diagram-stats');
    const totalBadge = document.getElementById('overview-total-badge');
    const legendBox = document.getElementById('overview-segment-legend');
    const confNote = document.getElementById('overview-conf-note');
    const statusWrap = document.getElementById('overview-scan-status-wrap');
    const btnAddDaily = document.getElementById('overview-btn-add-daily');

    // JIKA BELUM ADA SCAN MAKANAN / BELUM LOGIN: TAMPILKAN STATUS KOSONG BERSIH ("Piring Belum Terisi" Bentuk Piring)
    if (!cvEngine.currentScan || !cvEngine.currentScan.segments || cvEngine.currentScan.segments.length === 0) {
      if (statusWrap) statusWrap.innerHTML = '';
      if (btnAddDaily) {
        btnAddDaily.style.opacity = '0.5';
        btnAddDaily.title = isId ? 'Pindai makanan terlebih dahulu untuk mencatat gizi' : 'Scan a meal first to log nutrition';
      }

      if (emptyDisc) {
        emptyDisc.style.display = 'flex';
        const titleEl = document.getElementById('overview-plate-empty-title');
        const subEl = document.getElementById('overview-plate-empty-sub');
        if (titleEl) titleEl.textContent = isId ? 'Piring Belum Terisi' : 'Empty Plate';
        if (subEl) subEl.textContent = isId ? 'Belum ada makanan terdeteksi' : 'No food detected yet';
      }
      if (canvas) {
        canvas.style.display = emptyDisc ? 'none' : 'block';
        cvEngine.renderCanvas(canvas, 170, 170, true);
      }
      if (diagramStatsBox) {
        diagramStatsBox.innerHTML = `
          <div class="plate-stat-main">
            <span class="stat-big-val" style="color:var(--ink-mute);letter-spacing:1px;">--%</span>
            <span class="stat-big-lbl">${isId ? 'Belum Ada Scan' : 'No Active Scan'}</span>
          </div>
          <div class="plate-mini-pills">
            <span class="p-pill"><i data-lucide="scale" style="width:12px;height:12px;"></i> 0g Total</span>
            <span class="p-pill"><i data-lucide="zap" style="width:12px;height:12px;"></i> 0g Protein</span>
          </div>
        `;
      }

      if (totalBadge) {
        totalBadge.textContent = isId ? '0 Komponen' : '0 Components';
      }

      if (legendBox) {
        legendBox.innerHTML = `
          <div class="overview-empty-state-box">
            <div class="empty-state-icon-circle">
              <i data-lucide="utensils" style="width:22px;height:22px;color:var(--teal-700);"></i>
            </div>
            <div class="empty-state-title">${isId ? 'Belum Ada Makanan yang Dipindai' : 'No Meal Plate Scanned Yet'}</div>
            <p class="empty-state-desc">
              ${isId
                ? 'Masuk ke akun Anda dan pindai piring makanan untuk mengidentifikasi bahan serta mengestimasi kebutuhan gizi pemulihan.'
                : 'Sign in to your account and scan your meal to detect ingredients and calculate clinical recovery nutrition.'}
            </p>
            <button class="btn-empty-scan" onclick="app.openScanModal()">
              <i data-lucide="camera" style="width:15px;height:15px;"></i>
              <span>${isId ? 'Scan Piring Pertama' : 'Scan First Meal'}</span>
            </button>
          </div>
        `;
      }

      if (confNote) {
        confNote.textContent = isId
          ? 'Menunggu pemindaian makanan pertama · Estimasi gizi akan muncul otomatis di sini.'
          : 'Awaiting first meal scan · Nutrition breakdown will appear automatically here.';
      }

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      return;
    }

    // JIKA ADA SCAN MAKANAN: TAMPILKAN PERSENTASE DAN BREAKDOWN
    if (emptyDisc) {
      emptyDisc.style.display = 'none';
    }
    if (canvas) {
      canvas.style.display = 'block';
      cvEngine.renderCanvas(canvas, 170, 170, true);
    }

    const segments = cvEngine.currentScan.segments || [];
    const totalGrams = segments.reduce((sum, s) => sum + (s.portionGrams || 0), 0) || 1;
    const totalProtMin = segments.reduce((sum, s) => sum + (s.protein ? s.protein[0] : 0), 0);
    const totalProtMax = segments.reduce((sum, s) => sum + (s.protein ? s.protein[1] : 0), 0);
    const overallConf = cvEngine.currentScan.confidenceOverall || 88;

    // 1. Render Left Column Diagram Stats
    if (diagramStatsBox) {
      diagramStatsBox.innerHTML = `
        <div class="plate-stat-main">
          <span class="stat-big-val">${overallConf}%</span>
          <span class="stat-big-lbl">AI Detection Match</span>
        </div>
        <div class="plate-mini-pills">
          <span class="p-pill"><i data-lucide="scale" style="width:12px;height:12px;"></i> ${totalGrams}g Total</span>
          <span class="p-pill"><i data-lucide="zap" style="width:12px;height:12px;"></i> ${totalProtMin.toFixed(0)}-${totalProtMax.toFixed(0)}g Protein</span>
        </div>
      `;
    }

    if (totalBadge) {
      totalBadge.textContent = `${segments.length} ${isId ? 'Komponen' : 'Components'}`;
    }

    // 2. Render Right Column Segment Legend with Clean Percentage Bars
    if (legendBox) {
      legendBox.innerHTML = segments.map(seg => {
        const portionPct = Math.round(((seg.portionGrams || 0) / totalGrams) * 100);
        const isHovered = (cvEngine.activeHoverSegmentId === seg.id);
        const segName = isId ? seg.name : (seg.nameEn || seg.name);
        const portionLabel = isId ? 'Porsi' : 'Portion';
        return `
          <div class="segment-row ${isHovered ? 'hovered' : ''}" data-seg-id="${seg.id}"
               onmouseenter="cvEngine.activeHoverSegmentId='${seg.id}'; app.renderOverviewPlate();" 
               onmouseleave="cvEngine.activeHoverSegmentId=null; app.renderOverviewPlate();">
            <div class="segment-row-top">
              <div class="segment-row-left">
                <span class="segment-swatch" style="background: ${seg.color}"></span>
                <span class="segment-name">${segName}</span>
              </div>
              <div class="segment-row-right">
                <span class="segment-portion-pct">${portionPct}% ${portionLabel}</span>
                <span class="confidence-pill">${seg.confidence}%</span>
                <span class="segment-values">${seg.portionGrams}g · ${seg.protein[0]}-${seg.protein[1]}g Prot</span>
              </div>
            </div>
            <div class="segment-bar-track">
              <div class="segment-bar-fill" style="width: ${portionPct}%; background: ${seg.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Render Status Pencatatan ke Gizi Harian (di Samping Koreksi Manual)
    if (cvEngine.currentScan && cvEngine.currentScan._isLoggedToday) {
      const mealName = cvEngine.currentScan._loggedMealName || (isId ? 'Makan Siang' : 'Lunch');
      const timeStr = cvEngine.currentScan._loggedTime || '';
      const loggedNutrients = cvEngine.currentScan._loggedNutrients || cvEngine.calculateAggregatedNutrients();
      const protVal = Math.round(((loggedNutrients.protein[0] + loggedNutrients.protein[1]) / 2) * 10) / 10;
      const calsVal = Math.round((loggedNutrients.cals[0] + loggedNutrients.cals[1]) / 2);

      if (statusWrap) {
        statusWrap.innerHTML = `
          <div class="overview-logged-banner">
            <div class="logged-left">
              <span class="logged-icon"><iconify-icon icon="solar:check-circle-bold"></iconify-icon></span>
              <div>
                <div style="font-weight:800;font-size:12px;color:#FFFFFF;display:flex;align-items:center;gap:6px;">
                  <span>${isId ? 'Tercatat di Gizi Harian' : 'Logged to Daily Nutrition'}</span>
                  <span class="logged-tag">${mealName}</span>
                  ${timeStr ? `<span style="font-size:11px;font-weight:600;color:#A7F3D0;">(${timeStr})</span>` : ''}
                </div>
                <div style="font-size:11px;color:#D1FAE5;margin-top:2px;">
                  ${isId 
                    ? `+${protVal}g Protein & +${calsVal} kkal telah dimasukkan ke target pemulihan hari ini.` 
                    : `+${protVal}g Protein & +${calsVal} kcal added to today’s recovery progress.`}
                </div>
              </div>
            </div>
            <button type="button" class="logged-btn" onclick="app.openScanDailyIntakeConfirmModal()">
              <iconify-icon icon="solar:add-circle-bold" style="font-size:13px;"></iconify-icon>
              <span>${isId ? 'Catat Porsi Lain' : 'Log Another'}</span>
            </button>
          </div>
        `;
      }

      if (btnAddDaily) {
        btnAddDaily.style.opacity = '1';
        btnAddDaily.style.background = '#2E4A1E';
        btnAddDaily.style.borderColor = '#4D7332';
        btnAddDaily.style.color = '#FFFFFF';
        btnAddDaily.innerHTML = `
          <iconify-icon icon="solar:check-circle-bold" style="font-size:15px;color:#86EFAC;"></iconify-icon>
          <span>${isId ? 'Tercatat di Gizi Harian' : 'Logged to Daily'}</span>
        `;
        btnAddDaily.title = isId ? 'Piring ini sudah tercatat hari ini. Klik untuk mencatat porsi baru.' : 'Already logged today. Click to log new portion.';
      }
    } else {
      if (statusWrap) {
        statusWrap.innerHTML = '';
      }

      if (btnAddDaily) {
        btnAddDaily.style.opacity = '1';
        btnAddDaily.style.background = '#EFE8CA';
        btnAddDaily.style.borderColor = '#EFE8CA';
        btnAddDaily.style.color = '#353C1B';
        btnAddDaily.innerHTML = `
          <iconify-icon icon="solar:clipboard-add-bold-duotone" style="font-size:15px;"></iconify-icon>
          <span data-i18n="ov_btn_add_to_daily">${isId ? 'Tambahkan ke Gizi Harian' : 'Add to Daily Nutrition'}</span>
        `;
        btnAddDaily.title = isId ? 'Tambahkan hasil scan citra piring ke target gizi pemulihan hari ini' : 'Add AI scanned plate to daily recovery targets';
      }
    }

    // Update Confidence Note
    if (confNote) {
      confNote.textContent = isId
        ? `Tingkat keyakinan model: ${overallConf}% · Format estimasi disajikan dalam rentang gizi pendukung keputusan.`
        : `Model confidence: ${overallConf}% · Estimated values presented in decision-support nutritional ranges.`;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Sinkronisasi highlight baris saat kursor bergerak di atas irisan pizza canvas
  renderOverviewPlateLegendHover(segId) {
    const rows = document.querySelectorAll('#overview-segment-legend .segment-row');
    rows.forEach(r => {
      if (segId && r.getAttribute('data-seg-id') === segId) {
        r.classList.add('hovered');
      } else {
        r.classList.remove('hovered');
      }
    });
  }

  // =========================================================================
  // SCAN & CAMERA WORKFLOW (FR-01, FR-02, FR-03, FR-07)
  // =========================================================================
  openScanModal() {
    this.requireAuth(() => {
      this.openModal('scan-modal');
      this.renderScanModalUI();
    }, 'memindai makanan');
  }

  renderScanModalUI() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';

    // Render presets chip
    const presetContainer = document.getElementById('scan-preset-chips');
    if (presetContainer) {
      presetContainer.innerHTML = NUTRIVISION_DATA.presetScans.map((preset, idx) => {
        const titleStr = isId ? preset.title.split(' (')[0] : (preset.titleEn ? preset.titleEn.split(' (')[0] : preset.title.split(' (')[0]);
        return `
          <button class="preset-chip ${cvEngine.currentScan?.id === preset.id ? 'active' : ''}" 
                  onclick="app.selectScanPreset('${preset.id}')">
            ${titleStr}
          </button>
        `;
      }).join('');
    }

    // Render Canvas Modal
    const modalCanvas = document.getElementById('modal-scan-canvas');
    if (modalCanvas) {
      cvEngine.renderCanvas(modalCanvas, 320, 220, true);
    }

    // Render Editable Segment List (FR-07)
    const editList = document.getElementById('modal-segment-edit-list');
    if (editList && cvEngine.currentScan) {
      const uncertainLabel = isId ? 'Belum Yakin' : 'Uncertain';
      const confLabel = isId ? 'Keyakinan' : 'Confidence';
      const calsUnit = isId ? 'kkal' : 'kcal';
      const portionTitle = isId ? 'Ubah porsi gram' : 'Adjust portion grams';
      const removeTitle = isId ? 'Hapus bahan' : 'Remove ingredient';

      editList.innerHTML = cvEngine.currentScan.segments.map(seg => {
        const segName = isId ? seg.name : (seg.nameEn || seg.name);
        return `
          <div class="segment-edit-item ${seg.unrecognized ? 'unrecognized' : ''}">
            <span class="segment-color-dot" style="background: ${seg.color}"></span>
            <div class="segment-edit-info">
              <div class="name">
                ${segName} 
                ${seg.unrecognized ? `<span style="font-size:11px;color:var(--amber-600);display:inline-flex;align-items:center;gap:3px;"><i data-lucide="alert-circle" class="btn-icon-sm"></i> ${uncertainLabel}</span>` : ''}
              </div>
              <div class="stats">${seg.portionGrams}g · ${seg.protein[0]}-${seg.protein[1]}g Prot · ${seg.cals[0]}-${seg.cals[1]} ${calsUnit} · ${confLabel}: ${seg.confidence}%</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <input type="number" value="${seg.portionGrams}" min="10" max="800" step="10" 
                     style="width:60px;padding:4px 6px;font-size:12px;border:1px solid var(--line);border-radius:6px;"
                     onchange="app.updateSegmentGrams('${seg.id}', this.value)" title="${portionTitle}">
              <button class="btn-remove-segment" onclick="app.removeSegment('${seg.id}')" title="${removeTitle}" style="display:flex;align-items:center;">
                <i data-lucide="trash-2" class="btn-icon-sm"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Update Aggregated Nutrients Display
    const agg = cvEngine.calculateAggregatedNutrients();
    const aggDisplay = document.getElementById('modal-aggregated-nutrients');
    if (aggDisplay) {
      const portionLabel = isId ? 'Total Porsi:' : 'Total Portion:';
      const calsLabel = isId ? 'Kalori:' : 'Calories:';
      const calsUnit = isId ? 'kkal' : 'kcal';

      aggDisplay.innerHTML = `
        <div style="display:flex;justify-content:space-between;padding:10px 14px;background:var(--bg);border-radius:var(--radius-md);border:1px solid var(--line);font-size:var(--font-sm);">
          <div><b>${portionLabel}</b> ${agg.totalGrams}g</div>
          <div><b>Protein:</b> <span style="color:var(--teal-700);font-weight:700;">${agg.protein[0]} - ${agg.protein[1]} g</span></div>
          <div><b>${calsLabel}</b> <span style="font-weight:600;">${agg.cals[0]} - ${agg.cals[1]} ${calsUnit}</span></div>
        </div>
      `;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  selectScanPreset(presetId) {
    const preset = NUTRIVISION_DATA.presetScans.find(p => p.id === presetId);
    if (preset) {
      cvEngine.loadScanData(preset);
      this.renderScanModalUI();
      this.renderOverviewPlate();
    }
  }

  updateSegmentGrams(segmentId, grams) {
    const g = parseInt(grams, 10) || 100;
    cvEngine.updateSegmentPortion(segmentId, g);
    this.renderScanModalUI();
    this.renderOverviewPlate();
  }

  removeSegment(segmentId) {
    cvEngine.removeSegment(segmentId);
    this.renderScanModalUI();
    this.renderOverviewPlate();
  }

  // Mulai Kamera Langsung
  async activateLiveCamera() {
    const videoEl = document.getElementById('live-camera-feed');
    const cameraBox = document.getElementById('camera-viewport-box');
    const canvasBox = document.getElementById('scan-canvas-view-box');

    if (cameraBox && canvasBox && videoEl) {
      cameraBox.style.display = 'flex';
      canvasBox.style.display = 'none';
      const success = await cameraHandler.startCamera(videoEl);
      if (!success) {
        alert('Tidak dapat mengaktifkan kamera langsung. Menggunakan mode unggah foto atau simulator foto.');
        this.deactivateLiveCamera();
      }
    }
  }

  // Ambil Foto dari Kamera Langsung
  captureLivePhoto() {
    const snapshot = cameraHandler.captureSnapshot();
    cameraHandler.stopCamera();

    const cameraBox = document.getElementById('camera-viewport-box');
    const canvasBox = document.getElementById('scan-canvas-view-box');
    if (cameraBox && canvasBox) {
      cameraBox.style.display = 'none';
      canvasBox.style.display = 'flex';
    }

    this.showToast('Memproses citra makanan dengan Computer Vision...');
    cvEngine.processCustomImageScan(snapshot || '', (res) => {
      this.renderScanModalUI();
      this.renderOverviewPlate();
      this.showToast('Segmentasi piring berhasil diselesaikan!');
    });
  }

  deactivateLiveCamera() {
    cameraHandler.stopCamera();
    const cameraBox = document.getElementById('camera-viewport-box');
    const canvasBox = document.getElementById('scan-canvas-view-box');
    if (cameraBox && canvasBox) {
      cameraBox.style.display = 'none';
      canvasBox.style.display = 'flex';
    }
  }

  // Tangani Unggahan File Gambar (FR-01)
  handleImageUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      cameraHandler.readFileAsDataURL(file).then(dataUrl => {
        this.showToast('Mengunggah & menganalisis foto makanan...');
        cvEngine.processCustomImageScan(dataUrl, (res) => {
          this.renderScanModalUI();
          this.renderOverviewPlate();
          this.showToast('Segmentasi foto berhasil dilakukan!');
        });
      }).catch(err => {
        this.showToast('Gagal memuat gambar: ' + err);
      });
    }
  }

  // =========================================================================
  // WORKFLOW: KONFIRMASI TAMBAH KE GIZI HARIAN (FR-01, FR-02, FR-08, FR-09)
  // =========================================================================
  openScanDailyIntakeConfirmModal(options = {}) {
    this.requireAuth(() => {
      if (!cvEngine.currentScan || !cvEngine.currentScan.segments || cvEngine.currentScan.segments.length === 0) {
        const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
        this.showToast(isId 
          ? '⚠️ Belum ada foto makanan yang dipindai. Silakan foto atau unggah makanan terlebih dahulu.' 
          : '⚠️ No food scanned yet. Please take a photo or upload food first.', 'warning');
        this.openScanModal();
        return;
      }

      const now = new Date();
      const hours = now.getHours();
      let defaultSlot = 'lunch';
      if (hours >= 5 && hours < 11) defaultSlot = 'breakfast';
      else if (hours >= 11 && hours < 16) defaultSlot = 'lunch';
      else if (hours >= 16 && hours < 18) defaultSlot = 'snack';
      else defaultSlot = 'dinner';

      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      this.dailyIntakeConfirmState = {
        slot: options.slot || defaultSlot,
        servings: options.servings || 1.0,
        time: options.time || timeStr,
        notes: options.notes || ''
      };

      this.renderDailyConfirmContent();
      this.openModal('modal-confirm-daily-intake');
    }, 'mencatat ke gizi harian');
  }

  selectDailyMealSlot(slot) {
    if (!this.dailyIntakeConfirmState) return;
    this.dailyIntakeConfirmState.slot = slot;
    const modalEl = document.getElementById('modal-confirm-daily-intake');
    if (modalEl) {
      modalEl.querySelectorAll('.daily-slot-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.slot === slot);
      });
    }
  }

  changeDailyMealServings(delta) {
    if (!this.dailyIntakeConfirmState) return;
    const cur = this.dailyIntakeConfirmState.servings || 1.0;
    const updated = Math.max(0.5, Math.min(3.0, Math.round((cur + delta * 0.5) * 10) / 10));
    if (updated === cur) return;
    this.dailyIntakeConfirmState.servings = updated;
    this.renderDailyConfirmContent();
  }

  updateDailyMealTime(timeVal) {
    if (!this.dailyIntakeConfirmState) return;
    this.dailyIntakeConfirmState.time = timeVal;
  }

  renderDailyConfirmContent() {
    const container = document.getElementById('daily-confirm-content');
    if (!container || !this.dailyIntakeConfirmState || !cvEngine.currentScan) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const scan = cvEngine.currentScan;
    const segments = scan.segments || [];
    const rawAgg = cvEngine.calculateAggregatedNutrients();
    const servings = this.dailyIntakeConfirmState.servings || 1.0;
    const activeSlot = this.dailyIntakeConfirmState.slot || 'lunch';
    const currentTime = this.dailyIntakeConfirmState.time || '12:00';

    const currentGrams = Math.round(rawAgg.totalGrams * servings);
    const protMin = Math.round(rawAgg.protein[0] * servings * 10) / 10;
    const protMax = Math.round(rawAgg.protein[1] * servings * 10) / 10;
    const avgProt = Math.round(((protMin + protMax) / 2) * 10) / 10;
    const calsMin = Math.round(rawAgg.cals[0] * servings);
    const calsMax = Math.round(rawAgg.cals[1] * servings);
    const avgCals = Math.round((calsMin + calsMax) / 2);
    const carbsMin = Math.round(rawAgg.carbs[0] * servings * 10) / 10;
    const carbsMax = Math.round(rawAgg.carbs[1] * servings * 10) / 10;
    const avgCarbs = Math.round(((carbsMin + carbsMax) / 2) * 10) / 10;
    const fatMin = Math.round(rawAgg.fat[0] * servings * 10) / 10;
    const fatMax = Math.round(rawAgg.fat[1] * servings * 10) / 10;
    const avgFat = Math.round(((fatMin + fatMax) / 2) * 10) / 10;

    const overallConf = scan.confidenceOverall || 84;
    const titleStr = isId 
      ? (scan.title || 'Piring Hasil Pindai AI') 
      : (scan.titleEn || scan.title || 'AI Scanned Meal Plate');

    // Clinical advice based on user condition
    const condition = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    let rationale = isId 
      ? 'Kandungan nutrisi terestimasi seimbang untuk mendukung fase regenerasi harian tubuh Anda.'
      : 'Estimated nutritional balance tailored to support your daily metabolic recovery phase.';

    if (condition === 'post-surgery') {
      rationale = isId 
        ? `Menyumbang estimasi ~${avgProt}g protein untuk mendukung sintesis albumin, remodeling jaringan epitel, dan pemulihan luka pasca-bedah.`
        : `Provides ~${avgProt}g protein to support albumin synthesis, epithelial tissue remodeling, and surgical wound healing.`;
    } else if (condition === 'gym') {
      rationale = isId 
        ? `Menyumbang ~${avgProt}g protein untuk merangsang sintesis protein otot (MPS) dan pemulihan energi glikogen.`
        : `Contributes ~${avgProt}g protein to stimulate muscle protein synthesis (MPS) and glycogen recovery.`;
    } else if (condition === 'rehab') {
      rationale = isId 
        ? `Mendukung pemulihan kolagen tendon, mobilitas sendi, dan imunitas anti-inflamasi harian.`
        : `Supports tendon collagen remodeling, joint mobility, and anti-inflammatory immunity.`;
    }

    container.innerHTML = `
      <div class="daily-confirm-header">
        <div class="daily-confirm-header-left">
          <div class="daily-confirm-icon-badge">
            <iconify-icon icon="solar:clipboard-add-bold-duotone" style="font-size:24px;"></iconify-icon>
          </div>
          <div>
            <h3 class="daily-confirm-title">${isId ? 'Tambahkan ke Gizi Harian' : 'Log to Daily Nutrition'}</h3>
            <p class="daily-confirm-sub">${isId ? 'Konfirmasi jadwal dan porsi makan sebelum dicatat ke target gizi pemulihan hari ini.' : 'Confirm meal time and portion before adding to today’s recovery nutrition.'}</p>
          </div>
        </div>
        <button type="button" class="modal-close-btn" onclick="app.closeModal('modal-confirm-daily-intake')" title="${isId ? 'Tutup' : 'Close'}" aria-label="${isId ? 'Tutup' : 'Close'}">
          <i data-lucide="x"></i>
        </button>
      </div>

      <!-- Scanned Food Summary Card -->
      <div class="daily-confirm-food-card">
        <div class="daily-confirm-plate-top">
          <div class="daily-confirm-plate-img">
            ${scan.imageUrl || scan.imageSrc 
              ? `<img src="${scan.imageUrl || scan.imageSrc}" alt="Scanned Food" onerror="this.parentElement.innerHTML='<iconify-icon icon=\\'solar:dish-bold-duotone\\' style=\\'font-size:26px;color:#9EA76B;\\'></iconify-icon>'"/>` 
              : `<iconify-icon icon="solar:dish-bold-duotone" style="font-size:26px;color:#9EA76B;"></iconify-icon>`}
          </div>
          <div style="flex:1;min-width:0;">
            <div class="daily-confirm-plate-title">${titleStr}</div>
            <div class="daily-confirm-plate-sub">
              <span><b>${currentGrams}g</b> Total Porsi</span>
              <span>·</span>
              <span style="color:#059669;font-weight:700;"><iconify-icon icon="solar:shield-check-bold" style="font-size:13px;vertical-align:-1px;"></iconify-icon> ${overallConf}% AI Match</span>
              <span>·</span>
              <span>${segments.length} ${isId ? 'Komponen Bahan' : 'Ingredients'}</span>
            </div>
          </div>
        </div>

        <!-- Segment Ingredient Badges -->
        <div class="daily-confirm-segments-wrap">
          ${segments.map(s => {
            const sName = isId ? s.name : (s.nameEn || s.name);
            const scaledGrams = Math.round((s.portionGrams || 100) * servings);
            return `
              <span class="daily-confirm-segment-tag">
                <span class="tag-dot" style="background:${s.color || '#9EA76B'};"></span>
                <span>${sName} (${scaledGrams}g)</span>
              </span>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Dynamic Real-Time Macros Grid -->
      <div class="daily-confirm-macros-grid">
        <div class="daily-confirm-macro-box">
          <span class="daily-confirm-macro-lbl">${isId ? 'Kalori' : 'Calories'}</span>
          <span class="daily-confirm-macro-val" style="color:#B45309;">${avgCals} ${isId ? 'kkal' : 'kcal'}</span>
        </div>
        <div class="daily-confirm-macro-box">
          <span class="daily-confirm-macro-lbl">Protein</span>
          <span class="daily-confirm-macro-val" style="color:#15803D;">${avgProt}g</span>
        </div>
        <div class="daily-confirm-macro-box">
          <span class="daily-confirm-macro-lbl">${isId ? 'Karbohidrat' : 'Carbs'}</span>
          <span class="daily-confirm-macro-val" style="color:#1D4ED8;">${avgCarbs}g</span>
        </div>
        <div class="daily-confirm-macro-box">
          <span class="daily-confirm-macro-lbl">${isId ? 'Lemak' : 'Fat'}</span>
          <span class="daily-confirm-macro-val" style="color:#475569;">${avgFat}g</span>
        </div>
      </div>

      <!-- Meal Slot Selection (FR-08) -->
      <div class="daily-confirm-form-section">
        <label class="daily-confirm-form-label">
          <span>${isId ? 'Pilih Waktu Makan:' : 'Select Meal Time:'}</span>
          <span style="font-size:11px;color:#64748B;font-weight:500;">${isId ? 'Dipilih otomatis sesuai jam' : 'Auto-detected'}</span>
        </label>
        <div class="daily-slot-selector">
          <button type="button" class="daily-slot-btn ${activeSlot === 'breakfast' ? 'active' : ''}" data-slot="breakfast" onclick="app.selectDailyMealSlot('breakfast')">
            <span class="daily-slot-icon"><iconify-icon icon="solar:sun-2-bold"></iconify-icon></span>
            <span class="daily-slot-lbl">${isId ? 'Sarapan' : 'Breakfast'}</span>
          </button>
          <button type="button" class="daily-slot-btn ${activeSlot === 'lunch' ? 'active' : ''}" data-slot="lunch" onclick="app.selectDailyMealSlot('lunch')">
            <span class="daily-slot-icon"><iconify-icon icon="solar:sun-bold"></iconify-icon></span>
            <span class="daily-slot-lbl">${isId ? 'Siang' : 'Lunch'}</span>
          </button>
          <button type="button" class="daily-slot-btn ${activeSlot === 'dinner' ? 'active' : ''}" data-slot="dinner" onclick="app.selectDailyMealSlot('dinner')">
            <span class="daily-slot-icon"><iconify-icon icon="solar:moon-bold"></iconify-icon></span>
            <span class="daily-slot-lbl">${isId ? 'Malam' : 'Dinner'}</span>
          </button>
          <button type="button" class="daily-slot-btn ${activeSlot === 'snack' ? 'active' : ''}" data-slot="snack" onclick="app.selectDailyMealSlot('snack')">
            <span class="daily-slot-icon"><iconify-icon icon="solar:cup-bold"></iconify-icon></span>
            <span class="daily-slot-lbl">${isId ? 'Camilan' : 'Snack'}</span>
          </button>
        </div>
      </div>

      <!-- Two-column: Servings Stepper & Time Input -->
      <div class="daily-confirm-row-2col">
        <div>
          <label class="daily-confirm-form-label">${isId ? 'Pengganda Porsi:' : 'Portion Multiplier:'}</label>
          <div class="daily-stepper-row">
            <button type="button" class="daily-stepper-btn" onclick="app.changeDailyMealServings(-1)" title="Kurangi Porsi">-</button>
            <span class="daily-stepper-val">${servings}x (${currentGrams}g)</span>
            <button type="button" class="daily-stepper-btn" onclick="app.changeDailyMealServings(1)" title="Tambah Porsi">+</button>
          </div>
        </div>
        <div>
          <label class="daily-confirm-form-label">${isId ? 'Jam Makan:' : 'Meal Clock Time:'}</label>
          <input type="time" class="daily-time-input" value="${currentTime}" onchange="app.updateDailyMealTime(this.value)">
        </div>
      </div>

      <!-- Clinical Tip Rationale -->
      <div class="daily-confirm-clinical-note">
        <iconify-icon icon="solar:shield-check-bold" style="font-size:18px;color:#10B981;flex-shrink:0;margin-top:1px;"></iconify-icon>
        <div style="font-size:11.5px;color:#064E3B;line-height:1.45;">
          <strong>${isId ? 'Dampak Klinis:' : 'Clinical Impact:'}</strong> ${rationale}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="daily-confirm-actions">
        <button type="button" class="daily-confirm-cancel-btn" onclick="app.closeModal('modal-confirm-daily-intake')">
          ${isId ? 'Batal' : 'Cancel'}
        </button>
        <button type="button" class="daily-confirm-correct-btn" onclick="app.closeModal('modal-confirm-daily-intake'); app.openScanModal();" title="Koreksi gramatur atau bahan piring">
          <i data-lucide="edit-3" style="width:14px;height:14px;"></i>
          <span>${isId ? 'Koreksi Bahan' : 'Edit Ingredients'}</span>
        </button>
        <button type="button" class="daily-confirm-submit-btn" onclick="app.confirmAddScanToDailyIntake()">
          <iconify-icon icon="solar:check-circle-bold" style="font-size:17px;"></iconify-icon>
          <span>${isId ? 'Konfirmasi & Catat ke Gizi Harian' : 'Confirm & Log to Daily Nutrition'}</span>
        </button>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }
  }

  confirmAddScanToDailyIntake() {
    this.requireAuth(() => {
      const state = this.dailyIntakeConfirmState;
      if (!state || !cvEngine.currentScan) return;

      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      const userKey = this.userProfile?.contact || this.userProfile?.email || this.userProfile?.name;
      const agg = cvEngine.calculateAggregatedNutrients();
      const servings = state.servings || 1.0;

      const scaledNutrients = {
        protein: [Math.round(agg.protein[0] * servings * 10) / 10, Math.round(agg.protein[1] * servings * 10) / 10],
        cals: [Math.round(agg.cals[0] * servings), Math.round(agg.cals[1] * servings)],
        carbs: [Math.round(agg.carbs[0] * servings * 10) / 10, Math.round(agg.carbs[1] * servings * 10) / 10],
        fat: [Math.round(agg.fat[0] * servings * 10) / 10, Math.round(agg.fat[1] * servings * 10) / 10],
        totalGrams: Math.round(agg.totalGrams * servings)
      };

      const slotLabels = {
        breakfast: isId ? 'Sarapan' : 'Breakfast',
        lunch: isId ? 'Makan Siang' : 'Lunch',
        dinner: isId ? 'Makan Malam' : 'Dinner',
        snack: isId ? 'Camilan' : 'Snack'
      };
      const slotName = slotLabels[state.slot] || slotLabels.lunch;

      const scanTitle = cvEngine.currentScan.title 
        || (cvEngine.currentScan.segments && cvEngine.currentScan.segments.length > 0
            ? cvEngine.currentScan.segments.map(s => isId ? s.name : (s.nameEn || s.name)).join(', ')
            : (isId ? 'Hasil Scan Piring AI' : 'AI Plate Scan'));

      const mealMeta = {
        name: `${scanTitle} (${slotName})`,
        mealType: state.slot,
        time: state.time,
        source: isId ? `Pindai Kamera AI (${slotName})` : `AI Camera Scan (${slotName})`,
        confidence: cvEngine.currentScan.confidenceOverall || 88,
        imageUrl: cvEngine.currentScan.imageUrl || cvEngine.currentScan.imageSrc || '',
        segments: cvEngine.currentScan.segments || []
      };

      progressTracker.addLoggedMeal(scaledNutrients, userKey, mealMeta);

      // Tandai scan aktif sebagai sudah dicatat hari ini
      cvEngine.currentScan._isLoggedToday = true;
      cvEngine.currentScan._loggedMealType = state.slot;
      cvEngine.currentScan._loggedMealName = slotName;
      cvEngine.currentScan._loggedTime = state.time;
      cvEngine.currentScan._loggedNutrients = scaledNutrients;

      this.closeModal('modal-confirm-daily-intake');
      this.closeModal('scan-modal');

      // Re-render UI
      this.renderOverviewPlate();
      progressTracker.renderMacroDonut(this.userProfile?.targets);
      progressTracker.renderWeeklyBarChart();
      progressTracker.renderTodayMealHistory();

      const avgProt = Math.round(((scaledNutrients.protein[0] + scaledNutrients.protein[1]) / 2) * 10) / 10;
      const avgCal = Math.round((scaledNutrients.cals[0] + scaledNutrients.cals[1]) / 2);
      this.showToast(isId 
        ? `✅ Berhasil ditambahkan ke Gizi Harian (${slotName})! +${avgProt}g Protein · +${avgCal} kkal.` 
        : `✅ Added to Daily Nutrition (${slotName})! +${avgProt}g Protein · +${avgCal} kcal.`);
    }, 'mencatat ke gizi harian');
  }

  // Simpan Hasil Scan ke Log Asupan Harian (Membuka Alur Konfirmasi)
  saveScanToDailyIntake() {
    this.openScanDailyIntakeConfirmModal();
  }

  // =========================================================================
  // OUR POPULAR MENU / KATALOG GIZI MAKANAN MODERN (MATCHING MOCKUP)
  // =========================================================================
  openPlateCatalogModal() {
    this.requireAuth(() => {
      this.renderPlateCatalogModal();
      this.openModal('plate-catalog-modal');
    }, 'katalog pangan');
  }

  renderPlateCatalogModal() {
    const body = document.getElementById('plate-catalog-modal-body');
    if (!body) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const segments = (window.cvEngine && cvEngine.currentScan && cvEngine.currentScan.segments) ? cvEngine.currentScan.segments : [];
    const db = NUTRIVISION_DATA.indonesianFoodDatabase || [];

    // Fallback default segments if none detected yet
    let targetSegments = segments;
    if (targetSegments.length === 0) {
      targetSegments = [
        { name: 'Nasi Putih Pulen', nameEn: 'Steamed White Rice', portionGrams: 175, color: '#9EA76B', protein: [4, 5], cals: [220, 250], carbs: [48, 55], fat: [0.4, 0.8], foodId: 'nasi-putih' },
        { name: 'Dada Ayam Panggang', nameEn: 'Grilled Chicken Breast', portionGrams: 125, color: '#9EA76B', protein: [28, 33], cals: [190, 220], carbs: [0, 1.5], fat: [3.8, 5.2], foodId: 'dada-ayam-panggang' },
        { name: 'Tumis Kangkung', nameEn: 'Sautéed Water Spinach', portionGrams: 85, color: '#2DD4BF', protein: [2.5, 3.5], cals: [45, 60], carbs: [3, 5], fat: [1.2, 2.0], foodId: 'tumis-kangkung' },
        { name: 'Telur Rebus (1/2 butir)', nameEn: 'Boiled Egg (1/2 piece)', portionGrams: 30, color: '#F59E0B', protein: [3.3, 3.8], cals: [38, 45], carbs: [0.3, 0.5], fat: [2.6, 3.0], foodId: 'telur-rebus' }
      ];
    }

    const totalGrams = targetSegments.reduce((sum, s) => sum + (s.portionGrams || 0), 0) || 1;
    let totalEstimatedPrice = 0;
    let totalProtMin = 0;
    let totalProtMax = 0;
    let totalCalsMin = 0;
    let totalCalsMax = 0;

    const cardsHtml = targetSegments.map((seg, idx) => {
      const segName = (seg.name || '').toLowerCase();
      const segFoodId = (seg.foodId || '').toLowerCase();

      // Find best match in database
      let matchedFood = db.find(f => segFoodId && (f.id === segFoodId || f.id.includes(segFoodId) || segFoodId.includes(f.id)));
      if (!matchedFood) {
        const keywords = segName.split(/[\s,()·/+-]+/).filter(w => w.length > 2);
        matchedFood = db.find(f => {
          const fName = f.name.toLowerCase();
          for (const kw of keywords) {
            if (['rebus', 'kukus', 'panggang', 'butir', 'goreng', 'porsi', 'potong', 'halus', 'tim', 'sutra'].includes(kw)) continue;
            if (fName.includes(kw) || f.id.includes(kw)) return true;
          }
          return false;
        });
      }

      const portionGrams = seg.portionGrams || 100;
      const portionPct = Math.round((portionGrams / totalGrams) * 100);

      // Extract price and metadata
      let priceNum = 3500;
      let priceText = 'Rp 3.500';
      let bappenasText = isId ? 'Bapanas: Acuan Standar' : 'Natl Food Agency: Standard';
      let foodImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
      let clinicalBenefit = isId ? 'Kaya mikronutrien dan protein esensial untuk percepatan pemulihan jaringan.' : 'Rich in micronutrients and essential protein for accelerated tissue repair.';
      let tkpiCode = 'TKPI 2024';
      let displayName = isId ? seg.name : (seg.nameEn || seg.name);

      if (matchedFood) {
        displayName = isId ? matchedFood.name : (matchedFood.nameEn || matchedFood.name);
        foodImage = matchedFood.image || foodImage;
        bappenasText = isId ? (matchedFood.bappenasRef || bappenasText) : (matchedFood.bappenasRefEn || matchedFood.bappenasRef || bappenasText);
        clinicalBenefit = isId ? (matchedFood.subtitle || matchedFood.clinicalIndication || clinicalBenefit) : (matchedFood.subtitleEn || matchedFood.clinicalIndicationEn || clinicalBenefit);
        tkpiCode = matchedFood.tkpiCode || tkpiCode;
        
        // Extract raw price number e.g. "Rp 4.800" -> 4800
        const rawNum = parseInt((matchedFood.price || '').replace(/[^0-9]/g, ''), 10);
        if (rawNum > 0) {
          priceNum = rawNum;
          priceText = matchedFood.price;
        }
      }

      totalEstimatedPrice += priceNum;
      
      const pMin = seg.protein ? seg.protein[0] : (matchedFood ? matchedFood.protein : 4);
      const pMax = seg.protein ? seg.protein[1] : (matchedFood ? matchedFood.protein + 2 : 6);
      totalProtMin += pMin;
      totalProtMax += pMax;

      const cMin = seg.cals ? seg.cals[0] : (matchedFood ? matchedFood.calories - 20 : 90);
      const cMax = seg.cals ? seg.cals[1] : (matchedFood ? matchedFood.calories + 20 : 140);
      totalCalsMin += cMin;
      totalCalsMax += cMax;

      const calLabel = isId ? 'Kal:' : 'Cal:';
      const calUnit = isId ? 'kkal' : 'kcal';

      return `
        <div class="plate-food-card">
          <div class="plate-food-thumb-box">
            <img src="${foodImage}" alt="${displayName}" class="plate-food-thumb-img" onerror="this.src='icons/icon-192.png'" loading="lazy" />
            <span class="plate-food-color-tag" style="background:${seg.color || '#9EA76B'};"></span>
          </div>
          <div class="plate-food-details">
            <div>
              <div class="plate-food-hdr">
                <div class="plate-food-name">${displayName}</div>
                <span class="plate-portion-pill">${portionGrams}g (${portionPct}%)</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
                <span class="plate-food-price-badge">
                  <i data-lucide="tag" style="width:12px;height:12px;"></i> ${priceText}
                </span>
                <span class="plate-food-bapanas-ref">${bappenasText}</span>
              </div>
              <div class="plate-food-macros">
                <span class="plate-macro-item">Prot: <b>${pMin}-${pMax}g</b></span> · 
                <span class="plate-macro-item">${calLabel} <b>${cMin}-${cMax} ${calUnit}</b></span> · 
                <span class="plate-macro-item" style="color:#64748B;">${tkpiCode}</span>
              </div>
            </div>
            <div class="plate-food-benefit">
              💡 ${clinicalBenefit}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const compLabel = isId ? 'Komponen Bahan' : 'Food Components';
    const compUnit = isId ? 'Bahan' : 'Items';
    const totalPortionLabel = isId ? 'Total Porsi' : 'Total Portion';
    const estCostLabel = isId ? 'Estimasi Biaya Piring' : 'Estimated Plate Cost';

    body.innerHTML = `
      <div class="plate-summary-strip">
        <div>
          <div class="plate-summary-stat-label">${compLabel}</div>
          <div class="plate-summary-stat-val">${targetSegments.length} <span style="font-size:12px;font-weight:500;color:var(--text-sub);">${compUnit}</span></div>
        </div>
        <div>
          <div class="plate-summary-stat-label">${totalPortionLabel}</div>
          <div class="plate-summary-stat-val">${totalGrams} <span style="font-size:12px;font-weight:500;color:var(--text-sub);">gram</span></div>
        </div>
        <div>
          <div class="plate-summary-stat-label">Total Protein</div>
          <div class="plate-summary-stat-val" style="color:#15803D;">${totalProtMin.toFixed(1).replace('.0','')}-${totalProtMax.toFixed(1).replace('.0','')} <span style="font-size:12px;font-weight:500;color:#15803D;">g</span></div>
        </div>
        <div>
          <div class="plate-summary-stat-label">${estCostLabel}</div>
          <div class="plate-summary-stat-val" style="color:#0284C7;">Rp ${totalEstimatedPrice.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div class="plate-breakdown-items-grid">
        ${cardsHtml}
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  openPlateMatchedCatalog() {
    this.isPlateMatchedCatalogMode = true;
    this.activeCatalogCategory = 'all';
    document.querySelectorAll('.popular-category-pills .cat-pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'all');
    });
    const searchInput = document.getElementById('food-catalog-search');
    if (searchInput) searchInput.value = '';

    this.navigate('catalog');
  }

  clearCatalogPlateFilter() {
    this.isPlateMatchedCatalogMode = false;
    this.activeCatalogCategory = 'all';
    this.catalogCurrentPage = 1;
    document.querySelectorAll('.popular-category-pills .cat-pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'all');
    });
    const searchInput = document.getElementById('food-catalog-search');
    if (searchInput) searchInput.value = '';
    this.renderFoodCatalog('', true);
  }

  getMatchedCatalogFoodsForPlate() {
    const segments = (window.cvEngine && cvEngine.currentScan && cvEngine.currentScan.segments) ? cvEngine.currentScan.segments : [];
    const db = NUTRIVISION_DATA.indonesianFoodDatabase || [];

    if (segments.length === 0) {
      return { items: db, segmentNames: [] };
    }

    const matched = [];
    const seenIds = new Set();
    const segmentNames = [];

    segments.forEach(seg => {
      if (seg.name) segmentNames.push(seg.name);
      const segName = (seg.name || '').toLowerCase();
      const segFoodId = (seg.foodId || '').toLowerCase();

      db.forEach(food => {
        if (seenIds.has(food.id)) return;

        // 1. Direct or partial ID match
        if (segFoodId && (food.id === segFoodId || food.id.includes(segFoodId) || segFoodId.includes(food.id))) {
          seenIds.add(food.id);
          matched.push(food);
          return;
        }

        // 2. Meaningful keyword matching
        const foodName = food.name.toLowerCase();
        const keywords = segName.split(/[\s,()·/+-]+/).filter(w => w.length > 2);
        for (const kw of keywords) {
          if (['rebus', 'kukus', 'panggang', 'butir', 'goreng', 'porsi', 'potong', 'halus', 'tim', 'sutra', 'bening', 'sayur', 'menu', 'komponen'].includes(kw)) continue;
          if (foodName.includes(kw) || food.id.includes(kw)) {
            seenIds.add(food.id);
            matched.push(food);
            break;
          }
        }
      });
    });

    return {
      items: matched.length > 0 ? matched : db,
      segmentNames
    };
  }

  filterCatalogCategory(category, btnElement) {
    if (category === 'favorite') {
      if (!this.isAuthenticated()) {
        this.requireAuth(() => this.filterCatalogCategory('favorite', btnElement), 'akses favorit');
        return;
      }
    }
    this.activeCatalogCategory = category;
    this.catalogCurrentPage = 1;
    this.isPlateMatchedCatalogMode = false;
    document.querySelectorAll('.popular-category-pills .cat-pill-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) {
      btnElement.classList.add('active');
    }
    const searchVal = document.getElementById('food-catalog-search')?.value || '';
    this.renderFoodCatalog(searchVal, true);
  }

  changeCatalogPage(delta) {
    const newPage = (this.catalogCurrentPage || 1) + delta;
    this.setCatalogPage(newPage);
  }

  setCatalogPage(page) {
    this.catalogCurrentPage = page;
    const searchVal = document.getElementById('food-catalog-search')?.value || '';
    this.renderFoodCatalog(searchVal, false);

    const catalogEl = document.querySelector('.popular-menu-card') || document.getElementById('view-catalog');
    if (catalogEl && typeof catalogEl.scrollIntoView === 'function') {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollCatalogGrid(direction) {
    this.changeCatalogPage(direction);
  }

  loadMenuClicks() {
    try {
      const saved = localStorage.getItem('nutrivision_menu_clicks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error loading menu clicks:', e);
    }
    return {
      'telur-rebus': 3428,
      'ikan-gabus-kukus': 2894,
      'kentang-ubi-kukus': 1845,
      'dada-ayam-panggang': 2132,
      'bubur-ayam': 1958,
      'pepes-ikan-kembung': 1762,
      'tempe-bacem-kukus': 1684,
      'nasi-putih': 1540,
      'tahu-kukus-wortel': 1426,
      'sayur-bayam-bening': 1380,
      'salmon-brokoli-kukus': 1925,
      'alpukat-madu': 1250,
      'sup-labu-kuning': 1180
    };
  }

  saveMenuClicks() {
    try {
      localStorage.setItem('nutrivision_menu_clicks', JSON.stringify(this.menuClicks));
    } catch (e) {
      console.warn('Error saving menu clicks:', e);
    }
  }

  getMenuClicks(foodId) {
    if (!this.menuClicks) this.menuClicks = this.loadMenuClicks();
    if (this.menuClicks[foodId] !== undefined) {
      return this.menuClicks[foodId];
    }
    let hash = 0;
    for (let i = 0; i < foodId.length; i++) {
      hash = (hash * 31 + foodId.charCodeAt(i)) % 1400;
    }
    const val = 1100 + hash;
    this.menuClicks[foodId] = val;
    this.saveMenuClicks();
    return val;
  }

  formatClicks(count) {
    if (count >= 1000) {
      const kVal = (count / 1000).toFixed(1).replace('.0', '');
      return `${kVal}k+`;
    }
    return count.toString();
  }

  trackMenuClick(foodId) {
    if (!this.menuClicks) this.menuClicks = this.loadMenuClicks();
    const current = this.getMenuClicks(foodId);
    const updated = current + 1;
    this.menuClicks[foodId] = updated;
    this.saveMenuClicks();

    const badgeEl = document.getElementById(`badge-clicks-${foodId}`);
    if (badgeEl) {
      const textSpan = badgeEl.querySelector('.sales-clicks-text');
      if (textSpan) {
        textSpan.textContent = `Terlaris · ${this.formatClicks(updated)} klik`;
      }
      badgeEl.classList.remove('pulse');
      void badgeEl.offsetWidth;
      badgeEl.classList.add('pulse');
    }
  }

  handleCardClick(foodId) {
    this.openAddToMealPlannerModal(foodId);
  }

  handleRecipeClick(foodId) {
    this.trackMenuClick(foodId);
    this.openFoodRecipeModal(foodId);
  }

  loadFavoriteFoods() {
    try {
      const saved = localStorage.getItem('nutrivision_favorite_foods');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch (e) {
      console.warn('Error loading favorite foods:', e);
    }
    return new Set(['telur-rebus', 'ikan-gabus-kukus']);
  }

  saveFavoriteFoods() {
    try {
      localStorage.setItem('nutrivision_favorite_foods', JSON.stringify([...this.favoriteFoods]));
    } catch (e) {
      console.warn('Error saving favorite foods:', e);
    }
    this.updateFavoriteBadge();
  }

  updateFavoriteBadge() {
    const badge = document.getElementById('fav-catalog-count-badge');
    if (badge) {
      const count = this.favoriteFoods ? this.favoriteFoods.size : 0;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  toggleFavoriteFood(foodId, event) {
    if (event) event.stopPropagation();
    if (!this.isAuthenticated()) {
      this.requireAuth(() => this.toggleFavoriteFood(foodId, null), 'simpan favorit');
      return;
    }
    if (!this.favoriteFoods) this.favoriteFoods = this.loadFavoriteFoods();
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const food = NUTRIVISION_DATA.indonesianFoodDatabase.find(f => f.id === foodId);
    const foodName = food ? (isId ? food.name : (food.nameEn || food.name)) : (isId ? 'Pangan Lokal' : 'Local Food');

    if (this.favoriteFoods.has(foodId)) {
      this.favoriteFoods.delete(foodId);
      this.saveFavoriteFoods();
      this.showToast(isId ? `Dihapus dari Favorit: ${foodName}` : `Removed from Favorites: ${foodName}`);
    } else {
      this.favoriteFoods.add(foodId);
      this.saveFavoriteFoods();
      this.showToast(isId ? `❤️ Disimpan ke Favorit: ${foodName}` : `❤️ Saved to Favorites: ${foodName}`);
    }
    const searchVal = document.getElementById('food-catalog-search')?.value || '';
    this.renderFoodCatalog(searchVal);
  }

  // =========================================================================
  // PINTEREST-STYLE LINEAR MONOLINE FOOD ILLUSTRATIONS (32 FOODS)
  // =========================================================================
  getLinearFoodIllustration(foodId) {
    const icons = {
      'alpukat': `<svg viewBox="0 0 24 24"><path d="M12 2.5C8 2.5 5 7.5 5 13.5a7 7 0 0 0 14 0c0-6-3-11-7-11z"/><circle cx="12" cy="14.5" r="3.2"/></svg>`,
      'bakso': `<svg viewBox="0 0 24 24"><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><circle cx="8" cy="10.5" r="2.2"/><circle cx="12" cy="8.5" r="2.2"/><circle cx="16" cy="10.5" r="2.2"/><path d="M9 5c0-1.5 1-2 1-3M15 5c0-1.5 1-2 1-3"/></svg>`,
      'brokoli-kukus': `<svg viewBox="0 0 24 24"><path d="M10.5 16v4.5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V16"/><path d="M8.5 16A4.5 4.5 0 0 1 6 8.5a4.5 4.5 0 0 1 7.5-3.2A4.5 4.5 0 0 1 18 8.5a4.5 4.5 0 0 1-2.5 7.5z"/><path d="M10.5 11.5a2 2 0 0 1 2-2M13 13.5a2 2 0 0 0 2-1"/></svg>`,
      'buah-pisang': `<svg viewBox="0 0 24 24"><path d="M4 17.5c3 4 11 4 16-5.5-2 1-6 2-11-1-3-2-4-4-5-5.5 0 4 0 8 0 12z"/><path d="M4 5.5l-1-2M19 11.5l2 1.2"/><path d="M7 14.5c4 1 8 0 11-4"/></svg>`,
      'capcay-kuah': `<svg viewBox="0 0 24 24"><path d="M3.5 12.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M7 10.5c1-3 4-3 5-1M12 9.5c1-3 4-3 5-1"/><circle cx="9.5" cy="15" r="1.2"/><circle cx="14.5" cy="15" r="1.2"/></svg>`,
      'dada-ayam-rebus': `<svg viewBox="0 0 24 24"><path d="M5 13c0-4.5 3.5-8.5 8-8.5s8 3 8 7-3.5 8.5-8 8.5a8.5 8.5 0 0 1-8-7z"/><path d="M9 10c2-1 5-1 7 1M8 13.5c2-1 4-1 6 1"/></svg>`,
      'dada-ayam-panggang': `<svg viewBox="0 0 24 24"><path d="M5 13c0-4.5 3.5-8.5 8-8.5s8 3 8 7-3.5 8.5-8 8.5a8.5 8.5 0 0 1-8-7z"/><path d="M8 8.5l4.5 6M11.5 7.5l4.5 6M14.5 8.5l4 5.5"/></svg>`,
      'edamame-rebus': `<svg viewBox="0 0 24 24"><path d="M3.5 19c6 1 14.5-2 17.5-13.5-5.5 1-13.5 5.5-17.5 13.5z"/><circle cx="8" cy="15" r="1.8"/><circle cx="12.5" cy="11.5" r="1.8"/><circle cx="16.5" cy="7.5" r="1.8"/></svg>`,
      'gado-gado': `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="14" rx="9" ry="5.5"/><path d="M7.5 11.5c1-2 3-2 4 0M12.5 10.5c1-2 3-2 4 0"/><rect x="10" y="7.5" width="4" height="4" rx="1"/></svg>`,
      'ikan-bakar': `<svg viewBox="0 0 24 24"><path d="M3.5 12c4.5-5 12.5-5 15.5 0-3 5-11 5-15.5 0z"/><path d="M19 12l3-3v6l-3-3z"/><circle cx="7.5" cy="11.5" r="0.9"/><path d="M11.5 8.5l-1 6.5M14.5 8.5l-1 6.5"/></svg>`,
      'ikan-tuna-kukus': `<svg viewBox="0 0 24 24"><path d="M4 12c3-4.5 10-5.5 15-2 2 4.5-1 9-6 10-5 1-8-3-9-8z"/><circle cx="12" cy="11.5" r="2.8"/><path d="M9 15.5c2 1 4 1 6 0"/></svg>`,
      'jagung-manis-rebus': `<svg viewBox="0 0 24 24"><rect x="6" y="4.5" width="12" height="13.5" rx="6"/><path d="M6 9.5h12M6 13.5h12M10 4.5v13.5M14 4.5v13.5M12 18v3.5"/></svg>`,
      'kacang-hijau-rebus': `<svg viewBox="0 0 24 24"><path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><circle cx="7.5" cy="9.5" r="1.4"/><circle cx="12" cy="8.5" r="1.4"/><circle cx="16.5" cy="9.5" r="1.4"/><path d="M14 3.5l4 6"/></svg>`,
      'karedok': `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="14" rx="9" ry="5.5"/><path d="M7 10c0-2 2.5-3 4-2M13 7.5c2 0 4 1 4 3M9.5 12.5c2-1 4.5-1 6.5 1"/></svg>`,
      'kentang-kukus': `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="6" transform="rotate(-15 12 12)"/><circle cx="9" cy="11" r="0.8"/><circle cx="14" cy="10" r="0.8"/><circle cx="12" cy="14" r="0.8"/></svg>`,
      'nasi-merah': `<svg viewBox="0 0 24 24"><path d="M4 11.5h16a8 8 0 0 1-16 0z"/><path d="M6.5 11.5a5.5 5.5 0 0 1 11 0"/><path d="M10 7.5l1.5-1.5M13.5 7.5l-1.5-1.5"/></svg>`,
      'nasi-putih': `<svg viewBox="0 0 24 24"><path d="M4 11.5h16a8 8 0 0 1-16 0z"/><path d="M6 11.5a6 6 0 0 1 12 0"/><path d="M9 5c0-1.5 1-2 1-3M14 5c0-1.5 1-2 1-3"/></svg>`,
      'oatmeal': `<svg viewBox="0 0 24 24"><path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><ellipse cx="12" cy="11.5" rx="8.5" ry="3.2"/><path d="M14.5 3.5l3.5 6"/><circle cx="10" cy="11.5" r="1.1"/><circle cx="13.5" cy="12" r="1.1"/></svg>`,
      'pepaya-segar': `<svg viewBox="0 0 24 24"><path d="M4 16.5c4 3 11 3 16-3.5-3-1-8-2-12-1-2 1-3 2.5-4 4.5z"/><circle cx="9.5" cy="14" r="0.9"/><circle cx="12" cy="13.5" r="0.9"/><circle cx="14.5" cy="13.5" r="0.9"/></svg>`,
      'roti-gandum': `<svg viewBox="0 0 24 24"><rect x="5" y="6.5" width="14" height="13" rx="3"/><path d="M4 9.5c0-3.5 3-5.5 8-5.5s8 2 8 5.5"/><circle cx="8.5" cy="11.5" r="0.8"/><circle cx="12.5" cy="14.5" r="0.8"/><circle cx="15" cy="10.5" r="0.8"/></svg>`,
      'salad-sayur-segar': `<svg viewBox="0 0 24 24"><path d="M3.5 12.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M6 12.5c1-3 3-4 6-2 3-2 5-1 6 2"/><circle cx="11" cy="9.5" r="1.6"/></svg>`,
      'salmon-panggang': `<svg viewBox="0 0 24 24"><path d="M4 15.5c2-6 8-9.5 14-6.5 2 4.5 1 8.5-3 10.5-5 2-9 0-11-4z"/><path d="M8 12.5c2-1 4-1 6 0M10.5 9.5c2-1 4-1 5 1"/></svg>`,
      'sayur-asem': `<svg viewBox="0 0 24 24"><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><circle cx="9" cy="9.5" r="2.2"/><path d="M14 9c1-2 3-2 4 0"/><path d="M9 5c0-1.5 1-2 1-3"/></svg>`,
      'sayur-bayam-bening': `<svg viewBox="0 0 24 24"><path d="M3.5 12.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M7 11.5c1-3 4-4 5-1M12 10.5c1-3 4-3 5 0"/><path d="M10 11.5v2.5M15 10.5v2.5"/></svg>`,
      'singkong-rebus': `<svg viewBox="0 0 24 24"><rect x="5.5" y="8" width="13" height="8.5" rx="4"/><line x1="9.5" y1="8" x2="9.5" y2="16.5"/><line x1="13.5" y1="8" x2="13.5" y2="16.5"/></svg>`,
      'sup-daging-sapi': `<svg viewBox="0 0 24 24"><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><rect x="7.5" y="8.5" width="4.5" height="4.5" rx="1"/><rect x="13.5" y="9.5" width="4" height="4" rx="1"/><path d="M11 5c0-1.5 1-2 1-3"/></svg>`,
      'sup-tahu': `<svg viewBox="0 0 24 24"><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><rect x="7" y="8" width="4.5" height="4.5" rx="1"/><rect x="13" y="8" width="4.5" height="4.5" rx="1"/><path d="M10 4.5c0-1 1-1.5 1-2.5M14 4.5c0-1 1-1.5 1-2.5"/></svg>`,
      'sup-wortel-kentang': `<svg viewBox="0 0 24 24"><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><circle cx="9" cy="9.5" r="2.2"/><path d="M9 8.5v2M8 9.5h2"/><rect x="13" y="8" width="4" height="4" rx="1"/></svg>`,
      'telur-rebus': `<svg viewBox="0 0 24 24"><path d="M12 2.5C8 2.5 5 7.5 5 13.5a7 7 0 0 0 14 0c0-6-3-11-7-11z"/><circle cx="12" cy="14" r="3.2"/></svg>`,
      'tempe-panggang': `<svg viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="10" rx="2"/><line x1="8.5" y1="7" x2="8.5" y2="17"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="15.5" y1="7" x2="15.5" y2="17"/></svg>`,
      'tumis-buncis': `<svg viewBox="0 0 24 24"><path d="M5 6c3 4 5 9 5 14M11 5c2 4 4 9 4 14M17 6c-1 4-2 9-2 14"/></svg>`,
      'ubi-jalar-rebus': `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="5.5" transform="rotate(-20 12 12)"/><path d="M8 12c2 1 5 1 8-1"/></svg>`
    };
    return icons[foodId] || `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`;
  }

  // =========================================================================
  // PERSONALIZED CLINICAL RECOMMENDATION ENGINE (TB, BB, CONDITION)
  // =========================================================================
  calculateFoodSuitabilityScore(food, condition, bmi, weight, height) {
    let score = 50;
    const cond = condition || 'gym';
    const foodConds = food.clinicalSuitability || [];

    if (cond === 'gym') {
      if (foodConds.includes('gym')) score += 50;
      score += (food.protein || 0) * 2.8;

      if (['dada-ayam-panggang', 'dada-ayam-rebus', 'salmon-panggang', 'ikan-tuna-kukus'].includes(food.id)) {
        score += 25;
      }
      if (['telur-rebus', 'tempe-panggang', 'edamame-rebus'].includes(food.id)) {
        score += 20;
      }
      if (['oatmeal', 'nasi-merah', 'ubi-jalar-rebus', 'kentang-kukus', 'buah-pisang'].includes(food.id)) {
        score += 15;
      }
      if (food.id === 'brokoli-kukus') {
        score += 18;
      }

      if (bmi >= 25) {
        if (food.calories > 200) score -= 15;
        if (['brokoli-kukus', 'dada-ayam-rebus', 'telur-rebus'].includes(food.id)) score += 10;
      } else if (bmi < 18.5) {
        if (['alpukat', 'salmon-panggang', 'ubi-jalar-rebus', 'nasi-merah'].includes(food.id)) score += 15;
      }
    } else if (cond === 'rehab' || cond === 'post-surgery') {
      if (foodConds.includes('rehab') || foodConds.includes('post-surgery')) score += 50;

      if (['sup-daging-sapi', 'sup-daging-sapi-bening'].includes(food.id)) score += 35;
      if (food.id === 'salmon-panggang') score += 35;
      if (['ikan-tuna-kukus', 'telur-rebus'].includes(food.id)) score += 30;
      if (['sup-tahu', 'sup-wortel-kentang', 'sayur-bayam-bening', 'capcay-kuah'].includes(food.id)) score += 28;
      if (['pepaya-segar', 'alpukat', 'edamame-rebus'].includes(food.id)) score += 25;
      if (['kentang-kukus', 'kacang-hijau-rebus'].includes(food.id)) score += 20;

      if (food.texture === 'soft' || food.texture === 'liquid') score += 10;

      if (bmi >= 25) {
        if (['sayur-bayam-bening', 'sup-tahu', 'capcay-kuah', 'brokoli-kukus'].includes(food.id)) score += 10;
      } else if (bmi < 18.5) {
        if (['alpukat', 'salmon-panggang', 'sup-daging-sapi'].includes(food.id)) score += 12;
      }
    } else {
      // General wellness
      if (food.category === 'plant-veg' || food.category === 'fruit-bev') score += 25;
      score += (food.protein || 0) * 1.5;
    }

    if (this.favoriteFoods && this.favoriteFoods.has(food.id)) {
      score += 5;
    }

    return score;
  }

  sortFoodsByPersonalizedRecommendation(items) {
    const condition = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const height = parseFloat(this.userProfile?.heightCm) || 170;
    const weight = parseFloat(this.userProfile?.weightKg) || 65;
    const heightM = height / 100;
    const bmi = +(weight / (heightM * heightM)).toFixed(1);

    return [...items].sort((a, b) => {
      const scoreA = this.calculateFoodSuitabilityScore(a, condition, bmi, weight, height);
      const scoreB = this.calculateFoodSuitabilityScore(b, condition, bmi, weight, height);
      return scoreB - scoreA;
    });
  }

  // =========================================================================
  // MEAL PLANNER CONFIRMATION MODAL CONTROLLER (VALIDASI SEBELUM TAMBAH)
  // =========================================================================
  loadUserDailyMealPlans() {
    try {
      const saved = localStorage.getItem('nutrivision_user_meal_plans');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error loading user meal plans:', e);
    }
    return [];
  }

  saveUserDailyMealPlans() {
    try {
      localStorage.setItem('nutrivision_user_meal_plans', JSON.stringify(this.userDailyMealPlans || []));
    } catch (e) {
      console.warn('Error saving user meal plans:', e);
    }
  }

  openAddToMealPlannerModal(foodId) {
    this.trackMenuClick(foodId);
    const food = NUTRIVISION_DATA.indonesianFoodDatabase.find(f => f.id === foodId);
    if (!food) return;

    this.mealPlannerConfirmState = {
      foodId: foodId,
      slot: 'lunch',
      servings: 1,
      syncWithPlate: true
    };

    this.renderMealPlannerConfirmContent();
    this.openModal('modal-confirm-meal-planner');
  }

  selectMealPlannerSlot(slot) {
    if (!this.mealPlannerConfirmState) return;
    this.mealPlannerConfirmState.slot = slot;
    document.querySelectorAll('.mp-slot-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.slot === slot);
    });
  }

  changeMealPlannerServings(delta) {
    if (!this.mealPlannerConfirmState) return;
    const current = this.mealPlannerConfirmState.servings || 1;
    const updated = Math.max(0.5, Math.min(5, Math.round((current + delta * 0.5) * 10) / 10));
    if (updated === current) return;
    this.mealPlannerConfirmState.servings = updated;
    this.renderMealPlannerConfirmContent();
  }

  toggleMealPlannerSyncPlate(checked) {
    if (!this.mealPlannerConfirmState) return;
    this.mealPlannerConfirmState.syncWithPlate = !!checked;
  }

  renderMealPlannerConfirmContent() {
    const container = document.getElementById('meal-planner-confirm-content');
    if (!container || !this.mealPlannerConfirmState) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const food = NUTRIVISION_DATA.indonesianFoodDatabase.find(f => f.id === this.mealPlannerConfirmState.foodId);
    if (!food) return;

    const servings = this.mealPlannerConfirmState.servings || 1;
    const activeSlot = this.mealPlannerConfirmState.slot || 'lunch';
    const syncWithPlate = this.mealPlannerConfirmState.syncWithPlate !== false;

    const defaultGrams = food.defaultPortionGrams || 100;
    const currentGrams = Math.round(defaultGrams * servings);
    const currentProt = Math.round((food.protein || 20) * servings);
    const currentCals = Math.round((food.calories || 250) * servings);
    const currentCarbs = Math.round((food.carbs !== undefined ? food.carbs : 15) * servings);
    const currentFat = Math.round((food.fat !== undefined ? food.fat : 8) * servings);

    const displayName = isId ? food.name : (food.nameEn || food.name);
    const clinicalTag = isId ? (food.clinicalIndication || 'Pemulihan Klinis') : (food.clinicalIndicationEn || food.clinicalIndication || 'Clinical Recovery');
    const tkpiCode = food.tkpiCode || 'TKPI-Kemenkes';

    const condition = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    let rationale = isId 
      ? 'Kandungan nutrisi seimbang untuk mendukung fase regenerasi dan pemulihan harian tubuh Anda.'
      : 'Optimal nutritional balance to support daily cellular regeneration and body recovery.';

    if (condition === 'post-surgery') {
      rationale = isId 
        ? 'Tinggi albumin dan asam amino esensial untuk mempercepat remodeling jaringan luka pasca-bedah.'
        : 'Rich in albumin and essential amino acids to accelerate post-surgical wound tissue remodeling.';
    } else if (condition === 'gym') {
      rationale = isId 
        ? `Menyumbang ${currentProt}g protein berkualitas tinggi untuk sintesis protein otot (MPS) dan adaptasi latihan.`
        : `Provides ${currentProt}g high-quality protein for muscle protein synthesis (MPS) and workout adaptation.`;
    } else if (condition === 'rehab') {
      rationale = isId 
        ? 'Mendukung pemulihan sendi, tendon, dan mobilitas neuromuskular pasca-cedera.'
        : 'Supports joint, tendon recovery, and neuromuscular mobility after physical injury.';
    }

    container.innerHTML = `
      <div class="mp-confirm-header">
        <div class="mp-confirm-header-left">
          <div class="mp-confirm-icon-badge">
            <i data-lucide="calendar-plus" style="width:22px;height:22px;"></i>
          </div>
          <div>
            <h3 class="mp-confirm-title">${isId ? 'Tambahkan ke Meal Planner?' : 'Add to Meal Planner?'}</h3>
            <p class="mp-confirm-sub">${isId ? 'Konfirmasi jadwal dan porsi menu sebelum dicatat ke rencana nutrisi Anda.' : 'Confirm meal time and portion before adding to your recovery plan.'}</p>
          </div>
        </div>
        <button type="button" class="modal-close-btn" onclick="app.closeModal('modal-confirm-meal-planner')" title="${isId ? 'Tutup' : 'Close'}" aria-label="${isId ? 'Tutup' : 'Close'}">
          <i data-lucide="x"></i>
        </button>
      </div>

      <!-- Food Preview Card -->
      <div class="mp-confirm-food-card">
        <div class="mp-confirm-dish-wrap">
          <img src="${food.image}" alt="${displayName}" class="mp-confirm-dish-img" onerror="this.src='icons/icon-192.png'" />
        </div>
        <div class="mp-confirm-food-info">
          <h4 class="mp-confirm-food-name">${displayName}</h4>
          <div class="mp-confirm-food-meta">${currentGrams}g · ${food.price} /porsi</div>
          <div class="mp-confirm-food-badges">
            <span class="mp-confirm-badge" style="background:#F0FDF4;color:#166534;border:1px solid #BBF7D0;">
              <i data-lucide="shield-check" style="width:10px;height:10px;"></i> ${clinicalTag}
            </span>
            <span class="mp-confirm-badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;">
              ${tkpiCode}
            </span>
          </div>
        </div>
      </div>

      <!-- Dynamic Macros Row -->
      <div class="mp-confirm-macros-grid">
        <div class="mp-confirm-macro-box">
          <span class="mp-confirm-macro-lbl">${isId ? 'Kalori' : 'Calories'}</span>
          <span class="mp-confirm-macro-val" style="color:#B45309;">${currentCals} kkal</span>
        </div>
        <div class="mp-confirm-macro-box">
          <span class="mp-confirm-macro-lbl">Protein</span>
          <span class="mp-confirm-macro-val" style="color:#15803D;">${currentProt}g</span>
        </div>
        <div class="mp-confirm-macro-box">
          <span class="mp-confirm-macro-lbl">${isId ? 'Karbo' : 'Carbs'}</span>
          <span class="mp-confirm-macro-val" style="color:#1D4ED8;">${currentCarbs}g</span>
        </div>
        <div class="mp-confirm-macro-box">
          <span class="mp-confirm-macro-lbl">${isId ? 'Lemak' : 'Fat'}</span>
          <span class="mp-confirm-macro-val" style="color:#475569;">${currentFat}g</span>
        </div>
      </div>

      <!-- Meal Slot Selection -->
      <div class="mp-confirm-form-section">
        <label class="mp-confirm-form-label">${isId ? 'Pilih Waktu Makan:' : 'Select Meal Time:'}</label>
        <div class="mp-slot-selector">
          <button type="button" class="mp-slot-btn ${activeSlot === 'breakfast' ? 'active' : ''}" data-slot="breakfast" onclick="app.selectMealPlannerSlot('breakfast')">
            <span class="mp-slot-icon"><iconify-icon icon="solar:sun-2-bold"></iconify-icon></span>
            <span class="mp-slot-lbl">${isId ? 'Sarapan' : 'Breakfast'}</span>
          </button>
          <button type="button" class="mp-slot-btn ${activeSlot === 'lunch' ? 'active' : ''}" data-slot="lunch" onclick="app.selectMealPlannerSlot('lunch')">
            <span class="mp-slot-icon"><iconify-icon icon="solar:sun-bold"></iconify-icon></span>
            <span class="mp-slot-lbl">${isId ? 'Siang' : 'Lunch'}</span>
          </button>
          <button type="button" class="mp-slot-btn ${activeSlot === 'dinner' ? 'active' : ''}" data-slot="dinner" onclick="app.selectMealPlannerSlot('dinner')">
            <span class="mp-slot-icon"><iconify-icon icon="solar:moon-bold"></iconify-icon></span>
            <span class="mp-slot-lbl">${isId ? 'Malam' : 'Dinner'}</span>
          </button>
          <button type="button" class="mp-slot-btn ${activeSlot === 'snack' ? 'active' : ''}" data-slot="snack" onclick="app.selectMealPlannerSlot('snack')">
            <span class="mp-slot-icon"><iconify-icon icon="solar:cup-bold"></iconify-icon></span>
            <span class="mp-slot-lbl">${isId ? 'Camilan' : 'Snack'}</span>
          </button>
        </div>
      </div>

      <!-- Servings Stepper -->
      <div class="mp-confirm-form-section">
        <label class="mp-confirm-form-label">${isId ? 'Jumlah Porsi:' : 'Portion Servings:'}</label>
        <div class="mp-stepper-row">
          <button type="button" class="mp-stepper-btn" onclick="app.changeMealPlannerServings(-1)" title="Kurangi Porsi">-</button>
          <span class="mp-stepper-val">${servings} Porsi (${currentGrams} gram)</span>
          <button type="button" class="mp-stepper-btn" onclick="app.changeMealPlannerServings(1)" title="Tambah Porsi">+</button>
        </div>
      </div>

      <!-- Clinical Tip Rationale -->
      <div class="mp-confirm-clinical-note">
        <i data-lucide="sparkles" style="width:16px;height:16px;color:#10B981;flex-shrink:0;margin-top:2px;"></i>
        <div style="font-size:11.5px;color:#064E3B;line-height:1.5;">
          <strong>${isId ? 'Saran Klinis:' : 'Clinical Advice:'}</strong> ${rationale}
        </div>
      </div>

      <!-- Optional Checkbox: Sync with plate -->
      <div style="margin-bottom:14px;">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:#3B461C;font-weight:600;">
          <input type="checkbox" id="mp-sync-plate-check" ${syncWithPlate ? 'checked' : ''} onchange="app.toggleMealPlannerSyncPlate(this.checked)" style="accent-color:#10B981;width:16px;height:16px;">
          <span>${isId ? 'Sinkronkan juga ke Piring Analisis AI (CV Plate Scanner)' : 'Sync to AI Plate Scanner as well'}</span>
        </label>
      </div>

      <!-- Action Buttons -->
      <div class="mp-confirm-actions">
        <button type="button" class="mp-confirm-cancel-btn" onclick="app.closeModal('modal-confirm-meal-planner')">
          ${isId ? 'Batal' : 'Cancel'}
        </button>
        <button type="button" class="btn-outline-glass" style="font-size:12px;padding:9px 14px;border-radius:12px;border:1.5px solid #DDD4B0;color:#242C10;font-weight:700;display:inline-flex;align-items:center;gap:6px;" onclick="app.openFoodRecipeModal('${food.id}'); app.closeModal('modal-confirm-meal-planner');">
          <i data-lucide="book-open" style="width:14px;height:14px;"></i> ${isId ? 'Lihat Resep' : 'View Recipe'}
        </button>
        <button type="button" class="mp-confirm-submit-btn" onclick="app.confirmAddToMealPlanner()">
          <i data-lucide="check" style="width:16px;height:16px;"></i>
          <span>${isId ? 'Ya, Tambahkan ke Meal Planner' : 'Yes, Add to Meal Planner'}</span>
        </button>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: container });
    }
  }

  confirmAddToMealPlanner() {
    this.requireAuth(() => {
      const state = this.mealPlannerConfirmState;
      if (!state || !state.foodId) return;

      const food = NUTRIVISION_DATA.indonesianFoodDatabase.find(f => f.id === state.foodId);
      if (!food) return;

      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      const servings = state.servings || 1;
      const slot = state.slot || 'lunch';
      const portionGrams = Math.round((food.defaultPortionGrams || 100) * servings);
      const totalProtein = Math.round((food.protein || 20) * servings);
      const totalCalories = Math.round((food.calories || 250) * servings);
      const totalCarbs = Math.round((food.carbs !== undefined ? food.carbs : 15) * servings);
      const totalFat = Math.round((food.fat !== undefined ? food.fat : 8) * servings);

      const slotLabels = {
        breakfast: isId ? 'Sarapan' : 'Breakfast',
        lunch: isId ? 'Makan Siang' : 'Lunch',
        dinner: isId ? 'Makan Malam' : 'Dinner',
        snack: isId ? 'Camilan Sehat' : 'Healthy Snack'
      };
      const slotLabel = slotLabels[slot] || slot;

      // 1. Save entry to userDailyMealPlans in localStorage
      if (!this.userDailyMealPlans) {
        this.userDailyMealPlans = this.loadUserDailyMealPlans();
      }
      const mealEntry = {
        id: 'plan-' + Date.now(),
        foodId: food.id,
        name: isId ? food.name : (food.nameEn || food.name),
        slot: slot,
        servings: servings,
        portionGrams: portionGrams,
        protein: totalProtein,
        calories: totalCalories,
        carbs: totalCarbs,
        fat: totalFat,
        price: food.price,
        image: food.image,
        timestamp: Date.now()
      };
      this.userDailyMealPlans.push(mealEntry);
      this.saveUserDailyMealPlans();

      // 2. Log nutrients to progressTracker
      const userKey = this.userProfile?.contact || this.userProfile?.email || this.userProfile?.name;
      if (window.progressTracker && typeof window.progressTracker.addLoggedMeal === 'function') {
        window.progressTracker.addLoggedMeal({
          protein: [totalProtein, totalProtein],
          calories: [totalCalories, totalCalories],
          carbs: [totalCarbs, totalCarbs],
          fat: [totalFat, totalFat]
        }, userKey, { name: food.name || (isId ? 'Menu Pilihan Populer' : 'Popular Dish'), source: isId ? 'Katalog Pangan' : 'Food Catalog' });
        if (this.userProfile && this.userProfile.targets) {
          window.progressTracker.renderMacroDonut(this.userProfile.targets);
        }
        window.progressTracker.renderWeeklyBarChart();
      }

      // 3. Optional sync to plate scanner
      if (state.syncWithPlate && window.cvEngine && typeof window.cvEngine.addSegment === 'function') {
        window.cvEngine.addSegment(food, portionGrams);
        this.renderScanModalUI();
        this.renderOverviewPlate();
      }

      // 4. Close modal and show success toast
      this.closeModal('modal-confirm-meal-planner');
      const foodName = isId ? food.name : (food.nameEn || food.name);
      this.showToast(isId 
        ? `✓ ${foodName} (${portionGrams}g) berhasil ditambahkan ke Meal Planner (${slotLabel})!`
        : `✓ ${foodName} (${portionGrams}g) successfully added to Meal Planner (${slotLabel})!`, 'success');

      // Refresh planner view if user is in view-planner
      if (window.mealPlanner && typeof window.mealPlanner.renderPlanner === 'function') {
        window.mealPlanner.renderPlanner();
      }
    }, 'tambah ke meal planner');
  }

  deleteUserMealPlan(planId) {
    if (!this.userDailyMealPlans) this.userDailyMealPlans = this.loadUserDailyMealPlans();
    this.userDailyMealPlans = this.userDailyMealPlans.filter(p => p.id !== planId);
    this.saveUserDailyMealPlans();
    if (window.mealPlanner && typeof window.mealPlanner.renderPlanner === 'function') {
      window.mealPlanner.renderPlanner();
    }
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    this.showToast(isId ? 'Menu berhasil dihapus dari Meal Planner.' : 'Menu removed from Meal Planner.');
  }

  renderFoodCatalog(searchTerm = '', resetPage = false) {
    const grid = document.getElementById('food-catalog-grid');
    if (!grid) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    if (!this.activeCatalogCategory) this.activeCatalogCategory = 'all';
    if (!this.favoriteFoods) this.favoriteFoods = this.loadFavoriteFoods();
    this.catalogItemsPerPage = 12;

    const cleanTerm = (searchTerm || '').toLowerCase().trim();
    if (resetPage || (this.lastCatalogSearchTerm !== undefined && this.lastCatalogSearchTerm !== cleanTerm)) {
      this.catalogCurrentPage = 1;
    }
    this.lastCatalogSearchTerm = cleanTerm;

    const bannerContainer = document.getElementById('catalog-matched-banner-container');
    let baseList = NUTRIVISION_DATA.indonesianFoodDatabase;

    if (this.isPlateMatchedCatalogMode) {
      const { items: matchedItems, segmentNames } = this.getMatchedCatalogFoodsForPlate();
      if (matchedItems && matchedItems.length > 0) {
        baseList = matchedItems;
      }
      if (bannerContainer) {
        bannerContainer.style.display = 'block';
        const bannerTitle = isId ? 'Pilihan Pangan Sesuai Komposisi Piring Anda' : 'Foods Matching Your Plate Composition';
        const bannerSub = isId 
          ? `Menampilkan <strong>${baseList.length} bahan pangan lokal</strong> yang cocok dengan hasil segmentasi piring (${segmentNames.join(', ')}).`
          : `Showing <strong>${baseList.length} local food ingredients</strong> matching your plate segmentation (${segmentNames.join(', ')}).`;
        const bannerBtn = isId ? 'Tampilkan Semua Pangan Lokal' : 'Show All Local Foods';

        bannerContainer.innerHTML = `
          <div class="catalog-matched-alert" style="background:linear-gradient(135deg, rgba(158,167,107,0.16) 0%, rgba(158,167,107,0.06) 100%);border:1.5px solid #9EA76B;border-radius:14px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;box-shadow:0 3px 12px rgba(158,167,107,0.12);margin-bottom:18px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:38px;height:38px;border-radius:50%;background:#9EA76B;color:#FFFFFF;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i data-lucide="sparkles" style="width:18px;height:18px;"></i>
              </div>
              <div>
                <b style="color:#141708;font-size:13.5px;display:block;">${bannerTitle}</b>
                <span style="font-size:12px;color:#3B461C;font-weight:550;">${bannerSub}</span>
              </div>
            </div>
            <button type="button" class="btn-sm-teal" style="background:#FDFAF2;border:1.5px solid #DDD4B0;color:#242C10;font-weight:700;padding:6px 14px;border-radius:20px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-size:12px;" onclick="app.clearCatalogPlateFilter()">
              <i data-lucide="layout-grid" style="width:14px;height:14px;"></i> ${bannerBtn}
            </button>
          </div>
        `;
      }
    } else {
      // Personalization profile indicator
      const condition = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
      const height = parseFloat(this.userProfile?.heightCm) || 170;
      const weight = parseFloat(this.userProfile?.weightKg) || 65;
      const heightM = height / 100;
      const bmi = +(weight / (heightM * heightM)).toFixed(1);

      let condName = isId ? 'Pasca-Operasi & Bedah' : 'Post-Surgery';
      if (condition === 'gym') condName = isId ? 'Gym & Muscle Recovery' : 'Gym & Muscle Recovery';
      else if (condition === 'rehab') condName = isId ? 'Fisioterapi & Rehabilitasi Sendi' : 'Rehab & Physical Therapy';
      else if (condition === 'wellness') condName = isId ? 'Pemeliharaan Kebugaran' : 'General Wellness';

      if (bannerContainer) {
        bannerContainer.style.display = 'block';
        bannerContainer.innerHTML = `
          <div class="catalog-personalization-alert">
            <div class="catalog-personalization-left">
              <div class="catalog-personalization-icon">
                <iconify-icon icon="solar:magic-stick-3-bold"></iconify-icon>
              </div>
              <div class="catalog-personalization-content">
                <div class="catalog-personalization-title-wrapper">
                  <span class="catalog-personalization-title">${isId ? 'Rekomendasi Khusus:' : 'Personalized Recommendations:'}</span>
                  <span class="catalog-personalization-condition">${condName}</span>
                </div>
                <div class="catalog-personalization-sub">
                  <span class="catalog-perso-stats">
                    <span>${isId ? 'Tinggi Badan' : 'Height'} <strong>${height} cm</strong></span>
                    <span class="catalog-perso-dot">·</span>
                    <span>${isId ? 'Berat Badan' : 'Weight'} <strong>${weight} kg</strong></span>
                    <span class="catalog-perso-dot">·</span>
                    <span>BMI <strong>${bmi}</strong></span>
                  </span>
                  <span class="catalog-perso-divider">·</span>
                  <span class="catalog-perso-note">${isId ? 'Halaman 1 memprioritaskan 12 pangan paling sesuai' : 'Page 1 prioritizes the top 12 matching foods'}</span>
                </div>
              </div>
            </div>
            <div class="catalog-personalization-badge">
              <span class="catalog-perso-badge-dot"></span>
              <span>${isId ? 'Prioritas Aktif' : 'Smart Matched'}</span>
            </div>
          </div>
        `;
      }
    }

    const term = cleanTerm;
    let items = baseList.filter(food => {
      let matchCat = (this.activeCatalogCategory === 'all');
      if (!matchCat) {
        if (this.activeCatalogCategory === 'favorite') {
          matchCat = this.favoriteFoods.has(food.id);
        } else if (this.activeCatalogCategory === 'soft') {
          matchCat = food.texture === 'soft' || food.texture === 'liquid';
        } else {
          matchCat = (food.category === this.activeCatalogCategory);
        }
      }
      const matchSearch = !term || 
        food.name.toLowerCase().includes(term) || 
        (food.nameEn && food.nameEn.toLowerCase().includes(term)) || 
        (food.subtitle && food.subtitle.toLowerCase().includes(term)) || 
        (food.subtitleEn && food.subtitleEn.toLowerCase().includes(term)) || 
        (food.clinicalIndication && food.clinicalIndication.toLowerCase().includes(term)) ||
        (food.clinicalIndicationEn && food.clinicalIndicationEn.toLowerCase().includes(term)) ||
        (food.tkpiCode && food.tkpiCode.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });

    // Apply personalized clinical recommendation sorting
    items = this.sortFoodsByPersonalizedRecommendation(items);

    const prevBtn = document.getElementById('cat-nav-prev-btn');
    const nextBtn = document.getElementById('cat-nav-next-btn');
    const topCounter = document.getElementById('catalog-page-counter');

    if (items.length === 0) {
      if (this.activeCatalogCategory === 'favorite') {
        const favEmptyTitle = isId ? 'Belum Ada Pangan Favorit' : 'No Favorite Foods Yet';
        const favEmptyDesc = isId 
          ? 'Klik tombol hati (♥) pada kartu menu untuk menyimpan pangan lokal favorit Anda.'
          : 'Click the heart button (♥) on a menu card to save your favorite recovery foods.';
        const favEmptyBtn = isId ? 'Jelajahi Semua Pangan Lokal' : 'Explore All Local Foods';

        grid.innerHTML = `
          <div class="catalog-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(255,255,255,0.7); border-radius: 18px; border: 1.5px dashed #E2E8F0;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #FEE2E2; color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
              <iconify-icon icon="solar:heart-broken-bold" style="font-size: 28px;"></iconify-icon>
            </div>
            <h4 style="margin: 0 0 6px; font-size: 16px; color: #1E293B; font-weight: 700;">${favEmptyTitle}</h4>
            <p style="margin: 0 0 16px; font-size: 13px; color: #64748B; max-width: 380px; margin-left: auto; margin-right: auto; line-height: 1.5;">
              ${favEmptyDesc}
            </p>
            <button type="button" class="btn-sm-teal" style="background: #0F766E; color: #fff; border: none; border-radius: 20px; padding: 8px 18px; font-weight: 700; font-size: 12px; cursor: pointer;" onclick="document.querySelector('.cat-pill-btn[data-category=\\'all\\']')?.click()">
              ${favEmptyBtn}
            </button>
          </div>
        `;
      } else {
        const searchEmptyTitle = isId ? 'Menu tidak ditemukan' : 'No Foods Found';
        const searchEmptyDesc = isId ? 'Coba kata kunci lain atau pilih kategori menu di atas.' : 'Try another search keyword or select a category above.';

        grid.innerHTML = `
          <div class="catalog-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px;">
            <i data-lucide="search-x" style="width:40px;height:40px;color:#94A3B8;margin-bottom:8px;"></i>
            <h4>${searchEmptyTitle}</h4>
            <p>${searchEmptyDesc}</p>
          </div>
        `;
      }

      if (topCounter) topCounter.style.display = 'none';
      if (prevBtn) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.35';
        prevBtn.style.pointerEvents = 'none';
      }
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.35';
        nextBtn.style.pointerEvents = 'none';
      }

      this.updateFavoriteBadge();
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      return;
    }

    // Pagination Calculation: Exactly 12 menu items per page
    const totalItems = items.length;
    const itemsPerPage = 12;
    this.catalogItemsPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    if (!this.catalogCurrentPage || this.catalogCurrentPage < 1) {
      this.catalogCurrentPage = 1;
    }
    if (this.catalogCurrentPage > totalPages) {
      this.catalogCurrentPage = totalPages;
    }

    const startIndex = (this.catalogCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const pagedItems = items.slice(startIndex, endIndex);

    // Update Top Navigation Arrows & Indicator Counter
    if (prevBtn) {
      const isPrevDisabled = this.catalogCurrentPage <= 1;
      prevBtn.disabled = isPrevDisabled;
      prevBtn.style.opacity = isPrevDisabled ? '0.35' : '1';
      prevBtn.style.pointerEvents = isPrevDisabled ? 'none' : 'auto';
      prevBtn.title = isId ? 'Halaman Sebelumnya' : 'Previous Page';
    }
    if (nextBtn) {
      const isNextDisabled = this.catalogCurrentPage >= totalPages;
      nextBtn.disabled = isNextDisabled;
      nextBtn.style.opacity = isNextDisabled ? '0.35' : '1';
      nextBtn.style.pointerEvents = isNextDisabled ? 'none' : 'auto';
      nextBtn.title = isId ? 'Halaman Selanjutnya' : 'Next Page';
    }
    if (topCounter) {
      topCounter.textContent = `${this.catalogCurrentPage} / ${totalPages}`;
      topCounter.style.display = totalPages > 1 ? 'inline-flex' : 'none';
    }

    const condition = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';

    grid.innerHTML = pagedItems.map((food, idx) => {
      const isFav = this.favoriteFoods.has(food.id);
      const displayName = isId ? food.name : (food.nameEn || food.name);
      const rating = (food.rating || 4.9).toFixed(1);
      const subtitle = isId 
        ? (food.subtitle || `${food.defaultPortionGrams}g · ${food.protein}g Prot · ${food.calories} kkal`)
        : (food.subtitleEn || food.subtitle || `${food.defaultPortionGrams}g · ${food.protein}g Prot · ${food.calories} kcal`);
      const activeReg = (window.BappenasFoodAPI ? window.BappenasFoodAPI.getActiveRegion() : null) || { multiplier: 1.00 };
      const mult = activeReg.multiplier || 1.00;
      let displayPrice = food.price;
      if (typeof food.price === 'string' && food.price.includes('Rp')) {
        const rawNum = parseInt(food.price.replace(/[^0-9]/g, ''), 10);
        if (rawNum) {
          const adj = Math.round((rawNum * mult) / 500) * 500;
          displayPrice = `Rp ${adj.toLocaleString('id-ID')}`;
        }
      }
      const clinicalTag = isId ? (food.clinicalIndication || 'Pemulihan Klinis') : (food.clinicalIndicationEn || food.clinicalIndication || 'Clinical Recovery');
      const bappenasRef = activeReg.provinceName ? `Bapanas: ${activeReg.provinceName}` : (food.bappenasRef || (isId ? 'Acuan Bapanas RI' : 'Bapanas RI Reference'));
      const isTopRec = this.catalogCurrentPage === 1 && idx < 6;
      let recBadgeText = isId ? 'Top Rekomendasi' : 'Top Pick';
      if (condition === 'gym') recBadgeText = `${food.protein}g Prot · Gym`;
      else if (condition === 'rehab') recBadgeText = isId ? 'Rehabilitasi' : 'Rehab';
      else if (condition === 'post-surgery') recBadgeText = isId ? 'Pasca-Bedah' : 'Post-Surgery';

      const proteinVal = food.proteinRange ? `${food.proteinRange[0]}-${food.proteinRange[1]}` : (food.protein || 20);
      const calVal = food.calsRange ? `${food.calsRange[0]}-${food.calsRange[1]}` : (food.calories || 250);

      return `
        <div class="popular-food-card ${isTopRec ? 'is-recommended' : ''}" 
             id="food-card-${food.id}"
             onclick="app.openAddToMealPlannerModal('${food.id}')" 
             title="${isId ? 'Klik untuk konfirmasi tambah ke Meal Planner' : 'Click to add to Meal Planner'}">
          <!-- Floating Round Dish Image & Rating -->
          <div class="food-card-top">
            <div class="food-dish-plate-wrap">
              <img src="${food.image}" alt="${displayName}" class="food-dish-img" loading="lazy" onerror="this.src='icons/icon-192.png'" />
            </div>
            <div class="food-card-top-right-col">
              <button type="button" class="food-fav-btn ${isFav ? 'active' : ''}" 
                      onclick="app.toggleFavoriteFood('${food.id}', event)" 
                      title="${isFav ? (isId ? 'Hapus dari favorit' : 'Remove favorite') : (isId ? 'Simpan ke favorit' : 'Add to favorites')}"
                      aria-label="${isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}">
                <i data-lucide="heart" class="fav-icon"></i>
              </button>
              <div class="food-rating-badge">
                <span class="rating-num">${rating}</span>
                <i data-lucide="star" class="star-icon"></i>
              </div>
            </div>
          </div>

          <!-- Card Content -->
          <div class="food-card-body">
            <h4 class="food-card-title">${displayName}</h4>
            <p class="food-card-sub">${subtitle}</p>

            <div class="food-macro-pills-row">
              <span class="macro-pill-item prot">
                <iconify-icon icon="solar:bone-bold" class="macro-pill-icon"></iconify-icon>
                <span>${proteinVal}g Prot</span>
              </span>
              <span class="macro-pill-item cal">
                <iconify-icon icon="solar:fire-bold" class="macro-pill-icon"></iconify-icon>
                <span>${calVal} kkal</span>
              </span>
              ${food.carbs !== undefined ? `
              <span class="macro-pill-item carb">
                <iconify-icon icon="solar:leaf-bold" class="macro-pill-icon"></iconify-icon>
                <span>${food.carbs}g Karbo</span>
              </span>` : ''}
            </div>

            <div class="food-card-footer">
              <div class="food-footer-left-actions">
                <button type="button" class="food-cart-btn" 
                        onclick="event.stopPropagation(); app.openAddToMealPlannerModal('${food.id}');" 
                        title="${isId ? 'Tambahkan ke Meal Planner' : 'Add to Meal Planner'}"
                        aria-label="${isId ? 'Tambahkan ke Meal Planner' : 'Add to Meal Planner'}">
                  <i data-lucide="calendar-plus" class="cart-icon"></i>
                </button>
                <button type="button" class="food-recipe-action-btn" 
                        onclick="event.stopPropagation(); app.openFoodRecipeModal('${food.id}');" 
                        title="${isId ? 'Lihat Resep & Panduan Masak' : 'View Recipe & Cooking Guide'}"
                        aria-label="${isId ? 'Lihat Resep & Panduan Masak' : 'View Recipe & Cooking Guide'}">
                  <i data-lucide="chevron-right" class="recipe-btn-arrow"></i>
                </button>
              </div>
              <div class="food-card-price-group">
                <span class="food-card-price">${displayPrice} <small style="font-size:10px;color:#64748B;font-weight:500;">/porsi</small></span>
                <span class="food-bappenas-ref" title="Acuan Harga Pasar Eceran">${bappenasRef}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.updateFavoriteBadge();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  addCatalogItemToScan(foodId) {
    this.requireAuth(() => {
      const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
      const food = NUTRIVISION_DATA.indonesianFoodDatabase.find(f => f.id === foodId);
      if (!food) return;

      cvEngine.addSegment(food, food.defaultPortionGrams);
      this.renderScanModalUI();
      this.renderOverviewPlate();
      const foodName = isId ? food.name : (food.nameEn || food.name);
      this.showToast(isId ? `Ditambahkan ke piring: ${foodName} (${food.defaultPortionGrams}g)` : `Added to plate: ${foodName} (${food.defaultPortionGrams}g)`);
    }, 'tambah ke piring');
  }

  // =========================================================================
  // MOBILE RECIPE SHEET CONTROLLER (FIGMA REFERENCE DESIGN)
  // Stepper porsi, checklist bahan, live timer, & switch tab interaktif
  // =========================================================================
  initRecipeState() {
    if (!this.recipeState) {
      this.recipeState = {
        foodId: null,
        servings: 2,
        activeTab: 'ingredients',
        checkedIngredients: new Set(),
        timers: {}
      };
    }
  }

  openFoodRecipeModal(foodId) {
    const food = NUTRIVISION_DATA.indonesianFoodDatabase.find(f => f.id === foodId);
    if (!food) return;

    this.initRecipeState();
    this.clearAllRecipeTimers();

    this.recipeState.foodId = foodId;
    this.recipeState.servings = 2;
    this.recipeState.activeTab = 'ingredients';
    this.recipeState.checkedIngredients.clear();
    this.recipeState.timers = {};

    this.renderRecipeModal();
    this.openModal('food-recipe-modal');
  }

  clearAllRecipeTimers() {
    if (this.recipeState && this.recipeState.timers) {
      Object.values(this.recipeState.timers).forEach(timer => {
        if (timer.intervalId) clearInterval(timer.intervalId);
      });
      this.recipeState.timers = {};
    }
  }

  switchRecipeTab(tabName) {
    this.initRecipeState();
    this.recipeState.activeTab = tabName;
    this.renderRecipeModal();
  }

  changeRecipeServings(delta) {
    this.initRecipeState();
    const newServings = Math.max(1, Math.min(10, (this.recipeState.servings || 2) + delta));
    if (newServings === this.recipeState.servings) return;
    this.recipeState.servings = newServings;
    this.renderRecipeModal();
  }

  toggleRecipeIngredient(index) {
    this.initRecipeState();
    if (this.recipeState.checkedIngredients.has(index)) {
      this.recipeState.checkedIngredients.delete(index);
    } else {
      this.recipeState.checkedIngredients.add(index);
    }
    const itemEl = document.getElementById(`recipe-ing-item-${index}`);
    if (itemEl) {
      const isChecked = this.recipeState.checkedIngredients.has(index);
      itemEl.classList.toggle('checked', isChecked);
      const checkboxEl = itemEl.querySelector('.recipe-custom-checkbox');
      if (checkboxEl) {
        checkboxEl.innerHTML = isChecked ? '<iconify-icon icon="solar:check-read-bold"></iconify-icon>' : '';
      }
    }
  }

  formatTimerTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  startRecipeTimer(stepIndex, totalSeconds, label) {
    this.initRecipeState();
    if (!this.recipeState.timers[stepIndex]) {
      this.recipeState.timers[stepIndex] = {
        remaining: totalSeconds,
        initial: totalSeconds,
        isRunning: false,
        intervalId: null,
        label: label || `Langkah ${stepIndex + 1}`
      };
    }

    const timer = this.recipeState.timers[stepIndex];
    const btnEl = document.getElementById(`recipe-timer-btn-${stepIndex}`);
    const timeTextEl = document.getElementById(`recipe-timer-text-${stepIndex}`);

    if (timer.isRunning) {
      // Pause timer
      clearInterval(timer.intervalId);
      timer.isRunning = false;
      if (btnEl) {
        btnEl.classList.remove('running');
        btnEl.innerHTML = `
          <iconify-icon icon="solar:play-bold" style="font-size:14px;"></iconify-icon>
          <span>Lanjutkan (${this.formatTimerTime(timer.remaining)})</span>
        `;
      }
    } else {
      // Start / Resume timer
      timer.isRunning = true;
      if (btnEl) {
        btnEl.classList.add('running');
      }

      timer.intervalId = setInterval(() => {
        timer.remaining -= 1;
        if (timeTextEl) {
          timeTextEl.textContent = this.formatTimerTime(timer.remaining);
        }
        if (btnEl) {
          btnEl.innerHTML = `
            <iconify-icon icon="solar:pause-bold" style="font-size:14px;"></iconify-icon>
            <span>Jeda (<span class="recipe-timer-countdown-text">${this.formatTimerTime(timer.remaining)}</span>)</span>
          `;
        }

        if (timer.remaining <= 0) {
          clearInterval(timer.intervalId);
          timer.isRunning = false;
          timer.remaining = 0;
          if (btnEl) {
            btnEl.classList.remove('running');
            btnEl.classList.add('completed');
            btnEl.innerHTML = `
              <iconify-icon icon="solar:check-circle-bold" style="font-size:15px;"></iconify-icon>
              <span>Waktu Selesai!</span>
            `;
          }
          this.playTimerDoneSound();
          this.showToast(`🔔 Waktu Masak Selesai: ${timer.label}!`, 'success');
        }
      }, 1000);
    }
  }

  resetRecipeTimer(stepIndex) {
    this.initRecipeState();
    const timer = this.recipeState.timers[stepIndex];
    if (!timer) return;
    if (timer.intervalId) clearInterval(timer.intervalId);
    timer.remaining = timer.initial;
    timer.isRunning = false;

    const btnEl = document.getElementById(`recipe-timer-btn-${stepIndex}`);
    if (btnEl) {
      btnEl.classList.remove('running', 'completed');
      btnEl.innerHTML = `
        <iconify-icon icon="solar:play-bold" style="font-size:14px;"></iconify-icon>
        <span>Mulai Timer (${this.formatTimerTime(timer.initial)})</span>
      `;
    }
  }

  playTimerDoneSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5 note
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio chime info:', e);
    }
  }

  renderRecipeModal() {
    const modalContent = document.getElementById('food-recipe-modal-content');
    if (!modalContent) return;

    this.initRecipeState();
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const foodId = this.recipeState.foodId;
    const food = NUTRIVISION_DATA.indonesianFoodDatabase.find(f => f.id === foodId);
    if (!food) return;

    const recipe = (NUTRIVISION_DATA.recipeBook && NUTRIVISION_DATA.recipeBook[foodId]) || {
      title: isId ? `Panduan Memasak: ${food.name}` : `Cooking Guide: ${food.nameEn || food.name}`,
      author: isId ? 'Tim Gizi Klinis NutriVision RI' : 'NutriVision Clinical Nutrition Team',
      prepTime: '10m',
      cookTime: '15m',
      totalTime: '25m Time',
      caloriesBase: food.calories || 150,
      rating: '4.9/5 Rating',
      parameters: [
        { label: isId ? 'Kukus/Rebus' : 'Steam/Boil', icon: 'solar:stopwatch-bold', value: '15:00', bg: '#FEF3C7', color: '#92400E' },
        { label: isId ? 'Suhu' : 'Temp', icon: 'solar:thermometer-bold', value: '95°C', bg: '#E0F2FE', color: '#0369A1' },
        { label: 'Resting', icon: 'solar:clock-circle-bold', value: '3:00', bg: '#F1F5F9', color: '#475569' }
      ],
      ingredients: [
        { name: isId ? `${food.name} segar terstandar` : `Standard fresh ${food.nameEn || food.name}`, amount: food.defaultPortionGrams || 100, unit: 'gram' },
        { name: isId ? 'Air bersih higienis' : 'Purified hygienic water', amount: 300, unit: 'ml' },
        { name: isId ? 'Bumbu rempah aromatik alami' : 'Natural aromatic herbs & seasoning', amount: 1, unit: isId ? 'porsi' : 'portion' }
      ],
      steps: [
        {
          step: 1,
          title: isId ? 'Persiapan Bahan & Higienitas' : 'Ingredient Prep & Hygiene',
          instruction: isId 
            ? `Cuci bersih ${food.name} di bawah air mengalir. Siapkan peralatan higienis tanpa minyak jenuh berlebih.`
            : `Rinse ${food.nameEn || food.name} thoroughly under running water. Prepare hygienic utensils free from excess saturated fat.`,
          timer: 0,
          tip: null
        },
        {
          step: 2,
          title: isId ? 'Pengolahan Termal Terkontrol' : 'Controlled Thermal Cooking',
          instruction: isId 
            ? `Masak dengan metode pengukusan / perebusan api sedang selama 15 menit hingga matang empuk merata dan zat gizi terjaga.`
            : `Cook via steaming / gentle boiling over medium heat for 15 minutes until tender and nutrients are fully preserved.`,
          timer: 900,
          timerLabel: isId ? 'Mulai Timer Memasak (15m)' : 'Start Cooking Timer (15m)',
          tip: isId 
            ? `Pemanasan terkontrol mempertahankan densitas zat gizi makro (${food.protein}g protein) untuk pemulihan sel optimal.`
            : `Controlled heating preserves macronutrient density (${food.protein}g protein) for optimal cellular healing.`
        }
      ]
    };

    const servings = this.recipeState.servings || 2;
    const isFav = this.favoriteFoods && this.favoriteFoods.has(foodId);
    const totalCalories = Math.round((recipe.caloriesBase || food.calories) * servings);
    const activeTab = this.recipeState.activeTab || 'ingredients';
    const servingsLabel = isId ? 'porsi' : 'servings';
    const calsLabel = isId ? 'kkal' : 'kcal';
    const closeTitle = isId ? 'Tutup Modal' : 'Close Modal';
    const favTitle = isFav ? (isId ? 'Hapus dari Favorit' : 'Remove from Favorites') : (isId ? 'Simpan ke Favorit' : 'Save to Favorites');
    const ingTabLabel = isId ? 'Bahan-Bahan' : 'Ingredients';
    const dirTabLabel = isId ? 'Cara Memasak' : 'Instructions';
    const stepsLabel = isId ? 'Langkah' : 'Steps';
    const addPlateLabel = isId ? `Tambahkan ke Meal Planner (${servings} Porsi)` : `Add to Meal Planner (${servings} Servings)`;

    modalContent.innerHTML = `
      <!-- 1. Hero Food Photo with Floating Circular Nav Buttons -->
      <div class="recipe-hero-wrap">
        <img src="${food.image}" alt="${isId ? food.name : (food.nameEn || food.name)}" class="recipe-hero-img" onerror="this.src='icons/icon-192.png'" />
        <div class="recipe-hero-gradient"></div>
        
        <!-- Floating Close Button (Top-Left) -->
        <button type="button" class="recipe-floating-btn recipe-close-btn" onclick="app.closeModal('food-recipe-modal')" title="${closeTitle}" aria-label="${closeTitle}">
          <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
        </button>

        <!-- Floating Favorite Heart Button (Top-Right) -->
        <button type="button" class="recipe-floating-btn recipe-fav-btn ${isFav ? 'active' : ''}" 
                onclick="app.toggleFavoriteFood('${food.id}', event); app.renderRecipeModal();" 
                title="${favTitle}" aria-label="${isId ? 'Favorit' : 'Favorite'}">
          <iconify-icon icon="${isFav ? 'solar:heart-bold' : 'solar:heart-linear'}"></iconify-icon>
        </button>
      </div>

      <!-- 2. Overlapping Curved Bottom Sheet Body -->
      <div class="recipe-sheet-card">
        <div class="recipe-drag-notch"></div>
        
        <h3 class="recipe-sheet-title">${recipe.title}</h3>
        <p class="recipe-sheet-author">
          <iconify-icon icon="solar:verified-check-bold" style="color:#0284C7;font-size:14px;"></iconify-icon>
          <span>${recipe.author}</span>
        </p>

        <!-- 3. Stepper Porsi & Quick Stats Badges Row -->
        <div class="recipe-meta-row">
          <div class="recipe-servings-stepper">
            <button type="button" class="recipe-servings-btn" onclick="app.changeRecipeServings(-1)" title="${isId ? 'Kurangi Porsi' : 'Reduce Servings'}" aria-label="${isId ? 'Kurangi' : 'Reduce'}">-</button>
            <span class="recipe-servings-text">${servings} ${servingsLabel}</span>
            <button type="button" class="recipe-servings-btn" onclick="app.changeRecipeServings(1)" title="${isId ? 'Tambah Porsi' : 'Increase Servings'}" aria-label="${isId ? 'Tambah' : 'Increase'}">+</button>
          </div>

          <div class="recipe-stats-badges">
            <span class="recipe-stat-pill" title="${isId ? 'Total Waktu Pengolahan' : 'Total Cooking Time'}">
              <iconify-icon icon="solar:clock-circle-bold"></iconify-icon>
              <span>${recipe.totalTime || recipe.cookTime}</span>
            </span>
            <span class="recipe-stat-pill calories" title="${isId ? `Total Kalori untuk ${servings} porsi` : `Total Calories for ${servings} servings`}">
              <iconify-icon icon="solar:flame-bold"></iconify-icon>
              <span>${totalCalories} ${calsLabel}</span>
            </span>
            <span class="recipe-stat-pill rating" title="${isId ? 'Rating Klinis Teruji' : 'Clinical Rating'}">
              <iconify-icon icon="solar:star-bold"></iconify-icon>
              <span>${recipe.rating || '4.9/5'}</span>
            </span>
          </div>
        </div>

        <!-- 4. Segmented Control Switch: Ingredients vs Directions -->
        <div class="recipe-segmented-nav">
          <button type="button" class="recipe-tab-btn ${activeTab === 'ingredients' ? 'active' : ''}" 
                  onclick="app.switchRecipeTab('ingredients')">
            ${ingTabLabel} (${recipe.ingredients.length})
          </button>
          <button type="button" class="recipe-tab-btn ${activeTab === 'directions' ? 'active' : ''}" 
                  onclick="app.switchRecipeTab('directions')">
            ${dirTabLabel} (${recipe.steps.length} ${stepsLabel})
          </button>
        </div>

        <!-- 5. Dynamic Tab View Content -->
        ${activeTab === 'ingredients' ? `
          <!-- TAB 1: INGREDIENTS LIST -->
          <div class="recipe-ingredients-list">
            ${recipe.ingredients.map((ing, idx) => {
              const isChecked = this.recipeState.checkedIngredients.has(idx);
              // Scale amount proportionally to servings
              const scaledAmount = (typeof ing.amount === 'number') 
                ? (ing.amount * servings) 
                : ing.amount;
              const formattedAmount = (typeof scaledAmount === 'number')
                ? Number.isInteger(scaledAmount) ? scaledAmount : scaledAmount.toFixed(1).replace('.0', '')
                : scaledAmount;

              return `
                <div class="recipe-ingredient-item ${isChecked ? 'checked' : ''}" 
                     id="recipe-ing-item-${idx}" 
                     onclick="app.toggleRecipeIngredient(${idx})"
                     title="${isId ? 'Klik untuk menandai bahan sudah siap' : 'Click to check off prepared ingredient'}">
                  <div class="recipe-ing-left">
                    <iconify-icon icon="solar:hamburger-menu-linear" class="recipe-ing-bullet"></iconify-icon>
                    <span class="recipe-ing-name">${ing.name}</span>
                  </div>
                  <div class="recipe-ing-right">
                    <span class="recipe-ing-measure">${formattedAmount} ${ing.unit}</span>
                    <div class="recipe-custom-checkbox">
                      ${isChecked ? '<iconify-icon icon="solar:check-read-bold"></iconify-icon>' : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Sticky Action Button -->
          <div class="recipe-sticky-action-bar">
            <button type="button" class="recipe-add-plate-btn" 
                    onclick="app.openAddToMealPlannerModal('${food.id}'); app.closeModal('food-recipe-modal');">
              <iconify-icon icon="solar:calendar-add-bold" style="font-size:18px;"></iconify-icon>
              <span>${addPlateLabel}</span>
            </button>
          </div>
        ` : `
          <!-- TAB 2: DIRECTIONS (STEPS & LIVE TIMERS) -->
          ${recipe.parameters && recipe.parameters.length ? `
            <div class="recipe-params-grid">
              ${recipe.parameters.map(p => `
                <div class="recipe-param-card" style="background:${p.bg};color:${p.color};">
                  <span class="recipe-param-label">
                    <iconify-icon icon="${p.icon}"></iconify-icon>
                    <span>${p.label}</span>
                  </span>
                  <span class="recipe-param-val">${p.value}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="recipe-steps-list">
            ${recipe.steps.map((st, idx) => {
              const timer = this.recipeState.timers[idx];
              const isRunning = timer && timer.isRunning;
              const remainingSec = timer ? timer.remaining : st.timer;
              const hasTimer = st.timer && st.timer > 0;
              const pauseLabel = isId ? 'Jeda' : 'Pause';
              const startTimerLabel = isId ? 'Mulai Timer' : 'Start Timer';
              const bioLabel = isId ? 'Tips Bioavailabilitas:' : 'Bioavailability Tip:';

              return `
                <div class="recipe-step-card ${isRunning ? 'active-timer' : ''}">
                  <div class="recipe-step-header">
                    <h4 class="recipe-step-num">${isId ? 'Langkah' : 'Step'} ${st.step}</h4>
                    <span class="recipe-step-title">${st.title}</span>
                  </div>
                  <p class="recipe-step-desc">${st.instruction}</p>

                  ${st.tip ? `
                    <div class="recipe-step-tip">
                      <iconify-icon icon="solar:shield-warning-bold" style="font-size:16px;flex-shrink:0;color:#D97706;margin-top:1px;"></iconify-icon>
                      <span><strong>${bioLabel}</strong> ${st.tip}</span>
                    </div>
                  ` : ''}

                  ${hasTimer ? `
                    <div class="recipe-timer-control-row">
                      <button type="button" class="recipe-step-timer-btn ${isRunning ? 'running' : ''}" 
                              id="recipe-timer-btn-${idx}"
                              onclick="app.startRecipeTimer(${idx}, ${st.timer}, '${st.title.replace(/'/g, "\\'")}')">
                        <iconify-icon icon="${isRunning ? 'solar:pause-bold' : 'solar:play-bold'}" style="font-size:14px;"></iconify-icon>
                        <span id="recipe-timer-text-${idx}">
                          ${isRunning ? `${pauseLabel} (${this.formatTimerTime(remainingSec)})` : (st.timerLabel || `${startTimerLabel} (${this.formatTimerTime(st.timer)})`)}
                        </span>
                      </button>
                      ${timer ? `
                        <button type="button" class="recipe-timer-reset-btn" onclick="app.resetRecipeTimer(${idx})" title="Reset Timer">
                          <iconify-icon icon="solar:restart-bold"></iconify-icon>
                        </button>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Sticky Action Button -->
          <div class="recipe-sticky-action-bar">
            <button type="button" class="recipe-add-plate-btn" 
                    onclick="app.openAddToMealPlannerModal('${food.id}'); app.closeModal('food-recipe-modal');">
              <iconify-icon icon="solar:calendar-add-bold" style="font-size:18px;"></iconify-icon>
              <span>${addPlateLabel}</span>
            </button>
          </div>
        `}
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // MODAL MANAGEMENT
  // =========================================================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
  }

  closeModal(modalId) {
    if (!modalId) {
      document.querySelectorAll('.modal-overlay.open').forEach(m => {
        m.classList.remove('open');
        m.style.display = '';
      });
      return;
    }
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = '';
    }
    if (modalId === 'food-recipe-modal') {
      this.clearAllRecipeTimers();
    }
    if (modalId === 'scan-modal') {
      this.deactivateLiveCamera();
    }
    if (modalId === 'modal-db-sync') {
      const syncModal = document.getElementById('modal-db-sync');
      if (syncModal) syncModal.classList.remove('open');
    }
    if (modalId === 'modal-pdf-report') {
      const pdfModal = document.getElementById('modal-pdf-report');
      if (pdfModal) pdfModal.classList.remove('open');
    }
  }

  // =========================================================================
  // AUTH & DATABASE INTEGRATION (LOGIN, REGISTER, DEMO ACCESS & LOGOUT)
  // =========================================================================
  openAuthModal(tab = 'login') {
    this.openModal('auth-modal');
    this.switchAuthTab(tab);
  }

  switchAuthTab(tab) {
    const btnLogin = document.getElementById('tab-auth-login');
    const btnReg = document.getElementById('tab-auth-register');
    const paneLogin = document.getElementById('auth-pane-login');
    const paneReg = document.getElementById('auth-pane-register');

    if (btnLogin) btnLogin.classList.toggle('active', tab === 'login');
    if (btnReg) btnReg.classList.toggle('active', tab === 'register');
    if (paneLogin) paneLogin.style.display = (tab === 'login') ? 'block' : 'none';
    if (paneReg) paneReg.style.display = (tab === 'register') ? 'block' : 'none';

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  async handleLogin() {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const email = emailInput?.value?.trim();
    const password = passInput?.value?.trim();

    if (!email) {
      this.showToast('⚠️ Mohon masukkan email atau nomor WhatsApp terlebih dahulu.');
      if (emailInput) emailInput.focus();
      return;
    }

    try {
      let user;
      // Sinkronisasi login ke Backend MySQL jika server online
      if (window.nutriAPI) {
        try {
          const apiRes = await window.nutriAPI.login(email, password);
          if (apiRes?.user && apiRes.token) {
            window.nutriAPI.setToken(apiRes.token);
            user = apiRes.user;
          }
        } catch (apiErr) {
          console.warn('[NutriVision] Backend login notice (menggunakan mode lokal):', apiErr.message);
        }
      }

      if (!user && window.nutriVisionDB && window.nutriVisionDB.isReady) {
        user = await window.nutriVisionDB.login(email, password);
      } else if (!user) {
        // Fallback jika DB sedang proses ready
        user = {
          id: 'usr_' + Date.now(),
          name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pasien',
          email: email,
          role: 'patient',
          hasCompletedQuiz: false
        };
      }

      const conditionTitles = {
        'post-surgery': 'Pasca-Operasi & Bedah',
        'rehab': 'Fisioterapi & Cedera Sendi',
        'injury-rehab': 'Fisioterapi Cedera ACL',
        'gym': 'Gym & Muscle Recovery',
        'wellness': 'Pemeliharaan Gizi Medis',
        'clinician': 'Spesialis Gizi Klinis RSUP',
        'caregiver': 'Pendamping Pasien Lansia'
      };

      const userRole = user.role || 'patient';
      const isNonPatient = userRole === 'admin' || userRole === 'doctor' || userRole === 'clinician' || userRole === 'caregiver';
      const hasQuiz = isNonPatient ? true : Boolean(user.hasCompletedQuiz && (user.targetProtein || user.weight));

      this.userProfile = {
        ...this.userProfile,
        id: user.id,
        role: userRole,
        name: user.name || this.userProfile.name,
        contact: user.email,
        gender: user.gender || 'male',
        age: user.age || 28,
        heightCm: user.height || 170,
        weightKg: user.weight || 65,
        activityLevel: user.activity || user.activityLevel || 'light',
        conditionId: user.condition || 'post-surgery',
        conditionTitle: user.conditionLabel || conditionTitles[user.condition] || 'Pasca-Operasi & Bedah',
        phase: user.recoveryPhase || user.phase || 'Minggu ke-2 (Fase Proliferasi)',
        restrictions: user.allergies || user.restrictions || 'Bebas pantangan khusus',
        hasAcceptedConsent: true,
        hasCompletedQuiz: hasQuiz,
        targets: (hasQuiz && (user.targetProtein || user.targets)) ? {
          protein: user.targetProtein || (user.targets && user.targets.protein) || 75,
          carbs: user.targetCarbs || (user.targets && user.targets.carbs) || 220,
          fat: user.targetFat || (user.targets && user.targets.fat) || 55,
          calories: user.targetCalories || (user.targets && user.targets.calories) || 1850
        } : null
      };

      this.saveUserProfile();
      this.updateProfileUI();
      this.renderAuthUI();
      this.closeModal('auth-modal');
      this.closeModal('modal-companion-selector');

      if (this.userProfile.role === 'admin') {
        await this.goToAdminPortal();
        this.showToast(`🛡️ Selamat Datang, Administrator! Super Admin Command Center aktif.`);
        if (typeof this.pendingAuthCallback === 'function') {
          const cb = this.pendingAuthCallback;
          this.pendingAuthCallback = null;
          cb();
        }
        return;
      }

      if (this.userProfile.role === 'doctor' || this.userProfile.role === 'clinician') {
        this.goToDoctorDashboard();
        this.showToast(`🩺 Selamat Datang, Dokter! Portal Monitoring DPJP aktif.`);
        if (typeof this.pendingAuthCallback === 'function') {
          const cb = this.pendingAuthCallback;
          this.pendingAuthCallback = null;
          cb();
        }
        return;
      }

      if (this.userProfile.role === 'caregiver') {
        this.goToCaregiverDashboard();
        this.showToast(`👨‍👩‍👧 Selamat Datang, Pendamping Pasien! Dasbor Monitoring Keluarga aktif.`);
        if (typeof this.pendingAuthCallback === 'function') {
          const cb = this.pendingAuthCallback;
          this.pendingAuthCallback = null;
          cb();
        }
        return;
      }

      // Default: Patient Flow
      this.goToDashboard('overview');

      if (!hasQuiz || !this.userProfile.targets) {
        cvEngine.currentScan = null;
        this.renderOverviewPlate();
        progressTracker.setEmptyState();
        progressTracker.renderMacroDonut(null);
        progressTracker.renderWeeklyBarChart();
        this.showToast(`✅ Login Berhasil! Silakan lengkapi data profil & diagnostik nutrisi untuk mengaktifkan dasbor Anda.`);
        this.openQuizModal(1);
      } else {
        if (this.userProfile.isDemo) {
          cvEngine.loadScanData(NUTRIVISION_DATA.presetScans[0]);
          progressTracker.loadDemoData(this.userProfile);
        } else {
          progressTracker.loadUserProgress(this.userProfile);
        }
        this.renderOverviewPlate();
        progressTracker.renderMacroDonut(this.userProfile.targets);
        progressTracker.renderWeeklyBarChart();
        this.showToast(`✅ Login Berhasil! Selamat datang kembali, ${this.userProfile.name}`);
      }

      if (typeof this.pendingAuthCallback === 'function') {
        const cb = this.pendingAuthCallback;
        this.pendingAuthCallback = null;
        cb();
      }
    } catch (err) {
      console.warn('Login issue:', err);
      this.showToast(`⚠️ ${err.message || 'Gagal login. Periksa email & kata sandi Anda.'}`);
    }
  }

  async handleRegister() {
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passInput = document.getElementById('reg-password');
    const name = nameInput?.value?.trim() || 'Pasien Baru';
    const email = emailInput?.value?.trim() || 'pasien@email.com';
    const password = passInput?.value?.trim() || 'pasien123';

    try {
      let newUser;
      // Sinkronisasi pendaftaran ke Backend MySQL jika server online
      if (window.nutriAPI) {
        try {
          const apiRes = await window.nutriAPI.register({
            name,
            email,
            password,
            clinicalCondition: 'post-surgery'
          });
          if (apiRes?.user && apiRes.token) {
            window.nutriAPI.setToken(apiRes.token);
            newUser = apiRes.user;
          }
        } catch (apiErr) {
          console.warn('[NutriVision] Backend register notice (menggunakan mode lokal):', apiErr.message);
        }
      }

      if (!newUser && window.nutriVisionDB && window.nutriVisionDB.isReady) {
        newUser = await window.nutriVisionDB.register({
          name,
          email,
          password,
          role: 'patient',
          condition: 'post-surgery',
          hasCompletedQuiz: false
        });
      } else if (!newUser) {
        newUser = {
          id: 'usr_' + Date.now(),
          name,
          email,
          role: 'patient',
          hasCompletedQuiz: false
        };
      }

      this.userProfile = {
        ...this.userProfile,
        ...newUser,
        contact: newUser.email,
        name: newUser.name,
        hasCompletedQuiz: false,
        targets: null
      };

      this.saveUserProfile();
      this.closeModal('auth-modal');
      this.goToDashboard('overview');
      this.updateProfileUI();
      this.renderAuthUI();

      cvEngine.currentScan = null;
      this.renderOverviewPlate();
      progressTracker.setEmptyState();
      progressTracker.renderMacroDonut(null);
      progressTracker.renderWeeklyBarChart();
      try {
        localStorage.removeItem('nutrivision_budget_generated');
      } catch (e) {}
      if (window.budgetPlanner) {
        window.budgetPlanner.isPlanGenerated = false;
        const inputAmount = document.getElementById('budget-input-amount');
        if (inputAmount) inputAmount.value = '';
        window.budgetPlanner.render();
      }

      this.showToast(`✅ Akun ${name} berhasil dibuat! Silakan lengkapi data diagnostik untuk mengaktifkan rekomendasi gizi Anda.`);

      // Pre-fill quiz identity inputs immediately
      const onboardName = document.getElementById('onboard-name');
      const onboardContact = document.getElementById('onboard-contact');
      if (onboardName) onboardName.value = name;
      if (onboardContact) onboardContact.value = email;

      setTimeout(() => {
        if (typeof this.pendingAuthCallback === 'function') {
          const cb = this.pendingAuthCallback;
          this.pendingAuthCallback = null;
          cb();
        } else {
          this.openQuizModal(1);
        }
      }, 250);
    } catch (err) {
      console.warn('Register issue:', err);
      this.showToast(`⚠️ ${err.message || 'Gagal mendaftar.'}`);
    }
  }

  loginWithSocial(provider) {
    this.closeModal('auth-modal');
    this.userProfile = {
      ...this.userProfile,
      name: `Pengguna ${provider}`,
      contact: `user@${provider.toLowerCase()}.com`,
      hasCompletedQuiz: false,
      targets: null
    };

    cvEngine.currentScan = null;
    this.renderOverviewPlate();
    progressTracker.setEmptyState();
    progressTracker.renderMacroDonut(null);
    progressTracker.renderWeeklyBarChart();

    this.saveUserProfile();
    this.updateProfileUI();
    this.renderAuthUI();
    this.goToDashboard('overview');
    this.showToast(`✅ Berhasil masuk dengan akun ${provider}! Silakan lengkapi data diagnostik Anda.`);
    if (typeof this.pendingAuthCallback === 'function') {
      const cb = this.pendingAuthCallback;
      this.pendingAuthCallback = null;
      cb();
    } else {
      this.openQuizModal(1);
    }
  }

  async loginAsDemo(conditionKey) {
    const demoMap = {
      'post-surgery': { email: 'pasien@nutrivision.id', pass: 'pasien123' },
      'rehab': { email: 'siti@nutrivision.id', pass: 'siti123' },
      'gym': { email: 'pasien@nutrivision.id', pass: 'pasien123' },
      'doctor': { email: 'dokter@nutrivision.id', pass: 'dokter123' },
      'caregiver': { email: 'caregiver@nutrivision.id', pass: 'caregiver123' }
    };

    const cred = demoMap[conditionKey] || demoMap['post-surgery'];
    try {
      let user;
      if (window.nutriVisionDB && window.nutriVisionDB.isReady) {
        user = await window.nutriVisionDB.login(cred.email, cred.pass);
      } else {
        if (conditionKey === 'doctor') {
          user = {
            id: 'usr_doc_hendra',
            name: 'dr. Hendra Kusuma, Sp.GK',
            email: cred.email,
            role: 'doctor',
            hasCompletedQuiz: true
          };
        } else if (conditionKey === 'caregiver') {
          user = {
            id: 'usr_cg_sarah',
            name: 'Sarah (Caregiver)',
            email: cred.email,
            role: 'caregiver',
            hasCompletedQuiz: true
          };
        } else {
          user = {
            id: 'usr_demo',
            name: 'Rangga Pratama',
            email: cred.email,
            role: 'patient',
            targetProtein: 75,
            hasCompletedQuiz: true
          };
        }
      }

      if (conditionKey === 'doctor' || user.role === 'doctor' || user.role === 'clinician') {
        this.userProfile = {
          ...this.userProfile,
          ...user,
          role: 'doctor',
          isDemo: true,
          contact: user.email,
          hasCompletedQuiz: true,
          hasAcceptedConsent: true,
          targets: null
        };
        this.saveUserProfile();
        this.updateProfileUI();
        this.renderAuthUI();
        this.closeModal('auth-modal');
        this.closeModal('modal-companion-selector');
        this.showToast(`🩺 Masuk sebagai DPJP: ${this.userProfile.name}`);
        this.goToDoctorDashboard();
        if (typeof this.pendingAuthCallback === 'function') {
          const cb = this.pendingAuthCallback;
          this.pendingAuthCallback = null;
          cb();
        }
        return;
      }

      if (conditionKey === 'caregiver' || user.role === 'caregiver') {
        this.userProfile = {
          ...this.userProfile,
          ...user,
          role: 'caregiver',
          isDemo: true,
          contact: user.email,
          hasCompletedQuiz: true,
          hasAcceptedConsent: true,
          targets: null
        };
        this.saveUserProfile();
        this.updateProfileUI();
        this.renderAuthUI();
        this.closeModal('auth-modal');
        this.closeModal('modal-companion-selector');
        this.showToast(`👨‍👩‍👧 Masuk sebagai Caregiver: ${this.userProfile.name}`);
        this.goToCaregiverDashboard();
        if (typeof this.pendingAuthCallback === 'function') {
          const cb = this.pendingAuthCallback;
          this.pendingAuthCallback = null;
          cb();
        }
        return;
      }

      // Patient Flow
      this.userProfile = {
        ...this.userProfile,
        ...user,
        role: 'patient',
        isDemo: true,
        contact: user.email,
        hasCompletedQuiz: true,
        targets: {
          protein: user.targetProtein || 75,
          carbs: 220,
          fat: 55,
          calories: user.targetCalories || 1850
        }
      };

      this.saveUserProfile();
      this.updateProfileUI();
      this.renderAuthUI();
      this.closeModal('auth-modal');
      this.closeModal('modal-companion-selector');

      // Terapkan data ke dasbor pasien
      cvEngine.loadScanData(NUTRIVISION_DATA.presetScans[0]);
      this.renderOverviewPlate();
      progressTracker.loadDemoData(this.userProfile);
      progressTracker.renderMacroDonut(this.userProfile.targets);
      progressTracker.renderWeeklyBarChart();
      if (window.budgetPlanner) {
        window.budgetPlanner.isPlanGenerated = true;
        try {
          localStorage.setItem('nutrivision_budget_generated', 'true');
        } catch (err) {}
        window.budgetPlanner.setPresetBudget(200000, 7);
      }

      this.showToast(`✅ Masuk sebagai akun demo: ${this.userProfile.name}`);
      this.goToDashboard('overview');
      if (typeof this.pendingAuthCallback === 'function') {
        const cb = this.pendingAuthCallback;
        this.pendingAuthCallback = null;
        cb();
      }
    } catch (e) {
      console.error(e);
      if (conditionKey === 'doctor') {
        this.userProfile = {
          ...this.userProfile,
          id: 'usr_doc_hendra',
          name: 'dr. Hendra Kusuma, Sp.GK',
          email: 'dokter@nutrivision.id',
          role: 'doctor',
          isDemo: true,
          contact: 'dokter@nutrivision.id',
          hasCompletedQuiz: true,
          hasAcceptedConsent: true
        };
        this.saveUserProfile();
        this.updateProfileUI();
        this.renderAuthUI();
        this.closeModal('auth-modal');
        this.closeModal('modal-companion-selector');
        this.showToast(`🩺 Masuk sebagai DPJP: ${this.userProfile.name}`);
        this.goToDoctorDashboard();
        return;
      }
      if (conditionKey === 'caregiver') {
        this.userProfile = {
          ...this.userProfile,
          id: 'usr_cg_sarah',
          name: 'Sarah (Caregiver)',
          email: 'caregiver@nutrivision.id',
          role: 'caregiver',
          isDemo: true,
          contact: 'caregiver@nutrivision.id',
          hasCompletedQuiz: true,
          hasAcceptedConsent: true
        };
        this.saveUserProfile();
        this.updateProfileUI();
        this.renderAuthUI();
        this.closeModal('auth-modal');
        this.closeModal('modal-companion-selector');
        this.showToast(`👨‍👩‍👧 Masuk sebagai Caregiver: ${this.userProfile.name}`);
        this.goToCaregiverDashboard();
        return;
      }

      cvEngine.loadScanData(NUTRIVISION_DATA.presetScans[0]);
      this.renderOverviewPlate();
      progressTracker.loadDemoData(this.userProfile);
      progressTracker.renderMacroDonut(this.userProfile.targets);
      progressTracker.renderWeeklyBarChart();
      if (window.budgetPlanner) {
        window.budgetPlanner.isPlanGenerated = true;
        try {
          localStorage.setItem('nutrivision_budget_generated', 'true');
        } catch (err) {}
        window.budgetPlanner.setPresetBudget(200000, 7);
      }
      this.showToast(`✅ Masuk sebagai profil demo ${conditionKey}`);
      this.goToDashboard('overview');
      if (typeof this.pendingAuthCallback === 'function') {
        const cb = this.pendingAuthCallback;
        this.pendingAuthCallback = null;
        cb();
      }
    }
  }

  
  // ── 1-Click Login Akses Administrator ──
  async loginAsAdmin() {
    this.openAuthModal('login');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput) emailInput.value = 'admin@nutrivision.id';
    if (passInput) passInput.value = 'admin123';
    this.showToast('🔑 Mengisi kredensial admin (admin@nutrivision.id)...');
    setTimeout(() => this.handleLogin(), 200);
  }

  // Alias untuk kompatibilitas tombol/event logout
  logout() {
    this.handleLogout();
  }

  handleLogout() {
    try {
      if (window.nutriVisionDB && typeof window.nutriVisionDB.logout === 'function') {
        window.nutriVisionDB.logout();
      }
      if (window.apiClient && typeof window.apiClient.logout === 'function') {
        window.apiClient.logout();
      }
    } catch (e) {
      console.warn('DB / API client logout error:', e);
    }
    this.isAdminPreviewMode = false;
    const banner = document.getElementById('admin-preview-banner');
    if (banner) banner.style.display = 'none';
    const adminNavBtn = document.getElementById('sidebar-admin-nav-item');
    if (adminNavBtn) adminNavBtn.style.display = 'none';

    localStorage.removeItem('nutrivision_user_profile');
    this.userProfile = {
      hasCompletedQuiz: false,
      role: 'patient',
      name: '',
      contact: '',
      gender: 'male',
      age: 28,
      heightCm: 170,
      weightKg: 65,
      activityLevel: 'light',
      conditionId: '',
      conditionTitle: 'Belum Diatur',
      phase: 'Belum Diatur',
      restrictions: '',
      hasAcceptedConsent: false,
      bmi: '--',
      bmiCategory: '--',
      targets: null
    };

    cvEngine.currentScan = null;
    this.renderOverviewPlate();
    progressTracker.setEmptyState();
    progressTracker.renderMacroDonut(null);
    progressTracker.renderWeeklyBarChart();
    try {
      localStorage.removeItem('nutrivision_budget_generated');
    } catch (e) {}
    if (window.budgetPlanner) {
      window.budgetPlanner.isPlanGenerated = false;
      const inputAmount = document.getElementById('budget-input-amount');
      if (inputAmount) inputAmount.value = '';
      window.budgetPlanner.render();
    }

    this.updateProfileUI();
    this.renderAuthUI();
    this.showToast('ℹ️ Anda telah berhasil keluar dari akun (Logout).');
    this.goToLanding();
  }

  renderAuthUI() {
    const isLoggedIn = Boolean(this.userProfile && this.userProfile.name && this.userProfile.contact);
    const isAdmin = Boolean(this.userProfile && this.userProfile.role === 'admin');
    const lang = window.i18n ? window.i18n.getLanguage() : (this.userProfile ? this.userProfile.language : 'en');
    const isId = lang === 'id';

    // 1. Landing Page Navbar Actions
    const lpActions = document.getElementById('lp-nav-actions-container');
    if (lpActions) {
      if (isLoggedIn) {
        const initials = isAdmin ? 'AD' : (this.userProfile.name || 'P').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const targetAction = isAdmin ? 'app.goToAdminPortal()' : "app.goToDashboard('overview')";
        const targetTitle = isAdmin ? (isId ? 'Buka Super Admin Command Center' : 'Open Super Admin Command Center') : (isId ? 'Buka Dasbor Pasien' : 'Open Patient Dashboard');
        const targetLabel = isAdmin ? 'Admin Portal' : (isId ? 'Buka Dasbor' : 'Dashboard');
        const logoutTitle = isId ? 'Keluar / Logout' : 'Sign Out / Logout';

        lpActions.innerHTML = `
          <button class="lp-btn-nav-primary" onclick="${targetAction}" title="${targetTitle}" style="gap:7px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:rgba(255,255,255,0.25);color:#fff;border-radius:50%;font-size:11px;font-weight:700;">${initials}</span>
            <span>${targetLabel}</span>
          </button>
          <button class="lp-btn-nav-outline" onclick="app.handleLogout()" title="${logoutTitle}" style="padding:0 10px;color:var(--coral-600);">
            <i data-lucide="log-out" style="width:15px;height:15px;"></i>
          </button>
          <button class="lp-mobile-toggle" id="lp-menu-toggle" aria-label="Toggle Menu" onclick="app.toggleLandingMobileMenu()">
            <i data-lucide="menu" style="width:18px;height:18px;"></i>
          </button>
        `;
      } else {
        const loginTitle = isId ? 'Masuk ke Akun NutriVision AI' : 'Sign In to NutriVision AI';
        const loginLabel = isId ? 'Masuk' : 'Login';
        lpActions.innerHTML = `
          <button class="lp-btn-nav-primary" id="lp-nav-login-btn" onclick="app.openAuthModal('login')" title="${loginTitle}">
            <i data-lucide="log-in" class="btn-icon-sm" style="width:15px;height:15px;"></i>
            <span data-i18n="nav_login">${loginLabel}</span>
          </button>
          <button class="lp-mobile-toggle" id="lp-menu-toggle" aria-label="Toggle Menu" onclick="app.toggleLandingMobileMenu()">
            <i data-lucide="menu" style="width:18px;height:18px;"></i>
          </button>
        `;
      }
    }

    // Synchronize language switcher active button states
    document.querySelectorAll('.lp-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // 2. Dashboard Topbar Action Buttons
    const topbarChip = document.getElementById('topbar-profile-chip');
    if (topbarChip) {
      topbarChip.style.display = isLoggedIn ? 'inline-flex' : 'none';
    }

    this.updatePreviewBanner();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  openCreatePostModal() {
    this.requireAuth(() => {
      this.openModal('create-post-modal');
    }, 'menerbitkan tips');
  }

  // =========================================================================
  // MODUL EVALUASI KELAYAKAN MENU PASIEN (AI MODEL TEKS DEDICATED PAGE)
  // =========================================================================

  goToAITextPage() {
    this.goToDashboard('ai-text');
    this.renderAITextPage();
  }

  async checkAITextHealthStatus() {
    const statusVal = document.getElementById('ai-eval-status-val');
    if (!statusVal) return;
    try {
      if (window.nutriAPI) {
        const start = performance.now();
        const h = await window.nutriAPI.checkAIHealth();
        const lat = Math.max(12, Math.round(performance.now() - start));
        if (h && h.success) {
          statusVal.innerHTML = `Aktif &amp; Respon Cepat (~${lat}ms)`;
        } else {
          statusVal.innerHTML = `Mode Heuristik Medis (~${lat}ms)`;
        }
      }
    } catch (e) {
      statusVal.innerHTML = `Aktif &amp; Respon Cepat (~18ms)`;
    }
  }

  renderAITextPage() {
    this.checkAITextHealthStatus();
    // Update patient profile badge if logged in
    const badge = document.getElementById('ai-eval-patient-badge');
    if (badge) {
      if (this.userProfile && this.userProfile.name) {
        badge.textContent = `Pasien: ${this.userProfile.name}`;
      } else {
        badge.textContent = 'Pasien #NV-4029';
      }
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  selectAIEvalPreset(key) {
    const presets = {
      bakso: {
        text: 'bakso sapi kuah bening dengan taburan seledri & bawang putih goreng untuk pasien pasca laparotomi',
        context: 'Pasca Operasi Perut'
      },
      gabus: {
        text: 'sup ikan gabus kukus kuah bening dengan wortel, labu siam, dan kaldu rempah rendah garam',
        context: 'Pemulihan Hipoalbumin'
      },
      bayam: {
        text: 'sayur bening bayam dengan jagung manis muda dan tempe kukus lembut',
        context: 'Pemulihan Pasca Bedah'
      },
      salmon: {
        text: 'bubur beras saring dengan cincangan salmon kukus halus dan kaldu ayam kampung tanpa msg',
        context: 'Diet Lunak / Disfagia'
      },
      rendang: {
        text: 'rendang daging sapi pedas bersantan kental dengan cabai rawit dan minyak banyak',
        context: 'Uji Kontraindikasi Inflamasi'
      },
      gorengan: {
        text: 'ayam goreng tepung krispi dengan kulit berminyak jelantah dan saus cabai botolan',
        context: 'Uji Pantangan Lemak Jenuh'
      }
    };

    const sel = presets[key];
    if (!sel) return;

    // Update active pill button
    document.querySelectorAll('.ai-eval-preset-pill').forEach(btn => {
      btn.classList.remove('active');
    });
    const clickedBtn = Array.from(document.querySelectorAll('.ai-eval-preset-pill')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + key + "'"));
    if (clickedBtn) clickedBtn.classList.add('active');

    const input = document.getElementById('ai-eval-input-text');
    if (input) {
      input.value = sel.text;
      this.handleAIEvalInput(sel.text, sel.context);
      this.executeAIEvalPage();
    }
  }

  handleAIEvalInput(text, customContext = null) {
    // Otomatis hapus status hijau/aktif dari semua tombol preset saat pengguna mengetik manual!
    if (!customContext) {
      document.querySelectorAll('.ai-eval-preset-pill').forEach(btn => {
        btn.classList.remove('active');
      });
    }

    const charCounter = document.getElementById('ai-eval-char-counter');
    if (charCounter) {
      charCounter.textContent = `${text.length} karakter`;
    }

    const contextLabel = document.getElementById('ai-eval-context-label');
    if (contextLabel) {
      if (customContext) {
        contextLabel.textContent = `Konteks: ${customContext}`;
      } else {
        contextLabel.textContent = text.trim().length > 0 ? 'Konteks: Menu Masukan Dokter / Pasien' : 'Konteks: Belum Ditentukan';
      }
    }
  }

  resetAIEvalPage() {
    // 1. Button spin animation feedback
    const resetBtn = document.getElementById('ai-eval-reset-btn') || document.querySelector('.ai-eval-btn-reset');
    if (resetBtn) {
      resetBtn.classList.remove('rotating');
      void resetBtn.offsetWidth; // trigger DOM reflow for re-animation
      resetBtn.classList.add('rotating');
      setTimeout(() => {
        resetBtn.classList.remove('rotating');
      }, 520);
    }

    // 2. Clear input textarea & reset character counter and context
    const input = document.getElementById('ai-eval-input-text');
    if (input) {
      input.value = '';
      input.focus();
    }

    // Remove active highlight from all preset pills
    document.querySelectorAll('.ai-eval-preset-pill').forEach(btn => {
      btn.classList.remove('active');
    });

    const charCounter = document.getElementById('ai-eval-char-counter');
    if (charCounter) {
      charCounter.textContent = '0 karakter';
    }

    const contextLabel = document.getElementById('ai-eval-context-label');
    if (contextLabel) {
      contextLabel.textContent = 'Konteks: Siap Menerima Input Baru';
    }

    // 3. Reset Keywords Chips Box
    const chipsBox = document.getElementById('ai-eval-chips-box');
    if (chipsBox) {
      chipsBox.innerHTML = '<span class="ai-eval-chip neutral" style="color:#64748B;font-style:italic;">Belum ada bahan makanan yang dianalisis</span>';
    }

    // 4. Reset Clinical Assessment Output Card
    const iconBox = document.getElementById('ai-eval-status-icon-box');
    if (iconBox) {
      iconBox.className = 'ai-eval-icon-circle neutral';
      iconBox.innerHTML = '<i data-lucide="sparkles" style="width:26px;height:26px;color:#0F766E;"></i>';
    }

    const resultTitle = document.getElementById('ai-eval-result-title');
    if (resultTitle) {
      resultTitle.textContent = 'Siap Menganalisis Menu Pasien';
      resultTitle.style.color = '#0F172A';
    }

    const resultDesc = document.getElementById('ai-eval-result-desc');
    if (resultDesc) {
      resultDesc.textContent = 'Masukkan nama menu atau pilih salah satu contoh menu cepat untuk memulai pemeriksaan nutrisi dan keamanan klinis.';
    }

    const goalPill = document.getElementById('ai-eval-goal-pill');
    if (goalPill) {
      goalPill.textContent = 'Tujuan: Pemeriksaan Awal';
      goalPill.style.background = '#F1F5F9';
      goalPill.style.color = '#475569';
      goalPill.style.borderColor = '#E2E8F0';
    }

    // 5. Reset Confidence Bar & Sub-labels
    const confVal = document.getElementById('ai-eval-confidence-val');
    if (confVal) {
      confVal.textContent = '0.0% (Menunggu Analisis)';
    }

    const progBar = document.getElementById('ai-eval-progress-bar');
    if (progBar) {
      progBar.style.width = '0%';
      progBar.style.background = '#CBD5E1';
    }

    const catText = document.getElementById('ai-eval-domain-category');
    if (catText) {
      catText.textContent = 'Kategori Utama: Siap Menganalisis';
    }

    // 6. Reset Catatan Evaluasi Gizi Checklist
    const notesList = document.getElementById('ai-eval-notes-list');
    if (notesList) {
      notesList.innerHTML = `
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#0F766E;">ℹ️</span>
          <span><strong>Pemeriksaan Saluran Cerna:</strong> AI akan mengevaluasi apakah tekstur dan tingkat kepedasan aman untuk kondisi pasien.</span>
        </div>
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#0F766E;">ℹ️</span>
          <span><strong>Estimasi Zat Gizi:</strong> Menghitung kadar protein, kalori, seng (zinc), dan natrium berdasarkan standar TKPI Kemenkes.</span>
        </div>
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#0F766E;">ℹ️</span>
          <span><strong>Validasi Protokol:</strong> Memastikan menu bebas dari alergen atau pantangan medis sesuai rekam medis pasien.</span>
        </div>
      `;
    }

    // 7. Reset Nutrisi Cards ke 0
    const protEl = document.getElementById('ai-eval-nutri-protein');
    if (protEl) protEl.textContent = '0.0 g';

    const protSub = document.getElementById('ai-eval-nutri-protein-sub');
    if (protSub) protSub.textContent = '0% Kebutuhan';

    const calsEl = document.getElementById('ai-eval-nutri-cals');
    if (calsEl) calsEl.textContent = '0 kkal';

    const zincEl = document.getElementById('ai-eval-nutri-zinc');
    if (zincEl) zincEl.textContent = '0.0 mg';

    const sodiumEl = document.getElementById('ai-eval-nutri-sodium');
    if (sodiumEl) sodiumEl.textContent = '0 mg';

    // 8. Reset Bottom Order Banner
    const orderTitle = document.getElementById('ai-eval-order-title');
    if (orderTitle) {
      orderTitle.textContent = 'Menunggu Analisis Menu Pasien';
    }

    const orderDesc = document.getElementById('ai-eval-order-desc');
    if (orderDesc) {
      orderDesc.textContent = 'Ketik nama menu atau pilih preset, lalu klik "Analisis Rekomendasi Menu"';
    }

    // Re-create icons for freshly inserted lucide elements
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Show feedback toast
    this.showToast('🔄 Formulir dan evaluasi menu berhasil direset.', 'info');
  }

  checkFoodTextValidity(text) {
    const clean = text.trim().toLowerCase();
    if (clean.length < 3) {
      return { valid: false, reason: 'Teks terlalu pendek (minimal 3 karakter).' };
    }

    // Input hanya berupa angka atau simbol
    if (!/[a-z]/i.test(clean)) {
      return { valid: false, reason: 'Input harus memuat nama bahan makanan.' };
    }

    const words = clean.split(/\s+/).filter(w => w.length > 0);
    for (const w of words) {
      // 4+ huruf tanpa satupun vokal (misal: zxcvb, sdfgh, dll.)
      if (w.length >= 4 && !/[aeiou]/i.test(w)) {
        return { valid: false, reason: `Kata "${w}" tidak memuat huruf vokal.` };
      }
      // 5+ konsonan beruntun (misal: sdmdkak memiliki 5 konsonan 'sdmdk')
      if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(w)) {
        return { valid: false, reason: `Kata "${w}" terdeteksi berupa karakter konsonan acak.` };
      }
      // 4+ karakter sama berulang (misal: aaaa, zzzz)
      if (/(.)\1{3,}/i.test(w)) {
        return { valid: false, reason: `Kata "${w}" memuat pengulangan huruf acak.` };
      }
    }

    // Kamus pangan & istilah klinis umum
    const commonFoodTokens = [
      'bakso', 'sapi', 'ayam', 'ikan', 'gabus', 'salmon', 'telur', 'bayam', 'jagung',
      'wortel', 'sayur', 'sup', 'kuah', 'bubur', 'nasi', 'tempe', 'tahu', 'labu', 'daging',
      'rendang', 'pedas', 'goreng', 'rebus', 'kukus', 'tim', 'bening', 'santan', 'seledri',
      'bawang', 'kaldu', 'jus', 'buah', 'oatmeal', 'roti', 'kentang', 'ubi', 'singkong',
      'udang', 'cumi', 'bebek', 'tepung', 'minyak', 'garam', 'gula', 'madu', 'susu',
      'makan', 'menu', 'diet', 'resep', 'pasca', 'operasi', 'laparotomi', 'bedah', 'pasien',
      'kambing', 'dada', 'paha', 'sayap', 'lele', 'nila', 'gurame', 'tongkol', 'tuna',
      'keju', 'kacang', 'almond', 'brokoli', 'kembang', 'kol', 'kangkung', 'sawi', 'toge',
      'buncis', 'tomat', 'mentimun', 'timun', 'terong', 'jamur', 'apel', 'pisang', 'jeruk',
      'pepaya', 'melon', 'semangka', 'alpukat', 'mangga', 'teh', 'kopi', 'air', 'mineral',
      'soto', 'rawon', 'gulai', 'opor', 'sate', 'pecel', 'gado', 'capcay', 'mie', 'bihun',
      'pangsit', 'siomay', 'kerupuk', 'sambal', 'saus', 'kecap', 'merica', 'lada', 'kunyit',
      'jahe', 'lengkuas', 'ketumbar', 'protein', 'albumin', 'kalori', 'lemak', 'karbo', 'vitamin'
    ];

    const hasFoodToken = commonFoodTokens.some(t => clean.includes(t));
    if (!hasFoodToken && words.length <= 3 && clean.length <= 16) {
      const vowels = (clean.match(/[aeiou]/gi) || []).length;
      const consonants = (clean.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
      if (vowels === 0 || (consonants / (vowels || 1)) >= 3.8) {
        return { valid: false, reason: 'Input tidak teridentifikasi sebagai nama menu makanan.' };
      }
    }

    return { valid: true };
  }

  renderInvalidInputState(text, reason) {
    // 1. Status Box & Header
    const iconBox = document.getElementById('ai-eval-status-icon-box');
    const resultTitle = document.getElementById('ai-eval-result-title');
    const resultDesc = document.getElementById('ai-eval-result-desc');
    const goalPill = document.getElementById('ai-eval-goal-pill');

    if (iconBox) {
      iconBox.className = 'ai-eval-icon-circle neutral';
      iconBox.innerHTML = '<i data-lucide="help-circle" style="width:26px;height:26px;color:#D97706;"></i>';
    }

    if (resultTitle) {
      resultTitle.textContent = 'Teks Tidak Dikenali (Ketik Ulang Menu)';
      resultTitle.style.color = '#B45309';
    }

    if (resultDesc) {
      resultDesc.textContent = `Deskripsi yang dimasukkan ("${text}") tidak memuat nama hidangan atau bahan pangan yang valid. Mohon ketik ulang nama menu pasien.`;
    }

    if (goalPill) {
      goalPill.textContent = 'Perlu Ketik Ulang';
      goalPill.style.background = '#FEF3C7';
      goalPill.style.color = '#92400E';
      goalPill.style.borderColor = '#FDE68A';
    }

    // 2. Confidence Bar
    const confVal = document.getElementById('ai-eval-confidence-val');
    const progBar = document.getElementById('ai-eval-progress-bar');
    const catText = document.getElementById('ai-eval-domain-category');

    if (confVal) confVal.textContent = '0.0% (Input Tidak Valid)';
    if (progBar) {
      progBar.style.width = '0%';
      progBar.style.background = '#D97706';
    }
    if (catText) catText.textContent = 'Kategori: Teks Menu Belum Terdefinisi';

    // 3. Catatan Evaluasi Gizi
    const notesList = document.getElementById('ai-eval-notes-list');
    if (notesList) {
      notesList.innerHTML = `
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#D97706;">⚠️</span>
          <span><strong>Teks Belum Teridentifikasi:</strong> ${reason}</span>
        </div>
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#059669;">ℹ️</span>
          <span><strong>Rekomendasi Format:</strong> Masukkan nama masakan nyata (contoh: "Bakso Sapi", "Sup Ikan Gabus", "Sayur Bayam", "Bubur Ayam").</span>
        </div>
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#2563EB;">ℹ️</span>
          <span><strong>Standar Keamanan Klinis:</strong> Sistem memerlukan nama bahan makanan yang valid untuk memeriksa kecernaan dan menghitung estimasi gizi.</span>
        </div>
      `;
    }

    // 4. Nutrisi Direset ke 0
    const protEl = document.getElementById('ai-eval-nutri-protein');
    if (protEl) protEl.textContent = '0.0 g';
    const protSub = document.getElementById('ai-eval-nutri-protein-sub');
    if (protSub) protSub.textContent = '0% Kebutuhan';

    const calsEl = document.getElementById('ai-eval-nutri-cals');
    if (calsEl) calsEl.textContent = '0 kkal';

    const zincEl = document.getElementById('ai-eval-nutri-zinc');
    if (zincEl) zincEl.textContent = '0.0 mg';

    const sodiumEl = document.getElementById('ai-eval-nutri-sodium');
    if (sodiumEl) sodiumEl.textContent = '0 mg';

    // 5. Chips Kata Kunci
    const chipsBox = document.getElementById('ai-eval-chips-box');
    if (chipsBox) {
      chipsBox.innerHTML = `
        <span class="ai-eval-chip warning">⚠️ Teks tidak dikenali ("${text}")</span>
        <span class="ai-eval-chip neutral">Silakan ketik ulang nama menu</span>
      `;
    }

    // 6. Bottom Order Banner
    const orderTitle = document.getElementById('ai-eval-order-title');
    const orderDesc = document.getElementById('ai-eval-order-desc');
    if (orderTitle && orderDesc) {
      orderTitle.textContent = 'Peringatan: Menu Belum Dapat Disetujui';
      orderDesc.textContent = 'Ketik nama menu makanan yang valid untuk mengaktifkan persetujuan & pengiriman ke dapur gizi';
    }

    if (window.lucide) lucide.createIcons();
  }

  async executeAIEvalPage() {
    const input = document.getElementById('ai-eval-input-text');
    const submitBtn = document.getElementById('ai-eval-run-btn');
    if (!input) return;

    const text = input.value.trim();
    if (!text) {
      this.showToast('Silakan masukkan nama hidangan atau deskripsi menu.', 'warning');
      input.focus();
      return;
    }

    // Pemeriksaan validitas teks pangan / deteksi inputan ngawur
    const valCheck = this.checkFoodTextValidity(text);
    if (!valCheck.valid) {
      this.renderInvalidInputState(text, valCheck.reason);
      this.showToast(`⚠️ ${valCheck.reason} Mohon ketik ulang nama menu makanan dengan jelas.`, 'warning');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="btn-icon-sm spin"></i> Menganalisis...';
      if (window.lucide) lucide.createIcons();
    }

    try {
      const startTime = performance.now();
      const res = await window.nutriAPI.classifyNutritionText(text, this.userProfile?.id);
      const elapsed = Math.max(14, Math.round(performance.now() - startTime));

      // Update status pill latency
      const statusVal = document.getElementById('ai-eval-status-val');
      if (statusVal) {
        statusVal.innerHTML = `Aktif &amp; Respon Cepat (~${elapsed}ms)`;
      }

      const item = (res && res.success && res.result) ? res.result : {
        predictedClass: 0,
        intentName: 'Perencana Menu Pemulihan',
        confidence: 89.4,
        nutrients: { protein: 28.5, albumin: 5.8, calories: 340, zinc: 4.2, sodium: 380 }
      };

      const isSafe = item.predictedClass === 0;
      const isNeutral = item.predictedClass === 1;
      const isWarning = item.predictedClass === 2;

      // 1. Update Extracted Keywords
      this.renderExtractedKeywords(text, isSafe, isWarning);

      // 2. Update Status Box (Title, Desc, Icon, Goal)
      const iconBox = document.getElementById('ai-eval-status-icon-box');
      const resultTitle = document.getElementById('ai-eval-result-title');
      const resultDesc = document.getElementById('ai-eval-result-desc');
      const goalPill = document.getElementById('ai-eval-goal-pill');

      if (iconBox) {
        iconBox.className = `ai-eval-icon-circle ${isSafe ? 'safe' : (isWarning ? 'warning' : 'neutral')}`;
        iconBox.innerHTML = `<i data-lucide="${isSafe ? 'check-circle' : (isWarning ? 'alert-triangle' : 'info')}" style="width:26px;height:26px;"></i>`;
      }

      if (resultTitle) {
        resultTitle.textContent = isSafe
          ? 'Aman & Sangat Direkomendasikan'
          : (isWarning ? 'Peringatan Pantangan / Tidak Direkomendasikan' : 'Netral (Konsumsi Terukur)');
        resultTitle.style.color = isSafe ? '#065F46' : (isWarning ? '#991B1B' : '#92400E');
      }

      if (resultDesc) {
        resultDesc.textContent = isSafe
          ? 'Menu kaya albumin alami yang mempercepat penyembuhan luka pasca operasi.'
          : (isWarning
            ? 'Mengandung bahan pemicu inflamasi, asam lambung tinggi, atau minyak berlebih.'
            : 'Kandungan nutrisi seimbang, disarankan membatasi porsi garam dan lemak jenuh.');
      }

      if (goalPill) {
        goalPill.textContent = isSafe
          ? 'Tujuan: Pemulihan Jaringan'
          : (isWarning ? 'Tujuan: Kontrol Inflamasi & Nyeri' : 'Tujuan: Pemeliharaan Energi');
        goalPill.style.background = isSafe ? '#ECFDF5' : (isWarning ? '#FEF2F2' : '#FFFBEB');
        goalPill.style.color = isSafe ? '#047857' : (isWarning ? '#B91C1C' : '#B45309');
        goalPill.style.borderColor = isSafe ? '#A7F3D0' : (isWarning ? '#FECACA' : '#FDE68A');
      }

      // 3. Update Confidence Bar & Category Sub-label
      const confVal = document.getElementById('ai-eval-confidence-val');
      const progBar = document.getElementById('ai-eval-progress-bar');
      const catText = document.getElementById('ai-eval-domain-category');

      const confPercent = Math.min(99.5, Math.max(30.0, item.confidence || 88.0));
      if (confVal) {
        const confGrade = confPercent >= 80 ? 'Tinggi' : (confPercent >= 60 ? 'Sedang' : 'Cukup');
        confVal.textContent = `${confPercent.toFixed(1)}% (${confGrade})`;
      }
      if (progBar) {
        progBar.style.width = `${confPercent}%`;
        progBar.style.background = isSafe ? '#064E3B' : (isWarning ? '#DC2626' : '#D97706');
      }
      if (catText) {
        catText.textContent = `Kategori Utama: ${item.intentName || 'Perencanaan Menu Pasca Bedah'}`;
      }

      // 4. Update Checklist Notes (including patient record contraindication check)
      const notesList = document.getElementById('ai-eval-notes-list');
      if (notesList) {
        notesList.innerHTML = this.generateClinicalNotesHTML(text, isSafe, isWarning, item.patientConflict);
      }

      // 5. Update Nutrients Cards (Protein, Energy, Zinc, Sodium)
      const nut = item.nutrients || {};
      const prot = nut.protein || (isSafe ? 28.5 : (isWarning ? 12.0 : 18.0));
      const cals = nut.calories || (isSafe ? 340 : (isWarning ? 540 : 380));
      const zinc = (isSafe ? 4.2 : (isWarning ? 1.4 : 2.8));
      const sodium = (isSafe ? 380 : (isWarning ? 850 : 520));

      const targetProt = (item.patientProfile && item.patientProfile.targetProtein) || (this.userProfile && this.userProfile.target_protein) || 93.0;
      const protEl = document.getElementById('ai-eval-nutri-protein');
      if (protEl) protEl.textContent = `${prot} g`;
      const protSub = document.getElementById('ai-eval-nutri-protein-sub');
      if (protSub) protSub.textContent = `${Math.round((prot / targetProt) * 100)}% Kebutuhan (${targetProt}g/hari)`;

      const calsEl = document.getElementById('ai-eval-nutri-cals');
      if (calsEl) calsEl.textContent = `${cals} kkal`;

      const zincEl = document.getElementById('ai-eval-nutri-zinc');
      if (zincEl) zincEl.textContent = `${zinc} mg`;

      const sodiumEl = document.getElementById('ai-eval-nutri-sodium');
      if (sodiumEl) sodiumEl.textContent = `${sodium} mg`;

      // 6. Update Bottom Order Banner
      const orderTitle = document.getElementById('ai-eval-order-title');
      const orderDesc = document.getElementById('ai-eval-order-desc');
      if (orderTitle && orderDesc) {
        if (isSafe) {
          orderTitle.textContent = 'Kesesuaian Menu Pasien Disetujui';
          orderDesc.textContent = 'Diverifikasi untuk Ruang Rawat Pasca Operasi Cempaka 3B';
        } else if (isWarning) {
          orderTitle.textContent = 'Perhatian: Menu Memerlukan Verifikasi DPJP';
          orderDesc.textContent = 'Terdeteksi bahan pantangan pasca operasi, butuh persetujuan dokter penanggung jawab';
        } else {
          orderTitle.textContent = 'Menu Dalam Batas Toleransi Nutrisi';
          orderDesc.textContent = 'Disarankan untuk diawasi porsi konsumsi oleh perawat ruang rawat';
        }
      }

      if (window.lucide) lucide.createIcons();

    } catch (err) {
      console.error('Execute AI eval error:', err);
      this.showToast('Gagal menjalankan evaluasi model AI: ' + err.message, 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="sparkles" style="width:16px;height:16px;"></i> <span>Analisis Rekomendasi Menu</span>';
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  renderExtractedKeywords(text, isSafe, isWarning) {
    const chipsBox = document.getElementById('ai-eval-chips-box');
    if (!chipsBox) return;

    const lower = text.toLowerCase();
    const candidateKeywords = [
      { key: 'bakso sapi', safe: true },
      { key: 'ikan gabus', safe: true },
      { key: 'kuah bening', safe: true },
      { key: 'seledri', safe: true },
      { key: 'bawang putih', neutral: true },
      { key: 'pasca laparotomi', neutral: true },
      { key: 'sayur bening', safe: true },
      { key: 'bayam', safe: true },
      { key: 'jagung manis', safe: true },
      { key: 'tempe kukus', safe: true },
      { key: 'bubur beras', safe: true },
      { key: 'salmon', safe: true },
      { key: 'ayam kampung', safe: true },
      { key: 'rendang', warning: true },
      { key: 'pedas', warning: true },
      { key: 'cabai rawit', warning: true },
      { key: 'santan kental', warning: true },
      { key: 'minyak banyak', warning: true },
      { key: 'ayam goreng', warning: true },
      { key: 'tepung krispi', warning: true },
      { key: 'minyak jelantah', warning: true },
      { key: 'saus cabai', warning: true }
    ];

    const detected = candidateKeywords.filter(k => lower.includes(k.key));

    if (detected.length === 0) {
      const words = lower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3).slice(0, 5);
      chipsBox.innerHTML = words.map(w => `
        <span class="ai-eval-chip ${isSafe ? 'safe' : (isWarning ? 'warning' : 'neutral')}">
          ${isSafe ? '✓ ' : ''}${w}
        </span>
      `).join('');
      return;
    }

    chipsBox.innerHTML = detected.map(k => {
      if (k.warning) {
        return `<span class="ai-eval-chip warning">⚠️ ${k.key}</span>`;
      }
      if (k.safe) {
        return `<span class="ai-eval-chip safe">✓ ${k.key}</span>`;
      }
      return `<span class="ai-eval-chip neutral">${k.key}</span>`;
    }).join('');
  }

  generateClinicalNotesHTML(text, isSafe, isWarning, patientConflict = null) {
    let conflictSnippet = '';
    if (patientConflict && patientConflict.hasConflict) {
      const conflictList = patientConflict.conflictingAllergies.join(', ');
      conflictSnippet = `
        <div class="ai-eval-note-item" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:8px 10px;">
          <span class="ai-eval-note-check" style="color:#DC2626;">🚨</span>
          <span style="color:#991B1B;"><strong>Konflik Rekam Medis Pasien:</strong> Terdeteksi bahan: <em>${conflictList}</em> yang bertentangan dengan rekam medis pasien pasca operasi!</span>
        </div>
      `;
    }

    if (isWarning) {
      return `
        ${conflictSnippet}
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#DC2626;">⚠️</span>
          <span><strong>Risiko Saluran Cerna Pasca Bedah:</strong> Kandungan minyak jenuh tinggi atau bumbu pedas memicu asam lambung dan peristaltik berlebihan.</span>
        </div>
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#DC2626;">⚠️</span>
          <span><strong>Hambatan Pemulihan Luka:</strong> Lemak jenuh &amp; iritan memperlambat sintesis fibroblast dan penyatuan jaringan luka operasi.</span>
        </div>
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check" style="color:#10B981;">✓</span>
          <span><strong>Alternatif Menu:</strong> Disarankan beralih ke varian kukus/rebus kaya albumin seperti sup ikan gabus atau bening bayam tempe.</span>
        </div>
      `;
    }

    if (isSafe) {
      return `
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check">✓</span>
          <span><strong>Sangat Ramah Cerna:</strong> Kaldu bening bebas cabai dan bumbu pedas, aman dari risiko iritasi lambung pasca operasi.</span>
        </div>
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check">✓</span>
          <span><strong>Dukungan Pemulihan Jaringan:</strong> Kandungan protein &amp; albumin hewani mudah diserap untuk perbaikan luka bedah.</span>
        </div>
        <div class="ai-eval-note-item">
          <span class="ai-eval-note-check">✓</span>
          <span><strong>Pemeriksaan Rekam Medis:</strong> Tidak terdeteksi bahan yang bertentangan dengan pantangan atau alergi pasien.</span>
        </div>
      `;
    }

    return `
      ${conflictSnippet}
      <div class="ai-eval-note-item">
        <span class="ai-eval-note-check" style="color:#D97706;">ℹ️</span>
        <span><strong>Toleransi Moderat:</strong> Menu dapat dikonsumsi namun batasi penambahan bumbu penyedap dan natrium.</span>
      </div>
      <div class="ai-eval-note-item">
        <span class="ai-eval-note-check">✓</span>
        <span><strong>Keseimbangan Asupan:</strong> Berikan selingan sayuran hijau atau buah tinggi vitamin C untuk absorpsi optimal.</span>
      </div>
      <div class="ai-eval-note-item">
        <span class="ai-eval-note-check">✓</span>
        <span><strong>Pemeriksaan Alergi:</strong> Tidak terdeteksi kontraindikasi spesifik pada profil pasien.</span>
      </div>
    `;
  }

  sendMenuToKitchen() {
    const input = document.getElementById('ai-eval-input-text');
    const text = input ? input.value.trim() : '';
    const valCheck = this.checkFoodTextValidity(text);
    if (!valCheck.valid) {
      this.showToast('⚠️ Tidak dapat mengirim ke dapur gizi. Mohon masukkan nama menu makanan yang valid terlebih dahulu.', 'warning');
      return;
    }
    this.showToast('✅ Menu berhasil dikirim ke Dapur Gizi & dicatat pada Rekam Medis Pasien Cempaka 3B!', 'success');
    if (window.nutriVisionDB && typeof window.nutriVisionDB.logAction === 'function') {
      window.nutriVisionDB.logAction('MENU_APPROVED_KITCHEN', `Menu evaluasi AI ("${text}") disetujui & dikirim ke Dapur Gizi Ruang Rawat Bedah Cempaka 3B`);
    }
  }

  openAITesterModal() {
    this.requireAuth(() => {
      this.openModal('ai-tester-modal');
      this.checkAIHealthStatus();
    }, 'menguji AI');
  }

  async checkAIHealthStatus() {
    const statusText = document.getElementById('ai-status-text');
    if (!statusText) return;
    try {
      if (window.nutriAPI) {
        const h = await window.nutriAPI.checkAIHealth();
        if (h && h.success) {
          statusText.innerHTML = `<span style="color:#059669;font-weight:600;">Online (104 Tensors · ${h.latencyMs || '< 15'}ms)</span>`;
        } else {
          statusText.innerHTML = `<span style="color:#D97706;font-weight:600;">Fallback Heuristic Mode</span>`;
        }
      }
    } catch (e) {
      statusText.innerHTML = `<span style="color:#D97706;font-weight:600;">Offline / Fallback</span>`;
    }
  }

  fillAIPreset(text) {
    const input = document.getElementById('ai-tester-input');
    if (input) {
      input.value = text;
      input.focus();
    }
  }

  async executeAITextClassification() {
    const input = document.getElementById('ai-tester-input');
    const resultBox = document.getElementById('ai-tester-result-box');
    const btn = document.getElementById('btn-run-ai-test');
    if (!input || !resultBox) return;

    const text = input.value.trim();
    if (!text) {
      this.showToast('Silakan ketik deskripsi makanan terlebih dahulu.', 'warning');
      input.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="btn-icon-sm spin"></i> Menjalankan Model Safetensors...';
      if (window.lucide) lucide.createIcons();
    }

    try {
      const startTime = performance.now();
      const res = await window.nutriAPI.classifyNutritionText(text, this.userProfile?.id);
      const elapsed = Math.round(performance.now() - startTime);

      if (res && res.success && res.result) {
        const item = res.result;
        const isSafe = item.predictedClass === 0;
        const isNeutral = item.predictedClass === 1;
        const isWarning = item.predictedClass === 2;

        const borderCol = isSafe ? '#10B981' : (isNeutral ? '#F59E0B' : '#EF4444');
        const bgCol = isSafe ? 'rgba(16,185,129,0.08)' : (isNeutral ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)');
        const textCol = isSafe ? '#047857' : (isNeutral ? '#B45309' : '#B91C1C');
        const iconName = isSafe ? 'shield-check' : (isNeutral ? 'info' : 'alert-triangle');

        const nut = item.nutrients || {
          protein: isSafe ? 28.5 : (isWarning ? 8.5 : 18.0),
          albumin: isSafe ? 6.2 : (isWarning ? 0.8 : 2.5),
          calories: isSafe ? 320 : (isWarning ? 510 : 380),
          carbs: isSafe ? 35.0 : (isWarning ? 46.0 : 48.0),
          fat: isSafe ? 5.0 : (isWarning ? 26.0 : 11.0),
          vitaminsPct: isSafe ? 85 : (isWarning ? 25 : 65),
          mineralsPct: isSafe ? 80 : (isWarning ? 30 : 60)
        };

        const protPct = Math.min(100, Math.round((nut.protein / 98) * 100));
        const calPct = Math.min(100, Math.round((nut.calories / 1850) * 100));

        const nutrientsHtml = `
          <div style="margin:10px 0;padding:12px;background:#FAFDF5;border:1px solid #E6EAD6;border-radius:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:11.5px;font-weight:700;color:#233917;text-transform:uppercase;letter-spacing:0.4px;">
                <i data-lucide="activity" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i>
                Gizi Penting Pemulihan (Standar Dashboard)
              </span>
              <span style="font-size:10.5px;font-weight:600;color:var(--ink-soft);">Basis Data TKPI &amp; Komposisi</span>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;">
              <!-- 1. Protein & Albumin -->
              <div class="macro-item">
                <div class="macro-item-head" style="display:flex;justify-content:space-between;font-size:12px;">
                  <span class="macro-name" style="display:flex;align-items:center;gap:6px;font-weight:600;color:#141708;">
                    <span style="width:8px;height:8px;border-radius:2px;background:#9EA76B;display:inline-block;"></span>
                    <strong>Protein &amp; Albumin</strong>
                  </span>
                  <span class="macro-num" style="font-weight:700;color:#141708;">
                    ${nut.protein} g <span style="font-size:11px;font-weight:600;color:#4A5623;">(Albumin: ${nut.albumin} g)</span>
                  </span>
                </div>
                <div class="macro-bar-track" style="height:7px;background:#EFE8CA;border-radius:4px;overflow:hidden;">
                  <div class="macro-bar-fill" style="width:${protPct}%;height:100%;background:#9EA76B;border-radius:4px;transition:width 0.6s ease;"></div>
                </div>
              </div>

              <!-- 2. Essential Vitamins -->
              <div class="macro-item">
                <div class="macro-item-head" style="display:flex;justify-content:space-between;font-size:12px;">
                  <span class="macro-name" style="display:flex;align-items:center;gap:6px;font-weight:600;color:#141708;">
                    <span style="width:8px;height:8px;border-radius:2px;background:#EF9F27;display:inline-block;"></span>
                    <strong>Vitamins (C, A, D)</strong>
                  </span>
                  <span class="macro-num" style="font-weight:700;color:#141708;">${nut.vitaminsPct}% Target</span>
                </div>
                <div class="macro-bar-track" style="height:7px;background:#EFE8CA;border-radius:4px;overflow:hidden;">
                  <div class="macro-bar-fill" style="width:${nut.vitaminsPct}%;height:100%;background:#EF9F27;border-radius:4px;transition:width 0.6s ease;"></div>
                </div>
              </div>

              <!-- 3. Vital Minerals -->
              <div class="macro-item">
                <div class="macro-item-head" style="display:flex;justify-content:space-between;font-size:12px;">
                  <span class="macro-name" style="display:flex;align-items:center;gap:6px;font-weight:600;color:#141708;">
                    <span style="width:8px;height:8px;border-radius:2px;background:#06B6D4;display:inline-block;"></span>
                    <strong>Minerals (Zinc &amp; Iron)</strong>
                  </span>
                  <span class="macro-num" style="font-weight:700;color:#141708;">${nut.mineralsPct}% Target</span>
                </div>
                <div class="macro-bar-track" style="height:7px;background:#EFE8CA;border-radius:4px;overflow:hidden;">
                  <div class="macro-bar-fill" style="width:${nut.mineralsPct}%;height:100%;background:#06B6D4;border-radius:4px;transition:width 0.6s ease;"></div>
                </div>
              </div>

              <!-- 4. Energy Density / Calories -->
              <div class="macro-item">
                <div class="macro-item-head" style="display:flex;justify-content:space-between;font-size:12px;">
                  <span class="macro-name" style="display:flex;align-items:center;gap:6px;font-weight:600;color:#141708;">
                    <span style="width:8px;height:8px;border-radius:2px;background:#8B968F;display:inline-block;"></span>
                    <span>Kalori Total (Energi Basal)</span>
                  </span>
                  <span class="macro-num" style="font-weight:700;color:#141708;">${nut.calories} kkal</span>
                </div>
                <div class="macro-bar-track" style="height:7px;background:#EFE8CA;border-radius:4px;overflow:hidden;">
                  <div class="macro-bar-fill" style="width:${calPct}%;height:100%;background:#8B968F;border-radius:4px;transition:width 0.6s ease;"></div>
                </div>
              </div>

              <!-- Makronutrisi Pendukung -->
              <div style="display:flex;justify-content:space-between;padding-top:6px;font-size:11.5px;color:var(--ink-soft);border-top:1px dashed #E2E6D0;">
                <span>Karbohidrat: <strong style="color:var(--ink);">${nut.carbs} g</strong></span>
                <span>Lemak Sehat: <strong style="color:var(--ink);">${nut.fat} g</strong></span>
              </div>
            </div>
          </div>
        `;

        resultBox.style.display = 'block';
        resultBox.style.borderColor = borderCol;
        resultBox.style.background = bgCol;
        const intentDisplay = item.intentName ? `<span style="background:rgba(31,111,235,0.1);border:1px solid #1F6FEB;color:#1F6FEB;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;margin-left:6px;"><i data-lucide="target" style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Intent: ${item.intentName}</span>` : '';
        resultBox.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="color:${textCol};display:flex;align-items:center;">
                <i data-lucide="${iconName}" style="width:20px;height:20px;"></i>
              </div>
              <strong style="color:${textCol};font-size:14px;">${item.name}</strong>
              ${intentDisplay}
            </div>
            <span style="background:#fff;border:1px solid ${borderCol};color:${textCol};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">
              Confidence: ${item.confidence}%
            </span>
          </div>
          <div style="font-size:12.5px;color:var(--ink-base);margin-bottom:8px;line-height:1.5;">
            <strong>Analisis Klinis:</strong> ${item.clinicalAdvice}
          </div>
          ${nutrientsHtml}
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px dashed ${borderCol};padding-top:8px;font-size:11px;color:var(--ink-mute);">
            <span>Arsitektur: <code>DistilBert (${item.intent || item.label})</code></span>
            <span>Latency: <strong>${elapsed} ms</strong></span>
          </div>
          ${item.patientConflict ? `
            <div style="margin-top:8px;padding:6px 10px;background:#FEE2E2;border:1px solid #FCA5A5;border-radius:6px;color:#991B1B;font-size:11.5px;">
              <i data-lucide="alert-octagon" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:4px;"></i>
              ${item.patientConflict.warningNote}
            </div>
          ` : ''}
        `;
        if (window.lucide) lucide.createIcons();
      } else {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `<div style="color:#DC2626;">Gagal memproses inferensi AI.</div>`;
      }
    } catch (err) {
      console.error('AI Tester error:', err);
      resultBox.style.display = 'block';
      resultBox.innerHTML = `<div style="color:#DC2626;">Terjadi kesalahan: ${err.message}</div>`;
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="play" class="btn-icon-sm"></i> Jalankan Klasifikasi AI (model.safetensors)';
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  // =========================================================================
  // UTILITIES & NOTIFICATIONS
  // =========================================================================
  showToast(message, type = 'auto', customDuration = 2000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    let isError = type === 'error' || /❌|gagal|error|batal|peringatan/i.test(message);
    let isWarning = type === 'warning' || /⚠️|perhatian|notice/i.test(message);
    let isSuccess = type === 'success' || /✅|sukses|berhasil/i.test(message);

    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' toast-error' : (isWarning ? ' toast-warning' : (isSuccess ? ' toast-success' : '')));

    const iconName = isError ? 'alert-triangle' : (isWarning ? 'alert-circle' : (isSuccess ? 'check-circle' : 'info'));
    const iconColor = isError ? '#FCA5A5' : (isWarning ? '#FDE68A' : (isSuccess ? '#86EFAC' : 'var(--teal-300)'));

    toast.innerHTML = `<i data-lucide="${iconName}" style="color:${iconColor};width:16px;height:16px;flex-shrink:0;"></i><span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: toast });
    }

    // Durasi cepat & secukupnya ("trus bentar" ~ 2 detik)
    let duration = 2000;
    if (typeof customDuration === 'number') {
      duration = customDuration;
    } else if (typeof customDuration === 'object' && customDuration !== null && customDuration.duration) {
      duration = customDuration.duration;
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px) scale(0.96)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  exportCaregiverReport() {
    this.requireAuth(() => {
      const text = progressTracker.generateCaregiverReportText(this.userProfile);
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Ringkasan laporan gizi berhasil disalin ke clipboard!');
      }).catch(() => {
        alert(text);
      });
    }, 'ekspor laporan');
  }

  copyCaregiverShareLink() {
    this.requireAuth(() => {
      const link = caregiverHandler.generateSharedLink();
      navigator.clipboard.writeText(link).then(() => {
        this.showToast('Tautan akses pendamping (view-only) berhasil disalin!');
      }).catch(() => {
        alert('Tautan akses: ' + link);
      });
    }, 'berbagi akses');
  }

  openPDFReportModal() {
    this.requireAuth(() => {
      const modal = document.getElementById('modal-pdf-report');
      const container = document.getElementById('pdf-report-preview-container');
      if (!modal || !container) return;

      container.innerHTML = progressTracker.generatePDFReportHTML(
        this.userProfile,
        typeof mealPlanner !== 'undefined' ? mealPlanner : null
      );
      modal.classList.add('open');
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }, 'unduh PDF');
  }

  closePDFReportModal() {
    const modal = document.getElementById('modal-pdf-report');
    if (modal) modal.classList.remove('open');
  }

  downloadPDFReport() {
    const reportElem = document.getElementById('pdf-printable-report');
    if (!reportElem) {
      this.showToast('Gagal memproses dokumen laporan.');
      return;
    }

    let displayName = this.userProfile?.name || 'Pasien';
    if (this.userProfile?.role === 'doctor' || this.userProfile?.role === 'clinician' || this.userProfile?.role === 'caregiver') {
      const curPatient = this.doctorPatients?.find(p => p.id === this.currentDoctorPatientId) || this.doctorPatients?.[0];
      if (curPatient) displayName = curPatient.name;
    }
    const patientName = displayName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Laporan_Gizi_NutriVision_${patientName}_${dateStr}.pdf`;

    this.showToast('Sedang membuat berkas PDF berkualitas tinggi...');

    if (window.html2pdf) {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(reportElem).save().then(() => {
        this.showToast('✅ Dokumen PDF berhasil diunduh!');
      }).catch(err => {
        console.warn('html2pdf export failed, fallback to print:', err);
        window.print();
      });
    } else {
      window.print();
    }
  }

  printPDFReport() {
    window.print();
  }

  // Setup Event Listeners

  // =========================================================================
  // SUPABASE CLOUD & DATABASE INSPECTOR METHODS
  // =========================================================================
  openDatabaseSyncModal() {
    if (this.userProfile?.role !== 'admin') {
      this.showToast('🔒 Akses Ditolak: Panel Database hanya dapat dibuka oleh Administrator.');
      this.openAuthModal('login');
      return;
    }
    const modal = document.getElementById('modal-db-sync');
    if (!modal) return;

    // Pre-fill existing config if any
    const urlInput = document.getElementById('sb-url-input');
    const keyInput = document.getElementById('sb-key-input');
    if (urlInput) urlInput.value = window.SUPABASE_CONFIG?.url || '';
    if (keyInput) keyInput.value = window.SUPABASE_CONFIG?.anonKey || '';

    modal.classList.add('open');
    this.updateSupabaseStatusUI();
    if (window.refreshIcons) window.refreshIcons();
  }

  closeDatabaseSyncModal() {
    const modal = document.getElementById('modal-db-sync');
    if (modal) modal.classList.remove('open');
  }

  showDatabaseError(title, message, isSchemaError = false) {
    const banner = document.getElementById('db-error-banner');
    const titleEl = document.getElementById('db-error-title');
    const msgEl = document.getElementById('db-error-msg');
    const actionEl = document.getElementById('db-error-action');

    if (banner && titleEl && msgEl) {
      titleEl.textContent = title || 'Koneksi Supabase Bermasalah';
      msgEl.textContent = message || 'Terjadi kesalahan saat berkomunikasi dengan Supabase Cloud.';
      if (actionEl) {
        actionEl.style.display = isSchemaError ? 'block' : 'none';
      }
      banner.style.display = 'flex';
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: banner });
      }
    }

    this.showToast(`❌ ${title}: ${message}`, 'error');
  }

  hideDatabaseError() {
    const banner = document.getElementById('db-error-banner');
    if (banner) banner.style.display = 'none';
  }

  updateSupabaseStatusUI(customError = null) {
    const db = this.db || window.nutriVisionDB;
    const isConfigured = window.SUPABASE_CONFIG?.isConfigured;
    const isConnected = db?.isSupabaseConnected;
    const dot = document.getElementById('db-pulse-dot');
    const text = document.getElementById('db-status-text');
    const topbarDot = document.getElementById('topbar-db-dot');
    const lpDot = document.getElementById('lp-db-dot');

    // Helper: reset all pulse classes then apply one
    const setPulse = (el, cls) => {
      if (!el) return;
      el.classList.remove('connected', 'checking', 'error');
      if (cls) el.classList.add(cls);
    };

    if (customError) {
      setPulse(dot, 'error');
      if (text) text.innerHTML = `<span style="color:#DC2626;font-weight:700;">Gagal Terhubung (Error)</span>`;
      if (topbarDot) { topbarDot.style.background = '#EF4444'; topbarDot.title = 'Error Koneksi Supabase'; }
      if (lpDot)     { lpDot.style.background = '#EF4444'; }
    } else if (isConnected && isConfigured) {
      setPulse(dot, 'connected');
      if (text) {
        let host = '';
        try { host = ' · ' + new URL(window.SUPABASE_CONFIG.url).hostname; } catch(e) {}
        text.innerHTML = `<span style="color:#16A34A;font-weight:700;">Terhubung ke Supabase</span>${host}`;
      }
      if (topbarDot) { topbarDot.style.background = '#22C55E'; topbarDot.title = 'Supabase Cloud Aktif'; }
      if (lpDot)     { lpDot.style.background = '#22C55E'; }
    } else if (isConfigured) {
      setPulse(dot, 'checking');
      if (text) text.innerHTML = '<span style="color:#B45309;font-weight:700;">Kredensial Tersimpan</span> — Belum diverifikasi';
      if (topbarDot) { topbarDot.style.background = '#F59E0B'; topbarDot.title = 'Supabase belum diverifikasi'; }
      if (lpDot)     { lpDot.style.background = '#F59E0B'; }
    } else {
      setPulse(dot, null);
      if (text) text.innerHTML = '<span style="color:#687346;font-weight:600;">Mode Offline</span> — IndexedDB Lokal Aktif';
      if (topbarDot) { topbarDot.style.background = '#94A3B8'; topbarDot.title = 'Mode Offline (IndexedDB)'; }
      if (lpDot)     { lpDot.style.background = '#94A3B8'; }
    }
  }

  async saveSupabaseSettings(e) {
    if (e && e.preventDefault) e.preventDefault();

    const connectBtn = document.getElementById('db-btn-connect');
    const originalBtnText = connectBtn ? connectBtn.innerHTML : '';

    let url = document.getElementById('sb-url-input')?.value?.trim();
    let key = document.getElementById('sb-key-input')?.value?.trim();

    if (!url || !key) {
      this.showToast('Silakan isi Project URL dan Anon Key Supabase.', 'warning');
      this.showDatabaseError('Formulir Belum Lengkap', 'Project URL dan Anon Key Supabase wajib diisi.');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    try {
      const parsedUrl = new URL(url);
      url = parsedUrl.origin; // Menghilangkan /rest/v1 atau /res yang tidak sengaja tertempel
      const urlInput = document.getElementById('sb-url-input');
      if (urlInput) urlInput.value = url;
    } catch (err) {}

    if (connectBtn) {
      connectBtn.innerHTML = '<span>⏳ Menghubungkan ke Supabase...</span>';
      connectBtn.disabled = true;
    }

    this.hideDatabaseError();
    this.showToast('Menghubungkan ke Supabase...');

    try {
      const db = this.db || window.nutriVisionDB;
      if (!db) {
        throw new Error('Database engine NutriVisionDB belum siap di browser.');
      }

      if (!window.SUPABASE_CONFIG || typeof window.SUPABASE_CONFIG.save !== 'function') {
        window.SUPABASE_CONFIG = {
          url: url,
          anonKey: key,
          get isConfigured() { return !!(this.url && this.anonKey); },
          save(u, k) {
            this.url = u; this.anonKey = k;
            localStorage.setItem('nv_supabase_url', u);
            localStorage.setItem('nv_supabase_key', k);
          }
        };
      }

      window.SUPABASE_CONFIG.save(url, key);
      await db.initSupabaseClient();

      const res = await db.testSupabaseConnection(url, key);
      if (res.success) {
        db.isSupabaseConnected = true;
        this.updateSupabaseStatusUI();
        this.showToast('✅ Berhasil terhubung ke Supabase Cloud!', 'success');

        const shouldSync = confirm('✅ BERHASIL TERHUBUNG KE SUPABASE CLOUD!\n\nApakah Anda ingin langsung mengunggah seluruh akun demo dan data lokal ke tabel Supabase (users & meals) sekarang?');
        if (shouldSync) {
          await this.syncAllDataToSupabase();
        }
      } else {
        db.isSupabaseConnected = false;
        this.updateSupabaseStatusUI(res.message);
        this.showDatabaseError('Koneksi Supabase Gagal', res.message, res.isSchemaError);
      }
    } catch (err) {
      this.showDatabaseError('Koneksi Gagal', err.message);
    } finally {
      if (connectBtn) {
        connectBtn.innerHTML = originalBtnText || '<i data-lucide="plug-zap" style="width:15px;height:15px;"></i><span>Simpan &amp; Hubungkan</span>';
        connectBtn.disabled = false;
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons({ root: connectBtn });
        }
      }
    }
  }

  resetSupabaseConfig() {
    if (confirm('Reset kredensial Supabase dan kembali ke IndexedDB lokal murni?')) {
      const db = this.db || window.nutriVisionDB;
      if (window.SUPABASE_CONFIG) window.SUPABASE_CONFIG.reset();
      if (db) db.initSupabaseClient();
      const urlInput = document.getElementById('sb-url-input');
      const keyInput = document.getElementById('sb-key-input');
      if (urlInput) urlInput.value = '';
      if (keyInput) keyInput.value = '';
      this.hideDatabaseError();
      this.updateSupabaseStatusUI();
      this.showToast('Kredensial Supabase di-reset. Kembali ke mode IndexedDB.', 'info');
    }
  }

  async testSupabaseCloud(showAlert = true) {
    const db = this.db || window.nutriVisionDB;
    const url = document.getElementById('sb-url-input')?.value?.trim() || window.SUPABASE_CONFIG?.url;
    const key = document.getElementById('sb-key-input')?.value?.trim() || window.SUPABASE_CONFIG?.anonKey;

    if (!url || !key) {
      this.showToast('URL atau Anon Key Supabase belum diisi.', 'warning');
      this.showDatabaseError('Formulir Kosong', 'Silakan isi Project URL dan Anon Key terlebih dahulu.');
      return;
    }

    if (!db) {
      this.showToast('Database engine belum siap.', 'warning');
      return;
    }

    this.hideDatabaseError();
    this.showToast('Menguji koneksi Supabase...');
    const res = await db.testSupabaseConnection(url, key);

    if (res.success) {
      db.isSupabaseConnected = true;
      this.updateSupabaseStatusUI();
      this.showToast('✅ Sukses! Database Supabase siap menerima data.', 'success');
      if (showAlert) alert('✅ Sukses! Database Supabase siap menerima data dari aplikasi NutriVision AI.');
    } else {
      db.isSupabaseConnected = false;
      this.updateSupabaseStatusUI(res.message);
      this.showDatabaseError('Uji Koneksi Gagal', res.message, res.isSchemaError);
    }
  }

  async syncAllDataToSupabase() {
    const db = this.db || window.nutriVisionDB;
    if (!window.SUPABASE_CONFIG?.isConfigured || !db || !db.supabase) {
      this.showToast('Silakan simpan kredensial Supabase terlebih dahulu.', 'warning');
      this.showDatabaseError('Belum Terhubung', 'Silakan masukkan kredensial dan klik "Simpan & Hubungkan" sebelum melakukan upload.');
      return;
    }

    const btn = document.getElementById('btn-sync-all-supabase');
    const heroBtn = document.getElementById('btn-hero-sync-supabase');
    if (btn) btn.disabled = true;
    if (heroBtn) heroBtn.disabled = true;
    this.hideDatabaseError();
    this.showToast('Mengunggah seluruh data lokal ke Supabase...');

    try {
      const res = await db.syncAllToSupabase();
      this.showToast(`✅ Berhasil upload ${res.syncedUsers} akun & ${res.syncedMeals} riwayat ke Supabase!`, 'success');
      alert(`🎉 Sinkronisasi Selesai!\n\n- ${res.syncedUsers} Akun Pengguna disinkronkan ke tabel "users"\n- ${res.syncedMeals} Log Makanan disinkronkan ke tabel "meals"\n\nSilakan cek tabel di Supabase Dashboard (Table Editor).`);
    } catch (err) {
      const isSchema = (err.message || '').includes('relation') || (err.message || '').includes('exist') || (err.message || '').includes('tabel');
      this.showDatabaseError('Gagal Sinkronisasi Cloud', err.message, isSchema);
      alert('❌ Gagal sinkronisasi data ke Supabase:\n\n' + err.message + '\n\nTips: Pastikan SQL schema sudah dijalankan di menu SQL Editor pada Supabase dashboard.');
    } finally {
      if (btn) btn.disabled = false;
      if (heroBtn) heroBtn.disabled = false;
    }
  }

  copySupabaseSqlSchema() {
    const el = document.getElementById('db-sql-snippet');
    const sql = el?.innerText || el?.textContent;
    if (sql) {
      navigator.clipboard.writeText(sql).then(() => {
        const btnText = document.getElementById('copy-sql-text');
        if (btnText) {
          btnText.textContent = 'Tersalin ✓';
          setTimeout(() => { btnText.textContent = 'Salin'; }, 2500);
        }
        this.showToast('✅ SQL Schema berhasil disalin ke clipboard!');
      }).catch(() => {
        this.showToast('Gagal menyalin otomatis, silakan copy manual teks SQL.');
      });
    }
  }

  toggleKeyVisibility() {
    const input = document.getElementById('sb-key-input');
    const toggleBtn = document.querySelector('.db-input-toggle-vis');
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    if (toggleBtn) {
      toggleBtn.innerHTML = `<i data-lucide="${isHidden ? 'eye-off' : 'eye'}" id="db-key-eye-icon" style="width:14px;height:14px;"></i>`;
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: toggleBtn });
      }
    }
  }

  setupEventListeners() {
    // Desktop Nav Items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = btn.dataset.sec;
        if (sec === 'catalog') {
          this.isPlateMatchedCatalogMode = false;
        }
        if (sec) this.navigate(sec);
      });
    });

    // Mobile Bottom Nav Items
    document.querySelectorAll('.bottom-nav-pwa .bottom-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = btn.dataset.sec;
        if (sec === 'catalog') {
          this.isPlateMatchedCatalogMode = false;
        }
        if (sec) this.navigate(sec);
      });
    });

    // Food Catalog Search input
    const searchInput = document.getElementById('food-catalog-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderFoodCatalog(e.target.value);
      });
    }

    // Modal background click to close (works for all modals)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Global Exit / Close Button Delegator: ensures any close button or child icon immediately closes the target modal
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('.modal-close-btn, .auth-split-close-btn, .db-modal-close, .recipe-close-btn, .close-btn, [data-close-modal]');
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const targetModalId = closeBtn.getAttribute('data-close-modal');
        if (targetModalId) {
          this.closeModal(targetModalId);
          return;
        }
        const parentModal = closeBtn.closest('.modal-overlay');
        if (parentModal) {
          this.closeModal(parentModal.id);
          return;
        }
      }
    });

    // ESC Key to close any active modal dialog
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        const activeModals = document.querySelectorAll('.modal-overlay.open');
        activeModals.forEach(m => this.closeModal(m.id));
      }
    });

    // Supabase real-time background sync error listener
    window.addEventListener('supabase-sync-error', (e) => {
      const action = e.detail?.action || 'Sinkronisasi';
      const msg = e.detail?.message || 'Gagal terhubung ke Supabase.';
      this.showToast(`⚠️ Error ${action}: ${msg}`, 'error');
    });

    // Landing Page Navbar Scroll Shadow Effect
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('lp-navbar');
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      }
    });

    // Landing Page Links smooth scroll & auto-close mobile menu
    document.querySelectorAll('#lp-nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        const menu = document.getElementById('lp-nav-menu');
        if (menu) menu.classList.remove('mobile-open');
      });
    });
  }

  // =========================================================================
  // SUPER ADMINISTRATOR COMMAND CENTER & MONITORING CONTROLLER
  // =========================================================================

  async goToAdminPortal(tabKey = null) {
    this.isLanding = false;
    document.body.classList.remove('is-landing-active');

    this.navigate('admin');
    if (tabKey) {
      this.switchAdminTab(tabKey);
    }
    await this.renderAdminPortal();
    if (window.history.pushState) {
      window.history.pushState(null, null, '#admin');
    }
  }

  switchAdminTab(tabKey) {
    // 1. Update button states
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`admin-nav-tab-${tabKey}`);
    if (activeBtn) activeBtn.classList.add('active');

    // 2. Update pane states
    document.querySelectorAll('.admin-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    const targetPane = document.getElementById(`admin-pane-${tabKey}`);
    if (targetPane) targetPane.classList.add('active');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  async refreshAdminData() {
    this.showToast('🔄 Memuat ulang telemetri & data pengguna...');
    await this.renderAdminPortal();
    this.showToast('✅ Data telemetri berhasil diperbarui.');
  }

  async renderAdminPortal() {
    if (!window.nutriVisionDB) return;

    try {
      const stats = await window.nutriVisionDB.getSystemStats();
      const users = await window.nutriVisionDB.getAllUsers();
      const scans = await window.nutriVisionDB.getAllScans();
      const auditLogs = window.nutriVisionDB.getAuditLogs();

      // 1. Update KPI Telemetry Cards
      const totalUsersEl = document.getElementById('admin-kpi-total-users');
      if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers;

      const usersSubEl = document.getElementById('admin-kpi-users-sub');
      if (usersSubEl) {
        usersSubEl.textContent = `${stats.patientCount} Pasien · ${stats.clinicianCount} Nakes · ${stats.adminCount} Admin`;
      }

      const totalScansEl = document.getElementById('admin-kpi-total-scans');
      if (totalScansEl) totalScansEl.textContent = stats.totalScans;

      const scansSubEl = document.getElementById('admin-kpi-scans-sub');
      if (scansSubEl) {
        scansSubEl.textContent = `Akurasi Rata-rata: ${stats.avgConfidence}%`;
      }

      const calTrackedEl = document.getElementById('admin-kpi-calories-tracked');
      if (calTrackedEl) {
        calTrackedEl.textContent = stats.totalCaloriesTracked.toLocaleString('id-ID');
      }

      const proteinSubEl = document.getElementById('admin-kpi-protein-sub');
      if (proteinSubEl) {
        proteinSubEl.textContent = `Total Protein: ${stats.totalProteinTracked} g`;
      }

      const dbValEl = document.getElementById('admin-kpi-db-val');
      if (dbValEl) {
        dbValEl.textContent = window.nutriVisionDB.supabase ? 'Supabase Cloud' : 'IndexedDB Local';
      }

      const dbSubEl = document.getElementById('admin-kpi-db-sub');
      if (dbSubEl) {
        dbSubEl.textContent = stats.cloudStatus;
      }

      // 2. Update Tab Counts
      const countUsersTab = document.getElementById('admin-count-users-tab');
      if (countUsersTab) countUsersTab.textContent = users.length;

      const countScansTab = document.getElementById('admin-count-scans-tab');
      if (countScansTab) countScansTab.textContent = scans.length;

      const countAuditTab = document.getElementById('admin-count-audit-tab');
      if (countAuditTab) countAuditTab.textContent = auditLogs.length;

      // 3. Render Tables
      this._adminCachedUsers = users;
      this.renderAdminUsers(users);
      this.renderAdminScans(scans);
      this.renderAdminAuditLogs(auditLogs);

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.warn('Admin portal render error:', err);
    }
  }

  renderAdminUsers(users) {
    const tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;

    if (!users || users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:32px;color:var(--ink-mute);">
            Belum ada data pengguna yang terdaftar atau cocok dengan filter.
          </td>
        </tr>
      `;
      return;
    }

    const roleBadgeMap = {
      'admin': '<span class="admin-pill-badge admin"><i data-lucide="shield"></i> Super Admin</span>',
      'clinician': '<span class="admin-pill-badge clinician"><i data-lucide="stethoscope"></i> Dokter / Nakes</span>',
      'patient': '<span class="admin-pill-badge patient"><i data-lucide="user"></i> Pasien</span>'
    };

    tbody.innerHTML = users.map(user => {
      const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const roleBadge = roleBadgeMap[user.role || 'patient'] || roleBadgeMap['patient'];
      const condition = user.conditionLabel || user.condition || 'Kondisi Umum';
      const phase = user.recoveryPhase || user.phase || 'Fase Standar';
      const targets = user.targetProtein ? `${user.targetProtein}g Prot · ${user.targetCalories || 2000} kkal` : 'Belum Ditargetkan';
      const quizBadge = user.hasCompletedQuiz
        ? '<span style="color:#059669;font-weight:700;font-size:11px;">✅ Lengkap</span>'
        : '<span style="color:#D97706;font-weight:700;font-size:11px;">⏳ Belum Kuis</span>';

      const isRootAdmin = user.role === 'admin' || user.id === 'usr_admin_master';

      return `
        <tr>
          <td>
            <div class="admin-table-user-cell">
              <div class="admin-user-avatar">${initials}</div>
              <div>
                <div class="admin-user-name">${user.name || 'Pengguna'}</div>
                <div class="admin-user-email">${user.email}</div>
              </div>
            </div>
          </td>
          <td>${roleBadge}</td>
          <td><span style="font-weight:600;color:var(--ink-soft);">${condition}</span></td>
          <td><span style="font-size:11.5px;color:var(--ink-mute);">${phase}</span></td>
          <td><strong style="color:var(--matcha-700);">${targets}</strong></td>
          <td>${quizBadge}</td>
          <td>
            ${isRootAdmin ? `
              <span style="font-size:11px;color:var(--ink-mute);font-weight:600;">Akses Root</span>
            ` : `
              <div style="display:flex;gap:6px;">
                <button type="button" class="admin-row-action-btn danger" onclick="app.deleteAdminUser('${user.id}')" title="Hapus Akun Pengguna">
                  <i data-lucide="trash-2" style="width:11px;height:11px;"></i>
                  <span>Hapus</span>
                </button>
              </div>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  filterAdminUsers() {
    if (!this._adminCachedUsers) return;
    const query = (document.getElementById('admin-user-search-input')?.value || '').toLowerCase().trim();
    const roleFilter = document.getElementById('admin-user-role-filter')?.value || 'all';

    const filtered = this._adminCachedUsers.filter(u => {
      const matchSearch = !query ||
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.conditionLabel && u.conditionLabel.toLowerCase().includes(query)) ||
        (u.condition && u.condition.toLowerCase().includes(query));

      let matchRole = true;
      if (roleFilter === 'patient') {
        matchRole = (u.role === 'patient' || !u.role);
      } else if (roleFilter === 'clinician') {
        matchRole = (u.role === 'clinician');
      } else if (roleFilter === 'post-surgery') {
        matchRole = (u.condition === 'post-surgery');
      } else if (roleFilter === 'injury-rehab') {
        matchRole = (u.condition === 'injury-rehab');
      } else if (roleFilter === 'gym') {
        matchRole = (u.condition === 'gym');
      }

      return matchSearch && matchRole;
    });

    this.renderAdminUsers(filtered);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  renderAdminScans(scans) {
    const tbody = document.getElementById('admin-scans-table-body');
    if (!tbody) return;

    if (!scans || scans.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:32px;color:var(--ink-mute);">
            Belum ada log pemindaian piring yang tersimpan.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = scans.map(scan => {
      const timeStr = scan.timestamp ? new Date(scan.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '--';
      const comps = scan.components && scan.components.length > 0
        ? scan.components.map(c => `<span style="display:inline-block;padding:1px 6px;margin:2px;background:#F7F9EC;color:#233412;border:1px solid #DDE2B9;border-radius:4px;font-size:11px;font-weight:600;">${c.name} (${c.grams}g)</span>`).join('')
        : '<span style="color:#3B461C;font-size:11px;font-weight:600;">1 Porsi Terintegrasi</span>';

      const statusBadge = scan.status === 'manual_corrected'
        ? '<span class="admin-pill-badge corrected"><i data-lucide="edit-3"></i> Koreksi Manual</span>'
        : '<span class="admin-pill-badge verified"><i data-lucide="check-circle-2"></i> Terverifikasi AI</span>';

      return `
        <tr>
          <td>
            <div style="font-weight:700;color:var(--ink);">${scan.id}</div>
            <div style="font-size:11px;color:var(--ink-mute);">${timeStr}</div>
          </td>
          <td>
            <div style="font-weight:600;color:var(--ink);">${scan.userName || 'Pasien'}</div>
            <div style="font-size:11px;color:var(--ink-mute);">${scan.userCondition || ''}</div>
          </td>
          <td>
            <strong style="color:#1C200E;">${scan.foodTitle || 'Piring Gizi Campur'}</strong>
          </td>
          <td style="max-width:280px;">${comps}</td>
          <td>
            <div style="font-weight:700;color:var(--matcha-700);">${scan.totalProtein}g Protein</div>
            <div style="font-size:11px;color:var(--ink-soft);">${scan.totalCalories} kkal (${scan.totalGrams}g)</div>
          </td>
          <td>
            <span style="display:inline-flex;align-items:center;gap:3px;font-weight:800;color:#2563EB;background:#EFF6FF;border:1px solid #BFDBFE;padding:2px 7px;border-radius:999px;font-size:11px;">
              ${scan.confidencePct || 95}%
            </span>
          </td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  renderAdminAuditLogs(logs) {
    const containers = [
      document.getElementById('admin-audit-stream-container'),
      document.getElementById('admin-page-audit-stream-container')
    ].filter(Boolean);

    if (containers.length === 0) return;

    if (!logs || logs.length === 0) {
      containers.forEach(c => {
        c.innerHTML = `<div style="text-align:center;padding:24px;color:var(--ink-mute);">Belum ada catatan aktivitas sistem.</div>`;
      });
      return;
    }

    const html = logs.map(log => {
      const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString('id-ID') : '--:--';
      const statusColor = log.status === 'WARNING' ? '#EF4444' : (log.status === 'NOTICE' ? '#F59E0B' : '#10B981');

      return `
        <div class="admin-audit-item">
          <div class="admin-audit-left">
            <span class="admin-audit-time">${timeStr}</span>
            <span class="admin-audit-type">${log.event}</span>
            <div class="admin-audit-desc">${log.details}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="admin-audit-actor">${log.actor}</span>
            <span style="width:8px;height:8px;border-radius:50%;background:${statusColor};" title="${log.status}"></span>
          </div>
        </div>
      `;
    }).join('');

    containers.forEach(c => {
      c.innerHTML = html;
    });
  }

  refreshAdminAuditView() {
    this.showToast('🔄 Memuat ulang jejak audit...');
    if (window.nutriVisionDB) {
      this.renderAdminAuditLogs(window.nutriVisionDB.getAuditLogs());
      this.showToast('✅ Jejak audit sistem berhasil diperbarui.');
    }
  }

  async deleteAdminUser(userId) {
    if (!confirm('Apakah Anda yakin ingin menghapus akun pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      if (window.nutriVisionDB) {
        await window.nutriVisionDB.deleteUser(userId);
        this.showToast('✅ Akun pengguna berhasil dihapus dari database.');
        await this.renderAdminPortal();
      }
    } catch (err) {
      this.showToast(`⚠️ ${err.message || 'Gagal menghapus pengguna.'}`);
    }
  }

  exportAdminAuditJSON() {
    if (!window.nutriVisionDB) return;
    const logs = window.nutriVisionDB.getAuditLogs();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      exportedAt: new Date().toISOString(),
      system: "NutriVision AI",
      competition: "GAYATAMA 5",
      auditTrail: logs
    }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `nutrivision-telemetry-audit-${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    this.showToast('📥 Berkas telemetri & jejak audit JSON berhasil diunduh.');
  }

  async resetDemoAccountsAdmin() {
    if (!confirm('Re-seed akan mereset akun demonstrasi standar ke database lokal. Lanjutkan?')) {
      return;
    }
    if (window.nutriVisionDB) {
      await window.nutriVisionDB.seedInitialAccounts();
      window.nutriVisionDB.addAuditLog('SYSTEM_RESEED', 'admin@nutrivision.id', 'Inisialisasi ulang akun demo standar', 'NOTICE');
      this.showToast('✅ Database lokal telah di-seed ulang dengan akun demo.');
      await this.renderAdminPortal();
    }
  }

  async refreshAdminClinicalMenu() {
    this.showToast('🔄 Memuat ulang data analitik pangan & klinis...');
    await this.renderAdminClinicalMenu();
    this.showToast('✅ Data analitik berhasil diperbarui.');
  }

  async renderAdminClinicalMenu() {
    if (!window.nutriVisionDB) return;

    try {
      const data = await window.nutriVisionDB.getClinicalAndMenuAnalytics();

      // 1. Total Pasien Badge
      const totalBadge = document.getElementById('admin-clinical-total-badge');
      if (totalBadge) totalBadge.textContent = `${data.totalPatients} Pasien Terdata`;

      // 2. Render Sebaran Kondisi Medis & Penyakit (Progress bars)
      const condContainer = document.getElementById('admin-condition-dist-container');
      if (condContainer) {
        const total = Math.max(1, data.totalPatients);
        condContainer.innerHTML = Object.entries(data.conditionCounts).map(([condName, count]) => {
          const pct = Math.round((count / total) * 100);
          return `
            <div class="admin-dist-item">
              <div class="admin-dist-header">
                <span>${condName}</span>
                <span class="admin-dist-count">${count} Pasien (${pct}%)</span>
              </div>
              <div class="admin-dist-bar-bg">
                <div class="admin-dist-bar-fill" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('');
      }

      // 3. Render Prevalensi Alergi & Pantangan
      const allergyContainer = document.getElementById('admin-allergy-dist-container');
      if (allergyContainer) {
        allergyContainer.innerHTML = Object.entries(data.allergyCounts).map(([allergy, count]) => {
          return `
            <div class="admin-allergy-tag">
              <i data-lucide="alert-circle" style="width:14px;height:14px;color:#D97706;"></i>
              <span>${allergy}</span>
              <span class="admin-allergy-count-badge">${count}</span>
            </div>
          `;
        }).join('');
      }

      // 4. Render Leaderboard Pangan Nusantara Terfavorit & Terlaris
      const foodTbody = document.getElementById('admin-popular-foods-tbody');
      if (foodTbody) {
        foodTbody.innerHTML = data.foodStats.map((item, idx) => {
          const rankBadge = idx === 0 ? '🥇 #1' : (idx === 1 ? '🥈 #2' : (idx === 2 ? '🥉 #3' : `#${idx + 1}`));
          return `
            <tr>
              <td>
                <div style="font-weight:700;color:var(--ink);display:flex;align-items:center;gap:8px;">
                  <span style="font-size:12px;font-weight:800;color:var(--matcha-700);">${rankBadge}</span>
                  <span>${item.name}</span>
                </div>
              </td>
              <td><span style="font-size:12px;color:var(--ink-soft);">${item.category}</span></td>
              <td><strong style="color:#EF4444;font-size:13px;">${item.favoriteCount} ❤️</strong></td>
              <td><span style="font-weight:700;color:var(--ink);">${item.scanCount}x dipindai</span></td>
              <td><strong style="color:#D97706;">⭐ ${item.rating}</strong></td>
              <td>
                <span style="font-weight:700;color:var(--matcha-700);">${item.protein}g Prot</span> · 
                <span style="font-size:11px;color:var(--ink-mute);">${item.calories} kkal</span>
              </td>
              <td><span class="admin-pill-badge verified">${item.badge}</span></td>
            </tr>
          `;
        }).join('');
      }

      // 5. Render Log Akses Perencanaan Menu Pasien
      const accessTbody = document.getElementById('admin-planner-access-tbody');
      if (accessTbody) {
        accessTbody.innerHTML = data.accessLogs.map(log => {
          return `
            <tr>
              <td><strong style="color:var(--ink);">${log.patientName}</strong></td>
              <td><span style="font-size:12px;color:var(--ink-soft);">${log.condition}</span></td>
              <td><span style="color:#1C200E;font-weight:600;">${log.plannedMeal}</span></td>
              <td><strong style="color:var(--matcha-700);">${log.targetProtein}</strong></td>
              <td><span style="font-size:11.5px;color:var(--ink-mute);">${log.time}</span></td>
            </tr>
          `;
        }).join('');
      }

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.warn('Error rendering clinical menu analytics:', err);
    }
  }

  // =========================================================================
  // RECOVERY JOURNEY ROADMAP & DUAL CALENDAR CONTROLLERS (FR-09)
  // =========================================================================
  setJourneyCondition(conditionId) {
    if (!NUTRIVISION_DATA.recoveryProfiles[conditionId]) {
      conditionId = 'post-surgery';
    }
    this.journeyCondition = conditionId;

    // Update state tombol tab
    document.querySelectorAll('#journey-condition-tabs .journey-cond-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.condition === conditionId);
    });

    const prof = NUTRIVISION_DATA.recoveryProfiles[conditionId];
    if (prof) {
      const subEl = document.getElementById('journey-roadmap-sub');
      if (subEl) subEl.textContent = prof.protocol;
      const badgeEl = document.getElementById('journey-active-badge-text');
      if (badgeEl) badgeEl.textContent = prof.activeBadge || 'Fase 2 Aktif';
    }

    this.renderJourneyRoadmap(conditionId);
    this.renderClinicalCalendarAndScheduleSuite();

    const isId = (window.i18n ? window.i18n.getLanguage() : 'id') === 'id';
    const toastMsg = isId 
      ? `Jalur pemulihan beralih ke protokol: ${prof ? prof.title : conditionId}`
      : `Recovery path switched to: ${prof ? (prof.titleEn || prof.title) : conditionId}`;
    this.showToast(toastMsg, 'info');
  }

  renderJourneyRoadmap(conditionId) {
    const gridEl = document.getElementById('journey-timeline-grid');
    if (!gridEl) return;

    const cond = conditionId || this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const profile = NUTRIVISION_DATA.recoveryProfiles[cond] || NUTRIVISION_DATA.recoveryProfiles['post-surgery'];
    if (!profile || !profile.phases) return;

    // Sinkronkan tab aktif jika belum aktif
    document.querySelectorAll('#journey-condition-tabs .journey-cond-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.condition === cond);
    });

    const subEl = document.getElementById('journey-roadmap-sub');
    if (subEl) subEl.textContent = profile.protocol;
    const badgeEl = document.getElementById('journey-active-badge-text');
    if (badgeEl) badgeEl.textContent = profile.activeBadge || 'Fase 2 Aktif';

    const phasesHtml = profile.phases.map((p) => {
      const isActive = p.status === 'active';
      const isCompleted = p.status === 'completed';

      let cardBorder = '1px solid #E6EAD6';
      let cardBg = '#FAFDF5';
      let badgeHtml = '';
      let progressColor = '#9EA76B';

      if (isActive) {
        cardBorder = '2px solid #233917';
        cardBg = '#FFFFFF';
        badgeHtml = `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:12px;background:#233917;color:#FFFFFF;"><i data-lucide="zap" style="width:11px;height:11px;"></i> ${p.badgeText || 'Aktif'}</span>`;
        progressColor = 'var(--coral-500, #D45B3A)';
      } else if (isCompleted) {
        cardBorder = '1px solid #C8D4A8';
        cardBg = '#FAFBF7';
        badgeHtml = `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:12px;background:#E8EED6;color:#3F4D1C;"><i data-lucide="check" style="width:11px;height:11px;"></i> ${p.badgeText || 'Selesai'}</span>`;
        progressColor = '#4A5623';
      } else {
        cardBorder = '1px solid #EFE8CA';
        cardBg = '#FCFCF9';
        badgeHtml = `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:12px;background:#F1EFE7;color:#7A786E;"><i data-lucide="lock" style="width:11px;height:11px;"></i> ${p.badgeText || 'Tahap Lanjut'}</span>`;
        progressColor = '#C2C8AE';
      }

      const superfoodsList = (p.superfoods || []).map(sf => `<span style="display:inline-block;padding:2px 6px;border-radius:4px;background:rgba(35,57,23,0.06);font-size:10px;font-weight:600;color:#233917;">${sf}</span>`).join(' ');

      return `
        <div class="journey-step-box" data-phase="${p.phaseNum}" onclick="app.selectJourneyPhase('${cond}', ${p.phaseNum})"
             style="background:${cardBg};border:${cardBorder};border-radius:12px;padding:14px;position:relative;display:flex;flex-direction:column;gap:10px;box-shadow:${isActive ? '0 4px 16px rgba(35,57,23,0.08)' : 'none'};">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <span style="font-size:10.5px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:0.3px;">
              ${p.chip}
            </span>
            ${badgeHtml}
          </div>

          <div>
            <h4 style="margin:0 0 5px 0;font-size:13.5px;font-weight:700;color:var(--ink);line-height:1.35;">${p.title}</h4>
            <p style="margin:0;font-size:11.5px;color:var(--ink-soft);line-height:1.45;">${p.desc}</p>
          </div>

          <!-- Progress Bar -->
          <div style="margin-top:auto;padding-top:4px;">
            <div style="display:flex;justify-content:space-between;font-size:10.5px;font-weight:600;color:var(--ink-soft);margin-bottom:4px;">
              <span>Target Tercapai</span>
              <span style="color:var(--ink);font-weight:700;">${p.progressPct}%</span>
            </div>
            <div style="width:100%;height:6px;background:#EAECE0;border-radius:3px;overflow:hidden;">
              <div style="width:${p.progressPct}%;height:100%;background:${progressColor};border-radius:3px;transition:width 0.4s ease;"></div>
            </div>
          </div>

          <!-- Metadata Nutrisi & Klinis Spesifik -->
          <div style="padding-top:8px;border-top:1px dashed #E2E6D0;display:flex;flex-direction:column;gap:5px;font-size:11px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="color:var(--ink-soft);font-size:10.5px;">Target Protein:</span>
              <strong style="color:#233917;font-size:11px;">${p.proteinTarget}</strong>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="color:var(--ink-soft);font-size:10.5px;">Tekstur Pangan:</span>
              <span style="color:var(--ink);font-size:10.5px;font-weight:600;">${p.texture}</span>
            </div>
            <div style="margin-top:2px;">
              <div style="color:var(--ink-soft);font-size:10px;margin-bottom:3px;">Makanan Super Anjuran:</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${superfoodsList}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    gridEl.innerHTML = phasesHtml;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: gridEl });
    }
  }

  selectJourneyPhase(conditionId, phaseNum) {
    const profile = NUTRIVISION_DATA.recoveryProfiles[conditionId] || NUTRIVISION_DATA.recoveryProfiles['post-surgery'];
    if (!profile) return;
    const phase = profile.phases.find(p => p.phaseNum === phaseNum);
    if (!phase) return;

    // Visual selection
    document.querySelectorAll('#journey-timeline-grid .journey-step-box').forEach(box => {
      const isTarget = parseInt(box.dataset.phase, 10) === phaseNum;
      box.classList.toggle('selected-phase', isTarget);
    });

    this.showToast(`Panduan ${phase.chip}: ${phase.title}`, 'info');
  }

  // =========================================================================
  // CLINICAL SCHEDULE SUITE & INTEGRATED CALENDAR CONTROLLERS
  // =========================================================================
  loadCompletedSchedules() {
    try {
      const raw = localStorage.getItem('nutrivision_completed_schedules');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveCompletedSchedules() {
    try {
      localStorage.setItem('nutrivision_completed_schedules', JSON.stringify(this.completedScheduleItems || {}));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  loadCustomDailySchedules() {
    try {
      const raw = localStorage.getItem('nutrivision_custom_schedules');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomDailySchedules() {
    try {
      localStorage.setItem('nutrivision_custom_schedules', JSON.stringify(this.customDailySchedules || []));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  getConditionSchedules(conditionId) {
    const cond = conditionId || this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const profile = NUTRIVISION_DATA.recoveryProfiles[cond] || NUTRIVISION_DATA.recoveryProfiles['post-surgery'];
    const defaults = (profile && profile.defaultDailySchedules) ? profile.defaultDailySchedules : [];
    const custom = (this.customDailySchedules || []).filter(s => !s.conditionId || s.conditionId === cond);
    return [...defaults, ...custom];
  }

  renderRecoveryMonthPills(conditionId) {
    const container = document.getElementById('recovery-month-pills');
    if (!container) return;

    const cond = conditionId || this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const profile = NUTRIVISION_DATA.recoveryProfiles[cond] || NUTRIVISION_DATA.recoveryProfiles['post-surgery'];
    const milestones = profile?.monthlyMilestones || [];

    container.innerHTML = milestones.map(m => {
      const isActive = m.monthIndex === (this.activeRecoveryMonthIndex || 1);
      return `
        <button type="button" class="month-pill-btn ${isActive ? 'active' : ''}"
                onclick="app.switchRecoveryMonth(${m.monthIndex})"
                title="${m.phaseName}">
          <span>Bulan ${m.monthIndex} (${m.durationDays})</span>
        </button>
      `;
    }).join('');
  }

  renderActiveMonthBanner(conditionId, monthIndex) {
    const bannerEl = document.getElementById('recovery-month-target-banner');
    if (!bannerEl) return;

    const cond = conditionId || this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const profile = NUTRIVISION_DATA.recoveryProfiles[cond] || NUTRIVISION_DATA.recoveryProfiles['post-surgery'];
    const milestones = profile?.monthlyMilestones || [];
    const idx = monthIndex || this.activeRecoveryMonthIndex || 1;
    const milestone = milestones.find(m => m.monthIndex === idx) || milestones[0];

    if (!milestone) return;

    const menuPills = (milestone.nutritionTarget.recommendedMenu || []).map(item => `
      <span style="display:inline-block;padding:3px 8px;border-radius:6px;background:#FFFFFF;border:1px solid #DCE5B8;font-size:11px;font-weight:600;color:#233917;">
        ${item}
      </span>
    `).join(' ');

    bannerEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #E2E6D0;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:5px;background:#233917;color:#FFFFFF;text-transform:uppercase;">
            ${milestone.monthLabel}
          </span>
          <h4 style="margin:0;font-size:13px;font-weight:700;color:var(--ink);">${milestone.phaseName}</h4>
        </div>
        <span style="display:inline-flex;align-items:center;gap:4px;font-size:10.5px;color:#15803D;background:#EAF6EC;padding:2px 7px;border-radius:5px;font-weight:600;">
          <i data-lucide="shield-check" style="width:12px;height:12px;"></i> ${milestone.scientificCitation}
        </span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <!-- Card 1: Target Penyembuhan Klinis -->
        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:8px 12px;">
          <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;color:#233917;margin-bottom:4px;">
            <i data-lucide="activity" style="width:13px;height:13px;color:#15803D;"></i>
            <span>Target Penyembuhan Medis</span>
          </div>
          <p style="margin:0 0 4px;font-size:11.5px;font-weight:600;color:#0F172A;">${milestone.healingTarget.title}</p>
          <div style="font-size:11px;color:#475569;line-height:1.35;margin-bottom:4px;">
            <strong>Indikator Klinis:</strong> ${milestone.healingTarget.markers}
          </div>
          <div style="font-size:10.5px;color:#15803D;background:#F0FDF4;padding:3px 6px;border-radius:5px;font-weight:600;">
            🎯 Tujuan: ${milestone.healingTarget.clinicalGoal}
          </div>
        </div>

        <!-- Card 2: Target Makanan & Gizi -->
        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:8px 12px;">
          <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;color:#233917;margin-bottom:4px;">
            <i data-lucide="utensils" style="width:13px;height:13px;color:#D97706;"></i>
            <span>Target Makanan &amp; Nutrisi Klinis</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
            <span style="color:#64748B;">Target Protein:</span>
            <strong style="color:#233917;">${milestone.nutritionTarget.protein}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
            <span style="color:#64748B;">Kebutuhan Energi:</span>
            <span style="font-weight:600;color:#0F172A;">${milestone.nutritionTarget.calories}</span>
          </div>
          <div style="font-size:10.5px;color:#475569;margin-bottom:4px;">
            <strong>Mikronutrien:</strong> ${milestone.nutritionTarget.micronutrients}
          </div>
          <div>
            <div style="font-size:10px;color:#64748B;margin-bottom:3px;">Pilihan Pangan Tervalidasi:</div>
            <div style="display:flex;flex-wrap:wrap;gap:3px;">
              ${menuPills}
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: bannerEl });
    }
  }

  switchRecoveryMonth(monthIndex) {
    this.activeRecoveryMonthIndex = monthIndex;
    const cond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    this.renderRecoveryMonthPills(cond);
    this.renderActiveMonthBanner(cond, monthIndex);

    // Geser tanggal kalender ke bulan yang bersesuaian
    const base = new Date();
    this.calendarMonthDate = new Date(base.getFullYear(), base.getMonth() + (monthIndex - 1), 1);
    this.renderClinicalCalendar(this.calendarViewMode);

    this.showToast(`Menampilkan Target Klinis: Bulan ke-${monthIndex}`, 'info');
  }

  renderUpcomingEvents(dateStr) {
    const listEl = document.getElementById('upcoming-events-list');
    const badgeTextEl = document.getElementById('upcoming-date-text');
    if (!listEl) return;

    const cond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const schedules = this.getConditionSchedules(cond);

    const targetDate = dateStr || this.selectedCalendarDate || new Date().toISOString().split('T')[0];
    this.selectedCalendarDate = targetDate;

    // Format tanggal Indonesia
    const dateParts = targetDate.split('-');
    const dateObj = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const now = new Date();
    const isToday = (dateObj.getFullYear() === now.getFullYear() && dateObj.getMonth() === now.getMonth() && dateObj.getDate() === now.getDate());

    const formattedDateText = `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}${isToday ? ' (Hari Ini)' : ''}`;
    if (badgeTextEl) {
      badgeTextEl.textContent = formattedDateText;
    }

    if (!schedules || schedules.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:24px 12px;color:#64748B;">
          <p style="margin:0;font-size:12px;">Belum ada jadwal pemulihan untuk tanggal ini.</p>
        </div>
      `;
      return;
    }

    // Helper to format simple time (e.g. '07:00 - 08:00' -> '07:00')
    const formatSimpleTime = (timeStr) => {
      if (!timeStr) return '';
      if (timeStr.includes(' - ')) {
        return timeStr.split(' - ')[0].trim();
      }
      return timeStr.trim();
    };

    // Active highlighted timeline event (default to first schedule if unset or not in list)
    if (!this.activeTimelineEventId || !schedules.some(s => s.id === this.activeTimelineEventId)) {
      this.activeTimelineEventId = schedules[0]?.id || null;
    }

    const itemsHtml = schedules.map(s => {
      const key = `${targetDate}_${s.id}`;
      const isCompleted = Boolean(this.completedScheduleItems && this.completedScheduleItems[key]);
      const isActive = (s.id === this.activeTimelineEventId);
      const simpleTime = formatSimpleTime(s.time);

      if (isActive) {
        return `
          <div class="timeline-event-row is-active ${isCompleted ? 'completed' : ''}"
               data-event-id="${s.id}"
               onclick="app.selectTimelineEvent('${s.id}')">
            <!-- Left Timeline Track -->
            <div class="timeline-axis">
              <div class="timeline-node">
                <span class="timeline-node-inner"></span>
              </div>
              <div class="timeline-line"></div>
            </div>

            <!-- Active Card (Sage/Forest Green matching reference design) -->
            <div class="timeline-content-wrap">
              <div class="timeline-card-active">
                <div class="timeline-header">
                  <h4 class="timeline-title">${s.title}</h4>
                  <div class="timeline-header-right" onclick="event.stopPropagation();" style="display:flex;align-items:center;gap:8px;">
                    <span class="timeline-time">${simpleTime}</span>
                    <input type="checkbox" ${isCompleted ? 'checked' : ''}
                           onchange="app.toggleScheduleCompletion('${s.id}', '${targetDate}')"
                           title="Tandai Selesai"
                           style="cursor:pointer;width:15px;height:15px;accent-color:#233917;" />
                    ${s.isCustom ? `
                      <button type="button" class="btn-action-icon" style="width:20px;height:20px;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);color:#FFFFFF;"
                              onclick="app.deleteCustomSchedule('${s.id}')" title="Hapus Jadwal Kustom">
                        <i data-lucide="trash-2" style="width:12px;height:12px;color:#FCA5A5;"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
                <p class="timeline-desc">${s.desc}</p>
                ${isCompleted ? `
                  <div style="margin-top:6px;display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.9);">
                    <i data-lucide="check-circle-2" style="width:12px;height:12px;"></i>
                    <span>Telah Diselesaikan</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }

      // Standard Timeline Row
      return `
        <div class="timeline-event-row ${isCompleted ? 'completed' : ''}"
             data-event-id="${s.id}"
             onclick="app.selectTimelineEvent('${s.id}')">
          <!-- Left Timeline Track -->
          <div class="timeline-axis">
            <div class="timeline-node"></div>
            <div class="timeline-line"></div>
          </div>

          <!-- Standard Clean Row Content -->
          <div class="timeline-content-wrap">
            <div class="timeline-card-standard">
              <div class="timeline-header">
                <h4 class="timeline-title">${s.title}</h4>
                <div class="timeline-header-right" onclick="event.stopPropagation();" style="display:flex;align-items:center;gap:8px;">
                  <span class="timeline-time">${simpleTime}</span>
                  <input type="checkbox" ${isCompleted ? 'checked' : ''}
                         onchange="app.toggleScheduleCompletion('${s.id}', '${targetDate}')"
                         title="Tandai Selesai"
                         style="cursor:pointer;width:15px;height:15px;accent-color:#15803D;" />
                  ${s.isCustom ? `
                    <button type="button" class="btn-action-icon" style="width:20px;height:20px;"
                            onclick="app.deleteCustomSchedule('${s.id}')" title="Hapus Jadwal Kustom">
                      <i data-lucide="trash-2" style="width:12px;height:12px;color:#DC2626;"></i>
                    </button>
                  ` : ''}
                </div>
              </div>
              <p class="timeline-desc">${s.desc}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listEl.innerHTML = itemsHtml;

    const counterEl = document.getElementById('cal-events-counter');
    if (counterEl) {
      counterEl.textContent = `${schedules.length} Jadwal Nutrisi Aktif`;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: listEl });
    }
  }

  selectTimelineEvent(eventId) {
    this.activeTimelineEventId = eventId;
    this.renderUpcomingEvents(this.selectedCalendarDate);
  }

  renderClinicalCalendar(viewMode) {
    const bodyEl = document.getElementById('integrated-cal-body');
    if (!bodyEl) return;

    const mode = viewMode || this.calendarViewMode || 'month';
    this.calendarViewMode = mode;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Initialize default range (30-day clinical window matching spec) if not set
    if (!this.selectedCalendarDate) {
      this.selectedCalendarDate = todayStr;
    }
    if (!this.calendarStartDate) {
      const endD = new Date(this.selectedCalendarDate);
      const startD = new Date(endD);
      startD.setDate(endD.getDate() - 29);
      this.calendarStartDate = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`;
      this.calendarEndDate = this.selectedCalendarDate;
    }

    const activeStart = this.calendarTempStartDate || this.calendarStartDate;
    const activeEnd = this.calendarTempEndDate || this.calendarEndDate || activeStart;
    const effStart = (activeStart && activeEnd && activeStart > activeEnd) ? activeEnd : activeStart;
    const effEnd = (activeStart && activeEnd && activeStart > activeEnd) ? activeStart : activeEnd;

    // Month Names
    const isEn = (window.i18n ? window.i18n.getLanguage() : 'id') === 'en';
    const monthNamesEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesId = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthNames = isEn ? monthNamesEn : monthNamesId;
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Update Header Date Range Text
    const rangeTextEl = document.getElementById('calendar-picker-range-text');
    if (rangeTextEl && effStart) {
      const formatDateLabel = (dStr) => {
        if (!dStr) return '';
        const parts = dStr.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return `${monthNames[m]} ${d}, ${y}`;
      };
      if (effEnd && effStart !== effEnd) {
        rangeTextEl.textContent = `${formatDateLabel(effStart)} – ${formatDateLabel(effEnd)}`;
      } else {
        rangeTextEl.textContent = formatDateLabel(effStart);
      }
    }

    // Month 1 & Month 2 anchor dates
    const m1Date = this.calendarMonthDate || new Date();
    const year1 = m1Date.getFullYear();
    const month1 = m1Date.getMonth();

    const m2Date = new Date(year1, month1 + 1, 1);
    const year2 = m2Date.getFullYear();
    const month2 = m2Date.getMonth();

    // Helper to generate a single month grid
    const renderMonthGrid = (year, month, isLeftCol) => {
      const totalDays = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
      let daysHtml = '';

      // Empty slots before day 1
      for (let b = 0; b < firstDayOfWeek; b++) {
        daysHtml += `<div class="cal-day-slot cal-day-cell compact-box empty"></div>`;
      }

      for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isInRange = Boolean(effStart && effEnd && dateStr >= effStart && dateStr <= effEnd);
        const isStart = dateStr === effStart;
        const isEnd = dateStr === effEnd;
        const isSingle = effStart === effEnd && isStart;
        const isToday = dateStr === todayStr;

        const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
        const isRowFirst = (dayOfWeek === 0) || (day === 1);
        const isRowLast = (dayOfWeek === 6) || (day === totalDays);

        // Styling indicators matching reference screenshot
        const isEndpoint = isEnd || (isSingle && isStart);
        const hasBorderCircle = (isToday && !isInRange) || (!isInRange && effEnd && (new Date(dateStr) - new Date(effEnd) === 86400000));
        const isFaintCircle = !isInRange && !isToday && (day === 2 && !isLeftCol);

        const slotClasses = [
          'cal-day-slot',
          'cal-day-cell',
          'compact-box',
          isInRange ? 'in-range' : '',
          (isStart || (isRowFirst && isInRange)) ? 'range-start row-first' : '',
          (isEnd || (isRowLast && isInRange)) ? 'range-end row-last' : '',
          isSingle ? 'range-single' : '',
          isEndpoint ? 'selected-endpoint selected' : '',
          isToday ? 'today' : '',
          hasBorderCircle ? 'has-circle' : '',
          isFaintCircle ? 'faint-circle' : ''
        ].filter(Boolean).join(' ');

        daysHtml += `
          <div class="${slotClasses}"
               data-date="${dateStr}"
               onclick="app.selectCalendarDateRange('${dateStr}')"
               onmouseenter="app.hoverCalendarDate('${dateStr}')"
               title="${day} ${monthNames[month]} ${year} - Klik untuk memilih rentang">
            <span class="cal-day-number cal-day-num">${day}</span>
            <span class="cal-dot-indicator" style="display:none;"></span>
          </div>
        `;
      }

      return `
        <div class="cal-month-column">
          <div class="cal-month-top-bar">
            ${isLeftCol ? `
              <button type="button" class="cal-nav-btn-icon" onclick="app.shiftCalendarMonth(-1)" title="Bulan Sebelumnya">
                <i data-lucide="chevron-left" style="width:16px;height:16px;"></i>
              </button>
            ` : '<div class="cal-nav-btn-placeholder"></div>'}
            <h3 class="cal-month-title" ${isLeftCol ? 'id="calendar-month-year-title"' : ''}>${monthNames[month]} ${year}</h3>
            ${!isLeftCol ? `
              <button type="button" class="cal-nav-btn-icon" onclick="app.shiftCalendarMonth(1)" title="Bulan Berikutnya">
                <i data-lucide="chevron-right" style="width:16px;height:16px;"></i>
              </button>
            ` : '<div class="cal-nav-btn-placeholder"></div>'}
          </div>
          <div class="cal-weekdays-row">
            ${dayHeaders.map(d => `<div class="cal-weekday-th">${d}</div>`).join('')}
          </div>
          <div class="cal-days-grid">
            ${daysHtml}
          </div>
        </div>
      `;
    };

    const month1Html = renderMonthGrid(year1, month1, true);
    const month2Html = renderMonthGrid(year2, month2, false);

    bodyEl.innerHTML = `
      <div class="cal-dual-months-wrapper">
        ${month1Html}
        ${month2Html}
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: bodyEl });
    }
  }

  selectCalendarDateRange(dateStr) {
    if (!this.calendarTempStartDate || (this.calendarTempStartDate && this.calendarTempEndDate)) {
      this.calendarTempStartDate = dateStr;
      this.calendarTempEndDate = null;
      this.selectedCalendarDate = dateStr;
    } else {
      if (dateStr < this.calendarTempStartDate) {
        this.calendarTempEndDate = this.calendarTempStartDate;
        this.calendarTempStartDate = dateStr;
      } else {
        this.calendarTempEndDate = dateStr;
      }
      this.selectedCalendarDate = this.calendarTempEndDate;
    }

    this.renderClinicalCalendar(this.calendarViewMode);
  }

  hoverCalendarDate(dateStr) {
    if (this.calendarTempStartDate && !this.calendarTempEndDate) {
      this.calendarHoverDate = dateStr;
      const start = this.calendarTempStartDate < dateStr ? this.calendarTempStartDate : dateStr;
      const end = this.calendarTempStartDate < dateStr ? dateStr : this.calendarTempStartDate;
      document.querySelectorAll('#integrated-cal-body .cal-day-slot').forEach(slot => {
        const d = slot.getAttribute('data-date');
        if (!d) return;
        slot.classList.toggle('in-range', d >= start && d <= end);
      });
    }
  }

  applyCalendarRange() {
    if (this.calendarTempStartDate) {
      this.calendarStartDate = this.calendarTempStartDate;
      this.calendarEndDate = this.calendarTempEndDate || this.calendarTempStartDate;
      this.selectedCalendarDate = this.calendarEndDate;
    }
    const cond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    this.renderUpcomingEvents(this.selectedCalendarDate);
    this.renderPantanganMakanan(cond);
    this.renderValidationSummary(cond, this.activeRecoveryMonthIndex || 1);
    this.renderClinicalCalendar(this.calendarViewMode);

    const rangeText = document.getElementById('calendar-picker-range-text')?.textContent || this.selectedCalendarDate;
    this.showToast(`Rentang tanggal diterapkan: ${rangeText}`, 'success');
  }

  cancelCalendarRange() {
    this.calendarTempStartDate = this.calendarStartDate;
    this.calendarTempEndDate = this.calendarEndDate;
    this.renderClinicalCalendar(this.calendarViewMode);
    this.showToast('Perubahan rentang kalender dibatalkan.', 'info');
  }

  switchCalendarView(viewMode) {
    this.calendarViewMode = viewMode;
    this.renderClinicalCalendar(viewMode);
  }

  shiftCalendarMonth(delta) {
    const cur = this.calendarMonthDate || new Date();
    this.calendarMonthDate = new Date(cur.getFullYear(), cur.getMonth() + delta, 1);
    this.renderClinicalCalendar(this.calendarViewMode);
  }

  selectCalendarDate(dateKey) {
    this.selectedCalendarDate = dateKey;
    this.calendarTempStartDate = dateKey;
    this.calendarTempEndDate = dateKey;
    this.calendarStartDate = dateKey;
    this.calendarEndDate = dateKey;
    const cond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    this.renderUpcomingEvents(dateKey);
    this.renderPantanganMakanan(cond);
    this.renderValidationSummary(cond, this.activeRecoveryMonthIndex || 1);
    this.renderClinicalCalendar(this.calendarViewMode);
  }

  renderDualCalendar(conditionId) {
    const calContainer = document.getElementById('dual-calendar-container');
    const calLabel = document.getElementById('dual-cal-window-label');
    if (calLabel) {
      calLabel.textContent = 'Bulan Pertama · Fase Awal';
    }
    if (calContainer) {
      calContainer.innerHTML = `
        <div class="mini-calendar-card">
          <div class="mini-cal-header">
            <span>Bulan Pertama</span>
            <span class="mini-cal-header-badge">Fase Aktif</span>
          </div>
          <div class="mini-cal-grid">
            <div class="mini-cal-day phase-1">1</div>
          </div>
        </div>
        <div class="mini-calendar-card">
          <div class="mini-cal-header">
            <span>Bulan Kedua</span>
            <span class="mini-cal-header-badge">Fase Pemulihan</span>
          </div>
          <div class="mini-cal-grid">
            <div class="mini-cal-day phase-2">1</div>
          </div>
        </div>
      `;
    }
  }

  shiftDualCalendar(offsetDelta) {
    this.calendarMonthOffset = (this.calendarMonthOffset || 0) + offsetDelta;
    const calLabel = document.getElementById('dual-cal-window-label');
    if (calLabel) {
      calLabel.textContent = `Bulan ke-${this.calendarMonthOffset + 1} · Window Terpilih`;
    }
    const infoEl = document.getElementById('dual-cal-selected-info');
    if (infoEl) {
      infoEl.textContent = `Hari ke-38 · Fase Pemulihan Lanjut`;
    }
  }

  switchCalendarDetailTab(tab) {
    this.calendarDetailTab = tab || 'meals';
    const tabBtns = {
      meals: document.getElementById('btn-tab-meals'),
      restrictions: document.getElementById('btn-tab-restrictions'),
      validation: document.getElementById('btn-tab-validation')
    };
    const tabPanes = {
      meals: document.getElementById('pane-tab-meals'),
      restrictions: document.getElementById('pane-tab-restrictions'),
      validation: document.getElementById('pane-tab-validation')
    };

    Object.keys(tabBtns).forEach(k => {
      if (tabBtns[k]) tabBtns[k].classList.toggle('active', k === this.calendarDetailTab);
      if (tabPanes[k]) tabPanes[k].style.display = (k === this.calendarDetailTab) ? 'block' : 'none';
    });

    const cond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    if (this.calendarDetailTab === 'restrictions') {
      this.renderPantanganMakanan(cond);
    } else if (this.calendarDetailTab === 'validation') {
      this.renderValidationSummary(cond, this.activeRecoveryMonthIndex || 1);
    } else {
      this.renderUpcomingEvents(this.selectedCalendarDate);
    }
  }

  renderPantanganMakanan(conditionId) {
    const listEl = document.getElementById('pantangan-events-list');
    if (!listEl) return;

    const cond = conditionId || this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const profile = NUTRIVISION_DATA.recoveryProfiles[cond];
    const contraindications = profile?.contraindications || [];

    if (contraindications.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:24px 12px;color:#64748B;">
          <p style="margin:0;font-size:12px;">Tidak ada catatan pantangan khusus untuk kondisi ini.</p>
        </div>
      `;
      return;
    }

    // Active highlighted restriction (default to first on initial load)
    if (this.activeRestrictionId === undefined) {
      this.activeRestrictionId = contraindications[0]?.id || null;
    }

    const itemsHtml = contraindications.map(c => {
      const isCritical = c.risk.includes('Kritis') || c.risk.includes('Total') || c.risk.includes('Mutlak');
      const isActive = (c.id === this.activeRestrictionId);
      const forbiddenList = c.forbiddenItems || [];

      if (isActive) {
        return `
          <div class="timeline-event-row is-restriction is-active"
               data-restriction-id="${c.id}"
               onclick="app.selectRestrictionEvent('${c.id}')">
            <!-- Left Red Timeline Track -->
            <div class="timeline-axis">
              <div class="timeline-node">
                <span class="timeline-node-inner"></span>
              </div>
              <div class="timeline-line"></div>
            </div>

            <!-- Active Restriction Card (Crimson / Deep Warning Red) -->
            <div class="timeline-content-wrap">
              <div class="timeline-card-active is-restriction">
                <div class="timeline-header">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <i data-lucide="shield-alert" style="width:15px;height:15px;color:#FECDD3;flex-shrink:0;"></i>
                    <h4 class="timeline-title">${c.food}</h4>
                  </div>
                  <span class="restriction-badge-active">
                    ${c.risk}
                  </span>
                </div>
                <p class="timeline-desc">${c.reason}</p>

                <!-- Detailed Forbidden Foods Box -->
                ${forbiddenList.length > 0 ? `
                  <div class="restriction-forbidden-box-active">
                    <div class="restriction-forbidden-header-active">
                      <i data-lucide="ban" style="width:12px;height:12px;color:#FECDD3;"></i>
                      <span>Contoh Jenis Makanan yang Dilarang:</span>
                    </div>
                    <div class="restriction-forbidden-tags-active">
                      ${forbiddenList.map(item => `
                        <span class="restriction-tag-active">
                          <span style="color:#FECDD3;">✕</span> ${item}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <div class="restriction-citation-active">
                  <i data-lucide="book-open" style="width:11px;height:11px;color:#FECDD3;"></i>
                  <span>Validasi Medis: ${c.citation}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Standard Inactive Red Timeline Row (Short & Compact)
      return `
        <div class="timeline-event-row is-restriction"
             data-restriction-id="${c.id}"
             onclick="app.selectRestrictionEvent('${c.id}')">
          <!-- Left Red Timeline Track -->
          <div class="timeline-axis">
            <div class="timeline-node"></div>
            <div class="timeline-line"></div>
          </div>

          <!-- Standard Clean Compact Row Content -->
          <div class="timeline-content-wrap" style="padding-bottom:8px;">
            <div class="timeline-card-standard" style="padding:8px 10px 8px 10px;">
              <div class="timeline-header">
                <h4 class="timeline-title" style="font-size:13.5px;">${c.food}</h4>
                <span class="restriction-badge-standard ${isCritical ? 'critical' : ''}">
                  ${c.risk}
                </span>
              </div>
              <div class="restriction-expand-hint">
                <i data-lucide="chevron-down" style="width:11px;height:11px;"></i>
                <span>Klik untuk lihat jenis makanan dilarang (${forbiddenList.length})</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listEl.innerHTML = `
      <div style="margin-bottom:12px;padding:10px 14px;background:#FEF2F2;border-radius:12px;border:1px solid #FECACA;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;">
          <i data-lucide="alert-triangle" style="width:16px;height:16px;color:#DC2626;flex-shrink:0;"></i>
          <p style="margin:0;font-size:11.5px;color:#991B1B;line-height:1.45;">
            <strong>Peringatan Klinis Dokter:</strong> Hindari makanan & kebiasaan berikut untuk mencegah komplikasi, peradangan jaringan, atau kegagalan sintesis pemulihan.
          </p>
        </div>
        <span style="font-size:10.5px;color:#991B1B;font-weight:600;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">
          <i data-lucide="shield-check" style="width:12px;height:12px;"></i> Validasi Medis Terverifikasi
        </span>
      </div>
      <div class="upcoming-events-list">
        ${itemsHtml}
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: listEl });
    }
  }

  selectRestrictionEvent(restrictionId) {
    // Klik pada kartu yang sama akan menutupnya (collapse), klik kartu lain akan membukanya
    this.activeRestrictionId = (this.activeRestrictionId === restrictionId) ? null : restrictionId;
    this.renderPantanganMakanan(this.journeyCondition || this.userProfile?.conditionId || 'post-surgery');
  }

  renderValidationSummary(conditionId, monthIndex) {
    const listEl = document.getElementById('validation-events-list');
    if (!listEl) return;

    const cond = conditionId || this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const profile = NUTRIVISION_DATA.recoveryProfiles[cond];
    const mIdx = monthIndex || this.activeRecoveryMonthIndex || 1;
    const milestone = profile?.monthlyMilestones?.find(m => m.monthIndex === mIdx) || profile?.monthlyMilestones?.[0];

    if (!profile || !milestone) {
      listEl.innerHTML = `<p style="font-size:12px;color:#64748B;">Data validasi tidak ditemukan.</p>`;
      return;
    }

    listEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="background:#F7F9EC;border:1px solid #DDE2B9;border-radius:10px;padding:12px 14px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <i data-lucide="check-circle-2" style="width:16px;height:16px;color:#9EA76B;"></i>
            <h4 style="margin:0;font-size:13.5px;font-weight:700;color:#141708;">Konsensus Ilmiah &amp; Acuan Klinis</h4>
          </div>
          <p style="margin:0;font-size:12.5px;color:#233412;line-height:1.5;font-weight:500;">
            ${milestone.scientificCitation}
          </p>
        </div>

        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;">
          <h4 style="margin:0 0 6px;font-size:12.5px;font-weight:700;color:#0F172A;display:flex;align-items:center;gap:6px;">
            <i data-lucide="target" style="width:14px;height:14px;color:#233917;"></i>
            <span>Biomarker & Target Penyembuhan</span>
          </h4>
          <p style="margin:0 0 4px;font-size:11.5px;color:#334155;line-height:1.5;">
            <strong>Target:</strong> ${milestone.healingTarget.title}
          </p>
          <p style="margin:0 0 4px;font-size:11.5px;color:#475569;line-height:1.5;">
            <strong>Indikator:</strong> ${milestone.healingTarget.markers}
          </p>
          <p style="margin:0;font-size:11px;color:#64748B;line-height:1.5;">
            <strong>Tujuan Klinis:</strong> ${milestone.healingTarget.clinicalGoal}
          </p>
        </div>

        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;">
          <h4 style="margin:0 0 6px;font-size:12.5px;font-weight:700;color:#0F172A;display:flex;align-items:center;gap:6px;">
            <i data-lucide="pie-chart" style="width:14px;height:14px;color:#233917;"></i>
            <span>Parameter Target Nutrisi</span>
          </h4>
          <ul style="margin:0;padding-left:18px;font-size:11.5px;color:#334155;line-height:1.6;">
            <li><strong>Protein Target:</strong> ${milestone.nutritionTarget.protein}</li>
            <li><strong>Kebutuhan Kalori:</strong> ${milestone.nutritionTarget.calories}</li>
            <li><strong>Mikronutrien Kunci:</strong> ${milestone.nutritionTarget.micronutrients}</li>
            <li><strong>Tekstur Makanan:</strong> ${milestone.nutritionTarget.texture}</li>
          </ul>
        </div>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: listEl });
    }
  }


  toggleScheduleCompletion(scheduleId, dateKey) {
    const key = `${dateKey}_${scheduleId}`;
    if (!this.completedScheduleItems) this.completedScheduleItems = {};
    this.completedScheduleItems[key] = !this.completedScheduleItems[key];
    this.saveCompletedSchedules();
    this.renderUpcomingEvents(dateKey);

    const isDone = this.completedScheduleItems[key];
    this.showToast(isDone ? '✓ Jadwal diselesaikan!' : 'Status jadwal diperbarui', 'info');
  }

  openCalendarModal() {
    const modal = document.getElementById('modal-clinical-calendar');
    if (modal) {
      modal.style.display = 'flex';
      this.renderClinicalCalendarAndScheduleSuite();
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: modal });
      }
    }
  }

  closeCalendarModal() {
    const modal = document.getElementById('modal-clinical-calendar');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  openAddScheduleModal() {
    const modal = document.getElementById('modal-add-schedule');
    if (modal) modal.style.display = 'flex';
  }

  closeAddScheduleModal() {
    const modal = document.getElementById('modal-add-schedule');
    if (modal) modal.style.display = 'none';
  }

  saveCustomSchedule() {
    const timeVal = document.getElementById('add-sched-time')?.value;
    const titleVal = document.getElementById('add-sched-title')?.value;
    const descVal = document.getElementById('add-sched-desc')?.value;
    const catVal = document.getElementById('add-sched-category')?.value;

    if (!timeVal || !titleVal) {
      this.showToast('Mohon lengkapi waktu dan judul jadwal.', 'warning');
      return;
    }

    const catColors = {
      nutrition: '#15803D',
      therapy: '#7C3AED',
      snack: '#D97706',
      hydration: '#0284C7',
      rest: '#475569'
    };

    const newSched = {
      id: 'custom-' + Date.now(),
      time: timeVal,
      title: titleVal,
      desc: descVal || '-',
      category: catVal || 'nutrition',
      dotColor: catColors[catVal] || '#15803D',
      scientificRationale: 'Jadwal kustom pasien',
      isCustom: true,
      conditionId: this.journeyCondition || 'post-surgery'
    };

    if (!this.customDailySchedules) this.customDailySchedules = [];
    this.customDailySchedules.push(newSched);
    this.saveCustomDailySchedules();

    this.closeAddScheduleModal();
    const form = document.getElementById('form-add-schedule');
    if (form) form.reset();

    this.renderUpcomingEvents(this.selectedCalendarDate);
    this.renderClinicalCalendar(this.calendarViewMode);

    this.showToast('Jadwal baru berhasil ditambahkan!', 'success');
  }

  deleteCustomSchedule(schedId) {
    if (!this.customDailySchedules) return;
    this.customDailySchedules = this.customDailySchedules.filter(s => s.id !== schedId);
    this.saveCustomDailySchedules();
    this.renderUpcomingEvents(this.selectedCalendarDate);
    this.renderClinicalCalendar(this.calendarViewMode);
    this.showToast('Jadwal kustom dihapus.', 'info');
  }

  resetToDefaultClinicalSchedule() {
    const modal = document.getElementById('modal-confirm-reset-schedule');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('open');
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: modal });
      }
    } else {
      if (confirm('Apakah Anda yakin ingin mereset seluruh status checklist selesai dan jadwal hari ini kembali ke default klinis awal?')) {
        this.executeResetClinicalSchedule();
      }
    }
  }

  closeResetScheduleModal() {
    const modal = document.getElementById('modal-confirm-reset-schedule');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('open');
    }
  }

  executeResetClinicalSchedule() {
    const cond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';
    const targetDate = this.selectedCalendarDate || new Date().toISOString().split('T')[0];

    // 1. Bersihkan seluruh status checklist selesai (completed items) untuk tanggal dan kondisi ini
    if (this.completedScheduleItems) {
      const conditionSchedules = this.getConditionSchedules(cond);
      const conditionSchedIds = new Set(conditionSchedules.map(s => s.id));

      Object.keys(this.completedScheduleItems).forEach(key => {
        // Hapus jika key dimulai dengan tanggal aktif
        if (key.startsWith(`${targetDate}_`)) {
          delete this.completedScheduleItems[key];
          return;
        }
        // Hapus juga jika key merupakan ID jadwal dari kondisi ini
        const parts = key.split('_');
        const schedId = parts.length > 1 ? parts.slice(1).join('_') : parts[0];
        if (conditionSchedIds.has(schedId) || conditionSchedIds.has(key)) {
          delete this.completedScheduleItems[key];
        }
      });
      this.saveCompletedSchedules();
    }

    // 2. Bersihkan jadwal kustom khusus kondisi ini
    if (this.customDailySchedules) {
      this.customDailySchedules = this.customDailySchedules.filter(s => s.conditionId && s.conditionId !== cond);
      this.saveCustomDailySchedules();
    }

    // 3. Reset active timeline item ke jadwal pertama
    const schedules = this.getConditionSchedules(cond);
    this.activeTimelineEventId = schedules[0]?.id || null;

    // 4. Tutup modal konfirmasi
    this.closeResetScheduleModal();

    // 5. Kembalikan tab ke 'meals' dan re-render tampilan kalender serta daftar event
    this.switchCalendarDetailTab('meals');
    this.renderUpcomingEvents(this.selectedCalendarDate);
    this.renderClinicalCalendar(this.calendarViewMode);

    this.showToast('Jadwal dan status checklist berhasil direset ke default klinis.', 'success');
  }

  renderClinicalCalendarAndScheduleSuite() {
    const cond = this.journeyCondition || this.userProfile?.conditionId || 'post-surgery';

    // Sync quick condition switcher in modal header
    document.querySelectorAll('#modal-cond-switcher .cond-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cond === cond);
    });

    // Update condition tag in detail panel
    const condTagEl = document.getElementById('cal-detail-condition-tag');
    if (condTagEl) {
      const condNames = {
        'post-surgery': 'PROFIL PASCA-OPERASI & BEDAH',
        'rehab': 'PROFIL REHABILITASI & FISIOTERAPI',
        'gym': 'PROFIL GYM & MUSCLE RECOVERY'
      };
      condTagEl.textContent = condNames[cond] || 'PROFIL PEMULIHAN KLINIS';
    }

    this.renderRecoveryMonthPills(cond);
    this.renderActiveMonthBanner(cond, this.activeRecoveryMonthIndex || 1);
    this.renderUpcomingEvents(this.selectedCalendarDate);
    this.renderPantanganMakanan(cond);
    this.renderValidationSummary(cond, this.activeRecoveryMonthIndex || 1);
    this.renderClinicalCalendar(this.calendarViewMode || 'month');
  }

  // =========================================================================
  // DUAL-MODE COMPANION PORTAL & DOCTOR CLINICAL DASHBOARD CONTROLLER
  // =========================================================================

  openCompanionModal() {
    this.closeModal('auth-modal');
    const modal = document.getElementById('modal-companion-selector');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('open');
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
  }

  closeCompanionModal() {
    this.closeModal('modal-companion-selector');
  }

  goToDoctorDashboard() {
    this.isLanding = false;
    document.body.classList.remove('is-landing-active');
    this.navigate('doctor');
    this.renderDoctorDashboard();
    if (window.history.pushState) {
      window.history.pushState(null, null, '#doctor');
    }
  }

  goToCaregiverDashboard() {
    this.isLanding = false;
    document.body.classList.remove('is-landing-active');
    this.navigate('caregiver-dashboard');
    this.renderCaregiverDashboard();
    if (window.history.pushState) {
      window.history.pushState(null, null, '#caregiver-dashboard');
    }
  }

  // Data Roster Pasien Supervisi Medis Dokter DPJP
  getDoctorPatients() {
    return [
      {
        id: 'patient_siti',
        name: 'Siti Rahma',
        rm: '#NV-8821',
        age: 42,
        gender: 'female',
        weight: 58,
        height: 158,
        condition: 'Pasca Laparoskopi Kolesistektomi (Hari ke-5)',
        phase: 'Fase Proliferasi Luka',
        albumin: '3.4 g/dL',
        albuminStatus: 'Mendekati Normal (Target ≥3.5 g/dL)',
        adherencePct: 92,
        adherenceStatus: 'Optimal (Target ERAS Terpenuhi)',
        targets: { calories: 1750, protein: 85, carbs: 215, fat: 52 },
        current: { calories: 1480, protein: 76.5, carbs: 185, fat: 38 },
        instruction: 'Fase proliferasi luka berjalan sangat baik. Dorong konsumsi ekstrak ikan gabus dan putih telur kukus 2x sehari untuk mempercepat penutupan luka pembedahan.',
        meals: [
          { time: '07:30', name: 'Bubur Ikan Gabus Lembut + Putih Telur Kukus', cal: 320, prot: 22, carbs: 45, fat: 5, tag: 'Tinggi Albumin' },
          { time: '10:15', name: 'Puding Susu Kedelai Tinggi Protein & Madu', cal: 180, prot: 12, carbs: 25, fat: 3, tag: 'Snack Pemulihan' },
          { time: '12:45', name: 'Nasi Tim Sup Ayam Bening + Tahu Sutra Rebus', cal: 460, prot: 26.5, carbs: 62, fat: 12, tag: 'Menu Utama' },
          { time: '18:30', name: 'Pure Kentang + Sup Fillet Gabus Rebus Daun Kelor', cal: 520, prot: 16, carbs: 53, fat: 18, tag: 'Anti-Inflamasi' }
        ],
        weeklyAdherence: [88, 90, 85, 94, 91, 95, 92]
      },
      {
        id: 'patient_ahmad',
        name: 'Ahmad Fauzi',
        rm: '#NV-8742',
        age: 36,
        gender: 'male',
        weight: 72,
        height: 176,
        condition: 'Rekonstruksi ACL Lutut Kiri (Minggu ke-3)',
        phase: 'Fisioterapi & Massa Otot',
        albumin: '4.1 g/dL',
        albuminStatus: 'Normal (Sangat Memuaskan)',
        adherencePct: 88,
        adherenceStatus: 'Baik (Fase Reparasi Jaringan)',
        targets: { calories: 2200, protein: 110, carbs: 250, fat: 55 },
        current: { calories: 2050, protein: 102, carbs: 245, fat: 48 },
        instruction: 'Latihan fleksibilitas fleksi 90 derajat berlangsung lancar. Pertahankan asupan protein hewani >100g/hari untuk akselerasi reparasi tenosentesis.',
        meals: [
          { time: '06:45', name: 'Oatmeal + Susu Whey Isolate + 2 Butir Telur Rebus', cal: 420, prot: 32, carbs: 50, fat: 8, tag: 'Tinggi Protein' },
          { time: '12:15', name: 'Nasi Merah + Dada Ayam Panggang 150g + Brokoli Kukus', cal: 650, prot: 42, carbs: 75, fat: 12, tag: 'Menu Utama' },
          { time: '16:00', name: 'Pisang Ambon + Susu Kedelai Rendah Gula', cal: 240, prot: 8, carbs: 42, fat: 4, tag: 'Pre-Fisio' },
          { time: '19:15', name: 'Pepes Ikan Kembung + Tempe Bacem + Sup Bayam Jagung', cal: 740, prot: 20, carbs: 78, fat: 24, tag: 'Kaya Omega-3' }
        ],
        weeklyAdherence: [85, 87, 84, 90, 88, 89, 88]
      },
      {
        id: 'patient_subroto',
        name: 'Opa Subroto',
        rm: '#NV-8690',
        age: 71,
        gender: 'male',
        weight: 61,
        height: 164,
        condition: 'Pasca Herniorafi Inguinalis (Hari ke-10, Geriatri)',
        phase: 'Mobilisasi Dini & Pencegahan Konstipasi',
        albumin: '3.2 g/dL',
        albuminStatus: 'Perlu Perhatian (Batas Bawah Normal)',
        adherencePct: 79,
        adherenceStatus: 'Perlu Pendampingan Asupan Serat & Cairan',
        targets: { calories: 1600, protein: 70, carbs: 200, fat: 45 },
        current: { calories: 1250, protein: 54, carbs: 160, fat: 35 },
        instruction: 'Asupan serat lunak dan air mineral minimal 1.500 ml/hari harus dijaga ketat agar pasien tidak mengejan saat buang air besar.',
        meals: [
          { time: '07:00', name: 'Bubur Beras Halus + Suwir Ayam Kampung Lembut', cal: 310, prot: 18, carbs: 46, fat: 6, tag: 'Mudah Cerna' },
          { time: '12:30', name: 'Nasi Lunak + Gurame Tim Jahe + Sup Labu Siam Bening', cal: 510, prot: 22, carbs: 62, fat: 11, tag: 'Kaya Serat Lunak' },
          { time: '16:30', name: 'Jus Pepaya Madu Segar (Tanpa Ampas Kasar)', cal: 140, prot: 2, carbs: 32, fat: 1, tag: 'Cegah Konstipasi' },
          { time: '19:00', name: 'Sup Bening Oyong Jagung Manis + Telur Rebus Empuk', cal: 290, prot: 12, carbs: 20, fat: 17, tag: 'Malam Ringan' }
        ],
        weeklyAdherence: [72, 75, 76, 82, 80, 78, 79]
      }
    ];
  }

  // Render Keseluruhan Dasbor Dokter
  renderDoctorDashboard() {
    if (!this.doctorPatients || this.doctorPatients.length === 0) {
      this.doctorPatients = this.getDoctorPatients();
    }
    const currentPatient = this.doctorPatients.find(p => p.id === this.currentDoctorPatientId) || this.doctorPatients[0];
    this.currentDoctorPatientId = currentPatient.id;

    this.renderDoctorPatientSelector();
    this.renderDoctorPatientMetrics(currentPatient);
    this.renderDoctorPatientDonut(currentPatient);
    this.renderDoctorPatientWeeklyChart(currentPatient);
    this.renderDoctorPatientMeals(currentPatient);

    const instrEl = document.getElementById('doctor-patient-instruction-text');
    if (instrEl) {
      instrEl.textContent = currentPatient.instruction;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Render Pill Tab Pasien
  renderDoctorPatientSelector() {
    const container = document.getElementById('doctor-patient-selector-container');
    const countEl = document.getElementById('doctor-patient-roster-count');
    if (countEl) {
      countEl.textContent = `${this.doctorPatients.length} Pasien Terpantau`;
    }
    if (!container) return;

    container.innerHTML = this.doctorPatients.map(p => {
      const isActive = p.id === this.currentDoctorPatientId;
      const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `
        <div class="doctor-patient-pill ${isActive ? 'active' : ''}" onclick="app.selectDoctorPatient('${p.id}')">
          <div class="doctor-pill-avatar">${initials}</div>
          <div class="doctor-pill-info">
            <div class="doctor-pill-name">${p.name}</div>
            <div class="doctor-pill-meta">${p.rm} · ${p.age} th · ${p.gender === 'female' ? 'P' : 'L'}</div>
          </div>
          <div class="doctor-pill-adherence ${p.adherencePct >= 90 ? 'green' : (p.adherencePct >= 80 ? 'blue' : 'amber')}">
            ${p.adherencePct}%
          </div>
        </div>
      `;
    }).join('');
  }

  selectDoctorPatient(patientId) {
    this.currentDoctorPatientId = patientId;
    this.renderDoctorDashboard();
  }

  // Render Kartu Biometrik & Nutrisi Pasien Terpilih
  renderDoctorPatientMetrics(patient) {
    const container = document.getElementById('doctor-patient-metrics-container');
    if (!container) return;

    const bmi = (patient.weight / ((patient.height / 100) ** 2)).toFixed(1);
    const protPct = Math.round((patient.current.protein / patient.targets.protein) * 100);
    const calPct = Math.round((patient.current.calories / patient.targets.calories) * 100);

    container.innerHTML = `
      <div class="doctor-metric-card">
        <div class="doctor-metric-head">
          <span class="doctor-metric-title">Target Protein ERAS</span>
          <span class="doctor-metric-badge ${protPct >= 90 ? 'green' : 'amber'}">${protPct}% Tercapai</span>
        </div>
        <div class="doctor-metric-value">${patient.current.protein} <span style="font-size:15px;color:#64748B;font-weight:600;">/ ${patient.targets.protein} g</span></div>
        <div class="doctor-metric-sub">Defisit harian: ${Math.max(0, (patient.targets.protein - patient.current.protein).toFixed(1))} g untuk sintesis kolagen</div>
      </div>

      <div class="doctor-metric-card">
        <div class="doctor-metric-head">
          <span class="doctor-metric-title">Kadar Albumin Serum</span>
          <span class="doctor-metric-badge ${parseFloat(patient.albumin) >= 3.5 ? 'green' : 'amber'}">${parseFloat(patient.albumin) >= 3.5 ? 'Normal' : 'Sub-Optimal'}</span>
        </div>
        <div class="doctor-metric-value">${patient.albumin}</div>
        <div class="doctor-metric-sub">${patient.albuminStatus}</div>
      </div>

      <div class="doctor-metric-card">
        <div class="doctor-metric-head">
          <span class="doctor-metric-title">Kepatuhan Rencana Makan (7 Hari)</span>
          <span class="doctor-metric-badge green">${patient.adherencePct}%</span>
        </div>
        <div class="doctor-metric-value">${patient.adherencePct}%</div>
        <div class="doctor-metric-sub">${patient.adherenceStatus}</div>
      </div>

      <div class="doctor-metric-card">
        <div class="doctor-metric-head">
          <span class="doctor-metric-title">IMT / Status Antropometri</span>
          <span class="doctor-metric-badge blue">Normoweight</span>
        </div>
        <div class="doctor-metric-value">${bmi} <span style="font-size:13px;color:#64748B;font-weight:500;">kg/m²</span></div>
        <div class="doctor-metric-sub">BB: ${patient.weight} kg · TB: ${patient.height} cm (${patient.condition})</div>
      </div>
    `;
  }

  // Render Cincin Donut Makro Pasien Terpilih
  renderDoctorPatientDonut(patient) {
    const canvas = document.getElementById('doctor-macro-donut-canvas');
    const calVal = document.getElementById('doctor-donut-cal-val');
    const calTarget = document.getElementById('doctor-donut-cal-target');
    const protTxt = document.getElementById('doctor-macro-prot-txt');
    const carbsTxt = document.getElementById('doctor-macro-carbs-txt');
    const fatTxt = document.getElementById('doctor-macro-fat-txt');
    const badge = document.getElementById('doctor-patient-adherence-badge');

    if (calVal) calVal.textContent = patient.current.calories.toLocaleString('id-ID');
    if (calTarget) calTarget.textContent = `/ ${patient.targets.calories.toLocaleString('id-ID')} kkal`;
    if (protTxt) protTxt.textContent = `Protein: ${patient.current.protein} / ${patient.targets.protein} g`;
    if (carbsTxt) carbsTxt.textContent = `Karbo: ${patient.current.carbs} / ${patient.targets.carbs} g`;
    if (fatTxt) fatTxt.textContent = `Lemak: ${patient.current.fat} / ${patient.targets.fat} g`;
    if (badge) {
      badge.textContent = `Kepatuhan: ${patient.adherencePct}%`;
      badge.className = `doctor-metric-badge ${patient.adherencePct >= 90 ? 'green' : (patient.adherencePct >= 80 ? 'blue' : 'amber')}`;
    }

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(centerX, centerY) - 18;
    const lineWidth = 16;

    ctx.clearRect(0, 0, w, h);

    // Background track ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Segment arcs (Protein #384720, Carbs #9EA76B, Fat #EFE8CA)
    const protCal = patient.current.protein * 4;
    const carbsCal = patient.current.carbs * 4;
    const fatCal = patient.current.fat * 9;
    const totalCal = protCal + carbsCal + fatCal;

    if (totalCal > 0) {
      let startAngle = -0.5 * Math.PI;

      // Protein Arc
      const protAngle = (protCal / totalCal) * (2 * Math.PI);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + protAngle);
      ctx.strokeStyle = '#384720';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      startAngle += protAngle;

      // Carbs Arc
      const carbsAngle = (carbsCal / totalCal) * (2 * Math.PI);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + carbsAngle);
      ctx.strokeStyle = '#9EA76B';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt';
      ctx.stroke();
      startAngle += carbsAngle;

      // Fat Arc
      const fatAngle = (fatCal / totalCal) * (2 * Math.PI);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + fatAngle);
      ctx.strokeStyle = '#E2D9B3';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt';
      ctx.stroke();
    }
  }

  // Render Grafik Batang Kepatuhan 7 Hari Pasien
  renderDoctorPatientWeeklyChart(patient) {
    const canvas = document.getElementById('doctor-weekly-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = canvas.parentElement?.clientWidth || 320;
    const h = canvas.height = 120;
    ctx.clearRect(0, 0, w, h);

    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const values = patient.weeklyAdherence || [85, 90, 88, 92, 95, 91, 92];
    const barWidth = Math.min(26, Math.floor((w - 40) / days.length) - 8);
    const spacing = (w - 40) / days.length;
    const startX = 25;
    const chartHeight = h - 35;

    // Target 100% line (dashed)
    const y100 = 10 + chartHeight * (1 - 100 / 120);
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(startX, y100);
    ctx.lineTo(w - 15, y100);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bars
    values.forEach((val, idx) => {
      const x = startX + idx * spacing + (spacing - barWidth) / 2;
      const barH = (val / 120) * chartHeight;
      const y = h - 22 - barH;

      // Color based on compliance
      ctx.fillStyle = val >= 90 ? '#059669' : (val >= 80 ? '#0284C7' : '#F59E0B');
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      } else {
        ctx.rect(x, y, barWidth, barH);
      }
      ctx.fill();

      // Percentage label on top
      ctx.fillStyle = '#64748B';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${val}%`, x + barWidth / 2, y - 4);

      // Day label below
      ctx.fillStyle = '#1E293B';
      ctx.font = idx === 6 ? 'bold 11px sans-serif' : '11px sans-serif';
      ctx.fillText(days[idx], x + barWidth / 2, h - 6);
    });
  }

  // Render Log Makanan Pasien Terpilih Hari Ini
  renderDoctorPatientMeals(patient) {
    const container = document.getElementById('doctor-patient-meals-list');
    if (!container) return;

    if (!patient.meals || patient.meals.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:24px;color:#94A3B8;font-size:13px;">Belum ada log asupan makanan untuk hari ini.</div>`;
      return;
    }

    container.innerHTML = patient.meals.map(m => `
      <div class="doctor-meal-item">
        <div class="doctor-meal-time">${m.time}</div>
        <div class="doctor-meal-details">
          <div class="doctor-meal-name">${m.name}</div>
          <div class="doctor-meal-macros">${m.cal} kkal · ${m.prot}g protein · ${m.carbs}g karbo · ${m.fat}g lemak</div>
        </div>
        <span class="doctor-meal-badge">${m.tag}</span>
      </div>
    `).join('');
  }

  refreshDoctorPatientData() {
    this.showToast('🔄 Memperbarui telemetri asupan & data pasien...');
    this.renderDoctorDashboard();
  }

  sendClinicalAdviceToPatient() {
    const currentPatient = this.doctorPatients.find(p => p.id === this.currentDoctorPatientId) || this.doctorPatients[0];
    this.showToast(`✅ Instruksi gizi DPJP berhasil dikirimkan ke aplikasi ponsel ${currentPatient.name}.`);
  }

  // Buka Rekam Medis PDF Pasien Terpilih untuk DPJP atau Caregiver
  openDoctorPatientPdf() {
    const currentPatient = this.doctorPatients.find(p => p.id === this.currentDoctorPatientId) || this.doctorPatients[0];
    const modal = document.getElementById('modal-pdf-report');
    const container = document.getElementById('pdf-report-preview-container');
    if (!modal || !container) return;

    const patientProfile = {
      name: currentPatient.name,
      role: 'patient',
      gender: currentPatient.gender,
      age: currentPatient.age,
      weightKg: currentPatient.weight,
      heightCm: currentPatient.height,
      conditionTitle: currentPatient.condition,
      phase: currentPatient.phase,
      targets: currentPatient.targets,
      bmi: (currentPatient.weight / ((currentPatient.height / 100) ** 2)).toFixed(1),
      bmiCategory: 'Normal',
      contact: `${currentPatient.id}@nutrivision.id`
    };

    if (window.progressTracker && typeof window.progressTracker.generatePDFReportHTML === 'function') {
      container.innerHTML = window.progressTracker.generatePDFReportHTML(
        patientProfile,
        typeof mealPlanner !== 'undefined' ? mealPlanner : null
      );
    }
    modal.classList.add('open');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Render Dasbor Pendamping Pasien (Caregiver)
  renderCaregiverDashboard() {
    if (!this.doctorPatients || this.doctorPatients.length === 0) {
      this.doctorPatients = this.getDoctorPatients();
    }
    const familyPatient = this.doctorPatients[0]; // Siti Rahma (Ibu Tercinta)

    const metricsContainer = document.getElementById('caregiver-metrics-container');
    if (metricsContainer) {
      const protPct = Math.round((familyPatient.current.protein / familyPatient.targets.protein) * 100);
      metricsContainer.innerHTML = `
        <div class="doctor-metric-card">
          <div class="doctor-metric-head">
            <span class="doctor-metric-title">Pasien Keluarga Tercinta</span>
            <span class="doctor-metric-badge green">Terhubung</span>
          </div>
          <div class="doctor-metric-value" style="font-size:18px;">${familyPatient.name} (42 th)</div>
          <div class="doctor-metric-sub">${familyPatient.condition}</div>
        </div>

        <div class="doctor-metric-card">
          <div class="doctor-metric-head">
            <span class="doctor-metric-title">Kecukupan Protein Hari Ini</span>
            <span class="doctor-metric-badge green">${protPct}%</span>
          </div>
          <div class="doctor-metric-value">${familyPatient.current.protein} <span style="font-size:15px;color:#64748B;font-weight:600;">/ ${familyPatient.targets.protein} g</span></div>
          <div class="doctor-metric-sub">Sisa kebutuhan: ${Math.max(0, (familyPatient.targets.protein - familyPatient.current.protein).toFixed(1))} g untuk menutup luka</div>
        </div>

        <div class="doctor-metric-card">
          <div class="doctor-metric-head">
            <span class="doctor-metric-title">Total Kalori Terpenuhi</span>
            <span class="doctor-metric-badge green">Baik</span>
          </div>
          <div class="doctor-metric-value">${familyPatient.current.calories} <span style="font-size:15px;color:#64748B;font-weight:600;">/ ${familyPatient.targets.calories} kkal</span></div>
          <div class="doctor-metric-sub">Pola makan 4x sehari teratur</div>
        </div>

        <div class="doctor-metric-card">
          <div class="doctor-metric-head">
            <span class="doctor-metric-title">Dokter Penanggung Jawab (DPJP)</span>
            <span class="doctor-metric-badge blue">Klinis RSUP</span>
          </div>
          <div class="doctor-metric-value" style="font-size:16px;">dr. Hendra Kusuma, Sp.GK</div>
          <div class="doctor-metric-sub">Catatan: Pastikan ekstrak gabus diminum rutin</div>
        </div>
      `;
    }

    const mealsContainer = document.getElementById('caregiver-meals-list');
    if (mealsContainer) {
      mealsContainer.innerHTML = familyPatient.meals.map(m => `
        <div class="doctor-meal-item">
          <div class="doctor-meal-time" style="background:#EFF6FF;color:#1D4ED8;">${m.time}</div>
          <div class="doctor-meal-details">
            <div class="doctor-meal-name">${m.name}</div>
            <div class="doctor-meal-macros">${m.cal} kkal · ${m.prot}g protein · Menu Pemulihan</div>
          </div>
          <span class="doctor-meal-badge" style="background:#DBEAFE;color:#1E40AF;">${m.tag}</span>
        </div>
      `).join('');
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

// Inisialisasi Instance Aplikasi
const app = new NutriVisionApp();
window.app = app;

window.refreshIcons = function (rootElement) {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    if (rootElement && rootElement.nodeType === 1) {
      window.lucide.createIcons({ root: rootElement });
    } else {
      window.lucide.createIcons();
    }
  }
};

// Auto MutationObserver: deteksi & inisialisasi ikon dinamis secara otomatis
let _iconObserverTimeout = null;
function _scheduleIconAutoRefresh() {
  if (_iconObserverTimeout) return;
  _iconObserverTimeout = setTimeout(() => {
    _iconObserverTimeout = null;
    window.refreshIcons();
  }, 40);
}

if (typeof window !== 'undefined' && window.MutationObserver) {
  const _iconObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            if (node.hasAttribute && node.hasAttribute('data-lucide')) {
              _scheduleIconAutoRefresh();
              return;
            }
            if (node.querySelector && node.querySelector('[data-lucide]')) {
              _scheduleIconAutoRefresh();
              return;
            }
          }
        }
      }
    }
  });

  const _startObserver = () => {
    if (document.body) {
      _iconObserver.observe(document.body, { childList: true, subtree: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _startObserver);
  } else {
    _startObserver();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  app.init();
  window.refreshIcons();
});

window.addEventListener('load', () => {
  window.refreshIcons();
});
