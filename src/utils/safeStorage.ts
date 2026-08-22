/**
 * Safe localStorage wrapper with in-memory fallback and optional Capacitor Preferences sync
 * Prevents DOMException / SecurityError crashes in iframes and iOS Safari private browsing
 */
import { Preferences } from '@capacitor/preferences';

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      return memoryStore[key] || null;
    }
    return memoryStore[key] || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      memoryStore[key] = value;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {}

    // Async sync with Capacitor Preferences if available
    try {
      Preferences.set({ key, value }).catch(() => {});
    } catch (e) {}
  },

  removeItem: (key: string): void => {
    try {
      delete memoryStore[key];
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}

    try {
      Preferences.remove({ key }).catch(() => {});
    } catch (e) {}
  },

  clear: (): void => {
    try {
      for (const k in memoryStore) {
        delete memoryStore[k];
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {}

    try {
      Preferences.clear().catch(() => {});
    } catch (e) {}
  }
};

