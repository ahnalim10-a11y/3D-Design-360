/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BANGLADESH_TEMPLATES, HouseTemplate } from '../templates/houseTemplates';
import { Project } from '../types';
import { useI18n } from '../localization/i18n';
import { formatCurrencyBDT } from '../calculations/units';
import { ArrowLeft, Home, ArrowRight, X } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (project: Project) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const { language } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'rural' | 'tin_shed' | 'concrete'>('all');

  if (!isOpen) return null;

  // Filter Pills matching Screen 7: সব | রূরাল | টিন শেড | আধুনিক
  const filterPills = [
    { id: 'all', labelBn: 'সব', labelEn: 'All' },
    { id: 'rural', labelBn: 'রূরাল', labelEn: 'Rural' },
    { id: 'tin_shed', labelBn: 'টিন শেড', labelEn: 'Tin Shed' },
    { id: 'concrete', labelBn: 'আধুনিক', labelEn: 'Modern' },
  ];

  const filtered = BANGLADESH_TEMPLATES.filter((tmpl) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'rural') return tmpl.category === 'rural';
    if (selectedFilter === 'tin_shed') return tmpl.category === 'tin_shed';
    if (selectedFilter === 'concrete') return tmpl.category === 'concrete' || tmpl.category === 'modern';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'bn' ? 'হাউস টেমপ্লেট' : 'House Templates'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* CATEGORY FILTER PILLS MATCHING SCREEN 7 */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
          {filterPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedFilter(pill.id as any)}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedFilter === pill.id
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'bn' ? pill.labelBn : pill.labelEn}
            </button>
          ))}
        </div>

        {/* TEMPLATES GRID MATCHING SCREEN 7 CARDS */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                const newProj = tmpl.createProject();
                onSelectTemplate(newProj);
                onClose();
              }}
              className="flex flex-col justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[#0284C7] hover:shadow-md transition cursor-pointer group"
            >
              <div>
                {/* House visual box */}
                <div className="w-full h-24 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white mb-2 shadow-xs group-hover:scale-102 transition">
                  <Home size={32} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                  {language === 'bn' ? tmpl.nameBn : tmpl.nameEn}
                </h4>
                <div className="text-[10px] text-slate-400 mt-1">
                  {tmpl.plotLength}' x {tmpl.plotWidth}' • {tmpl.floorsCount} তলা
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-[#0284C7] font-semibold">
                <span>{formatCurrencyBDT(tmpl.estimatedBudgetBdt, language)}</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
