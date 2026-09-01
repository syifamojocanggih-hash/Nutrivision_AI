/**
 * ============================================================================
 * NutriVision AI — IndexedDB Database Engine (Local-First Offline Storage)
 * Manages users, credentials, food scans, meal plans, and clinical records.
 * ============================================================================
 */

class NutriVisionDatabase {
  constructor() {
    this.dbName = 'NutriVisionAIDB';
    this.dbVersion = 2;
    this.db = null;
    this.sessionKey = 'nutrivision_active_session';
    this.isReady = false;
  }

  /**
   * Initialize IndexedDB with schema migrations & pre-seeded accounts
   */
  async init() {
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

  async saveUserDirect(user) {
    if (!user.id) {
      const existing = await this.getUserByEmail(user.email);
      user.id = existing?.id || 'usr_' + Date.now().toString(36);
    }

    if (this.useFallback) {
      const users = JSON.parse(localStorage.getItem('nv_db_users') || '{}');
      users[user.id] = { ...(users[user.id] || {}), ...user };
      localStorage.setItem('nv_db_users', JSON.stringify(users));
      return users[user.id];
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['users'], 'readwrite');
      const store = tx.objectStore('users');
      const req = store.put(user);
      req.onsuccess = () => resolve(user);
      req.onerror = (e) => reject(e.target.error);
    });
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
    const user = await this.getUserByEmail(cleanEmail);

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
      meal.id = 'meal_' + Date.now().toString(36);
    }
    meal.createdAt = meal.createdAt || new Date().toISOString();

    if (this.useFallback) {
      const meals = JSON.parse(localStorage.getItem('nv_db_meals') || '[]');
      meals.unshift(meal);
      localStorage.setItem('nv_db_meals', JSON.stringify(meals.slice(0, 100)));
      return meal;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['meals'], 'readwrite');
      const store = tx.objectStore('meals');
      const req = store.put(meal);
      req.onsuccess = () => resolve(meal);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getMealsByUser(userId) {
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
