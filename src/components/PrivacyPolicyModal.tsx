import React, { useState } from 'react';
import { Shield, Check, Copy, X, ExternalLink, Mail, Lock, Smartphone, Globe } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
}

export const PRIVACY_POLICY_TEXT_AR = `سياسة الخصوصية الرسمية لتطبيق "نور الإسلام" (Noor Al-Islam)

١. مقدمة والتزام بالخصوصية:
نُولي في تطبيق "نور الإسلام" اهتماماً فائقاً بحماية خصوصية المستخدمين وسلامة بياناتهم وفق إرشادات متجر آبل (App Store Guideline 5.1.1). صُمم التطبيق كصدقة جارية يقدم القرآن الكريم، الأذكار، مواقيت الصلاة، واتجاه القبلة، والمستشار الإسلامي الذكي.

٢. إذن الموقع الجغرافي (Location Usage):
يطلب التطبيق إذن الوصول إلى موقعك الجغرافي الدقيق أو التقريبي فقط لحساب مواقيت الصلاة الفلكية الدقيقة لمدينتك وتحديد زاوية اتجاه القبلة نحو الكعبة المشرفة. لا يتم تتبع المستخدم ولا تخزين بيانات الموقع الجغرافي بشكل دائم في أي خوادم خارجية إطلاقاً.

٣. خدمات الذكاء الاصطناعي والمستشار الإسلامي والتفسير (AI Features):
عند قيام المستخدم بطرح سؤال ديني في "اسأل نور الإسلام" أو طلب تفسير سورة/آية، يتم إرسال نص السؤال فقط بشكل مشفر وآمن عبر HTTPS إلى واجهة الذكاء الاصطناعي (Google Gemini) لتوليد الإجابة الموثوقة. لا يتم إرفاق أي بيانات شخصية، أو أسماء، أو معرفات أجهزة، أو مواقع جغرافية مع استفسارات الذكاء الاصطناعي.

٤. عدم جمع البيانات الشخصية والتخزين المحلي:
التطبيق لا يتطلب تسجيل حساب ولا تسجيل دخول، ويخزن التفضيلات والختمات محلياً على جهازك عبر UserDefaults / LocalStorage فقط.

٥. خلو تام من الإعلانات والتتبع:
التطبيق خالٍ تماماً 100% من الإعلانات التجارية وأدوات التتبع الإعلاني (IDFA)، ولا يبيع أو يشارك أي بيانات مع أي جهة خارجية.

٦. التواصل والمطور المسؤول:
المطور: لؤي بن حسين (Luay Bin Hussein)
البريد الإلكتروني للدعم والخصوصية: lwya0721@gmail.com`;

export const PRIVACY_POLICY_TEXT_EN = `Privacy Policy for "Noor Al-Islam" (نور الإسلام)

1. Overview & Privacy Commitment:
At Noor Al-Islam, we strictly respect and safeguard user privacy in full compliance with Apple App Store Review Guidelines (Guideline 5.1.1). The app provides Holy Quran recitations, daily Adhkar, prayer times, Qibla compass, and an AI Islamic Companion.

2. Location Permission & Usage:
The application requests Location permission (Precise or Coarse GPS) solely to compute astronomical prayer times and determine the Qibla compass heading toward the Holy Kaaba. Location data is processed for immediate calculations and is never permanently stored, logged, or shared with third parties.

3. AI Features & User Query Processing (Smart Assistant & Tafsir):
When a user submits a religious question or requests Tafsir for a specific Ayah/Surah, the entered text query is securely transmitted over encrypted HTTPS to Google Gemini API solely to generate the Islamic response. Zero personal identifiers, names, emails, device IDs, or location coordinates are attached to or transmitted with AI requests.

4. Zero Personal Data Collection & Local Storage:
No user accounts or logins are required. User preferences (Khatma, bookmarks, Tasbih) are stored strictly locally on your device via UserDefaults / LocalStorage.

5. 100% Ad-Free & Zero Tracking:
The app contains no commercial advertising SDKs, IDFA trackers, or data brokers.

6. Contact & Developer Support:
Developer: Luay Bin Hussein
Support & Privacy Email: lwya0721@gmail.com`;

export const APPLE_REVIEW_NOTE_EN = `Hello Apple Review Team,
Regarding the privacy policy and data collection for 'نور الإسلام' (Noor Al-Islam) app:
1. Location Data: Used solely to calculate astronomical prayer times and determine the Qibla direction.
2. User Content (Text Queries): Used solely to generate Islamic answers and Quranic Tafsir via Google Gemini API over encrypted HTTPS with zero user identifiers attached.
3. Local Storage: User preferences (Khatma progress, Tasbih counter, bookmarks) are stored strictly locally via UserDefaults / LocalStorage.
4. No user accounts, no tracking (IDFA = false), and 100% ad-free.
Thank you!`;

export function PrivacyPolicyModal({ isOpen, onClose, isEn = false }: PrivacyPolicyModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ar' | 'en' | 'apple'>('ar');

  if (!isOpen) return null;

  const publicPrivacyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/privacy-policy` 
    : 'https://ais-dev-t3wezzjsald73v3nriwqhe-77969126070.europe-west2.run.app/privacy-policy';

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans pt-[max(calc(env(safe-area-inset-top,0px)+6px),12px)] pb-[max(calc(env(safe-area-inset-bottom,0px)+6px),12px)]">
      <div 
        id="privacy-policy-modal"
        className="w-full max-w-2xl bg-[#FCFAF6] dark:bg-[#070D0E] border border-[#EBE7DF] dark:border-[#142225] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col"
        dir={isEn ? "ltr" : "rtl"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE7DF] dark:border-[#142225] bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-kufi">
                {isEn ? "Privacy Policy & App Store URL" : "رابط وسياسة الخصوصية المعتمدة لمتجر آبل (App Store)"}
              </h3>
              <p className="text-[11px] text-emerald-100/80">
                {isEn ? "Noor Al-Islam • Public Compliance URL" : "تطبيق نور الإسلام • رابط عام معتمد لمتجر آبل"}
              </p>
            </div>
          </div>
          <button
            id="close-privacy-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* 🌟 1. PROMINENT PUBLIC URL CARD FOR APP STORE CONNECT */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-950 via-[#062024] to-[#041215] text-white rounded-2xl border-2 border-emerald-500/40 shadow-lg space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h4 className="text-xs sm:text-sm font-black text-amber-300 font-kufi">
                  {isEn ? "App Store Connect Privacy URL" : "رابط سياسة الخصوصية العام لخانة App Store Connect:"}
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-bold">
                {isEn ? "Active & Public" : "عام ومتاح أونلاين ✓"}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isEn 
                ? "This is the live URL required by Apple in App Store Connect > App Information > Privacy Policy URL." 
                : "هذا هو الرابط العام المباشر المطلوب وضعه في صفحة معلومات التطبيق داخل App Store Connect لقبول التطبيق:"}
            </p>

            {/* URL Box */}
            <div className="p-2.5 sm:p-3 bg-black/60 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-2 overflow-hidden">
              <span className="font-mono text-xs text-amber-300 truncate select-all" dir="ltr">
                {publicPrivacyUrl}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                id="copy-privacy-url-btn"
                type="button"
                onClick={() => handleCopy(publicPrivacyUrl, 'url')}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {copiedSection === 'url' ? (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>تم نسخ الرابط بنجاح! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ رابط الخصوصية لـ App Store</span>
                  </>
                )}
              </button>

              <a
                id="open-web-privacy-link"
                href={publicPrivacyUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 text-center active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>فتح صفحة الويب بالمتصفح 🌐</span>
              </a>
            </div>
          </div>

          {/* 2. Quick Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-emerald-950 dark:text-emerald-300">{isEn ? "Zero Data Collection" : "لا يتم جمع أي بيانات"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "100% Private" : "خصوصية وأمان تام"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-950 dark:text-amber-300">{isEn ? "Local Processing" : "معالجة داخل الجهاز فقط"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "On Device Only" : "بدون خوادم خارجية"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
              <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-teal-950 dark:text-teal-300">{isEn ? "No Ads / No Trackers" : "خالٍ تماماً من الإعلانات"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Clean Experience" : "تجربة إسلامية نقية"}</p>
              </div>
            </div>
          </div>

          {/* 3. Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('ar')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'ar'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              🇸🇦 السياسة (بالعربية)
            </button>
            <button
              onClick={() => setActiveTab('en')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'en'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              🇺🇸 English Policy
            </button>
            <button
              onClick={() => setActiveTab('apple')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'apple'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              🍎 ملاحظات مراجعة آبل
            </button>
          </div>

          {/* Tab 1: Arabic Policy */}
          {activeTab === 'ar' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 font-kufi">
                  نص سياسة الخصوصية المعتمد (باللغة العربية)
                </h4>
                <button
                  id="copy-privacy-ar-btn"
                  type="button"
                  onClick={() => handleCopy(PRIVACY_POLICY_TEXT_AR, 'ar')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  {copiedSection === 'ar' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-2xl text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line shadow-xs max-h-60 overflow-y-auto">
                {PRIVACY_POLICY_TEXT_AR}
              </div>
            </div>
          )}

          {/* Tab 2: English Policy */}
          {activeTab === 'en' && (
            <div className="space-y-3 animate-fadeIn" dir="ltr">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 font-sans">
                  Official Privacy Policy (English for App Store)
                </h4>
                <button
                  id="copy-privacy-en-btn"
                  type="button"
                  onClick={() => handleCopy(PRIVACY_POLICY_TEXT_EN, 'en')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  {copiedSection === 'en' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-2xl text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans whitespace-pre-line shadow-xs max-h-60 overflow-y-auto">
                {PRIVACY_POLICY_TEXT_EN}
              </div>
            </div>
          )}

          {/* Tab 3: Apple Review Notes */}
          {activeTab === 'apple' && (
            <div className="space-y-3 animate-fadeIn" dir="ltr">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 font-sans">
                  Ready-to-Paste App Review Notes (English)
                </h4>
                <button
                  id="copy-apple-note-btn"
                  type="button"
                  onClick={() => handleCopy(APPLE_REVIEW_NOTE_EN, 'apple')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95"
                >
                  {copiedSection === 'apple' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Notes</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-400/30 rounded-2xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-mono space-y-2">
                <p className="font-bold text-amber-700 dark:text-amber-400 font-sans">
                  💡 Paste this note in App Store Connect &gt; App Review Information &gt; Notes:
                </p>
                <div className="p-3 bg-white dark:bg-black/40 rounded-xl border border-amber-500/20 whitespace-pre-line select-all">
                  {APPLE_REVIEW_NOTE_EN}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EBE7DF] dark:border-[#142225] bg-[#FAF8F5] dark:bg-[#050A0B] flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>تطبيق نور الإسلام • متوافق مع معايير App Store</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
