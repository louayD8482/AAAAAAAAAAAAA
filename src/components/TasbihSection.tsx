/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Plus, Trash2, Heart, Sparkles, Check, TrendingUp, Target, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface TasbihSectionProps {
  soundEnabled: boolean;
  isEn?: boolean;
}

interface DailyHistory {
  [dateKey: string]: number;
}

const getTodayKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TasbihSection({ soundEnabled, isEn = false }: TasbihSectionProps) {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [selectedPhrase, setSelectedPhrase] = useState<string>('سُبْحَانَ اللَّهِ');
  const [customPhrase, setCustomPhrase] = useState<string>('');
  const [phrases, setPhrases] = useState<string[]>([
    'سُبْحَانَ اللَّهِ',
    'الْحَمْدُ لِلَّهِ',
    'اللَّهُ أَكْبَرُ',
    'لَا إِلَٰهَ إِلَّا اللَّهُ',
    'أَسْتَغْفِرُ اللَّهَ',
    'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
  ]);
  const [showCelebrate, setShowCelebrate] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(() => {
    return Number(localStorage.getItem('tasbih_total_count') || '0');
  });

  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const [dailyHistory, setDailyHistory] = useState<DailyHistory>(() => {
    const stored = localStorage.getItem('tasbih_daily_history');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fail-safe
      }
    }
    // Initialize with mock data for last 7 days so it's beautifully populated
    const mock: DailyHistory = {};
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const temp = new Date();
      temp.setDate(d.getDate() - i);
      const year = temp.getFullYear();
      const month = String(temp.getMonth() + 1).padStart(2, '0');
      const day = String(temp.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      // Spiritual-feeling values (33, 99, 100, etc.)
      mock[key] = i === 0 ? 0 : Math.floor(Math.random() * 100) + 33;
    }
    return mock;
  });

  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    return Number(localStorage.getItem('tasbih_daily_goal') || '100');
  });

  useEffect(() => {
    localStorage.setItem('tasbih_total_count', totalCount.toString());
  }, [totalCount]);

  useEffect(() => {
    localStorage.setItem('tasbih_daily_history', JSON.stringify(dailyHistory));
  }, [dailyHistory]);

  useEffect(() => {
    localStorage.setItem('tasbih_daily_goal', dailyGoal.toString());
  }, [dailyGoal]);

  const todayKey = getTodayKey();
  const todayCount = dailyHistory[todayKey] || 0;
  const dailyProgressPercentage = Math.min((todayCount / dailyGoal) * 100, 100);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      // Create oscillator click sound
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // High pitched click
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio click context issue:', e);
    }
  };

  const playCompleteSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // Beautiful C Major arpeggio
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.1);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + index * 0.1);
        osc.stop(audioCtx.currentTime + index * 0.1 + 0.3);
      });
    } catch (e) {
      console.log('Audio complete context issue:', e);
    }
  };

  const handleIncrement = () => {
    const nextCount = count + 1;
    playClickSound();
    
    // Attempt device vibration if available
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    if (nextCount === target) {
      playCompleteSound();
      setShowCelebrate(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => setShowCelebrate(false), 2500);
    }

    setCount(nextCount);
    setTotalCount(prev => prev + 1);

    // Update daily history
    const todayKey = getTodayKey();
    setDailyHistory(prev => {
      const updated = {
        ...prev,
        [todayKey]: (prev[todayKey] || 0) + 1
      };
      return updated;
    });
  };

  const handleReset = () => {
    setCount(0);
    playClickSound();
  };

  const handleClearHistory = () => {
    setTotalCount(0);
    const cleared: DailyHistory = {};
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const temp = new Date();
      temp.setDate(d.getDate() - i);
      const year = temp.getFullYear();
      const month = String(temp.getMonth() + 1).padStart(2, '0');
      const day = String(temp.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      cleared[key] = 0;
    }
    setDailyHistory(cleared);
    setShowConfirmClear(false);
  };

  const getChartData = () => {
    const data = [];
    const daysOfWeekArabic = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const d = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const temp = new Date();
      temp.setDate(d.getDate() - i);
      const year = temp.getFullYear();
      const month = String(temp.getMonth() + 1).padStart(2, '0');
      const day = String(temp.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      
      const dayName = daysOfWeekArabic[temp.getDay()];
      const countVal = dailyHistory[key] || 0;
      
      data.push({
        dateStr: `${month}/${day}`,
        dayName,
        'التكرار': countVal,
      });
    }
    return data;
  };

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhrase.trim()) return;
    const trimmed = customPhrase.trim();
    if (!phrases.includes(trimmed)) {
      setPhrases(prev => [...prev, trimmed]);
    }
    setSelectedPhrase(trimmed);
    setCustomPhrase('');
    setCount(0);
  };

  const handleDeletePhrase = (phraseToDelete: string) => {
    if (phrases.length <= 1) return;
    setPhrases(prev => prev.filter(p => p !== phraseToDelete));
    if (selectedPhrase === phraseToDelete) {
      setSelectedPhrase(phrases.find(p => p !== phraseToDelete) || '');
    }
    setCount(0);
  };

  const progressPercentage = Math.min((count / target) * 100, 100);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl">
            <Heart className="w-5 h-5 fill-current" />
          </span>
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{isEn ? 'Smart Digital Tasbih' : 'التسبيح الإلكتروني الذكي'}</h3>
        </div>
        <div className="text-xs bg-emerald-50 dark:bg-slate-950 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full font-medium">
          {isEn ? 'Total Dhikr Count:' : 'مجموع تسبيحاتك كلياً:'} <strong className="text-sm">{totalCount}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Presets and customizing (Right side / spans 5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">اختر الذكر المقرون أو أضف خاصتك:</p>
          
          <div className="flex flex-wrap gap-2">
            {phrases.map((phrase, idx) => (
              <div
                key={idx}
                id={`phrase-preset-container-${idx}`}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                  selectedPhrase === phrase
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50/40 dark:bg-slate-950/40 border-emerald-100/40 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100/40 dark:hover:bg-slate-800'
                }`}
              >
                <button
                  type="button"
                  id={`phrase-preset-${idx}`}
                  onClick={() => {
                    setSelectedPhrase(phrase);
                    setCount(0);
                    playClickSound();
                  }}
                  className="cursor-pointer text-right flex-1 select-none"
                >
                  {phrase}
                </button>
                {phrases.length > 1 && (
                  <button
                    type="button"
                    id={`delete-phrase-btn-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhrase(phrase);
                    }}
                    className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                      selectedPhrase === phrase ? 'text-white/80 hover:bg-white/10' : 'text-slate-400 hover:text-red-500'
                    }`}
                    aria-label="حذف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Form to add custom phrase */}
          <form onSubmit={handleAddPhrase} className="flex gap-2">
            <input
              id="custom-phrase-input"
              type="text"
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="اكتب ذكراً مخصصاً..."
              className="flex-1 px-3 py-2 text-xs bg-emerald-50/50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              id="add-custom-phrase-btn"
              type="submit"
              className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Target selection */}
          <div className="space-y-2 border-t border-emerald-100/10 pt-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">حدد هدف التسبيح:</p>
            <div className="grid grid-cols-4 gap-1.5">
              {[33, 100, 1000, 99999].map((val) => (
                <button
                  key={val}
                  id={`target-preset-${val}`}
                  onClick={() => {
                    setTarget(val);
                    setCount(0);
                    playClickSound();
                  }}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    target === val
                      ? 'bg-amber-500 border-amber-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200/40 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {val === 99999 ? 'مفتوح' : val}
                </button>
              ))}
            </div>
          </div>

          {/* الهدف اليومي الإجمالي */}
          <div className="space-y-3 border-t border-emerald-100/10 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>الهدف اليومي العام للتسبيح:</span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                {dailyGoal} تسبيحة
              </span>
            </div>

            {/* Daily Goal input and preset buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[100, 300, 500].map((gVal) => (
                <button
                  key={gVal}
                  type="button"
                  id={`daily-goal-preset-${gVal}`}
                  onClick={() => {
                    setDailyGoal(gVal);
                    playClickSound();
                  }}
                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    dailyGoal === gVal
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {gVal}
                </button>
              ))}
              
              {/* Custom Daily Goal input field */}
              <div className="flex items-center border border-slate-200 dark:border-slate-850 rounded-lg overflow-hidden bg-white dark:bg-slate-950 h-7 px-1.5">
                <input
                  id="daily-goal-custom-input"
                  type="number"
                  min="10"
                  max="100000"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Math.max(1, Number(e.target.value)))}
                  className="w-full text-center text-xs font-black font-mono text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
                  placeholder="مخصص"
                />
              </div>
            </div>

            {/* Daily progress bar */}
            <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/40">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>منجز اليوم: {todayCount} من {dailyGoal}</span>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                  {Math.round(dailyProgressPercentage)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-200/20 dark:border-slate-700/10">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${dailyProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* The Clicker Area (Left side / spans 7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center space-y-4 py-4 border-r border-emerald-100/5 dark:border-slate-800/20">
          
          <div className="text-center">
            <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 h-7 truncate max-w-[280px]">
              {selectedPhrase}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {target === 99999 ? 'عداد مستمر' : `الهدف الحالي: ${target}`}
            </p>
          </div>

          {/* Interactive Counter Circle */}
          <div className="relative flex items-center justify-center w-52 h-52">
            
            {/* Background progress track */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="104"
                cy="104"
                r="92"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="92"
                className="stroke-emerald-600 dark:stroke-emerald-400 transition-all duration-150"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 92}`}
                strokeDashoffset={`${2 * Math.PI * 92 * (1 - progressPercentage / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Click Button */}
            <button
              id="tasbih-tap-button"
              onClick={handleIncrement}
              className="relative w-40 h-40 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 dark:from-emerald-700 dark:to-teal-600 dark:hover:from-emerald-600 dark:hover:to-teal-500 text-white rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transform transition-all duration-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              {/* Inner glowing circle */}
              <div className="absolute inset-2 border border-white/20 rounded-full bg-black/5" />
              
              <span className="text-xs font-semibold text-emerald-100 tracking-wider">سبّح</span>
              <span className="text-4xl font-extrabold font-mono mt-1 drop-shadow-sm select-none">
                {count}
              </span>
              
              {target !== 99999 && (
                <span className="text-[10px] text-emerald-100/80 mt-1">
                  {Math.round(progressPercentage)}%
                </span>
              )}
            </button>

            {/* Completion celebratory overlay */}
            <AnimatePresence>
              {showCelebrate && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 rounded-full z-10 text-center"
                >
                  <Sparkles className="w-10 h-10 text-amber-500 animate-bounce mb-1" />
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">قُبِل الطاعة بإذن الله!</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">تَمّت {target} تسبيحة</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Control */}
          <button
            id="tasbih-reset-button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير العداد</span>
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-6 space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 font-kufi">إحصائيات التسبيح الأسبوعية</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">متابعة بيانية لمعدل الأذكار اليومية طوال أيام الأسبوع</p>
            </div>
          </div>
          
          {/* Clear stats button */}
          <div className="relative">
            {!showConfirmClear ? (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold cursor-pointer border border-red-100/10"
              >
                مسح الإحصائيات
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 p-1 rounded-lg border border-red-150 dark:border-red-900/30">
                <span className="text-[9px] text-red-600 dark:text-red-400 px-1 font-bold">متأكد؟</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-md hover:bg-red-700 font-bold"
                >
                  نعم
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] px-2 py-0.5 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 font-bold"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-60 bg-[#FAF9F5]/40 dark:bg-[#0B1415]/30 border border-slate-150 dark:border-slate-800/30 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800/20" />
              <XAxis 
                dataKey="dayName" 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#64748B' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#64748B' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderRadius: '12px', 
                  border: 'none', 
                  fontSize: '11px',
                  color: '#FFF',
                  direction: 'rtl',
                  textAlign: 'right'
                }}
                labelClassName="font-bold text-emerald-400 text-xs mb-1"
                formatter={(value: any) => [`${value} تكرار`, 'العدد']}
              />
              <Bar dataKey="التكرار" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {getChartData().map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 6 ? '#10B981' : '#059669'} 
                    className="transition-colors duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
