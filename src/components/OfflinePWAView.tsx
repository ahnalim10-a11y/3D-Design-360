/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, CheckCircle2, Wifi, Battery, Signal, Smartphone } from 'lucide-react';
import { useI18n } from '../localization/i18n';

interface OfflinePWAViewProps {
  onBack: () => void;
}

export const OfflinePWAView: React.FC<OfflinePWAViewProps> = ({ onBack }) => {
  const { language } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
    } else {
      alert(language === 'bn' ? 'ব্রাউজার মেনু থেকে Add to Home Screen নির্বাচন করুন।' : 'Choose "Add to Home Screen" from your browser menu.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 select-none animate-in fade-in">
      {/* HEADER */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          {language === 'bn' ? 'অফলাইন সাপোর্ট (PWA)' : 'Offline Support (PWA)'}
        </h2>
      </div>

      {/* PHONE MOCKUP MATCHING SCREEN 13 */}
      <div className="my-5 rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-slate-950 text-white p-5 shadow-2xl space-y-5">
        {/* Mockup Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono px-2">
          <span>10:30</span>
          <div className="flex items-center gap-1.5">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={14} />
          </div>
        </div>

        {/* Center App Badge */}
        <div className="flex flex-col items-center text-center space-y-3 pt-3">
          <div className="w-16 h-16 rounded-2xl bg-[#0284C7] flex items-center justify-center text-white shadow-xl shadow-sky-600/30">
            <Home size={32} />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-wide">3D DESIGN 360°</h3>
            <p className="text-[11px] text-sky-400 font-semibold mt-1">
              Add to Home Screen
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              This app can be installed on your device
            </p>
          </div>
        </div>

        {/* Action Button: ইনস্টল করুন */}
        <button
          onClick={handleInstall}
          className="w-full py-3 rounded-2xl bg-[#0284C7] hover:bg-sky-500 active:scale-95 text-white font-bold text-xs shadow-lg transition cursor-pointer"
        >
          {installed ? 'ইনস্টল সম্পন্ন হয়েছে' : 'ইনস্টল করুন'}
        </button>

        {/* CHECKLIST MATCHING SCREEN 13 */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>অফলাইন অ্যাক্সেস (Offline Access)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>সার্ভিস ওয়ার্কার (Service Worker Active)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>অ্যাপ ম্যানিফেস্ট (Manifest Standalone)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>অ্যাপ আইকন (High-Res SVG & PNG)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
