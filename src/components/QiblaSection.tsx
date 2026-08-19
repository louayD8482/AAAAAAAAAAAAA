/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Compass, Info, MapPin, RefreshCw, Smartphone } from 'lucide-react';

interface QiblaSectionProps {
  latitude: number | null;
  longitude: number | null;
  isEn?: boolean;
}

// Fixed Qibla directions (azimuths from North) for popular locations
const QIBLA_AZIMUTHS: { [key: string]: { angle: number; desc: string; descEn: string } } = {
  'الرياض': { angle: 255, desc: 'غرباً مع ميل طفيف للجنوب', descEn: 'West with a slight southward tilt' },
  'مكة المكرمة': { angle: 0, desc: 'أنت في مكة المكرمة شرفها الله!', descEn: 'You are in Makkah al-Mukarramah!' },
  'المدينة المنورة': { angle: 180, desc: 'جنوباً تماماً باتجاه مكة', descEn: 'Due south towards Makkah' },
  'جدة': { angle: 115, desc: 'شرقاً مع ميل للجنوب', descEn: 'East with a slight southward tilt' },
  'الدمام': { angle: 247, desc: 'غرباً مع ميل للجنوب', descEn: 'West leaning south' },
  'القاهرة': { angle: 136, desc: 'جنوب شرق باتجاه مكة', descEn: 'South East towards Makkah' },
  'دبي': { angle: 262, desc: 'غرباً تماماً تقريباً', descEn: 'Almost due West' },
};

export default function QiblaSection({ latitude, longitude, isEn = false }: QiblaSectionProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('الرياض');
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [isSensorAvailable, setIsSensorAvailable] = useState<boolean>(false);
  const [manualRotateAngle, setManualRotateAngle] = useState<number>(0);

  // Kaaba Coordinates: Lat 21.4225, Lng 39.8262
  const kaabaAngle = QIBLA_AZIMUTHS[selectedRegion]?.angle ?? 255;

  useEffect(() => {
    // Check if device orientation is supported
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is specific to iOS Safari
      const heading = (e as any).webkitCompassHeading || e.alpha;
      if (heading !== undefined && heading !== null) {
        setDeviceHeading(Math.round(heading));
        setIsSensorAvailable(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Compute Kaaba direction relative to heading
  // If sensor is active, the relative Kaaba angle is: Qibla - heading
  const calculatedRelativeAngle = deviceHeading !== null 
    ? (kaabaAngle - deviceHeading + 360) % 360
    : (kaabaAngle - manualRotateAngle + 360) % 360;

  // Let's determine if aligned (within 5 degrees)
  const isAligned = Math.abs((calculatedRelativeAngle + 180) % 360 - 180) < 6;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </span>
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{isEn ? 'Interactive Qibla Finder' : 'محدد اتجاه القِبلة الشريفة'}</h3>
        </div>
        
        {/* City selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <select
            id="qibla-region-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none"
          >
            {Object.keys(QIBLA_AZIMUTHS).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Descriptive details (Right / spans 5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-4 bg-emerald-50/50 dark:bg-slate-950/40 rounded-2xl border border-emerald-100/10 space-y-3">
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              {isEn ? `Qibla Information for ${selectedRegion}` : `معلومات القبلة لمدينة ${selectedRegion}`}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                • {isEn ? 'Qibla Angle from North:' : 'زاوية القبلة من الشمال:'} <strong className="text-slate-800 dark:text-slate-200">{kaabaAngle}°</strong>
              </li>
              <li>
                • {isEn ? 'Direction:' : 'الاتجاه التقريبي:'} <strong className="text-slate-800 dark:text-slate-200">{isEn ? QIBLA_AZIMUTHS[selectedRegion]?.descEn : QIBLA_AZIMUTHS[selectedRegion]?.desc}</strong>
              </li>
              <li>
                • {isEn ? 'Sensor Status:' : 'حالة المستشعر:'}{' '}
                <span className={`font-bold ${isSensorAvailable ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {isSensorAvailable 
                    ? (isEn ? 'Active Compass' : 'نشط وتلقائي') 
                    : (isEn ? 'Manual (Rotate slider below)' : 'يدوي (قم بالتدوير لتحديد اتجاهك)')}
                </span>
              </li>
            </ul>
          </div>

          {/* If compass is manual, show slider to rotate phone/orientation */}
          {!isSensorAvailable && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isEn ? 'Rotate compass manually to simulate current facing angle:' : 'قم بتدوير البوصلة يدوياً لمحاكاة اتجاه وقوفك الحالي:'}
              </label>
              <input
                id="qibla-manual-slider"
                type="range"
                min="0"
                max="359"
                value={manualRotateAngle}
                onChange={(e) => setManualRotateAngle(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0° ({isEn ? 'North' : 'شمال'})</span>
                <span>90° ({isEn ? 'East' : 'شرق'})</span>
                <span>180° ({isEn ? 'South' : 'جنوب'})</span>
                <span>270° ({isEn ? 'West' : 'غرب'})</span>
              </div>
            </div>
          )}

          {/* Alignment feedback message */}
          <div className={`p-3.5 rounded-2xl text-xs font-bold text-center border transition-all ${
            isAligned
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-100 dark:border-slate-850'
          }`}>
            🎯 {isAligned 
              ? (isEn ? 'You are facing the Qibla! May Allah accept your prayer.' : 'أنت باتجاه القبلة الصحيح الآن! صلّ طاهراً مقبولاً.') 
              : (isEn ? 'Rotate the compass until the indicator turns green.' : 'أدر البوصلة حتى يضيء المؤشر الأخضر للاتجاه.')}
          </div>
        </div>

        {/* Graphical Compass (Left / spans 7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center py-4">
          
          {/* Outer compass ring */}
          <div className="relative w-56 h-56 bg-slate-50 dark:bg-slate-950 border-4 border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            
            {/* Kaaba Marker arrow (rotates inside the compass) */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
              style={{ transform: `rotate(${calculatedRelativeAngle}deg)` }}
            >
              {/* Kaaba Arrow indicator at top */}
              <div className="absolute top-2 flex flex-col items-center">
                {/* Glowing green pointer */}
                <div className={`w-0 h-0 border-l-8 border-r-8 border-b-14 border-transparent transition-colors ${
                  isAligned ? 'border-b-emerald-500' : 'border-b-amber-500'
                }`} />
                {/* Small Kaaba box image/icon */}
                <span className="text-xl mt-1 select-none">🕋</span>
              </div>
            </div>

            {/* Inner Compass Card with letters (N, E, S, W) - rotates inversely with manual/sensor angle */}
            <div
              className="absolute w-44 h-44 border-2 border-slate-100 dark:border-slate-900 rounded-full flex items-center justify-center transition-transform duration-200 bg-white dark:bg-slate-900 shadow-inner"
              style={{ transform: `rotate(${- (deviceHeading ?? manualRotateAngle)}deg)` }}
            >
              {/* Directions text */}
              <span className="absolute top-1 text-xs font-bold text-rose-500">N</span>
              <span className="absolute right-1 text-xs font-bold text-slate-400">E</span>
              <span className="absolute bottom-1 text-xs font-bold text-slate-400">S</span>
              <span className="absolute left-1 text-xs font-bold text-slate-400">W</span>

              {/* Decorative traditional center rose */}
              <div className="w-10 h-10 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-700/60" />
              </div>
            </div>

            {/* Absolute indicator for Kaaba line if aligned */}
            {isAligned && (
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full pointer-events-none animate-ping opacity-30" />
            )}
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {isSensorAvailable 
                ? `اتجاه هاتف الحالي: ${deviceHeading}°` 
                : `زاوية المحاكاة يدوياً: ${manualRotateAngle}°`}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
