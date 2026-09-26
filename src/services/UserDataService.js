/**
 * UserDataService.js
 * 
 * Namespaces all user data by userId so each user only sees their own data.
 * All module pages must read/write through this service, NOT directly to localStorage.
 * 
 * Key format: `uid_{userId}__{dataKey}`
 */

const PREFIX = (userId) => `uid_${userId}__`;

export const UserDataService = {
  // ── Read ───────────────────────────────────────────────────────────
  get(userId, key, defaultValue = null) {
    const raw = localStorage.getItem(`${PREFIX(userId)}${key}`);
    if (raw === null) return defaultValue;
    try { return JSON.parse(raw); } catch { return raw; }
  },

  // ── Write ──────────────────────────────────────────────────────────
  set(userId, key, value) {
    localStorage.setItem(`${PREFIX(userId)}${key}`, JSON.stringify(value));
    // Dispatch event so any listening components can reactively update
    window.dispatchEvent(new CustomEvent('user-data-change', { detail: { userId, key } }));
  },

  // ── Remove ─────────────────────────────────────────────────────────
  remove(userId, key) {
    localStorage.removeItem(`${PREFIX(userId)}${key}`);
  },

  // ── Clear all data for a user ──────────────────────────────────────
  clearAll(userId) {
    const prefix = PREFIX(userId);
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    keys.forEach(k => localStorage.removeItem(k));
  },

  // ── Get all stored keys for a user ────────────────────────────────
  listKeys(userId) {
    const prefix = PREFIX(userId);
    return Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .map(k => k.slice(prefix.length));
  },

  // ── Shortcut helpers for common data ──────────────────────────────
  getStudents(userId) { return this.get(userId, 'students', []); },
  setStudents(userId, data) { this.set(userId, 'students', data); },

  getClasses(userId) { return this.get(userId, 'classes', []); },
  setClasses(userId, data) { this.set(userId, 'classes', data); },

  getAttendance(userId) { return this.get(userId, 'attendance', {}); },
  setAttendance(userId, data) { this.set(userId, 'attendance', data); },

  getGrades(userId) { return this.get(userId, 'grades', {}); },
  setGrades(userId, data) { this.set(userId, 'grades', data); },

  getAssignments(userId) { return this.get(userId, 'assignments', []); },
  setAssignments(userId, data) { this.set(userId, 'assignments', data); },

  getEvents(userId) { return this.get(userId, 'calendar-events', []); },
  setEvents(userId, data) { this.set(userId, 'calendar-events', data); },

  getFiles(userId) { return this.get(userId, 'files', []); },
  setFiles(userId, data) { this.set(userId, 'files', data); },

  getFolders(userId) { return this.get(userId, 'folders', []); },
  setFolders(userId, data) { this.set(userId, 'folders', data); },

  getTemplates(userId) { return this.get(userId, 'templates', []); },
  setTemplates(userId, data) { this.set(userId, 'templates', data); },



  getSettings(userId) {
    return this.get(userId, 'settings', {
      theme: 'dark',
      accentColor: '#2563EB',
      language: 'uz',
      notifications: { lesson: true, homework: true, meeting: false, ai: true },
      defaultModel: 'openai/gpt-4o-mini',
    });
  },
  setSettings(userId, data) { this.set(userId, 'settings', data); },

  getChatHistory(userId) { return this.get(userId, 'chat-history', []); },
  setChatHistory(userId, data) { this.set(userId, 'chat-history', data); },

  getPersonalTransactions(userId) { return this.get(userId, 'personal-transactions', []); },
  setPersonalTransactions(userId, data) { this.set(userId, 'personal-transactions', data); },

  getClassesNotes(userId) { return this.get(userId, 'classes-notes', []); },
  setClassesNotes(userId, data) { this.set(userId, 'classes-notes', data); },

  getClassesHomeworks(userId) { return this.get(userId, 'classes-homeworks', []); },
  setClassesHomeworks(userId, data) { this.set(userId, 'classes-homeworks', data); },

  getPlannerTasks(userId) { return this.get(userId, 'planner-tasks', []); },
  setPlannerTasks(userId, data) { this.set(userId, 'planner-tasks', data); },
};

export default UserDataService;

