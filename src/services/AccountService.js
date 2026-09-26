/**
 * AccountService.js
 * 
 * Manages the users registry (all registered accounts).
 * Each user has their own isolated data via UserDataService.
 * 
 * Users registry key: 'ai-ustoz-users-registry' (shared, not per-user)
 */

const REGISTRY_KEY = 'ai-ustoz-users-registry';

export const AccountService = {
  /**
   * Get all registered user accounts (without passwords).
   */
  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '[]');
    } catch { return []; }
  },

  _saveUsers(users) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(users));
  },

  /**
   * Register a new user. Returns the new user object or throws on duplicate email.
   */
  register({ name, firstName, lastName, email, password, school = '', subjects = [], experience = '' }) {
    const users = this.getAllUsers();
    const existing = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (existing) throw new Error("Bu email allaqachon ro'yxatdan o'tgan.");

    const computedName = (name || `${firstName || ''} ${lastName || ''}`).trim() || (email ? email.split('@')[0] : 'Foydalanuvchi');

    const newUser = {
      id: `user_${Date.now()}`,
      name: computedName,
      email: (email || '').trim().toLowerCase(),
      passwordHash: this._hashPassword(password || ''), // simple hash for demo
      role: 'teacher',
      avatar: null,
      school: school || '',
      subjects: subjects.length ? subjects : ['Matematika'],
      experience: experience || '0 yil',
      xp: 0,
      level: 1,
      streak: 0,
      badges: ['Yangi o\'qituvchi'],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this._saveUsers(users);
    return newUser;
  },

  /**
   * Log in a user by email + password. Returns user or throws.
   */
  login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) throw new Error("Bu email bilan ro'yxatdan o'tilmagan.");
    if (user.passwordHash !== this._hashPassword(password)) {
      throw new Error("Parol noto'g'ri. Iltimos qayta kiriting.");
    }
    // Return user without passwordHash
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Update user profile fields.
   */
  updateUser(userId, updates) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('Foydalanuvchi topilmadi.');

    // Never overwrite passwordHash from profile updates
    const { passwordHash: _, password: __, ...safeUpdates } = updates;
    users[idx] = { ...users[idx], ...safeUpdates, updatedAt: new Date().toISOString() };
    this._saveUsers(users);

    const { passwordHash: _ph, ...safeUser } = users[idx];
    return safeUser;
  },

  /**
   * Change password.
   */
  changePassword(userId, currentPassword, newPassword) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('Foydalanuvchi topilmadi.');

    if (users[idx].passwordHash !== this._hashPassword(currentPassword)) {
      throw new Error("Joriy parol noto'g'ri.");
    }
    if (newPassword.length < 6) throw new Error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.");

    users[idx].passwordHash = this._hashPassword(newPassword);
    users[idx].updatedAt = new Date().toISOString();
    this._saveUsers(users);
    return true;
  },

  /**
   * Add XP and level up if needed.
   */
  addXP(userId, amount) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;

    users[idx].xp = (users[idx].xp || 0) + amount;
    users[idx].level = Math.floor(users[idx].xp / 500) + 1;
    this._saveUsers(users);
  },

  /**
   * Add a badge if not already earned.
   */
  addBadge(userId, badge) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;
    if (!users[idx].badges.includes(badge)) {
      users[idx].badges.push(badge);
      this._saveUsers(users);
    }
  },

  /**
   * Simple non-cryptographic hash for demo purposes.
   * In production, use bcrypt on the backend.
   */
  _hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `h_${Math.abs(hash).toString(36)}`;
  },

  /**
   * Delete user account and all their data.
   */
  deleteAccount(userId) {
    const users = this.getAllUsers().filter(u => u.id !== userId);
    this._saveUsers(users);
    // Also clear their UserDataService data
    const prefix = `uid_${userId}__`;
    Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .forEach(k => localStorage.removeItem(k));
  },
};

export default AccountService;
