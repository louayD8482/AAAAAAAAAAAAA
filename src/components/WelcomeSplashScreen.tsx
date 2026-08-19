/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Heart, 
  ArrowRight, 
  Check, 
  Moon, 
  BookOpen, 
  ShieldCheck, 
  Compass, 
  Clock,
  HeartHandshake
} from 'lucide-react';
import { AppSettings } from '../types';
import { ISLAMIC_AVATARS } from '../assets/avatars';

interface WelcomeSplashScreenProps {
  settings: AppSettings;
  isEn?: boolean;
  onEnter: () => void;
}

export default function WelcomeSplashScreen({ settings, isEn = false, onEnter }: WelcomeSplashScreenProps) {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  const handleEnterClick = () => {
    if (dontShowAgain) {
      localStorage.setItem('noor_hide_welcome_splash', 'true');
    }
    onEnter();
  };

  return (
    <motion.div
      id="welcome-splash-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050C0D] text-white p-4 sm:p-6 overflow-y-auto"
      dir={isEn ? "ltr" : "rtl"}
    >
      {/* Background Ambient Glows & Islamic Geometries */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0C292B_0%,#050C0D_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card Shell */}
      <motion.div 
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg bg-gradient-to-b from-[#0B1E21]/95 to-[#061214]/95 border-2 border-emerald-500/30 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6 overflow-hidden my-auto"
      >
        {/* Subtle Decorative Golden Border Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top App Avatar & Golden Crescent Icon */}
        <div className="relative mt-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-xl shadow-amber-500/10 p-1 bg-gradient-to-br from-emerald-800 to-slate-950 group">
            <img 
              src={settings.appLogoUrl || ISLAMIC_AVATARS.appLogo} 
              alt="Logo" 
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 rounded-2xl shadow-lg border border-white/20 animate-bounce">
            <Sparkles className="w-4 h-4 fill-current" />
          </span>
        </div>

        {/* Bismillah Calligraphy */}
        <div className="space-y-2">
          <p className="text-sm sm:text-base font-amiri text-amber-300 font-black tracking-wide leading-relaxed">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1 className="text-2xl sm:text-3xl font-black font-kufi text-white tracking-tight">
            {settings.appName || (isEn ? "Noor Al-Islam" : "نور الإسلام")}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-sm mx-auto leading-relaxed">
            {isEn 
              ? "Your comprehensive spiritual Islamic companion for Quran, Adhkar, and daily prayers." 
              : "رفيقك الروحي الشامل للقرآن الكريم، الأذكار اليومية، التسبيح، ومواقيت الصلاة."}
          </p>
        </div>

        {/* Highlighted Feature Badges Grid */}
        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-right">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-200 truncate">المصحف والتفاسير</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-right">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-200 truncate">أوقات الصلاة والعد</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-right">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-200 truncate">الأذكار والتحصينات</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-right">
            <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-200 truncate">منصة إحسان والعطاء</span>
          </div>
        </div>

        {/* Dedication Banner */}
        <div className="w-full bg-emerald-950/60 border border-emerald-500/20 rounded-2xl p-3.5 text-center space-y-1">
          <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
            {isEn ? "Continuous Charity" : "صدقة جارية"}
          </span>
          <p className="text-xs text-emerald-100 font-amiri leading-relaxed">
            {settings.dedicationText || "صدقة جارية بإذن الله عن لؤي بن حسين وعن والده رحمه الله وغفر له ولجميع المسلمين."}
          </p>
        </div>

        {/* Action Button & Don't Show Again */}
        <div className="w-full space-y-3.5 pt-2">
          <button
            id="splash-enter-app-btn"
            onClick={handleEnterClick}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group font-kufi"
          >
            <span>{isEn ? "Enter Application" : "الدخول إلى التطبيق 🌿"}</span>
            <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isEn ? '' : 'rotate-180 group-hover:-translate-x-1'}`} />
          </button>

          <label className="flex items-center justify-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-black/40 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span>{isEn ? "Don't show this splash screen on next launch" : "عدم إظهار شاشة الترحيب في المرات القادمة"}</span>
          </label>
        </div>

      </motion.div>
    </motion.div>
  );
}
