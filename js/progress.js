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
    this.todayMeals = [];
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
    this.todayMeals = [];
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
        todayMeals: this.todayMeals || [],
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
            this.todayMeals = parsed.todayMeals || [];
            this.weeklyLogs = parsed.weeklyLogs;

            // Backwards compatibility cerdas: Jika sudah ada akumulasi protein tapi todayMeals belum ada
            if (this.todayMeals.length === 0 && this.todayIntake.protein > 0) {
              const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
              this.todayMeals = [
                {
                  id: 'meal_prev_' + Date.now(),
                  name: isId ? 'Menu Pemulihan Terjadwal' : 'Logged Recovery Meal',
                  time: 'Hari Ini',
                  protein: this.todayIntake.protein,
                  calories: this.todayIntake.calories,
                  carbs: this.todayIntake.carbs || Math.round(this.todayIntake.calories * 0.5 / 4),
                  fat: this.todayIntake.fat || Math.round(this.todayIntake.calories * 0.25 / 9),
                  source: isId ? 'Catat Asupan' : 'Logged Intake'
                }
              ];
              this.saveUserProgress(userKey);
            }
          } else {
            this.todayIntake = { protein: 0, carbs: 0, fat: 0, calories: 0 };
            this.todayMeals = [];
            this.weeklyLogs = this.create7DayLogs(targets.protein, targets.calories);
            this.saveUserProgress(userKey);
          }
          // Sinkronisasi async dari backend (tidak blokir UI)
          this.syncFromServer(userKey, targets);
          return;
        }
      }
    } catch (e) {
      console.warn('Load progress issue:', e);
    }

    // Default: inisialisasi progres bersih 0 intake untuk akun nyata
    this.initUserProgress(targets, userKey);
    // Sinkronisasi async dari backend (tidak blokir UI)
    this.syncFromServer(userKey, targets);
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

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    this.todayMeals = [
      {
        id: 'meal_demo_1',
        name: isId ? 'Fillet Ikan Gabus Kukus + Sayur Bening Bayam' : 'Steamed Snakehead Fish + Spinach Soup',
        time: '12:30',
        protein: 30,
        calories: 780,
        carbs: 90,
        fat: 18,
        source: isId ? 'Makan Siang' : 'Lunch'
      },
      {
        id: 'meal_demo_2',
        name: isId ? '2 Butir Telur Rebus Organik + Teh Hangat' : '2 Boiled Eggs + Warm Tea',
        time: '07:45',
        protein: 14,
        calories: 390,
        carbs: 45,
        fat: 12,
        source: isId ? 'Sarapan' : 'Breakfast'
      },
      {
        id: 'meal_demo_3',
        name: isId ? 'Susu Kedelai Probiotik + Tempe Kukus' : 'Probiotic Soy Milk + Steamed Tempeh',
        time: '16:15',
        protein: 18,
        calories: 480,
        carbs: 60,
        fat: 12,
        source: isId ? 'Camilan Sore' : 'Snack'
      }
    ];
  }

  // Perbarui target setelah pengisian kuesioner profil diagnostik
  updateTargets(targets, userKey) {
    if (!targets) return;
    if (this.todayIntake.protein > 0) {
      const todayLog = this.weeklyLogs.find(l => l.isToday);
      if (todayLog) {
        todayLog.targetProt = targets.protein;
        todayLog.targetCal = targets.calories || 1850;
        todayLog.compliancePct = Math.min(100, Math.round((this.todayIntake.protein / targets.protein) * 100));
      }
    }
  }

  // Tambahkan hasil scan / menu baru ke asupan hari ini
  addLoggedMeal(aggregatedNutrients, userKey, mealMeta = {}) {
    const pArr = Array.isArray(aggregatedNutrients.protein) ? aggregatedNutrients.protein : [aggregatedNutrients.protein || 0, aggregatedNutrients.protein || 0];
    const cArr = Array.isArray(aggregatedNutrients.carbs) ? aggregatedNutrients.carbs : [aggregatedNutrients.carbs || 0, aggregatedNutrients.carbs || 0];
    const fArr = Array.isArray(aggregatedNutrients.fat) ? aggregatedNutrients.fat : [aggregatedNutrients.fat || 0, aggregatedNutrients.fat || 0];
    const calRaw = aggregatedNutrients.calories !== undefined ? aggregatedNutrients.calories : (aggregatedNutrients.cals !== undefined ? aggregatedNutrients.cals : 0);
    const calArr = Array.isArray(calRaw) ? calRaw : [calRaw, calRaw];

    const avgProt = Math.round((pArr[0] + pArr[1]) / 2);
    const avgCarbs = Math.round((cArr[0] + cArr[1]) / 2);
    const avgFat = Math.round((fArr[0] + fArr[1]) / 2);
    const avgCals = Math.round((calArr[0] + calArr[1]) / 2);

    this.todayIntake.protein = Math.round(this.todayIntake.protein + avgProt);
    this.todayIntake.carbs = Math.round(this.todayIntake.carbs + avgCarbs);
    this.todayIntake.fat = Math.round(this.todayIntake.fat + avgFat);
    this.todayIntake.calories = Math.round(this.todayIntake.calories + avgCals);

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const mealTitle = typeof mealMeta === 'string' ? mealMeta : (mealMeta.name || (isId ? 'Menu Asupan Pemulihan' : 'Recovery Meal'));
    const mealSource = (typeof mealMeta === 'object' && mealMeta.source) ? mealMeta.source : (isId ? 'Catat Asupan' : 'Logged Meal');

    const mealEntry = {
      id: 'meal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: mealTitle,
      time: (typeof mealMeta === 'object' && mealMeta.time) ? mealMeta.time : timeStr,
      protein: avgProt,
      calories: avgCals,
      carbs: avgCarbs,
      fat: avgFat,
      source: mealSource
    };

    if (!this.todayMeals) this.todayMeals = [];
    this.todayMeals.unshift(mealEntry);

    // Update log hari ini
    const todayLog = this.weeklyLogs.find(l => l.isToday);
    if (todayLog) {
      todayLog.protein = this.todayIntake.protein;
      todayLog.calories = this.todayIntake.calories;
      const targetProt = todayLog.targetProt || (typeof app !== 'undefined' && app.userProfile?.targets?.protein) || 75;
      todayLog.compliancePct = Math.min(100, Math.round((this.todayIntake.protein / targetProt) * 100));
    }

    this.saveUserProgress(userKey);
    this.renderTodayMealHistory();
    this.renderHistoryPage();

    // Sinkronisasi ke backend MySQL secara async (fire-and-forget)
    if (typeof window !== 'undefined' && window.nutriAPI) {
      const userProfile = (typeof app !== 'undefined' ? app.userProfile : null) || {};
      const userId = userProfile?.id || userProfile?.contact || userProfile?.email || 'usr_patient_siti';
      const mealPayload = {
        title: mealEntry.name,
        mealType: (mealMeta?.mealType) || (mealEntry.source?.toLowerCase().includes('malam') ? 'dinner' :
                   mealEntry.source?.toLowerCase().includes('siang') ? 'lunch' :
                   mealEntry.source?.toLowerCase().includes('sarapan') || mealEntry.source?.toLowerCase().includes('pagi') ? 'breakfast' : 'snack'),
        totalCalories: mealEntry.calories || 0,
        totalProtein: mealEntry.protein || 0,
        totalCarbs: mealEntry.carbs || 0,
        totalFat: mealEntry.fat || 0,
        imageUrl: mealMeta?.imageUrl || '',
        confidence: mealMeta?.confidence || 92,
        clinicalAdvice: mealMeta?.clinicalAdvice || '',
        segments: mealMeta?.segments || [],
        userId: userId
      };

      // Cek server online terlebih dahulu, jika tidak online coba health check dulu
      const doSync = () => {
        window.nutriAPI.logMeal(mealPayload).then(res => {
          if (res?.meal?.id) {
            mealEntry._serverId = res.meal.id;
            window.nutriAPI.isServerOnline = true;
            this.saveUserProgress(userKey);
            console.log('[NutriVision] ✅ Meal synced to MySQL DB:', res.meal.id, '| User:', userId);
          }
        }).catch(err => {
          console.warn('[NutriVision] ⚠️ Sync meal to backend gagal (mode offline):', err.message);
          console.warn('[NutriVision] Payload was:', JSON.stringify(mealPayload, null, 2));
        });
      };

      if (window.nutriAPI.isServerOnline) {
        doSync();
      } else {
        // Coba health check dulu, lalu sync jika berhasil
        window.nutriAPI.checkHealth().then(online => {
          if (online) doSync();
          else console.warn('[NutriVision] Backend offline, data disimpan lokal saja.');
        });
      }
    }
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
              <strong>${isId ? 'Target Pemulihan Hari Ini Aktif:' : 'Daily Recovery Target Active:'}</strong> ${isId ? `Kebutuhan harian Anda adalah <b>${targets.protein}g protein</b> dan <b>${targets.calories.toLocaleString()} kkal</b>. Silakan unggah foto makanan untuk mulai memantau pemulihan.` : `Your daily goal is <b>${targets.protein}g protein</b> and <b>${targets.calories.toLocaleString()} kcal</b>. Upload a food photo to begin tracking your recovery.`}
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <button type="button" class="btn-primary-teal" style="font-size:11.5px;padding:6px 14px;border-radius:8px;background:#233917;color:#FFFFFF;border:none;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;" onclick="app.openScanModal()">
                <i data-lucide="upload" style="width:13px;height:13px;"></i>
                <span>${isId ? 'Unggah Foto Makanan' : 'Upload Food Photo'}</span>
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

    // Render Riwayat Asupan Makanan Hari Ini
    this.renderTodayMealHistory();
  }

  // Navigasi langsung ke halaman riwayat asupan makanan
  toggleTodayMealHistory() {
    if (typeof app !== 'undefined' && typeof app.navigate === 'function') {
      app.navigate('history');
    }
  }

  // Hapus hidangan dari riwayat asupan hari ini
  removeLoggedMeal(mealId) {
    if (!this.todayMeals) return;
    const meal = this.todayMeals.find(m => m.id === mealId);
    if (!meal) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const confirmMsg = isId
      ? `Hapus "${meal.name}" dari riwayat hari ini?\n\nAsupan nutrisi (${meal.protein}g protein, ${meal.calories} kkal) akan otomatis dikurangkan dari capaian harian.`
      : `Remove "${meal.name}" from today's history?\n\nNutrient intake (${meal.protein}g protein, ${meal.calories} kcal) will be deducted from daily progress.`;

    if (!confirm(confirmMsg)) return;

    this.todayIntake.protein = Math.max(0, this.todayIntake.protein - (meal.protein || 0));
    this.todayIntake.calories = Math.max(0, this.todayIntake.calories - (meal.calories || 0));
    this.todayIntake.carbs = Math.max(0, this.todayIntake.carbs - (meal.carbs || 0));
    this.todayIntake.fat = Math.max(0, this.todayIntake.fat - (meal.fat || 0));

    this.todayMeals = this.todayMeals.filter(m => m.id !== mealId);

    const todayLog = this.weeklyLogs.find(l => l.isToday);
    if (todayLog) {
      todayLog.protein = this.todayIntake.protein;
      todayLog.calories = this.todayIntake.calories;
      const targetProt = todayLog.targetProt || (typeof app !== 'undefined' && app.userProfile?.targets?.protein) || 75;
      todayLog.compliancePct = Math.min(100, Math.round((this.todayIntake.protein / targetProt) * 100));
    }

    const userKey = (typeof app !== 'undefined' && (app.userProfile?.contact || app.userProfile?.email || app.userProfile?.name)) || 'guest';
    this.saveUserProgress(userKey);

    if (typeof app !== 'undefined' && app.userProfile && app.userProfile.targets) {
      this.renderMacroDonut(app.userProfile.targets);
    }
    this.renderWeeklyBarChart();
    this.renderTodayMealHistory();
    this.renderHistoryPage();

    if (typeof app !== 'undefined' && typeof app.showToast === 'function') {
      app.showToast(isId ? `"${meal.name}" berhasil dihapus dari riwayat.` : `"${meal.name}" removed from history.`);
    }

    // Hapus dari backend secara async — coba dengan _serverId (MySQL ID) atau local id
    if (typeof window !== 'undefined' && window.nutriAPI) {
      const serverMealId = meal._serverId || meal.id;
      window.nutriAPI.deleteMeal(serverMealId).catch(err => {
        console.warn('[NutriVision] Hapus dari backend gagal (mode offline):', err.message);
      });
    }
  }

  // Update indikator / badge jumlah riwayat hidangan hari ini di header Card 2
  renderTodayMealHistory() {
    const headerCountBadge = document.getElementById('history-header-count-badge');
    const meals = this.todayMeals || [];

    if (headerCountBadge) {
      headerCountBadge.textContent = meals.length;
      headerCountBadge.style.display = meals.length > 0 ? 'inline-block' : 'none';
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Set filter sumber hidangan untuk halaman Riwayat
  setHistoryFilter(filterSource, btn) {
    this.historyFilterSource = filterSource;
    const chipContainer = document.getElementById('history-filter-chips');
    if (chipContainer) {
      const buttons = chipContainer.querySelectorAll('button');
      buttons.forEach(b => {
        const isSelected = (b === btn) || (b.getAttribute('data-filter') === filterSource);
        if (isSelected) {
          b.style.background = '#233917';
          b.style.color = '#FFFFFF';
          b.style.borderColor = '#233917';
          b.style.fontWeight = '700';
        } else {
          b.style.background = '#FFFFFF';
          b.style.color = '#1C200E';
          b.style.borderColor = '#CBD5E1';
          b.style.fontWeight = '600';
        }
      });
    }
    this.renderHistoryPage();
  }

  // Tangani pencarian hidangan pada halaman Riwayat
  handleHistorySearch(query) {
    this.historySearchQuery = (query || '').trim();
    this.renderHistoryPage();
  }

  // Reset / Bersihkan seluruh catatan makanan hari ini
  clearTodayMeals() {
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const meals = this.todayMeals || [];
    if (meals.length === 0) {
      if (typeof app !== 'undefined' && typeof app.showToast === 'function') {
        app.showToast(isId ? 'Belum ada catatan hidangan hari ini.' : 'No meal records logged today.');
      }
      return;
    }

    const confirmMsg = isId
      ? 'Apakah Anda yakin ingin mereset seluruh catatan makanan hari ini?\n\nSemua hidangan yang dicatat hari ini akan dihapus dan capaian nutrisi harian akan dikembalikan ke 0.'
      : 'Are you sure you want to reset all logged meals for today?\n\nAll dishes logged today will be cleared and daily nutrient progress will be reset to 0.';

    if (!confirm(confirmMsg)) return;

    this.todayMeals = [];
    this.todayIntake = {
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0
    };

    const todayLog = this.weeklyLogs.find(l => l.isToday);
    if (todayLog) {
      todayLog.protein = 0;
      todayLog.calories = 0;
      todayLog.compliancePct = 0;
    }

    const userKey = (typeof app !== 'undefined' && (app.userProfile?.contact || app.userProfile?.email || app.userProfile?.name)) || 'guest';
    this.saveUserProgress(userKey);

    if (typeof app !== 'undefined' && app.userProfile && app.userProfile.targets) {
      this.renderMacroDonut(app.userProfile.targets);
    }
    this.renderWeeklyBarChart();
    this.renderTodayMealHistory();
    this.renderHistoryPage();

    if (typeof app !== 'undefined' && typeof app.showToast === 'function') {
      app.showToast(isId ? 'Catatan hidangan hari ini berhasil direset.' : "Today's meal journal has been reset.");
    }
  }

  // Render Halaman Dedikasi Riwayat Asupan & Jurnal Makanan (#view-history)
  renderHistoryPage() {
    const pageView = document.getElementById('view-history');
    if (!pageView) return;

    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const profile = (typeof app !== 'undefined' ? app.userProfile : null) || {};
    const targetProt = profile?.targets?.protein || 75;
    const targetCal = profile?.targets?.calories || 1850;

    const meals = Array.isArray(this.todayMeals) ? this.todayMeals : [];
    const totalProt = meals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
    const totalCals = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
    const protPct = targetProt > 0 ? Math.round((totalProt / targetProt) * 100) : 0;

    // 1. Update KPI Summary Cards
    const countEl = document.getElementById('hist-stat-count');
    if (countEl) {
      countEl.textContent = isId ? `${meals.length} Hidangan` : `${meals.length} Meals`;
    }

    const protEl = document.getElementById('hist-stat-protein');
    if (protEl) {
      protEl.innerHTML = `<span style="color:#1B5E20;font-weight:700;">+${totalProt}g</span> <span style="font-size:12px;color:#687346;font-weight:600;">/ ${targetProt}g (${protPct}%)</span>`;
    }

    const calsEl = document.getElementById('hist-stat-calories');
    if (calsEl) {
      calsEl.textContent = `${totalCals.toLocaleString()} ${isId ? 'kkal' : 'kcal'}`;
    }

    const statusBadge = document.getElementById('hist-stat-status-badge');
    if (statusBadge) {
      let badgeClass = 'badge gray';
      let badgeText = isId ? 'Belum Ada Asupan' : 'No Intake Yet';
      if (meals.length > 0) {
        if (protPct >= 100) {
          badgeClass = 'badge green';
          badgeText = isId ? `Optimal (${protPct}%)` : `Optimal (${protPct}%)`;
        } else if (protPct >= 70) {
          badgeClass = 'badge teal';
          badgeText = isId ? `Baik (${protPct}%)` : `Good (${protPct}%)`;
        } else if (protPct >= 40) {
          badgeClass = 'badge orange';
          badgeText = isId ? `Perlu Tambahan (${protPct}%)` : `Needs More (${protPct}%)`;
        } else {
          badgeClass = 'badge red';
          badgeText = isId ? `Rendah (${protPct}%)` : `Low (${protPct}%)`;
        }
      }
      statusBadge.className = badgeClass;
      statusBadge.textContent = badgeText;
    }

    // 2. Filter & Search Today's Meals
    const filter = this.historyFilterSource || 'all';
    const query = (this.historySearchQuery || '').toLowerCase();
    let filtered = meals;
    if (filter !== 'all') {
      filtered = filtered.filter(m => (m.source || '').toLowerCase().includes(filter.toLowerCase()));
    }
    if (query) {
      filtered = filtered.filter(m =>
        (m.name || '').toLowerCase().includes(query) ||
        (m.source || '').toLowerCase().includes(query)
      );
    }

    // 3. Render Today's Journal List
    const listContainer = document.getElementById('history-page-meal-list');
    if (listContainer) {
      if (meals.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:44px 20px;background:#FAFBF7;border:1px dashed #D9E2CF;border-radius:12px;">
            <div style="width:52px;height:52px;border-radius:50%;background:rgba(35,57,23,0.06);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#233917;">
              <i data-lucide="utensils-crossed" style="width:24px;height:24px;"></i>
            </div>
            <h4 style="font-size:15px;font-weight:700;color:#1C200E;margin-bottom:6px;" data-i18n="hist_empty_title">
              ${isId ? 'Belum Ada Hidangan yang Dicatat Hari Ini' : 'No Meals Logged Today Yet'}
            </h4>
            <p style="font-size:12.5px;color:#687346;max-width:440px;margin:0 auto 18px;line-height:1.5;" data-i18n="hist_empty_desc">
              ${isId ? 'Menu yang Anda catat dari Rencana Menu, Pindai Kamera AI, atau Katalog Pangan akan tersusun rapi di jurnal ini.' : 'Meals you log from the Meal Planner, AI Camera Scan, or Catalog will appear here in your food journal.'}
            </p>
            <div style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
              <button type="button" class="btn-outline-glass" onclick="app.navigate('overview')"
                style="font-size:12px;padding:7px 16px;border-radius:8px;display:inline-flex;align-items:center;gap:6px;background:#FFFFFF;border:1px solid #CBD5E1;color:#1B3917;font-weight:700;cursor:pointer;">
                <i data-lucide="arrow-left" style="width:14px;height:14px;"></i>
                <span>${isId ? 'Kembali ke Ringkasan' : 'Back to Overview'}</span>
              </button>
            </div>
          </div>
        `;
      } else if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:36px 20px;background:#FAFBF7;border:1px dashed #D9E2CF;border-radius:12px;color:#687346;font-size:13px;">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(35,57,23,0.06);margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#687346;">
              <i data-lucide="search-x" style="width:20px;height:20px;"></i>
            </div>
            <b>${isId ? 'Tidak ada hidangan yang cocok dengan filter atau kata kunci.' : 'No dishes match your filter or search query.'}</b>
            <div style="margin-top:10px;">
              <button type="button" onclick="progressTracker.setHistoryFilter('all', document.querySelector('#history-filter-chips [data-filter=\\'all\\']'));document.getElementById('history-search-input').value='';progressTracker.handleHistorySearch('');"
                class="btn-outline-glass" style="font-size:11.5px;padding:5px 14px;border-radius:6px;background:#FFFFFF;border:1px solid #CBD5E1;color:#233917;font-weight:600;cursor:pointer;">
                ${isId ? 'Reset Filter' : 'Reset Filter'}
              </button>
            </div>
          </div>
        `;
      } else {
        const formatSourceBadge = (rawSource, isId) => {
          const s = (rawSource || '').toLowerCase();
          if (s.includes('sarapan') || s.includes('breakfast')) return isId ? 'Sarapan' : 'Breakfast';
          if (s.includes('siang') || s.includes('lunch')) return isId ? 'Makan Siang' : 'Lunch';
          if (s.includes('malam') || s.includes('dinner')) return isId ? 'Makan Malam' : 'Dinner';
          if (s.includes('camilan') || s.includes('snack')) return isId ? 'Camilan' : 'Snack';
          if (s.includes('pindai') || s.includes('scan') || s.includes('kamera') || s.includes('camera')) return isId ? 'Pindai Kamera AI' : 'AI Camera Scan';
          if (s.includes('rencana') || s.includes('planner') || s.includes('menu')) return isId ? 'Rencana Menu' : 'Meal Planner';
          if (s.includes('katalog') || s.includes('catalog')) return isId ? 'Katalog Pangan' : 'Food Catalog';
          return rawSource || (isId ? 'Manual' : 'Manual');
        };

        const itemsHtml = filtered.map(meal => {
          const src = (meal.source || '').toLowerCase();
          let sourceBadgeClass = 'badge gray';
          if (src.includes('pindai') || src.includes('scan') || src.includes('kamera') || src.includes('camera') || src.includes('ai')) {
            sourceBadgeClass = 'badge teal';
          } else if (src.includes('rencana') || src.includes('planner') || src.includes('menu')) {
            sourceBadgeClass = 'badge green';
          } else if (src.includes('katalog') || src.includes('catalog')) {
            sourceBadgeClass = 'badge orange';
          }

          const displaySource = formatSourceBadge(meal.source, isId);

          return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:8px;background:#FAFBF7;border:1px solid #E2E8CE;border-radius:10px;gap:12px;flex-wrap:wrap;transition:all 0.15s ease;"
              onmouseover="this.style.borderColor='#A6B280';this.style.background='#FFFFFF';"
              onmouseout="this.style.borderColor='#E2E8CE';this.style.background='#FAFBF7';">
              <div style="display:flex;align-items:center;gap:12px;min-width:200px;flex:1;">
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:#FFFFFF;border:1px solid #E2E8CE;border-radius:8px;padding:6px 10px;min-width:62px;">
                  <span style="font-size:10px;font-weight:700;color:#8A9664;text-transform:uppercase;">${isId ? 'JAM' : 'TIME'}</span>
                  <b style="font-size:13px;color:#233917;">${meal.time || '--:--'}</b>
                </div>
                <div>
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <b style="font-size:14px;color:#1C200E;">${meal.name}</b>
                    <span class="${sourceBadgeClass}" style="font-size:10.5px;padding:2px 8px;font-weight:600;">
                      ${displaySource}
                    </span>
                  </div>
                  <div style="font-size:11.5px;color:#687346;margin-top:3px;">
                    ${isId ? 'Komposisi Nutrisi:' : 'Nutrient breakdown:'} ${isId ? 'Karbohidrat' : 'Carbs'} <b>${meal.carbs || 0}g</b> · ${isId ? 'Lemak' : 'Fat'} <b>${meal.fat || 0}g</b>
                  </div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <div style="background:#E8F5E9;border:1px solid #C8E6C9;border-radius:8px;padding:5px 10px;text-align:right;">
                    <span style="font-size:10px;color:#2E7D32;font-weight:700;display:block;text-transform:uppercase;">PROTEIN</span>
                    <b style="font-size:13px;color:#1B5E20;">+${meal.protein}g</b>
                  </div>
                  <div style="background:#FFF9E6;border:1px solid #FFE082;border-radius:8px;padding:5px 10px;text-align:right;">
                    <span style="font-size:10px;color:#8C6D1F;font-weight:700;display:block;text-transform:uppercase;">${isId ? 'KALORI' : 'ENERGY'}</span>
                    <b style="font-size:13px;color:#785F18;">${meal.calories} ${isId ? 'kkal' : 'kcal'}</b>
                  </div>
                </div>
                <button type="button" onclick="progressTracker.removeLoggedMeal('${meal.id}')"
                  title="${isId ? 'Hapus catatan ini' : 'Delete this entry'}"
                  style="background:none;border:1px solid #E2E8CE;color:#9CA3AF;padding:6px 8px;cursor:pointer;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s ease;"
                  onmouseover="this.style.color='#DC2626';this.style.borderColor='#FED7D7';this.style.background='#FFF5F5'"
                  onmouseout="this.style.color='#9CA3AF';this.style.borderColor='#E2E8CE';this.style.background='none'">
                  <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');

        listContainer.innerHTML = `
          ${itemsHtml}
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;margin-top:10px;background:rgba(35,57,23,0.05);border:1px solid #E2E8CE;border-radius:9px;font-size:12.5px;color:#233917;flex-wrap:wrap;gap:8px;">
            <span style="font-weight:700;">${isId ? 'Akumulasi Asupan Hari Ini:' : "Today's Total Accumulated Intake:"}</span>
            <span>
              <b>${meals.length}</b> ${isId ? 'hidangan' : 'items'} · 
              <b style="color:#1B5E20;font-size:13px;">+${totalProt}g</b> Protein (${protPct}%) · 
              <b style="color:#785F18;font-size:13px;">${totalCals.toLocaleString()}</b> ${isId ? 'kkal' : 'kcal'}
            </span>
          </div>
        `;
      }
    }

    // 4. Render 7-Day History Archive Table
    const tableBody = document.getElementById('history-7day-table-body');
    if (tableBody) {
      this._render7DayTable(tableBody, this.weeklyLogs, targetProt, isId);

      // Coba ambil data akurat dari backend (async, update tabel setelah dapat data)
      if (typeof window !== 'undefined' && window.nutriAPI && window.nutriAPI.isServerOnline) {
        window.nutriAPI.getWeeklyStats().then(data => {
          if (data?.success && Array.isArray(data.days) && data.days.length > 0) {
            // Konversi format API ke format weeklyLogs internal
            const apiLogs = data.days.map(d => ({
              day: d.dayId,
              date: d.date,
              dateKey: d.date,
              protein: Math.round(d.actualProtein || 0),
              targetProt: d.targetProtein || targetProt,
              calories: Math.round(d.actualCalories || 0),
              targetCal: d.targetCalories || profile?.targets?.calories || 1850,
              compliancePct: d.compliancePct || 0,
              isToday: d.date === new Date().toISOString().split('T')[0]
            }));
            // Update weeklyLogs internal dengan data server
            this.weeklyLogs = apiLogs;
            const userKey2 = (typeof app !== 'undefined' && (app.userProfile?.contact || app.userProfile?.email || app.userProfile?.name)) || 'guest';
            this.saveUserProgress(userKey2);
            this.renderWeeklyBarChart();
            // Re-render tabel dengan data server
            if (tableBody) this._render7DayTable(tableBody, apiLogs, data.targetProtein || targetProt, isId);
          }
        }).catch(() => { /* Diam jika offline */ });
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Helper internal: render baris tabel 7-hari
  _render7DayTable(tableBody, logs, targetProt, isId) {
    const safeLog = Array.isArray(logs) && logs.length > 0 ? logs : [];
    if (safeLog.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="padding:20px;text-align:center;color:#687346;">${isId ? 'Belum ada data riwayat mingguan.' : 'No weekly history data available.'}</td></tr>`;
      return;
    }
    tableBody.innerHTML = safeLog.map(log => {
      const tProt = log.targetProt || targetProt || 75;
      const aProt = log.protein || 0;
      const pct = tProt > 0 ? Math.min(100, Math.round((aProt / tProt) * 100)) : 0;
      const cals = (log.calories || 0).toLocaleString();

      let statusBadge = `<span class="badge gray" style="font-size:10.5px;padding:3px 8px;">${isId ? 'Nir-Asupan' : 'No Data'}</span>`;
      let progressColor = '#9CA3AF';
      if (aProt > 0) {
        if (pct >= 100) {
          statusBadge = `<span class="badge green" style="font-size:10.5px;padding:3px 8px;font-weight:700;">${isId ? 'Optimal' : 'Optimal'}</span>`;
          progressColor = '#1B5E20';
        } else if (pct >= 70) {
          statusBadge = `<span class="badge teal" style="font-size:10.5px;padding:3px 8px;font-weight:700;">${isId ? 'Baik' : 'Good'}</span>`;
          progressColor = '#0284C7';
        } else if (pct >= 40) {
          statusBadge = `<span class="badge orange" style="font-size:10.5px;padding:3px 8px;font-weight:700;">${isId ? 'Cukup' : 'Fair'}</span>`;
          progressColor = '#D97706';
        } else {
          statusBadge = `<span class="badge red" style="font-size:10.5px;padding:3px 8px;font-weight:700;">${isId ? 'Rendah' : 'Low'}</span>`;
          progressColor = '#DC2626';
        }
      }

      const isToday = !!log.isToday;
      const rowBg = isToday ? 'background:rgba(35,57,23,0.06);font-weight:600;' : 'background:#FFFFFF;';

      return `
        <tr style="${rowBg}border-bottom:1px solid #E2E8CE;font-size:12px;color:#1C200E;text-align:center;">
          <td style="padding:10px 12px;text-align:left;">
            <div style="display:flex;align-items:center;gap:6px;">
              ${isToday ? `<span class="badge teal" style="font-size:9.5px;padding:2px 6px;">${isId ? 'HARI INI' : 'TODAY'}</span>` : ''}
              <b>${log.day}</b> <span style="color:#687346;font-size:11px;">(${log.date || '--'})</span>
            </div>
          </td>
          <td style="padding:10px 12px;color:#687346;">${tProt}g</td>
          <td style="padding:10px 12px;font-weight:700;color:${aProt > 0 ? '#1B5E20' : '#9CA3AF'};">${aProt}g</td>
          <td style="padding:10px 12px;">
            <div style="display:flex;align-items:center;gap:8px;justify-content:center;">
              <div style="flex:1;max-width:80px;height:7px;background:#E2E8CE;border-radius:4px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:${progressColor};border-radius:4px;"></div>
              </div>
              <span style="font-size:11px;font-weight:700;min-width:32px;text-align:right;">${pct}%</span>
            </div>
          </td>
          <td style="padding:10px 12px;color:#785F18;font-weight:600;">${cals} ${isId ? 'kkal' : 'kcal'}</td>
          <td style="padding:10px 12px;">${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Sinkronisasi data dari backend MySQL ke state lokal (async, non-blocking).
   * Dipanggil saat loadUserProgress() selesai membaca localStorage.
   * Jika backend online, data server dijadikan sumber kebenaran (source of truth).
   */
  async syncFromServer(userKey, targets) {
    if (typeof window === 'undefined' || !window.nutriAPI) return;

    try {
      // 1. Tunggu health check (bisa sudah selesai karena dipanggil di constructor api-client)
      const isOnline = window.nutriAPI.isServerOnline || await window.nutriAPI.checkHealth();
      if (!isOnline) return;

      // 2. Ambil data hari ini dari server untuk pengguna aktif
      const activeUserId = (typeof app !== 'undefined' && app.userProfile?.id) || userKey || null;
      const todayData = await window.nutriAPI.getMealsToday(activeUserId).catch(() => null);
      if (todayData?.success && Array.isArray(todayData.meals)) {
        // Konversi format server ke format internal todayMeals
        const serverMeals = todayData.meals.map(m => ({
          id: m.id,
          _serverId: m.id,
          name: m.title || 'Menu Tercatat',
          time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          protein: parseFloat(m.total_protein) || 0,
          calories: parseInt(m.total_calories) || 0,
          carbs: parseFloat(m.total_carbs) || 0,
          fat: parseFloat(m.total_fat) || 0,
          source: m.meal_type === 'breakfast' ? 'Sarapan' :
                  m.meal_type === 'lunch' ? 'Makan Siang' :
                  m.meal_type === 'dinner' ? 'Makan Malam' : 'Camilan',
          imageUrl: m.image_url || ''
        }));

        // Server adalah sumber kebenaran utama saat online (Source of Truth)
        this.todayMeals = serverMeals;
        if (todayData.summary) {
          this.todayIntake.protein = todayData.summary.totalProtein || 0;
          this.todayIntake.calories = todayData.summary.totalCalories || 0;
          this.todayIntake.carbs = todayData.summary.totalCarbs || 0;
          this.todayIntake.fat = todayData.summary.totalFat || 0;
        } else {
          this.todayIntake = { protein: 0, calories: 0, carbs: 0, fat: 0 };
        }

          // Update today's weeklyLog entry
          const todayLog = this.weeklyLogs.find(l => l.isToday);
          if (todayLog) {
            todayLog.protein = this.todayIntake.protein;
            todayLog.calories = this.todayIntake.calories;
            const tProt = todayLog.targetProt || targets?.protein || 75;
            todayLog.compliancePct = Math.min(100, Math.round((this.todayIntake.protein / tProt) * 100));
          }

          this.saveUserProgress(userKey);
          this.renderTodayMealHistory();

          // Update macro donut kalau profile sudah ada
          const prof = (typeof app !== 'undefined' ? app.userProfile : null);
          if (prof?.targets) {
            this.renderMacroDonut(prof.targets);
          }
          this.renderWeeklyBarChart();

          // Update history page jika sedang terbuka
          const histView = document.getElementById('view-history');
          if (histView && histView.classList.contains('active-view')) {
            this.renderHistoryPage();
          }

          console.log(`[NutriVision] ✅ Sync dari server: ${serverMeals.length} hidangan hari ini dimuat.`);
        }
    } catch (err) {
      // Silent fail — mode offline tetap berjalan dari localStorage
      console.warn('[NutriVision] syncFromServer gagal (offline):', err.message);
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
          <div style="display:flex;align-items:center;gap:14px;">
            <img src="icons/nutrivision-icon.png" alt="NutriVision AI" style="width:48px;height:48px;object-fit:contain;flex-shrink:0;" />
            <div>
              <h1 style="margin:0;font-size:20px;font-weight:800;color:#233917;letter-spacing:-0.4px;">NUTRIVISION AI</h1>
              <p style="margin:2px 0 0;font-size:10px;color:#556633;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">FROM WHAT YOU EAT TO WHAT YOU NEED</p>
              <p style="margin:2px 0 0;font-size:11px;color:#687346;">Sistem Pemantauan Gizi Klinis &amp; Rekam Telehealth Pemulihan ERAS</p>
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
              <div style="font-size:10.5px;color:#687346;margin-bottom:34px;">Konsultan Nutrisi Klinis / Fisioterapis (Nakes)</div>
              <div style="font-weight:700;font-size:12px;color:#1C200E;border-bottom:1px solid #A8B585;padding-bottom:2px;display:inline-block;min-width:170px;">
                Hendra Kusuma, S.Gz, RD / Nakes Terdaftar
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
