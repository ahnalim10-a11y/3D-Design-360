/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ViewTab, Project, MeasurementUnit } from '../types';
import { useI18n } from '../localization/i18n';
import {
  getAllProjectsFromDB,
  deleteProjectFromDB,
  duplicateProjectInDB,
} from '../storage/db';
import {
  formatCurrencyBDT,
  toBengaliNumerals,
  calculateLandArea,
} from '../calculations/units';
import {
  Plus,
  Square,
  Box,
  RotateCw,
  Armchair,
  Trees,
  Sparkles,
  Calculator,
  Coins,
  FolderOpen,
  Settings,
  Trash2,
  Copy,
  ArrowRight,
  MapPin,
  Smartphone,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewProject: () => void;
  onOpenProjectSettings: () => void;
  onOpenTemplates: () => void;
  onOpenAndroidGuide: () => void;
  onLoadProject: (project: Project) => void;
  currentProject: Project;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectTab,
  onOpenNewProject,
  onOpenProjectSettings,
  onOpenTemplates,
  onOpenAndroidGuide,
  onLoadProject,
  currentProject,
}) => {
  const { t, language } = useI18n();
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Load projects from IndexedDB
  const refreshProjects = async () => {
    try {
      setLoadingProjects(true);
      const list = await getAllProjectsFromDB();
      setSavedProjects(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [currentProject]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই প্রজেক্টটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this project?')) {
      await deleteProjectFromDB(id);
      await refreshProjects();
    }
  };

  const handleDuplicate = async (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateProjectInDB(proj, language === 'bn' ? 'অনুলিপি - ' : 'Copy of ');
    await refreshProjects();
  };

  // 10 Core Functional Action Cards
  const coreActions = [
    {
      titleBn: 'নতুন প্রজেক্ট',
      titleEn: 'New Project',
      descBn: 'প্লটের মাপ অনুযায়ী শুরু করুন',
      descEn: 'Create custom dimensions plan',
      icon: <Plus size={24} className="text-white" />,
      color: 'from-blue-600 to-sky-500',
      action: onOpenNewProject,
    },
    {
      titleBn: '২ডি ফ্লোর প্ল্যানার',
      titleEn: '2D Floor Planner',
      descBn: 'দেয়াল, রুম, দরজা ও জানালা আঁকুন',
      descEn: 'Interactive wall and room editor',
      icon: <Square size={24} className="text-white" />,
      color: 'from-sky-600 to-cyan-500',
      action: () => onSelectTab('planner2d'),
    },
    {
      titleBn: '৩ডি ডিজাইন স্টুডিও',
      titleEn: '3D Design Studio',
      descBn: 'রিয়েল-টাইম থ্রিডি বাড়ি তৈরি ও দেখুন',
      descEn: 'Full 3D realistic rendering',
      icon: <Box size={24} className="text-white" />,
      color: 'from-indigo-600 to-blue-500',
      action: () => onSelectTab('studio3d'),
    },
    {
      titleBn: '৩৬০° পরিদর্শন ভিউ',
      titleEn: '360° View',
      descBn: 'স্বয়ংক্রিয় টার্নটেবল ৩৬০° ঘূর্ণন',
      descEn: 'Smooth turntable 360 spin',
      icon: <RotateCw size={24} className="text-white" />,
      color: 'from-purple-600 to-indigo-500',
      action: () => onSelectTab('studio3d'),
    },
    {
      titleBn: 'ইন্টেরিয়র ডিজাইন',
      titleEn: 'Interior Design',
      descBn: 'খাট, সোফা, ডাইনিং ও কিচেন সজ্জা',
      descEn: 'Furniture and room decoration',
      icon: <Armchair size={24} className="text-white" />,
      color: 'from-amber-600 to-orange-500',
      action: () => onSelectTab('planner2d'),
    },
    {
      titleBn: 'এক্সটেরিয়র ডিজাইন',
      titleEn: 'Exterior Design',
      descBn: 'গাছপালা, বাউন্ডারি দেয়াল ও বাগান',
      descEn: 'Landscaping, trees & boundary',
      icon: <Trees size={24} className="text-white" />,
      color: 'from-emerald-600 to-teal-500',
      action: () => onSelectTab('planner2d'),
    },
    {
      titleBn: 'বাড়ি টেমপ্লেট (১২টি)',
      titleEn: 'House Templates',
      descBn: 'জনপ্রিয় বাংলাদেশি বাড়ির মডেলসমূহ',
      descEn: '12 authentic Bangladesh models',
      icon: <Sparkles size={24} className="text-white" />,
      color: 'from-rose-600 to-pink-500',
      action: onOpenTemplates,
    },
    {
      titleBn: 'নির্মাণ প্রাক্কলন',
      titleEn: 'Construction Calc',
      descBn: 'ইট, সিমেন্ট, বালু, রড ও খোয়া হিসাব',
      descEn: 'Bill of quantities (BoQ) takeoff',
      icon: <Calculator size={24} className="text-white" />,
      color: 'from-teal-600 to-emerald-500',
      action: () => onSelectTab('estimator'),
    },
    {
      titleBn: 'বাজেট ক্যালকুলেটর',
      titleEn: 'Budget Calculator',
      descBn: 'স্থানীয় বাজারে সামগ্রীর দরে খরচ',
      descEn: 'Local market rate cost breakdown',
      icon: <Coins size={24} className="text-white" />,
      color: 'from-amber-600 to-yellow-500',
      action: () => onSelectTab('estimator'),
    },
    {
      titleBn: 'আমার প্রজেক্ট সমূহ',
      titleEn: 'My Projects',
      descBn: 'সংরক্ষিত ড্রয়িং ও প্ল্যানসমূহ',
      descEn: 'Stored IndexedDB house plans',
      icon: <FolderOpen size={24} className="text-white" />,
      color: 'from-slate-700 to-slate-900',
      action: () => {
        const elem = document.getElementById('my-projects-section');
        elem?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border border-slate-800 p-6 sm:p-8 shadow-2xl text-white">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <CheckCircle2 size={14} />
            <span>{language === 'bn' ? 'অ্যান্ড্রয়েড রেডি ৩ডি স্থাপত্য সফটওয়্যার' : 'Android-Ready 3D Architectural Software'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {language === 'bn' ? (
              <>
                আপনার স্বপ্নের বাড়ির <span className="text-sky-400">২ডি নকশা</span> ও{' '}
                <span className="text-sky-400">৩ডি মডেল</span> তৈরি করুন
              </>
            ) : (
              <>
                Architectural <span className="text-sky-400">2D Floor Plans</span> &{' '}
                <span className="text-sky-400">Real-Time 3D</span> Studio
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'পরিমাপ অনুযায়ী ঘরের দেয়াল টানুন, ছাদ কাস্টমাইজ করুন, ৩৬০° দিক থেকে ঘুরে দেখুন এবং ইট-সিমেন্ট-রডের সঠিক বাজেট প্রাক্কলন বের করুন।'
              : 'Design dimension-accurate floor plans, preview real 3D geometry with customizable roofs, navigate in 360°, and generate construction BoQ budgets.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectTab('planner2d')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition active:scale-95"
            >
              <Square size={16} />
              <span>{t.planner2d}</span>
            </button>
            <button
              onClick={() => onSelectTab('studio3d')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow transition active:scale-95"
            >
              <Box size={16} />
              <span>{t.studio3d}</span>
            </button>
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
            >
              <Sparkles size={16} />
              <span>{t.houseTemplates}</span>
            </button>
          </div>
        </div>

        {/* Ambient Ring Graphic */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-sky-500/20 pointer-events-none opacity-40 blur-2xl bg-sky-600/10" />
      </div>

      {/* 10 CORE FEATURES DASHBOARD GRID */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{t.quickActions}</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {coreActions.map((act, index) => (
            <div
              key={index}
              onClick={act.action}
              className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="space-y-3">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${act.color} flex items-center justify-center shadow-md group-hover:scale-110 transition duration-200`}
                >
                  {act.icon}
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    {language === 'bn' ? act.titleBn : act.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {language === 'bn' ? act.descBn : act.descEn}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 pt-3 group-hover:translate-x-1 transition">
                <span>{language === 'bn' ? 'প্রবেশ করুন' : 'Open'}</span>
                <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAVED PROJECTS SECTION (INDEXEDDB) */}
      <div id="my-projects-section" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen size={20} className="text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.recentProjects}
            </h2>
          </div>
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-500"
          >
            <Plus size={15} />
            <span>{t.newProject}</span>
          </button>
        </div>

        {savedProjects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <FolderOpen size={36} className="mx-auto text-slate-400 mb-2 opacity-60" />
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{t.noProjectsYet}</p>
            <button
              onClick={onOpenNewProject}
              className="mt-3 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition"
            >
              {t.newProject}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProjects.map((p) => {
              const isCurrent = p.settings.id === currentProject.settings.id;
              const land = calculateLandArea(p.settings.plotLength, p.settings.plotWidth);

              return (
                <div
                  key={p.settings.id}
                  onClick={() => onLoadProject(p)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${
                    isCurrent
                      ? 'border-sky-500 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.settings.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {p.settings.houseType} • {p.settings.floorsCount} {language === 'bn' ? 'তলা' : 'Storey'}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                        {language === 'bn' ? 'চলমান' : 'Active'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">{t.plotArea}</div>
                      <div className="font-bold text-slate-700 dark:text-slate-200">
                        {p.settings.plotLength}' x {p.settings.plotWidth}'
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-sky-500">{t.decimals}</div>
                      <div className="font-bold text-sky-600 dark:text-sky-400">
                        {language === 'bn' ? toBengaliNumerals(land.decimals) : land.decimals} {t.decimals}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Calendar size={12} />
                      <span>{new Date(p.settings.updatedAt || p.settings.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleDuplicate(p, e)}
                        title={t.duplicate}
                        className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(p.settings.id, e)}
                        title={t.delete}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ANDROID PACKAGING FOOTER PROMO */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <Smartphone size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{t.androidReadyTitle}</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'bn'
                ? 'ক্যাপাসিটর দিয়ে এই অ্যাপটি খুব সহজেই আপনার নিজস্ব অ্যান্ড্রয়েড APK ফাইলে রূপান্তর করুন।'
                : 'Learn how to bundle this web application into a signed Android APK using Capacitor.'}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAndroidGuide}
          className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
        >
          {language === 'bn' ? 'APK তৈরির টিউটোরিয়াল' : 'View APK Guide'}
        </button>
      </div>
    </div>
  );
};
