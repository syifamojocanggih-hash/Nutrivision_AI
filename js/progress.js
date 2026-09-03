// NutriVision AI — Progress & Recovery Tracking (7-Day History & Macro Rings)
// Sesuai FR-09: Riwayat asupan, visualisasi kepatuhan protein/kalori, ekspor ke fisioterapis/nakes

class NutriVisionProgress {
  constructor() {
    const targetProt = 75;
    const targetCal = 1850;
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
      todayLog.compliancePct = Math.min(100, Math.round((this.todayIntake.protein / (todayLog.targetProt || 75)) * 100));
    }
  }

  // Render Grafik Batang Tren Mingguan (FR-09)
  renderWeeklyBarChart() {
    const container1 = document.getElementById('weekly-bar-chart-box');
    const container2 = document.getElementById('weekly-bar-chart-box-full');
    if (!container1 && !container2) return;

    const maxProt = Math.max(100, ...this.weeklyLogs.map(l => (l.targetProt || 75) * 1.15));

    const html = this.weeklyLogs.map(log => {
      const heightPct = Math.min(100, Math.round((log.protein / maxProt) * 100));
      return `
        <div class="bar-column ${log.isToday ? 'today' : ''}">
          <div class="bar-wrapper" title="${log.date}: ${log.protein}g / ${log.targetProt || 75}g protein (${log.compliancePct}%)">
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
    const isConfigured = currentTargets && currentTargets.protein > 0;
    const targets = isConfigured ? currentTargets : { protein: 0, carbs: 0, fat: 0, calories: 0 };
    
    const protPct = isConfigured ? Math.min(100, Math.round((this.todayIntake.protein / targets.protein) * 100)) : 0;
    const carbsPct = isConfigured ? Math.min(100, Math.round((this.todayIntake.carbs / targets.carbs) * 100)) : 0;
    const fatPct = isConfigured ? Math.min(100, Math.round((this.todayIntake.fat / targets.fat) * 100)) : 0;
    const calsPct = isConfigured ? Math.min(100, Math.round((this.todayIntake.calories / targets.calories) * 100)) : 0;

    // Update Donut Center Text
    const donutVal = document.getElementById('macro-donut-value');
    if (donutVal) donutVal.textContent = isConfigured ? `${protPct}%` : `0%`;

    // Update Circle Stroke Dashoffset
    const donutCircle = document.getElementById('macro-donut-circle-prot');
    if (donutCircle) {
      const circumference = 2 * Math.PI * 48; // r=48 -> ~301.6
      const offset = circumference - (circumference * protPct / 100);
      donutCircle.style.strokeDashoffset = offset;
    }

    // Update Macro Numerical Labels
    const elProt = document.getElementById('macro-num-protein');
    if (elProt) elProt.textContent = isConfigured ? `${this.todayIntake.protein} / ${targets.protein} g` : `${this.todayIntake.protein} / -- g`;

    const elCarbs = document.getElementById('macro-num-carbs');
    if (elCarbs) elCarbs.textContent = isConfigured ? `${this.todayIntake.carbs} / ${targets.carbs} g` : `${this.todayIntake.carbs} / -- g`;

    const elFat = document.getElementById('macro-num-fat');
    if (elFat) elFat.textContent = isConfigured ? `${this.todayIntake.fat} / ${targets.fat} g` : `${this.todayIntake.fat} / -- g`;

    const elCals = document.getElementById('macro-num-cals');
    if (elCals) elCals.textContent = isConfigured ? `${this.todayIntake.calories.toLocaleString()} / ${targets.calories.toLocaleString()} kkal` : `${this.todayIntake.calories} / -- kkal`;

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
      if (!isConfigured) {
        tipBox.innerHTML = `
          <i data-lucide="sparkles" style="color:var(--teal-700);width:20px;height:20px;flex-shrink:0;"></i>
          <div>
            <strong>Profil Gizi Belum Diisi:</strong> Lengkapi 
            <a href="javascript:void(0)" onclick="app.openQuizModal(1)" style="color:var(--teal-700);font-weight:700;text-decoration:underline;">Kuesioner Diagnostik (Foodvisor Style)</a> 
            untuk mendapatkan target harian dan rekomendasi piring makan.
          </div>
        `;
      } else {
        const remainingProt = targets.protein - this.todayIntake.protein;
        if (remainingProt > 0) {
          tipBox.innerHTML = `
            <i data-lucide="lightbulb" style="color:var(--teal-700);width:20px;height:20px;flex-shrink:0;"></i>
            <div>
              <strong>Saran Gizi Pemulihan:</strong> Protein masih kurang <b>${remainingProt}g</b> untuk target hari ini. 
              Disarankan menambah <i>2 butir telur rebus (14g)</i> atau <i>1 porsi tahu kukus (8g)</i> saat makan malam.
            </div>
          `;
        } else {
          tipBox.innerHTML = `
            <i data-lucide="check-circle" style="color:var(--teal-500);width:20px;height:20px;flex-shrink:0;"></i>
            <div>
              <strong>Target Protein Tercapai!</strong> Kebutuhan asam amino hari ini telah terpenuhi optimal untuk proses regenerasi sel.
            </div>
          `;
        }
      }
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
  }

  // Buat Teks Ringkasan Laporan untuk Dibagikan ke Nakes / Fisioterapis
  generateCaregiverReportText(userProfile) {
    const avgProt = Math.round(this.weeklyLogs.reduce((acc, l) => acc + l.protein, 0) / this.weeklyLogs.length);
    const targetProt = userProfile?.targets?.protein || 75;
    const avgPct = Math.round((avgProt / targetProt) * 100);
    const text = `📋 LAPORAN KEPATUHAN GIZI PEMULIHAN NUTRIVISION AI
Pasien: ${userProfile?.name || 'Rangga Pratama'}
Kondisi: ${userProfile?.conditionTitle || 'Pasca-Operasi Minggu ke-2'}
Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}

• Rata-rata Asupan Protein 7 Hari: ${avgProt}g / ${targetProt}g (${avgPct}%)
• Asupan Hari Ini: Protein ${this.todayIntake.protein}g | Kalori ${this.todayIntake.calories} kkal
• Status Pantangan/Alergi: ${userProfile?.restrictions || 'Tidak ada pantangan khusus'}
• Catatan: Data dicatat secara mandiri melalui segmentasi foto NutriVision AI sebagai pendukung keputusan klinis.`;

    return text;
  }

  // Buat Template HTML Dokumen PDF Laporan & Progress Resmi
  generatePDFReportHTML(userProfile, mealPlanner) {
    const profile = userProfile || (typeof app !== 'undefined' ? app.userProfile : {}) || {};
    const patientName = profile.name || 'Rangga Pratama';
    const condition = profile.conditionTitle || 'Pasca-Operasi Laparotomi & Rekonstruksi Jaringan';
    const phase = profile.phase || 'Fase 2 (Hari 6–21) · Proliferasi & Sintesis';
    const targets = profile.targets || { protein: 75, calories: 1850, carbs: 230, fat: 50 };
    const weight = profile.weightKg || 65;
    const height = profile.heightCm || 170;
    const bmi = profile.bmi || (weight / Math.pow(height / 100, 2)).toFixed(1);
    const bmiCat = profile.bmiCategory || 'Normal';
    const restrictions = profile.restrictions || 'Bebas Santan Kental, Rendah Garam & Lemak Trans';
    const contact = profile.contact || 'rangga.p@example.com';
    const docDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const docTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const docRef = `NV-TELE-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalProt = this.weeklyLogs.reduce((acc, l) => acc + l.protein, 0);
    const avgProt = Math.round(totalProt / this.weeklyLogs.length);
    const avgCompliance = Math.round((avgProt / (targets.protein || 75)) * 100);

    const activeSymptomsList = [];
    if (mealPlanner && mealPlanner.activeSymptoms) {
      if (mealPlanner.activeSymptoms.has('sulit-menelan')) activeSymptomsList.push('Sulit Menelan (Disfagia)');
      if (mealPlanner.activeSymptoms.has('mual')) activeSymptomsList.push('Mual Pasca-Tindakan');
      if (mealPlanner.activeSymptoms.has('konstipasi')) activeSymptomsList.push('Konstipasi / Sembelit');
      if (mealPlanner.activeSymptoms.has('nafsu-rendah')) activeSymptomsList.push('Nafsu Makan Rendah');
    }
    if (activeSymptomsList.length === 0) activeSymptomsList.push('Sulit Menelan (Disfagia)');

    const tableRows = this.weeklyLogs.map(log => {
      const tgt = log.targetProt || targets.protein || 75;
      const pct = Math.min(100, Math.round((log.protein / tgt) * 100));
      const isReached = pct >= 90;
      const statusBadge = isReached 
        ? `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#EAF5E9;color:#1B5E20;font-size:11px;font-weight:700;">✓ Tercapai</span>`
        : `<span style="display:inline-block;padding:3px 8px;border-radius:12px;background:#FFF3E0;color:#E65100;font-size:11px;font-weight:700;">⚠ Terpantau</span>`;
      
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

        <!-- Section 2: Target Gizi Harian ERAS -->
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;font-weight:800;color:#233917;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">
            Target Nutrisi Pemulihan Harian (Kebutuhan Klinis)
          </div>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;">
            <div style="background:#F2F6E6;border:1px solid #C8D4A8;border-radius:8px;padding:10px;text-align:center;">
              <span style="font-size:10.5px;color:#556633;display:block;">Target Protein</span>
              <b style="font-size:16px;color:#233917;display:block;margin:2px 0;">${targets.protein} g</b>
              <span style="font-size:10px;color:#687346;">Regenerasi Jaringan</span>
            </div>
            <div style="background:#FFF9F0;border:1px solid #EFE2C2;border-radius:8px;padding:10px;text-align:center;">
              <span style="font-size:10.5px;color:#8C6D1F;display:block;">Target Kalori</span>
              <b style="font-size:16px;color:#8C6D1F;display:block;margin:2px 0;">${targets.calories.toLocaleString()} kkal</b>
              <span style="font-size:10px;color:#9E8236;">Energi Basal &amp; Imun</span>
            </div>
            <div style="background:#FAFAF7;border:1px solid #E5E5DC;border-radius:8px;padding:10px;text-align:center;">
              <span style="font-size:10.5px;color:#555;display:block;">Karbohidrat</span>
              <b style="font-size:16px;color:#333;display:block;margin:2px 0;">${targets.carbs} g</b>
              <span style="font-size:10px;color:#777;">Bahan Bakar Seluler</span>
            </div>
            <div style="background:#FAFAF7;border:1px solid #E5E5DC;border-radius:8px;padding:10px;text-align:center;">
              <span style="font-size:10.5px;color:#555;display:block;">Lemak Sehat</span>
              <b style="font-size:16px;color:#333;display:block;margin:2px 0;">${targets.fat} g</b>
              <span style="font-size:10px;color:#777;">Penyerapan Vitamin</span>
            </div>
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
