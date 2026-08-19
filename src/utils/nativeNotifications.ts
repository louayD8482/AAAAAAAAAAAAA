/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AppSettings, PrayerTime } from '../types';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isIOSPlatform = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Request notification permissions across iOS, Android, and Web with native iOS handling
 */
export const requestAllPermissions = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // 1. Check existing permission
      let permStatus = await LocalNotifications.checkPermissions();
      
      // 2. Request if not yet granted
      if (permStatus.display !== 'granted') {
        permStatus = await LocalNotifications.requestPermissions();
      }

      // 3. Set up notification channels for iOS and Android
      try {
        await LocalNotifications.createChannel({
          id: 'adhan_channel',
          name: 'تنبيهات الأذان ومواقيت الصلاة',
          description: 'إشعارات الأذان المسموعة والكاملة عند دخول أوقات الصلوات الخمس',
          importance: 5, // High / Max importance for lockscreen alert
          visibility: 1, // Public visibility on lockscreen
          sound: 'adhan.wav',
          vibration: true,
          lights: true,
          lightColor: '#10b981'
        });

        await LocalNotifications.createChannel({
          id: 'azkar_channel',
          name: 'تنبيهات الأذكار والسنن',
          description: 'تذكيرات أذكار الصباح والمساء وقيام الليل وسورة الكهف',
          importance: 4,
          visibility: 1,
          sound: 'beep.wav',
          vibration: true
        });
      } catch (channelErr) {
        // Channels are Android specific; on iOS this is gracefully ignored
      }

      return permStatus.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  } catch (err) {
    console.warn('iOS / Native Notification permission request error:', err);
  }
  return false;
};

/**
 * Check current notification permission status
 */
export const checkPermissionsStatus = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'prompt';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return 'granted';
      if (Notification.permission === 'denied') return 'denied';
      return 'prompt';
    }
  } catch (err) {
    console.warn('Error checking permissions:', err);
  }
  return 'prompt';
};

/**
 * Schedule Native Background Lock-screen Push Notifications for iOS / iPhone & Android
 */
export const scheduleAllNativeNotifications = async (
  prayers: PrayerTime[],
  settings: AppSettings
) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Cancel previous scheduled notifications to avoid duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications && pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notificationsToSchedule: any[] = [];
    let notifIdCounter = 1000;

    const today = new Date();
    const preOffsetMin = settings.prePrayerMinutes ?? 5;
    const iqamaOffsetMin = settings.iqamaMinutes ?? 10;

    // Schedule for the next 7 days in advance
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);

      prayers.forEach((prayer) => {
        if (!prayer.time) return;
        const [pHour, pMin] = prayer.time.split(':').map(Number);

        // A. Pre-Prayer Alert (e.g., 5 mins before)
        if (prayer.name !== 'Sunrise' && (settings.prePrayerReminder !== false)) {
          const preTime = new Date(targetDate);
          preTime.setHours(pHour, pMin - preOffsetMin, 0, 0);

          if (preTime.getTime() > Date.now()) {
            notificationsToSchedule.push({
              id: notifIdCounter++,
              title: `اقترب موعد صلاة ${prayer.arabicName} 🕌 (متبقي ${preOffsetMin} دقائق)`,
              body: `تنبيه مسبق: صلاة ${prayer.arabicName} ستُرفع قريباً في ${settings.city}. استعد للوضوء وإجابة النداء.`,
              schedule: { at: preTime },
              sound: 'beep.wav',
              channelId: 'azkar_channel',
              smallIcon: 'ic_stat_icon',
              actionTypeId: 'PRAYER_ALERT',
              extra: { prayer: prayer.name, type: 'pre-prayer' }
            });
          }
        }

        // B. Exact Adhan Moment Alert (Lock-screen Push on iOS / iPhone)
        if (settings.adhanReminder) {
          const exactTime = new Date(targetDate);
          exactTime.setHours(pHour, pMin, 0, 0);

          if (exactTime.getTime() > Date.now()) {
            notificationsToSchedule.push({
              id: notifIdCounter++,
              title: `حان الآن موعد صلاة ${prayer.arabicName}.. تقبل الله طاعتكم 🕌`,
              body: `حان الآن موعد أذان ${prayer.arabicName} في ${settings.city}. حيّ على الصلاة، حيّ على الفلاح.`,
              schedule: { at: exactTime },
              sound: 'adhan.wav',
              channelId: 'adhan_channel',
              smallIcon: 'ic_stat_icon',
              actionTypeId: 'ADHAN_ALERT',
              extra: { prayer: prayer.name, type: 'adhan' }
            });
          }
        }

        // C. Iqama & Sunnah Follow-up (10 mins after)
        if (prayer.name !== 'Sunrise' && (settings.iqamaReminder !== false)) {
          const iqamaTime = new Date(targetDate);
          iqamaTime.setHours(pHour, pMin + iqamaOffsetMin, 0, 0);

          if (iqamaTime.getTime() > Date.now()) {
            notificationsToSchedule.push({
              id: notifIdCounter++,
              title: `حان وقت صلاة ${prayer.arabicName} - إقامة الصلاة 🤲`,
              body: `تذكير: أقيمت صلاة ${prayer.arabicName}. حافظ على صلاتك في جماعة وصلاة السنة.`,
              schedule: { at: iqamaTime },
              sound: 'beep.wav',
              channelId: 'azkar_channel',
              smallIcon: 'ic_stat_icon',
              extra: { prayer: prayer.name, type: 'iqama' }
            });
          }
        }
      });

      // D. Morning Azkar (06:30 AM)
      if (settings.azkarReminder && (settings.morningAzkarReminder !== false)) {
        const morningAzkarTime = new Date(targetDate);
        morningAzkarTime.setHours(6, 30, 0, 0);
        if (morningAzkarTime.getTime() > Date.now()) {
          notificationsToSchedule.push({
            id: notifIdCounter++,
            title: 'أذكار الصباح 🌅 (حصنك الحصين)',
            body: '«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ» - افتتح يومك بذكر الله وانعم بالبركة والحفظ.',
            schedule: { at: morningAzkarTime },
            channelId: 'azkar_channel',
            sound: 'beep.wav'
          });
        }
      }

      // E. Evening Azkar (05:00 PM)
      if (settings.azkarReminder && (settings.eveningAzkarReminder !== false)) {
        const eveningAzkarTime = new Date(targetDate);
        eveningAzkarTime.setHours(17, 0, 0, 0);
        if (eveningAzkarTime.getTime() > Date.now()) {
          notificationsToSchedule.push({
            id: notifIdCounter++,
            title: 'أذكار المساء 🌆 (سكينة وطمأنينة)',
            body: '«أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ» - حصّن نفسك وأهلك بأذكار المساء.',
            schedule: { at: eveningAzkarTime },
            channelId: 'azkar_channel',
            sound: 'beep.wav'
          });
        }
      }

      // F. Friday Surah Al-Kahf (Every Friday at 09:00 AM)
      if (targetDate.getDay() === 5 && (settings.fridayKahfReminder !== false)) {
        const fridayTime = new Date(targetDate);
        fridayTime.setHours(9, 0, 0, 0);
        if (fridayTime.getTime() > Date.now()) {
          notificationsToSchedule.push({
            id: notifIdCounter++,
            title: 'جمعة مباركة 🕌 (سورة الكهف والصلاة على النبي ﷺ)',
            body: 'نورٌ ما بين الجمعتين.. لا تنسَ قراءة سورة الكهف والإكثار من الصلاة على النبي ﷺ والدعاء في ساعة الاستجابة.',
            schedule: { at: fridayTime },
            channelId: 'azkar_channel',
            sound: 'beep.wav'
          });
        }
      }

      // G. Tahajjud & Witr (03:30 AM)
      if (settings.tahajjudReminder !== false) {
        const tahajjudTime = new Date(targetDate);
        tahajjudTime.setHours(3, 30, 0, 0);
        if (tahajjudTime.getTime() > Date.now()) {
          notificationsToSchedule.push({
            id: notifIdCounter++,
            title: 'قيام الليل والوتر 🌙 (الثلth الأخير من الليل)',
            body: 'ينزل ربنا تبارك وتعالى كل ليلة.. هل من داعٍ فأستجيب له؟ صلاة الوتر ركعة خير من الدنيا وما فيها.',
            schedule: { at: tahajjudTime },
            channelId: 'azkar_channel',
            sound: 'beep.wav'
          });
        }
      }
    }

    if (notificationsToSchedule.length > 0) {
      // iOS / Capacitor handles up to 64 local notifications simultaneously
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule.slice(0, 60)
      });
      console.log(`Successfully scheduled ${notificationsToSchedule.length} native lock-screen notifications for iOS/iPhone.`);
    }
  } catch (error) {
    console.error('Failed to schedule native notifications:', error);
  }
};
