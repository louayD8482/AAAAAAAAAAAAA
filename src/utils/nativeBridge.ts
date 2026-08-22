/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Geolocation } from '@capacitor/geolocation';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Share } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';

export const isNative = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';

export type HapticFeedbackType = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'selection' 
  | 'navigation' 
  | 'tasbih' 
  | 'prayer-check' 
  | 'success' 
  | 'warning' 
  | 'error';

/**
 * Native & Web Fine-Grained Haptic/Vibration Feedback Helper
 * Uses standard window.navigator.vibrate with specialized rhythmic vibration patterns
 * and falls back/enhances with Capacitor Haptics on iOS & Android hardware.
 */
export const triggerHaptic = async (type: HapticFeedbackType = 'light') => {
  // 1. Standard Web Vibration API (window.navigator.vibrate)
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      switch (type) {
        case 'tasbih':
        case 'light':
          navigator.vibrate(8);
          break;
        case 'selection':
        case 'navigation':
          navigator.vibrate(14);
          break;
        case 'prayer-check':
          navigator.vibrate([15, 30, 20]);
          break;
        case 'medium':
          navigator.vibrate(22);
          break;
        case 'heavy':
          navigator.vibrate(40);
          break;
        case 'success':
          // Celebratory triple pulse pattern
          navigator.vibrate([30, 45, 35, 45, 60]);
          break;
        case 'warning':
          navigator.vibrate([45, 60, 45]);
          break;
        case 'error':
          navigator.vibrate([60, 40, 60, 40, 80]);
          break;
        default:
          navigator.vibrate(15);
      }
    } catch {
      // Ignore vibration error on unsupported browsers/environments
    }
  }

  // 2. Hardware-level Capacitor Haptics
  if (isNative) {
    try {
      switch (type) {
        case 'tasbih':
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
        case 'prayer-check':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'navigation':
        case 'selection':
          await Haptics.selectionStart();
          await Haptics.selectionChanged();
          await Haptics.selectionEnd();
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } catch (e) {
      // Haptics not available on current hardware
    }
  }
};

/**
 * Native High Accuracy Geolocation
 */
export const getNativeLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    if (isNative) {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
          return null;
        }
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 8000, enableHighAccuracy: true }
        );
      });
    }
  } catch (err) {
    console.warn('Native geolocation failed:', err);
  }
  return null;
};

/**
 * Configure Native Status Bar for iOS & Android
 */
export const updateNativeStatusBar = async (isDark: boolean) => {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light
    });
    if (isIOS) {
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
  } catch (e) {
    // Status bar plugin handling
  }
};

/**
 * Native Share Dialog
 */
export const triggerNativeShare = async (title: string, text: string, url?: string) => {
  try {
    if (isNative) {
      await Share.share({
        title,
        text,
        url: url || 'https://noor-al-islam.app',
        dialogTitle: title
      });
      return true;
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, text, url });
      return true;
    }
  } catch (e) {
    console.warn('Share canceled or not available:', e);
  }
  return false;
};

/**
 * Native Preferences Storage Layer
 */
export const nativeStorage = {
  async get(key: string): Promise<string | null> {
    if (isNative) {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null) return value;
      } catch (e) {}
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async set(key: string, value: string): Promise<void> {
    if (isNative) {
      try {
        await Preferences.set({ key, value });
      } catch (e) {}
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
    }
  },
  async remove(key: string): Promise<void> {
    if (isNative) {
      try {
        await Preferences.remove({ key });
      } catch (e) {}
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  }
};
