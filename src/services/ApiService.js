/**
 * ApiService.js
 * Centralized API service for handling POST network requests to auth endpoints.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const ApiService = {
  /**
   * Register a new user via POST request to /api/auth/register
   */
  async register(userData) {
    const endpoint = `${API_URL}/auth/register`;
    console.log("[REGISTER] API URL:", endpoint);
    console.log("[REGISTER] Sending POST request...");

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("[REGISTER] Response:", data);

      if (!response.ok) {
        const errorMsg = data.message || data.error || `HTTP ${response.status}: Server error`;
        console.error("[REGISTER] REAL ERROR:", errorMsg);
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error("[REGISTER] REAL ERROR:", err.message || err);
      throw err;
    }
  },

  /**
   * Log in user via POST request to /api/auth/login
   */
  async login(email, password) {
    const endpoint = `${API_URL}/auth/login`;
    console.log("[LOGIN] API URL:", endpoint);
    console.log("[LOGIN] Sending POST request...");

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("[LOGIN] Response:", data);

      if (!response.ok) {
        const errorMsg = data.message || data.error || `HTTP ${response.status}: Server error`;
        console.error("[LOGIN] REAL ERROR:", errorMsg);
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error("[LOGIN] REAL ERROR:", err.message || err);
      throw err;
    }
  },

  /**
   * Deduct credits from backend database.
   */
  async deductCredits(userId, amount) {
    const endpoint = `${API_URL}/auth/deduct-credits`;
    console.log("[CREDITS] Sending POST request to deduct credits:", amount);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Kreditlarni yechishda xatolik.');
      }
      return data.credits;
    } catch (err) {
      console.error("[CREDITS] Error deducting credits:", err);
      throw err;
    }
  },

  /**
   * Fetch current credits from backend database.
   */
  async getCredits(userId) {
    const endpoint = `${API_URL}/auth/credits?userId=${encodeURIComponent(userId)}`;
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Kreditlarni yuklashda xatolik.');
      }
      return data.credits;
    } catch (err) {
      console.error("[CREDITS] Error fetching credits:", err);
      throw err;
    }
  }
};

export default ApiService;
