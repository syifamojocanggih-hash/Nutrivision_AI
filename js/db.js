/**
 * ============================================================================
 * NutriVision AI — Hybrid Database Engine (IndexedDB + Supabase Cloud)
 * Local-First Offline Storage with Real-Time Cloud PostgreSQL Sync
 * ============================================================================
 */

class NutriVisionDatabase {
  constructor() {
    this.dbName = 'NutriVisionAIDB';
    this.dbVersion = 2;
    this.db = null;
    this.sessionKey = 'nutrivision_active_session';
    this.isReady = false;
    this.supabase = null;
    this.isSupabaseConnected = false;
  }

  /**
   * Initialize IndexedDB & Supabase Cloud Connection
   */
  async init() {
    // 1. Inisialisasi Supabase Client jika terkonfigurasi
    this.initSupabaseClient();

    // 2. Inisialisasi IndexedDB Lokal
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB tidak didukung pada peramban ini. Menggunakan LocalStorage fallback.');
        this.useFallback = true;
        this.initLocalStorageFallback();
        this.isReady = true;
        resolve(this);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Users Store (Authentication & Profile)
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('role', 'role', { unique: false });
        }

        // 2. Meals & Scan History Store
        if (!db.objectStoreNames.contains('meals')) {
          const mealStore = db.createObjectStore('meals', { keyPath: 'id' });
          mealStore.createIndex('userId', 'userId', { unique: false });
          mealStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 3. Clinical Progress Records
        if (!db.objectStoreNames.contains('clinical_records')) {
          const recordStore = db.createObjectStore('clinical_records', { keyPath: 'id' });
          recordStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        this.isReady = true;
        await this.seedInitialAccounts();
        console.log('✅ NutriVision AI Database Engine siap (IndexedDB Connected)');
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('IndexedDB Error:', event.target.error);
        this.useFallback = true;
        this.initLocalStorageFallback();
        this.isReady = true;
        resolve(this);
      };
    });
  }

  /**
   * Inisialisasi Supabase JS Client
   */
  initSupabaseClient() {
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function' && window.SUPABASE_CONFIG?.isConfigured) {
        this.supabase = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
        this.isSupabaseConnected = true;
        console.log('☁️ Supabase Cloud Client Connected:', window.SUPABASE_CONFIG.url);
      } else {
        this.supabase = null;
        this.isSupabaseConnected = false;
      }
    } catch (e) {
      console.warn('Supabase init notice:', e.message);
      this.supabase = null;
      this.isSupabaseConnected = false;
    }
  }

  /**
   * Test Koneksi ke Supabase Cloud
   */
  async testSupabaseConnection(customUrl, customKey) {
    const url = customUrl || window.SUPABASE_CONFIG?.url;
    const key = customKey || window.SUPABASE_CONFIG?.anonKey;

    if (!url || !key) {
      return { success: false, message: 'URL atau Anon Key Supabase belum diisi.' };
    }

    try {
      if (!window.supabase) {
        return { success: false, message: 'Library Supabase JS belum termuat di browser.' };
      }

      const client = window.supabase.createClient(url, key);
      const { data, error } = await client.from('users').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        // Jika tabel belum ada atau permission issue
        return {
          success: false,
          error: error,
          message: `Terhubung ke Supabase, namun ada kendala query tabel 'users': ${error.message}. Pastikan SQL schema sudah dijalankan.`
        };
      }

      return {
        success: true,
        message: '✅ Berhasil terhubung ke Supabase Cloud Database!'
      };
    } catch (err) {
      return {
        success: false,
        message: 'Gagal terhubung: ' + err.message
      };
    }
  }

  /**
   * Seed pre-configured accounts for instant testing by judges / users
   */
  async seedInitialAccounts() {
    const seedUsers = [
      {
        id: 'usr_demo_surgery',
        name: 'Rangga Pratama',
        email: 'pasien@nutrivision.id',
        passwordHash: this.hashPassword('pasien123'),
        role: 'patient',
        condition: 'post-surgery',
        conditionLabel: 'Pasca-Operasi Usus Buntu',
        recoveryPhase: 'Fase 2 Proliferasi',
        weight: 65,
        height: 172,
        age: 32,
        gender: 'male',
        targetProtein: 75,
        targetCalories: 1950,
        createdAt: '2026-08-01T08:00:00.000Z',
        avatarText: 'RP',
        hasCompletedQuiz: true,
        allergies: 'Tidak ada',
        symptoms: ['nausea']
      },
      {
        id: 'usr_demo_rehab',
        name: 'Siti Rahmawati',
        email: 'siti@nutrivision.id',
        passwordHash: this.hashPassword('siti123'),
        role: 'patient',
        condition: 'injury-rehab',
        conditionLabel: 'Fisioterapi Cedera ACL',
        recoveryPhase: 'Fase 1 Akut',
        weight: 50,
        height: 160,
        age: 27,
        gender: 'female',
        targetProtein: 80,
        targetCalories: 1750,
        createdAt: '2026-08-10T09:30:00.000Z',
        avatarText: 'SR',
        hasCompletedQuiz: true,
        allergies: 'Udang / Seafood',
        symptoms: ['appetite']
      },
      {
        id: 'usr_demo_doctor',
        name: 'dr. Sarah Sp.GK',
        email: 'dokter@nutrivision.id',
        passwordHash: this.hashPassword('dokter123'),
        role: 'clinician',
        condition: 'clinician',
        conditionLabel: 'Spesialis Gizi Klinis RSUP',
        recoveryPhase: 'Pengawas Klinis',
        weight: 58,
        height: 165,
        age: 39,
        gender: 'female',
        targetProtein: 90,
        targetCalories: 2000,
        createdAt: '2026-07-15T10:00:00.000Z',
        avatarText: 'DS',
        hasCompletedQuiz: true,
        allergies: 'Tidak ada',
        symptoms: []
      },
      {
        id: 'usr_demo_caregiver',
        name: 'Ratna Dewi',
        email: 'caregiver@nutrivision.id',
        passwordHash: this.hashPassword('caregiver123'),
        role: 'caregiver',
        condition: 'caregiver',
        conditionLabel: 'Pendamping Pasien Lansia',
        recoveryPhase: 'Pendamping Rawat',
        weight: 55,
        height: 158,
        age: 45,
        gender: 'female',
        targetProtein: 70,
        targetCalories: 1800,
        createdAt: '2026-08-05T11:00:00.000Z',
        avatarText: 'RD',
        hasCompletedQuiz: true,
        allergies: 'Tidak ada',
        symptoms: []
      },
      {
        id: 'usr_admin_master',
        name: 'Administrator NutriVision',
        email: 'admin@nutrivision.id',
        passwordHash: this.hashPassword('admin123'),
        role: 'admin',
        condition: 'admin',
        conditionLabel: 'Administrator Database & Cloud',
        recoveryPhase: 'Akses Penuh',
        weight: 70,
        height: 175,
        age: 30,
        gender: 'male',
        targetProtein: 90,
        targetCalories: 2000,
        createdAt: '2026-08-01T00:00:00.000Z',
        avatarText: 'AD',
        hasCompletedQuiz: true,
        allergies: 'Tidak ada',
        symptoms: []
      }
    ];

    for (const user of seedUsers) {
      const existing = await this.getUserByEmail(user.email);
      if (!existing) {
        await this.saveUserDirect(user);
      }
    }
  }

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'nv_hash_' + Math.abs(hash).toString(16) + '_sec';
  }

  /**
   * Helper: Konversi User JS object ke Supabase Database format
   */
  mapUserToSupabaseRow(user) {
    return {
      id: user.id,
      name: user.name,
      email: (user.email || '').toLowerCase(),
      password_hash: user.passwordHash,
      role: user.role || 'patient',
      condition: user.condition,
      condition_label: user.conditionLabel,
      recovery_phase: user.recoveryPhase,
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      target_protein: user.targetProtein,
      target_calories: user.targetCalories,
      allergies: user.allergies,
      symptoms: user.symptoms || [],
      created_at: user.createdAt || new Date().toISOString()
    };
  }

  /**
   * Helper: Konversi Supabase row ke User JS object
   */
  mapSupabaseRowToUser(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      condition: row.condition,
      conditionLabel: row.condition_label,
      recoveryPhase: row.recovery_phase,
      weight: row.weight,
      height: row.height,
      age: row.age,
      gender: row.gender,
      targetProtein: row.target_protein,
      targetCalories: row.target_calories,
      allergies: row.allergies,
      symptoms: row.symptoms || [],
      createdAt: row.created_at,
      avatarText: (row.name || 'P').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      hasCompletedQuiz: true
    };
  }

  /**
   * Simpan user ke IndexedDB & Sync ke Supabase (jika aktif)
   */
  async saveUserDirect(user) {
    if (!user.id) {
      const existing = await this.getUserByEmail(user.email);
      user.id = existing?.id || 'usr_' + Date.now().toString(36);
    }

    // 1. Simpan Lokal (IndexedDB / LocalStorage)
    if (this.useFallback) {
      const users = JSON.parse(localStorage.getItem('nv_db_users') || '{}');
      users[user.id] = { ...(users[user.id] || {}), ...user };
      localStorage.setItem('nv_db_users', JSON.stringify(users));
    } else {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction(['users'], 'readwrite');
        const store = tx.objectStore('users');
        const req = store.put(user);
        req.onsuccess = () => resolve(user);
        req.onerror = (e) => reject(e.target.error);
      });
    }

    // 2. Background Sync ke Supabase Cloud (Non-blocking)
    if (this.supabase) {
      try {
        const row = this.mapUserToSupabaseRow(user);
        this.supabase.from('users').upsert(row).then(({ error }) => {
          if (error) console.warn('Supabase user upsert notice:', error.message);
          else console.log('☁️ User synced to Supabase:', user.email);
        });
      } catch (err) {
        console.warn('Supabase sync error:', err.message);
      }
    }

    return user;
  }

  async updateUserProfile(email, updates) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const existing = await this.getUserByEmail(cleanEmail);

    if (!existing) {
      const newUser = {
        id: 'usr_' + Date.now().toString(36),
        email: cleanEmail,
        ...updates,
        hasCompletedQuiz: true
      };
      return await this.saveUserDirect(newUser);
    }

    const updatedUser = {
      ...existing,
      ...updates,
      id: existing.id,
      email: cleanEmail,
      hasCompletedQuiz: true
    };

    await this.saveUserDirect(updatedUser);
    this.setCurrentSession(updatedUser);
    return updatedUser;
  }

  async getUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Cek dari Supabase jika online
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (data && !error) {
          const mappedUser = this.mapSupabaseRowToUser(data);
          // Cache ke IndexedDB lokal
          this.saveLocalOnly(mappedUser);
          return mappedUser;
        }
      } catch (e) {
        console.warn('Supabase getUserByEmail fallback to local:', e.message);
      }
    }

    // 2. Fallback Lokal
    if (this.useFallback) {
      const users = JSON.parse(localStorage.getItem('nv_db_users') || '{}');
      return Object.values(users).find(u => u.email.toLowerCase() === cleanEmail) || null;
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction(['users'], 'readonly');
      const store = tx.objectStore('users');
      const index = store.index('email');
      const req = index.get(cleanEmail);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async getUserById(id) {
    if (!id) return null;

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data && !error) {
          return this.mapSupabaseRowToUser(data);
        }
      } catch (e) {
        console.warn('Supabase getUserById fallback to local:', e.message);
      }
    }

    if (this.useFallback) {
      const users = JSON.parse(localStorage.getItem('nv_db_users') || '{}');
      return users[id] || null;
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction(['users'], 'readonly');
      const store = tx.objectStore('users');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async getAllUsers() {
    // Ambil dari Supabase jika ada
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('users').select('*');
        if (data && !error && data.length > 0) {
          return data.map(r => this.mapSupabaseRowToUser(r));
        }
      } catch (e) {
        console.warn('Supabase getAllUsers fallback to local:', e.message);
      }
    }

    if (this.useFallback) {
      const users = JSON.parse(localStorage.getItem('nv_db_users') || '{}');
      return Object.values(users);
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction(['users'], 'readonly');
      const store = tx.objectStore('users');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  saveLocalOnly(user) {
    if (!this.db || !user) return;
    try {
      const tx = this.db.transaction(['users'], 'readwrite');
      tx.objectStore('users').put(user);
    } catch (e) {}
  }

  async register(userData) {
    const email = userData.email.trim().toLowerCase();
    const existing = await this.getUserByEmail(email);
    if (existing) {
      throw new Error(`Email atau kontak ${email} sudah terdaftar. Silakan gunakan menu Masuk / Login.`);
    }

    const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const initials = (userData.name || 'P').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const newUser = {
      id: userId,
      name: userData.name || 'Pasien Baru',
      email: email,
      passwordHash: this.hashPassword(userData.password || 'pasien123'),
      role: userData.role || 'patient',
      condition: userData.condition || 'post-surgery',
      conditionLabel: userData.conditionLabel || 'Pasca-Operasi',
      recoveryPhase: userData.recoveryPhase || 'Fase 1 Akut',
      weight: parseFloat(userData.weight) || 60,
      height: parseFloat(userData.height) || 165,
      age: parseInt(userData.age) || 30,
      gender: userData.gender || 'male',
      targetProtein: parseFloat(userData.targetProtein) || 75,
      targetCalories: parseFloat(userData.targetCalories) || 1800,
      createdAt: new Date().toISOString(),
      avatarText: initials,
      hasCompletedQuiz: !!userData.hasCompletedQuiz,
      allergies: userData.allergies || 'Tidak ada',
      symptoms: userData.symptoms || []
    };

    await this.saveUserDirect(newUser);
    this.setCurrentSession(newUser);
    return newUser;
  }

  async login(email, password) {
    if (!email) throw new Error('Email atau nomor WhatsApp wajib diisi.');
    const cleanEmail = email.trim().toLowerCase();
    let user = await this.getUserByEmail(cleanEmail);

    if (!user && cleanEmail === 'admin@nutrivision.id') {
      user = {
        id: 'usr_admin_master',
        name: 'Administrator NutriVision',
        email: 'admin@nutrivision.id',
        passwordHash: this.hashPassword('admin123'),
        role: 'admin',
        condition: 'admin',
        conditionLabel: 'Administrator Database & Cloud',
        recoveryPhase: 'Akses Penuh',
        weight: 70,
        height: 175,
        age: 30,
        gender: 'male',
        targetProtein: 90,
        targetCalories: 2000,
        createdAt: new Date().toISOString(),
        avatarText: 'AD',
        hasCompletedQuiz: true,
        allergies: 'Tidak ada',
        symptoms: []
      };
      await this.saveUserDirect(user);
    }

    if (!user) {
      throw new Error(`Akun dengan email "${email}" tidak ditemukan. Silakan klik "Daftar Baru" untuk membuat akun.`);
    }

    if (password) {
      const inputHash = this.hashPassword(password);
      if (user.passwordHash && user.passwordHash !== inputHash) {
        throw new Error('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
      }
    }

    user.lastLogin = new Date().toISOString();
    await this.saveUserDirect(user);

    this.setCurrentSession(user);
    return user;
  }

  setCurrentSession(user) {
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarText: user.avatarText || 'U',
      condition: user.condition,
      conditionLabel: user.conditionLabel,
      recoveryPhase: user.recoveryPhase,
      weight: user.weight,
      targetProtein: user.targetProtein,
      timestamp: Date.now()
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
  }

  getCurrentSession() {
    try {
      const data = localStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
  }

  async saveMeal(meal) {
    if (!meal.id) {
      meal.id = 'meal_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    }
    meal.createdAt = meal.createdAt || new Date().toISOString();

    // 1. Simpan Lokal
    if (this.useFallback) {
      const meals = JSON.parse(localStorage.getItem('nv_db_meals') || '[]');
      meals.unshift(meal);
      localStorage.setItem('nv_db_meals', JSON.stringify(meals.slice(0, 100)));
    } else {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction(['meals'], 'readwrite');
        const store = tx.objectStore('meals');
        const req = store.put(meal);
        req.onsuccess = () => resolve(meal);
        req.onerror = (e) => reject(e.target.error);
      });
    }

    // 2. Background Sync ke Supabase
    if (this.supabase) {
      try {
        const row = {
          id: meal.id,
          user_id: meal.userId,
          meal_type: meal.mealType,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          segments: meal.segments || [],
          timestamp: meal.timestamp || meal.createdAt
        };
        this.supabase.from('meals').upsert(row).then(({ error }) => {
          if (error) console.warn('Supabase meal upsert notice:', error.message);
          else console.log('☁️ Meal synced to Supabase:', meal.name);
        });
      } catch (err) {
        console.warn('Supabase meal sync error:', err.message);
      }
    }

    return meal;
  }

  async getMealsByUser(userId) {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('meals')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (data && !error && data.length > 0) {
          return data.map(r => ({
            id: r.id,
            userId: r.user_id,
            mealType: r.meal_type,
            name: r.name,
            calories: r.calories,
            protein: r.protein,
            carbs: r.carbs,
            fat: r.fat,
            segments: r.segments,
            timestamp: r.timestamp,
            createdAt: r.timestamp
          }));
        }
      } catch (e) {
        console.warn('Supabase getMealsByUser fallback to local:', e.message);
      }
    }

    if (this.useFallback) {
      const meals = JSON.parse(localStorage.getItem('nv_db_meals') || '[]');
      return meals.filter(m => m.userId === userId);
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction(['meals'], 'readonly');
      const store = tx.objectStore('meals');
      const index = store.index('userId');
      const req = index.getAll(userId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  /**
   * Upload seluruh data lokal (semua user & meal) ke Supabase dalam 1 klik
   */
  async syncAllToSupabase() {
    if (!this.supabase) {
      throw new Error('Supabase belum terhubung. Silakan masukkan Project URL & Anon Key terlebih dahulu.');
    }

    const allUsers = await this.getAllUsers();
    let syncedUsers = 0;
    let syncedMeals = 0;

    for (const u of allUsers) {
      const row = this.mapUserToSupabaseRow(u);
      const { error } = await this.supabase.from('users').upsert(row);
      if (!error) syncedUsers++;
    }

    // Ambil semua meals dari local IndexedDB
    const allMeals = await new Promise((resolve) => {
      if (this.useFallback) {
        resolve(JSON.parse(localStorage.getItem('nv_db_meals') || '[]'));
        return;
      }
      const tx = this.db.transaction(['meals'], 'readonly');
      const req = tx.objectStore('meals').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    for (const m of allMeals) {
      const row = {
        id: m.id,
        user_id: m.userId,
        meal_type: m.mealType,
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        segments: m.segments || [],
        timestamp: m.timestamp || m.createdAt
      };
      const { error } = await this.supabase.from('meals').upsert(row);
      if (!error) syncedMeals++;
    }

    return {
      syncedUsers,
      syncedMeals
    };
  }

  initLocalStorageFallback() {
    if (!localStorage.getItem('nv_db_users')) {
      localStorage.setItem('nv_db_users', '{}');
    }
    if (!localStorage.getItem('nv_db_meals')) {
      localStorage.setItem('nv_db_meals', '[]');
    }
  }
}

// Global Singleton Instance
window.nutriVisionDB = new NutriVisionDatabase();
