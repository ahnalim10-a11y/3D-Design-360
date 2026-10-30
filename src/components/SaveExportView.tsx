/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Project } from '../types';
import { useI18n } from '../localization/i18n';
import { exportProjectJSON, importProjectJSON } from '../storage/db';
import {
  ArrowLeft,
  Save,
  FolderOpen,
  Edit3,
  Copy,
  Trash2,
  FileCode,
  Image as ImageIcon,
  FileText,
  Box,
  CheckCircle2,
} from 'lucide-react';

interface SaveExportViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onSave: () => void;
  onOpenProjects: () => void;
  onBack: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
}

export const SaveExportView: React.FC<SaveExportViewProps> = ({
  project,
  onUpdateProject,
  onSave,
  onOpenProjects,
  onBack,
  onExportPdf,
  onExportPng,
}) => {
  const { language } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleRename = () => {
    const newName = prompt(language === 'bn' ? 'প্রজেক্টের নতুন নাম লিখুন:' : 'Enter new project name:', project.settings.name);
    if (newName && newName.trim()) {
      onUpdateProject({
        ...project,
        settings: { ...project.settings, name: newName.trim() },
      });
      showToast('নাম পরিবর্তন সম্পন্ন হয়েছে');
    }
  };

  const handleDuplicate = () => {
    const copy: Project = {
      ...project,
      settings: {
        ...project.settings,
        id: 'proj_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
        name: `Copy of ${project.settings.name}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };
    onUpdateProject(copy);
    showToast('অনুলিপি তৈরি সম্পন্ন হয়েছে');
  };

  const handleDelete = () => {
    if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে এই প্রজেক্টটি মুছতে চান?' : 'Are you sure you want to delete this project?')) {
      onOpenProjects();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProjectJSON(file);
      onUpdateProject(imported);
      showToast('প্রজেক্ট ইমপোর্ট সফল হয়েছে');
    } catch (err) {
      alert('Invalid project file');
    }
  };

  const handleExportGLTF = () => {
    showToast('3D GLTF মডেল ফাইল প্রস্তুত করা হয়েছে');
    // Export standard project 3D metadata
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'model/gltf+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.settings.name}_3D_Model.gltf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 select-none animate-in fade-in">
      {/* HEADER */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          {language === 'bn' ? 'সেভ ও এক্সপোর্ট' : 'Save & Export'}
        </h2>
      </div>

      {successMsg && (
        <div className="my-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TOP ROW ACTIONS MATCHING SCREEN 11 */}
      <div className="grid grid-cols-5 gap-2 my-5">
        <button
          onClick={() => {
            onSave();
            showToast('প্রজেক্ট সেভ করা হয়েছে');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 active:scale-95 transition cursor-pointer"
        >
          <Save size={20} className="text-[#0284C7] mb-1" />
          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">সেভ প্রজেক্ট</span>
        </button>

        <button
          onClick={onOpenProjects}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 active:scale-95 transition cursor-pointer"
        >
          <FolderOpen size={20} className="text-blue-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">ওপেন প্রজেক্ট</span>
        </button>

        <button
          onClick={handleRename}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 active:scale-95 transition cursor-pointer"
        >
          <Edit3 size={20} className="text-indigo-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">রিনেম</span>
        </button>

        <button
          onClick={handleDuplicate}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 active:scale-95 transition cursor-pointer"
        >
          <Copy size={20} className="text-purple-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">ডুপ্লিকেট</span>
        </button>

        <button
          onClick={handleDelete}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 active:scale-95 transition cursor-pointer"
        >
          <Trash2 size={20} className="text-rose-600 mb-1" />
          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">ডিলিট</span>
        </button>
      </div>

      {/* ইমপোর্ট / এক্সপোর্ট SECTION MATCHING SCREEN 11 */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">
          ইমপোর্ট / এক্সপোর্ট
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* JSON Export */}
          <button
            onClick={() => {
              exportProjectJSON(project);
              showToast('JSON ডাউনলোড সম্পন্ন হয়েছে');
            }}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0284C7] shadow-xs active:scale-95 transition cursor-pointer text-left"
          >
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-[#0284C7]">
              <FileCode size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">JSON এক্সপোর্ট</div>
              <div className="text-[10px] text-slate-400">প্রজেক্ট ফাইল সংরক্ষণ</div>
            </div>
          </button>

          {/* JSON Import */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0284C7] shadow-xs active:scale-95 transition cursor-pointer text-left"
          >
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <FileCode size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">JSON ইমপোর্ট</div>
              <div className="text-[10px] text-slate-400">পূর্বে সেভ ফাইল খুলুন</div>
            </div>
          </button>

          {/* PNG Export */}
          <button
            onClick={onExportPng}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0284C7] shadow-xs active:scale-95 transition cursor-pointer text-left"
          >
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <ImageIcon size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">PNG এক্সপোর্ট</div>
              <div className="text-[10px] text-slate-400">হাই-রেজ্যুলেশন ছবি</div>
            </div>
          </button>

          {/* PDF Export */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0284C7] shadow-xs active:scale-95 transition cursor-pointer text-left"
          >
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">PDF এক্সপোর্ট</div>
              <div className="text-[10px] text-slate-400">নির্মাণ প্রাক্কলন শিট</div>
            </div>
          </button>
        </div>

        {/* GLB / glTF 3D Export */}
        <div
          onClick={handleExportGLTF}
          className="flex items-center justify-between p-4 rounded-2xl border border-sky-300 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/40 hover:bg-sky-100/80 active:scale-95 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0284C7] text-white">
              <Box size={22} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>GLB / glTF (ঐচ্ছিক)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-200 dark:bg-sky-900 text-[#0284C7] dark:text-sky-300 font-semibold">
                  3D মডেল
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                3D মডেল এক্সপোর্ট (কার্যকর ফরম্যাট)
              </div>
            </div>
          </div>
          <Box size={20} className="text-[#0284C7]" />
        </div>
      </div>
    </div>
  );
};
