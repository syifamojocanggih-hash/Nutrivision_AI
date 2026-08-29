// NutriVision AI — Camera Capture & File Upload Handler (WebRTC / Mobile Camera)
// Sesuai FR-01: Menerima foto makanan dari kamera langsung & unggah JPEG/PNG di HP/Desktop

class NutriVisionCamera {
  constructor() {
    this.stream = null;
    this.facingMode = 'environment'; // Gunakan kamera belakang HP jika ada
    this.videoElement = null;
    this.isActive = false;
  }

  // Mulai streaming kamera browser
  async startCamera(videoElement) {
    this.videoElement = videoElement;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('WebRTC getUserMedia tidak didukung di browser ini.');
      return false;
    }

    try {
      if (this.stream) {
        this.stopCamera();
      }

      const constraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
        this.isActive = true;
      }
      return true;
    } catch (err) {
      console.warn('Gagal mengakses kamera langsung (mungkin izin ditolak atau tidak ada hardware kamera):', err);
      this.isActive = false;
      return false;
    }
  }

  // Ganti kamera depan / belakang (khusus smartphone)
  async toggleFacingMode(videoElement) {
    this.facingMode = (this.facingMode === 'environment') ? 'user' : 'environment';
    return await this.startCamera(videoElement);
  }

  // Ambil snapshot gambar dari video kamera
  captureSnapshot() {
    if (!this.videoElement || !this.isActive) return null;

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth || 640;
    canvas.height = this.videoElement.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  // Hentikan streaming kamera
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.isActive = false;
  }

  // Baca file gambar dari input file
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('No file provided');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

const cameraHandler = new NutriVisionCamera();
