/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Bed, Activity, BookOpen, Shield, Heart, RefreshCw, Award, CheckCircle, RotateCcw, Bell, Clock, Volume2 } from 'lucide-react';
import { azkarData } from '../data/azkar';
import { ZekrItem } from '../types';

interface AzkarSectionProps {
  soundEnabled: boolean;
  isEn?: boolean;
}

interface AzkarReminderItem {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
}

export default function AzkarSection({ soundEnabled, isEn = false }: AzkarSectionProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>('morning');
  // Local state to keep track of remaining count for items in the selected category
  const [countsState, setCountsState] = useState<{ [key: number]: number }>({});
  
  // Favorites local state
  const [favorites, setFavorites] = useState<number[]>(() => {
    const stored = localStorage.getItem('noor_favorite_azkar_ids');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Daily reminders state
  const [reminders, setReminders] = useState<AzkarReminderItem[]>(() => {
    const stored = localStorage.getItem('noor_azkar_reminders');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    const defaults = [
      { id: 'morning', name: 'أذكار الصباح', time: '07:00', enabled: true },
      { id: 'evening', name: 'أذكار المساء', time: '16:30', enabled: true },
      { id: 'sleep', name: 'أذكار النوم', time: '22:00', enabled: true },
      { id: 'wakeup', name: 'أذكار الاستيقاظ', time: '05:30', enabled: false }
    ];
    localStorage.setItem('noor_azkar_reminders', JSON.stringify(defaults));
    return defaults;
  });

  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const [isSchedulerOpen, setIsSchedulerOpen] = useState<boolean>(false);

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setReminders(updated);
    localStorage.setItem('noor_azkar_reminders', JSON.stringify(updated));
    playTapSound();
  };

  const handleTimeChange = (id: string, time: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, time } : r);
    setReminders(updated);
    localStorage.setItem('noor_azkar_reminders', JSON.stringify(updated));
  };

  const requestPermission = () => {
    playTapSound();
    if (!('Notification' in window)) {
      alert('متصفحك لا يدعم إشعارات سطح المكتب.');
      return;
    }
    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
    });
  };

  const triggerTestNotification = () => {
    playTapSound();
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification('تنبيه تجريبي من نور الإسلام', {
          body: 'الحمد لله! الإشعارات مفعّلة وتعمل بشكل ممتاز في تطبيق نور الإسلام.',
          icon: '/src/assets/images/app_logo_1784263255295.jpg',
          dir: 'rtl'
        });
      } catch (err) {
        console.error('Failed to display test browser notification:', err);
      }
    } else {
      requestPermission();
    }
  };

  // Compile favorited items
  const favoriteItems: ZekrItem[] = [];
  azkarData.forEach(cat => {
    cat.items.forEach(item => {
      if (favorites.includes(item.id)) {
        // Avoid duplicates just in case
        if (!favoriteItems.some(x => x.id === item.id)) {
          favoriteItems.push(item);
        }
      }
    });
  });

  const allCategories = [
    {
      id: 'favorites',
      name: 'الأذكار المفضلة',
      icon: 'HeartFill',
      items: favoriteItems
    },
    ...azkarData
  ];

  const activeCategory = allCategories.find(cat => cat.id === selectedCatId) || allCategories[1];

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('noor_favorite_azkar_ids', JSON.stringify(next));
      return next;
    });
  };

  const playTapSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime); // Soft tap tone
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const getRemainingCount = (item: ZekrItem) => {
    if (countsState[item.id] !== undefined) {
      return countsState[item.id];
    }
    return item.count;
  };

  const handleCardClick = (item: ZekrItem) => {
    const currentRem = getRemainingCount(item);
    if (currentRem === 0) return; // already completed

    playTapSound();
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    const nextRem = currentRem - 1;
    setCountsState(prev => ({
      ...prev,
      [item.id]: nextRem,
    }));

    if (nextRem === 0) {
      playSuccessSound();
      if (navigator.vibrate) {
        navigator.vibrate([60, 40, 60]);
      }
    }
  };

  const handleResetCategory = () => {
    // Clear state counts for all items in the active category
    const updated = { ...countsState };
    activeCategory.items.forEach(item => {
      delete updated[item.id];
    });
    setCountsState(updated);
    playTapSound();
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-500" />;
      case 'Bed': return <Bed className="w-5 h-5 text-violet-500" />;
      case 'Activity': return <Activity className="w-5 h-5 text-rose-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'Shield': return <Shield className="w-5 h-5 text-teal-500" />;
      case 'Heart': return <Heart className="w-5 h-5 text-pink-500 fill-pink-50" />;
      case 'HeartFill': return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 text-sky-500" />;
      case 'Award': return <Award className="w-5 h-5 text-yellow-500" />;
      default: return <BookOpen className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Calculate percentage progress of current category
  const totalItemsCount = activeCategory.items.length;
  const completedItemsCount = activeCategory.items.filter(item => getRemainingCount(item) === 0).length;
  const progressPercentage = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">حصن المسلم والأذكار اليومية</h3>
        </div>
        <button
          id="reset-azkar-cat-btn"
          onClick={handleResetCategory}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/20 hover:bg-amber-100 rounded-xl transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تصفير أذكار القسم الحالي</span>
        </button>
      </div>

      {/* Daily Reminders Scheduler UI */}
      <div className="bg-slate-50/70 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4 space-y-3">
        <button
          type="button"
          onClick={() => { setIsSchedulerOpen(!isSchedulerOpen); playTapSound(); }}
          className="w-full flex items-center justify-between font-bold text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <Bell className="w-4 h-4 animate-swing" />
            </span>
            <span>جدولة التنبيهات اليومية للأذكار</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span>{isSchedulerOpen ? 'إغلاق الإعدادات' : 'تخصيص الأوقات'}</span>
            <span className="text-lg leading-none">{isSchedulerOpen ? '▲' : '▼'}</span>
          </div>
        </button>

        {isSchedulerOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 space-y-4 border-t border-slate-200/50 dark:border-slate-800/40 overflow-hidden"
          >
            {/* Permission status & Test Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  notificationPermission === 'granted' 
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                    : notificationPermission === 'denied' 
                    ? 'bg-rose-500' 
                    : 'bg-amber-500'
                }`} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  حالة إشعارات المتصفح:{' '}
                  {notificationPermission === 'granted' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">مفعّلة ومصرح بها</span>
                  ) : notificationPermission === 'denied' ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">محجوبة (يرجى تفعيلها من إعدادات المتصفح)</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">بانتظار الموافقة</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {notificationPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={requestPermission}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    السماح بالإشعارات
                  </button>
                )}
                <button
                  type="button"
                  onClick={triggerTestNotification}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إرسال إشعار تجريبي
                </button>
              </div>
            </div>

            {/* Custom Reminder Times Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reminders.map((rem) => (
                <div 
                  key={rem.id}
                  className={`p-3 rounded-xl border transition-all ${
                    rem.enabled 
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-950/50' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`rem-check-${rem.id}`}
                        checked={rem.enabled}
                        onChange={() => handleToggleReminder(rem.id)}
                        className="w-4.5 h-4.5 rounded-sm text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                      <label 
                        htmlFor={`rem-check-${rem.id}`}
                        className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none"
                      >
                        {rem.name}
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <input
                        type="time"
                        value={rem.time}
                        onChange={(e) => handleTimeChange(rem.id, e.target.value)}
                        disabled={!rem.enabled}
                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              * تأكد من إبقاء الصفحة مفتوحة في المتصفح، وسيصلك تنبيه فوري فور حلول الموعد المحدد لقراءة الأذكار.
            </p>
          </motion.div>
        ) : null}
      </div>

      {/* Categories Vertical scrolling or horizontal swiper */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none" dir="rtl">
        {allCategories.map((cat) => (
          <button
            key={cat.id}
            id={`azkar-cat-tab-${cat.id}`}
            onClick={() => setSelectedCatId(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
              selectedCatId === cat.id
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md transform scale-102'
                : 'bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 border-slate-100/30 dark:border-slate-850 hover:bg-slate-100'
            }`}
          >
            {getCategoryIcon(cat.icon)}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Progress indicators */}
      <div className="p-3.5 bg-emerald-50/40 dark:bg-slate-950/40 border border-emerald-100/10 rounded-2xl flex items-center justify-between">
        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
          تم قراءة <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{completedItemsCount}</span> من <span className="font-mono text-sm">{totalItemsCount}</span>
        </div>
        <div className="flex items-center gap-3 w-1/2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{progressPercentage}%</span>
        </div>
      </div>

      {/* Azkar Items List */}
      <div className="space-y-4">
        {activeCategory.id === 'favorites' && activeCategory.items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">المفضلة فارغة</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
              لم تقم بإضافة أي ذكر إلى المفضلة حتى الآن. يمكنك تصفح الأذكار الأخرى والضغط على زر القلب لحفظها هنا لسهولة الوصول إليها في أي وقت.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {activeCategory.items.map((item, idx) => {
            const rem = getRemainingCount(item);
            const isCompleted = rem === 0;
            const isFav = favorites.includes(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                onClick={() => handleCardClick(item)}
                className={`group p-4 rounded-2xl border transition-all duration-300 text-right cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/20 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100/40 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/80 hover:border-emerald-500/20 hover:shadow-xs'
                }`}
              >
                {/* Completion Background wave overlay */}
                {isCompleted && (
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-emerald-600 dark:bg-emerald-400" />
                )}

                {/* Main Content */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-medium text-slate-800 dark:text-slate-100 leading-relaxed font-sans select-text flex-1">
                      {item.text}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isFav
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200/50 dark:border-rose-950/50 scale-105'
                          : 'bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 border-transparent hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                      }`}
                      title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>
                  
                  {item.reward && (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-100/30 dark:bg-emerald-950/10 p-2 rounded-lg inline-block">
                      <strong>فضل الذكر:</strong> {item.reward}
                    </div>
                  )}
                </div>

                {/* Footer Controls / Count tracker */}
                <div className="flex items-center justify-between border-t border-slate-100/10 pt-2 text-xs">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    الرقم التعريفي: #{item.id}
                  </span>

                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-xs animate-pulse">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>مكتمل</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">انقر للتكرار:</span>
                        <span className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-full transition-transform transform active:scale-90 font-mono shadow-md min-w-[50px] text-center">
                          {rem}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
