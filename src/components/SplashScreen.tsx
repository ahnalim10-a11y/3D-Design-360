/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Home, ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '../localization/i18n';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const { language } = useI18n();

  return (
    <div className="relative w-full min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Background Architectural Blueprint Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 dark:opacity-20 pointer-events-none" />

      {/* Decorative Blueprint House Outlines */}
      <div className="absolute -top-12 -left-12 w-64 h-64 border-2 border-sky-400/20 rounded-full pointer-events-none blur-xl" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 border-2 border-blue-500/20 rounded-full pointer-events-none blur-2xl" />

      {/* CENTER CARD */}
      <div className="relative z-10 max-w-sm w-full flex flex-col items-center text-center p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-sky-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Isometric 3D Cube Logo as shown in Screen 1 */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#0284C7] via-[#0369A1] to-[#38BDF8] flex items-center justify-center shadow-2xl shadow-sky-500/40 rotate-3 group-hover:rotate-0 transition duration-300">
            <div className="w-16 h-16 rounded-xl border-2 border-white/80 flex items-center justify-center">
              <Home size={34} className="text-white drop-shadow" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[10px] font-black text-[#0284C7] shadow border border-sky-200">
            360°
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            3D DESIGN <span className="text-[#0284C7]">360°</span>
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Plan • Design • Visualize • Build
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 leading-relaxed">
            {language === 'bn'
              ? 'মোবাইল ও কম্পিউটারে আপনার স্বপ্নের বাড়ি নিজে ডিজাইন করুন'
              : 'Design and visualize your dream home in full 2D and 3D'}
          </p>
        </div>

        {/* Action Button: শুরু করুন */}
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#0284C7] hover:bg-sky-600 active:scale-95 text-white font-bold text-sm shadow-xl shadow-sky-600/30 transition cursor-pointer"
        >
          <span>{language === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
