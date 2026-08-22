/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  RefreshCw, 
  Heart, 
  MessageCircle, 
  Send, 
  Twitter,
  Award
} from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';
import { triggerHaptic } from '../utils/nativeBridge';

interface DailyDhikrItem {
  id: number;
  text: string;
  transliteration?: string;
  virtue: string;
  source: string;
  targetCount: number;
  category: string;
}

const DAILY_ADHKAR_COLLECTION: DailyDhikrItem[] = [
  {
    id: 1,
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    virtue: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن.",
    source: "صحيح البخاري ومسلم",
    targetCount: 100,
    category: "كنوز التسبيح"
  },
  {
    id: 2,
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    virtue: "كنز من كنوز الجنة، وباب من أبواب الفرج ودفع الهموم والأحزان.",
    source: "متفق عليه",
    targetCount: 50,
    category: "كنوز الجنة"
  },
  {
    id: 3,
    text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ",
    virtue: "من قالها غُفرت ذنوبه وإن كان فرّ من الزحف.",
    source: "سنن أبي داود والترمذي",
    targetCount: 100,
    category: "الاستغفار والتوبة"
  },
  {
    id: 4,
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ",
    virtue: "من صلى عليّ صلاة صلى الله عليه بها عشراً، وحُطت عنه عشر خطيئات، ورفعت له عشر درجات.",
    source: "صحيح مسلم والنسائي",
    targetCount: 10,
    category: "الصلاة على النبي ﷺ"
  },
  {
    id: 5,
    text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    virtue: "دعوة ذي النون إذ دعا بها في بطن الحوت؛ لم يدعُ بها رجل مسلم في شيء قط إلا استجاب الله له.",
    source: "جامع الترمذي وصحيح الحاكم",
    targetCount: 40,
    category: "تفريج الكروب"
  },
  {
    id: 6,
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    virtue: "كانت له عدل عشر رقاب، وكُتبت له مائة حسنة، ومُحيت عنه مائة سيئة، وكانت له حرزاً من الشيطان يومه ذلك.",
    source: "صحيح البخاري ومسلم",
    targetCount: 100,
    category: "أفضل الذكر"
  },
  {
    id: 7,
    text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ ، نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ",
    virtue: "قالها إبراهيم عليه السلام حين أُلقي في النار، وقالها محمد ﷺ حين قالوا له: إن الناس قد جمعوا لكم فاخشوهم فزادهم إيماناً.",
    source: "صحيح البخاري",
    targetCount: 50,
    category: "التوكل واليقين"
  },
  {
    id: 8,
    text: "رَضِيتُ بِاللَّهِ رَبّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ ﷺ نَبِيّاً وَرَسُولاً",
    virtue: "من قالها حين يصبح وحين يمسي كان حقاً على الله أن يرضيه يوم القيامة.",
    source: "مسند الإمام أحمد والترمذي",
    targetCount: 3,
    category: "الرضا واليقين"
  },
  {
    id: 9,
    text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    virtue: "دعاء النبي ﷺ عند الكرب وإصلاح جميع أمور الدنيا والآخرة.",
    source: "صحيح الحاكم والنسائي",
    targetCount: 7,
    category: "أدعية الاستغاثة"
  },
  {
    id: 10,
    text: "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ",
    virtue: "أحب الكلام إلى الله تعالى، وغراس الجنة، وأفضل ما طلعت عليه الشمس.",
    source: "صحيح مسلم",
    targetCount: 100,
    category: "الباقيات الصالحات"
  }
];

interface DailyDhikrCardProps {
  isEn?: boolean;
}

export default function DailyDhikrCard({ isEn = false }: DailyDhikrCardProps) {
  // Determine index by today's date so it automatically rotates every single day
  const todayDhikr = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = Math.abs(dayOfYear) % DAILY_ADHKAR_COLLECTION.length;
    return DAILY_ADHKAR_COLLECTION[index];
  }, []);

  const storageKey = `noor_daily_dhikr_count_${new Date().toISOString().slice(0, 10)}_${todayDhikr.id}`;
  
  const [recitedCount, setRecitedCount] = useState<number>(() => {
    const saved = safeStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    safeStorage.setItem(storageKey, recitedCount.toString());
  }, [recitedCount, storageKey]);

  const handleIncrement = () => {
    const next = recitedCount + 1;
    setRecitedCount(next);
    if (next >= todayDhikr.targetCount) {
      triggerHaptic('success');
    } else {
      triggerHaptic('tasbih');
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('warning');
    setRecitedCount(0);
  };

  const shareText = `✨ ذكر اليوم من تطبيق نور الإسلام ✨\n\n« ${todayDhikr.text} »\n\n📌 الفضل والأجر: ${todayDhikr.virtue}\n📖 المصدر: ${todayDhikr.source}\n\n📲 تطبيق نور الإسلام - رفيقك اليومي للعبادة والطاعات`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ذكر اليوم - نور الإسلام',
          text: shareText,
        });
      } catch (err) {
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent('https://noor-al-islam.app')}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const isCompleted = recitedCount >= todayDhikr.targetCount;
  const progressPercent = Math.min(100, Math.round((recitedCount / todayDhikr.targetCount) * 100));

  return (
    <div className="bg-gradient-to-br from-[#0B252A] via-[#081C20] to-[#040D0F] border-2 border-amber-400/40 dark:border-amber-400/30 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-6 shadow-xl relative overflow-hidden text-white group">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 rounded-2xl shadow-md font-bold">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black font-kufi text-amber-300">
                {isEn ? "Dhikr of the Day" : "ذِكْرُ الْيَوْمِ الْمُبَارَك"}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {todayDhikr.category}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80">
              {isEn ? "Rotates daily with direct social media sharing" : "يتجدد يومياً تلقائياً مع إمكانية النشر والمشاركة"}
            </p>
          </div>
        </div>

        {/* Share & Copy Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="daily-dhikr-copy-btn"
            onClick={handleCopy}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
              copied 
                ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md' 
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200 hover:text-white'
            }`}
            title={copied ? "تم النسخ بنجاح" : "نسخ ذكر اليوم"}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-bold hidden sm:inline">{copied ? "تم النسخ" : "نسخ"}</span>
          </button>

          <button
            id="daily-dhikr-share-btn"
            onClick={handleNativeShare}
            className="p-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95 text-xs"
            title="مشاركة ذكر اليوم عبر وسائل التواصل"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black hidden sm:inline">نشر</span>
          </button>
        </div>
      </div>

      {/* Share platforms modal/drawer if open */}
      {showShareMenu && (
        <div className="mb-4 p-3 bg-[#030A0C]/95 border border-amber-400/30 rounded-2xl flex items-center justify-around gap-2 text-xs backdrop-blur-md animate-fadeIn">
          <button
            onClick={shareToWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب</span>
          </button>
          <button
            onClick={shareToTelegram}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            <Send className="w-4 h-4" />
            <span>تيليجرام</span>
          </button>
          <button
            onClick={shareToTwitter}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            <Twitter className="w-4 h-4" />
            <span>منصة X</span>
          </button>
          <button
            onClick={() => setShowShareMenu(false)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* Dhikr Core Text Display */}
      <div 
        onClick={handleIncrement}
        className="my-3 p-4 sm:p-5 bg-[#030A0C]/70 hover:bg-[#030A0C]/90 border border-emerald-500/30 hover:border-amber-400/50 rounded-2xl transition-all cursor-pointer select-none group/tap active:scale-[0.99] relative"
        title="اضغط للتسبيح وزيادة العداد"
      >
        <p className="text-lg sm:text-xl md:text-2xl font-amiri font-bold text-amber-200 text-center leading-loose sm:leading-loose">
          « {todayDhikr.text} »
        </p>

        {/* Virtue / Hadith box */}
        <div className="mt-3 pt-3 border-t border-white/10 text-center space-y-1">
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
            {todayDhikr.virtue}
          </p>
          <p className="text-[10px] text-amber-400/90 font-bold font-mono">
            {todayDhikr.source}
          </p>
        </div>

        <span className="absolute bottom-2 left-3 text-[10px] text-slate-400 group-hover/tap:text-amber-300 font-bold transition-colors">
          👆 اضغط في أي مكان للعد
        </span>
      </div>

      {/* Counter & Progress bar */}
      <div className="mt-4 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Progress Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5">
            <Award className={`w-4 h-4 ${isCompleted ? 'text-amber-400 fill-current' : 'text-slate-400'}`} />
            <span className="font-bold text-slate-300">
              الهدف المستحب: <strong className="text-amber-300 font-mono">{todayDhikr.targetCount}</strong> مرة
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-amber-300 font-black font-mono text-sm">
              {recitedCount} / {todayDhikr.targetCount}
            </span>
            {recitedCount > 0 && (
              <button
                onClick={handleReset}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                title="تصفير العداد"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-44 flex items-center gap-2">
          <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-amber-400 to-emerald-400' 
                  : 'bg-gradient-to-r from-emerald-500 to-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">
            {progressPercent}%
          </span>
        </div>
      </div>

    </div>
  );
}
