/**
 * NutriVision AI — Active Learning Feedback Collector & Dataset Exporter
 * 
 * Modul ini menyimpan koreksi manual pengguna secara lokal (IndexedDB)
 * 100% aman untuk Free-Tier Hosting (tanpa membebani storage ephemeral server).
 * 
 * Fitur:
 * 1. Koleksi Otomatis: Menyimpan foto + poligon/bbox + label hasil koreksi pengguna.
 * 2. Correction Memory: Mengingat koreksi untuk foto serupa secara lokal.
 * 3. Export ke ZIP Format YOLO: Menghasilkan folder data.yaml, images/, labels/ yang siap ditraining di Google Colab.
 */

class ActiveLearningCollector {
  constructor() {
    this.dbName = 'NutrivisionActiveLearningDB';
    this.storeName = 'food_corrections';
    this.dbVersion = 1;
    this.db = null;
    this.yoloClasses = [
      "Nasi Merah", "Nasi Putih", "Oatmeal / Havermut", "Ubi Jalar Rebus", "Kentang Kukus / Rebus",
      "Jagung Manis Rebus", "Singkong Rebus", "Roti Gandum Utuh", "Dada Ayam Fillet Rebus / Kukus",
      "Dada Ayam Panggang / Bakar", "Telur Rebus", "Ikan Bakar", "Salmon Panggang", "Ikan Tuna Kukus / Suwir",
      "Sup Daging Sapi Kuah Bening", "Tempe Panggang / Kukus", "Tahu Rebus / Kukus", "Edamame Rebus",
      "Kacang Hijau Rebus", "Sayur Bayam Kuah Bening", "Brokoli Kukus", "Salad Sayur Segar",
      "Gado-gado / Pecel Sayur", "Karedok", "Capcay Kuah", "Tumis Buncis", "Sayur Asem",
      "Sup Wortel dan Kentang Bening", "Buah Pisang", "Alpukat", "Potongan Buah Pepaya",
      "Potongan Buah Apel", "Bakso"
    ];
    this.initDB();
  }

  initDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('[ActiveLearning] IndexedDB tidak didukung browser ini.');
        return resolve(null);
      }
      const request = window.indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.updateBadgeCount();
        resolve(this.db);
      };
      request.onerror = (e) => {
        console.warn('[ActiveLearning] Gagal membuka IndexedDB:', e);
        resolve(null);
      };
    });
  }

  getClassId(foodName) {
    if (!foodName) return 0;
    const clean = foodName.toLowerCase().trim();
    for (let i = 0; i < this.yoloClasses.length; i++) {
      const cls = this.yoloClasses[i].toLowerCase();
      if (clean === cls || clean.includes(cls) || cls.includes(clean)) {
        return i;
      }
    }
    return 1; // default Nasi Putih jika kelas baru
  }

  /**
   * Catat sampel koreksi manual ke dalam database
   */
  async recordCorrection(segment, imageSrc, originalFoodName = null, originalConfidence = null) {
    if (!this.db) await this.initDB();
    if (!this.db) return false;

    try {
      const sample = {
        timestamp: new Date().toISOString(),
        correctedName: segment.name,
        originalGuess: originalFoodName || segment.rawGuess || segment.name,
        originalConfidence: originalConfidence || segment.confidence || 0,
        classId: this.getClassId(segment.name),
        portionGrams: segment.portionGrams || 100,
        polygon_xyn: segment.polygon || [],
        imageData: imageSrc || '' // base64 JPEG
      };

      return new Promise((resolve) => {
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.add(sample);
        tx.oncomplete = () => {
          console.log(`[ActiveLearning] ✅ Sampel koreksi "${segment.name}" berhasil disimpan ke dataset lokal.`);
          this.updateBadgeCount();
          resolve(true);
        };
        tx.onerror = (err) => {
          console.warn('[ActiveLearning] Error menyimpan sampel:', err);
          resolve(false);
        };
      });
    } catch (err) {
      console.warn('[ActiveLearning] Exception recordCorrection:', err);
      return false;
    }
  }

  /**
   * Hitung total sampel koreksi yang tersimpan
   */
  async getSampleCount() {
    if (!this.db) await this.initDB();
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const tx = this.db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => resolve(0);
    });
  }

  /**
   * Update badge jumlah sampel di antarmuka
   */
  async updateBadgeCount() {
    const count = await this.getSampleCount();
    const badges = document.querySelectorAll('.active-learning-sample-count');
    badges.forEach(el => {
      el.textContent = `${count} sampel`;
    });
  }

  /**
   * Hapus semua sampel (misal setelah berhasil di-train di Colab)
   */
  async clearDataset() {
    if (!this.db) await this.initDB();
    if (!this.db) return;

    return new Promise((resolve) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.clear();
      tx.oncomplete = () => {
        this.updateBadgeCount();
        resolve(true);
      };
    });
  }

  /**
   * Ambil semua data sampel
   */
  async getAllSamples() {
    if (!this.db) await this.initDB();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  /**
   * Export dataset ke format ZIP standar YOLOv8 Segmentation
   */
  async exportDatasetZip() {
    const samples = await this.getAllSamples();
    if (samples.length === 0) {
      alert('Belum ada sampel koreksi yang tersimpan. Lakukan scan dan ubah nama bahan terlebih dahulu untuk mengumpulkan data.');
      return;
    }

    if (typeof JSZip === 'undefined') {
      alert('Library JSZip belum termuat. Pastikan koneksi internet aktif.');
      return;
    }

    const zip = new JSZip();
    const datasetFolder = zip.folder('nutrivision_yolo_feedback_dataset');
    const imagesFolder = datasetFolder.folder('images');
    const labelsFolder = datasetFolder.folder('labels');

    // 1. Buat file data.yaml
    const yamlContent = [
      "# NutriVision AI - Feedback Dataset for YOLOv8-Seg Fine-Tuning",
      `path: ./nutrivision_yolo_feedback_dataset`,
      `train: images`,
      `val: images`,
      ``,
      `nc: ${this.yoloClasses.length}`,
      `names: [${this.yoloClasses.map(c => `'${c}'`).join(', ')}]`
    ].join('\n');

    datasetFolder.file('data.yaml', yamlContent);

    // 2. Buat file README petunjuk Colab
    const readmeContent = [
      "# Panduan Fine-Tuning Cepat di Google Colab (Gratis)",
      "",
      "1. Upload file zip ini ke Google Colab / Google Drive Anda.",
      "2. Ekstrak zip:",
      "   !unzip nutrivision_yolo_feedback_dataset.zip",
      "3. Jalankan fine-tuning 15 epoch dengan checkpoint terbaik Anda:",
      "   !yolo train model=best.pt data=nutrivision_yolo_feedback_dataset/data.yaml epochs=15 imgsz=640",
      "4. Download file weights/best.pt yang baru dan ganti best.pt di proyek Anda!",
      ""
    ].join('\n');

    datasetFolder.file('README.md', readmeContent);

    // 3. Masukkan gambar dan anotasi labels/
    samples.forEach((sample, idx) => {
      const fileName = `sample_${idx + 1}`;
      
      // Simpan Gambar (.jpg)
      if (sample.imageData && sample.imageData.includes('base64,')) {
        const base64Data = sample.imageData.split('base64,')[1];
        imagesFolder.file(`${fileName}.jpg`, base64Data, { base64: true });
      }

      // Simpan Label YOLO (.txt)
      // Format YOLOv8 Segmentation: <class_id> x1 y1 x2 y2 x3 y3 ...
      let labelLine = '';
      if (sample.polygon_xyn && sample.polygon_xyn.length >= 3) {
        const polyCoords = sample.polygon_xyn.map(pt => `${pt[0].toFixed(5)} ${pt[1].toFixed(5)}`).join(' ');
        labelLine = `${sample.classId} ${polyCoords}`;
      } else {
        // Fallback default center box jika tidak ada poligon
        labelLine = `${sample.classId} 0.50000 0.50000 0.50000 0.50000`;
      }
      labelsFolder.file(`${fileName}.txt`, labelLine);
    });

    // 4. Download file ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nutrivision_yolo_feedback_dataset_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.app && window.app.showToast) {
      window.app.showToast(`📦 Berhasil mengunduh dataset (${samples.length} sampel) untuk training Colab!`, 'success');
    }
  }
}

// Inisialisasi global
window.activeLearningCollector = new ActiveLearningCollector();
