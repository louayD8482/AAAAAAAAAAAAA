/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  BookOpen, 
  Heart, 
  Shield, 
  Compass, 
  Clock, 
  Calendar as CalendarIcon, 
  BookOpenCheck, 
  Bot, 
  Settings, 
  Info, 
  Share2, 
  Sparkles,
  ChevronRight,
  Copy,
  RotateCcw,
  Plus,
  Minus,
  Award,
  ArrowRight,
  RefreshCw,
  Play,
  Flame,
  CheckCircle2,
  Bell,
  Volume2,
  Globe,
  HardDrive,
  User,
  UserCheck,
  HeartHandshake
} from 'lucide-react';

import { AppSettings } from './types';
import { getAccuratePrayerTimes, findCountryAndCity } from './data/prayerCities';
import { formatTime12 } from './utils/formatTime';
import SettingsModal from './components/SettingsModal';
import QuranSection from './components/QuranSection';
import TasbihSection from './components/TasbihSection';
import AzkarSection from './components/AzkarSection';
import QiblaSection from './components/QiblaSection';
import PrayerTimesSection from './components/PrayerTimesSection';
import KhatmaSection from './components/KhatmaSection';
import HadithSection from './components/HadithSection';
import AIChatSection from './components/AIChatSection';
import RuqyahSection from './components/RuqyahSection';
import VisualAdhanModal from './components/VisualAdhanModal';
import VerseOfTheDay from './components/VerseOfTheDay';
import ProfileSection from './components/ProfileSection';
import EhsanIslamicPlatformSection from './components/EhsanIslamicPlatformSection';
import WelcomeSplashScreen from './components/WelcomeSplashScreen';
import { ISLAMIC_AVATARS } from './assets/avatars';
import { requestAllPermissions, scheduleAllNativeNotifications } from './utils/nativeNotifications';

// @ts-ignore
import defaultLogo from './assets/images/app_logo_avatar_1787082876013.jpg';
// @ts-ignore
import defaultBanner from './assets/images/mosque_banner_1784263300816.jpg';

// Rich spiritual information for each prayer time alert
const PRAYERS_INFO = {
  Fajr: {
    arabicName: 'الفجر',
    supplication: 'اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً. اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.',
    tip: 'صلاة الفجر تشهدها ملائكة الليل وملائكة النهار، واحرص على أدائها في وقتها لتكون في ذمة الله عز وجل طوال يومك.'
  },
  Dhuhr: {
    arabicName: 'الظهر',
    supplication: 'اللهم إني أعوذ بك من العجز والكسل، والجبن والهرم والبخل. اللهم اغفر لي خطيئتي وجهلي وإسرافي في أمري.',
    tip: 'صلاة الظهر هي أول صلاة صلاها جبريل بالنبي ﷺ، فاجعلها محطة لتجديد نشاطك الروحي والبدني في منتصف يومك.'
  },
  Asr: {
    arabicName: 'العصر',
    supplication: 'يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.',
    tip: 'صلاة العصر هي الصلاة الوسطى التي خصها الله تعالى بالذكر في القرآن الكريم، فاحرص عليها لئلا يحبط عملك.'
  },
  Maghrib: {
    arabicName: 'المغرب',
    supplication: 'اللهم هذا إقبال ليلك وإدبار نهارك وأصوات دعاتك فاغفر لي. لا إله إلا الله وحده لا شريك له.',
    tip: 'صلاة المغرب هي وتر النهار، والوقت بعد صلاة المغرب من الأوقات المباركة، فاغتنمها في تلاوة القرآن وذكر الله.'
  },
  Isha: {
    arabicName: 'العشاء',
    supplication: 'اللهم رب السماوات ورب الأرض ورب العرش العظيم، ربنا ورب كل شيء، فالق الحب والنوى، ومنزل التوراة والإنجيل والفرقان.',
    tip: 'صلاة العشاء والصبح في جماعة تعدلان قيام الليل، فاحرص عليهما لتبيت ليلتك آمناً في كنف الرحمن سبحانه.'
  },
  Sunrise: {
    arabicName: 'الشروق',
    supplication: 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور. أصبحنا وأصبح الملك لله والحمد لله.',
    tip: 'أشرقت الشمس فصلاة الضحى تبدأ بعد الشروق بقرابة ربع ساعة، وهي صلاة الأوابين وتعدل صدقة عن كل مفصل من مفاصل جسدك.'
  }
};

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showWelcomeSplash, setShowWelcomeSplash] = useState<boolean>(() => {
    try {
      return localStorage.getItem('noor_hide_welcome_splash') !== 'true';
    } catch {
      return true;
    }
  });
  const [activeAdhanAlert, setActiveAdhanAlert] = useState<{
    prayerName: string;
    arabicName: string;
    time: string;
    city: string;
    supplication: string;
    tip: string;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('noor_settings');
    const defaults = {
      theme: 'light',
      calculationMethod: 'UmmAlQura',
      latitude: null,
      longitude: null,
      country: 'مملكة البحرين',
      city: 'المنامة',
      adhanReminder: true,
      visualAdhanAlert: true,
      azkarReminder: true,
      soundEnabled: true,
      customAdhanSound: 'default',
      appName: 'نور الإسلام',
      dedicationText: 'صدقة جارية بإذن الله عن لؤي بن حسين وعن والده رحمه الله وغفر له وجميع المسلمين والمسلمات الأحياء منهم والأموات.',
      developerName: 'لؤي بن حسين',
      snapchatUrl: 'https://snapchat.com/t/vezdvWWb',
      appLogoUrl: defaultLogo,
      headerBgUrl: defaultBanner
    };
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let modified = false;
        // Clean up old or invalid asset URLs from previous builds
        if (parsed.appLogoUrl && (parsed.appLogoUrl.includes('/src/assets/') || parsed.appLogoUrl.includes('1784263255295'))) {
          parsed.appLogoUrl = defaultLogo;
          modified = true;
        }
        if (parsed.headerBgUrl && (parsed.headerBgUrl.includes('/src/assets/') || parsed.headerBgUrl.includes('1784263300816'))) {
          parsed.headerBgUrl = defaultBanner;
          modified = true;
        }
        const finalSettings = { ...defaults, ...parsed };
        if (modified) {
          localStorage.setItem('noor_settings', JSON.stringify(finalSettings));
        }
        return finalSettings;
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  // Track the clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Daily Azkar background reminders checker
  useEffect(() => {
    const triggeredKey = 'noor_triggered_reminders';
    
    const checkReminders = () => {
      // Check if global settings for Azkar reminders are enabled
      if (!settings.azkarReminder) return;

      // Check browser notification support and permission
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const stored = localStorage.getItem('noor_azkar_reminders');
      let reminders = [];
      if (stored) {
        try {
          reminders = JSON.parse(stored);
        } catch (e) {
          reminders = [];
        }
      } else {
        reminders = [
          { id: 'morning', name: 'أذكار الصباح', time: '07:00', enabled: true },
          { id: 'evening', name: 'أذكار المساء', time: '16:30', enabled: true },
          { id: 'sleep', name: 'أذكار النوم', time: '22:00', enabled: true },
          { id: 'wakeup', name: 'أذكار الاستيقاظ', time: '05:30', enabled: false }
        ];
        localStorage.setItem('noor_azkar_reminders', JSON.stringify(reminders));
      }

      const now = new Date();
      // Format current local time to HH:MM (e.g. "07:00")
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hours}:${minutes}`;
      const todayStr = now.toISOString().substring(0, 10); // "YYYY-MM-DD"

      // Load already triggered list
      const triggeredStored = localStorage.getItem(triggeredKey);
      let triggeredList: string[] = [];
      if (triggeredStored) {
        try {
          triggeredList = JSON.parse(triggeredStored);
        } catch (e) {
          triggeredList = [];
        }
      }

      // Filter and clean old items (older than today)
      triggeredList = triggeredList.filter(item => item.startsWith(todayStr));

      reminders.forEach((rem: any) => {
        if (rem.enabled && rem.time === currentHHMM) {
          const uniqueTriggerId = `${todayStr}-${rem.id}-${rem.time}`;
          if (!triggeredList.includes(uniqueTriggerId)) {
            let bodyText = '';
            if (rem.id === 'morning') {
              bodyText = 'حان الآن وقت قراءة أذكار الصباح، حفظكم الله ورعاكم من كل سوء.';
            } else if (rem.id === 'evening') {
              bodyText = 'حان الآن وقت قراءة أذكار المساء، تقبل الله منا ومنكم صالح الأعمال.';
            } else if (rem.id === 'sleep') {
              bodyText = 'حان وقت أذكار النوم لنوم مبارك وهانئ وحفظ من الله عز وجل.';
            } else if (rem.id === 'wakeup') {
              bodyText = 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور. حان وقت أذكار الاستيقاظ.';
            } else {
              bodyText = `حان الآن موعد قراءة ${rem.name}.`;
            }

            try {
              new Notification(rem.name, {
                body: bodyText,
                icon: '/src/assets/images/app_logo_1784263255295.jpg',
                dir: 'rtl'
              });
            } catch (err) {
              console.error('Failed to display browser notification:', err);
            }

            // Append to triggered list to prevent duplicate triggers in the same minute
            triggeredList.push(uniqueTriggerId);
            localStorage.setItem(triggeredKey, JSON.stringify(triggeredList));
          }
        }
      });
    };

    // Run check immediately and then every 15 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [settings.azkarReminder]);

  // Request native mobile & browser notification permissions and schedule lock-screen alerts
  useEffect(() => {
    requestAllPermissions().then((granted) => {
      if (granted) {
        getAccuratePrayerTimes(
          settings.country || 'مملكة البحرين',
          settings.city || 'المنامة',
          settings.calculationMethod
        ).then(res => {
          const prayers = [
            { name: 'Fajr', arabicName: 'الفجر', time: res.times.Fajr, isPassed: false, isNext: false },
            { name: 'Sunrise', arabicName: 'الشروق', time: res.times.Sunrise, isPassed: false, isNext: false },
            { name: 'Dhuhr', arabicName: 'الظهر', time: res.times.Dhuhr, isPassed: false, isNext: false },
            { name: 'Asr', arabicName: 'العصر', time: res.times.Asr, isPassed: false, isNext: false },
            { name: 'Maghrib', arabicName: 'المغرب', time: res.times.Maghrib, isPassed: false, isNext: false },
            { name: 'Isha', arabicName: 'العشاء', time: res.times.Isha, isPassed: false, isNext: false },
          ];
          scheduleAllNativeNotifications(prayers, settings);
        }).catch(err => console.warn(err));
      }
    });
  }, [settings.city, settings.adhanReminder, settings.azkarReminder, settings.prePrayerReminder, settings.iqamaReminder, settings.fridayKahfReminder, settings.tahajjudReminder]);

  // Daily Adhan & Prayer Times background checker
  useEffect(() => {
    const triggeredKey = 'noor_triggered_adhan';
    
    const checkPrayerTimes = async () => {
      // Check if global settings for prayer notifications are enabled
      if (!settings.visualAdhanAlert && !settings.adhanReminder) return;

      const res = await getAccuratePrayerTimes(
        settings.country || 'مملكة البحرين',
        settings.city || 'المنامة',
        settings.calculationMethod
      );
      const times = res.times;

      const computedPrayers = [
        { name: 'Fajr', arabicName: 'الفجر', time: times.Fajr },
        { name: 'Sunrise', arabicName: 'الشروق', time: times.Sunrise },
        { name: 'Dhuhr', arabicName: 'الظهر', time: times.Dhuhr },
        { name: 'Asr', arabicName: 'العصر', time: times.Asr },
        { name: 'Maghrib', arabicName: 'المغرب', time: times.Maghrib },
        { name: 'Isha', arabicName: 'العشاء', time: times.Isha },
      ];

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hours}:${minutes}`;
      const todayStr = now.toISOString().substring(0, 10); // "YYYY-MM-DD"
      const preMinOffset = settings.prePrayerMinutes ?? 5;

      // Load already triggered list
      const triggeredStored = localStorage.getItem(triggeredKey);
      let triggeredList: string[] = [];
      if (triggeredStored) {
        try {
          triggeredList = JSON.parse(triggeredStored);
        } catch (e) {
          triggeredList = [];
        }
      }

      // Filter and clean old items (older than today)
      triggeredList = triggeredList.filter(item => item.startsWith(todayStr));

      // 1. Check Friday Kahf Reminder (Every Friday at 10:30 AM)
      if (now.getDay() === 5 && currentHHMM === '10:30' && settings.fridayKahfReminder !== false) {
        const fridayTriggerId = `${todayStr}-friday-kahf`;
        if (!triggeredList.includes(fridayTriggerId)) {
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('جمعة مباركة 🕌', {
                body: 'لا تنس قراءة سورة الكهف والإكثار من الصلاة على النبي ﷺ والتحري لساعة الاستجابة.',
                icon: settings.appLogoUrl || '/src/assets/images/app_logo_1784263255295.jpg',
                dir: 'rtl'
              });
            } catch (err) {}
          }
          triggeredList.push(fridayTriggerId);
          localStorage.setItem(triggeredKey, JSON.stringify(triggeredList));
        }
      }

      // 2. Check Tahajjud Reminder (Every day at 03:30 AM)
      if (currentHHMM === '03:30' && settings.tahajjudReminder !== false) {
        const tahajjudTriggerId = `${todayStr}-tahajjud`;
        if (!triggeredList.includes(tahajjudTriggerId)) {
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('الثلث الأخير من الليل 🌙', {
                body: 'وقت النزول الإلهي واستجابة الدعوات.. طوبى لمن قام وركع واستغفر بالأسحار.',
                icon: settings.appLogoUrl || '/src/assets/images/app_logo_1784263255295.jpg',
                dir: 'rtl'
              });
            } catch (err) {}
          }
          triggeredList.push(tahajjudTriggerId);
          localStorage.setItem(triggeredKey, JSON.stringify(triggeredList));
        }
      }

      computedPrayers.forEach((p) => {
        const [pHour, pMin] = p.time.split(':').map(Number);
        
        // A. Check Pre-Prayer Reminder (e.g. 5 minutes before prayer)
        if (p.name !== 'Sunrise' && (settings.prePrayerReminder !== false)) {
          let preTotalMin = pHour * 60 + pMin - preMinOffset;
          if (preTotalMin < 0) preTotalMin += 24 * 60;
          const preH = Math.floor(preTotalMin / 60);
          const preM = preTotalMin % 60;
          const preHHMM = `${String(preH).padStart(2, '0')}:${String(preM).padStart(2, '0')}`;

          if (currentHHMM === preHHMM) {
            const preTriggerId = `${todayStr}-pre-${p.name}-${preMinOffset}min`;
            if (!triggeredList.includes(preTriggerId)) {
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`اقترب موعد صلاة ${p.arabicName} 🕌 (متبقي ${preMinOffset} دقائق)`, {
                    body: `تنبيه مسبق: صلاة ${p.arabicName} ستُرفع عند الساعة ${formatTime12(p.time, false)}. استعد للوضوء وإجابة النداء.`,
                    icon: settings.appLogoUrl || '/src/assets/images/app_logo_1784263255295.jpg',
                    dir: 'rtl'
                  });
                } catch (err) {}
              }
              triggeredList.push(preTriggerId);
              localStorage.setItem(triggeredKey, JSON.stringify(triggeredList));
            }
          }
        }

        // B. Check Exact Prayer Time (Adhan Moment)
        if (p.time === currentHHMM) {
          const uniqueTriggerId = `${todayStr}-${p.name}-${p.time}`;
          if (!triggeredList.includes(uniqueTriggerId)) {
            const info = PRAYERS_INFO[p.name as keyof typeof PRAYERS_INFO];
            
            // Browser Background notification (Adhan Reminder)
            if (settings.adhanReminder) {
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`حان الآن موعد صلاة ${p.arabicName}.. تقبل الله طاعتكم 🕌`, {
                    body: `حان الآن موعد صلاة ${p.arabicName} في ${settings.city} عند الساعة ${formatTime12(p.time, false)}.\nحيّ على الصلاة، حيّ على الفلاح.\n\nالدعاء المأثور: ${info?.supplication || ''}`,
                    icon: settings.appLogoUrl || '/src/assets/images/app_logo_1784263255295.jpg',
                    dir: 'rtl'
                  });
                } catch (err) {
                  console.error('Failed to display browser notification:', err);
                }
              }
            }

            // In-App Visual Alert popup (Visual Adhan Alert)
            if (settings.visualAdhanAlert) {
              setActiveAdhanAlert({
                prayerName: p.name,
                arabicName: p.arabicName,
                time: p.time,
                city: settings.city,
                supplication: info?.supplication || '',
                tip: info?.tip || ''
              });
            }

            // Append to triggered list to prevent duplicate triggers in the same minute
            triggeredList.push(uniqueTriggerId);
            localStorage.setItem(triggeredKey, JSON.stringify(triggeredList));
          }
        }

        // C. Check Post-Adhan / Iqama & Sunnah Follow-up Reminder (e.g. 10 minutes after adhan)
        if (p.name !== 'Sunrise' && (settings.iqamaReminder !== false)) {
          const iqamaOffset = settings.iqamaMinutes ?? 10;
          let postTotalMin = pHour * 60 + pMin + iqamaOffset;
          if (postTotalMin >= 24 * 60) postTotalMin -= 24 * 60;
          const postH = Math.floor(postTotalMin / 60);
          const postM = postTotalMin % 60;
          const postHHMM = `${String(postH).padStart(2, '0')}:${String(postM).padStart(2, '0')}`;

          if (currentHHMM === postHHMM) {
            const postTriggerId = `${todayStr}-post-iqama-${p.name}-${iqamaOffset}min`;
            if (!triggeredList.includes(postTriggerId)) {
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`حان وقت صلاة ${p.arabicName} - إقامة الصلاة 🤲`, {
                    body: `تذكير: أقيمت صلاة ${p.arabicName}. حافظ على صلاتك في جماعة ولا تنسَ السنن الرواتب وأذكار ما بعد الصلاة.`,
                    icon: settings.appLogoUrl || '/src/assets/images/app_logo_1784263255295.jpg',
                    dir: 'rtl'
                  });
                } catch (err) {}
              }
              triggeredList.push(postTriggerId);
              localStorage.setItem(triggeredKey, JSON.stringify(triggeredList));
            }
          }
        }
      });
    };

    // Run check immediately and then every 15 seconds
    checkPrayerTimes();
    const interval = setInterval(checkPrayerTimes, 15000);
    return () => clearInterval(interval);
  }, [settings.visualAdhanAlert, settings.adhanReminder, settings.prePrayerReminder, settings.prePrayerMinutes, settings.iqamaReminder, settings.iqamaMinutes, settings.fridayKahfReminder, settings.tahajjudReminder, settings.city]);

  // Sync settings and apply dark theme
  useEffect(() => {
    localStorage.setItem('noor_settings', JSON.stringify(settings));
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const toggleLanguage = () => {
    setSettings(prev => ({
      ...prev,
      language: prev.language === 'en' ? 'ar' : 'en'
    }));
  };

  const getHijriDate = () => {
    try {
      const locale = settings.language === 'en' ? 'en-US-u-ca-islamic-umalqura' : 'ar-SA-u-ca-islamic-umalqura';
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date());
    } catch (e) {
      return settings.language === 'en' ? '25 Rajab 1447 AH' : '٢٥ رجب ١٤٤٧ هـ';
    }
  };

  const getGregorianDate = () => {
    const locale = settings.language === 'en' ? 'en-US' : 'ar-SA';
    return new Date().toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Persisted Daily Worship Tracker
  const [dailyPrayers, setDailyPrayers] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('noor_daily_prayers_checked');
    const todayStr = new Date().toISOString().substring(0, 10);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) {
          return parsed.prayers;
        }
      } catch (e) {}
    }
    return {
      Fajr: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false,
      Duha: false,
      Witr: false,
      AzkarSabah: false,
      AzkarMasaa: false
    };
  });

  // Daily open streak counter
  const [streakDays, setStreakDays] = useState<number>(1);

  // Quick electronic Tasbih state
  const [quickTasbihCount, setQuickTasbihCount] = useState<number>(() => {
    const saved = localStorage.getItem('noor_quick_tasbih_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [quickTasbihText, setQuickTasbihText] = useState<string>('سبحان الله وبحمده');

  // Random Inspirations Box
  const CURATED_INSPIRATIONS = [
    { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ref: "سورة الرعد • الآية ٢٨", type: "قرآن" },
    { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", ref: "سورة الشرح • الآية ٦", type: "قرآن" },
    { text: "فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ", ref: "سورة البقرة • الآية ١٨٦", type: "قرآن" },
    { text: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", ref: "سورة الضحى • الآية ٥", type: "قرآن" },
    { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", ref: "سورة الطلاق • الآيات ٢-٣", type: "قرآن" },
    { text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", ref: "سورة البقرة • الآية ١٥٣", type: "قرآن" },
    { text: "ادْعُونِي أَسْتَجِبْ لَكُمْ", ref: "سورة غافر • الآية ٦٠", type: "قرآن" },
    { text: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", ref: "سورة الضحى • الآية ٣", type: "قرآن" },
    { text: "احفظ الله يحفظك، احفظ الله تجده تجاهك", ref: "الحديث الشريف • رواه الترمذي", type: "حديث" },
    { text: "عجبًا لأمر المؤمن إن أمره كله خير، وليس ذاك لأحد إلا للمؤمن", ref: "الحديث الشريف • رواه مسلم", type: "حديث" }
  ];
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Daily open streak counter effect
  useEffect(() => {
    const lastOpen = localStorage.getItem('noor_last_open_date');
    const todayStr = new Date().toISOString().substring(0, 10);
    const currentStreak = localStorage.getItem('noor_streak_count');
    let streak = currentStreak ? parseInt(currentStreak, 10) : 1;
    
    if (lastOpen) {
      if (lastOpen !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().substring(0, 10);
        if (lastOpen === yesterdayStr) {
          streak += 1;
        } else {
          streak = 1;
        }
        localStorage.setItem('noor_streak_count', streak.toString());
        localStorage.setItem('noor_last_open_date', todayStr);
      }
    } else {
      localStorage.setItem('noor_last_open_date', todayStr);
      localStorage.setItem('noor_streak_count', '1');
    }
    setStreakDays(streak);
  }, []);

  // Toggle daily prayer item
  const toggleDailyPrayer = (key: string) => {
    const updated = { ...dailyPrayers, [key]: !dailyPrayers[key] };
    setDailyPrayers(updated);
    const todayStr = new Date().toISOString().substring(0, 10);
    localStorage.setItem('noor_daily_prayers_checked', JSON.stringify({ date: todayStr, prayers: updated }));
  };

  // Increment quick electronic tasbih
  const incrementQuickTasbih = () => {
    const newCount = quickTasbihCount + 1;
    setQuickTasbihCount(newCount);
    localStorage.setItem('noor_quick_tasbih_count', newCount.toString());
    
    // Add physical vibration feedback on every click
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    if (settings.soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(960, ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        }
      } catch (e) {}
    }
  };

  const resetQuickTasbih = () => {
    setQuickTasbihCount(0);
    localStorage.setItem('noor_quick_tasbih_count', '0');
  };

  const handleShareApp = async () => {
    const shareData = {
      title: settings.appName || (isEn ? 'Noor Al-Islam App' : 'تطبيق نور الإسلام'),
      text: isEn 
        ? 'Noor Al-Islam: Comprehensive Islamic companion (Quran, Adhkar, Prayer Times, Tasbih, Ruqyah)' 
        : 'تطبيق نور الإسلام: رفيقك الروحي الشامل (القرآن، الأذكار، مواقيت الصلاة، التسبيح، الرقية الشرعية)',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // user canceled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (e) {
      // fallback
    }
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3500);
  };

  const isEn = settings.language === 'en';

  // Dynamic Greeting Text
  const getDynamicGreeting = () => {
    const hrs = currentTime.getHours();
    if (isEn) {
      if (hrs < 12) return 'Morning of serenity and remembrance ☀️';
      if (hrs < 18) return 'Evening of forgiveness and gratitude 🌤️';
      return 'Blessed night adorned with remembrance 🌙';
    }
    if (hrs < 12) return 'صباح السكينة وطمأنينة الذكر ☀️';
    if (hrs < 18) return 'مساء الغفران والرضوان والشكر 🌤️';
    return 'ليل مبارك معطر بذكر اللّٰه 🌙';
  };

  // Cycle quote wheel
  const cycleQuote = () => {
    setQuoteIndex(prev => (prev + 1) % CURATED_INSPIRATIONS.length);
  };

  // Calculate Next Prayer countdown
  const getNextPrayerInfo = () => {
    const { city } = findCountryAndCity(settings.country, settings.city);
    const base = city.baseTimes;
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const seasonalShift = Math.round(20 * Math.sin((dayOfYear + 80) * 2 * Math.PI / 365));

    const formatAndShift = (timeStr: string, shiftMins: number) => {
      const [hStr, mStr] = timeStr.split(':');
      let h = parseInt(hStr);
      let m = parseInt(mStr) + shiftMins;
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      } else if (m < 0) {
        h -= Math.ceil(Math.abs(m) / 60);
        m = 60 - (Math.abs(m) % 60);
      }
      h = (h + 24) % 24;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const computedPrayers = [
      { name: 'Fajr', arabic: isEn ? 'Fajr' : 'الفجر', time: formatAndShift(base.Fajr, seasonalShift) },
      { name: 'Sunrise', arabic: isEn ? 'Sunrise' : 'الشروق', time: formatAndShift(base.Sunrise, seasonalShift - 5) },
      { name: 'Dhuhr', arabic: isEn ? 'Dhuhr' : 'الظهر', time: formatAndShift(base.Dhuhr, seasonalShift + 3) },
      { name: 'Asr', arabic: isEn ? 'Asr' : 'العصر', time: formatAndShift(base.Asr, seasonalShift + 8) },
      { name: 'Maghrib', arabic: isEn ? 'Maghrib' : 'المغرب', time: formatAndShift(base.Maghrib, seasonalShift + 2) },
      { name: 'Isha', arabic: isEn ? 'Isha' : 'العشاء', time: formatAndShift(base.Isha, seasonalShift + 1) },
    ];

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let nextPrayer = computedPrayers[0];
    let minDiff = 24 * 60;

    for (const p of computedPrayers) {
      const [hStr, mStr] = p.time.split(':');
      const pMins = parseInt(hStr) * 60 + parseInt(mStr);
      let d = pMins - currentMins;
      if (d < 0) {
        d += 24 * 60;
      }
      if (d < minDiff) {
        minDiff = d;
        nextPrayer = p;
      }
    }

    const remHours = Math.floor(minDiff / 60);
    const remMins = minDiff % 60;
    
    return {
      nextPrayer,
      remHours,
      remMins,
      computedPrayers
    };
  };

  const { nextPrayer, remHours, remMins } = getNextPrayerInfo();

  // Sections definitions for vertical layout
  const sections = [
    {
      id: 'quran',
      title: isEn ? 'Holy Quran & Tafsir' : 'القرآن الكريم وتفسيره',
      desc: isEn ? 'Complete Holy Quran with audio recitation and easy Tafsir' : 'المصحف الشريف كاملاً بآياته والتفاسير الميسرة',
      icon: <BookOpen className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.quran,
      colorClass: 'from-emerald-600 to-teal-500',
      bgLight: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
      component: <QuranSection isEn={isEn} />
    },
    {
      id: 'tasbih',
      title: isEn ? 'Smart Digital Tasbih' : 'التسبيح الإلكتروني الذكي',
      desc: isEn ? 'Counter for Dhikr & Istighfar with custom goals & stats' : 'عداد للاستغفار والأذكار مع أهداف مخصصة وسجل كلي',
      icon: <Heart className="w-5 h-5 fill-current" />,
      avatarUrl: ISLAMIC_AVATARS.tasbih,
      colorClass: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
      component: <TasbihSection soundEnabled={settings.soundEnabled} isEn={isEn} />
    },
    {
      id: 'azkar',
      title: isEn ? 'Hisn al-Muslim Adhkar' : 'أذكار حصن المسلم الشاملة',
      desc: isEn ? 'Morning & Evening adhkar, sleep, prayer & protective supplications' : 'أذكار الصباح والمساء، النوم، الصلاة، التسابيح والرقى',
      icon: <Shield className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.azkar,
      colorClass: 'from-emerald-700 to-emerald-600',
      bgLight: 'bg-emerald-700/10 text-emerald-900 border-emerald-700/20',
      component: <AzkarSection soundEnabled={settings.soundEnabled} isEn={isEn} />
    },
    {
      id: 'prayer-times',
      title: isEn ? 'Prayer Times & Tracker' : 'مواقيت الصلاة والتتبع',
      desc: isEn ? 'Accurate prayer schedules with daily prayer commitment checklist' : 'حساب دقيق لأوقات الصلاة مع تتبع التزام الصلوات يومياً',
      icon: <Clock className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.prayer,
      colorClass: 'from-sky-600 to-indigo-600',
      bgLight: 'bg-sky-500/10 text-sky-800 border-sky-500/20',
      component: <PrayerTimesSection settings={settings} onUpdateSettings={handleUpdateSettings} isEn={isEn} />
    },
    {
      id: 'khatma',
      title: isEn ? 'Khatma Planner' : 'مُخطط الختمة والورد اليومي',
      desc: isEn ? 'Plan your Quran completion reading goal with interactive progress' : 'صمم خطتك لتكمل قراءة القرآن الكريم مع تقدم تفاعلي',
      icon: <BookOpenCheck className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.khatma,
      colorClass: 'from-purple-600 to-violet-600',
      bgLight: 'bg-purple-500/10 text-purple-800 border-purple-500/20',
      component: <KhatmaSection isEn={isEn} />
    },
    {
      id: 'hadith',
      title: isEn ? 'Prophetic Hadiths' : 'الأحاديث النبوية الشريفة',
      desc: isEn ? 'Riyadh as-Salihin and authentic Hadith selections' : 'رياض الصالحين والأحاديث المختارة من البخاري ومسلم',
      icon: <BookOpen className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.hadith,
      colorClass: 'from-teal-600 to-emerald-500',
      bgLight: 'bg-teal-500/10 text-teal-800 border-teal-500/20',
      component: <HadithSection isEn={isEn} />
    },
    {
      id: 'ruqyah',
      title: isEn ? 'Authentic Ruqyah' : 'الرقية الشرعية المطهرة',
      desc: isEn ? 'Verses & supplications for spiritual healing with audio player' : 'آيات وأدعية التحصين من الكتاب والسنة مع مشغل صوتي مريح',
      icon: <Shield className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.ruqyah,
      colorClass: 'from-teal-750 to-emerald-800',
      bgLight: 'bg-teal-750/10 text-teal-950 border-teal-750/20',
      component: <RuqyahSection isEn={isEn} />
    },
    {
      id: 'qibla',
      title: isEn ? 'Qibla Finder' : 'محدد اتجاه القبلة التفاعلي',
      desc: isEn ? 'Interactive Kaaba compass direction with precise alignment' : 'بوصلة الكعبة المشرفة بمحاذاة دقيقة ومحاكاة يدوية',
      icon: <Compass className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.qibla,
      colorClass: 'from-yellow-600 to-amber-500',
      bgLight: 'bg-yellow-500/10 text-yellow-800 border-yellow-500/20',
      component: <QiblaSection latitude={settings.latitude} longitude={settings.longitude} isEn={isEn} />
    },
    {
      id: 'profile',
      title: isEn ? 'Personal Profile & Analytics' : 'الملف الشخصي والبيانات الشاملة',
      desc: isEn ? 'Personal worship analytics, fasting tracker, badges and all-time tasbih count' : 'إحصائيات العبادة، تتبع الصيام التطوعي، سجل التسبيح والأوسمة الإيمانية',
      icon: <User className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.profile,
      colorClass: 'from-emerald-800 to-teal-700',
      bgLight: 'bg-emerald-800/10 text-emerald-950 border-emerald-800/20',
      component: <ProfileSection settings={settings} isEn={isEn} onNavigateSection={(sec) => setActiveSection(sec)} />
    },
    {
      id: 'ehsan-charity',
      title: isEn ? 'Ehsan Charity Platform' : 'منصة إحسان الخيرية',
      desc: isEn ? 'Official portal for charity donations, 2-minute spiritual audios & daily reflections' : 'بوابة البر والعمل الخيري المعتمدة، دقيقتان لآخرتك، ورسائل إيمانية متجددة',
      icon: <HeartHandshake className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.charity,
      colorClass: 'from-emerald-700 to-teal-800',
      bgLight: 'bg-emerald-600/10 text-emerald-900 border-emerald-600/20',
      component: <EhsanIslamicPlatformSection settings={settings} isEn={isEn} />
    },
    {
      id: 'ai-assistant',
      title: isEn ? 'AI Islamic Assistant' : 'مستشار نور الإسلام الذكي',
      desc: isEn ? 'Ask Islamic questions, worship guidance & supplications with AI' : 'اسأل عن العبادات، الفتاوى التعليمية والأدعية بالذكاء الاصطناعي',
      icon: <Bot className="w-5 h-5" />,
      avatarUrl: ISLAMIC_AVATARS.ai,
      colorClass: 'from-emerald-800 to-teal-900',
      bgLight: 'bg-emerald-900/10 text-emerald-950 border-emerald-900/20',
      component: <AIChatSection isEn={isEn} />
    }
  ];

  const currentActiveComponent = sections.find(s => s.id === activeSection)?.component || null;

  return (
    <div 
      id="app-root-container"
      className="min-h-screen bg-[#FCFAF6] dark:bg-[#070D0E] text-slate-800 dark:text-[#E2EAEB] transition-colors duration-500 flex flex-col font-sans islamic-pattern"
      dir={isEn ? "ltr" : "rtl"}
    >
      {/* Main Premium App Bar with iOS Native Safe-Area */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#080E10]/90 backdrop-blur-md border-b border-[#EBE7DF] dark:border-[#142225] px-3 sm:px-8 py-2.5 flex items-center justify-between shadow-xs pt-[env(safe-area-inset-top,0px)] min-h-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        
        {/* Title and Logo */}
        <div 
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all group"
          title={isEn ? "Return to main menu" : "العودة للقائمة الرئيسية"}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-700/10 overflow-hidden border border-emerald-500/30 group-hover:rotate-6 transition-all duration-300 shrink-0 bg-emerald-950">
            <img 
              src={settings.appLogoUrl || ISLAMIC_AVATARS.appLogo} 
              alt="Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-emerald-950 dark:text-emerald-300 font-kufi tracking-tight leading-tight">
              {settings.appName || (isEn ? "Noor Al-Islam" : "نور الإسلام")}
            </h1>
          </div>
        </div>

        {/* Dynamic Hijri & Gregorian clock display (Hidden on extra small screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center bg-[#F4EFE6]/60 dark:bg-[#0C1517] px-4 py-1.5 rounded-2xl border border-[#E9E1D2]/50 dark:border-[#1A2D31]/50">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-kufi">🌙 {isEn ? "Hijri:" : "الهجري:"} {getHijriDate()}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-bold mt-0.5">
            <span>📅 {isEn ? "Gregorian:" : "الميلادي:"} {getGregorianDate()}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-mono text-emerald-700 dark:text-amber-400 font-extrabold">{currentTime.toLocaleTimeString(isEn ? 'en-US' : 'ar-EG')}</span>
          </div>
        </div>

        {/* Action Controls - 5 Circular Luxury Avatars Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* 1. Profile / Stats Avatar Button */}
          <button
            id="header-profile-btn"
            onClick={() => setActiveSection('profile')}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer active:scale-95 relative shadow-xs group overflow-hidden ${
              activeSection === 'profile'
                ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-md scale-105'
                : 'border-emerald-600/30 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20'
            }`}
            title={isEn ? "Profile & Worship Statistics" : "الملف الشخصي وإحصائيات العبادة"}
            aria-label="Profile"
          >
            <img 
              src={ISLAMIC_AVATARS.profile} 
              alt="Profile" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0.5 right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#080E10] animate-pulse"></span>
          </button>

          {/* 2. Language Toggle Avatar Button */}
          <button
            id="language-toggle-btn"
            onClick={toggleLanguage}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-emerald-600/30 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs group overflow-hidden relative"
            title={isEn ? "Switch to Arabic" : "التحويل للإنجليزية"}
            aria-label="Toggle Language"
          >
            <img 
              src={ISLAMIC_AVATARS.lang} 
              alt="Language" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <span className="absolute inset-0 bg-black/35 flex items-center justify-center text-white font-black text-[8px] sm:text-[10px] font-kufi">
              {isEn ? "AR" : "EN"}
            </span>
          </button>

          {/* 3. Dark/Light Theme Toggle Avatar Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-emerald-600/30 hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs group overflow-hidden relative"
            title={isEn ? "Toggle dark mode" : "تبديل المظهر"}
            aria-label="Toggle Theme"
          >
            <img 
              src={ISLAMIC_AVATARS.theme} 
              alt="Theme" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-amber-300">
              {settings.theme === 'dark' ? <Sun className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> : <Moon className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
            </span>
          </button>

          {/* 4. Share App Avatar Button */}
          <button
            id="share-app-btn"
            onClick={handleShareApp}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-emerald-600/30 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs group overflow-hidden relative"
            title={isEn ? "Share App" : "مشاركة التطبيق ونشره"}
            aria-label="Share App"
          >
            <img 
              src={ISLAMIC_AVATARS.share} 
              alt="Share" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-emerald-300">
              <Share2 className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
            </span>
          </button>

          {/* 5. Settings Modal Avatar Button */}
          <button
            id="settings-modal-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-emerald-600/30 hover:border-teal-400 hover:ring-2 hover:ring-teal-400/20 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs group overflow-hidden relative"
            title={isEn ? "Settings & Controls" : "الإعدادات والتخصيص"}
            aria-label="Settings"
          >
            <img 
              src={ISLAMIC_AVATARS.settings} 
              alt="Settings" 
              className="w-full h-full object-cover group-hover:rotate-45 group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-teal-300">
              <Settings className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
            </span>
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {activeSection === null ? (
            <motion.div
              key="main-hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-8"
            >
              
              {/* Luxury Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* 1. Main Left Area (Column Span 2) */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Breathtaking Dome-like Hero Banner */}
                  <div 
                    id="header-hero-banner"
                    className="w-full min-h-[220px] sm:h-64 rounded-3xl sm:rounded-[2.5rem] overflow-hidden relative shadow-lg border border-[#EBE7DF] dark:border-[#132326] flex flex-col justify-between p-5 sm:p-7 lg:p-8"
                  >
                    {/* Background image */}
                    <img 
                      src={settings.headerBgUrl || defaultBanner}
                      alt="Mosque Banner" 
                      className="absolute inset-0 w-full h-full object-cover brightness-[0.3] contrast-[1.1]"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Golden-emerald glowing overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1817]/95 via-[#0A1817]/60 to-black/30"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 blur-3xl pointer-events-none rounded-full"></div>
                    
                    {/* Top Row inside Hero: Greeting & Mobile Date/Time Pill */}
                    <div className="relative z-10 flex items-center justify-between gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-400/20 rounded-xl text-amber-300 shrink-0">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                        </span>
                        <span className="text-[11px] sm:text-xs font-black tracking-wider text-emerald-300 bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30">
                          {getDynamicGreeting()}
                        </span>
                      </div>

                      {/* Hero Date & Time Unified Single-Line Pill for iPhone screens */}
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 text-[11px] sm:text-xs font-semibold text-amber-300 shadow-md">
                        <span className="font-mono font-black text-white">
                          {currentTime.toLocaleTimeString(isEn ? 'en-US' : 'ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-white/30">•</span>
                        <span className="text-emerald-300 font-bold whitespace-nowrap">🌙 {getHijriDate()}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-sky-200 font-bold whitespace-nowrap">📅 {getGregorianDate()}</span>
                      </div>
                    </div>

                    {/* Bottom Content Area: Title & Dedication */}
                    <div className="relative z-10 space-y-2 text-white mt-4 sm:mt-auto">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-kufi text-amber-300 drop-shadow-sm leading-tight">
                        {settings.appName || (isEn ? "Noor Al-Islam" : "نور الإسلام")}
                      </h2>
                      
                      <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-medium leading-relaxed font-sans">
                        {settings.dedicationText || (isEn ? "Continuous charity for spiritual serenity and daily remembrance." : "صدقة جارية بإذن الله ليكون رفيقك الروحي السلس، معطرًا بذكر رب العالمين وبأسهل واجهة عصرية متكاملة.")}
                      </p>
                    </div>
                  </div>

                  {/* Verse of the Day Card */}
                  <VerseOfTheDay settings={settings} />

                  {/* App Sections Header */}
                  <div className="flex items-center justify-between pt-2 pb-2 border-b border-[#EBE7DF] dark:border-[#132326]">
                    <h3 className="text-base font-black text-emerald-950 dark:text-emerald-300 font-kufi flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{isEn ? "App Sections & Islamic Services" : "أقسام التطبيق والخدمات الإسلامية"}</span>
                    </h3>
                    <span className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl font-extrabold border border-emerald-500/20">
                      {sections.length} {isEn ? "Sections" : "أقسام"}
                    </span>
                  </div>

                  {/* App Sections Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {sections.map((sec) => (
                      <button
                        key={sec.id}
                        id={`section-card-${sec.id}`}
                        onClick={() => setActiveSection(sec.id)}
                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-4.5 bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] hover:border-emerald-500/40 dark:hover:border-amber-400/40 rounded-2xl sm:rounded-3xl transition-all duration-300 cursor-pointer shadow-xs hover:shadow-lg hover:scale-[1.015] active:scale-[0.99] flex items-center justify-between gap-4 group relative overflow-hidden`}
                      >
                        <div className={`absolute top-0 ${isEn ? 'left-0' : 'right-0'} w-1.5 h-full bg-gradient-to-b from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* 3D Islamic Avatar Box */}
                          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl overflow-hidden border border-emerald-500/30 dark:border-emerald-500/20 shadow-md shadow-emerald-900/10 group-hover:scale-105 group-hover:rotate-2 group-hover:shadow-amber-500/20 transition-all duration-300 flex-shrink-0 relative bg-emerald-950">
                            {sec.avatarUrl ? (
                              <img 
                                src={sec.avatarUrl} 
                                alt={sec.title} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-tr ${sec.colorClass} text-white flex items-center justify-center`}>
                                {sec.icon}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                          </div>

                          {/* Details */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <h4 className="text-base font-black text-emerald-950 dark:text-emerald-300 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-kufi truncate">
                              {sec.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                              {sec.desc}
                            </p>
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#060B0C] flex items-center justify-center border border-[#E9E1D2]/50 dark:border-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-emerald-700 group-hover:text-white group-hover:border-transparent transition-all flex-shrink-0 shadow-xs">
                          <span className="font-extrabold text-xs transform group-hover:scale-110">{isEn ? '→' : '←'}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                </div>

                {/* 2. Right Sticky Sidebar Area (Column Span 1) */}
                <div className="space-y-6 sm:space-y-8 lg:sticky lg:top-28">
                  
                  {/* Digital Prayer Countdown Widget */}
                  <div className="bg-gradient-to-br from-[#122421] to-[#0A1617] text-white border-2 border-emerald-500/20 rounded-3xl sm:rounded-[2.5rem] p-6 shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-80" />
                    <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 blur-2xl pointer-events-none"></div>

                    {/* Countdown header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-xs font-black text-emerald-200">{isEn ? "Next Prayer Countdown" : "العد التنازلي للصلاة القادمة"}</span>
                      </div>
                      <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/5 font-bold">{settings.city}</span>
                    </div>

                    {/* Big Digital Countdown numbers */}
                    <div className="text-center py-2 space-y-1.5">
                      <span className="text-[11px] text-slate-300 font-bold block">{isEn ? "Next Prayer Insha'Allah:" : "الصلاة القادمة بإذن اللّٰه:"}</span>
                      <h4 className="text-2xl font-black text-amber-300 font-kufi">
                        {isEn ? `${nextPrayer.arabic} Prayer` : `صلاة ${nextPrayer.arabic}`}
                      </h4>
                      <div className="text-3xl sm:text-4xl font-mono font-black text-white glow-gold py-1">
                        {String(remHours).padStart(2, '0')}:{String(remMins).padStart(2, '0')}
                      </div>
                      <span className="text-[11px] text-emerald-200/80 block">
                        {isEn 
                          ? `${remHours}h ${remMins}m remaining (Adhan ${formatTime12(nextPrayer.time, isEn)})`
                          : `متبقي ${remHours} ساعة و ${remMins} دقيقة (الأذان ${formatTime12(nextPrayer.time, isEn)})`}
                      </span>
                    </div>

                    {/* Quick Settings Toggles for Adhan alert inside */}
                    <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                      <span>{isEn ? "Visual & Audio Adhan alert" : "تنبيه مرئي ومسموع وقت دخول الأذان"}</span>
                      <button
                        id="prayer-quick-sound-toggle-home"
                        onClick={() => handleUpdateSettings({ ...settings, visualAdhanAlert: !settings.visualAdhanAlert })}
                        className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                          settings.visualAdhanAlert ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/10 text-emerald-200'
                        }`}
                        title={settings.visualAdhanAlert ? (isEn ? "Disable alert" : "تعطيل التنبيه المرئي") : (isEn ? "Enable alert" : "تفعيل التنبيه المرئي")}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Daily Worship Tracker Checklist ("مسار الطاعات اليومي") */}
                  <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-3xl sm:rounded-[2.5rem] p-6 shadow-xs hover:shadow-sm transition-all">
                    
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF] dark:border-[#132326] mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 font-kufi">{isEn ? "Daily Acts of Worship Tracker" : "مسار الطاعات والالتزام اليومي"}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg">{isEn ? "Daily Reset" : "تتجدد يوميًا"}</span>
                    </div>

                    {/* Prayer and Dhikr list with luxury checkboxes */}
                    <div className="space-y-2.5">
                      
                      {[
                        { key: 'Fajr', label: isEn ? 'Fajr Prayer on time' : 'صلاة الفجر في وقتها' },
                        { key: 'Dhuhr', label: isEn ? 'Dhuhr Prayer in congregation' : 'صلاة الظهر في جماعة' },
                        { key: 'Asr', label: isEn ? 'Asr Prayer and Sunnah' : 'صلاة العصر والسنّة البعدية' },
                        { key: 'Maghrib', label: isEn ? 'Maghrib Prayer and Wird' : 'صلاة المغرب وأورادها' },
                        { key: 'Isha', label: isEn ? 'Isha Prayer and Witr' : 'صلاة العشاء والوتر قيامًا' },
                        { key: 'Duha', label: isEn ? 'Duha Prayer' : 'صلاة الضحى (الأوابين)' },
                        { key: 'AzkarSabah', label: isEn ? 'Morning Adhkar' : 'قراءة أذكار الصباح كاملة' },
                        { key: 'AzkarMasaa', label: isEn ? 'Evening Adhkar' : 'قراءة أذكار المساء كاملة' },
                        { key: 'Fasting', label: isEn ? 'Voluntary Fasting (Mon/Thu/White Days)' : 'صيام التطوع (الإثنين/الخميس/الأيام البيض)' },
                      ].map((p) => {
                        const checked = dailyPrayers[p.key as keyof typeof dailyPrayers] || false;
                        return (
                          <div 
                            key={p.key}
                            onClick={() => toggleDailyPrayer(p.key)}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                              checked 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-bold' 
                                : 'bg-[#FAF8F5]/60 dark:bg-[#060B0C] border-[#E9E1D2]/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#122427] text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="text-xs font-semibold">{p.label}</span>
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                              checked 
                                ? 'bg-emerald-600 border-transparent text-white' 
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#060B0C]'
                            }`}>
                              {checked && <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white" />}
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>

                </div>

              </div>

              {/* Single Unified Last Section: منصة إحسان الإسلامية */}
              <EhsanIslamicPlatformSection settings={settings} isEn={isEn} />

            </motion.div>
          ) : (
            <motion.div
              key={`active-sec-${activeSection}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-8"
            >
              {/* Floating Back Header bar */}
              <div className="flex items-center justify-between gap-3 bg-white/95 dark:bg-[#0B1516]/95 backdrop-blur-md border border-[#EBE7DF] dark:border-[#132326] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs sticky top-[75px] sm:top-[85px] z-30 mb-6 sm:mb-8">
                {/* Right Side: Section Avatar & Title */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl overflow-hidden border border-emerald-500/30 dark:border-emerald-500/20 shadow-md shrink-0 bg-emerald-950">
                    {sections.find(s => s.id === activeSection)?.avatarUrl ? (
                      <img 
                        src={sections.find(s => s.id === activeSection)?.avatarUrl} 
                        alt={sections.find(s => s.id === activeSection)?.title} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className={`w-full h-full p-2.5 bg-gradient-to-tr ${sections.find(s => s.id === activeSection)?.colorClass} text-white flex items-center justify-center`}>
                        {sections.find(s => s.id === activeSection)?.icon}
                      </div>
                    )}
                  </div>
                  <div className={`flex flex-col min-w-0 ${isEn ? 'text-left' : 'text-right'}`}>
                    <h2 className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-300 font-kufi truncate">
                      {sections.find(s => s.id === activeSection)?.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold hidden sm:block truncate">
                      {sections.find(s => s.id === activeSection)?.desc}
                    </p>
                  </div>
                </div>

                {/* Left Side: Back Button */}
                <button
                  id="section-back-to-home"
                  onClick={() => setActiveSection(null)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#FAF8F5] hover:bg-emerald-700 text-slate-700 hover:text-white dark:bg-[#060B0C] dark:text-slate-300 dark:hover:bg-emerald-700 dark:hover:text-white border border-[#E9E1D2]/60 dark:border-[#1E3336]/60 font-black text-xs rounded-xl sm:rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                  <ArrowRight className={`w-4 h-4 ${isEn ? 'rotate-180' : ''}`} />
                  <span className="hidden sm:inline">{isEn ? "Back to Home" : "العودة للرئيسية"}</span>
                  <span className="sm:hidden">{isEn ? "Home" : "الرئيسية"}</span>
                </button>
              </div>

              {/* Active Component Render */}
              <div className="w-full">
                {currentActiveComponent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Islamic footer dedication */}
      <footer className="w-full bg-white dark:bg-[#050A0B] border-t border-[#EBE7DF] dark:border-[#132326] py-10 px-6 sm:px-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4 font-sans mt-12">
        <div className="max-w-2xl mx-auto space-y-2.5 leading-relaxed font-semibold">
          <p className="text-[15px] text-emerald-900 dark:text-emerald-300 font-extrabold font-amiri">
            {settings.dedicationText || "هذا التطبيق صدقة جارية بإذن اللّٰه تعالى عن لؤي بن حسين وعن والده رحمه اللّٰه وغفر له وجميع المسلمين والمسلمات الأحياء منهم والأموات."}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            تم التطوير بحبّ وإتقان ليكون تطبيقاً سهلاً، جميلاً وسلساً للمستخدمين. تقبل الله طاعاتكم جميعاً.
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-900 max-w-xl mx-auto">
          <span>المطور: {settings.developerName || "لؤي بن حسين"}</span>
          <span>•</span>
          <span>© 2026 - جميع الحقوق محفوظة</span>
          <span>•</span>
          <a href={settings.snapchatUrl || "https://snapchat.com/t/vezdvWWb"} target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 font-extrabold hover:underline">
            تابعني على سناب شات 👻
          </a>
        </div>
      </footer>

      {/* Welcome Splash Screen on app open */}
      <AnimatePresence>
        {showWelcomeSplash && (
          <WelcomeSplashScreen
            settings={settings}
            isEn={isEn}
            onEnter={() => setShowWelcomeSplash(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal (including Developer & Dedication at top) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Visual Adhan Alert Modal popup */}
      <VisualAdhanModal
        isOpen={activeAdhanAlert !== null}
        onClose={() => setActiveAdhanAlert(null)}
        prayerName={activeAdhanAlert?.prayerName || ''}
        arabicName={activeAdhanAlert?.arabicName || ''}
        time={activeAdhanAlert?.time || ''}
        city={activeAdhanAlert?.city || ''}
        supplication={activeAdhanAlert?.supplication || ''}
        tip={activeAdhanAlert?.tip || ''}
        soundEnabled={settings.soundEnabled}
        isEn={isEn}
      />
      {/* Share Notification Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-50 bg-emerald-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 backdrop-blur-lg"
          >
            <div className="p-2 bg-emerald-700/80 rounded-xl text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-black text-amber-300 font-kufi">
                {isEn ? "Link Copied to Clipboard!" : "تم نسخ رابط التطبيق بنجاح!"}
              </p>
              <p className="text-emerald-100 font-medium mt-0.5">
                {isEn ? "May Allah reward you for spreading the benefit." : "جزاك اللّٰه خيراً ونفع الله بك في نشر الخير والبركة."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
