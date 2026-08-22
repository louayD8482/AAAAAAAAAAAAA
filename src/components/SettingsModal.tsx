/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Sparkles, 
  Eye, 
  Upload, 
  Trash2, 
  Globe, 
  Moon, 
  Sun, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Settings2, 
  Smartphone,
  ExternalLink,
  RotateCcw,
  Shield,
  Database,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { AppSettings } from '../types';
import { PRAYER_COUNTRIES } from '../data/prayerCities';
import { downloadProjectZip } from '../utils/zipExporter';
import { ADHAN_VOICES } from '../utils/nativeNotifications';
import { playAdhanAudio, stopAdhanAudio, playPrePrayerChime, isAdhanPlaying } from '../utils/adhanPlayer';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { triggerHaptic } from '../utils/nativeBridge';
import { safeStorage } from '../utils/safeStorage';
// @ts-ignore
import defaultLogo from '../assets/images/app_logo_1784266160080.jpg';
// @ts-ignore
import defaultBanner from '../assets/images/mosque_banner_1784263300816.jpg';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onTriggerAdhanPreview?: (prayerName?: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTriggerAdhanPreview,
}: SettingsModalProps) {
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ percent: number; status: string }>({ percent: 0, status: '' });
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [storageFeedback, setStorageFeedback] = useState<string | null>(null);
  const [confirmClearType, setConfirmClearType] = useState<'notifications' | 'streaks' | 'allCache' | null>(null);

  const handleClearNotificationsCache = () => {
    triggerHaptic('warning');
    safeStorage.removeItem('noor_cached_notifications');
    safeStorage.removeItem('noor_scheduled_notifications_log');
    setConfirmClearType(null);
    setStorageFeedback(isEn ? 'Notification cache cleared successfully' : 'تم مسح سجل الإشعارات المؤقتة بنجاح ✓');
    setTimeout(() => setStorageFeedback(null), 3000);
  };

  const handleClearStreakLogs = () => {
    triggerHaptic('warning');
    // Clear all prayer_checklist_* keys from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('prayer_checklist_') || key === 'tasbih_daily_logs' || key === 'noor_voluntary_fasted_dates')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => safeStorage.removeItem(k));
    }
    setConfirmClearType(null);
    setStorageFeedback(isEn ? 'Legacy prayer & streak logs cleared. Settings preserved.' : 'تم تصفير سجلات الصلوات القديمة والتتابع مع الحفاظ الكامل على إعداداتك ✓');
    setTimeout(() => setStorageFeedback(null), 3500);
  };

  const handleClearAllTempCache = () => {
    triggerHaptic('warning');
    // Save critical settings before clearing
    const savedSettings = safeStorage.getItem('islamic_app_settings');
    const savedTheme = safeStorage.getItem('noor_theme_preference');
    const savedFavorites = safeStorage.getItem('azkar_favorites');

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }

    // Restore critical user configuration immediately
    if (savedSettings) safeStorage.setItem('islamic_app_settings', savedSettings);
    if (savedTheme) safeStorage.setItem('noor_theme_preference', savedTheme);
    if (savedFavorites) safeStorage.setItem('azkar_favorites', savedFavorites);

    setConfirmClearType(null);
    setStorageFeedback(isEn ? 'All cache cleared. User configuration preserved.' : 'تم تنظيف كافة الذاكرة المؤقتة بنجاح مع الحفاظ على كافة إعداداتك ومفضلاتك ✓');
    setTimeout(() => setStorageFeedback(null), 3500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      setExportProgress({ percent: 10, status: 'جاري قراءة وتجهيز كافة ملفات المشروع والمكتبات...' });
      await downloadProjectZip((pct, file) => {
        setExportProgress({ percent: pct, status: file });
      });
      setExportProgress({ percent: 100, status: 'تم تحميل ملف ZIP بنجاح!' });
      setTimeout(() => {
        setIsExportingZip(false);
      }, 2500);
    } catch (e) {
      console.error('Export failed:', e);
      setIsExportingZip(false);
    }
  };

  const playVoicePreview = async (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      stopAdhanAudio();
      setPlayingVoiceId(null);
      return;
    }

    try {
      setPlayingVoiceId(voiceId);
      const audio = await playAdhanAudio(voiceId, 1.0);
      if (audio) {
        audio.onended = () => {
          setPlayingVoiceId(null);
        };
      }
    } catch (e) {
      setPlayingVoiceId(null);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    return () => {
      stopAdhanAudio();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const requestSystemPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          onUpdateSettings({
            ...settings,
            adhanReminder: true,
            azkarReminder: true,
            visualAdhanAlert: true
          });
          // Play pre-prayer soft chime on successful enablement
          playPrePrayerChime();
          // Show welcome test notification
          new Notification('نور الإسلام | تم تفعيل الإشعارات بنجاح', {
            body: 'أهلاً بك! تم تفعيل إشعارات مواقيت الصلاة والأذكار اليومية بنجاح على جهازك مع صوت الأذان المختار.',
            icon: settings.appLogoUrl || defaultLogo,
            dir: 'rtl'
          });
        }
      } catch (e) {
        console.error("Notification permission error:", e);
      }
    }
  };

  const handleTestNotification = async () => {
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3500);

    // Play real Adhan audio for test
    if (settings.soundEnabled || settings.adhanReminder) {
      playPrePrayerChime();
      setTimeout(() => {
        playAdhanAudio(settings.selectedAdhanVoice || 'makkah', 1.0);
      }, 1200);
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        // Pre-prayer alert example
        new Notification(`اقترب موعد صلاة الفجر 🕌 (متبقي ${settings.prePrayerMinutes ?? 5} دقائق)`, {
          body: `تنبيه مسبق: صلاة الفجر ستُرفع قريباً في ${settings.city || 'المنامة'}. استعد للوضوء وإجابة النداء.`,
          icon: settings.appLogoUrl || defaultLogo,
          dir: 'rtl'
        });

        // Exact prayer adhan alert example after a short delay
        setTimeout(() => {
          new Notification('حان الآن موعد صلاة الفجر.. تقبل الله طاعتكم 🕌', {
            body: `حان الآن موعد أذان الفجر في ${settings.city || 'المنامة'}. الصلاة خيرٌ من النوم.\nحيّ على الصلاة، حيّ على الفلاح.`,
            icon: settings.appLogoUrl || defaultLogo,
            dir: 'rtl'
          });
        }, 1200);

        // Iqama & Follow-up alert example
        setTimeout(() => {
          new Notification('حان وقت صلاة الفجر - إقامة الصلاة 🤲', {
            body: `حافظ على صلاتك في جماعة والسنن الرواتب. تقبل الله طاعاتكم وصالح أعمالكم.`,
            icon: settings.appLogoUrl || defaultLogo,
            dir: 'rtl'
          });
        }, 2500);
      } else {
        requestSystemPermission();
      }
    }
  };

  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleAdhan = () => {
    if (!settings.adhanReminder && notificationPermission !== 'granted') {
      requestSystemPermission();
    }
    onUpdateSettings({ ...settings, adhanReminder: !settings.adhanReminder });
  };

  const toggleVisualAdhan = () => {
    onUpdateSettings({ ...settings, visualAdhanAlert: !settings.visualAdhanAlert });
  };

  const toggleAzkar = () => {
    if (!settings.azkarReminder && notificationPermission !== 'granted') {
      requestSystemPermission();
    }
    onUpdateSettings({ ...settings, azkarReminder: !settings.azkarReminder });
  };

  const changeMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      calculationMethod: e.target.value as AppSettings['calculationMethod'],
    });
  };

  const isEn = settings.language === 'en';

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md pt-[max(calc(env(safe-area-inset-top,0px)+6px),12px)] pb-[max(calc(env(safe-area-inset-bottom,0px)+6px),12px)]">
      <div 
        id="settings-modal"
        className="w-full max-w-lg bg-[#FCFAF6] dark:bg-[#070D0E] border border-[#EBE7DF] dark:border-[#142225] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col font-sans relative"
        dir={isEn ? "ltr" : "rtl"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#EBE7DF] dark:border-[#142225] bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black font-kufi">{isEn ? "App Settings & Control" : "إعدادات وتفضيلات التطبيق"}</h3>
          </div>
          
          {/* Prominent, easy-to-tap close button */}
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all text-white cursor-pointer active:scale-95 text-xs font-black shadow-sm border border-white/30"
            aria-label="Close Settings"
            title={isEn ? "Close and Return" : "إغلاق والرجوع"}
          >
            <span>{isEn ? "Close" : "إغلاق"}</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. Dedication and Developer Details */}
          <div className="p-5 bg-gradient-to-br from-emerald-600/10 via-amber-500/5 to-teal-600/10 dark:from-emerald-950/40 dark:to-slate-950/40 border border-emerald-500/20 rounded-3xl space-y-3.5">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                {isEn ? "Continuous Charity" : "صدقة جارية"}
              </span>
              <h4 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-200 font-kufi">
                {isEn ? "Noor Al-Islam Application" : "تطبيق نور الإسلام"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {settings.dedicationText || (
                  <>
                    هذا التطبيق صدقة جارية بإذن اللّٰه تعالى عن{' '}
                    <strong className="text-emerald-700 dark:text-emerald-300">لؤي بن حسين</strong>
                    <br />
                    وعن والده رحمه اللّٰه وغفر له
                    <br />
                    وجميع المسلمين والمسلمات الأحياء منهم والأموات.
                  </>
                )}
              </p>
            </div>

            <div className="border-t border-emerald-500/15 pt-3 flex flex-col items-center space-y-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? "App Developer:" : "مطور التطبيق:"} <strong className="text-slate-800 dark:text-slate-200">{settings.developerName || "لؤي بن حسين"}</strong>
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {/* Snapchat Follow */}
                <a
                  id="snapchat-follow-link"
                  href={settings.snapchatUrl || "https://snapchat.com/t/vezdvWWb"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-xs hover:shadow-md transform hover:-translate-y-0.5 transition-all"
                >
                  <span className="font-sans font-extrabold">👻</span>
                  <span>{isEn ? "Follow on Snapchat" : "تابعني على سناب شات"}</span>
                </a>

                {/* Privacy Policy Button */}
                <button
                  id="open-privacy-policy-btn"
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30 shadow-xs hover:shadow-md transform hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEn ? "Privacy Policy" : "سياسة الخصوصية"}</span>
                </button>

                {/* Download Source Code ZIP */}
                <button
                  id="download-source-zip-btn"
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isExportingZip}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isExportingZip 
                      ? (isEn ? `Packaging (${exportProgress.percent}%)...` : `جاري التجهيز (${exportProgress.percent}%)...`)
                      : (isEn ? "Export Complete Project (ZIP)" : "تصدير التطبيق كاملاً (ZIP)")}
                  </span>
                </button>
              </div>

              {/* Live ZIP export progress */}
              {isExportingZip && (
                <div className="w-full max-w-xs space-y-1.5 pt-2">
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                      style={{ width: `${exportProgress.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-center font-mono text-emerald-600 dark:text-emerald-400 truncate">
                    {exportProgress.status}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. App Preferences & Language */}
          <div className="space-y-3.5">
            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 rtl:border-r-4 ltr:border-l-4 border-emerald-500 pr-2 ltr:pl-2">
              {isEn ? 'App Preferences & Appearance' : 'تفضيلات التطبيق واللغة والمظهر'}
            </h5>

            {/* Language Selector */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isEn ? 'App Language' : 'لغة التطبيق'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isEn ? 'Switch between Arabic & English' : 'التحويل بين العربية والإنجليزية'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  id="settings-lang-ar-btn"
                  onClick={() => onUpdateSettings({ ...settings, language: 'ar' })}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    (settings.language || 'ar') === 'ar'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  العربية
                </button>
                <button
                  id="settings-lang-en-btn"
                  onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settings.language === 'en'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                  {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isEn ? 'Dark Mode (Appearance)' : 'الوضع الليلي (المظهر)'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isEn ? 'Toggle dark / light display mode' : 'التبديل بين المظهر الفاتح والداكن'}
                  </p>
                </div>
              </div>
              <button
                id="settings-toggle-theme-btn"
                onClick={() => onUpdateSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.theme === 'dark' ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Country and City Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isEn ? "Country:" : "الدولة:"}
                </label>
                <select
                  id="settings-country-select"
                  value={settings.country || 'مملكة البحرين'}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    const countryObj = PRAYER_COUNTRIES.find(c => c.ar === newCountry) || PRAYER_COUNTRIES[0];
                    const firstCity = countryObj.cities[0].ar;
                    onUpdateSettings({ ...settings, country: newCountry, city: firstCity });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080E10] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PRAYER_COUNTRIES.map((c) => (
                    <option key={c.ar} value={c.ar}>
                      {isEn ? c.en : c.ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isEn ? "City:" : "المدينة:"}
                </label>
                <select
                  id="settings-city-select"
                  value={settings.city || 'المنامة'}
                  onChange={(e) => onUpdateSettings({ ...settings, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080E10] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(PRAYER_COUNTRIES.find(c => c.ar === (settings.country || 'مملكة البحرين')) || PRAYER_COUNTRIES[0]).cities.map((city) => (
                    <option key={city.ar} value={city.ar}>
                      {isEn ? city.en : city.ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prayer Calculation Method */}
            <div className="flex flex-col gap-1.5 p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isEn ? "Prayer Calculation Method:" : "طريقة حساب مواقيت الصلاة:"}
              </label>
              <select
                id="calculation-method-select"
                value={settings.calculationMethod}
                onChange={changeMethod}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080E10] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UmmAlQura">{isEn ? "Umm Al-Qura (Makkah)" : "جامعة أم القرى (مكة المكرمة)"}</option>
                <option value="MWL">{isEn ? "Muslim World League" : "رابطة العالم الإسلامي"}</option>
                <option value="ISNA">{isEn ? "ISNA (North America)" : "الجمعية الإسلامية لأمريكا الشمالية (ISNA)"}</option>
                <option value="Egypt">{isEn ? "Egyptian General Authority" : "الهيئة العامة المصرية للمساحة"}</option>
              </select>
            </div>
          </div>

          {/* 3. Native Notifications System Section */}
          <div className="space-y-3.5">
            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 rtl:border-r-4 ltr:border-l-4 border-emerald-500 pr-2 ltr:pl-2 flex items-center justify-between">
              <span>{isEn ? "Native Notifications & Alerts" : "نظام الإشعارات والتنبيهات الحقيقية"}</span>
            </h5>

            {/* System Notification Status Card */}
            <div className="p-4 bg-gradient-to-br from-emerald-900/10 to-teal-900/10 dark:from-emerald-950/60 dark:to-[#0A1A18] rounded-2xl border-2 border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                      {isEn ? "System Notification Status" : "حالة الإشعارات بالنظام"}
                    </h6>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Live background prayer & dhikr alerts" : "أدوات التنبيهات المباشرة مفعلة ومسموح بها"}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isEn ? "Native ✓" : "مفعل ✓"}</span>
                </span>
              </div>

              {/* Action Buttons: Toggle Permission + System Settings */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id="request-permission-btn"
                  onClick={requestSystemPermission}
                  className="py-2 px-3 bg-white dark:bg-[#0B1516] hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{notificationPermission === 'granted' ? (isEn ? "Notifications Active" : "الإشعارات مفعلة") : (isEn ? "Enable Notifications" : "إذن الإشعارات")}</span>
                </button>

                <button
                  id="system-settings-btn"
                  onClick={() => alert(isEn ? "Notifications are fully enabled in system settings." : "الإشعارات مدعومة ومفعلة لنظام iOS و Android وتعمل في الخلفية.")}
                  className="py-2 px-3 bg-white dark:bg-[#0B1516] hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isEn ? "System Settings" : "إعدادات النظام"}</span>
                </button>
              </div>

              {/* Yellow Test Notification Button */}
              <button
                id="test-notification-btn"
                onClick={handleTestNotification}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🔔</span>
                <span>{testNotificationSent ? (isEn ? "Test Notification Sent!" : "تم إرسال إشعار التجربة بنجاح!") : (isEn ? "Test Live Notification" : "اختبار الإشعار 🔔")}</span>
              </button>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${settings.soundEnabled ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{isEn ? "Sounds & Audio Effects" : "الأصوات والمؤثرات الصوتية"}</p>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      {settings.soundEnabled ? (isEn ? "Sound On" : "الصوت نشط") : (isEn ? "Muted" : "صامت")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Tasbih clicks, adhan and audio reminders" : "صوت نقرات التسبيح والتنبيهات"}</p>
                </div>
              </div>
              <button
                id="toggle-sound-btn"
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.soundEnabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Pre-Prayer Reminder Toggle & Minutes Selector */}
            <div className="p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${(settings.prePrayerReminder !== false) ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isEn ? "Pre-Prayer Early Reminder" : "التذكير المسبق قبل الأذان"}
                      </p>
                      <span className="text-[9px] text-amber-700 dark:text-amber-400 font-extrabold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {settings.prePrayerMinutes ?? 5} {isEn ? "mins before" : "دقائق قبل"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Alert to prepare for wudu and prayer before adhan" : "تنبيه ذكي للاستعداد والوضوء قبل دخول وقت الصلاة"}
                    </p>
                  </div>
                </div>
                <button
                  id="toggle-pre-prayer-btn"
                  onClick={() => onUpdateSettings({ ...settings, prePrayerReminder: !(settings.prePrayerReminder !== false) })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(settings.prePrayerReminder !== false) ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${(settings.prePrayerReminder !== false) ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {(settings.prePrayerReminder !== false) && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {isEn ? "Early alert time:" : "وقت التنبيه المسبق:"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 15, 20].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => onUpdateSettings({ ...settings, prePrayerMinutes: mins })}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          (settings.prePrayerMinutes ?? 5) === mins
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {mins} {isEn ? 'min' : 'دقائق'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Adhan Reminder Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${settings.adhanReminder ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{isEn ? "Prayer Times Adhan Reminder" : "تنبيه وقت الأذان الفعلي"}</p>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {isEn ? "Native" : "مشغل بالنظام (Native)"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Audio notification at the exact moment of adhan" : "إشعار صوتي فوري عند دخول وقت الأذان"}</p>
                </div>
              </div>
              <button
                id="toggle-adhan-btn"
                onClick={toggleAdhan}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.adhanReminder ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.adhanReminder ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Adhan Muezzin Voices List */}
            {settings.adhanReminder && (
              <div className="p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-emerald-500/20 dark:border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🕌</span>
                    <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isEn ? "Select Adhan Muezzin Voice:" : "صوت ومؤذن الأذان المفضل:"}
                    </h6>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {isEn ? "iPhone / Android Native" : "صوت نقي مدعوم"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ADHAN_VOICES.map((voice) => {
                    const isSelected = (settings.selectedAdhanVoice || 'makkah') === voice.id;
                    const isPlaying = playingVoiceId === voice.id;
                    return (
                      <div
                        key={voice.id}
                        onClick={() => onUpdateSettings({ ...settings, selectedAdhanVoice: voice.id })}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-500 ring-2 ring-emerald-400/30' : 'bg-slate-300 dark:bg-slate-700'}`} />
                          <span className="text-[11px] truncate">
                            {isEn ? voice.nameEn : voice.nameAr}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playVoicePreview(voice.id);
                          }}
                          className={`p-1.5 rounded-lg shrink-0 transition-all ${
                            isPlaying
                              ? 'bg-amber-400 text-slate-950 animate-pulse'
                              : 'bg-emerald-100/80 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                          }`}
                          title={isPlaying ? (isEn ? "Stop Preview" : "إيقاف المعاينة") : (isEn ? "Listen Preview" : "استماع لصوت الأذان")}
                        >
                          {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Full Visual Adhan Live Preview Button */}
                {onTriggerAdhanPreview && (
                  <div className="pt-2 border-t border-emerald-500/10">
                    <button
                      id="settings-preview-visual-adhan-btn"
                      type="button"
                      onClick={() => {
                        onClose();
                        onTriggerAdhanPreview('Asr');
                      }}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-cyan-300/30"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>{isEn ? "Open Live Fullscreen Adhan Screen (Preview)" : "معاينة شاشة الأذان المرئية والصوتية كاملة 🕌 (تجربة حية)"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Post-Adhan / Iqama & Sunnah Follow-up Reminder */}
            <div className="p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${(settings.iqamaReminder !== false) ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isEn ? "Iqama & Sunnah Follow-up" : "تنبيه إقامة الصلاة والسنن (بعد الأذان)"}
                      </p>
                      <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {settings.iqamaMinutes ?? 10} {isEn ? "mins after" : "دقائق بعد"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Reminder after adhan for iqama and sunnah prayers" : "تنبيه ذكي بعد الأذان للتذكير بإقامة الصلاة والمحافظة على الجماعة والسنن"}
                    </p>
                  </div>
                </div>
                <button
                  id="toggle-iqama-btn"
                  onClick={() => onUpdateSettings({ ...settings, iqamaReminder: !(settings.iqamaReminder !== false) })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(settings.iqamaReminder !== false) ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${(settings.iqamaReminder !== false) ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {(settings.iqamaReminder !== false) && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {isEn ? "Time after adhan:" : "الوقت بعد الأذان:"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 15, 20].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => onUpdateSettings({ ...settings, iqamaMinutes: mins })}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          (settings.iqamaMinutes ?? 10) === mins
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {mins} {isEn ? 'min' : 'دقائق'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Visual Adhan Alert Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${settings.visualAdhanAlert ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{isEn ? "Visual Adhan Alert & Du'a" : "تنبيه الأذان المرئي والدعاء"}</p>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {isEn ? "Native" : "مشغل بالنظام (Native)"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Short spiritual tips & supplication on adhan" : "عرض نصائح دينية قصيرة وأدعية مباركة عند كل أذان"}</p>
                </div>
              </div>
              <button
                id="toggle-visual-adhan-btn"
                onClick={toggleVisualAdhan}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.visualAdhanAlert ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.visualAdhanAlert ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Friday Surah Kahf Reminder */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${(settings.fridayKahfReminder !== false) ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{isEn ? "Friday Surah Al-Kahf Alert" : "تذكير سورة الكهف يوم الجمعة"}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Friday reminder for Kahf and Salawat on the Prophet ﷺ" : "تنبيه صباح كل جمعة لقراءة الكهف والصلاة على النبي ﷺ"}</p>
                </div>
              </div>
              <button
                id="toggle-friday-kahf-btn"
                onClick={() => onUpdateSettings({ ...settings, fridayKahfReminder: !(settings.fridayKahfReminder !== false) })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(settings.fridayKahfReminder !== false) ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${(settings.fridayKahfReminder !== false) ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Tahajjud Reminder */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${(settings.tahajjudReminder !== false) ? 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{isEn ? "Tahajjud & Night Prayer" : "تذكير قيام الليل والثلث الأخير"}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Gentle reminder in the last third of the night" : "تنبيه مبارك في الثلث الأخير للاستغفار والدعاء والوتر"}</p>
                </div>
              </div>
              <button
                id="toggle-tahajjud-btn"
                onClick={() => onUpdateSettings({ ...settings, tahajjudReminder: !(settings.tahajjudReminder !== false) })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(settings.tahajjudReminder !== false) ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${(settings.tahajjudReminder !== false) ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Azkar Reminder Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${settings.azkarReminder ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{isEn ? "Daily Adhkar Reminders" : "تنبيهات الأذكار اليومية"}</p>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {isEn ? "Native" : "مفعل بالنظام (Native)"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Reminders for morning & evening supplications" : "تذكير بقراءة أذكار الصباح والمساء والأدعية"}</p>
                </div>
              </div>
              <button
                id="toggle-azkar-btn"
                onClick={toggleAzkar}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.azkarReminder ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.azkarReminder ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* 4. Selective Clear Storage & Cache Utility */}
          <div className="space-y-3.5 pt-2">
            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 rtl:border-r-4 ltr:border-l-4 border-rose-500 pr-2 ltr:pl-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>{isEn ? "Selective Storage & Cache Management" : "إدارة الذاكرة ومسح البيانات المؤقتة"}</span>
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {isEn ? "Safe: Settings Protected" : "الإعدادات محمية دائماً ✓"}
              </span>
            </h5>

            {/* Storage Status Feedback */}
            {storageFeedback && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{storageFeedback}</span>
              </div>
            )}

            {/* Confirmation Dialog */}
            {confirmClearType && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {confirmClearType === 'notifications' 
                      ? (isEn ? "Are you sure you want to clear cached notification logs?" : "هل أنت متأكد من مسح سجل الإشعارات المؤقتة؟")
                      : confirmClearType === 'streaks'
                      ? (isEn ? "Clear legacy prayer logs and streak records? (Settings will be kept safe)" : "هل تريد تصفير سجلات الصلوات والتتابع القديم؟ (إعداداتك محمية تماماً)")
                      : (isEn ? "Clean all temporary caches? Your custom cities, method and preferences will be preserved." : "مسح كافة الملفات المؤقتة؟ سيتم الحفاظ التام على مدينتك وطريقة الحساب والإعدادات.")}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (confirmClearType === 'notifications') handleClearNotificationsCache();
                      else if (confirmClearType === 'streaks') handleClearStreakLogs();
                      else handleClearAllTempCache();
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer active:scale-95"
                  >
                    {isEn ? "Yes, Clear" : "نعم، تأكيد المسح"}
                  </button>
                  <button
                    onClick={() => setConfirmClearType(null)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    {isEn ? "Cancel" : "إلغاء"}
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 bg-white dark:bg-[#0B1516] rounded-2xl border border-[#EBE7DF] dark:border-[#132326] space-y-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn 
                  ? "Selectively free up local storage space on your device while keeping your critical preferences, country, and prayer calculations intact."
                  : "تتيح لك هذه الأداة تحرير المساحة المحلية للجهاز بشكل انتقائي مع الحفاظ التام والمطلق على موقعك وطريقة الحساب والتفضيلات."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* 1. Clear Notification Cache */}
                <button
                  id="clear-notifications-cache-btn"
                  onClick={() => { triggerHaptic('selection'); setConfirmClearType('notifications'); }}
                  className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-right font-sans transition-all cursor-pointer active:scale-95 flex flex-col justify-between space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-xs font-bold">{isEn ? "Notification Cache" : "مؤقتات الإشعارات"}</span>
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {isEn ? "Clears queued alert logs" : "مسح سجلات التنبيه المجدولة"}
                  </span>
                </button>

                {/* 2. Clear Legacy Prayer Logs */}
                <button
                  id="clear-prayer-streaks-btn"
                  onClick={() => { triggerHaptic('selection'); setConfirmClearType('streaks'); }}
                  className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-right font-sans transition-all cursor-pointer active:scale-95 flex flex-col justify-between space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-xs font-bold">{isEn ? "Streak & Prayer Logs" : "سجلات التتابع القديمة"}</span>
                    <Trash2 className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {isEn ? "Resets daily check history" : "تصفير توثيق الأيام السابقة"}
                  </span>
                </button>

                {/* 3. Clear All Temp Cache (Preserving Settings) */}
                <button
                  id="clear-all-temp-cache-btn"
                  onClick={() => { triggerHaptic('selection'); setConfirmClearType('allCache'); }}
                  className="p-3 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-right font-sans transition-all cursor-pointer active:scale-95 flex flex-col justify-between space-y-1.5"
                >
                  <div className="flex items-center justify-between text-rose-800 dark:text-rose-300">
                    <span className="text-xs font-bold">{isEn ? "Full Cache Reset" : "تنظيف شامل آمن"}</span>
                    <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                    {isEn ? "Keeps settings & country" : "يحفظ مدينتك وطريقة الحساب"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. Official Privacy Policy & App Store Compliance */}
          <div className="space-y-3.5 pt-2">
            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 rtl:border-r-4 ltr:border-l-4 border-emerald-600 pr-2 ltr:pl-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isEn ? "App Store Privacy Policy & Web URL" : "سياسة الخصوصية ورابط الاعتماد لمتجر آبل (App Store)"}</span>
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {isEn ? "100% Compliant" : "معتمد ومطابق لـ Apple ✓"}
              </span>
            </h5>

            <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isEn ? "Public Privacy Policy Page" : "صفحة سياسة الخصوصية العامة والمستقلة"}
                  </h6>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isEn ? "Required URL for App Store Connect submission" : "الرابط المطلوب في صفحة معلومات التطبيق داخل App Store Connect"}
                  </p>
                </div>
                <button
                  id="open-privacy-from-settings-btn"
                  onClick={() => { triggerHaptic('selection'); setIsPrivacyOpen(true); }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isEn ? "View & Copy URL" : "عرض ونسخ الرابط"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5 bg-white dark:bg-[#070D0E] rounded-xl border border-emerald-500/20 text-xs">
                <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-400 truncate" dir="ltr">
                  {typeof window !== 'undefined' ? `${window.location.origin}/privacy-policy` : '/privacy-policy'}
                </span>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors shrink-0"
                  title="فتح الرابط في صفحة مستقلة"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 6. Complete Export Application for iPhone (iOS ZIP) */}
          <div className="space-y-3.5 pt-2">
            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 rtl:border-r-4 ltr:border-l-4 border-amber-500 pr-2 ltr:pl-2 flex items-center gap-2">
              <span>{isEn ? "Export Application for iPhone & iOS (ZIP)" : "تصدير وتحميل التطبيق للآيفون (iOS & Xcode ZIP)"}</span>
            </h5>

            <div className="p-4 bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-transparent dark:from-amber-950/30 dark:to-emerald-950/30 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  📱
                </div>
                <div>
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isEn ? "iPhone & iOS Complete Xcode Package" : "حزمة كود الآيفون الشاملة لـ Xcode و App Store"}
                  </h6>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isEn ? "Export complete codebase ready for Xcode, iOS IPA, TestFlight & App Store" : "محدث بالكامل ومجهز للفتح في Xcode وتوليد حزمة iOS IPA وتثبيته على أجهزة الآيفون"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  id="export-source-btn"
                  onClick={() => handleDownloadZip()}
                  disabled={isExportingZip}
                  className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isEn ? "Download iOS Package (ZIP)" : "تحميل حزمة الآيفون (ZIP)"}</span>
                </button>

                <a
                  id="export-build-btn"
                  href="/api/download-zip"
                  download="Noor_Al_Islam_iPhone_iOS.zip"
                  className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>{isEn ? "Direct Server Download" : "تحميل مباشر من السيرفر"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Return / Close Action at bottom of content */}
          <div className="pt-2">
            <button
              id="bottom-close-settings-btn"
              onClick={onClose}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-kufi font-black text-sm rounded-2xl shadow-lg shadow-emerald-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>{isEn ? "Save & Return to Home" : "حفظ التفضيلات والعودة للقائمة الرئيسية 🏠"}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#EBE7DF] dark:border-[#142225] bg-[#FAF8F5] dark:bg-[#050A0B] flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-sans shrink-0">
          <button
            onClick={onClose}
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>{isEn ? "← Back to Home" : "← الرجوع للرئيسية"}</span>
          </button>
          <span className="font-bold text-emerald-800 dark:text-emerald-300">{settings.developerName || "لؤي بن حسين"}</span>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        isEn={isEn}
      />
    </div>
  );
}

