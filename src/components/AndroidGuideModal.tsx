/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useI18n } from '../localization/i18n';
import { Smartphone, X, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useI18n();
  const [copiedStep, setCopiedStep] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      titleBn: 'ধাপ ১: ক্যাপাসিটর ডিপেন্ডেন্সি ইনস্টল করুন',
      titleEn: 'Step 1: Install Capacitor in your project directory',
      command: 'npm install @capacitor/core @capacitor/android && npm install -D @capacitor/cli',
      descBn: 'ক্যাপাসিটর দিয়ে এই আধুনিক ওয়েব অ্যাপ্লিকেশনটিকে সরাসরি অ্যান্ড্রয়েড স্টুডিও প্রোজেক্টে রূপান্তর করা যায়।',
      descEn: 'Capacitor wraps this responsive Vite React application into a high-performance native Android container.',
    },
    {
      titleBn: 'ধাপ ২: ক্যাপাসিটর কনফিগারেশন ইনিশিয়ালাইজ করুন',
      titleEn: 'Step 2: Initialize Capacitor config',
      command: 'npx cap init "3D DESIGN 360" "com.architecture360.app" --web-dir dist',
      descBn: 'অ্যাপ্লিকেশনের প্যাকেজ আইডি এবং বিল্ড আউটপুট ডিরেক্টরি (dist) নির্ধারণ করুন।',
      descEn: 'Sets the application bundle ID and connects the build output folder.',
    },
    {
      titleBn: 'ধাপ ৩: অ্যান্ড্রয়েড প্ল্যাটফর্ম যোগ করুন',
      titleEn: 'Step 3: Add the Android platform project',
      command: 'npx cap add android',
      descBn: 'এটি আপনার প্রজেক্টে একটি সম্পূর্ণ তৈরি করা Android Studio প্রজেক্ট ফোল্ডার (/android) তৈরি করবে।',
      descEn: 'Generates a ready-to-build Android Studio project inside the /android folder.',
    },
    {
      titleBn: 'ধাপ ৪: প্রোডাকশন বিল্ড তৈরি করে অ্যান্ড্রয়েডে সিঙ্ক করুন',
      titleEn: 'Step 4: Build web app and sync assets',
      command: 'npm run build && npx cap sync',
      descBn: 'আপনার সকল ২ডি প্ল্যানার, ৩ডি ইঞ্জিন, PWA ফাইল ও আইকন অ্যান্ড্রয়েড প্রজেক্টে কপি হবে।',
      descEn: 'Compiles the optimized web bundle and syncs icons and manifest to the Android asset container.',
    },
    {
      titleBn: 'ধাপ ৫: অ্যান্ড্রয়েড স্টুডিওতে খুলুন ও APK তৈরি করুন',
      titleEn: 'Step 5: Open Android Studio & Build Signed APK',
      command: 'npx cap open android',
      descBn: 'অ্যান্ড্রয়েড স্টুডিও ওপেন হলে Build > Generate Signed Bundle / APK নির্বাচন করে APK ডাউনলোড করুন।',
      descEn: 'Android Studio opens. Select Build > Generate Signed Bundle / APK to generate the distributable APK or Play Store Bundle.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {t.androidReadyTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.androidGuideDescription}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* GUIDE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 flex items-start gap-2.5">
            <ShieldCheck size={20} className="text-sky-600 shrink-0 mt-0.5" />
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-sky-700 dark:text-sky-300 block mb-0.5">
                {language === 'bn' ? 'অ্যান্ড্রয়েড রেডি ফিচারসমূহ নিশ্চিত করা হয়েছে:' : 'Android-Ready Verification:'}
              </strong>
              {language === 'bn'
                ? 'মোবাইল টাচ পিঞ্চ জুম, ডুয়াল টাচ প্যান, অফলাইন IndexedDB স্টোরেজ, Web App Manifest ও PWA আইকন ইতিমধ্যেই কনফিগার করা আছে। নিচের কমান্ডগুলো দিয়ে সরাসরি APK জেনারেট করুন।'
                : 'Touch gestures (pinch zoom, canvas pan), offline IndexedDB storage, Web App Manifest and PWA responsive viewports are pre-configured. Follow these commands to generate the native APK.'}
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{language === 'bn' ? st.titleBn : st.titleEn}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'bn' ? st.descBn : st.descEn}
                </p>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-sky-300 border border-slate-800">
                  <span className="truncate">{st.command}</span>
                  <button
                    onClick={() => copyToClipboard(st.command, idx)}
                    className="shrink-0 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    title="Copy command"
                  >
                    {copiedStep === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
