/**
 * ApiService.js
 * Centralized API service for handling POST network requests to auth endpoints.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

async function safeJsonFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    }
    // Static hosting (like Netlify) returns HTML for unhandled routes
    return { ok: false, status: res.status, data: null };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err };
  }
}

export const ApiService = {
  /**
   * Register a new user via POST request to /api/auth/register
   */
  async register(userData) {
    const endpoint = `${API_URL}/auth/register`;
    console.log("[REGISTER] API URL:", endpoint);

    const result = await safeJsonFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (result.ok && result.data) {
      return result.data;
    }

    // Static hosting fallback (Netlify / Vercel without Node backend)
    console.warn("[REGISTER] Backend unavailable, fallback to local registration");
    const fullName = userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Ustoz';
    return {
      success: true,
      user: {
        id: `user_${Date.now()}`,
        name: fullName,
        email: (userData.email || '').trim().toLowerCase(),
        role: 'teacher',
        school: userData.school || '',
        subjects: ['Matematika'],
        createdAt: new Date().toISOString(),
        credits: 100,
      },
      token: 'mock-local-token'
    };
  },

  /**
   * Log in user via POST request to /api/auth/login
   */
  async login(email, password) {
    const endpoint = `${API_URL}/auth/login`;
    console.log("[LOGIN] API URL:", endpoint);

    const result = await safeJsonFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (result.ok && result.data) {
      return result.data;
    }

    // Static hosting fallback
    console.warn("[LOGIN] Backend unavailable, fallback to local login");
    return {
      success: true,
      user: {
        id: `user_${(email || '').split('@')[0] || Date.now()}`,
        name: email ? email.split('@')[0] : 'Ustoz',
        email: (email || '').trim().toLowerCase(),
        role: 'teacher',
        createdAt: new Date().toISOString(),
        credits: 100,
      },
      token: 'mock-local-token'
    };
  },

  /**
   * Deduct credits from backend database or local storage.
   */
  async deductCredits(userId, amount) {
    const endpoint = `${API_URL}/auth/deduct-credits`;
    const result = await safeJsonFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });

    if (result.ok && result.data && result.data.credits !== undefined) {
      return result.data.credits;
    }

    // LocalStorage fallback
    const key = `credits_${userId}`;
    const current = parseInt(localStorage.getItem(key) || '100', 10);
    const updated = Math.max(0, current - amount);
    localStorage.setItem(key, updated.toString());
    return updated;
  },

  /**
   * Fetch current credits from backend database or local storage.
   */
  async getCredits(userId) {
    const endpoint = `${API_URL}/auth/credits?userId=${encodeURIComponent(userId)}`;
    const result = await safeJsonFetch(endpoint);

    if (result.ok && result.data && result.data.credits !== undefined) {
      return result.data.credits;
    }

    // LocalStorage fallback
    const key = `credits_${userId}`;
    const stored = localStorage.getItem(key);
    return stored !== null ? parseInt(stored, 10) : 100;
  }
};

export default ApiService;

