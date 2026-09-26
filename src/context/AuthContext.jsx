import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AccountService from '../services/AccountService';
import UserDataService from '../services/UserDataService';
import ApiService from '../services/ApiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ai-ustoz-session');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.id) {
          // Load from user-specific credits in localStorage as fallback
          const localCreds = localStorage.getItem(`credits_${u.id}`);
          u.credits = localCreds !== null ? parseInt(localCreds, 10) : (u.credits !== undefined ? u.credits : 100);
        }
        return u;
      }
      return null;
    } catch { return null; }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync credits with backend on user id change
  useEffect(() => {
    if (user && user.id) {
      ApiService.getCredits(user.id)
        .then(creds => {
          localStorage.setItem(`credits_${user.id}`, creds.toString());
          setUser(prev => {
            if (prev && prev.credits !== creds) {
              return { ...prev, credits: creds };
            }
            return prev;
          });
        })
        .catch(err => console.error('[CREDITS] Failed to sync credits with backend:', err));
    }
  }, [user?.id]);

  // Persist session
  useEffect(() => {
    if (user) {
      localStorage.setItem('ai-ustoz-session', JSON.stringify(user));
    } else {
      localStorage.removeItem('ai-ustoz-session');
    }
  }, [user]);

  // ── Register ───────────────────────────────────────────────────────
  const register = useCallback(async (registerData) => {
    setLoading(true);
    setAuthError(null);
    console.log('[AuthContext Step 1] Calling ApiService.register with payload:', registerData);
    try {
      // 1. Send HTTP POST request to backend API endpoint (visible in Fetch/XHR devtools)
      const apiResponse = await ApiService.register(registerData);
      console.log('[AuthContext Step 2] ApiService response:', apiResponse);

      // 2. Save user in AccountService registry
      const newUser = AccountService.register({ ...registerData, credits: 100 });
      console.log('[AuthContext Step 3] User successfully created & stored:', newUser);

      // Save user-specific initial credits to localStorage
      localStorage.setItem(`credits_${newUser.id}`, "100");

      const userWithCredits = { ...newUser, credits: 100 };
      setUser(userWithCredits);
      return userWithCredits;
    } catch (err) {
      console.error('[AuthContext Error] Registration failed:', err);
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setAuthError(null);
    console.log('[AuthContext Step 1] Calling ApiService.login for:', email);
    try {
      // 1. Send HTTP POST request to backend API endpoint
      const apiResponse = await ApiService.login(email, password);
      console.log('[AuthContext Step 2] ApiService login response:', apiResponse);

      // 2. Retrieve user from local AccountService registry
      let loggedUser;
      try {
        loggedUser = AccountService.login(email, password);
      } catch {
        loggedUser = apiResponse.user || {
          id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim().toLowerCase(),
          role: 'teacher',
        };
      }

      // Sync backend credits back to user
      const credits = apiResponse.user?.credits !== undefined ? apiResponse.user.credits : 100;
      localStorage.setItem(`credits_${loggedUser.id}`, credits.toString());
      
      const userWithCredits = { ...loggedUser, credits };
      console.log('[AuthContext Step 3] User logged in:', userWithCredits);

      setUser(userWithCredits);
      return userWithCredits;
    } catch (err) {
      console.error('[AuthContext Error] Login failed:', err);
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Deduct Credits ──────────────────────────────────────────────────
  const deductCredits = useCallback(async (amount) => {
    if (!user) return;
    const currentCredits = user.credits || 0;
    console.log("[CREDITS] Current:", currentCredits);
    console.log("[CREDITS] Cost:", amount);
    
    try {
      const newCredits = await ApiService.deductCredits(user.id, amount);
      console.log("[CREDITS] New balance:", newCredits);
      
      // Update local storage and reactive state
      localStorage.setItem(`credits_${user.id}`, newCredits.toString());
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, credits: newCredits };
      });
      return newCredits;
    } catch (err) {
      console.error("[CREDITS] Error deducting credits:", err);
      throw err;
    }
  }, [user]);

  // ── Logout ─────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ai-ustoz-session');
  }, []);

  // ── Update Profile ─────────────────────────────────────────────────
  const updateProfile = useCallback((updates) => {
    if (!user) return;
    const updated = AccountService.updateUser(user.id, updates);
    // Keep credits when updating profile
    const updatedWithCredits = { ...updated, credits: user.credits };
    setUser(updatedWithCredits);
    return updatedWithCredits;
  }, [user]);

  // ── Change Password ────────────────────────────────────────────────
  const changePassword = useCallback((currentPassword, newPassword) => {
    if (!user) throw new Error('Tizimga kirilmagan.');
    return AccountService.changePassword(user.id, currentPassword, newPassword);
  }, [user]);

  // ── Upload Avatar (base64) ─────────────────────────────────────────
  const uploadAvatar = useCallback((base64) => {
    if (!user) return;
    const updated = AccountService.updateUser(user.id, { avatar: base64 });
    const updatedWithCredits = { ...updated, credits: user.credits };
    setUser(updatedWithCredits);
  }, [user]);

  // ── Refresh user from registry ─────────────────────────────────────
  const refreshUser = useCallback(() => {
    if (!user) return;
    const users = AccountService.getAllUsers();
    const fresh = users.find(u => u.id === user.id);
    if (fresh) {
      const { passwordHash, ...safeUser } = fresh;
      const userWithCredits = { ...safeUser, credits: user.credits };
      setUser(userWithCredits);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      setAuthError,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      uploadAvatar,
      refreshUser,
      deductCredits,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
