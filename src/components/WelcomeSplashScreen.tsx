import React, { useState } from 'react';
import { BookOpen, Clock, Sparkles, Bot, Leaf, ArrowLeft, X } from 'lucide-react';
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
    // Always persist to localStorage on user interaction
    try {
      safeStorage.setItem('noor_hide_welcome_splash', 'true');
      safeStorage.setItem('noor_has_seen_welcome_onboarding', 'true');
    } catch (e) {
      console.warn('Storage write failed', e);
    }
    onEnter(sectionId);
  };

  return (
    <div
      id="welcome-splash-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3.5 sm:p-5 bg-[#050B0D]/95 backdrop-blur-md overflow-y-auto"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 16px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 16px)'
      }}
    >
      <div
        id="welcome-splash-card"
        className="w-full max-w-sm sm:max-w-md bg-[#071315] text-[#E2EAEB] border border-[#143034] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl relative flex flex-col items-center text-center my-auto transition-none"
      >
        {/* Quick Close / Skip button */}
        <button
          type="button"
          onClick={() => handleEnter()}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          title={isEn ? "Close" : "إغلاق"}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bismillah Header Box */}
        <div className="w-full py-2.5 px-4 rounded-2xl border border-amber-600/40 bg-[#071719] text-amber-300 text-sm sm:text-base font-amiri font-bold mb-5 flex items-center justify-center shadow-inner tracking-wide">
          « بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ »
        </div>

        {/* Circular Illuminated Mosque Dome / Emblem */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-amber-500/80 via-emerald-500 to-amber-300 shadow-xl shadow-emerald-950/80 mb-4 flex items-center justify-center">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-emerald-900/60 bg-[#041012]">
            <img
              src={ISLAMIC_AVATARS.appLogo}
              alt="نور الإسلام"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black font-kufi text-white mb-2 tracking-tight">
          {isEn ? 'Welcome to Noor Al-Islam' : 'أهلاً بك في تطبيق نور الإسلام'}
        </h1>

        {/* Subtitle description */}
        <p className="text-xs sm:text-[13px] text-slate-300 max-w-xs sm:max-w-sm leading-relaxed mb-5 font-medium">
          {isEn
            ? 'Your daily companion for worship, accurate prayer times, Holy Quran, Azkar & Smart Islamic Advice.'
            : 'رفيقك اليومي الشامل للعبادة، مواقيت الصلاة والأذان، الأذكار والقرآن الكريم، والمستشار الإسلامي الذكي.'}
        </p>

        {/* 3 Action Buttons */}
        <div className="w-full space-y-2.5 mb-5">
          {/* Button 1: Quran */}
          <button
            type="button"
            onClick={() => handleEnter('quran')}
            className="w-full py-3 px-4 rounded-2xl bg-[#08181A] hover:bg-[#0E2326] active:scale-[0.99] border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isEn ? 'Holy Quran & Tafsir' : 'القرآن والتفسير'}</span>
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>

          {/* Button 2: Prayer times */}
          <button
            type="button"
            onClick={() => handleEnter('prayer')}
            className="w-full py-3 px-4 rounded-2xl bg-[#08181A] hover:bg-[#0E2326] active:scale-[0.99] border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isEn ? 'Prayer Times & Adhan' : 'مواقيت الصلاة'}</span>
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>

          {/* Button 3: AI Fatwa */}
          <button
            type="button"
            onClick={() => handleEnter('ai_fatwa')}
            className="w-full py-3 px-4 rounded-2xl bg-[#08181A] hover:bg-[#0E2326] active:scale-[0.99] border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{isEn ? 'Islamic AI Assistant' : 'الذكاء الإسلامي'}</span>
            <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>
        </div>

        {/* Big Main Gradient CTA Button */}
        <button
          id="welcome-enter-btn"
          type="button"
          onClick={() => handleEnter()}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#22C55E] via-[#F59E0B] to-[#FF5722] hover:brightness-105 active:scale-[0.98] text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-150"
        >
          <ArrowLeft className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>{isEn ? 'Enter Application 🕌' : 'الدخول إلى التطبيق 🕌'}</span>
        </button>

        {/* Small instruction text */}
        <p className="text-[11px] sm:text-xs text-slate-400 mt-3 font-normal">
          {isEn ? 'Tap above to start and access all services' : 'اضغط أعلاه للبدء والاستفادة من كافة الخدمات'}
        </p>

        {/* Don't show again checkbox */}
        <label className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-300 cursor-pointer select-none">
          <span>{isEn ? "Don't show this screen automatically again" : 'عدم إظهار هذه الشاشة مرة أخرى تلقائياً'}</span>
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded-full border-slate-500 text-emerald-600 focus:ring-0 bg-white cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

