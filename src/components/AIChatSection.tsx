/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle, Sparkles, MessageSquare, ShieldAlert, Bot, Flag, Check, Copy, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ISLAMIC_AVATARS } from '../assets/avatars';
import { API_BASE, getApiEndpoint } from '../lib/apiConfig';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

interface AIChatSectionProps {
  isEn?: boolean;
}

export default function AIChatSection({ isEn = false }: AIChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'initial',
        sender: 'assistant',
        text: isEn
          ? 'Peace be upon you! Welcome to **Noor Al-Islam AI Assistant**. I am here to help answer your Islamic and religious questions based on the Holy Quran, Sahih Al-Bukhari, Sahih Muslim, and authentic Sunnah.\n\nHow may I assist you with your faith and worship today?'
          : 'السلام عليكم ورحمة الله وبركاته، أهلاً بك في **مستشار نور الإسلام الذكي**. أنا هنا للإجابة عن تساؤلاتك الشرعية والتعليمية والدينية وتوفير الفوائد الأخلاقية بالاعتماد على القرآن الكريم وصحيح البخاري ومسلم والسنة النبوية الشريفة الموثقة. \n\nكيف يمكنني مساعدتك في دينك وعبادتك اليوم؟',
      },
    ];
  });
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<Record<string, boolean>>({});
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('inaccurate');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const presetQuestions = isEn
    ? [
        'Virtues of Qiyam al-Layl (Night Prayer)',
        'Duas for Parents from Quran & Sunnah',
        'Conditions of Sincere Repentance (Tawbah)',
        'Adhkar to relieve anxiety & sorrow',
      ]
    : [
        'ما هي فضائل قيام الليل وكيف نصليه؟',
        'أدعية مأثورة للوالدين من القرآن والسنة',
        'ما هي شروط قبول التوبة النصوح؟',
        'أذكار تقال لطرد الهموم وضيق الصدر',
      ];

  const handleCopyMessage = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenReport = (msgId: string) => {
    setShowReportModal(msgId);
  };

  const handleConfirmReport = () => {
    if (showReportModal) {
      setReportedIds(prev => ({ ...prev, [showReportModal]: true }));
      setShowReportModal(null);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
    };

    setMessages(prev => [...prev, newUserMsg, initialAssistantMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(getApiEndpoint('/api/gemini/qa/stream'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });

      if (!response.body) {
        throw new Error('No body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                const currentText = accumulatedText;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMsgId ? { ...msg, text: currentText } : msg
                  )
                );
              }
            } catch (err) {
              // Ignore chunk edge parse errors
            }
          }
        }
      }

      if (!accumulatedText) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  text: isEn
                    ? '⚠️ Sorry, could not formulate an answer right now. Please try again.'
                    : '⚠️ عذراً، لم أتمكن من صياغة إجابة حالياً. يرجى إعادة المحاولة.',
                }
              : msg
          )
        );
      }
    } catch (e) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMsgId && !msg.text
            ? {
                ...msg,
                text: isEn
                  ? '⚠️ Sorry, an error occurred while connecting. Please check your connection and try again.'
                  : '⚠️ عذراً، حدث خطأ أثناء الاتصال بالخادم. تأكد من اتصال الإنترنت ثم أعد السؤال.',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs flex flex-col min-h-[550px]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-md shrink-0 bg-emerald-950">
            <img 
              src={ISLAMIC_AVATARS.ai} 
              alt="AI Assistant" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-kufi">
              {isEn ? "Noor Al-Islam AI Assistant" : "مستشار نور الإسلام الذكي"}
            </h3>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-amber-500 animate-spin-slow" />
              {isEn ? "Powered by verified Islamic reasoning & Sunnah sources" : "مدعوم بالذكاء الاصطناعي الموثوق للأحكام والسنن"}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isEn ? "Ask religious questions & explore authentic supplications" : "استفسر فقهياً، دينيّاً، أو اطلب أدعية مأثورة"}
        </p>
      </div>

      {/* Warning/Disclaimer bar */}
      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>تنبيه: إجابات المستشار للتعليم والبيان والاسترشاد العام بالاعتماد على مراجع الفقه المعتمدة، ولا تغني عن استشارة كبار العلماء في المسائل المصيرية المعقدة.</span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-[280px] max-h-[360px] overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100/30 dark:border-slate-850 rounded-2xl space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'mr-auto items-start' : 'ml-auto items-end'
            }`}
          >
            {/* Sender Label */}
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 px-1">
              {msg.sender === 'user' ? (isEn ? 'You' : 'أنت') : (isEn ? 'Noor Assistant' : 'مستشار نور الإسلام')}
            </span>

            {/* Message Bubble */}
            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none shadow-xs text-right'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs text-right'
              }`}
            >
              <div className="markdown-body select-text">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {/* Message Actions for AI assistant response (Copy & Report per Apple Guidelines) */}
              {msg.sender === 'assistant' && msg.text && (
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.text, msg.id)}
                    className="hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
                    title={isEn ? "Copy text" : "نسخ النص"}
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">{isEn ? "Copied" : "تم النسخ"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{isEn ? "Copy" : "نسخ"}</span>
                      </>
                    )}
                  </button>

                  <span className="text-slate-300 dark:text-slate-700">•</span>

                  {reportedIds[msg.id] ? (
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{isEn ? "Reported" : "تم الإبلاغ"}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenReport(msg.id)}
                      className="hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer text-slate-400 hover:text-red-500"
                      title={isEn ? "Report inappropriate or inaccurate content (App Store Guideline)" : "إبلاغ عن محتوى غير دقيق أو غير لائق"}
                    >
                      <Flag className="w-3 h-3" />
                      <span>{isEn ? "Report" : "إبلاغ"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading placeholder */}
        {isLoading && (
          <div className="flex flex-col max-w-[80%] ml-auto items-end animate-pulse">
            <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">{isEn ? 'Noor Assistant' : 'مستشار نور الإسلام'}</span>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-500 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-medium">{isEn ? 'Thinking and retrieving Islamic reference...' : 'جاري التفكير وصياغة الرد الشرعي...'}</p>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Preset click suggestions */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pr-1">{isEn ? 'Suggested Questions:' : 'أسئلة مقترحة شائعة:'}</p>
        <div className="flex flex-wrap gap-1.5">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              id={`preset-question-${idx}`}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-emerald-50/50 dark:bg-slate-950/40 hover:bg-emerald-100/40 dark:hover:bg-slate-850 border border-emerald-100/40 dark:border-slate-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleFormSubmit} className="flex gap-2 pt-2">
        <input
          id="chat-input-text"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isEn ? "Ask an Islamic question or request a dua..." : "اكتب سؤالاً دينياً أو فقهياً هنا..."}
          disabled={isLoading}
          className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder-slate-400"
        />
        <button
          id="chat-send-submit-btn"
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          <Send className="w-4 h-4 transform rotate-180" />
        </button>
      </form>

      {/* AI Content Report Modal (Apple Guideline 1.2 UGC/AI Requirement) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl animate-fadeIn text-right">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-kufi font-black text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{isEn ? "Report AI Response" : "الإبلاغ عن إجابة الذكاء الاصطناعي"}</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isEn 
                ? "Help us maintain verified Islamic content. Please select the reason for reporting this response:" 
                : "نحرص على دقة الفتاوى والمحتوى الشرعي. يُرجى اختيار سبب الإبلاغ عن هذه الإجابة:"}
            </p>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value="inaccurate"
                  checked={reportReason === 'inaccurate'}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {isEn ? "Inaccurate or unverified religious statement" : "معلومة شرعية أو نص غير دقيق"}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value="inappropriate"
                  checked={reportReason === 'inappropriate'}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {isEn ? "Inappropriate or irrelevant response" : "إجابة غير لائقة أو خارج السياق"}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value="other"
                  checked={reportReason === 'other'}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {isEn ? "Other issue" : "سبب آخر"}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmReport}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
              >
                {isEn ? "Submit Report" : "إرسال البلاغ"}
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(null)}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isEn ? "Cancel" : "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
