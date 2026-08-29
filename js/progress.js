// NutriVision AI — Progress & Recovery Tracking (7-Day History & Macro Rings)
// Sesuai FR-09: Riwayat asupan, visualisasi kepatuhan protein/kalori, ekspor ke fisioterapis/nakes

class NutriVisionProgress {
  constructor() {
    this.weeklyLogs = [
      { day: 'Sen', date: '24 Agt', protein: 68, targetProt: 75, calories: 1720, targetCal: 1850, compliancePct: 91 },
      { day: 'Sel', date: '25 Agt', protein: 74, targetProt: 75, calories: 1810, targetCal: 1850, compliancePct: 99 },
      { day: 'Rab', date: '26 Agt', protein: 56, targetProt: 75, calories: 1540, targetCal: 1850, compliancePct: 75 },
      { day: 'Kam', date: '27 Agt', protein: 76, targetProt: 75, calories: 1890, targetCal: 1850, compliancePct: 100 },
      { day: 'Jum', date: '28 Agt', protein: 70, targetProt: 75, calories: 1780, targetCal: 1850, compliancePct: 93 },
      { day: 'Sab', date: '29 Agt', protein: 78, targetProt: 75, calories: 1860, targetCal: 1850, compliancePct: 100 },
      { day: 'Hari Ini', date: '30 Agt', protein: 58, targetProt: 75, calories: 1420, targetCal: 1850, compliancePct: 77, isToday: true }
    ];

    this.todayIntake = {
      protein: 58,
      carbs: 195,
      fat: 42,
      calories: 1420
    };
  }

  // Tambahkan hasil scan baru ke asupan hari ini
  addLoggedMeal(aggregatedNutrients) {
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
      todayLog.compliancePct = Math.min(100, Math.round((this.todayIntake.protein / todayLog.targetProt) * 100));
    }
  }

  // Render Grafik Batang Tren Mingguan (FR-09)
  renderWeeklyBarChart() {
    const container1 = document.getElementById('weekly-bar-chart-box');
    const container2 = document.getElementById('weekly-bar-chart-box-full');
    if (!container1 && !container2) return;

    const maxProt = Math.max(...this.weeklyLogs.map(l => l.targetProt * 1.15));

    const html = this.weeklyLogs.map(log => {
      const heightPct = Math.min(100, Math.round((log.protein / maxProt) * 100));
      return `
        <div class="bar-column ${log.isToday ? 'today' : ''}">
          <div class="bar-wrapper" title="${log.date}: ${log.protein}g / ${log.targetProt}g protein (${log.compliancePct}%)">
            <div class="bar-fill" style="height: ${heightPct}%"></div>
          </div>
          <span class="day-label">${log.day}</span>
        </div>
      `;
    }).join('');

    if (container1) container1.innerHTML = html;
    if (container2) container2.innerHTML = html;
  }

  // Render Macro Progress Bars & Center Donut
  renderMacroDonut(currentTargets) {
    const targets = currentTargets || { protein: 75, carbs: 240, fat: 55, calories: 1850 };
    const protPct = Math.min(100, Math.round((this.todayIntake.protein / targets.protein) * 100));
    const carbsPct = Math.min(100, Math.round((this.todayIntake.carbs / targets.carbs) * 100));
    const fatPct = Math.min(100, Math.round((this.todayIntake.fat / targets.fat) * 100));
    const calsPct = Math.min(100, Math.round((this.todayIntake.calories / targets.calories) * 100));

    // Update Donut Center Text
    const donutVal = document.getElementById('macro-donut-value');
    if (donutVal) donutVal.textContent = `${protPct}%`;

    // Update Circle Stroke Dashoffset
    const donutCircle = document.getElementById('macro-donut-circle-prot');
    if (donutCircle) {
      const circumference = 2 * Math.PI * 48; // r=48 -> ~301.6
      const offset = circumference - (circumference * protPct / 100);
      donutCircle.style.strokeDashoffset = offset;
    }

    // Update Macro Numerical Labels
    const elProt = document.getElementById('macro-num-protein');
    if (elProt) elProt.textContent = `${this.todayIntake.protein} / ${targets.protein} g`;

    const elCarbs = document.getElementById('macro-num-carbs');
    if (elCarbs) elCarbs.textContent = `${this.todayIntake.carbs} / ${targets.carbs} g`;

    const elFat = document.getElementById('macro-num-fat');
    if (elFat) elFat.textContent = `${this.todayIntake.fat} / ${targets.fat} g`;

    const elCals = document.getElementById('macro-num-cals');
    if (elCals) elCals.textContent = `${this.todayIntake.calories.toLocaleString()} / ${targets.calories.toLocaleString()} kkal`;

    // Update Macro Bar Tracks
    const barProt = document.getElementById('bar-fill-protein');
    if (barProt) barProt.style.width = `${protPct}%`;

    const barCarbs = document.getElementById('bar-fill-carbs');
    if (barCarbs) barCarbs.style.width = `${carbsPct}%`;

    const barFat = document.getElementById('bar-fill-fat');
    if (barFat) barFat.style.width = `${fatPct}%`;

    const barCals = document.getElementById('bar-fill-cals');
    if (barCals) barCals.style.width = `${calsPct}%`;

    // Update Recovery Recommendation Indicator (FR-05)
    const tipBox = document.getElementById('recovery-target-advice');
    if (tipBox) {
      const remainingProt = targets.protein - this.todayIntake.protein;
      if (remainingProt > 0) {
        tipBox.innerHTML = `
          <span>💡</span>
          <div>
            <strong>Saran Gizi Pemulihan:</strong> Protein masih kurang <b>${remainingProt}g</b> untuk target hari ini. 
            Disarankan menambah <i>2 butir telur rebus (14g)</i> atau <i>1 porsi tahu kukus (8g)</i> saat makan malam.
          </div>
        `;
      } else {
        tipBox.innerHTML = `
          <span>🎉</span>
          <div>
            <strong>Luar biasa!</strong> Target protein pemulihan hari ini telah tercapai optimal (100%). Pertahankan hidrasi dan istirahat berkualitas.
          </div>
        `;
      }
    }
  }

  // Buat Teks Ringkasan Laporan untuk Dibagikan ke Nakes / Fisioterapis
  generateCaregiverReportText(userProfile) {
    const avgProt = Math.round(this.weeklyLogs.reduce((acc, l) => acc + l.protein, 0) / this.weeklyLogs.length);
    const text = `📋 LAPORAN KEPATUHAN GIZI PEMULIHAN NUTRIVISION AI
Pasien: ${userProfile.name || 'Rangga P.'}
Kondisi: ${userProfile.conditionTitle || 'Pasca-Operasi Minggu ke-2'}
Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}

• Rata-rata Asupan Protein 7 Hari: ${avgProt}g / ${userProfile.targets?.protein || 75}g (${Math.round((avgProt / (userProfile.targets?.protein || 75)) * 100)}%)
• Asupan Hari Ini: Protein ${this.todayIntake.protein}g | Kalori ${this.todayIntake.calories} kkal
• Status Pantangan/Alergi: ${userProfile.restrictions || 'Tidak ada pantangan khusus'}
• Catatan: Data dicatat secara mandiri melalui segmentasi foto NutriVision AI sebagai pendukung keputusan klinis.`;

    return text;
  }
}

const progressTracker = new NutriVisionProgress();
