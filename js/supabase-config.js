/**
 * ============================================================================
 * NutriVision AI — Supabase Cloud Database Configuration
 * Integrasi PostgreSQL Cloud Storage Real-time & Multi-Device
 * ============================================================================
 */

// ============================================================================
// PENGATURAN KREDENSIAL SUPABASE (Bisa diisi di sini layaknya file .env)
// ============================================================================
const SUPABASE_DEFAULT_URL = ''; // Contoh: 'https://xyzabcdef.supabase.co'
const SUPABASE_DEFAULT_KEY = ''; // Contoh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

window.SUPABASE_CONFIG = {
  // Ambil dari localStorage atau gunakan default di atas
  url: localStorage.getItem('nv_supabase_url') || SUPABASE_DEFAULT_URL,
  anonKey: localStorage.getItem('nv_supabase_key') || SUPABASE_DEFAULT_KEY,

  // Cek apakah konfigurasi sudah terisi
  get isConfigured() {
    return !!(this.url && this.anonKey && this.url.startsWith('http') && this.anonKey.length > 10);
  },

  // Simpan konfigurasi baru dengan sanitasi URL otomatis
  save(url, anonKey) {
    let cleanUrl = (url || '').trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    try {
      if (cleanUrl.startsWith('http')) {
        const u = new URL(cleanUrl);
        cleanUrl = u.origin; // Mengambil base URL murni (menghapus /rest/v1 jika tidak sengaja ter-copy)
      }
    } catch (e) {}

    this.url = cleanUrl;
    this.anonKey = (anonKey || '').trim();
    localStorage.setItem('nv_supabase_url', this.url);
    localStorage.setItem('nv_supabase_key', this.anonKey);
  },

  // Reset konfigurasi
  reset() {
    this.url = '';
    this.anonKey = '';
    localStorage.removeItem('nv_supabase_url');
    localStorage.removeItem('nv_supabase_key');
  }
};

// Pastikan SUPABASE_CONFIG juga tersedia sebagai variabel global biasa
var SUPABASE_CONFIG = window.SUPABASE_CONFIG;
