// NutriVision AI — Core Application Logic, State Manager & Router (PWA)
// Sesuai seluruh spesifikasi PRD Gayatama 5 (FR-01 s/d FR-13 & Non-Fungsional)

class NutriVisionApp {
  constructor() {
    this.userProfile = this.loadUserProfile();
    this.activeSection = 'overview';
    this.deferredInstallPrompt = null;
  }

  // Muat data profil pengguna dari LocalStorage atau inisialisasi default
  loadUserProfile() {
    const saved = localStorage.getItem('nutrivision_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing user profile:', e);
      }
    }
    return {
      name: 'Rangga Pratama',
      conditionId: 'post-surgery',
      conditionTitle: 'Pasca-Operasi Usus Buntu',
      phase: 'Minggu ke-2 (Fase Proliferasi)',
      weightKg: 65,
      restrictions: 'Alergi makanan pedas pekat, hindari gorengan keras',
      hasAcceptedConsent: true, // Ubah ke true jika sudah onboarding
      targets: {
        protein: 75,
        carbs: 240,
        fat: 55,
        calories: 1850
      },
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
  init() {
    console.log('🚀 Initializing NutriVision AI PWA...');
    this.registerServiceWorker();
    this.setupPWAInstallPrompt();
    this.setupEventListeners();
    this.applyAccessibilitySettings();
    this.updateProfileUI();

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

    // Inisialisasi ikon Lucide (Figma / Iconify standard)
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // Jika pengguna belum menyetujui disclaimer medis / onboarding
    if (!this.userProfile.hasAcceptedConsent) {
      this.openModal('onboarding-modal');
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

  // Update Header dan Ringkasan UI Profil
  updateProfileUI() {
    const nameEls = document.querySelectorAll('.user-name-placeholder');
    nameEls.forEach(el => el.textContent = this.userProfile.name);

    const conditionEls = document.querySelectorAll('.user-condition-placeholder');
    conditionEls.forEach(el => el.textContent = `${this.userProfile.conditionTitle} · ${this.userProfile.phase}`);

    const avatarEls = document.querySelectorAll('.user-avatar-placeholder');
    const initials = this.userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    avatarEls.forEach(el => el.textContent = initials || 'R');
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

  // Simpan Hasil Scan ke Log Asupan Harian
  saveScanToDailyIntake() {
    const agg = cvEngine.calculateAggregatedNutrients();
    progressTracker.addLoggedMeal(agg);
    progressTracker.renderMacroDonut(this.userProfile.targets);
    progressTracker.renderWeeklyBarChart();
    this.closeModal('scan-modal');
    this.showToast('✅ Asupan makanan berhasil dicatat ke progres pemulihan harian!');
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
  // ONBOARDING & PROFILE EDITING (FR-04, FR-06)
  // =========================================================================
  saveOnboardingProfile() {
    const nameInput = document.getElementById('onboard-name')?.value || 'Rangga Pratama';
    const conditionRadio = document.querySelector('input[name="onboard-condition"]:checked')?.value || 'post-surgery';
    const phaseInput = document.getElementById('onboard-phase')?.value || 'Minggu ke-2';
    const weightInput = parseInt(document.getElementById('onboard-weight')?.value, 10) || 65;
    const restrictionsInput = document.getElementById('onboard-restrictions')?.value || '';
    const consentChecked = document.getElementById('onboard-consent-check')?.checked;

    if (!consentChecked) {
      alert('Mohon centang pernyataan persetujuan disclaimer tanggung jawab bersama sebelum melanjutkan.');
      return;
    }

    const profilePreset = NUTRIVISION_DATA.recoveryProfiles[conditionRadio];

    this.userProfile.name = nameInput;
    this.userProfile.conditionId = conditionRadio;
    this.userProfile.conditionTitle = profilePreset.title;
    this.userProfile.phase = phaseInput;
    this.userProfile.weightKg = weightInput;
    this.userProfile.restrictions = restrictionsInput;
    this.userProfile.hasAcceptedConsent = true;

    // Hitung target otomatis berdasarkan berat badan jika ada
    const calcProtein = Math.round(weightInput * (profilePreset.proteinMultiplier || 1.5));
    this.userProfile.targets = {
      protein: calcProtein,
      carbs: profilePreset.recommendedTargets.carbs,
      fat: profilePreset.recommendedTargets.fat,
      calories: profilePreset.recommendedTargets.calories
    };

    this.saveUserProfile();
    progressTracker.renderMacroDonut(this.userProfile.targets);
    this.closeModal('onboarding-modal');
    this.showToast('Profil pemulihan & target gizi berhasil disimpan!');
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
    const text = progressTracker.generateCaregiverReportText(this.userProfile);
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Ringkasan laporan gizi berhasil disalin ke clipboard!');
    }).catch(() => {
      alert(text);
    });
  }

  copyCaregiverShareLink() {
    const link = caregiverHandler.generateSharedLink();
    navigator.clipboard.writeText(link).then(() => {
      this.showToast('Tautan akses pendamping (view-only) berhasil disalin!');
    }).catch(() => {
      alert('Tautan akses: ' + link);
    });
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
  }
}

// Inisialisasi Instance Aplikasi
const app = new NutriVisionApp();
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
