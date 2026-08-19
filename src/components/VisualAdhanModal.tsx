/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Bell, Volume2, VolumeX, X, Heart, Shield } from 'lucide-react';
import { formatTime12 } from '../utils/formatTime';

interface VisualAdhanModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  arabicName: string;
  time: string;
  city: string;
  supplication: string;
  tip: string;
  soundEnabled: boolean;
  isEn?: boolean;
}

export default function VisualAdhanModal({
  isOpen,
  onClose,
  prayerName,
  arabicName,
  time,
  city,
  supplication,
  tip,
  soundEnabled,
  isEn = false
}: VisualAdhanModalProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(soundEnabled);
  const [muadhin, setMuadhin] = useState<'makkah' | 'madinah'>('makkah');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  const ADHAN_SOURCES = {
    makkah: 'https://cdn.aladhan.com/audio/adhans/adhan_makkah.mp3',
    madinah: 'https://cdn.aladhan.com/audio/adhans/adhan_madinah.mp3'
  };

  // Function to play authentic real Adhan audio
  const playRealAdhan = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.src = ADHAN_SOURCES[muadhin];
      audio.volume = 1.0;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Real Adhan mp3 play blocked, playing synthesized serene chime fallback:', err);
        playSereneChime();
      });
    } catch {
      playSereneChime();
    }
  };

  const stopAdhanAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    stopChime();
    setIsPlaying(false);
  };

  // Function to synthesize beautiful serene spiritual rising chords fallback
  const playSereneChime = () => {
    try {
      stopChime();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      activeNodesRef.current = [];

      const playTone = (freq: number, startTime: number, duration: number, volume = 0.05) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + startTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + startTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + startTime);
        osc.stop(audioCtx.currentTime + startTime + duration);
        activeNodesRef.current.push(osc);
      };

      playTone(349.23, 0.0, 3.5, 0.05);
      playTone(440.00, 0.4, 3.5, 0.05);
      playTone(523.25, 0.8, 4.0, 0.05);
      playTone(698.46, 1.2, 4.5, 0.04);
      playTone(880.00, 2.0, 3.0, 0.02);
      setIsPlaying(true);
    } catch (e) {
      console.log('Chime playback failed:', e);
    }
  };

  const stopChime = () => {
    try {
      activeNodesRef.current.forEach(node => {
        try { node.stop(); } catch(e){}
      });
      activeNodesRef.current = [];
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Play immediately if sound is enabled on mount
  useEffect(() => {
    if (isOpen) {
      if (soundEnabled) {
        const timer = setTimeout(() => {
          playRealAdhan();
        }, 200);
        return () => clearTimeout(timer);
      }
    }
    return () => stopAdhanAudio();
  }, [isOpen, muadhin]);

  const handleToggleSound = () => {
    if (isPlaying) {
      stopAdhanAudio();
    } else {
      playRealAdhan();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md text-right font-sans"
        dir="rtl"
      >
        <motion.div
          id="visual-adhan-modal-card"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 border-2 border-emerald-500/30 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Islamic Star background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-80" />
          
          {/* Header Close button */}
          <button
            id="close-visual-adhan-alert"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-slate-300 hover:text-white cursor-pointer z-10"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Banner Accent */}
          <div className="flex flex-col items-center text-center space-y-3 z-10">
            <span className="p-3 bg-emerald-500/10 text-amber-300 border border-emerald-500/20 rounded-2xl animate-bounce">
              <Bell className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black tracking-widest rounded-full border border-emerald-500/20">
                <Sparkles className="w-3 h-3 animate-pulse text-amber-300" />
                {isEn ? 'IT IS NOW PRAYER TIME' : 'حان الآن موعد الأذان'}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-amber-300 tracking-wide drop-shadow-sm font-amiri py-1">
                {isEn ? `${prayerName} Prayer` : `صلاة ${arabicName}`}
              </h2>
              <p className="text-xs text-emerald-200/80 font-medium">
                {isEn ? 'A blessed call to prayer and devotion to Allah' : 'تنبيه مبارك لدخول وقت الصلاة والنداء لطاعة الرحمن'}
              </p>
            </div>
          </div>

          {/* Main Info Blocks with custom scrolling wrapper */}
          <div className="mt-6 space-y-5 flex-1 overflow-y-auto pr-1 z-10 scrollbar-thin">
            {/* Hour & City Badge */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 font-bold">{isEn ? 'Current City' : 'المدينة الحالية'}</span>
                <span className="text-sm font-extrabold text-white">{city}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-bold">{isEn ? 'Adhan Time' : 'وقت الأذان'}</span>
                <span className="text-xl font-mono font-black text-amber-300">{formatTime12(time, isEn)}</span>
              </div>
            </div>

            {/* Supplication Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5 space-y-2 relative">
              <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
                <Heart className="w-4 h-4 fill-current text-amber-400 animate-pulse" />
                <span>{isEn ? 'Prayer Call Supplication:' : 'دعاء دخول وقت الصلاة:'}</span>
              </div>
              <p className="text-sm md:text-[15px] font-medium leading-relaxed text-slate-150 text-justify font-amiri select-all">
                "{supplication}"
              </p>
            </div>

            {/* Religious Advice / Tip Card */}
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{isEn ? 'Islamic Wisdom & Virtue:' : 'نصيحة وفضيلة دينية:'}</span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-slate-200 text-justify">
                {tip}
              </p>
            </div>
          </div>

          {/* Controls & Accept Button */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
            {/* Serene Chime Control Button */}
            <button
              id="visual-adhan-play-chime-btn"
              onClick={handleToggleSound}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-md' 
                  : 'bg-white/10 hover:bg-white/15 text-slate-250 border border-white/5'
              }`}
            >
              {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isPlaying ? (isEn ? 'Mute Alert Chime' : 'إيقاف نغمة التنبيه') : (isEn ? 'Play Alert Chime' : 'استماع لنغمة التنبيه')}</span>
            </button>

            {/* Accept Close Button */}
            <button
              id="visual-adhan-accept-close-btn"
              onClick={onClose}
              className="w-full sm:flex-1 py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-center"
            >
              {isEn ? 'May Allah Accept Your Worship (Close)' : 'تقبّل اللّٰه طاعاتكم (إغلاق)'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
