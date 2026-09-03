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
          role: parsed.role || 'patient',
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
      highContrast: false
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
    const isAdmin = Boolean(this.userProfile && this.userProfile.role === 'admin');
    const hasData = Boolean(this.userProfile.hasCompletedQuiz && this.userProfile.name) || isAdmin;
    const initials = isAdmin ? 'AD' : (hasData ? (this.userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P') : '+');

    // 1. Update Topbar Greeting
    const greetingEl = document.querySelector('.topbar-greeting h1');
    if (greetingEl) {
      if (isAdmin) {
        greetingEl.innerHTML = `Panel Administrator: <span class="user-name-placeholder" style="color:var(--matcha-600);">Super Admin Telemetri</span>`;
      } else {
        greetingEl.innerHTML = hasData
          ? `Selamat siang, <span class="user-name-placeholder">${this.userProfile.name.split(' ')[0]}</span>`
          : `Selamat datang di <span style="color:var(--teal-700);">NutriVision AI</span>`;
      }
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

    // Toggle Patient vs Super Admin Sidebar Navigation Groups
    const patientNav = document.getElementById('sidebar-nav-patient');
    const adminNav = document.getElementById('sidebar-nav-admin');
    if (patientNav) patientNav.style.display = isAdmin ? 'none' : 'flex';
    if (adminNav) adminNav.style.display = isAdmin ? 'flex' : 'none';

    // Hide mobile bottom nav & scan floating button for admin (admin does not need patient input tools)
    const bottomNav = document.querySelector('.bottom-nav-pwa');
    const fabBtn = document.querySelector('.fab-scan-btn');
    if (bottomNav) bottomNav.style.display = isAdmin ? 'none' : '';
    if (fabBtn) fabBtn.style.display = isAdmin ? 'none' : '';

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
      if (isAdmin) {
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="app.goToAdminPortal()" title="Buka Super Admin Command Center">
              <div class="profile-avatar" style="background:linear-gradient(135deg,#9EA76B,#353C1B);color:#fff;font-weight:800;flex-shrink:0;">AD</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Super Administrator</b>
                <span style="font-size:10.5px;color:#D6DCB2;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Root Telemetry &amp; DB</span>
              </div>
            </div>
            <button type="button" class="sidebar-logout-btn" onclick="event.stopPropagation(); app.handleLogout();" title="Logout &amp; Kembali ke Landing Page" aria-label="Keluar / Logout">
              <i data-lucide="log-out" style="width:15px;height:15px;"></i>
            </button>
          </div>
        `;
      } else if (hasData) {
        sidebarProfileCard.innerHTML = `
          <div class="sidebar-profile-flex">
            <div class="sidebar-profile-info" onclick="app.navigate('profile')" title="Buka Profil & Diagnostik">
              <div class="profile-avatar" style="background:linear-gradient(135deg,var(--coral-300),var(--coral-500));color:#fff;font-weight:700;flex-shrink:0;">${initials}</div>
              <div style="min-width:0;flex:1;">
                <b style="color:#fff;font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.userProfile.name}</b>
                <span style="font-size:10.5px;color:#EFE8CA;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this.userProfile.conditionTitle}</span>
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
                <span style="font-size:10.5px;color:#EFE8CA;display:block;">Klik untuk mulai</span>
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
    const isAdmin = Boolean(this.userProfile && this.userProfile.role === 'admin');

    // Database modal exception
    if (sectionId === 'database') {
      this.openDatabaseSyncModal();
      return;
    }

    // Role-based route guard & redirect
    if (isAdmin) {
      if (sectionId === 'overview' || sectionId === 'progress' || sectionId === 'caregiver' || sectionId === 'community' || sectionId === 'profile') {
        sectionId = 'admin';
      } else if (sectionId === 'planner' || sectionId === 'catalog') {
        sectionId = 'admin-clinical-menu';
      }
    } else {
      if (sectionId === 'admin' || sectionId === 'admin-clinical-menu' || sectionId === 'admin-audit') {
        sectionId = 'overview';
      }
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

    if (sectionId === 'catalog') {
      this.renderFoodCatalog();
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
    if (this.userProfile && this.userProfile.role === 'admin' && sectionId === 'overview' && !this.isAdminPreviewMode) {
      this.goToAdminPortal();
      return;
    }

    // Validasi Wajib Isi: User biasa harus menyelesaikan 3 langkah pengisian profil sebelum masuk dashboard
    const isAdmin = Boolean(this.userProfile && this.userProfile.role === 'admin');
    const hasCompleted = Boolean(this.userProfile && this.userProfile.hasCompletedQuiz && this.userProfile.name);

    if (!isAdmin && !hasCompleted) {
      this.isLanding = false;
      document.body.classList.remove('is-landing-active');
      this.navigate(sectionId);
      setTimeout(() => {
        this.openQuizModal(1);
        this.showToast('Lengkapi 3 langkah profil pemulihan untuk mengaktifkan dasbor.', 'info');
      }, 100);
      return;
    }

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
    document.querySelectorAll('.lp-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetKey);
    });

    const emptyState = document.getElementById('lp-showcase-empty-state');
    const polyProt = document.getElementById('lp-poly-prot');
    const polyCarb = document.getElementById('lp-poly-carb');
    const polyVeg  = document.getElementById('lp-poly-veg');
    const donutCircle = document.getElementById('lp-showcase-donut');
    const donutVal = document.getElementById('lp-showcase-donut-val');

    if (presetKey === 'preset-empty' || !presetKey) {
      if (emptyState) emptyState.style.display = 'flex';
      if (polyProt) polyProt.style.display = 'none';
      if (polyCarb) polyCarb.style.display = 'none';
      if (polyVeg)  polyVeg.style.display = 'none';

      if (donutCircle) donutCircle.style.strokeDashoffset = '251.2';
      if (donutVal) donutVal.textContent = '0%';

      const confEl = document.getElementById('lp-showcase-conf');
      if (confEl) confEl.innerHTML = '<iconify-icon icon="solar:shield-check-bold-duotone" style="font-size:15px;color:#9EA76B;"></iconify-icon><span>Status AI: Siap Memindai</span>';

      const protEl = document.getElementById('lp-showcase-protein');
      if (protEl) protEl.innerHTML = 'Target Protein: 0g / 98g';

      const calsEl = document.getElementById('lp-showcase-cals');
      if (calsEl) calsEl.innerHTML = 'Densitas Energi: 0 kkal (Piring Kosong · Menunggu Pemindaian)';

      const adviceEl = document.getElementById('lp-showcase-advice');
      if (adviceEl) adviceEl.innerHTML = '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Panduan AI:</strong> Belum ada data makanan yang dihitung. Silakan pilih salah satu menu sampel di atas untuk simulasi segmentasi, atau gunakan tombol scan untuk menguji foto piring asli.</span>';

      const tag1 = document.getElementById('lp-showcase-tag-1');
      if (tag1) tag1.innerHTML = '<iconify-icon icon="solar:fish-bold-duotone" style="font-size:14px;color:#9EA76B;"></iconify-icon><span>Komponen Protein: Belum terdeteksi</span>';

      const tag2 = document.getElementById('lp-showcase-tag-2');
      if (tag2) tag2.innerHTML = '<iconify-icon icon="solar:bowl-bold-duotone" style="font-size:14px;color:#EB8D70;"></iconify-icon><span>Komponen Karbohidrat: Belum terdeteksi</span>';

      const tag3 = document.getElementById('lp-showcase-tag-3');
      if (tag3) tag3.innerHTML = '<iconify-icon icon="solar:leaf-bold-duotone" style="font-size:14px;color:#EF9F27;"></iconify-icon><span>Sayur &amp; Serat: Belum terdeteksi</span>';
      return;
    }

    // Showing sample preset data
    if (emptyState) emptyState.style.display = 'none';
    if (polyProt) polyProt.style.display = 'block';
    if (polyCarb) polyCarb.style.display = 'block';
    if (polyVeg)  polyVeg.style.display = 'block';

    const presets = {
      'preset-soft-bubur-gabus': {
        conf: '96%',
        donutPct: 68,
        targetProt: 'Target Protein: 32g / 98g',
        cals: 'Densitas Energi: 385 kkal (Tekstur Lunak · Fase 2 Pasca-Bedah)',
        advice: '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Saran Klinis:</strong> Tekstur bubur saring sangat ramah untuk pasien pasca-anestesi &amp; disfagia. Albumin Ikan Gabus memicu granulasi luka 2x lebih cepat.</span>',
        tag1: '<iconify-icon icon="solar:fish-bold-duotone" style="font-size:14px;color:#9EA76B;"></iconify-icon><span>Ikan Gabus (110g) · 26g Prot [Albumin]</span>',
        tag2: '<iconify-icon icon="solar:bowl-bold-duotone" style="font-size:14px;color:#EB8D70;"></iconify-icon><span>Bubur Beras Lembut (220g) · 35g Karbo</span>',
        tag3: '<iconify-icon icon="solar:egg-bold-duotone" style="font-size:14px;color:#EF9F27;"></iconify-icon><span>Telur Tim Sutra (90g) · 6.8g Prot</span>'
      },
      'preset-standard-nasi-ayam': {
        conf: '91%',
        donutPct: 77,
        targetProt: 'Target Protein: 38g / 98g',
        cals: 'Densitas Energi: 465 kkal (Gizi Seimbang · Fase 3)',
        advice: '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Saran Klinis:</strong> Asam amino lengkap pada dada ayam tanpa kulit mendukung regenerasi sel otot &amp; pembentukan enzim perbaikan jaringan.</span>',
        tag1: '<iconify-icon icon="solar:cup-hot-bold-duotone" style="font-size:14px;color:#9EA76B;"></iconify-icon><span>Dada Ayam Panggang (125g) · 31g Prot</span>',
        tag2: '<iconify-icon icon="solar:bowl-bold-duotone" style="font-size:14px;color:#EB8D70;"></iconify-icon><span>Nasi Putih (175g) · 52g Karbo</span>',
        tag3: '<iconify-icon icon="solar:leaf-bold-duotone" style="font-size:14px;color:#EF9F27;"></iconify-icon><span>Tumis Kangkung &amp; Telur · Vit A/C</span>'
      },
      'preset-fish-kembung': {
        conf: '94%',
        donutPct: 83,
        targetProt: 'Target Protein: 41g / 98g',
        cals: 'Densitas Energi: 430 kkal (Kaya Omega-3 · Pangan Lokal)',
        advice: '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Saran Klinis:</strong> Ikan kembung mengandung asam lemak Omega-3 EPA/DHA setara salmon untuk meredakan inflamasi pembengkakan dengan harga terjangkau.</span>',
        tag1: '<iconify-icon icon="solar:fish-bold-duotone" style="font-size:14px;color:#9EA76B;"></iconify-icon><span>Ikan Kembung (140g) · 29g Prot [Omega-3]</span>',
        tag2: '<iconify-icon icon="solar:bowl-bold-duotone" style="font-size:14px;color:#EB8D70;"></iconify-icon><span>Tempe Kukus (80g) · 15g Prot</span>',
        tag3: '<iconify-icon icon="solar:leaf-bold-duotone" style="font-size:14px;color:#EF9F27;"></iconify-icon><span>Sayur Bening Bayam · Zat Besi</span>'
      },
      'preset-salmon-quinoa': {
        conf: '95%',
        donutPct: 73,
        targetProt: 'Target Protein: 36g / 98g',
        cals: 'Densitas Energi: 420 kkal (Antioksidan Tinggi · Rekondisi)',
        advice: '<iconify-icon icon="solar:lightbulb-bolt-bold-duotone" style="font-size:19px;color:#9EA76B;flex-shrink:0;margin-top:2px;"></iconify-icon><span><strong>Saran Klinis:</strong> Asam amino esensial dan sulforaphane brokoli menekan radikal bebas inflamasi pada fase remodeling jaringan.</span>',
        tag1: '<iconify-icon icon="solar:fish-bold-duotone" style="font-size:14px;color:#9EA76B;"></iconify-icon><span>Fillet Salmon (130g) · 28g Prot</span>',
        tag2: '<iconify-icon icon="solar:leaf-bold-duotone" style="font-size:14px;color:#EB8D70;"></iconify-icon><span>Brokoli Kukus (90g) · Vit C &amp; Zinc</span>',
        tag3: '<iconify-icon icon="solar:bowl-bold-duotone" style="font-size:14px;color:#EF9F27;"></iconify-icon><span>Beras Merah (100g) · 23g Karbo</span>'
      }
    };

    const data = presets[presetKey] || presets['preset-soft-bubur-gabus'];

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

    const tag1 = document.getElementById('lp-showcase-tag-1');
    if (tag1) tag1.innerHTML = data.tag1;

    const tag2 = document.getElementById('lp-showcase-tag-2');
    if (tag2) tag2.innerHTML = data.tag2;

    const tag3 = document.getElementById('lp-showcase-tag-3');
    if (tag3) tag3.innerHTML = data.tag3;
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
  // FOODVISOR-STYLE DIAGNOSTIC QUIZ METHODS (3 STEPS WITH BULLET PAGINATION)
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

  validateQuizStep(step) {
    if (step === 1) {
      const nameVal = document.getElementById('onboard-name')?.value?.trim();
      const contactVal = document.getElementById('onboard-contact')?.value?.trim();
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
        this.showToast('Silakan centang persetujuan disclaimer medis terlebih dahulu.', 'warning');
        return false;
      }
      return true;
    }

    return true;
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

    // Di Step 3: Hitung otomatis live BMI & Target gizi
    if (this.currentQuizStep === 3) {
      this.updateLiveBMIDisplay();
      this.calculateDiagnosticResults();
    }

    // Kontrol tombol Close X: hanya boleh muncul jika profil sudah pernah selesai sebelumnya
    const closeBtn = document.getElementById('onboarding-close-btn');
    if (closeBtn) {
      closeBtn.style.display = (this.userProfile?.hasCompletedQuiz && this.userProfile?.name) ? 'inline-flex' : 'none';
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
    if (this.userProfile?.hasCompletedQuiz && this.userProfile?.name) {
      this.closeModal('onboarding-modal');
    } else {
      this.showToast('Pengisian profil wajib diselesaikan untuk membuka Dasbor.', 'warning');
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

  // Render Piring Segmentasi di Dashboard Utama (Simple 2-Column Split)
  renderOverviewPlate() {
    const canvas = document.getElementById('overview-plate-canvas');
    if (canvas) {
      cvEngine.renderCanvas(canvas, 170, 170, true);
    }

    if (!cvEngine.currentScan) return;
    const segments = cvEngine.currentScan.segments || [];
    const totalGrams = segments.reduce((sum, s) => sum + (s.portionGrams || 0), 0) || 1;
    const totalProtMin = segments.reduce((sum, s) => sum + (s.protein ? s.protein[0] : 0), 0);
    const totalProtMax = segments.reduce((sum, s) => sum + (s.protein ? s.protein[1] : 0), 0);
    const overallConf = cvEngine.currentScan.confidenceOverall || 88;

    // 1. Render Left Column Diagram Stats
    const diagramStatsBox = document.getElementById('overview-diagram-stats');
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

    const totalBadge = document.getElementById('overview-total-badge');
    if (totalBadge) {
      totalBadge.textContent = `${segments.length} Komponen`;
    }

    // 2. Render Right Column Segment Legend with Clean Percentage Bars
    const legendBox = document.getElementById('overview-segment-legend');
    if (legendBox) {
      legendBox.innerHTML = segments.map(seg => {
        const portionPct = Math.round(((seg.portionGrams || 0) / totalGrams) * 100);
        const isHovered = (cvEngine.activeHoverSegmentId === seg.id);
        return `
          <div class="segment-row ${isHovered ? 'hovered' : ''}" 
               onmouseenter="cvEngine.activeHoverSegmentId='${seg.id}'; app.renderOverviewPlate();" 
               onmouseleave="cvEngine.activeHoverSegmentId=null; app.renderOverviewPlate();">
            <div class="segment-row-top">
              <div class="segment-row-left">
                <span class="segment-swatch" style="background: ${seg.color}"></span>
                <span class="segment-name">${seg.name}</span>
              </div>
              <div class="segment-row-right">
                <span class="segment-portion-pct">${portionPct}% Porsi</span>
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

    // Update Confidence Note
    const confNote = document.getElementById('overview-conf-note');
    if (confNote) {
      confNote.textContent = `Tingkat keyakinan model: ${overallConf}% · Format estimasi disajikan dalam rentang gizi pendukung keputusan.`;
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
  // OUR POPULAR MENU / KATALOG GIZI MAKANAN MODERN (MATCHING MOCKUP)
  // =========================================================================
  filterCatalogCategory(category, btnElement) {
    this.activeCatalogCategory = category;
    document.querySelectorAll('.popular-category-pills .cat-pill-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) {
      btnElement.classList.add('active');
    }
    const searchVal = document.getElementById('food-catalog-search')?.value || '';
    this.renderFoodCatalog(searchVal);
  }

  scrollCatalogGrid(direction) {
    const grid = document.getElementById('food-catalog-grid');
    if (grid) {
      grid.scrollBy({ left: direction * 320, behavior: 'smooth' });
    }
  }

  toggleFavoriteFood(foodId, event) {
    if (event) event.stopPropagation();
    if (!this.favoriteFoods) this.favoriteFoods = new Set();
    if (this.favoriteFoods.has(foodId)) {
      this.favoriteFoods.delete(foodId);
      this.showToast('Dihapus dari favorit.');
    } else {
      this.favoriteFoods.add(foodId);
      this.showToast('Disimpan ke menu favorit!');
    }
    const searchVal = document.getElementById('food-catalog-search')?.value || '';
    this.renderFoodCatalog(searchVal);
  }

  renderFoodCatalog(searchTerm = '') {
    const grid = document.getElementById('food-catalog-grid');
    if (!grid) return;

    if (!this.activeCatalogCategory) this.activeCatalogCategory = 'all';
    if (!this.favoriteFoods) this.favoriteFoods = new Set();

    const term = searchTerm.toLowerCase().trim();
    const items = NUTRIVISION_DATA.indonesianFoodDatabase.filter(food => {
      let matchCat = (this.activeCatalogCategory === 'all');
      if (!matchCat) {
        if (this.activeCatalogCategory === 'soft') {
          matchCat = food.texture === 'soft' || food.texture === 'liquid';
        } else {
          matchCat = (food.category === this.activeCatalogCategory);
        }
      }
      const matchSearch = !term || 
        food.name.toLowerCase().includes(term) || 
        (food.subtitle && food.subtitle.toLowerCase().includes(term)) || 
        (food.clinicalIndication && food.clinicalIndication.toLowerCase().includes(term)) ||
        (food.tkpiCode && food.tkpiCode.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty-state">
          <i data-lucide="search-x" style="width:40px;height:40px;color:#94A3B8;margin-bottom:8px;"></i>
          <h4>Menu tidak ditemukan</h4>
          <p>Coba kata kunci lain atau pilih kategori menu di atas.</p>
        </div>
      `;
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      return;
    }

    grid.innerHTML = items.map(food => {
      const isFav = this.favoriteFoods.has(food.id);
      const subtitle = food.subtitle || `${food.defaultPortionGrams}g · ${food.protein}g Prot · ${food.calories} kkal`;
      const clinicalTag = food.clinicalIndication || 'Pemulihan Klinis';
      const bappenasRef = food.bappenasRef || 'Bapanas: Standar Nasional';
      const tkpiCode = food.tkpiCode || 'TKPI 2024';

      return `
        <div class="popular-food-card" onclick="app.addCatalogItemToScan('${food.id}')" title="Klik untuk tambahkan ke piring scan">
          <!-- Floating Round Dish Image & Top Actions -->
          <div class="food-card-top">
            <div class="food-dish-plate-wrap">
              <img src="${food.image}" alt="${food.name}" class="food-dish-img" loading="lazy" onerror="this.src='icons/icon-192.png'" />
            </div>

            <!-- Pencarian Populer & Love/Suka Button Aligned Side-by-Side -->
            <div class="food-card-header-actions" onclick="event.stopPropagation();">
              <span class="food-popular-badge" title="Status Pencarian Populer Pasien">
                <iconify-icon icon="solar:fire-bold" class="popular-fire-icon"></iconify-icon>
                <span>Populer</span>
              </span>
              <button type="button" class="food-fav-btn ${isFav ? 'active' : ''}" 
                      onclick="event.stopPropagation(); app.toggleFavoriteFood('${food.id}', event);" 
                      title="${isFav ? 'Disukai (Klik untuk batalkan)' : 'Suka / Simpan ke Menu Favorit'}"
                      aria-label="Suka">
                <iconify-icon icon="${isFav ? 'solar:heart-bold' : 'solar:heart-linear'}" class="fav-heart-icon"></iconify-icon>
              </button>
            </div>
          </div>

          <!-- Card Content -->
          <div class="food-card-body">
            <div class="food-tag-row">
              <span class="food-clinical-tag">
                <iconify-icon icon="solar:shield-check-bold" style="font-size:12px;"></iconify-icon>
                ${clinicalTag}
              </span>
              <span class="food-tkpi-badge" title="Data Komposisi Gizi Terverifikasi Bappenas & TKPI Kemenkes RI">
                <iconify-icon icon="solar:verified-check-bold" style="font-size:11px;color:#9EA76B;"></iconify-icon>
                ${tkpiCode}
              </span>
            </div>
            <h4 class="food-card-title">${food.name}</h4>
            <p class="food-card-sub">${subtitle}</p>

            <div class="food-macro-pills-row">
              <span class="macro-pill-item prot">🥩 ${food.protein}g Prot</span>
              <span class="macro-pill-item carb">🍞 ${food.carbs}g Karbo</span>
              <span class="macro-pill-item cal">⚡ ${food.calories} kkal</span>
            </div>

            <div class="food-card-footer">
              <button class="food-cart-btn" 
                      onclick="event.stopPropagation(); app.addCatalogItemToScan('${food.id}');" 
                      title="Tambah ke Piring Scan">
                <iconify-icon icon="solar:add-circle-bold" style="font-size:18px;"></iconify-icon>
              </button>
              <div class="food-card-price-group">
                <span class="food-card-price">${food.price} <small style="font-size:10px;color:#64748B;font-weight:500;">/porsi</small></span>
                <span class="food-bappenas-ref" title="Acuan Harga Pasar Eceran Bapanas RI">${bappenasRef}</span>
              </div>
            </div>
          </div>
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
    this.showToast(`Ditambahkan ke piring: ${food.name} (${food.defaultPortionGrams}g)`);
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
        role: user.role || 'patient',
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

  handleLogout() {
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

    this.updateProfileUI();
    this.renderAuthUI();
    this.showToast('ℹ️ Anda telah berhasil keluar dari akun (Logout).');
    this.goToLanding();
  }

  renderAuthUI() {
    const isLoggedIn = Boolean(this.userProfile && this.userProfile.name && this.userProfile.contact);
    const isAdmin = Boolean(this.userProfile && this.userProfile.role === 'admin');

    // 1. Landing Page Navbar Actions
    const lpActions = document.getElementById('lp-nav-actions-container');
    if (lpActions) {
      if (isLoggedIn) {
        const initials = isAdmin ? 'AD' : (this.userProfile.name || 'P').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const firstName = isAdmin ? 'Super Admin' : this.userProfile.name.split(' ')[0];
        const targetAction = isAdmin ? 'app.goToAdminPortal()' : "app.goToDashboard('overview')";
        const targetTitle = isAdmin ? 'Buka Super Admin Command Center' : 'Buka Dasbor Pasien';
        const targetLabel = isAdmin ? 'Admin Portal' : `Dasbor (${firstName})`;

        lpActions.innerHTML = `
          <button class="lp-btn-nav-primary" onclick="${targetAction}" title="${targetTitle}" style="gap:7px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:rgba(255,255,255,0.25);color:#fff;border-radius:50%;font-size:11px;font-weight:700;">${initials}</span>
            <span>${targetLabel}</span>
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
            <i data-lucide="log-in" class="btn-icon-sm" style="width:15px;height:15px;"></i>
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
  showToast(message, type = 'auto') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    let isError = type === 'error' || /❌|gagal|error|batal|peringatan/i.test(message);
    let isWarning = type === 'warning' || /⚠️|perhatian|notice/i.test(message);
    let isSuccess = type === 'success' || /✅|sukses|berhasil/i.test(message);

    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' toast-error' : (isWarning ? ' toast-warning' : (isSuccess ? ' toast-success' : '')));

    const iconName = isError ? 'alert-triangle' : (isWarning ? 'alert-circle' : (isSuccess ? 'check-circle' : 'info'));
    const iconColor = isError ? '#FCA5A5' : (isWarning ? '#FDE68A' : (isSuccess ? '#86EFAC' : 'var(--teal-300)'));

    toast.innerHTML = `<i data-lucide="${iconName}" style="color:${iconColor};width:18px;height:18px;flex-shrink:0;"></i><span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: toast });
    }

    const duration = isError ? 5500 : (isWarning ? 4200 : 3200);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
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
        ? scan.components.map(c => `<span style="display:inline-block;padding:1px 6px;margin:2px;background:#F0FDF4;color:#166534;border:1px solid #DCFCE7;border-radius:4px;font-size:10.5px;">${c.name} (${c.grams}g)</span>`).join('')
        : '<span style="color:var(--ink-mute);font-size:11px;">1 Porsi Terintegrasi</span>';

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
    this.showToast('📥 Berkas telemetri &amp; jejak audit JSON berhasil diunduh.');
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
