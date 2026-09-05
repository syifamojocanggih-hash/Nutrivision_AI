// NutriVision AI — Interactive Computer Vision Segmentation Engine (Canvas Overlay & Range Estimator)
// Sesuai FR-02, FR-03, FR-07: Peta visual segmentasi per bahan, estimasi rentang gizi, koreksi manual

class NutriVisionCVEngine {
  constructor() {
    this.currentScan = null;
    this.activeHoverSegmentId = null;
  }

  // Muat preset atau hasil deteksi gambar baru
  loadScanData(presetOrCustomData) {
    // Deep clone data agar modifikasi manual tidak merusak preset asli
    this.currentScan = JSON.parse(JSON.stringify(presetOrCustomData));
    return this.currentScan;
  }

  // Hitung total rentang gizi piring saat ini
  calculateAggregatedNutrients() {
    if (!this.currentScan || !this.currentScan.segments) {
      return {
        cals: [0, 0],
        protein: [0, 0],
        carbs: [0, 0],
        fat: [0, 0],
        totalGrams: 0
      };
    }

    let minCals = 0, maxCals = 0;
    let minProt = 0, maxProt = 0;
    let minCarbs = 0, maxCarbs = 0;
    let minFat = 0, maxFat = 0;
    let totalWeight = 0;

    this.currentScan.segments.forEach(seg => {
      minCals += seg.cals[0];
      maxCals += seg.cals[1];
      minProt += seg.protein[0];
      maxProt += seg.protein[1];
      minCarbs += seg.carbs[0];
      maxCarbs += seg.carbs[1];
      minFat += seg.fat[0];
      maxFat += seg.fat[1];
      totalWeight += (seg.portionGrams || 0);
    });

    return {
      cals: [Math.round(minCals), Math.round(maxCals)],
      protein: [Math.round(minProt * 10) / 10, Math.round(maxProt * 10) / 10],
      carbs: [Math.round(minCarbs * 10) / 10, Math.round(maxCarbs * 10) / 10],
      fat: [Math.round(minFat * 10) / 10, Math.round(maxFat * 10) / 10],
      totalGrams: totalWeight
    };
  }

  // Render Canvas Segmentasi Interaktif (Model Piring Bulat Penuh / Pizza Slices)
  renderCanvas(canvasElement, width = 300, height = 300, isInteractive = true) {
    if (!canvasElement || !this.currentScan) return;

    // Retina / HiDPI sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvasElement.width = width * dpr;
    canvasElement.height = height * dpr;
    canvasElement.style.width = width + 'px';
    canvasElement.style.height = height + 'px';

    const ctx = canvasElement.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const minDim = Math.min(width, height);
    const outerRadius = (minDim / 2) - 3;
    const rimWidth = Math.max(3, Math.round(minDim * 0.035));
    const plateRadius = outerRadius - rimWidth;
    const centerRadius = plateRadius * 0.28;

    // 1. Gambar Bingkai Piring Bulat Keramik Luar
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#17220F';
    ctx.fill();
    ctx.lineWidth = rimWidth;
    ctx.strokeStyle = 'rgba(158, 167, 107, 0.45)';
    ctx.stroke();

    // 2. Lingkaran Dasar Piring (Piring Bulat Penuh)
    ctx.beginPath();
    ctx.arc(cx, cy, plateRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.currentScan.plateColor || '#12180B';
    ctx.fill();

    // Gambar Foto Makanan Nyata jika tersedia
    if (this.currentScan.imageUrl) {
      if (!this._imgCache) this._imgCache = {};
      let img = this._imgCache[this.currentScan.imageUrl];
      if (!img) {
        img = new Image();
        img.src = this.currentScan.imageUrl;
        img.onload = () => {
          this.renderCanvas(canvasElement, width, height, isInteractive);
        };
        this._imgCache[this.currentScan.imageUrl] = img;
      }
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, plateRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - plateRadius, cy - plateRadius, plateRadius * 2, plateRadius * 2);
        ctx.restore();
      }
    }
    ctx.restore();

    // 3. Gambar Potongan Piring Sesuai Persentase Gizi (Model Pizza / Pie Penuh)
    const segments = this.currentScan.segments || [];
    if (segments.length === 0) return;

    const totalGrams = segments.reduce((sum, s) => sum + (s.portionGrams || 100), 0) || 1;

    // Mulai dari arah jam 12 (-90 derajat)
    let currentAngle = -Math.PI / 2;
    const sliceData = [];

    segments.forEach((seg) => {
      const portionGrams = seg.portionGrams || 100;
      const pct = portionGrams / totalGrams;
      const sliceAngle = pct * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      const midAngle = startAngle + (sliceAngle / 2);
      const isHovered = (this.activeHoverSegmentId === seg.id);

      sliceData.push({
        seg,
        pct,
        startAngle,
        endAngle,
        midAngle,
        isHovered
      });

      currentAngle = endAngle;
    });

    // Gambar masing-masing potongan pizza
    sliceData.forEach((slice) => {
      const { seg, pct, startAngle, endAngle, midAngle, isHovered } = slice;

      ctx.save();

      // Efek sedikit mekar/terangkat keluar saat hover (Pop-out slice)
      const explodeOffset = isHovered ? Math.max(4, plateRadius * 0.055) : 0;
      const ox = Math.cos(midAngle) * explodeOffset;
      const oy = Math.sin(midAngle) * explodeOffset;

      ctx.translate(ox, oy);

      // Gambar juring pizza penuh dari pusat ke tepi piring
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, plateRadius - 1, startAngle, endAngle);
      ctx.closePath();

      // Warna juring pizza (transparan jika ada foto asli di belakangnya)
      const baseColor = seg.color || '#9EA76B';
      const sliceAlpha = this.currentScan.imageUrl ? (isHovered ? 0.65 : 0.40) : (isHovered ? 0.96 : 0.82);
      ctx.fillStyle = this.hexToRgba(baseColor, sliceAlpha);
      ctx.fill();

      // Garis potong pizza (crisp slice divider)
      ctx.lineWidth = isHovered ? 3.5 : 2;
      ctx.strokeStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)';
      ctx.stroke();

      // Label Persentase Porsi di Setiap Irisan Pizza
      if (pct >= 0.05) {
        const labelDist = centerRadius + (plateRadius - centerRadius) * 0.55;
        const lx = cx + Math.cos(midAngle) * labelDist;
        const ly = cy + Math.sin(midAngle) * labelDist;

        const pctText = `${Math.round(pct * 100)}%`;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(10, Math.round(plateRadius * 0.16))}px Plus Jakarta Sans, Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pctText, lx, ly);

        // Jika kanvas berukuran cukup besar dan irisan cukup lebar, tampilkan nama/gram
        if (width >= 210 && pct >= 0.14) {
          ctx.font = `600 ${Math.max(9, Math.round(plateRadius * 0.10))}px Plus Jakarta Sans, Inter, sans-serif`;
          ctx.fillStyle = '#F3F4F6';
          ctx.fillText(`${seg.portionGrams}g`, lx, ly + 13);
        }

        ctx.shadowBlur = 0;
      }

      ctx.restore();
    });

    // 4. Lingkaran Inti Pusat (Center Hub / AI Confidence Lens)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 28, 13, 0.96)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Lingkaran aksen tipis di dalam hub
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, centerRadius - 3), 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 253, 208, 0.5)';
    ctx.stroke();

    // Teks persentase AI Match di tengah hub
    const confVal = this.currentScan.confidenceOverall || 88;
    const fontPrimary = Math.max(9, Math.round(centerRadius * 0.44));
    const fontSub = Math.max(7, Math.round(centerRadius * 0.28));

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${fontPrimary}px Plus Jakarta Sans, Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${confVal}%`, cx, cy - (centerRadius * 0.22));

    ctx.fillStyle = '#FFFDD0';
    ctx.font = `bold ${fontSub}px Plus Jakarta Sans, Inter, sans-serif`;
    ctx.fillText('AI MATCH', cx, cy + (centerRadius * 0.35));

    ctx.restore();

    // 5. Pasang Event Listener Interaksi Mouse/Touch Hover pada Canvas
    if (isInteractive && !canvasElement._pizzaInteractivityBound) {
      canvasElement._pizzaInteractivityBound = true;

      const handlePointer = (e) => {
        const rect = canvasElement.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        const mx = clientX - rect.left;
        const my = clientY - rect.top;

        const dx = mx - (width / 2);
        const dy = my - (height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist >= centerRadius && dist <= plateRadius) {
          let angle = Math.atan2(dy, dx);
          // Normalisasi ke [0, 2PI] dimulai dari -PI/2 (jam 12)
          let normAngle = angle - (-Math.PI / 2);
          if (normAngle < 0) normAngle += Math.PI * 2;

          let targetSeg = null;
          let cumulativeAngle = 0;

          for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const pct = (seg.portionGrams || 100) / totalGrams;
            const sliceAngle = pct * Math.PI * 2;
            if (normAngle >= cumulativeAngle && normAngle <= cumulativeAngle + sliceAngle) {
              targetSeg = seg;
              break;
            }
            cumulativeAngle += sliceAngle;
          }

          if (targetSeg && this.activeHoverSegmentId !== targetSeg.id) {
            this.activeHoverSegmentId = targetSeg.id;
            this.renderCanvas(canvasElement, width, height, false);
            if (window.app && typeof window.app.renderOverviewPlateLegendHover === 'function') {
              window.app.renderOverviewPlateLegendHover(targetSeg.id);
            }
          }
        } else {
          if (this.activeHoverSegmentId) {
            this.activeHoverSegmentId = null;
            this.renderCanvas(canvasElement, width, height, false);
            if (window.app && typeof window.app.renderOverviewPlateLegendHover === 'function') {
              window.app.renderOverviewPlateLegendHover(null);
            }
          }
        }
      };

      canvasElement.addEventListener('mousemove', handlePointer);
      canvasElement.addEventListener('mouseleave', () => {
        if (this.activeHoverSegmentId) {
          this.activeHoverSegmentId = null;
          this.renderCanvas(canvasElement, width, height, false);
          if (window.app && typeof window.app.renderOverviewPlateLegendHover === 'function') {
            window.app.renderOverviewPlateLegendHover(null);
          }
        }
      });
    }
  }

  // Koreksi Manual: Tambah Bahan Baru
  addSegment(foodItem, portionGrams = 100) {
    if (!this.currentScan) return;
    const ratio = portionGrams / (foodItem.defaultPortionGrams || 100);

    const newSegment = {
      id: 'seg-' + Date.now(),
      name: foodItem.name,
      foodId: foodItem.id,
      portionGrams: portionGrams,
      confidence: 100, // Manual input user memiliki keyakinan 100%
      color: foodItem.color || '#9EA76B',
      cals: [Math.round(foodItem.calsRange[0] * ratio), Math.round(foodItem.calsRange[1] * ratio)],
      protein: [Math.round(foodItem.proteinRange[0] * ratio * 10) / 10, Math.round(foodItem.proteinRange[1] * ratio * 10) / 10],
      carbs: [Math.round(foodItem.carbsRange[0] * ratio * 10) / 10, Math.round(foodItem.carbsRange[1] * ratio * 10) / 10],
      fat: [Math.round(foodItem.fatRange[0] * ratio * 10) / 10, Math.round(foodItem.fatRange[1] * ratio * 10) / 10],
      polygon: this.generateFallbackPolygon(this.currentScan.segments.length)
    };

    this.currentScan.segments.push(newSegment);
    return newSegment;
  }

  // Koreksi Manual: Hapus Segmen
  removeSegment(segmentId) {
    if (!this.currentScan || !this.currentScan.segments) return;
    this.currentScan.segments = this.currentScan.segments.filter(s => s.id !== segmentId);
  }

  // Koreksi Manual: Ubah Porsi Gram
  updateSegmentPortion(segmentId, newGrams) {
    if (!this.currentScan || !this.currentScan.segments) return;
    const seg = this.currentScan.segments.find(s => s.id === segmentId);
    if (!seg) return;

    const oldGrams = seg.portionGrams || 100;
    const multiplier = newGrams / (oldGrams || 1);
    seg.portionGrams = newGrams;
    seg.cals = [Math.round(seg.cals[0] * multiplier), Math.round(seg.cals[1] * multiplier)];
    seg.protein = [Math.round(seg.protein[0] * multiplier * 10) / 10, Math.round(seg.protein[1] * multiplier * 10) / 10];
    seg.carbs = [Math.round(seg.carbs[0] * multiplier * 10) / 10, Math.round(seg.carbs[1] * multiplier * 10) / 10];
    seg.fat = [Math.round(seg.fat[0] * multiplier * 10) / 10, Math.round(seg.fat[1] * multiplier * 10) / 10];
  }

  // Simulasi segmentasi dari unggahan foto kustom
  processCustomImageScan(imageSrc, callback) {
    // Mensimulasikan pemrosesan deep learning (2.5 detik)
    setTimeout(() => {
      // Menghasilkan segmentasi otomatis berbasis citra piring standar
      const simulatedScan = {
        id: 'custom-scan-' + Date.now(),
        title: '📸 Hasil Foto Kamera / Unggahan Baru',
        plateColor: '#052A22',
        confidenceOverall: 84,
        imageSrc: imageSrc,
        segments: [
          {
            id: 'seg-custom-1',
            name: 'Nasi Putih',
            foodId: 'nasi-putih',
            portionGrams: 160,
            confidence: 92,
            color: '#9EA76B',
            cals: [200, 230],
            protein: [3.8, 4.6],
            carbs: [44, 50],
            fat: [0.4, 0.7],
            polygon: [[25, 25], [75, 20], [75, 75], [20, 75]]
          },
          {
            id: 'seg-custom-2',
            name: 'Dada Ayam Suwir / Kukus',
            foodId: 'ayam-suwir-kukus',
            portionGrams: 110,
            confidence: 88,
            color: '#D85A30',
            cals: [160, 190],
            protein: [26, 30],
            carbs: [0, 1.0],
            fat: [3.2, 4.8],
            polygon: [[75, 20], [130, 30], [130, 85], [75, 75]]
          },
          {
            id: 'seg-custom-3',
            name: 'Sayur Bening Bayam',
            foodId: 'sup-bayam-jagung',
            portionGrams: 90,
            confidence: 80,
            color: '#EF9F27',
            cals: [28, 38],
            protein: [1.6, 2.4],
            carbs: [4.5, 6.5],
            fat: [0.2, 0.4],
            polygon: [[75, 75], [130, 85], [120, 135], [60, 135]]
          },
          {
            id: 'seg-custom-4',
            name: 'Bahan Belum Teridentifikasi (Saus/Pelengkap)',
            foodId: null,
            portionGrams: 40,
            confidence: 54, // Rendah, menandakan perlu koreksi manual sesuai FR-07
            color: '#FAEEDA',
            unrecognized: true,
            cals: [40, 70],
            protein: [1.0, 2.5],
            carbs: [4.0, 8.0],
            fat: [2.0, 4.0],
            polygon: [[20, 75], [75, 75], [60, 135], [20, 120]]
          }
        ]
      };

      this.loadScanData(simulatedScan);
      if (callback) callback(simulatedScan);
    }, 1800);
  }

  // Utilities
  hexToRgba(hex, alpha) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16) || 63;
    const g = parseInt(c.substring(2, 4), 16) || 190;
    const b = parseInt(c.substring(4, 6), 16) || 147;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getPolygonCenter(polygon) {
    let xSum = 0, ySum = 0;
    polygon.forEach(p => { xSum += p[0]; ySum += p[1]; });
    return [xSum / polygon.length, ySum / polygon.length];
  }

  generateFallbackPolygon(index) {
    const quadrants = [
      [[20, 20], [70, 20], [70, 70], [20, 70]],
      [[80, 20], [130, 20], [130, 70], [80, 70]],
      [[20, 80], [70, 80], [70, 130], [20, 130]],
      [[80, 80], [130, 80], [130, 130], [80, 130]]
    ];
    return quadrants[index % 4];
  }
}

const cvEngine = new NutriVisionCVEngine();
