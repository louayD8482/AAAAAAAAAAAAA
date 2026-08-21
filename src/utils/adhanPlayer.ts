/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ADHAN_VOICES_LIST, AdhanVoiceOption } from '../data/adhan_voices';

let activeAdhanAudio: HTMLAudioElement | null = null;
let currentVoiceId: string = 'makkah';
let onPlayStateChangeCallback: ((isPlaying: boolean) => void) | null = null;
let autoStopTimeoutId: any = null;

export function setAdhanPlayStateCallback(callback: ((isPlaying: boolean) => void) | null) {
  onPlayStateChangeCallback = callback;
}

/**
 * Unlock Web Audio & Audio Context on first user touch/interaction
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    }
  } catch (e) {}
}

/**
 * Play authentic MP3 Adhan audio stream with volume control and automatic stop
 */
export async function playAdhanAudio(voiceId: string = 'makkah', volume: number = 1.0): Promise<HTMLAudioElement | null> {
  // Stop existing audio if playing
  stopAdhanAudio();
  unlockAudio();

  const voice = ADHAN_VOICES_LIST.find(v => v.id === voiceId) || ADHAN_VOICES_LIST[0];
  currentVoiceId = voice.id;

  // Curated high-reliability local MP3 and fallback CDNs for real authentic Muezzins
  const candidateUrls = [
    ...voice.audioUrls,
    `/audio/${voice.id}.mp3`,
    '/audio/makkah.mp3',
    'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Makkah.mp3'
  ];

  for (const url of candidateUrls) {
    try {
      const audio = new Audio();
      audio.src = url;
      // Do not set crossOrigin for same-origin local files to prevent unnecessary CORS preflights
      if (url.startsWith('http')) {
        audio.crossOrigin = 'anonymous';
      }
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.preload = 'auto';

      activeAdhanAudio = audio;

      // Handle natural end of audio
      audio.onended = () => {
        if (activeAdhanAudio === audio) {
          stopAdhanAudio();
        }
      };

      audio.onpause = () => {
        if (onPlayStateChangeCallback) onPlayStateChangeCallback(false);
      };

      audio.onplay = () => {
        if (onPlayStateChangeCallback) onPlayStateChangeCallback(true);
      };

      audio.onerror = (e) => {
        console.warn(`Adhan audio error from source ${url}, attempting next mirror...`, e);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      // Auto-stop safety fallback after full adhan duration (max 5 minutes)
      if (autoStopTimeoutId) clearTimeout(autoStopTimeoutId);
      autoStopTimeoutId = setTimeout(() => {
        stopAdhanAudio();
      }, 300000);

      if (onPlayStateChangeCallback) onPlayStateChangeCallback(true);
      return audio;
    } catch (err) {
      console.warn(`Attempting next adhan source mirror after ${url}:`, err);
    }
  }

  return null;
}

/**
 * Set active adhan volume (0.0 to 1.0)
 */
export function setAdhanVolume(vol: number): void {
  if (activeAdhanAudio) {
    activeAdhanAudio.volume = Math.max(0, Math.min(1, vol));
  }
}

/**
 * Stop active playing Adhan and clean up resources
 */
export function stopAdhanAudio(): void {
  if (autoStopTimeoutId) {
    clearTimeout(autoStopTimeoutId);
    autoStopTimeoutId = null;
  }
  if (activeAdhanAudio) {
    try {
      activeAdhanAudio.pause();
      activeAdhanAudio.currentTime = 0;
    } catch (e) {}
    activeAdhanAudio = null;
    if (onPlayStateChangeCallback) onPlayStateChangeCallback(false);
  }
}

/**
 * Check if Adhan is currently playing
 */
export function isAdhanPlaying(): boolean {
  return activeAdhanAudio !== null && !activeAdhanAudio.paused;
}

/**
 * Get active audio element for custom controls
 */
export function getActiveAdhanAudio(): HTMLAudioElement | null {
  return activeAdhanAudio;
}

/**
 * Play a gentle, soft pre-prayer harmonic chime alert (e.g. 5 minutes before prayer)
 */
export function playPrePrayerChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [
      { freq: 587.33, time: 0.0, duration: 1.2 },
      { freq: 739.99, time: 0.35, duration: 1.2 },
      { freq: 880.00, time: 0.70, duration: 1.4 },
      { freq: 1174.66, time: 1.05, duration: 2.0 }
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch (err) {
    console.warn('Pre-prayer chime audio error:', err);
  }
}

/**
 * Play Iqama / post-prayer alert chime
 */
export function playIqamaChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.9 },
      { freq: 783.99, time: 0.3, duration: 1.5 }
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch (err) {}
}
