import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock, Bot, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { ISLAMIC_AVATARS } from '../assets/avatars';

interface WelcomeOnboardingModalProps {
  onEnter: (sectionId?: string) => void;
  isEn?: boolean;
}

export default function WelcomeOnboardingModal({
  onEnter,
  isEn = false
}: WelcomeOnboardingModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 12px) + 8px)',
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 12px) + 8px)'
      }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-[#0C1719] text-[#E2EAEB] border border-[#1E3A3E] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col items-center text-center my-auto"
      >
        {/* Glow effect in background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Bismillah */}
        <div className="px-4 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/50 text-amber-300/90 text-xs sm:text-sm font-amiri tracking-wider mb-4 shadow-sm">
          ﷽
        </div>

        {/* Circular Emblem / App Logo */}
        <div className="relative mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-emerald-400 to-amber-200 shadow-xl shadow-emerald-950/50 flex items-center justify-center">
            <img
              src={ISLAMIC_AVATARS.appMainIcon || ISLAMIC_AVATARS.appLogo}
              alt="نور الإسلام"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full border-2 border-[#0C1719] shadow">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* App Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold font-amiri text-emerald-300 drop-shadow mb-1.5">
          {isEn ? 'Welcome to Noor Al-Islam' : 'أهلاً بك في تطبيق نور الإسلام'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xs leading-relaxed mb-5">
          {isEn
            ? 'Your daily companion for accurate prayer times, Holy Quran, Azkar & smart Islamic advice.'
            : 'رفيقك اليومي الشامل لمواقيت الصلاة، القرآن الكريم، الأذكار والاستشارات الإسلامية.'}
        </p>

        {/* Key Features highlights */}
        <div className="w-full grid grid-cols-1 gap-2 sm:gap-2.5 mb-5 text-start">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#142327]/80 border border-[#1E3A3E]">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center shrink-0 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-emerald-200 block">
                {isEn ? 'Accurate Prayer Times & Adhan' : 'مواقيت صلاة دقيقة وتنبيهات الأذان'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isEn ? 'Automatic GPS calculation for any city' : 'حساب تلقائي حسب موقعك الجغرافي وبوصلة القبلة'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#142327]/80 border border-[#1E3A3E]">
            <div className="w-8 h-8 rounded-lg bg-amber-900/50 border border-amber-700/40 flex items-center justify-center shrink-0 text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-amber-200 block">
                {isEn ? 'Holy Quran & Comprehensive Azkar' : 'القرآن الكريم والأذكار اليومية'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isEn ? 'With interpretations and audio recitations' : 'تلاوات صوتية خاشعة وتفسير الآيات وأذكار الصباح والمساء'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#142327]/80 border border-[#1E3A3E]">
            <div className="w-8 h-8 rounded-lg bg-teal-900/50 border border-teal-700/40 flex items-center justify-center shrink-0 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-teal-200 block">
                {isEn ? 'Privacy & Ongoing Charity' : 'خصوصية تامة وبدون إعلانات مزعجة'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isEn ? 'Dedicated as ongoing charity for all Muslims' : 'صدقة جارية عن لؤي بن حسين ووالده رحمه الله'}
              </span>
            </div>
          </div>
        </div>

        {/* Enter Button */}
        <button
          id="enter-app-onboarding-btn"
          type="button"
          onClick={() => onEnter()}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
        >
          <span>{isEn ? 'Enter Application' : 'الدخول إلى التطبيق'}</span>
          <ArrowRight className={`w-4 h-4 ${isEn ? '' : 'rotate-180'}`} />
        </button>

        <p className="text-[10px] text-slate-400 mt-2.5 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>{isEn ? 'This message will only show on first launch' : 'تظهر هذه الرسالة لمرة واحدة فقط عند أول فتح للتطبيق'}</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
