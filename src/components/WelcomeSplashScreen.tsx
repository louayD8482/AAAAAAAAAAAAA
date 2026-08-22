import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { ISLAMIC_AVATARS } from '../assets/avatars';
import { safeStorage } from '../utils/safeStorage';

interface WelcomeSplashScreenProps {
  onEnter: (sectionId?: string) => void;
  isEn?: boolean;
}

export default function WelcomeSplashScreen({
  onEnter,
  isEn = false
}: WelcomeSplashScreenProps) {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  const handleEnter = (sectionId?: string) => {
    if (dontShowAgain) {
      safeStorage.setItem('noor_hide_welcome_splash', 'true');
      safeStorage.setItem('noor_has_seen_welcome_onboarding', 'true');
    }
    onEnter(sectionId);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[#070D0E] overflow-y-auto"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)'
      }}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-[#0A1416] text-[#E2EAEB] border border-emerald-800/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative flex flex-col items-center text-center my-auto transition-none"
      >
        {/* Bismillah Header Badge */}
        <div className="px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-amber-300 text-xs sm:text-sm font-amiri font-bold mb-4 shadow-sm">
          « بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ »
        </div>

        {/* Circular Emblem / App Icon */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-emerald-400 to-amber-300 shadow-xl shadow-emerald-950/60 mb-3 flex items-center justify-center">
          <img
            src={ISLAMIC_AVATARS.appMainIcon || ISLAMIC_AVATARS.appLogo}
            alt="نور الإسلام"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold font-cairo text-white mb-1.5">
          {isEn ? 'Welcome to Noor Al-Islam' : 'أهلاً بك في تطبيق نور الإسلام'}
        </h1>

        {/* Subtitle description */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-xs leading-relaxed mb-4">
          {isEn
            ? 'Your daily companion for accurate prayer times, Holy Quran, Azkar & Smart Islamic Advice.'
            : 'رفيقك اليومي الشامل لمواقيت الصلاة والأذان والأذكار والقرآن الكريم والمستشار الإسلامي الذكي.'}
        </p>

        {/* 3 Quick direct service buttons */}
        <div className="w-full space-y-2 mb-4">
          <button
            type="button"
            onClick={() => handleEnter('quran')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0F2023] hover:bg-[#152B30] active:scale-[0.99] border border-emerald-800/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Holy Quran & Tafsir 📖' : 'القرآن والتفسير 📖'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleEnter('prayer')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0F2023] hover:bg-[#152B30] active:scale-[0.99] border border-emerald-800/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{isEn ? 'Prayer Times & Adhan 🕒' : 'مواقيت الصلاة 🕒'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleEnter('ai_fatwa')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0F2023] hover:bg-[#152B30] active:scale-[0.99] border border-emerald-800/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isEn ? 'Islamic AI Assistant ✨' : 'الذكاء الإسلامي ✨'}</span>
          </button>
        </div>

        {/* Big Main CTA Button */}
        <button
          id="welcome-enter-btn"
          type="button"
          onClick={() => handleEnter()}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 hover:from-emerald-500 hover:to-amber-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
        >
          <span>{isEn ? 'Enter Application 🕌' : 'الدخول إلى التطبيق 🕌'}</span>
          <ArrowRight className={`w-4 h-4 ${isEn ? '' : 'rotate-180'}`} />
        </button>

        {/* Small instruction text */}
        <p className="text-[11px] text-slate-400 mt-2">
          {isEn ? 'Tap above to start and access all services' : 'اضغط أعلاه للبدء والاستفادة من كافة الخدمات'}
        </p>

        {/* Don't show again checkbox */}
        <label className="flex items-center justify-center gap-2 mt-3.5 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded border-emerald-700 text-emerald-600 focus:ring-emerald-500 bg-[#0C191B] cursor-pointer"
          />
          <span>{isEn ? "Don't show this screen automatically again" : 'عدم إظهار هذه الشاشة مرة أخرى تلقائياً'}</span>
        </label>
      </div>
    </div>
  );
}
