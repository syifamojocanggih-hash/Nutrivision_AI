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

  // Render Piring Kosong saat belum ada makanan di-scan
  renderEmptyPlate(canvasElement, width = 300, height = 300) {
    if (!canvasElement) return;
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

    // 1. Gambar Bingkai Piring Bulat Keramik Luar (Ceramic Plate Depth)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#263016';
    ctx.fill();
    ctx.lineWidth = rimWidth;
    ctx.strokeStyle = 'rgba(158, 167, 107, 0.5)';
    ctx.stroke();

    // 2. Lingkaran Dasar Piring (Plate Basin dengan Radial Gradient)
    let basinGrad = '#1E2512';
    if (typeof ctx.createRadialGradient === 'function') {
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, plateRadius);
      grad.addColorStop(0, 'rgba(158, 167, 107, 0.12)');
      grad.addColorStop(0.7, '#1E2512');
      grad.addColorStop(1, '#151A0C');
      basinGrad = grad;
    }

    // 2. Lingkaran Dasar Piring
    ctx.beginPath();
    ctx.arc(cx, cy, plateRadius, 0, Math.PI * 2);
    ctx.fillStyle = basinGrad;
    ctx.fill();

    // Gambar Foto Nyata jika tersedia meskipun tidak terdeteksi makanan
    if (this.currentScan && this.currentScan.imageUrl) {
      if (!this._imgCache) this._imgCache = {};
      let img = this._imgCache[this.currentScan.imageUrl];
      if (!img) {
        img = new Image();
        img.src = this.currentScan.imageUrl;
        img.onload = () => {
          this.renderEmptyPlate(canvasElement, width, height);
        };
        this._imgCache[this.currentScan.imageUrl] = img;
      }
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, plateRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - plateRadius, cy - plateRadius, plateRadius * 2, plateRadius * 2);
        // Tambahkan overlay gelap agar teks tetap terbaca
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fill();
        ctx.restore();
      }
    }

    // 3. Garis Panduan Melingkar Putus-putus (Dashed Guide Circle)
    ctx.beginPath();
    ctx.arc(cx, cy, plateRadius * 0.72, 0, Math.PI * 2);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(158, 167, 107, 0.42)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Ring Ikon Kamera Bercahaya (Camera-Add Pulsing Ring)
    const ringRadius = Math.max(16, Math.round(minDim * 0.13));
    const iconCenterY = cy - Math.round(minDim * 0.12);

    ctx.save();
    ctx.shadowColor = 'rgba(158, 167, 107, 0.35)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, iconCenterY, ringRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(158, 167, 107, 0.16)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(158, 167, 107, 0.45)';
    ctx.stroke();
    ctx.restore();

    // Gambar Ikon Kamera + Plus Vektor di Dalam Ring
    const camW = ringRadius * 1.05;
    const camH = ringRadius * 0.75;
    const camX = cx - (camW / 2);
    const camY = iconCenterY - (camH / 2) + 1;

    ctx.save();
    ctx.fillStyle = '#9EA76B';
    // Badan kamera
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(camX, camY, camW, camH, 3) : ctx.rect(camX, camY, camW, camH);
    ctx.fill();

    // Lensa kamera
    ctx.beginPath();
    ctx.arc(cx, iconCenterY + 1, camH * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#1E2512';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#9EA76B';
    ctx.stroke();

    // Tanda Plus (+) di dalam lensa kamera
    const plusSize = camH * 0.18;
    ctx.beginPath();
    ctx.moveTo(cx - plusSize, iconCenterY + 1);
    ctx.lineTo(cx + plusSize, iconCenterY + 1);
    ctx.moveTo(cx, iconCenterY + 1 - plusSize);
    ctx.lineTo(cx, iconCenterY + 1 + plusSize);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#DDE2B9';
    ctx.stroke();
    ctx.restore();

    // 5. Teks: "Piring Belum Terisi" & "Belum ada makanan terdeteksi"
    const isId = (window.i18n ? window.i18n.getLanguage() : 'en') === 'id';
    const hasImage = this.currentScan && this.currentScan.imageUrl;
    const textTitle = isId 
        ? (hasImage ? 'Tidak Ada Makanan' : 'Piring Belum Terisi') 
        : (hasImage ? 'No Food Found' : 'Empty Plate');
    const textSub = isId 
        ? (hasImage ? 'AI gagal mendeteksi objek' : 'Belum ada makanan terdeteksi') 
        : (hasImage ? 'AI failed to detect objects' : 'No food detected yet');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `bold ${Math.max(10, Math.round(minDim * 0.07))}px Plus Jakarta Sans, system-ui, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(textTitle, cx, cy + Math.round(minDim * 0.12));

    ctx.font = `500 ${Math.max(8.5, Math.round(minDim * 0.054))}px Plus Jakarta Sans, system-ui, sans-serif`;
    ctx.fillStyle = '#DDE2B9';
    ctx.fillText(textSub, cx, cy + Math.round(minDim * 0.22));

    ctx.restore();
  }

  // Render Canvas Segmentasi Interaktif (Model Piring Bulat Penuh / Pizza Slices)
  renderCanvas(canvasElement, width = 300, height = 300, isInteractive = true) {
    if (!canvasElement) return;
    if (!this.currentScan || !this.currentScan.segments || this.currentScan.segments.length === 0) {
      this.renderEmptyPlate(canvasElement, width, height);
      return;
    }

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

    // 3. Gambar Poligon Segmentasi AI
    const segments = this.currentScan.segments || [];
    if (segments.length === 0) return;

    // Radius pembatas untuk memotong poligon agar tidak keluar piring (opsional)
    const renderW = plateRadius * 2;
    const renderH = plateRadius * 2;
    const offsetX = cx - plateRadius;
    const offsetY = cy - plateRadius;

    segments.forEach((seg, index) => {
      const isHovered = (this.activeHoverSegmentId === seg.id);
      const baseColor = seg.color || '#9EA76B';
      const fillOverlay = this.hexToRgba(baseColor, isHovered ? 0.6 : 0.4);
      const strokeColor = isHovered ? '#FFFFFF' : baseColor;

      const poly = seg.polygon || this.generateFallbackPolygon(index);
      if (!poly || poly.length === 0) return;

      ctx.save();
      // Clip agar poligon tidak tumpah keluar dari piring keramik
      ctx.beginPath();
      ctx.arc(cx, cy, plateRadius, 0, Math.PI * 2);
      ctx.clip();

      ctx.beginPath();
      poly.forEach((pt, i) => {
        let mappedX, mappedY;
        // Jika koordinat dalam format xyn (Normalized 0.0 - 1.0) dari YOLO
        if (pt[0] <= 1.0 && pt[1] <= 1.0) {
            mappedX = offsetX + (pt[0] * renderW);
            mappedY = offsetY + (pt[1] * renderH);
        } else {
            // Skema fallback relatif 0-150
            mappedX = offsetX + (pt[0] / 150) * renderW;
            mappedY = offsetY + (pt[1] / 150) * renderH;
        }

        if (i === 0) ctx.moveTo(mappedX, mappedY);
        else ctx.lineTo(mappedX, mappedY);
      });
      ctx.closePath();

      ctx.fillStyle = fillOverlay;
      ctx.fill();
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();

      // Hitung Titik Pusat untuk Label Gramasi
      let centerX, centerY;
      if (poly[0][0] <= 1.0) {
          const sumX = poly.reduce((sum, p) => sum + p[0], 0);
          const sumY = poly.reduce((sum, p) => sum + p[1], 0);
          centerX = offsetX + ((sumX / poly.length) * renderW);
          centerY = offsetY + ((sumY / poly.length) * renderH);
      } else {
          const center = this.getPolygonCenter(poly);
          centerX = offsetX + (center[0] / 150) * renderW;
          centerY = offsetY + (center[1] / 150) * renderH;
      }

      // Gambar Label
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      const textW = ctx.measureText(seg.portionGrams + 'g').width;
      const boxW = Math.max(30, textW + 10);
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(centerX - boxW/2, centerY - 10, boxW, 20, 4) : ctx.rect(centerX - boxW/2, centerY - 10, boxW, 20);
      ctx.fill();

      ctx.font = '700 11px "Inter", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.portionGrams + 'g', centerX, centerY);

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

    // 5. Pasang Event Listener Interaksi Mouse/Touch Hover & Click pada Canvas
    if (isInteractive && !canvasElement._pizzaInteractivityBound) {
      canvasElement._pizzaInteractivityBound = true;

      const getTargetSegment = (mx, my) => {
          let targetSeg = null;
          const renderW = plateRadius * 2;
          const renderH = plateRadius * 2;
          const offX = cx - plateRadius;
          const offY = cy - plateRadius;

          // Check intersection from top to bottom (last rendered is on top, but we render in order so whatever)
          for (let i = segments.length - 1; i >= 0; i--) {
              const seg = segments[i];
              const poly = seg.polygon || this.generateFallbackPolygon(i);
              if (!poly || poly.length === 0) continue;

              // Recreate path for hit testing
              ctx.beginPath();
              poly.forEach((pt, j) => {
                  let mappedX, mappedY;
                  if (pt[0] <= 1.0 && pt[1] <= 1.0) {
                      mappedX = offX + (pt[0] * renderW);
                      mappedY = offY + (pt[1] * renderH);
                  } else {
                      mappedX = offX + (pt[0] / 150) * renderW;
                      mappedY = offY + (pt[1] / 150) * renderH;
                  }
                  if (j === 0) ctx.moveTo(mappedX, mappedY);
                  else ctx.lineTo(mappedX, mappedY);
              });
              ctx.closePath();

              if (ctx.isPointInPath(mx, my)) {
                  targetSeg = seg;
                  break;
              }
          }
          return targetSeg;
      };

      const handlePointer = (e) => {
        const rect = canvasElement.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        const mx = clientX - rect.left;
        const my = clientY - rect.top;

        const targetSeg = getTargetSegment(mx, my);

        if (targetSeg) {
          if (this.activeHoverSegmentId !== targetSeg.id) {
            this.activeHoverSegmentId = targetSeg.id;
            canvasElement.style.cursor = 'pointer';
            this.renderCanvas(canvasElement, width, height, false);
            if (window.app && typeof window.app.renderOverviewPlateLegendHover === 'function') {
              window.app.renderOverviewPlateLegendHover(targetSeg.id);
            }
          }
        } else {
          if (this.activeHoverSegmentId) {
            this.activeHoverSegmentId = null;
            canvasElement.style.cursor = 'default';
            this.renderCanvas(canvasElement, width, height, false);
            if (window.app && typeof window.app.renderOverviewPlateLegendHover === 'function') {
              window.app.renderOverviewPlateLegendHover(null);
            }
          }
        }
      };

      const handleClick = (e) => {
        const rect = canvasElement.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const targetSeg = getTargetSegment(mx, my);

        if (targetSeg) {
            // Jika diklik, gulir ke bawah dan fokus pada item edit
            if (window.app && window.app.showToast) {
               window.app.showToast(`Memilih ${targetSeg.name}... Silakan ubah dari katalog di bawah.`);
            }
            const editList = document.getElementById('modal-segment-edit-list');
            if (editList) {
               editList.scrollIntoView({ behavior: 'smooth', block: 'center' });
               // Tambahkan highlight efek sebentar
               const items = editList.querySelectorAll('.segment-edit-item');
               items.forEach(el => {
                   if (el.innerHTML.includes(targetSeg.name)) {
                       el.style.transition = 'background 0.3s';
                       el.style.background = 'rgba(217, 119, 6, 0.15)'; // highlight orange muda
                       setTimeout(() => el.style.background = '', 1500);
                   }
               });
            }
        }
      };

      canvasElement.addEventListener('mousemove', handlePointer);
      canvasElement.addEventListener('click', handleClick);
      canvasElement.addEventListener('mouseleave', () => {
        if (this.activeHoverSegmentId) {
          this.activeHoverSegmentId = null;
          canvasElement.style.cursor = 'default';
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
      polygon: foodItem.polygon_xyn || foodItem.polygon || this.generateFallbackPolygon(this.currentScan.segments.length)
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
  async processCustomImageScan(imageSrc, callback) {
    try {
      // 1. Ambil input plate diameter dari UI
      const plateSelect = document.getElementById('plate-diameter-select');
      const plateDiameterCm = plateSelect ? parseFloat(plateSelect.value) : 22;

      // 2. Konversi imageSrc (base64) menjadi Blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'scan.jpg');

      // 3. Panggil API YOLO Vision (Bisa dikonfigurasi lewat window.VISION_API_URL)
      if (window.app) app.showToast('Menganalisis citra dengan YOLO Vision...');
      const visionApiUrl = (window.VISION_API_URL || 'http://localhost:8000') + '/predict-pixels';
      const yoloRes = await fetch(visionApiUrl, {
        method: 'POST',
        body: formData
      });

      if (!yoloRes.ok) throw new Error('Gagal menghubungi Vision Service YOLO');
      const detectedFoods = await yoloRes.json();

      if (!detectedFoods || detectedFoods.length === 0) {
         throw new Error('Tidak ada makanan yang terdeteksi di piring.');
      }

      // 4. Panggil API Portioning (Port otomatis sama dengan frontend)
      if (window.app) app.showToast('Menghitung estimasi nutrisi...');
      const portionRes = await fetch('/api/portioning/calculate-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           plate_type: 'custom',
           plate_diameter_cm: plateDiameterCm,
           detected_foods: detectedFoods
        })
      });

      if (!portionRes.ok) throw new Error('Gagal menghitung nutrisi porsi');
      const portionData = await portionRes.json();

      if (!portionData.success) {
         throw new Error(portionData.message || 'Gagal menghitung nutrisi porsi');
      }

      // 5. Mapping data backend ke format UI (segments)
      const segments = portionData.foods.map((food, index) => {
         const hasNutrition = food.nutrition && !food.error;
         const estimated_grams = food.estimated_grams || 100;
         const cals = hasNutrition ? food.nutrition.calories : (estimated_grams * 1.5);
         const protein = hasNutrition ? food.nutrition.protein : (estimated_grams * 0.1);
         const fat = hasNutrition ? food.nutrition.fat : (estimated_grams * 0.05);
         const displayName = food.food_name + (food.error ? ' (Estimasi)' : '');

         return {
            id: 'seg-custom-' + Date.now() + '-' + index,
            name: displayName,
            foodId: food.food_name.toLowerCase().replace(/\s+/g, '-'),
            portionGrams: Math.round(estimated_grams),
            confidence: Math.round((food.confidence || 0.90) * 100), // convert 0.9 to 90
            color: '#4ade80', // default green color
            cals: [Math.round(cals), Math.round(cals * 1.1)],
            protein: [Math.round(protein), Math.round(protein * 1.1)],
            carbs: [0, 5], // Optional field in UI
            fat: [Math.round(fat), Math.round(fat * 1.1)],
            polygon: food.polygon_xyn && food.polygon_xyn.length > 0 
                ? food.polygon_xyn 
                : [[25, 25 + index * 5], [75, 20 + index * 5], [75, 75 + index * 5], [20, 75 + index * 5]]
         };
      });

      const finalScan = {
         id: 'custom-scan-' + Date.now(),
         title: '📸 Hasil Scan Makanan AI (Fixed Ref)',
         plateColor: '#052A22',
         confidenceOverall: 90,
         imageUrl: imageSrc,
         segments: segments
      };

      this.loadScanData(finalScan);
      if (window.app) app.showToast('Analisis selesai!');
      if (callback) callback(finalScan);

    } catch (error) {
      console.error('Scan error:', error);
      if (window.app) app.showToast('Error: ' + error.message);
      
      // Fallback UI rendering so it doesn't get stuck loading
      const fallbackScan = {
         id: 'error-scan',
         title: 'Peringatan: Gagal Menganalisis',
         confidenceOverall: 0,
         imageUrl: imageSrc,
         segments: []
      };
      this.loadScanData(fallbackScan);
      if (callback) callback(fallbackScan);
    }
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
