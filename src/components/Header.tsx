/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ViewTab, Project, Language, ThemeMode } from '../types';
import { useI18n } from '../localization/i18n';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Home,
  Square,
  Box,
  RotateCw,
  Layers,
  Calculator,
  FolderOpen,
  Save,
  Download,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  project: Project;
  onOpenProjectSettings: () => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onOpenAndroidGuide: () => void;
  onSaveProject: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  isSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  project,
  onOpenProjectSettings,
  onOpenTemplates,
  onOpenExport,
  onOpenAndroidGuide,
  onSaveProject,
  theme,
  onToggleTheme,
  isSaving,
}) => {
  const { t, language, setLanguage } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: ViewTab; labelBn: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', labelBn: 'হোম', labelEn: 'Home', icon: <Home size={15} /> },
    { id: 'planner2d', labelBn: '২ডি প্ল্যানার', labelEn: '2D Planner', icon: <Square size={15} /> },
    { id: 'studio3d', labelBn: '৩ডি স্টুডিও', labelEn: '3D Studio', icon: <Box size={15} /> },
    { id: 'templates', labelBn: 'টেমপ্লেট', labelEn: 'Templates', icon: <Sparkles size={15} /> },
    { id: 'estimator', labelBn: 'প্রাক্কলন ও খরচ', labelEn: 'Estimator', icon: <Calculator size={15} /> },
    { id: 'projects', labelBn: 'প্রজেক্ট সমূহ', labelEn: 'Projects', icon: <FolderOpen size={15} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white select-none">
      <div className="flex items-center justify-between px-3 sm:px-4 h-16">
        {/* LEFT: BRAND & PROJECT TITLE */}
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/30 group-hover:scale-105 transition">
              <Box size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-sm tracking-wide text-white">
                <span>3D DESIGN</span>
                <span className="text-sky-400 font-extrabold">360°</span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                {t.appTagline}
              </div>
            </div>
          </div>

          {/* Current Project Badge */}
          <div
            onClick={onOpenProjectSettings}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white cursor-pointer transition ml-2"
            title="Click to edit plot size & settings"
          >
            <span className="truncate max-w-[130px]">{project.settings.name}</span>
            <span className="text-[10px] text-sky-400 font-mono">
              ({project.settings.plotLength}'x{project.settings.plotWidth}')
            </span>
          </div>
        </div>

        {/* CENTER: DESKTOP NAVIGATION TABS */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'templates') {
                  onOpenTemplates();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === tab.id
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
            </button>
          ))}
        </nav>

        {/* RIGHT: ACTIONS & CONTROLS */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Save Button */}
          <button
            onClick={onSaveProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-semibold shadow-sm transition active:scale-95"
            title={t.saveProject}
          >
            <Save size={15} />
            <span className="hidden sm:inline">{isSaving ? 'সংরক্ষণ...' : t.saveProject}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
            title="Export PDF / PNG / JSON"
          >
            <Download size={16} />
          </button>

          {/* Android Packaging Guide Button */}
          <button
            onClick={onOpenAndroidGuide}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 text-xs font-medium transition"
            title="Android APK Packaging Guide"
          >
            <Smartphone size={14} />
            <span>APK</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Language Toggle BN / EN */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition"
            title="Switch Language / ভাষা পরিবর্তন"
          >
            <Globe size={14} />
            <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Theme Toggle Light/Dark */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-3 bg-slate-950 border-b border-slate-800 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'templates') {
                    onOpenTemplates();
                  } else {
                    onSelectTab(tab.id);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition ${
                  currentTab === tab.id
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
              </button>
            ))}

            <button
              onClick={() => {
                onOpenAndroidGuide();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 col-span-2"
            >
              <Smartphone size={16} />
              <span>{t.androidPackaging}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
