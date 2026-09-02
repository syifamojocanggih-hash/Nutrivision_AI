/**
 * ============================================================================
 * NutriVision AI — Supabase Cloud Database Configuration
 * Integrasi PostgreSQL Cloud Storage Real-time & Multi-Device
 * ============================================================================
 */

const SUPABASE_CONFIG = {
  // Masukkan Supabase Project URL & Anon Key di bawah, atau konfigurasi lewat UI Aplikasi
  url: localStorage.getItem('nv_supabase_url') || '',
  anonKey: localStorage.getItem('nv_supabase_key') || '',

  // Cek apakah konfigurasi sudah terisi
  get isConfigured() {
    return !!(this.url && this.anonKey && this.url.startsWith('http') && this.anonKey.length > 10);
  },

  // Simpan konfigurasi baru
  save(url, anonKey) {
    this.url = (url || '').trim();
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
