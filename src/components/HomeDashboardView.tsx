/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ViewTab } from '../types';
import { useI18n } from '../localization/i18n';
import {
  PlusCircle,
  Square,
  Box,
  RotateCw,
  Armchair,
  Trees,
  Home,
  Calculator,
  Coins,
  FolderOpen,
  Settings,
  Bell,
  Globe,
} from 'lucide-react';

interface HomeDashboardViewProps {
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewProject: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onSelectTab,
  onOpenNewProject,
}) => {
  const { language, setLanguage } = useI18n();

  // 9 Core Grid Cards matching Screen 2 in reference image
  const gridCards = [
    {
      id: 'new_project',
      labelBn: 'নতুন প্রজেক্ট',
      labelEn: 'New Project',
      icon: <PlusCircle size={28} className="text-[#0284C7]" />,
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      action: onOpenNewProject,
    },
    {
      id: 'planner2d',
      labelBn: '২D ফ্লোর প্ল্যান',
      labelEn: '2D Floor Plan',
      icon: <Square size={28} className="text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      action: () => onSelectTab('planner2d'),
    },
    {
      id: 'studio3d',
      labelBn: '৩D ডিজাইন স্টুডিও',
      labelEn: '3D Design Studio',
      icon: <Box size={28} className="text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      action: () => onSelectTab('studio3d'),
    },
    {
      id: 'view360',
      labelBn: '৩৬০° ভিউ',
      labelEn: '360° View',
      icon: <RotateCw size={28} className="text-purple-600 dark:text-purple-400" />,
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      action: () => onSelectTab('view360'),
    },
    {
      id: 'interior',
      labelBn: 'ইন্টেরিয়র ডিজাইন',
      labelEn: 'Interior Design',
      icon: <Armchair size={28} className="text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      action: () => onSelectTab('interior'),
    },
    {
      id: 'roof_designer',
      labelBn: 'এক্সটেরিয়র ডিজাইন',
      labelEn: 'Exterior Design',
      icon: <Trees size={28} className="text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      action: () => onSelectTab('roof_designer'),
    },
    {
      id: 'templates',
      labelBn: 'হাউস টেমপ্লেট',
      labelEn: 'House Templates',
      icon: <Home size={28} className="text-teal-600 dark:text-teal-400" />,
      bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
      action: () => onSelectTab('templates'),
    },
    {
      id: 'estimator',
      labelBn: 'কনস্ট্রাকশন ক্যালকুলেটর',
      labelEn: 'Construction Calc',
      icon: <Calculator size={28} className="text-cyan-600 dark:text-cyan-400" />,
      bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
      action: () => onSelectTab('estimator'),
    },
    {
      id: 'budget',
      labelBn: 'বাজেট ক্যালকুলেটর',
      labelEn: 'Budget Calculator',
      icon: <Coins size={28} className="text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      action: () => onSelectTab('estimator'),
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-5 flex flex-col items-center select-none animate-in fade-in">
      {/* Mobile Frame Header inside Dashboard */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-white flex items-center justify-center font-bold shadow-sm">
            <Home size={18} />
          </div>
          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            3D DESIGN <span className="text-[#0284C7]">360°</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0284C7] cursor-pointer"
          >
            <Globe size={14} />
            <span>{language === 'bn' ? 'বাংলা | English' : 'English | বাংলা'}</span>
          </button>
          <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            <Bell size={15} />
          </div>
        </div>
      </div>

      {/* 3x3 CARDS GRID MATCHING SCREEN 2 */}
      <div className="w-full grid grid-cols-3 gap-3 my-5">
        {gridCards.map((card) => (
          <div
            key={card.id}
            onClick={card.action}
            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border ${card.bg} hover:shadow-md active:scale-95 transition cursor-pointer text-center group`}
          >
            <div className="mb-2 p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs group-hover:scale-110 transition">
              {card.icon}
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {language === 'bn' ? card.labelBn : card.labelEn}
            </span>
          </div>
        ))}
      </div>

      {/* SECONDARY ROW: আমার প্রজেক্ট & সেটিংস */}
      <div className="w-full grid grid-cols-2 gap-3 mb-4">
        <div
          onClick={() => onSelectTab('projects')}
          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0284C7] active:scale-95 shadow-xs transition cursor-pointer"
        >
          <FolderOpen size={20} className="text-[#0284C7]" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'আমার প্রজেক্ট' : 'My Projects'}
          </span>
        </div>

        <div
          onClick={() => onSelectTab('settings')}
          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0284C7] active:scale-95 shadow-xs transition cursor-pointer"
        >
          <Settings size={20} className="text-slate-600 dark:text-slate-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'সেটিংস' : 'Settings'}
          </span>
        </div>
      </div>
    </div>
  );
};
