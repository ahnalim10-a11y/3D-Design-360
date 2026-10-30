/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../types';
import { useI18n } from '../localization/i18n';
import { ArrowLeft, Download, FileText, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';

interface MaterialBudgetViewProps {
  project: Project;
  onBack: () => void;
}

export const MaterialBudgetView: React.FC<MaterialBudgetViewProps> = ({
  project,
  onBack,
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'materials' | 'cost'>('materials');

  // Exact dataset from Screen 10 in reference image
  const rows = [
    { nameBn: 'ইট', nameEn: 'Bricks', qty: '১০,০০০ টি', rate: '১২ টাকা', total: '১,২০,০০০' },
    { nameBn: 'সিমেন্ট', nameEn: 'Cement', qty: '২০০ বস্তা', rate: '৪০০ টাকা', total: '৮০,০০০' },
    { nameBn: 'বালি', nameEn: 'Sand', qty: '৩০০ ঘনফুট', rate: '১০০ টাকা', total: '৩০,০০০' },
    { nameBn: 'খোয়া', nameEn: 'Aggregate (Khoa)', qty: '২০০ ঘনফুট', rate: '১২০ টাকা', total: '২৪,০০০' },
    { nameBn: 'টাইলস', nameEn: 'Tiles', qty: '১,০০০ বর্গফুট', rate: '৬০ টাকা', total: '৬০,০০০' },
    { nameBn: 'পেইন্ট', nameEn: 'Paint', qty: '২০ লিটার', rate: '৬০০ টাকা', total: '১২,০০০' },
    { nameBn: 'টিন/রুফিং শিট', nameEn: 'Tin/Roofing Sheet', qty: '৪০ ফিট', rate: '৮০০ টাকা', total: '৩২,০০০' },
    { nameBn: 'দরজা', nameEn: 'Doors', qty: '৪ টি', rate: '৫,০০০ টাকা', total: '৪০,০০০' },
    { nameBn: 'জানালা', nameEn: 'Windows', qty: '১২ টি', rate: '৩,০০০ টাকা', total: '৩৬,০০০' },
  ];

  const totalCostBn = '৮,০৮,০০০ টাকা';

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(2, 132, 199);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('3D DESIGN 360 - Material & Budget Takeoff', 14, 16);

    let y = 35;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Project: ${project.settings.name}`, 14, y);
    y += 10;

    rows.forEach((r) => {
      doc.text(`${r.nameEn}: ${r.qty} @ ${r.rate} = BDT ${r.total}`, 14, y);
      y += 8;
    });

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Estimated Cost: BDT 8,08,000`, 14, y);

    doc.save(`${project.settings.name}_Budget.pdf`);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 select-none animate-in fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            {language === 'bn' ? 'ম্যাটেরিয়াল ও বাজেট ক্যালকুলেটর' : 'Material & Budget Calculator'}
          </h2>
        </div>

        <button
          onClick={exportPDF}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Download size={14} />
          <span>PDF</span>
        </button>
      </div>

      {/* TABS: ম্যাটেরিয়াল | খরচের হিসাব */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 my-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
            activeTab === 'materials'
              ? 'bg-white dark:bg-slate-900 text-[#0284C7] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          {language === 'bn' ? 'ম্যাটেরিয়াল' : 'Materials'}
        </button>
        <button
          onClick={() => setActiveTab('cost')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
            activeTab === 'cost'
              ? 'bg-white dark:bg-slate-900 text-[#0284C7] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          {language === 'bn' ? 'খরচের হিসাব' : 'Cost Breakdown'}
        </button>
      </div>

      {/* TABLE MATCHING SCREEN 10 EXACTLY */}
      <div className="rounded-2xl border border-sky-200 dark:border-sky-900/60 overflow-hidden bg-white dark:bg-slate-900 shadow-sm text-xs">
        <table className="w-full text-left">
          <thead className="bg-sky-50 dark:bg-sky-950/60 text-slate-700 dark:text-slate-300 border-b border-sky-100 dark:border-sky-900/60 font-bold">
            <tr>
              <th className="py-2.5 px-3">উপকরণ</th>
              <th className="py-2.5 px-3 text-center">পরিমাণ</th>
              <th className="py-2.5 px-3 text-right">একক দাম</th>
              <th className="py-2.5 px-3 text-right">মোট খরচ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                  {language === 'bn' ? row.nameBn : row.nameEn}
                </td>
                <td className="py-2 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                  {row.qty}
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  {row.rate}
                </td>
                <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-sky-50 dark:bg-sky-950/80 font-bold border-t border-sky-200 dark:border-sky-900 text-slate-900 dark:text-white">
            <tr>
              <td colSpan={2} className="py-3 px-3 text-sm">
                মোট আনুমানিক খরচ
              </td>
              <td colSpan={2} className="py-3 px-3 text-right text-base text-[#0284C7] dark:text-sky-400 font-black">
                {totalCostBn}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* FOOTNOTE MATCHING SCREEN 10 */}
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 italic text-center">
        * পরিমাণ ও দাম আপনার সেটিং অনুযায়ী পরিবর্তিত হবে।
      </p>
    </div>
  );
};
