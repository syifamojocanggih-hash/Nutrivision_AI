/**
 * ============================================================================
 * NutriVision AI — Frontend REST API Client
 * Seamless Hybrid Connection: Node.js Express REST Backend + Offline Fallback
 * ============================================================================
 */

class NutriVisionAPIClient {
  constructor() {
    // Backend Express API berjalan di port 5000 (atau remote Railway di production).
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const frontendPort = parseInt(window.location.port || '80', 10);
    const autoBaseUrl = isLocalhost
      ? (frontendPort === 5000 ? '' : 'http://localhost:5000')
      : 'https://nutrivisionai-production.up.railway.app';
    this.baseUrl = localStorage.getItem('nv_api_base_url') || autoBaseUrl;
    this.tokenKey = 'nv_auth_token';
    this.isServerOnline = false;
    this.lastHealthCheck = null;

    // Check backend connection on start
    this.checkHealth();
  }

  get token() {
    return localStorage.getItem(this.tokenKey) || '';
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  /**
   * Check if the Node.js Express REST API server is online
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.isServerOnline = true;
        this.lastHealthCheck = data;
        this.updateUIStatus(true, data);
        return true;
      }
    } catch (e) {
      this.isServerOnline = false;
      this.updateUIStatus(false);
      return false;
    }
  }

  /**
   * Update visual indicator in UI if present
   */
  updateUIStatus(isOnline, data = null) {
    const dot = document.getElementById('backend-status-dot');
    const text = document.getElementById('backend-status-text');

    if (dot) {
      dot.style.background = isOnline ? '#10B981' : '#F59E0B';
    }
    if (text) {
      text.textContent = isOnline
        ? `Backend Terhubung · MySQL Port ${data?.port || 5000}`
        : 'Mode Lokal · Data tersimpan di perangkat ini';
    }
  }

  /**
   * Generic Fetch Wrapper with Authorization & Error Handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...(options.headers || {})
    };

    // Attach JWT if available
    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Set JSON content type if body is plain object
    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const contentType = res.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}: Gagal memproses permintaan.`);
      }

      return data;
    } catch (err) {
      console.warn(`[API Client] ${endpoint} notice:`, err.message);
      throw err;
    }
  }

  // =========================================================================
  // 1. AUTHENTICATION & PROFILE
  // =========================================================================
  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async register(userData) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getMe() {
    return await this.request('/api/auth/me');
  }

  async updateProfile(profileData) {
    return await this.request('/api/auth/profile', {
      method: 'PUT',
      body: profileData
    });
  }

  logout() {
    this.setToken(null);
  }

  // =========================================================================
  // 2. MEALS & NUTRITION TRACKING
  // =========================================================================
  async getMeals(limit = 50, userId = null) {
    const params = new URLSearchParams({ limit });
    if (userId) params.append('userId', userId);
    return await this.request(`/api/meals?${params.toString()}`);
  }

  async getMealsToday(userId = null) {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return await this.request(`/api/meals/today${q}`);
  }

  async getMealsByDate(date, userId = null) {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return await this.request(`/api/meals/date/${date}${q}`);
  }

  async logMeal(mealData) {
    return await this.request('/api/meals', {
      method: 'POST',
      body: mealData
    });
  }

  async getWeeklyStats(userId = null) {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return await this.request(`/api/meals/weekly-stats${q}`);
  }

  async deleteMeal(id) {
    return await this.request(`/api/meals/${id}`, {
      method: 'DELETE'
    });
  }

  // =========================================================================
  // 3. FOOD CATALOG (TKPI)
  // =========================================================================
  async getFoods(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/api/foods${query ? '?' + query : ''}`);
  }

  async getFoodById(id) {
    return await this.request(`/api/foods/${id}`);
  }

  // =========================================================================
  // 4. COMPUTER VISION ANALYSIS
  // =========================================================================
  async analyzePlate(dataOrFormData) {
    let body = dataOrFormData;
    let headers = {};

    if (!(dataOrFormData instanceof FormData)) {
      body = dataOrFormData;
    }

    return await this.request('/api/cv/analyze', {
      method: 'POST',
      headers,
      body
    });
  }

  // =========================================================================
  // 5. CAREGIVER TELEHEALTH ACCESS
  // =========================================================================
  async generateCaregiverToken(caregiverName, role = 'family') {
    return await this.request('/api/caregiver/generate-token', {
      method: 'POST',
      body: { caregiverName, role }
    });
  }

  async getCaregiverView(token) {
    return await this.request(`/api/caregiver/view/${token}`);
  }

  // =========================================================================
  // 6. COMMUNITY POSTS & RECIPES
  // =========================================================================
  async getCommunityPosts(category = 'all', limit = 30) {
    return await this.request(`/api/community/posts?category=${category}&limit=${limit}`);
  }

  async createCommunityPost(postData) {
    return await this.request('/api/community/posts', {
      method: 'POST',
      body: postData
    });
  }

  async likePost(postId) {
    return await this.request(`/api/community/posts/${postId}/like`, {
      method: 'POST'
    });
  }

  async commentPost(postId, text, authorName) {
    return await this.request(`/api/community/posts/${postId}/comment`, {
      method: 'POST',
      body: { text, authorName }
    });
  }

  // =========================================================================
  // 7. TELEMETRY & AUDIT TRAIL
  // =========================================================================
  async getTelemetryStats() {
    return await this.request('/api/telemetry/stats');
  }

  async getAuditLogs(limit = 100) {
    return await this.request(`/api/telemetry/audit-logs?limit=${limit}`);
  }

  async logTelemetry(action, details) {
    return await this.request('/api/telemetry/log', {
      method: 'POST',
      body: { action, details }
    });
  }

  getExportTelemetryUrl() {
    return `${this.baseUrl}/api/telemetry/export-json`;
  }

  // =========================================================================
  // 8. SMART CLINICAL NOTIFICATIONS
  // =========================================================================
  async getNotifications(userId = null, limit = 30) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('limit', limit);
    return await this.request(`/api/notifications?${params.toString()}`);
  }

  async markNotificationRead(id) {
    return await this.request(`/api/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead(userId = null) {
    return await this.request('/api/notifications/read-all', {
      method: 'PUT',
      body: userId ? { userId } : {}
    });
  }

  async simulateSmartNotification(type, userId = null) {
    return await this.request('/api/notifications/simulate-trigger', {
      method: 'POST',
      body: { type, userId }
    });
  }

  async evaluateSmartNotifications(hour = null, userId = null) {
    return await this.request('/api/notifications/evaluate-smart', {
      method: 'POST',
      body: { hour, userId }
    });
  }

  // =========================================================================
  // 9. AI CLINICAL INFERENCE ENGINE (.safetensors DistilBERT)
  // =========================================================================
  async checkAIHealth() {
    return await this.request('/api/ai/health');
  }

  async classifyNutritionText(text, patientId = null) {
    return await this.request('/api/ai/classify', {
      method: 'POST',
      body: { text, patientId }
    });
  }

  async filterSymptomsByAI(symptoms = []) {
    return await this.request('/api/ai/symptom-filter', {
      method: 'POST',
      body: { symptoms }
    });
  }
}

// Global instance
window.nutriAPI = new NutriVisionAPIClient();
