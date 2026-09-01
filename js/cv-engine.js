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

  // Render Canvas Segmentasi Interaktif
  renderCanvas(canvasElement, width = 300, height = 300, isInteractive = true) {
    if (!canvasElement || !this.currentScan) return;

    canvasElement.width = width;
    canvasElement.height = height;
    const ctx = canvasElement.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const scaleX = width / 150;
    const scaleY = height / 150;
    const cx = width / 2;
    const cy = height / 2;
    const radius = (Math.min(width, height) / 2) - 6;

    // 1. Gambar Piring Dasar
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.currentScan.plateColor || '#4A0E13';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(250, 154, 144, 0.55)';
    ctx.stroke();
    ctx.clip(); // Clip di dalam lingkaran piring

    // 2. Gambar Segmen Poligon Hasil Segmentasi CV
    const segments = this.currentScan.segments || [];
    segments.forEach((seg) => {
      if (!seg.polygon || seg.polygon.length < 3) return;

      const isHovered = (this.activeHoverSegmentId === seg.id);

      ctx.beginPath();
      const firstPt = seg.polygon[0];
      ctx.moveTo(firstPt[0] * scaleX, firstPt[1] * scaleY);

      for (let i = 1; i < seg.polygon.length; i++) {
        const pt = seg.polygon[i];
        ctx.lineTo(pt[0] * scaleX, pt[1] * scaleY);
      }
      ctx.closePath();

      // Warna Mask Transparan dengan highlight saat hover
      ctx.fillStyle = this.hexToRgba(seg.color || '#3FBE93', isHovered ? 0.92 : 0.72);
      ctx.fill();

      ctx.lineWidth = isHovered ? 3 : 1.5;
      ctx.strokeStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';
      ctx.stroke();

      // Titik Pusat & Label Ringkas di dalam Canvas jika ukuran cukup besar
      if (width >= 200) {
        const centerPt = this.getPolygonCenter(seg.polygon);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(seg.name, centerPt[0] * scaleX, centerPt[1] * scaleY);
        ctx.shadowBlur = 0;
      }
    });

    // 3. Lingkaran Fokus Tengah (Computer Vision Lens Core)
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(4, 52, 44, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(63, 190, 147, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#EAF6F1';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CV MASK', cx, cy - 2);
    ctx.fillStyle = '#9FE1CB';
    ctx.font = '8.5px Inter, sans-serif';
    ctx.fillText(`${this.currentScan.confidenceOverall || 85}% Conf`, cx, cy + 10);

    ctx.restore();
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
      color: foodItem.color || '#3FBE93',
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
            color: '#3FBE93',
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
