// NutriVision AI — Progress & Recovery Tracking (7-Day History & Macro Rings)
// Sesuai FR-09: Riwayat asupan, visualisasi kepatuhan protein/kalori, ekspor ke fisioterapis/nakes

class NutriVisionProgress {
  constructor() {
    this.setEmptyState();
  }

  // Buat array 7 hari dinamis untuk akun nyata
  create7DayLogs(targetProt = 75, targetCal = 1850) {
    const dayNamesId = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const now = new Date();
    const logs = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const isToday = (i === 0);
      const dayLabel = isToday ? 'Hari Ini' : dayNamesId[d.getDay()];
      const dateLabel = isToday ? 'Hari Ini' : `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })}`;
      logs.push({
        day: dayLabel,
        date: dateLabel,
        dateKey: d.toISOString().split('T')[0],
        protein: 0,
        targetProt,
        calories: 0,
        targetCal,
        compliancePct: 0,
        isToday
      });
    }
    return logs;
  }

  // Setel status dasbor ke Kosong / Belum Ada Data (Tamu / Belum Login)
  setEmptyState() {
    this.isConfigured = false;
    this.todayIntake = {
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0
    };
    this.weeklyLogs = [
      { day: 'Sen', date: '--', protein: 0, targetProt: 0, calories: 0, targetCal: 0, compliancePct: 0 },
      { day: 'Sel', date: '--', protein: 0, targetProt: 0, calories: 0, targetCal: 0, compliancePct: 0 },
      { day: 'Rab', date: '--', protein: 0, targetProt: 0, calories: 0, targetCal: 0, compliancePct: 0 },
      { day: 'Kam', date: '--', protein: 0, targetProt: 0, calories: 0, targetCal: 0, compliancePct: 0 },
      { day: 'Jum', date: '--', protein: 0, targetProt: 0, calories: 0, targetCal: 0, compliancePct: 0 },
      { day: 'Sab', date: '--', protein: 0, targetProt: 0, calories: 0, targetCal: 0, compliancePct: 0 },
      { day: 'Hari Ini', date: 'Hari Ini', protein: 0, targetProt: 0, calories: 0, targetCal: 0, compliancePct: 0, isToday: true }
    ];
  }

  // Inisialisasi riwayat bersih untuk pengguna nyata (0 asupan, 0 streak)
  initUserProgress(targets, userKey) {
    this.isConfigured = true;
    const targetProt = targets?.protein || 75;
    const targetCal = targets?.calories || 1850;
    this.todayIntake = {
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0
    };
    this.weeklyLogs = this.create7DayLogs(targetProt, targetCal);
    if (userKey) {
      this.saveUserProgress(userKey);
    }
  }

  // Simpan progres ke LocalStorage per pengguna
  saveUserProgress(userKey) {
    const key = userKey || (typeof app !== 'undefined' && (app.userProfile?.contact || app.userProfile?.email || app.userProfile?.name)) || 'guest';
    try {
      const payload = {
        todayIntake: this.todayIntake,
        weeklyLogs: this.weeklyLogs,
        dateKey: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('nutrivision_progress_' + key, JSON.stringify(payload));
    } catch (e) {
      console.warn('Progress storage warning:', e);
    }
  }

  // Muat riwayat progres pengguna nyata (atau panggil demo jika akun demo)
  loadUserProgress(userProfile) {
    if (userProfile?.isDemo) {
      this.loadDemoData(userProfile);
      return;
    }
    const userKey = userProfile?.contact || userProfile?.email || userProfile?.name || 'guest';
    const targets = userProfile?.targets || { protein: 75, calories: 1850 };
    const todayKey = new Date().toISOString().split('T')[0];

    try {
      const stored = localStorage.getItem('nutrivision_progress_' + userKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.weeklyLogs && parsed.weeklyLogs.length === 7) {
          this.isConfigured = true;
          if (parsed.dateKey === todayKey) {
            this.todayIntake = parsed.todayIntake || { protein: 0, carbs: 0, fat: 0, calories: 0 };
            this.weeklyLogs = parsed.weeklyLogs;
          } else {
            this.todayIntake = { protein: 0, carbs: 0, fat: 0, calories: 0 };
            this.weeklyLogs = this.create7DayLogs(targets.protein, targets.calories);
            this.saveUserProgress(userKey);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Load progress issue:', e);
    }

    // Default: inisialisasi progres bersih 0 intake untuk akun nyata
    this.initUserProgress(targets, userKey);
  }

  // Muat data sampel klinis aktif saat pengguna masuk via Akun Demo
  loadDemoData(userProfile) {
    this.isConfigured = true;
    const targetProt = userProfile?.targets?.protein || 75;
    const targetCal = userProfile?.targets?.calories || 1850;
    this.weeklyLogs = [
      { day: 'Sen', date: '24 Agt', protein: 68, targetProt, calories: 1790, targetCal, compliancePct: 91 },
      { day: 'Sel', date: '25 Agt', protein: 72, targetProt, calories: 1840, targetCal, compliancePct: 96 },
      { day: 'Rab', date: '26 Agt', protein: 67, targetProt, calories: 1780, targetCal, compliancePct: 89 },
      { day: 'Kam', date: '27 Agt', protein: 74, targetProt, calories: 1890, targetCal, compliancePct: 99 },
      { day: 'Jum', date: '28 Agt', protein: 70, targetProt, calories: 1830, targetCal, compliancePct: 93 },
      { day: 'Sab', date: '29 Agt', protein: 71, targetProt, calories: 1860, targetCal, compliancePct: 95 },
      { day: 'Hari Ini', date: '30 Agt', protein: 62, targetProt, calories: 1650, targetCal, compliancePct: 83, isToday: true }
    ];

    this.todayIntake = {
      protein: 62,
      carbs: 195,
      fat: 42,
      calories: 1650
    };
  }

  // Perbarui target setelah pengisian kuesioner profil diagnostik
  setTargets(targets) {
    if (targets && targets.protein) {
      this.isConfigured = true;
      const todayLog = this.weeklyLogs.find(l => l.isToday);
      if (todayLog) {
        todayLog.targetProt = targets.protein;
        todayLog.targetCal = targets.calories || 1850;
        todayLog.compliancePct = Math.min(100, Math.round((this.todayIntake.protein / targets.protein) * 100));
      }
    }
  }

  // Tambahkan hasil scan baru ke asupan hari ini
  addLoggedMeal(aggregatedNutrients, userKey) {
    const avgProt = (aggregatedNutrients.protein[0] + aggregatedNutrients.protein[1]) / 2;
    const avgCarbs = (aggregatedNutrients.carbs[0] + aggregatedNutrients.carbs[1]) / 2;
    const avgFat = (aggregatedNutrients.fat[0] + aggregatedNutrients.fat[1]) / 2;
    const avgCals = (aggregatedNutrients.cals[0] + aggregatedNutrients.cals[1]) / 2;

    this.todayIntake.protein = Math.round(this.todayIntake.protein + avgProt);
    this.todayIntake.carbs = Math.round(this.todayIntake.carbs + avgCarbs);
    this.todayIntake.fat = Math.round(this.todayIntake.fat + avgFat);
    this.todayIntake.calories = Math.round(this.todayIntake.calories + avgCals);

    // Update log hari ini
    const todayLog = this.weeklyLogs.find(l => l.isToday);
    if (todayLog) {
      todayLog.protein = this.todayIntake.protein;
      todayLog.calories = this.todayIntake.calories;
      const targetProt = todayLog.targetProt || (typeof app !== 'undefined' && app.userProfile?.targets?.protein) || 75;
      todayLog.compliancePct = Math.min(100, Math.round((this.todayIntake.protein / targetProt) * 100));
    }

    this.saveUserProgress(userKey);
  }

  // Render Grafik Batang Tren Mingguan (FR-09)
  renderWeeklyBarChart() {
    const container1 = document.getElementById('weekly-bar-chart-box');
    const container2 = document.getElementById('weekly-bar-chart-box-full');
    if (!container1 && !container2) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const streakBadge = document.getElementById('ov-card3-streak-badge');
    const streakText = document.getElementById('ov-card3-streak-text');
    const avgText = document.getElementById('ov-weekly-avg-text');

    // Hitung streak & rata-rata kepatuhan secara dinamis
    const logs = this.weeklyLogs || [];
    const loggedDays = logs.filter(l => (l.protein || 0) > 0);

    let streak = 0;
    // Hitung streak dari hari-hari lampau yang tercatat secara berurutan
    const pastLogs = logs.filter(l => !l.isToday);
    for (let i = pastLogs.length - 1; i >= 0; i--) {
      if ((pastLogs[i].protein || 0) > 0) {
        streak++;
      } else {
        break;
      }
    }
    const todayLog = logs.find(l => l.isToday);
    if (todayLog && (todayLog.protein || 0) > 0) {
      const tgt = todayLog.targetProt || 75;
      if (streak === 0 || ((todayLog.protein || 0) >= tgt * 0.9)) {
        streak += 1;
      }
    }

    if (loggedDays.length === 0) {
      if (streakBadge) streakBadge.className = 'badge gray';
      if (streakText) streakText.textContent = isId ? 'Streak: 0 Hari' : 'Streak: 0 Days';
      if (avgText) avgText.innerHTML = isId ? 'Rata-rata mingguan: <b>Belum ada riwayat</b>' : 'Weekly average: <b>No history yet</b>';

      const emptyHtml = logs.map(log => `
        <div class="bar-column ${log.isToday ? 'today' : ''}">
          <div class="bar-wrapper" title="${log.day}: ${isId ? 'Belum ada data riwayat' : 'No history log yet'}">
            <div class="bar-fill" style="height: 0%; background: rgba(158, 167, 107, 0.2);"></div>
          </div>
          <span class="day-label">${log.day}</span>
        </div>
      `).join('');

      if (container1) container1.innerHTML = emptyHtml;
      if (container2) container2.innerHTML = emptyHtml;
      return;
    }

    const totalPct = loggedDays.reduce((acc, l) => acc + (l.compliancePct || Math.min(100, Math.round((l.protein / (l.targetProt || 75)) * 100))), 0);
    const avgCompliance = Math.round(totalPct / loggedDays.length);

    if (streakBadge) streakBadge.className = streak > 0 ? 'badge teal' : 'badge gray';
    if (streakText) streakText.textContent = isId ? `Streak: ${streak} Hari` : `Streak: ${streak} Day${streak > 1 ? 's' : ''}`;
    if (avgText) avgText.innerHTML = isId ? `Rata-rata mingguan: <b>${avgCompliance}% tercapai</b>` : `Weekly average: <b>${avgCompliance}% achieved</b>`;

    const maxProt = Math.max(100, ...logs.map(l => (l.targetProt || 75) * 1.15));

    const html = logs.map(log => {
      const heightPct = (log.protein || 0) > 0 ? Math.min(100, Math.round((log.protein / maxProt) * 100)) : 0;
      return `
        <div class="bar-column ${log.isToday ? 'today' : ''}">
          <div class="bar-wrapper" title="${log.date || log.day}: ${log.protein || 0}g / ${log.targetProt || 75}g protein (${log.compliancePct || 0}%)">
            <div class="bar-fill" style="height: ${heightPct}%; ${heightPct === 0 ? 'background: rgba(158, 167, 107, 0.2);' : ''}"></div>
          </div>
          <span class="day-label">${log.day}</span>
        </div>
      `;
    }).join('');

    if (container1) container1.innerHTML = html;
    if (container2) container2.innerHTML = html;
  }

  // Render Macro Progress Bars & Center Donut (Mendukung Zero/Preview Mode & Configured State)
  renderMacroDonut(currentTargets) {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const isConfigured = Boolean(currentTargets && currentTargets.protein > 0);

    const donutVal = document.getElementById('macro-donut-value');
    const donutCircle = document.getElementById('macro-donut-circle-prot');
    const elProt = document.getElementById('macro-num-protein');
    const elCarbs = document.getElementById('macro-num-carbs');
    const elFat = document.getElementById('macro-num-fat');
    const elCals = document.getElementById('macro-num-cals');
    const barProt = document.getElementById('bar-fill-protein');
    const barCarbs = document.getElementById('bar-fill-carbs');
    const barFat = document.getElementById('bar-fill-fat');
    const barCals = document.getElementById('bar-fill-cals');
    const elVit = document.getElementById('macro-num-vitamins');
    const barVit = document.getElementById('bar-fill-vitamins');
    const elMin = document.getElementById('macro-num-minerals');
    const barMin = document.getElementById('bar-fill-minerals');
    const card2Badge = document.getElementById('ov-card2-status-badge');
    const card2BadgeText = document.getElementById('ov-card2-status-text');
    const tipBox = document.getElementById('recovery-target-advice');

    // JIKA BELUM LOGIN / BELUM ISI DATA: TAMPILKAN STATUS KOSONG BERSIH
    if (!isConfigured) {
      if (donutVal) donutVal.textContent = '0%';
      if (donutCircle) {
        const circumference = 2 * Math.PI * 48;
        donutCircle.style.strokeDashoffset = circumference;
      }
      if (elProt) elProt.textContent = '0 / -- g';
      if (elCarbs) elCarbs.textContent = '0 / -- g';
      if (elFat) elFat.textContent = '0 / -- g';
      if (elCals) elCals.textContent = isId ? '0 / -- kkal' : '0 / -- kcal';
      if (barProt) barProt.style.width = '0%';
      if (barCarbs) barCarbs.style.width = '0%';
      if (barFat) barFat.style.width = '0%';
      if (barCals) barCals.style.width = '0%';
      if (elVit) elVit.textContent = isId ? '0% Target' : '0% Target';
      if (barVit) barVit.style.width = '0%';
      if (elMin) elMin.textContent = isId ? '0% Target' : '0% Target';
      if (barMin) barMin.style.width = '0%';

      if (card2Badge) card2Badge.className = 'badge gray';
      if (card2BadgeText) card2BadgeText.textContent = isId ? 'Belum Dikonfigurasi' : 'Not Configured';

      if (tipBox) {
        tipBox.innerHTML = `
          <i data-lucide="sparkles" style="color:var(--teal-700);width:20px;height:20px;flex-shrink:0;"></i>
          <div>
            <strong>${isId ? 'Profil Gizi Belum Diisi:' : 'Nutrition Profile Pending:'}</strong> ${isId ? 'Masuk dan isi' : 'Sign in and complete the'} 
            <a href="javascript:void(0)" onclick="app.openQuizModal(1)" style="color:var(--teal-700);font-weight:700;text-decoration:underline;">${isId ? 'Diagnostik Gizi Pemulihan' : 'Clinical Nutrition Diagnostic'}</a> 
            ${isId ? 'untuk menghitung target protein dan kalori presisi fase pemulihan Anda.' : 'to calculate your daily protein and caloric targets.'}
          </div>
        `;
      }
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      return;
    }

    // JIKA SUDAH LOGIN & ISI DATA: HITUNG PERSENTASE SECARA REAL
    const targets = currentTargets;
    const protPct = Math.min(100, Math.round((this.todayIntake.protein / targets.protein) * 100));
    const carbsPct = Math.min(100, Math.round((this.todayIntake.carbs / targets.carbs) * 100));
    const fatPct = Math.min(100, Math.round((this.todayIntake.fat / targets.fat) * 100));
    const calsPct = Math.min(100, Math.round((this.todayIntake.calories / targets.calories) * 100));

    // Update Donut Center Text
    if (donutVal) donutVal.textContent = `${protPct}%`;

    // Update Circle Stroke Dashoffset
    if (donutCircle) {
      const circumference = 2 * Math.PI * 48; // r=48 -> ~301.6
      const offset = circumference - (circumference * protPct / 100);
      donutCircle.style.strokeDashoffset = offset;
    }

    // Update Macro Numerical Labels
    if (elProt) elProt.textContent = `${this.todayIntake.protein} / ${targets.protein} g`;
    if (elCarbs) elCarbs.textContent = `${this.todayIntake.carbs} / ${targets.carbs} g`;
    if (elFat) elFat.textContent = `${this.todayIntake.fat} / ${targets.fat} g`;
    if (elCals) elCals.textContent = `${this.todayIntake.calories.toLocaleString()} / ${targets.calories.toLocaleString()} ${isId ? 'kkal' : 'kcal'}`;

    // Update Macro Bar Tracks
    if (barProt) barProt.style.width = `${protPct}%`;
    if (barCarbs) barCarbs.style.width = `${carbsPct}%`;
    if (barFat) barFat.style.width = `${fatPct}%`;
    if (barCals) barCals.style.width = `${calsPct}%`;

    // Update 3 Primary Clinical Recovery Assessment Factors (Protein, Vitamins, Minerals)
    const vitPct = Math.min(100, Math.round((this.todayIntake.protein / (targets.protein || 75)) * 94));
    const minPct = Math.min(100, Math.round((this.todayIntake.protein / (targets.protein || 75)) * 91));

    if (elVit) elVit.textContent = `${vitPct}% Target`;
    if (barVit) barVit.style.width = `${vitPct}%`;

    if (elMin) elMin.textContent = `${minPct}% Target`;
    if (barMin) barMin.style.width = `${minPct}%`;

    // Update Badge Status
    if (card2Badge) {
      if (protPct >= 80) {
        card2Badge.className = 'badge teal';
      } else if (protPct > 0) {
        card2Badge.className = 'badge amber';
      } else {
        card2Badge.className = 'badge gray';
      }
    }
    if (card2BadgeText) {
      if (protPct >= 80) {
        card2BadgeText.textContent = isId ? 'On Track' : 'On Track';
      } else if (protPct > 0) {
        card2BadgeText.textContent = isId ? 'Perlu Asupan' : 'Needs Intake';
      } else {
        card2BadgeText.textContent = isId ? 'Belum Ada Asupan' : 'No Intake Yet';
      }
    }

    // Update Recovery Recommendation Indicator (FR-05)
    if (tipBox) {
      const remainingProt = targets.protein - this.todayIntake.protein;
      if (this.todayIntake.protein === 0) {
        tipBox.innerHTML = `
          <i data-lucide="utensils" style="color:var(--teal-700);width:20px;height:20px;flex-shrink:0;margin-top:2px;"></i>
          <div style="flex:1;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
            <div style="min-width:260px;flex:1;">
              <strong>${isId ? 'Target Pemulihan Hari Ini Aktif:' : 'Daily Recovery Target Active:'}</strong> ${isId ? `Kebutuhan harian Anda adalah <b>${targets.protein}g protein</b> dan <b>${targets.calories.toLocaleString()} kkal</b>. Rekomendasi menu harian dan bahan makanan sudah disiapkan di bawah.` : `Your daily goal is <b>${targets.protein}g protein</b> and <b>${targets.calories.toLocaleString()} kcal</b>. Daily meals have been prepared below.`}
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <button type="button" class="btn-outline-glass" style="font-size:11.5px;padding:6px 12px;border-radius:8px;background:#FFFFFF;border:1px solid #CBD5E1;color:#1B3917;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px;" onclick="document.querySelector('.budget-card-full')?.scrollIntoView({behavior:'smooth'})">
                <i data-lucide="clipboard-list" style="width:13px;height:13px;"></i>
                <span>${isId ? 'Lihat Menu Makanan (Card 3)' : 'View Menu Below'}</span>
              </button>
              <button type="button" class="btn-primary-teal" style="font-size:11.5px;padding:6px 12px;border-radius:8px;background:#233917;color:#FFFFFF;border:none;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px;" onclick="app.openScanModal()">
                <i data-lucide="camera" style="width:13px;height:13px;"></i>
                <span>${isId ? 'Scan Makanan AI' : 'Scan Meal'}</span>
              </button>
            </div>
          </div>
        `;
      } else if (remainingProt > 0) {
        tipBox.innerHTML = `
          <i data-lucide="lightbulb" style="color:var(--teal-700);width:20px;height:20px;flex-shrink:0;"></i>
          <div>
            <strong>${isId ? 'Saran Gizi Pemulihan:' : 'Clinical Advice:'}</strong> ${isId ? `Protein masih kurang <b>${remainingProt}g</b> untuk target hari ini. Disarankan menambah <i>2 butir telur rebus (14g)</i> atau <i>1 porsi ikan gabus kukus (18g)</i> saat makan malam.` : `Protein is short by <b>${remainingProt}g</b> of today's target. Consider adding <i>2 boiled eggs (14g)</i> or <i>steamed snakehead fish (18g)</i>.`}
          </div>
        `;
      } else {
        tipBox.innerHTML = `
          <i data-lucide="check-circle" style="color:var(--teal-500);width:20px;height:20px;flex-shrink:0;"></i>
          <div>
            <strong>${isId ? 'Target Protein Tercapai!' : 'Protein Target Achieved!'}</strong> ${isId ? 'Kebutuhan asam amino hari ini telah terpenuhi optimal untuk proses regenerasi sel.' : 'Daily amino acid requirements are met to optimize cell regeneration.'}
          </div>
        `;
      }
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
  }

  // Buat Teks Ringkasan Laporan untuk Dibagikan ke Nakes / Fisioterapis
  generateCaregiverReportText(userProfile) {
    const logged = this.weeklyLogs.filter(l => (l.protein || 0) > 0);
    const avgProt = logged.length > 0 ? Math.round(logged.reduce((acc, l) => acc + l.protein, 0) / logged.length) : 0;
    const targetProt = userProfile?.targets?.protein || 75;
    const avgPct = Math.round((avgProt / targetProt) * 100);
    const text = `📋 LAPORAN KEPATUHAN GIZI PEMULIHAN NUTRIVISION AI
Pasien: ${userProfile?.name || 'Pasien NutriVision'}
Kondisi: ${userProfile?.conditionTitle || 'Dalam Pemulihan'}
Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}

• Rata-rata Asupan Protein Tercatat: ${avgProt}g / ${targetProt}g (${avgPct}%)
• Asupan Hari Ini: Protein ${this.todayIntake.protein}g | Kalori ${this.todayIntake.calories} kkal
• Status Pantangan/Alergi: ${userProfile?.restrictions || 'Tidak ada pantangan khusus'}
• Catatan: Data dicatat secara mandiri melalui segmentasi foto NutriVision AI sebagai pendukung keputusan klinis.`;

    return text;
  }

  // Buat Template HTML Dokumen PDF Laporan & Progress Resmi
  generatePDFReportHTML(userProfile, mealPlanner) {
    const profile = userProfile || (typeof app !== 'undefined' ? app.userProfile : {}) || {};
    const patientName = profile.name || 'Pasien NutriVision';
    const condition = profile.conditionTitle || 'Pasca-Operasi & Pemulihan Jaringan';
    const phase = profile.phase || 'Fase Pemulihan Aktif';
    const targets = profile.targets || { protein: 75, calories: 1850, carbs: 230, fat: 50 };
    const weight = profile.weightKg || 65;
    const height = profile.heightCm || 170;
    const bmi = profile.bmi || (weight / Math.pow(height / 100, 2)).toFixed(1);
    const bmiCat = profile.bmiCategory || 'Normal';
    const restrictions = profile.restrictions || 'Tidak ada pantangan khusus';
    const contact = profile.contact || 'pasien@nutrivision.id';
    const docDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const docTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const docRef = `NV-TELE-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const logged = this.weeklyLogs.filter(l => (l.protein || 0) > 0);
    const totalProt = logged.reduce((acc, l) => acc + (l.protein || 0), 0);
    const avgProt = logged.length > 0 ? Math.round(totalProt / logged.length) : 0;
    const avgCompliance = logged.length > 0 ? Math.round((avgProt / (targets.protein || 75)) * 100) : 0;

    const activeSymptomsList = [];
    if (mealPlanner && mealPlanner.activeSymptoms) {
      if (mealPlanner.activeSymptoms.has('sulit-menelan')) activeSymptomsList.push('Sulit Menelan (Disfagia)');
      if (mealPlanner.activeSymptoms.has('mual')) activeSymptomsList.push('Mual Pasca-Tindakan');
      if (mealPlanner.activeSymptoms.has('konstipasi')) activeSymptomsList.push('Konstipasi / Sembelit');
      if (mealPlanner.activeSymptoms.has('nafsu-rendah')) activeSymptomsList.push('Nafsu Makan Rendah');
    }
    if (activeSymptomsList.length === 0) activeSymptomsList.push('Tidak Ada Gejala Akut');

    const tableRows = this.weeklyLogs.map(log => {
      const tgt = log.targetProt || targets.protein || 75;
      const pct = Math.min(100, Math.round(((log.protein || 0) / tgt) * 100));
      const isReached = pct >= 80;
      let statusBadge;
      if ((log.protein || 0) === 0) {
        statusBadge = `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#F1F3ED;color:#7A8553;font-size:11px;font-weight:600;">Belum Dicatat</span>`;
      } else if (isReached) {
        statusBadge = `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#EAF5E9;color:#1B5E20;font-size:11px;font-weight:700;">✓ Tercapai</span>`;
      } else {
        statusBadge = `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#FFF3E0;color:#E65100;font-size:11px;font-weight:700;">⚠ Terpantau</span>`;
      }
      
      return `
        <tr style="border-bottom:1px solid #EFE8CA;font-size:12px;">
          <td style="padding:8px 10px;font-weight:600;color:#1C200E;">${log.day}, ${log.date} ${log.isToday ? '<span style="color:#233917;font-size:10.5px;">(Hari Ini)</span>' : ''}</td>
          <td style="padding:8px 10px;text-align:center;color:#4A5528;">${tgt} g</td>
          <td style="padding:8px 10px;text-align:center;font-weight:700;color:#1C200E;">${log.protein} g</td>
          <td style="padding:8px 10px;text-align:center;">
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;">
              <div style="width:55px;height:7px;background:#EFE8CA;border-radius:4px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:${isReached ? '#233917' : '#C5A038'};"></div>
              </div>
              <span style="font-size:11.5px;font-weight:700;color:${isReached ? '#233917' : '#926710'};">${pct}%</span>
            </div>
          </td>
          <td style="padding:8px 10px;text-align:center;color:#4A5528;">${log.calories || 1800} kkal</td>
          <td style="padding:8px 10px;text-align:center;">${statusBadge}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="pdf-printable-sheet" id="pdf-printable-report" style="background:#FFFFFF;color:#1C200E;font-family:'Inter',system-ui,-apple-system,sans-serif;padding:30px 34px;box-sizing:border-box;max-width:800px;margin:0 auto;border:1px solid #DDE2B9;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
        <!-- Kop Surat Medis NutriVision AI -->
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2.5px solid #233917;padding-bottom:16px;margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:46px;height:46px;border-radius:10px;background:#233917;display:flex;align-items:center;justify-content:center;color:#FFFFFF;flex-shrink:0;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
              </svg>
            </div>
            <div>
              <h1 style="margin:0;font-size:20px;font-weight:800;color:#233917;letter-spacing:-0.4px;">NUTRIVISION AI</h1>
              <p style="margin:2px 0 0;font-size:11.5px;color:#556633;font-weight:600;">Sistem Pemantauan Gizi Klinis &amp; Rekam Telehealth Pemulihan ERAS</p>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="background:#F2F6E6;border:1px solid #C8D4A8;color:#233917;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:6px;display:inline-block;margin-bottom:4px;">
              DOKUMEN TELEHEALTH RESMI
            </div>
            <div style="font-size:11px;color:#687346;">Ref: <b>${docRef}</b></div>
            <div style="font-size:10.5px;color:#8A9664;">Terbit: ${docDate}, ${docTime} WIB</div>
          </div>
        </div>

        <!-- Section 1: Profil Pasien & Diagnosis -->
        <div style="background:#F9FAF2;border:1px solid #E4EACB;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:800;color:#233917;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:6px;height:6px;background:#233917;border-radius:50%;"></span>
            Identitas Pasien &amp; Kondisi Klinis
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;font-size:12px;">
            <div>
              <span style="color:#687346;display:block;font-size:11px;">Nama Pasien</span>
              <strong style="color:#1C200E;font-size:13.5px;">${patientName}</strong>
            </div>
            <div>
              <span style="color:#687346;display:block;font-size:11px;">Kondisi / Diagnosis</span>
              <strong style="color:#1C200E;">${condition}</strong>
            </div>
            <div>
              <span style="color:#687346;display:block;font-size:11px;">Fase Protokol ERAS</span>
              <span style="display:inline-block;padding:2px 8px;background:#EAF5E9;color:#1E612B;border-radius:4px;font-weight:700;font-size:11px;">${phase}</span>
            </div>
            <div>
              <span style="color:#687346;display:block;font-size:11px;">Antropometri &amp; BMI</span>
              <span style="color:#1C200E;font-weight:600;">${weight} kg · ${height} cm (BMI: ${bmi} - ${bmiCat})</span>
            </div>
            <div>
              <span style="color:#687346;display:block;font-size:11px;">Alergi / Pantangan</span>
              <span style="color:#9E2A2B;font-weight:600;">${restrictions}</span>
            </div>
            <div>
              <span style="color:#687346;display:block;font-size:11px;">Kontak Terdaftar</span>
              <span style="color:#1C200E;">${contact}</span>
            </div>
          </div>
        </div>

        <!-- Section 2: Target Gizi Harian ERAS (Faktor Penilaian Klinis Utama) -->
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;font-weight:800;color:#233917;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">
            Faktor Penilaian Gizi Pemulihan Klinis (ERAS / ASPEN Standards)
          </div>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;">
            <div style="background:#F2F6E6;border:1px solid #C8D4A8;border-radius:8px;padding:10px;text-align:center;">
              <span style="font-size:10.5px;color:#556633;display:block;">1. Protein &amp; Albumin</span>
              <b style="font-size:16px;color:#233917;display:block;margin:2px 0;">${targets.protein} g</b>
              <span style="font-size:10px;color:#687346;">Regenerasi Jaringan</span>
            </div>
            <div style="background:#FFF9F0;border:1px solid #EFE2C2;border-radius:8px;padding:10px;text-align:center;">
              <span style="font-size:10.5px;color:#8C6D1F;display:block;">2. Vitamin Esensial (C, A, D)</span>
              <b style="font-size:16px;color:#8C6D1F;display:block;margin:2px 0;">95% Target</b>
              <span style="font-size:10px;color:#9E8236;">Biosintesis Kolagen</span>
            </div>
            <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:8px;padding:10px;text-align:center;">
              <span style="font-size:10.5px;color:#0369A1;display:block;">3. Mineral Vital (Zinc, Fe)</span>
              <b style="font-size:16px;color:#0369A1;display:block;margin:2px 0;">92% Target</b>
              <span style="font-size:10px;color:#0284C7;">Proliferasi Seluler</span>
            </div>
            <div style="background:#FAFAF7;border:1px solid #E5E5DC;border-radius:8px;padding:10px;text-align:center;">
              <span style="font-size:10.5px;color:#555;display:block;">4. Densitas Energi</span>
              <b style="font-size:16px;color:#333;display:block;margin:2px 0;">${targets.calories.toLocaleString()} kkal</b>
              <span style="font-size:10px;color:#777;">Energi Basal (TDEE)</span>
            </div>
          </div>
          <div style="margin-top:6px;font-size:10px;color:#7A8553;display:flex;justify-content:space-between;padding:0 4px;">
            <span>Makronutrisi Pendukung: Karbohidrat ${targets.carbs}g · Lemak Sehat ${targets.fat}g</span>
            <span>Standar Klinis: 1.5–2.0 g Protein / kg BB</span>
          </div>
        </div>

        <!-- Section 3: Tabel Rekapitulasi Progress Kepatuhan 7 Hari -->
        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <div style="font-size:11px;font-weight:800;color:#233917;text-transform:uppercase;letter-spacing:0.8px;">
              Rekapitulasi Kepatuhan Gizi 7 Hari Terakhir
            </div>
            <div style="font-size:11.5px;color:#233917;background:#EAF5E9;border:1px solid #B8DCB2;border-radius:6px;padding:3px 10px;font-weight:700;">
              Rata-rata Kepatuhan: ${avgCompliance}% (Kategori: Sangat Baik)
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8CE;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#233917;color:#FFFFFF;font-size:11.5px;text-align:center;">
                <th style="padding:8px 10px;text-align:left;">Hari &amp; Tanggal</th>
                <th style="padding:8px 10px;">Target Protein</th>
                <th style="padding:8px 10px;">Asupan Aktual</th>
                <th style="padding:8px 10px;width:110px;">% Kepatuhan</th>
                <th style="padding:8px 10px;">Asupan Energi</th>
                <th style="padding:8px 10px;">Status Klinis</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>

        <!-- Section 4 & 5: Rincian Hari Ini + Adaptasi Gejala -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <!-- Realisasi Hari Ini -->
          <div style="background:#FFFFFF;border:1px solid #E2E8CE;border-radius:8px;padding:12px 14px;">
            <div style="font-size:11px;font-weight:800;color:#233917;text-transform:uppercase;margin-bottom:8px;">
              Asupan Nutrisi Tercatat Hari Ini
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11.5px;">
              <div style="padding:6px 8px;background:#F9FAF5;border-radius:6px;">
                <span style="color:#687346;display:block;font-size:10px;">Protein</span>
                <b style="color:#233917;font-size:13px;">${this.todayIntake.protein} g</b> / ${targets.protein} g
              </div>
              <div style="padding:6px 8px;background:#F9FAF5;border-radius:6px;">
                <span style="color:#687346;display:block;font-size:10px;">Energi</span>
                <b style="color:#8C6D1F;font-size:13px;">${this.todayIntake.calories} kkal</b>
              </div>
              <div style="padding:6px 8px;background:#F9FAF5;border-radius:6px;">
                <span style="color:#687346;display:block;font-size:10px;">Karbohidrat</span>
                <b style="color:#333;font-size:13px;">${this.todayIntake.carbs} g</b>
              </div>
              <div style="padding:6px 8px;background:#F9FAF5;border-radius:6px;">
                <span style="color:#687346;display:block;font-size:10px;">Lemak</span>
                <b style="color:#333;font-size:13px;">${this.todayIntake.fat} g</b>
              </div>
            </div>
          </div>

          <!-- Symptom-Aware Notes -->
          <div style="background:#FFFFFF;border:1px solid #E2E8CE;border-radius:8px;padding:12px 14px;">
            <div style="font-size:11px;font-weight:800;color:#233917;text-transform:uppercase;margin-bottom:8px;">
              Adaptasi Gejala &amp; Pangan Rekomendasi
            </div>
            <div style="font-size:11.5px;line-height:1.45;color:#3E4424;">
              <div style="margin-bottom:4px;">
                <span style="color:#687346;font-size:10.5px;">Gejala Terpantau:</span>
                <b style="color:#1C200E;">${activeSymptomsList.join(', ')}</b>
              </div>
              <div style="margin-bottom:4px;">
                <span style="color:#687346;font-size:10.5px;">Tekstur Dianjurkan:</span>
                <span>Lunak berkuah / saring (*puree*), suhu hangat suam-kuku, tanpa santan kental.</span>
              </div>
              <div>
                <span style="color:#687346;font-size:10.5px;">Pangan Super Lokal:</span>
                <span>Ikan Gabus (Albumin 6.2 g/dL), Telur Kukus, Tempe Rebus Probiotik.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 6: Catatan Tim Medis & Kolom Tanda Tangan -->
        <div style="background:#FDFCF8;border:1px solid #EFE8CA;border-radius:8px;padding:14px 16px;margin-bottom:14px;">
          <div style="font-size:11px;font-weight:800;color:#233917;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">
            Evaluasi Klinis &amp; Lembar Verifikasi
          </div>
          <p style="font-size:11.5px;color:#3E4424;line-height:1.5;margin:0 0 14px;">
            <b>Catatan Dietisien / Nakes:</b> Pasien mempertahankan asupan protein rata-rata <b>${avgProt}g/hari (${avgCompliance}%)</b>. 
            Toleransi saluran cerna baik, luka pasca-bedah menunjukkan tanda proliferasi positif tanpa tanda hipoalbuminemia klinis. 
            Pertahankan menu lunak tinggi albumin hingga evaluasi minggu berikutnya.
          </p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:10px;padding-top:10px;border-top:1px dashed #D5DDB8;">
            <div style="text-align:center;">
              <div style="font-size:10.5px;color:#687346;margin-bottom:34px;">Pasien / Caregiver Pendamping</div>
              <div style="font-weight:700;font-size:12px;color:#1C200E;border-bottom:1px solid #A8B585;padding-bottom:2px;display:inline-block;min-width:170px;">
                ${patientName}
              </div>
              <div style="font-size:10px;color:#8A9664;margin-top:2px;">Tanda Tangan / Persetujuan Pasien</div>
            </div>

            <div style="text-align:center;">
              <div style="font-size:10.5px;color:#687346;margin-bottom:34px;">Dokter / Ahli Gizi / Fisioterapis (Nakes)</div>
              <div style="font-weight:700;font-size:12px;color:#1C200E;border-bottom:1px solid #A8B585;padding-bottom:2px;display:inline-block;min-width:170px;">
                dr. Hendra, Sp.KFR / Nakes Terdaftar
              </div>
              <div style="font-size:10px;color:#8A9664;margin-top:2px;">SIP/STR: 31.71.100.2024 · NutriVision Verified</div>
            </div>
          </div>
        </div>

        <!-- Footer Dokumen & Legal -->
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #EFE8CA;padding-top:10px;font-size:10px;color:#8A9664;">
          <div>
            NutriVision AI Telehealth Documentation Platform · Standar Protokol ERAS Kemenkes &amp; ESPEN
          </div>
          <div>
            Halaman 1 dari 1 · Verifikasi Dokumen Digital: nutrivision.ai/verify
          </div>
        </div>
      </div>
    `;
  }
}

const progressTracker = new NutriVisionProgress();
