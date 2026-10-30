/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useI18n } from '../localization/i18n';
import { ThemeMode } from '../types';
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Ruler,
  Coins,
  Moon,
  Sun,
  Bell,
  Database,
  Info,
} from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenExport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  theme,
  onToggleTheme,
  onOpenExport,
}) => {
  const { language, setLanguage } = useI18n();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 select-none animate-in fade-in">
      {/* HEADER MATCHING SCREEN 14 */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          {language === 'bn' ? 'সেটিংস' : 'Settings'}
        </h2>
      </div>

      {/* SETTINGS MENU LIST MATCHING SCREEN 14 */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 my-4 text-xs font-semibold">
        {/* ভাষা */}
        <div
          onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-[#0284C7]" />
            <span className="text-slate-800 dark:text-slate-200">ভাষা</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{language === 'bn' ? 'বাংলা / English' : 'English / বাংলা'}</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* একক */}
        <div className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer">
          <div className="flex items-center gap-3">
            <Ruler size={18} className="text-blue-600" />
            <span className="text-slate-800 dark:text-slate-200">একক</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>ফুট ও ইঞ্চি</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* মুদ্রা */}
        <div className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer">
          <div className="flex items-center gap-3">
            <Coins size={18} className="text-amber-600" />
            <span className="text-slate-800 dark:text-slate-200">মুদ্রা</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>টাকা (BDT)</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* থিম */}
        <div
          onClick={onToggleTheme}
          className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
            <span className="text-slate-800 dark:text-slate-200">থিম</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{theme === 'dark' ? 'ডার্ক মোড' : 'লাইট মোড'}</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* নোটিফিকেশন */}
        <div className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-rose-600" />
            <span className="text-slate-800 dark:text-slate-200">নোটিফিকেশন</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ChevronRight size={16} />
          </div>
        </div>

        {/* ডেটা ব্যাকআপ */}
        <div
          onClick={onOpenExport}
          className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Database size={18} className="text-emerald-600" />
            <span className="text-slate-800 dark:text-slate-200">ডেটা ব্যাকআপ</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ChevronRight size={16} />
          </div>
        </div>

        {/* অ্যাপ সম্পর্কে */}
        <div
          onClick={() => alert('3D DESIGN 360° — Version 2.0\nProfessional Architectural Planning & 3D Modeling')}
          className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Info size={18} className="text-cyan-600" />
            <span className="text-slate-800 dark:text-slate-200">অ্যাপ সম্পর্কে</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
