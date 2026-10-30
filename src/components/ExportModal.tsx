/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Project } from '../types';
import { useI18n } from '../localization/i18n';
import { exportProjectJSON, importProjectJSON } from '../storage/db';
import {
  Download,
  Upload,
  FileCode,
  FileText,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onImportSuccess: (imported: Project) => void;
  onTriggerPdf: () => void;
  onTriggerPng: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onImportSuccess,
  onTriggerPdf,
  onTriggerPng,
}) => {
  const { t, language } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const imported = await importProjectJSON(file);
      onImportSuccess(imported);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to import project file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Download size={20} className="text-sky-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'bn' ? 'প্রজেক্ট সংরক্ষণ ও এক্সপোর্ট' : 'Save & Export Options'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* OPTIONS LIST */}
        <div className="p-5 space-y-3 text-xs">
          {/* JSON Export */}
          <button
            onClick={() => {
              exportProjectJSON(project);
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300">
                <FileCode size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600">
                  {t.exportJson}
                </div>
                <div className="text-slate-500">
                  {language === 'bn'
                    ? 'প্রজেক্টের সকল ২ডি দেয়াল, ৩ডি ছাদ ও ডাটা ব্যাকআপ রাখুন'
                    : 'Download complete editable .json backup of this house plan'}
                </div>
              </div>
            </div>
            <Download size={16} className="text-slate-400 group-hover:text-sky-600" />
          </button>

          {/* JSON Import */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                  <Upload size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600">
                    {t.importJson}
                  </div>
                  <div className="text-slate-500">
                    {language === 'bn'
                      ? 'পূর্বে সংরক্ষিত JSON ফাইল আপলোড করে পুনরায় সম্পাদনা করুন'
                      : 'Load previously exported JSON house project'}
                  </div>
                </div>
              </div>
              <Upload size={16} className="text-slate-400 group-hover:text-sky-600" />
            </button>
          </div>

          {importError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 text-rose-600 text-xs">
              <AlertCircle size={15} />
              <span>{importError}</span>
            </div>
          )}

          {/* PDF Export */}
          <button
            onClick={() => {
              onClose();
              onTriggerPdf();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300">
                <FileText size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600">
                  {t.exportPdf}
                </div>
                <div className="text-slate-500">
                  {language === 'bn'
                    ? 'আর্কিটেকচারাল স্পেসিফিকেশন ও নির্মাণ সামগ্রীর প্রাক্কলন রিপোর্ট'
                    : 'Download architectural specification & BoQ estimation report'}
                </div>
              </div>
            </div>
            <Download size={16} className="text-slate-400 group-hover:text-sky-600" />
          </button>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
