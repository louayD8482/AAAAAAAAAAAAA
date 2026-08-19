/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ADHAN_VOICES_LIST, AdhanVoiceOption } from '../data/adhan_voices';

let activeAdhanAudio: HTMLAudioElement | null = null;
let currentVoiceId: string = 'makkah';

/**
 * Play the authentic Adhan audio stream for the selected voice
 */
export async function playAdhanAudio(voiceId: string = 'makkah', volume: number = 1.0): Promise<HTMLAudioElement | null> {
  // Stop existing audio if playing
  stopAdhanAudio();

  const voice = ADHAN_VOICES_LIST.find(v => v.id === voiceId) || ADHAN_VOICES_LIST[0];
  currentVoiceId = voice.id;

  // Try each audio URL in sequence
  for (const url of voice.audioUrls) {
    try {
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1, volume));
      activeAdhanAudio = audio;

      // Handle completion
      audio.onended = () => {
        if (activeAdhanAudio === audio) {
          activeAdhanAudio = null;
        }
      };

      await audio.play();
      return audio;
    } catch (err) {
      console.warn(`Failed to play adhan from ${url}, trying next mirror...`, err);
    }
  }

  // Fallback to Makkah Adhan primary
  try {
    const fallbackAudio = new Audio('https://www.islamcan.com/audio/adhan/azan1.mp3');
    fallbackAudio.volume = volume;
    activeAdhanAudio = fallbackAudio;
    await fallbackAudio.play();
    return fallbackAudio;
  } catch (err) {
    console.error('All adhan audio mirrors failed to play:', err);
    return null;
  }
}

/**
 * Stop active playing Adhan
 */
export function stopAdhanAudio(): void {
  if (activeAdhanAudio) {
    try {
      activeAdhanAudio.pause();
      activeAdhanAudio.currentTime = 0;
    } catch (e) {}
    activeAdhanAudio = null;
  }
}

/**
 * Check if Adhan is currently playing
 */
export function isAdhanPlaying(): boolean {
  return activeAdhanAudio !== null && !activeAdhanAudio.paused;
}

/**
 * Play a gentle, soft pre-prayer harmonic chime alert (e.g. 5 minutes before prayer)
 * Uses high quality Web Audio harmonic bells so it is distinct from the full Adhan and works 100% offline
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

    // Melodic sequence for pre-prayer calm reminder: D5 -> F#5 -> A5 -> D6
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

      // Soft envelope
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

    // Double chime: C5 -> G5
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
