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
  }

  // Auth Guard / Gatekeeper: Memastikan pengguna sudah login & mengisi data klinis valid
  requireAuth(callback, actionDescription = 'menggunakan fitur ini') {
    const hasData = Boolean(this.userProfile.hasCompletedQuiz && this.userProfile.name);
    if (hasData) {
      if (typeof callback === 'function') callback();
      return true;
    } else {
      this.pendingAuthCallback = callback;
      this.showToast(`Silakan masuk atau lengkapi data profil untuk ${actionDescription}.`);
      this.openAuthModal('login');
      return false;
    }
  }

  // Muat data profil pengguna dari LocalStorage atau inisialisasi default (Fresh Zero State)
  loadUserProfile() {
    const saved = localStorage.getItem('nutrivision_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          hasCompletedQuiz: parsed.hasCompletedQuiz !== undefined ? parsed.hasCompletedQuiz : Boolean(parsed.name && parsed.targets),
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
          hasAcceptedConsent: parsed.hasAcceptedConsent || false,
          bmi: parsed.bmi || '--',
          bmiCategory: parsed.bmiCategory || '--',
          targets: parsed.targets || null,
          fontSize: parsed.fontSize || 'normal',
          highContrast: parsed.highContrast || false
        };
      } catch (e) {
        console.error('Error parsing user profile:', e);
      }
    }
    return {
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
      targets: null,
      fontSize: 'normal',
      highContrast: false
    };
  }

  saveUserProfile() {
    localStorage.setItem('nutrivision_user_profile', JSON.stringify(this.userProfile));
    this.applyAccessibilitySettings();
    this.updateProfileUI();
  }

  // Inisialisasi Aplikasi
  async init() {
    console.log('🚀 Initializing NutriVision AI PWA...');
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

    // Inisialisasi CV Engine dengan preset default
    cvEngine.loadScanData(NUTRIVISION_DATA.presetScans[0]);
    this.renderOverviewPlate();

    // Render Sub-modul
    progressTracker.renderMacroDonut(this.userProfile.targets);
    progressTracker.renderWeeklyBarChart();
    mealPlanner.renderPlanner();
    mealPlanner.renderSymptomFilter();
    communityHandler.renderCommunityFeed();
    caregiverHandler.renderCaregiverList();
    this.renderFoodCatalog();

    // Inisialisasi Kalkulator Mini Landing Page
    this.updateCalcUI();

    // Router URL Hash Handling (Landing vs Dashboard)
    const hash = window.location.hash.replace('#', '');
    const validSections = ['overview', 'planner', 'catalog', 'community', 'caregiver', 'progress', 'profile'];
    if (validSections.includes(hash) || hash === 'dashboard' || hash === 'app') {
      this.goToDashboard(validSections.includes(hash) ? hash : 'overview');
    } else {
      this.goToLanding();
    }

    // Tutup dropdown notifikasi pintar saat klik di luar
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('smart-notif-dropdown');
      const notifWrapper = document.querySelector('.topbar-notif-wrapper');
      if (dropdown && dropdown.style.display === 'block') {
        if (notifWrapper && !notifWrapper.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      }
    });

    // Inisialisasi ikon Lucide (Figma / Iconify standard)
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
    this.showToast(`Ukuran teks diatur ke: ${size.toUpperCase()}`);
  }

  toggleHighContrast() {
    this.userProfile.highContrast = !this.userProfile.highContrast;
    this.saveUserProfile();
    this.showToast(this.userProfile.highContrast ? 'Mode Kontras Tinggi Diaktifkan' : 'Mode Standar Diaktifkan');
  }

  // Update Header, Sidebar, dan Ringkasan UI Profil (Mendukung Empty State & Filled State)
  updateProfileUI() {
    const hasData = Boolean(this.userProfile.hasCompletedQuiz && this.userProfile.name);
    const initials = hasData ? (this.userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P') : '+';

    // 1. Update Topbar Greeting
    const greetingEl = document.querySelector('.topbar-greeting h1');
    if (greetingEl) {
      greetingEl.innerHTML = hasData 
        ? `Selamat siang, <span class="user-name-placeholder">${this.userProfile.name.split(' ')[0]}</span>`
        : `Selamat datang di <span style="color:var(--teal-700);">NutriVision AI</span>`;
    }

    // 2. Update Topbar Buttons Visibility (Humanized Logic)
    const topbarLoginBtn = document.getElementById('topbar-login-btn');
    const topbarProfileChip = document.getElementById('topbar-profile-chip');

    if (topbarLoginBtn) {
      topbarLoginBtn.style.display = hasData ? 'none' : 'inline-flex';
    }
    if (topbarProfileChip) {
      topbarProfileChip.style.display = hasData ? 'inline-flex' : 'none';
    }

    // 3. Update Profile Data Placeholders
    const nameEls = document.querySelectorAll('.user-name-placeholder');
    nameEls.forEach(el => el.textContent = hasData ? this.userProfile.name : 'Profil Pasien');

    const conditionEls = document.querySelectorAll('.user-condition-placeholder');
    conditionEls.forEach(el => el.textContent = hasData ? `${this.userProfile.conditionTitle} · ${this.userProfile.phase}` : 'Belum dikonfigurasi (Mulai Diagnostik Gizi)');

    const avatarEls = document.querySelectorAll('.user-avatar-placeholder');
    avatarEls.forEach(el => el.textContent = initials);

    // 4. Update Dedicated Sidebar Profile Card (Clean & Simple with Integrated Logout)
    const sidebarProfileCard = document.getElementById('sidebar-profile-card');
    if (sidebarProfileCard) {
      if (hasData) {
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="app.navigate('profile')" title="Buka Profil & Diagnostik">
              <div class="profile-avatar" style="background:linear-gradient(135deg,var(--coral-300),var(--coral-500));color:#fff;font-weight:700;flex-shrink:0;">${initials}</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.userProfile.name}</b>
                <span style="font-size:10.5px;color:#BFDCD1;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.userProfile.conditionTitle}</span>
              </div>
            </div>
            <button type="button" class="sidebar-logout-btn" onclick="event.stopPropagation(); app.handleLogout();" title="Logout & Kembali ke Landing Page" aria-label="Keluar / Logout">
              <i data-lucide="log-out" style="width:15px;height:15px;"></i>
            </button>
          </div>
        `;
      } else {
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="app.openAuthModal('login')" title="Masuk atau Daftar Akun">
              <div class="profile-avatar" style="background:rgba(255,255,255,0.15);color:#fff;font-weight:700;flex-shrink:0;">?</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;">Masuk / Daftar</b>
                <span style="font-size:10.5px;color:#BFDCD1;display:block;">Klik untuk mulai</span>
              </div>
            </div>
            <button type="button" class="sidebar-logout-btn" onclick="event.stopPropagation(); app.openAuthModal('login');" title="Masuk" aria-label="Masuk">
              <i data-lucide="log-in" style="width:15px;height:15px;"></i>
            </button>
          </div>
        `;
      }
    }

    // 5. Update Profile View Elements & Banner
    const emptyBanner = document.getElementById('profile-empty-banner');
    if (emptyBanner) {
      emptyBanner.style.display = hasData ? 'none' : 'block';
    }

    const badgeText = document.getElementById('profile-badge-text');
    const badgeStatus = document.getElementById('profile-badge-status');
    if (badgeText && badgeStatus) {
      if (hasData) {
        badgeText.textContent = 'Akun Terverifikasi';
        badgeStatus.style.background = 'var(--teal-50)';
        badgeStatus.style.color = 'var(--teal-700)';
        badgeStatus.style.borderColor = 'var(--teal-200)';
      } else {
        badgeText.textContent = 'Mode Tamu';
        badgeStatus.style.background = 'var(--bg-subtle)';
        badgeStatus.style.color = 'var(--ink-mute)';
        badgeStatus.style.borderColor = 'var(--line)';
      }
    }

    const btnRecalcLabel = document.getElementById('btn-quiz-recalc-label');
    if (btnRecalcLabel) {
      btnRecalcLabel.textContent = hasData ? 'Hitung Ulang Diagnostik' : 'Mulai Diagnostik Gizi';
    }

    const elEmail = document.getElementById('profile-email-phone');
    if (elEmail) elEmail.textContent = hasData ? `${this.userProfile.contact || 'Belum diisi'}` : 'Belum masuk akun';

    const elStatWH = document.getElementById('profile-stat-weight-height');
    if (elStatWH) elStatWH.textContent = hasData ? `${this.userProfile.weightKg} kg · ${this.userProfile.heightCm || 170} cm` : '-- kg · -- cm';

    const elStatBMI = document.getElementById('profile-stat-bmi');
    if (elStatBMI) elStatBMI.textContent = hasData ? `${this.userProfile.bmi || '--'} (${this.userProfile.bmiCategory || '--'})` : '-- (Belum dihitung)';

    const elStatCals = document.getElementById('profile-stat-calories');
    if (elStatCals) elStatCals.textContent = hasData && this.userProfile.targets ? `${this.userProfile.targets.calories.toLocaleString()}` : '--';

    const elTargetProt = document.getElementById('profile-target-protein');
    if (elTargetProt) {
      if (hasData && this.userProfile.targets) {
        const perKg = (this.userProfile.targets.protein / (this.userProfile.weightKg || 65)).toFixed(1);
        elTargetProt.textContent = `${this.userProfile.targets.protein} g / hari (${perKg}g/kg)`;
      } else {
        elTargetProt.textContent = '-- g / hari';
      }
    }

    const elTargetCarbs = document.getElementById('profile-target-carbs');
    if (elTargetCarbs) elTargetCarbs.textContent = hasData && this.userProfile.targets ? `${this.userProfile.targets.carbs} g / hari` : '-- g / hari';

    const elTargetFat = document.getElementById('profile-target-fat');
    if (elTargetFat) elTargetFat.textContent = hasData && this.userProfile.targets ? `${this.userProfile.targets.fat} g / hari` : '-- g / hari';

    const elStatRestr = document.getElementById('profile-stat-restrictions');
    if (elStatRestr) elStatRestr.textContent = hasData ? (this.userProfile.restrictions || 'Bebas pantangan khusus') : 'Belum mengisi deklarasi pantangan';

    const elStatAct = document.getElementById('profile-stat-activity');
    if (elStatAct) {
      if (hasData) {
        const actMap = {
          'bedrest': '<i data-lucide="bed" class="btn-icon-sm"></i> Bedrest Total / Tirah Baring (Aktivitas minimal)',
          'light': '<i data-lucide="footprints" class="btn-icon-sm"></i> Mobilisasi Ringan (Aktivitas ringan harian)',
          'therapy': '<i data-lucide="heart-pulse" class="btn-icon-sm"></i> Terapi Fisik Teratur (Fisioterapi 2-3x/minggu)',
          'active': '<i data-lucide="zap" class="btn-icon-sm"></i> Latihan Fisik Aktif / Gym'
        };
        elStatAct.innerHTML = actMap[this.userProfile.activityLevel] || '<i data-lucide="footprints" class="btn-icon-sm"></i> Mobilisasi Ringan';
      } else {
        elStatAct.textContent = 'Belum mengisi tingkat aktivitas';
      }
    }

    // 6. Update Session Status in Profile
    const sessTitle = document.getElementById('profile-session-status-title');
    const sessDesc = document.getElementById('profile-session-status-desc');
    const sessActions = document.getElementById('profile-session-actions');
    if (sessTitle && sessDesc && sessActions) {
      if (hasData) {
        sessTitle.innerHTML = `<i data-lucide="shield-check" class="btn-icon-sm" style="color:var(--teal-700);"></i> Status Sesi Login Aktif`;
        sessDesc.innerHTML = `Terhubung sebagai <span class="user-name-placeholder" style="font-weight:600;color:var(--ink-soft);">${this.userProfile.name}</span> (<span id="profile-auth-email">${this.userProfile.contact || 'Email terdaftar'}</span>)`;
        sessActions.innerHTML = `
          <button class="btn-sm-teal" style="display:inline-flex;align-items:center;gap:4px;" onclick="app.openAuthModal('login')">
            <i data-lucide="user-check" class="btn-icon-sm"></i> Ganti Akun Pasien
          </button>
          <button class="btn-outline-glass" style="color:var(--coral-600);border-color:var(--coral-100);background:var(--coral-50);font-size:12px;padding:6px 12px;border-radius:var(--radius-xs);display:inline-flex;align-items:center;gap:4px;" onclick="app.logout()">
            <i data-lucide="log-out" class="btn-icon-sm"></i> Keluar (Logout)
          </button>
        `;
      } else {
        sessTitle.innerHTML = `<i data-lucide="shield-alert" class="btn-icon-sm" style="color:var(--amber-600);"></i> Status Sesi: Mode Tamu (Belum Login)`;
        sessDesc.innerHTML = `Masuk atau buat akun baru untuk menyimpan riwayat asupan dan target gizi personal.`;
        sessActions.innerHTML = `
          <button class="btn-primary-coral" style="font-size:12px;padding:6px 14px;display:inline-flex;align-items:center;gap:4px;" onclick="app.openAuthModal('login')">
            <i data-lucide="log-in" class="btn-icon-sm"></i> Masuk / Daftar Akun
          </button>
        `;
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Switch Tab Navigasi (Router)
  navigate(sectionId) {
    this.activeSection = sectionId;

    // Update section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active-view');
    });
    const targetSection = document.getElementById(`view-${sectionId}`);
    if (targetSection) {
      targetSection.classList.add('active-view');
    }

    // Update Desktop Nav Active State
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sec === sectionId);
    });

    // Update Mobile Bottom Nav Active State
    document.querySelectorAll('.bottom-nav-pwa .bottom-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sec === sectionId);
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Scroll to top smooth
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // SMART CLINICAL NOTIFICATION CONTROLLERS
  // =========================================================================
  toggleSmartNotificationDropdown(forceState = null) {
    const dropdown = document.getElementById('smart-notif-dropdown');
    if (!dropdown) return;
    const isShown = dropdown.style.display === 'block';
    const nextState = forceState !== null ? forceState : !isShown;
    dropdown.style.display = nextState ? 'block' : 'none';
    if (nextState && window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  markAllNotifsRead() {
    document.querySelectorAll('.smart-notif-item.unread').forEach(item => {
      item.classList.remove('unread');
    });
    const badge = document.getElementById('notif-unread-count');
    if (badge) badge.style.display = 'none';
    this.showToast('✅ Seluruh notifikasi klinis telah ditandai sudah dibaca.');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history.pushState) {
      window.history.pushState(null, null, '#landing');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Pindah ke Mode Dasbor Aplikasi
  goToDashboard(sectionId = 'overview', triggerModal = null) {
    this.isLanding = false;
    document.body.classList.remove('is-landing-active');
    this.navigate(sectionId);
    if (window.history.pushState) {
      window.history.pushState(null, null, `#${sectionId}`);
    }
    
    if (triggerModal === 'quiz') {
      setTimeout(() => this.openQuizModal(1), 120);
    } else if (triggerModal === 'scan') {
      setTimeout(() => this.openScanModal(), 120);
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // INTERACTIVE SIMULATOR: PRESET SCANNER SHOWCASE
  // =========================================================================
  selectLandingPreset(presetKey) {
    document.querySelectorAll('.lp-meal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetKey);
    });

    const presets = {
      'preset-soft-bubur-gabus': {
        conf: '96%',
        targetProt: '32g / 98g <span style="font-size:11px;font-weight:500;color:var(--teal-600);">(Tinggi Albumin)</span>',
        cals: '385 kkal <span style="font-size:11px;font-weight:500;color:var(--teal-600);">(Tekstur Lunak)</span>',
        advice: '<strong>Saran Klinis:</strong> Tekstur bubur saring sangat ramah untuk pasien pasca-anestesi & disfagia. Albumin Ikan Gabus memicu granulasi luka 2x lebih cepat.',
        tag1: '<i data-lucide="fish" style="width:13px;height:13px;color:#3FBE93;"></i><span>Ikan Gabus (110g) · 26g Prot [Albumin]</span>',
        tag2: '<i data-lucide="soup" style="width:13px;height:13px;color:#EB8D70;"></i><span>Bubur Beras Lembut (220g) · 35g Karbo</span>',
        tag3: '<i data-lucide="egg" style="width:13px;height:13px;color:#EF9F27;"></i><span>Telur Tim Sutra (90g) · 6.8g Prot</span>',
        polyColor: '#3FBE93'
      },
      'preset-standard-nasi-ayam': {
        conf: '91%',
        targetProt: '38g / 98g <span style="font-size:11px;font-weight:500;color:var(--teal-600);">(Padat Gizi)</span>',
        cals: '465 kkal <span style="font-size:11px;font-weight:500;color:var(--coral-500);">(Energi Seimbang)</span>',
        advice: '<strong>Saran Klinis:</strong> Asam amino lengkap pada dada ayam tanpa kulit mendukung regenerasi sel otot & pembentukan enzim perbaikan jaringan.',
        tag1: '<i data-lucide="drumstick" style="width:13px;height:13px;color:#3FBE93;"></i><span>Dada Ayam Panggang (125g) · 31g Prot</span>',
        tag2: '<i data-lucide="wheat" style="width:13px;height:13px;color:#EB8D70;"></i><span>Nasi Putih (175g) · 52g Karbo</span>',
        tag3: '<i data-lucide="salad" style="width:13px;height:13px;color:#EF9F27;"></i><span>Tumis Kangkung &amp; Telur · Vit A/C</span>',
        polyColor: '#D85A30'
      },
      'preset-fish-kembung': {
        conf: '94%',
        targetProt: '41g / 98g <span style="font-size:11px;font-weight:500;color:var(--teal-600);">(Kaya Omega-3)</span>',
        cals: '430 kkal <span style="font-size:11px;font-weight:500;color:var(--teal-600);">(Hemat &amp; Bergizi)</span>',
        advice: '<strong>Saran Klinis:</strong> Ikan kembung mengandung asam lemak Omega-3 EPA/DHA setara salmon untuk meredakan inflamasi pembengkakan dengan harga terjangkau.',
        tag1: '<i data-lucide="fish" style="width:13px;height:13px;color:#3FBE93;"></i><span>Ikan Kembung (140g) · 29g Prot [Omega-3]</span>',
        tag2: '<i data-lucide="leaf" style="width:13px;height:13px;color:#EB8D70;"></i><span>Tempe Kukus (80g) · 15g Prot</span>',
        tag3: '<i data-lucide="salad" style="width:13px;height:13px;color:#EF9F27;"></i><span>Sayur Bening Bayam · Zat Besi</span>',
        polyColor: '#3FBE93'
      },
      'preset-salmon-quinoa': {
        conf: '95%',
        targetProt: '36g / 98g <span style="font-size:11px;font-weight:500;color:var(--teal-600);">(Antioksidan Tinggi)</span>',
        cals: '420 kkal <span style="font-size:11px;font-weight:500;color:var(--coral-500);">(Densitas Tinggi)</span>',
        advice: '<strong>Saran Klinis:</strong> Asam amino esensial dan sulforaphane brokoli menekan radikal bebas inflamasi pada fase remodeling jaringan.',
        tag1: '<i data-lucide="fish" style="width:13px;height:13px;color:#3FBE93;"></i><span>Fillet Salmon (130g) · 28g Prot</span>',
        tag2: '<i data-lucide="salad" style="width:13px;height:13px;color:#EB8D70;"></i><span>Brokoli Kukus (90g) · Vit C &amp; Zinc</span>',
        tag3: '<i data-lucide="wheat" style="width:13px;height:13px;color:#EF9F27;"></i><span>Beras Merah (100g) · 23g Karbo</span>',
        polyColor: '#D85A30'
      }
    };

    const data = presets[presetKey] || presets['preset-soft-bubur-gabus'];

    const confEl = document.getElementById('lp-showcase-conf');
    if (confEl) confEl.textContent = `AI Confidence: ${data.conf}`;

    const protEl = document.getElementById('lp-showcase-protein');
    if (protEl) protEl.innerHTML = data.targetProt;

    const calsEl = document.getElementById('lp-showcase-cals');
    if (calsEl) calsEl.innerHTML = data.cals;

    const adviceEl = document.getElementById('lp-showcase-advice');
    if (adviceEl) adviceEl.innerHTML = data.advice;

    const tag1 = document.getElementById('lp-showcase-tag-1');
    if (tag1) tag1.innerHTML = data.tag1;

    const tag2 = document.getElementById('lp-showcase-tag-2');
    if (tag2) tag2.innerHTML = data.tag2;

    const tag3 = document.getElementById('lp-showcase-tag-3');
    if (tag3) tag3.innerHTML = data.tag3;

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
    let factor = 1.5;
    let calFactor = 30;
    let recomFood = '🐟 Ikan Gabus (150g) + 2 Butir Telur Rebus + Tempe';
    let clinicalTip = 'Target 1.5 g/kg BB optimal untuk menstimulasi fibroblas dan sintesis kolagen penutupan luka.';

    if (this.calcState.condition === 'post-surgery') {
      factor = 1.5;
      calFactor = this.calcState.activity === 'bedrest' ? 28 : (this.calcState.activity === 'active' ? 33 : 30);
      recomFood = '🐟 Ikan Gabus (150g) + 2 Butir Telur Rebus + Tempe';
      clinicalTip = 'Target 1.5 g/kg BB optimal untuk menstimulasi fibroblas dan sintesis kolagen penutupan luka.';
    } else if (this.calcState.condition === 'injury-rehab') {
      factor = 1.6;
      calFactor = 32;
      recomFood = '🐟 Ikan Kembung Panggang (Omega-3) + Dada Ayam + Sayur Kelor';
      clinicalTip = 'Target 1.6 g/kg BB kaya EPA/DHA meredakan inflamasi sendi dan regenerasi jaringan tendon.';
    } else if (this.calcState.condition === 'gym-recovery') {
      factor = 1.8;
      calFactor = 35;
      recomFood = '🍗 Dada Ayam Kukus + Ikan Kembung + Telur + Tahu Tempe';
      clinicalTip = 'Target 1.8 g/kg BB untuk hipertrofi otot dan pengisian glikogen pasca-latihan intensif.';
    }

    if (this.calcState.activity === 'bedrest') {
      factor = Math.max(1.2, factor - 0.2);
    } else if (this.calcState.activity === 'active') {
      factor = factor + 0.2;
    }

    const protein = Math.round(w * factor);
    const cals = Math.round(w * calFactor);

    const elProt = document.getElementById('lp-calc-target-protein');
    if (elProt) elProt.innerHTML = `${protein} <span>g Protein / hari</span>`;

    const elCals = document.getElementById('lp-calc-target-cals');
    if (elCals) elCals.textContent = `Total Energi: ~${cals.toLocaleString()} kkal/hari (${factor.toFixed(1)} g/kg BB)`;

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
  // FOODVISOR-STYLE DIAGNOSTIC QUIZ METHODS
  // =========================================================================
  openQuizModal(step = 1) {
    const onboardName = document.getElementById('onboard-name');
    const onboardContact = document.getElementById('onboard-contact');
    if (onboardName && this.userProfile.name && !onboardName.value) {
      onboardName.value = this.userProfile.name;
    }
    if (onboardContact && this.userProfile.contact && !onboardContact.value) {
      onboardContact.value = this.userProfile.contact;
    }
    this.openModal('onboarding-modal');
    this.goToQuizStep(step);
  }

  goToQuizStep(step) {
    this.currentQuizStep = step;
    
    // Update progress indicator
    const stepIndicator = document.getElementById('quiz-step-indicator');
    const stepTitle = document.getElementById('quiz-step-title');
    const progressBar = document.getElementById('quiz-progress-bar');
    
    const titles = [
      'Identitas & Akun Pasien',
      'Sasaran Jalur Pemulihan',
      'Biometrik & Aktivitas Fisik',
      'Gejala Pencernaan & Pantangan',
      'Hasil Diagnostik Gizi Presisi'
    ];

    if (stepIndicator) stepIndicator.textContent = `Langkah ${step} dari 5`;
    if (stepTitle) stepTitle.textContent = titles[step - 1] || 'Kuesioner Diagnostik';
    if (progressBar) progressBar.style.width = `${step * 20}%`;

    // Toggle panes
    document.querySelectorAll('.quiz-step-pane').forEach((pane, idx) => {
      pane.classList.toggle('active', (idx + 1) === step);
    });

    if (step === 3) {
      this.updateLiveBMIDisplay();
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  nextQuizStep() {
    if (this.currentQuizStep === 1) {
      const nameVal = document.getElementById('onboard-name')?.value?.trim();
      if (!nameVal) {
        alert('Mohon masukkan nama lengkap pasien/pengguna terlebih dahulu.');
        document.getElementById('onboard-name')?.focus();
        return;
      }
    }
    if (this.currentQuizStep < 5) {
      this.goToQuizStep(this.currentQuizStep + 1);
    }
  }

  prevQuizStep() {
    if (this.currentQuizStep > 1) {
      this.goToQuizStep(this.currentQuizStep - 1);
    }
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
    const consentChecked = document.getElementById('onboard-consent-check')?.checked;
    if (!consentChecked) {
      alert('Mohon centang persetujuan pernyataan tanggung jawab bersama sebelum melanjutkan.');
      return;
    }

    if (!this.calculatedDiagnostics) {
      this.calculateDiagnosticResults();
    }

    const diag = this.calculatedDiagnostics;
    const contactInput = document.getElementById('onboard-contact')?.value || 'rangga.pratama@email.com';
    const phaseInput = document.getElementById('onboard-phase')?.value || 'Minggu ke-2 (Fase Proliferasi)';
    const restrictionsInput = document.getElementById('onboard-restrictions')?.value || '';

    const conditionTitles = {
      'post-surgery': 'Pasca-Operasi & Bedah',
      'rehab': 'Fisioterapi & Cedera Sendi',
      'gym': 'Gym & Muscle Recovery',
      'wellness': 'Pemeliharaan Gizi Medis'
    };

    this.userProfile.name = diag.name || 'Rangga Pratama';
    this.userProfile.contact = contactInput;
    this.userProfile.gender = diag.gender;
    this.userProfile.age = diag.age;
    this.userProfile.heightCm = diag.height;
    this.userProfile.weightKg = diag.weight;
    this.userProfile.activityLevel = diag.activity;
    this.userProfile.conditionId = diag.condition;
    this.userProfile.conditionTitle = conditionTitles[diag.condition] || 'Pasca-Operasi';
    this.userProfile.phase = phaseInput;
    this.userProfile.restrictions = restrictionsInput;
    this.userProfile.bmi = diag.bmi;
    this.userProfile.bmiCategory = diag.bmiCat;
    this.userProfile.hasAcceptedConsent = true;
    this.userProfile.hasCompletedQuiz = true;

    this.userProfile.targets = {
      protein: diag.protein,
      carbs: diag.carbs,
      fat: diag.fat,
      calories: diag.tdee
    };

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

    this.updateProfileUI();
    this.renderAuthUI();
    progressTracker.renderMacroDonut(this.userProfile.targets);
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
    this.openModal('onboarding-modal');
    this.goToQuizStep(step);

    const onboardName = document.getElementById('onboard-name');
    const onboardContact = document.getElementById('onboard-contact');
    if (onboardName && this.userProfile.name) onboardName.value = this.userProfile.name;
    if (onboardContact && (this.userProfile.contact || this.userProfile.email)) {
      onboardContact.value = this.userProfile.contact || this.userProfile.email;
    }
  }

  // Render Piring Segmentasi di Dashboard Utama
  renderOverviewPlate() {
    const canvas = document.getElementById('overview-plate-canvas');
    if (canvas) {
      cvEngine.renderCanvas(canvas, 170, 170, true);
    }

    // Render Legend
    const legendBox = document.getElementById('overview-segment-legend');
    if (legendBox && cvEngine.currentScan) {
      legendBox.innerHTML = cvEngine.currentScan.segments.map(seg => {
        return `
          <div class="segment-row" 
               onmouseenter="cvEngine.activeHoverSegmentId='${seg.id}'; app.renderOverviewPlate();" 
               onmouseleave="cvEngine.activeHoverSegmentId=null; app.renderOverviewPlate();">
            <span class="segment-swatch" style="background: ${seg.color}"></span>
            <span class="segment-name">
              ${seg.name}
              <span class="confidence-pill">${seg.confidence}%</span>
            </span>
            <span class="segment-values">${seg.portionGrams}g · ${seg.protein[0]}-${seg.protein[1]}g Prot</span>
          </div>
        `;
      }).join('');
    }

    // Update Confidence Note
    const confNote = document.getElementById('overview-conf-note');
    if (confNote && cvEngine.currentScan) {
      confNote.textContent = `Tingkat keyakinan model: ${cvEngine.currentScan.confidenceOverall || 88}% · Format estimasi disajikan dalam rentang gizi pendukung keputusan.`;
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // =========================================================================
  // SCAN & CAMERA WORKFLOW (FR-01, FR-02, FR-03, FR-07)
  // =========================================================================
  openScanModal() {
    this.openModal('scan-modal');
    this.renderScanModalUI();
  }

  renderScanModalUI() {
    // Render presets chip
    const presetContainer = document.getElementById('scan-preset-chips');
    if (presetContainer) {
      presetContainer.innerHTML = NUTRIVISION_DATA.presetScans.map((preset, idx) => {
        return `
          <button class="preset-chip ${cvEngine.currentScan?.id === preset.id ? 'active' : ''}" 
                  onclick="app.selectScanPreset('${preset.id}')">
            ${preset.title.split(' (')[0]}
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
      editList.innerHTML = cvEngine.currentScan.segments.map(seg => {
        return `
          <div class="segment-edit-item ${seg.unrecognized ? 'unrecognized' : ''}">
            <span class="segment-color-dot" style="background: ${seg.color}"></span>
            <div class="segment-edit-info">
              <div class="name">
                ${seg.name} 
                ${seg.unrecognized ? '<span style="font-size:11px;color:var(--amber-600);display:inline-flex;align-items:center;gap:3px;"><i data-lucide="alert-circle" class="btn-icon-sm"></i> Belum Yakin</span>' : ''}
              </div>
              <div class="stats">${seg.portionGrams}g · ${seg.protein[0]}-${seg.protein[1]}g Prot · ${seg.cals[0]}-${seg.cals[1]} kkal · Keyakinan: ${seg.confidence}%</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <input type="number" value="${seg.portionGrams}" min="10" max="800" step="10" 
                     style="width:60px;padding:4px 6px;font-size:12px;border:1px solid var(--line);border-radius:6px;"
                     onchange="app.updateSegmentGrams('${seg.id}', this.value)" title="Ubah porsi gram">
              <button class="btn-remove-segment" onclick="app.removeSegment('${seg.id}')" title="Hapus bahan" style="display:flex;align-items:center;">
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
      aggDisplay.innerHTML = `
        <div style="display:flex;justify-content:space-between;padding:10px 14px;background:var(--bg);border-radius:var(--radius-md);border:1px solid var(--line);font-size:var(--font-sm);">
          <div><b>Total Porsi:</b> ${agg.totalGrams}g</div>
          <div><b>Protein:</b> <span style="color:var(--teal-700);font-weight:700;">${agg.protein[0]} - ${agg.protein[1]} g</span></div>
          <div><b>Kalori:</b> <span style="font-weight:600;">${agg.cals[0]} - ${agg.cals[1]} kkal</span></div>
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

  // Simpan Hasil Scan ke Log Asupan Harian (Gated by Auth)
  saveScanToDailyIntake() {
    this.requireAuth(() => {
      const agg = cvEngine.calculateAggregatedNutrients();
      progressTracker.addLoggedMeal(agg);
      progressTracker.renderMacroDonut(this.userProfile.targets);
      progressTracker.renderWeeklyBarChart();
      this.closeModal('scan-modal');
      this.showToast('✅ Asupan makanan berhasil dicatat ke progres pemulihan harian!');
    }, 'mencatat asupan makanan ke progres harian');
  }

  // =========================================================================
  // KATALOG BAHAN MAKANAN LOKAL INDONESIA (FR-08)
  // =========================================================================
  renderFoodCatalog(searchTerm = '') {
    const grid = document.getElementById('food-catalog-grid');
    if (!grid) return;

    const term = searchTerm.toLowerCase().trim();
    const items = NUTRIVISION_DATA.indonesianFoodDatabase.filter(food => {
      return food.name.toLowerCase().includes(term) || food.category.toLowerCase().includes(term);
    });

    grid.innerHTML = items.map(food => {
      return `
        <div class="catalog-card" onclick="app.addCatalogItemToScan('${food.id}')" title="Klik untuk tambahkan ke piring scan">
          <div class="name">${food.name}</div>
          <div class="portion">Porsi standar: ${food.defaultPortionGrams}g · ${food.price}</div>
          <div class="macros">
            ${food.proteinRange[0]}-${food.proteinRange[1]}g Prot · ${food.calsRange[0]}-${food.calsRange[1]} kkal
          </div>
          <button class="btn-sm-teal" style="margin-top:6px;font-size:11px;display:inline-flex;align-items:center;gap:4px;">
            <i data-lucide="plus" class="btn-icon-sm"></i> Tambah ke Piring
          </button>
        </div>
      `;
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  addCatalogItemToScan(foodId) {
    const food = NUTRIVISION_DATA.indonesianFoodDatabase.find(f => f.id === foodId);
    if (!food) return;

    cvEngine.addSegment(food, food.defaultPortionGrams);
    this.renderScanModalUI();
    this.renderOverviewPlate();
    this.showToast(`Ditambahkan: ${food.name} (${food.defaultPortionGrams}g)`);
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
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
    }
    if (modalId === 'scan-modal') {
      this.deactivateLiveCamera();
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
      if (window.nutriVisionDB && window.nutriVisionDB.isReady) {
        user = await window.nutriVisionDB.login(email, password);
      } else {
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

      const hasQuiz = Boolean(user.hasCompletedQuiz && (user.targetProtein || user.weight));

      this.userProfile = {
        ...this.userProfile,
        id: user.id,
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
      if (this.userProfile.targets) {
        progressTracker.renderMacroDonut(this.userProfile.targets);
      }
      this.closeModal('auth-modal');
      this.goToDashboard('overview');

      if (!hasQuiz || !this.userProfile.targets) {
        this.showToast(`✅ Login Berhasil! Silakan lengkapi data profil & diagnostik nutrisi untuk mengaktifkan dasbor Anda.`);
        this.openDiagnosticQuiz(1);
      } else {
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
      if (window.nutriVisionDB && window.nutriVisionDB.isReady) {
        newUser = await window.nutriVisionDB.register({
          name,
          email,
          password,
          role: 'patient',
          condition: 'post-surgery',
          hasCompletedQuiz: false
        });
      } else {
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
        hasCompletedQuiz: false
      };

      this.saveUserProfile();
      this.updateProfileUI();
      this.renderAuthUI();
      this.closeModal('auth-modal');
      this.goToDashboard('overview');

      this.showToast(`✅ Akun ${name} berhasil dibuat! Silakan lengkapi data kebutuhan dasbor Anda.`);

      // Buka Diagnostik Quiz langkah 1
      this.openDiagnosticQuiz(1);
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
      hasCompletedQuiz: false
    };
    this.saveUserProfile();
    this.updateProfileUI();
    this.renderAuthUI();
    this.goToDashboard('overview');
    this.showToast(`✅ Berhasil masuk dengan akun ${provider}! Silakan lengkapi data dasbor Anda.`);
    this.openDiagnosticQuiz(1);
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
        user = {
          id: 'usr_demo',
          name: 'Rangga Pratama',
          email: cred.email,
          role: 'patient',
          targetProtein: 75,
          hasCompletedQuiz: true
        };
      }

      this.userProfile = {
        ...this.userProfile,
        ...user,
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

      this.showToast(`✅ Masuk sebagai akun demo DB: ${this.userProfile.name}`);
      this.goToDashboard('overview');
    } catch (e) {
      console.error(e);
      this.showToast(`✅ Masuk sebagai profil demo ${conditionKey}`);
      this.goToDashboard('overview');
    }
  }

  handleLogout() {
    if (window.nutriVisionDB) {
      window.nutriVisionDB.logout();
    }
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
    this.showToast('ℹ️ Anda telah berhasil keluar dari akun (Logout).');
    this.goToLanding();
  }

  renderAuthUI() {
    const isLoggedIn = Boolean(this.userProfile && this.userProfile.name && this.userProfile.contact);

    // 1. Landing Page Navbar Actions
    const lpActions = document.getElementById('lp-nav-actions-container');
    if (lpActions) {
      if (isLoggedIn) {
        const initials = (this.userProfile.name || 'P').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const firstName = this.userProfile.name.split(' ')[0];
        lpActions.innerHTML = `
          <button class="lp-btn-nav-primary" onclick="app.goToDashboard('overview')" title="Buka Dasbor Pasien" style="gap:7px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:rgba(255,255,255,0.25);color:#fff;border-radius:50%;font-size:11px;font-weight:700;">${initials}</span>
            <span>Dasbor (${firstName})</span>
          </button>
          <button class="lp-btn-nav-outline" onclick="app.handleLogout()" title="Keluar / Logout" style="padding:0 10px;color:var(--coral-600);">
            <i data-lucide="log-out" style="width:15px;height:15px;"></i>
          </button>
          <button class="lp-mobile-toggle" id="lp-menu-toggle" aria-label="Toggle Menu" onclick="app.toggleLandingMobileMenu()">
            <i data-lucide="menu" style="width:18px;height:18px;"></i>
          </button>
        `;
      } else {
        lpActions.innerHTML = `
          <button class="lp-btn-nav-primary" id="lp-nav-login-btn" onclick="app.openAuthModal('login')" title="Masuk ke Akun NutriVision AI">
            <i data-lucide="log-in" style="width:15px;height:15px;"></i>
            <span>Login</span>
          </button>
          <button class="lp-mobile-toggle" id="lp-menu-toggle" aria-label="Toggle Menu" onclick="app.toggleLandingMobileMenu()">
            <i data-lucide="menu" style="width:18px;height:18px;"></i>
          </button>
        `;
      }
    }

    // 2. Dashboard Topbar Action Buttons
    const topbarLoginBtn = document.getElementById('topbar-login-btn');
    const topbarChip = document.getElementById('topbar-profile-chip');
    if (topbarLoginBtn && topbarChip) {
      if (isLoggedIn) {
        topbarLoginBtn.style.display = 'none';
        topbarChip.style.display = 'inline-flex';
      } else {
        topbarLoginBtn.style.display = 'inline-flex';
        topbarChip.style.display = 'none';
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  openCreatePostModal() {
    this.requireAuth(() => {
      this.openModal('create-post-modal');
    }, 'menerbitkan tips ke ruang komunitas');
  }

  // =========================================================================
  // UTILITIES & NOTIFICATIONS
  // =========================================================================
  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" style="color:var(--teal-300);width:18px;height:18px;flex-shrink:0;"></i><span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  exportCaregiverReport() {
    this.requireAuth(() => {
      const text = progressTracker.generateCaregiverReportText(this.userProfile);
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Ringkasan laporan gizi berhasil disalin ke clipboard!');
      }).catch(() => {
        alert(text);
      });
    }, 'mengekspor laporan telehealth pasien');
  }

  copyCaregiverShareLink() {
    this.requireAuth(() => {
      const link = caregiverHandler.generateSharedLink();
      navigator.clipboard.writeText(link).then(() => {
        this.showToast('Tautan akses pendamping (view-only) berhasil disalin!');
      }).catch(() => {
        alert('Tautan akses: ' + link);
      });
    }, 'membagikan tautan pendamping pasien');
  }

  // Setup Event Listeners
  setupEventListeners() {
    // Desktop Nav Items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = btn.dataset.sec;
        if (sec) this.navigate(sec);
      });
    });

    // Mobile Bottom Nav Items
    document.querySelectorAll('.bottom-nav-pwa .bottom-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = btn.dataset.sec;
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

    // Modal background click to close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal && modal.id !== 'onboarding-modal') {
          this.closeModal(modal.id);
        }
      });
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
}

// Inisialisasi Instance Aplikasi
const app = new NutriVisionApp();

window.refreshIcons = function() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
  window.refreshIcons();
});

window.addEventListener('load', () => {
  window.refreshIcons();
});
