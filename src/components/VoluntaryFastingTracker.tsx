/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface VoluntaryFastingTrackerProps {
  isEn?: boolean;
}

export default function VoluntaryFastingTracker({ isEn = false }: VoluntaryFastingTrackerProps) {
  const [fastedDates, setFastedDates] = useState<string[]>(() => {
    const saved = safeStorage.getItem('noor_voluntary_fasted_dates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayDate = useMemo(() => new Date(), []);
  const isTodayFasted = fastedDates.includes(todayStr);

  // Month navigation
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);
  
  const currentMonthDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedMonthOffset);
    return d;
  }, [selectedMonthOffset]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Save to safeStorage
  useEffect(() => {
    safeStorage.setItem('noor_voluntary_fasted_dates', JSON.stringify(fastedDates));
  }, [fastedDates]);

  const toggleDate = (dateKey: string) => {
    setFastedDates(prev => {
      if (prev.includes(dateKey)) {
        return prev.filter(d => d !== dateKey);
      } else {
        return [...prev, dateKey];
      }
    });
  };

  const toggleTodayFasting = () => {
    toggleDate(todayStr);
  };

  // Calculate monthly stats
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthFastedCount = useMemo(() => {
    return fastedDates.filter(d => d.startsWith(monthPrefix)).length;
  }, [fastedDates, monthPrefix]);

  const totalAllTimeFasted = fastedDates.length;

  // Generate calendar days for current selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Recommended voluntary days detection (Mondays = 1, Thursdays = 4)
  const isMondayOrThursday = (dayNumber: number) => {
    const d = new Date(year, month, dayNumber);
    const day = d.getDay();
    return day === 1 || day === 4; // Monday or Thursday
  };

  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthName = isEn ? monthNamesEn[month] : monthNamesAr[month];

  return (
    <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-[#EBE7DF] dark:border-[#132326]">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Moon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black font-kufi text-emerald-950 dark:text-emerald-300">
              {isEn ? "Voluntary Fasting Tracker" : "سجل ومتابعة صيام التطوع والنوافل"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isEn 
                ? "Track Mondays, Thursdays, and White Days with monthly statistics" 
                : "صيام الإثنين والخميس والأيام البيض مع الإحصائيات الشهرية"}
            </p>
          </div>
        </div>

        {/* Quick Fast Today Toggle Button */}
        <button
          id="toggle-fasting-today-btn"
          onClick={toggleTodayFasting}
          className={`w-full sm:w-auto px-4 py-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs ${
            isTodayFasted
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-[#FAF8F5] dark:bg-[#060B0C] text-emerald-800 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isTodayFasted ? 'fill-current' : ''}`} />
          <span>{isTodayFasted ? (isEn ? "Fasted Today ✓" : "صائم اليوم بحمد الله ✓") : (isEn ? "Mark Today as Fasted" : "تسجيل صيام اليوم")}</span>
        </button>
      </div>

      {/* Monthly Statistics & Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3 bg-[#FAF8F5] dark:bg-[#060B0C] border border-[#E9E1D2]/60 dark:border-slate-800/80 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{isEn ? "This Month" : "أيام هذا الشهر"}</span>
          <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{thisMonthFastedCount}</span>
          <span className="text-[9px] text-slate-400 block">{isEn ? "Days fasted" : "يوم صيام"}</span>
        </div>

        <div className="p-3 bg-[#FAF8F5] dark:bg-[#060B0C] border border-[#E9E1D2]/60 dark:border-slate-800/80 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">{isEn ? "Total All Time" : "إجمالي الأيام"}</span>
          <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">{totalAllTimeFasted}</span>
          <span className="text-[9px] text-slate-400 block">{isEn ? "Total voluntary days" : "يوماً مسجلاً"}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl flex flex-col justify-center text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-300 text-xs font-black">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{isEn ? "Sunnah Fasting" : "سنن الصيام المستحبة"}</span>
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
            {isEn ? "Mon & Thu • White Days 13-15" : "الإثنين والخميس • الأيام البيض ١٣-١٥"}
          </span>
        </div>
      </div>

      {/* Month Selector & Interactive Fasting Calendar */}
      <div className="bg-[#FAF8F5]/80 dark:bg-[#060B0C]/80 border border-[#E9E1D2]/60 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMonthOffset(prev => prev - 1)}
            className="p-1.5 rounded-xl bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
            title="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
            {currentMonthName} {year}
          </span>

          <button
            onClick={() => setSelectedMonthOffset(prev => prev + 1)}
            className="p-1.5 rounded-xl bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
            title="الشهر القادم"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-800">
          <span>أحد</span>
          <span>إثنين</span>
          <span>ثلاثاء</span>
          <span>أربعاء</span>
          <span>خميس</span>
          <span>جمعة</span>
          <span>سبت</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty prefix slots */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isFasted = fastedDates.includes(dateKey);
            const isToday = dateKey === todayStr;
            const isSunnahDay = isMondayOrThursday(dayNum);

            return (
              <button
                key={dateKey}
                onClick={() => toggleDate(dateKey)}
                className={`h-8 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center relative transition-all cursor-pointer active:scale-90 ${
                  isFasted
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : isToday
                    ? 'bg-amber-400/20 border-2 border-amber-400 text-amber-900 dark:text-amber-300'
                    : isSunnahDay
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-white dark:bg-[#0B1516] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#EBE7DF]/60 dark:border-slate-800/60'
                }`}
                title={`${dayNum} ${currentMonthName} - اضغط لتبديل حالة الصيام`}
              >
                <span>{dayNum}</span>
                {isSunnahDay && !isFasted && (
                  <span className="w-1 h-1 rounded-full bg-emerald-500 absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>تم الصيام</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500" />
            <span>إثنين / خميس</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-400/20" />
            <span>اليوم الحالي</span>
          </div>
        </div>

      </div>

      {/* Hadith on Fasting */}
      <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">
          قال النبي ﷺ: <strong>«كُلُّ عَمَلِ ابْنِ آدَمَ يُضَاعَفُ، الْحَسَنَةُ عَشْرُ أَمْثَالِهَا إِلَى سَبْعِمِائَةِ ضِعْفٍ، قَالَ اللَّهُ عَزَّ وَجَلَّ: إِلَّا الصَّوْمَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ»</strong> [صحيح مسلم].
        </p>
      </div>

    </div>
  );
}
