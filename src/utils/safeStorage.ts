/**
 * Safe Storage wrapper using Capacitor Preferences for Native iOS & Android
 * Prevents storage limits/failures and provides robust native persistence.
 */

import { Preferences } from '@capacitor/preferences';

// In-memory fallback if native storage fails
const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const { value } = await Preferences.get({ key });
      if (value !== null) {
        return value;
      }
    } catch (e) {
      console.warn('Preferences get error, falling back to memory:', e);
    }
    return memoryStore[key] || null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      memoryStore[key] = value;
      await Preferences.set({ key, value });
    } catch (e) {
      console.warn('Preferences set error:', e);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      delete memoryStore[key];
      await Preferences.remove({ key });
    } catch (e) {
      console.warn('Preferences remove error:', e);
    }
  },

  clear: async (): Promise<void> => {
    try {
      for (const k in memoryStore) {
        delete memoryStore[k];
      }
      await Preferences.clear();
    } catch (e) {
      console.warn('Preferences clear error:', e);
    }
  }
};
