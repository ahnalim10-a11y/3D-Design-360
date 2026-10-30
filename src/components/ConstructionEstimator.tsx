/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, MaterialRateConfig } from '../types';
import { useI18n } from '../localization/i18n';
import {
  calculateProjectEstimation,
  DEFAULT_MATERIAL_RATES,
} from '../calculations/estimation';
import { formatCurrencyBDT, toBengaliNumerals } from '../calculations/units';
import {
  Calculator,
  Download,
  RotateCcw,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ConstructionEstimatorProps {
  project: Project;
}

export const ConstructionEstimator: React.FC<ConstructionEstimatorProps> = ({ project }) => {
  const { t, language } = useI18n();

  const [rates, setRates] = useState<MaterialRateConfig>({ ...DEFAULT_MATERIAL_RATES });
  const [showRateEditor, setShowRateEditor] = useState(false);

  const estimation = calculateProjectEstimation(project, rates);

  const handleRateChange = (key: keyof MaterialRateConfig, val: number) => {
    setRates((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  const handleResetRates = () => {
    setRates({ ...DEFAULT_MATERIAL_RATES });
  };

  // EXPORT ARCHITECTURAL BoQ & BUDGET ESTIMATION PDF
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = '#0F172A';
    const accentColor = '#0284C7';

    // Header Title
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('3D DESIGN 360° — ARCHITECTURAL SPECIFICATION', 14, 14);

    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248);
    doc.text('RESIDENTIAL CONSTRUCTION ESTIMATION & BILL OF QUANTITIES (BOQ)', 14, 22);

    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Project: ${project.settings.name}`, 14, 28);

    // Project Specs Card
    let y = 42;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PROJECT SUMMARY & DIMENSIONS', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Plot Size: ${project.settings.plotLength} ft x ${project.settings.plotWidth} ft`, 14, y);
    doc.text(`Covered Floor Area: ${estimation.floorAreaSqFt} Sq. Ft`, 80, y);
    doc.text(`Floors: ${project.settings.floorsCount}`, 150, y);
    y += 5;
    doc.text(`House Type: ${project.settings.houseType}`, 14, y);
    doc.text(`Roof Type: ${project.roof.type.toUpperCase()}`, 80, y);
    doc.text(`Walls Area: ${estimation.totalWallAreaSqFt} Sq. Ft`, 150, y);
    y += 10;

    // BoQ Table Header
    doc.setFillColor(2, 132, 199);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Material / Item Description', 18, y + 5.5);
    doc.text('Quantity', 110, y + 5.5);
    doc.text('Unit Rate', 140, y + 5.5);
    doc.text('Total Cost (BDT)', 168, y + 5.5);
    y += 8;

    // Table Rows
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    estimation.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 7, 'F');
      }
      doc.text(item.nameEn, 18, y + 4.8);
      doc.text(`${item.quantity} ${item.unitEn}`, 110, y + 4.8);
      doc.text(`BDT ${item.unitRate}`, 140, y + 4.8);
      doc.text(`BDT ${item.totalCost.toLocaleString()}`, 168, y + 4.8);
      y += 7;
    });

    // Labor Row
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Labor & Masonry Charges', 18, y + 4.8);
    doc.text(`${estimation.floorAreaSqFt} sq ft`, 110, y + 4.8);
    doc.text(`BDT ${rates.laborPerSqFt}`, 140, y + 4.8);
    doc.text(`BDT ${estimation.laborCost.toLocaleString()}`, 168, y + 4.8);
    y += 10;

    // Grand Total Box
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 182, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('TOTAL ESTIMATED CONSTRUCTION BUDGET:', 20, y + 8);
    doc.setTextColor(56, 189, 248);
    doc.text(`BDT ${estimation.grandTotal.toLocaleString()}`, 145, y + 8);
    y += 20;

    // Notice Footer
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Notice: Estimated quantities are based on Bangladesh residential construction standard practice (PWD/BNBC norms).',
      14,
      y
    );
    doc.text(
      'Actual quantities may vary based on structural engineer foundation design, soil condition, and local market prices.',
      14,
      y + 4
    );

    doc.save(`${project.settings.name}_BoQ_Estimate.pdf`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xl sm:text-2xl">
            <Calculator size={26} />
            <h2>{t.materialEstimationTitle}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {project.settings.name} — {t.houseType}: {project.settings.houseType}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRateEditor(!showRateEditor)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition"
          >
            <SlidersHorizontal size={15} />
            <span>{t.unitPriceConfig}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg transition"
          >
            <Download size={15} />
            <span>{t.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">{t.area}</div>
          <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mt-1">
            {language === 'bn' ? toBengaliNumerals(estimation.floorAreaSqFt) : estimation.floorAreaSqFt} {t.sqFt}
          </div>
          <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-0.5">
            {project.settings.floorsCount} {language === 'bn' ? 'তলা ভবন' : 'Storey'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">{t.toolWall} ({t.area})</div>
          <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mt-1">
            {language === 'bn' ? toBengaliNumerals(estimation.totalWallAreaSqFt) : estimation.totalWallAreaSqFt} {t.sqFt}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ৫" ও ১০" দেয়াল মোট
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">{t.doorsCount} ও {t.windowsCount}</div>
          <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mt-1">
            {language === 'bn' ? toBengaliNumerals(estimation.doorsCount) : estimation.doorsCount} দরজা / {language === 'bn' ? toBengaliNumerals(estimation.windowsCount) : estimation.windowsCount} জানালা
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            পরিমাপ অন্তর্ভুক্ত
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-lg">
          <div className="text-xs text-sky-100">{t.totalEstimatedCost}</div>
          <div className="text-xl sm:text-2xl font-black mt-1">
            {formatCurrencyBDT(estimation.grandTotal, language)}
          </div>
          <div className="text-[11px] text-sky-200 mt-0.5">
            মালামাল + শ্রমিক খরচসহ
          </div>
        </div>
      </div>

      {/* ADJUSTABLE LOCAL MARKET RATES ACCORDION */}
      {showRateEditor && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-sky-300 dark:border-sky-900 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <SlidersHorizontal size={16} className="text-sky-600" />
              {t.unitPriceConfig}
            </span>
            <button
              onClick={handleResetRates}
              className="text-xs text-sky-600 hover:text-sky-500 flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>রিসেট (Default Rates)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">ইট প্রতি পিস (৳)</label>
              <input
                type="number"
                value={rates.brickPerPcs}
                onChange={(e) => handleRateChange('brickPerPcs', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">সিমেন্ট প্রতি ব্যাগ (৳)</label>
              <input
                type="number"
                value={rates.cementPerBag}
                onChange={(e) => handleRateChange('cementPerBag', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">রড প্রতি কেজি (৳)</label>
              <input
                type="number"
                value={rates.rodPerKg}
                onChange={(e) => handleRateChange('rodPerKg', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">বালু প্রতি cft (৳)</label>
              <input
                type="number"
                value={rates.sandPerCft}
                onChange={(e) => handleRateChange('sandPerCft', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">খোয়া / পাথর প্রতি cft (৳)</label>
              <input
                type="number"
                value={rates.khoaPerCft}
                onChange={(e) => handleRateChange('khoaPerCft', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">টাইলস প্রতি বর্গফুট (৳)</label>
              <input
                type="number"
                value={rates.tilesPerSqFt}
                onChange={(e) => handleRateChange('tilesPerSqFt', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">টিন প্রতি বান্ডিল (৳)</label>
              <input
                type="number"
                value={rates.tinSheetPerBundle}
                onChange={(e) => handleRateChange('tinSheetPerBundle', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">লেবার চার্জ বর্গফুট (৳)</label>
              <input
                type="number"
                value={rates.laborPerSqFt}
                onChange={(e) => handleRateChange('laborPerSqFt', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
          </div>
        </div>
      )}

      {/* BILL OF QUANTITIES (BoQ) TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">সামগ্রী / উপকরণের বিবরণ</th>
                <th className="px-4 py-3">পরিমাণ</th>
                <th className="px-4 py-3">একক দর (৳)</th>
                <th className="px-4 py-3">মোট খরচ (BDT)</th>
                <th className="px-4 py-3 hidden md:table-cell">হিসাবের ভিত্তি ও সূত্র</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {estimation.items.map((item) => (
                <tr key={item.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {language === 'bn' ? item.nameBn : item.nameEn}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                    {language === 'bn' ? toBengaliNumerals(item.quantity) : item.quantity}{' '}
                    {language === 'bn' ? item.unitBn : item.unitEn}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    ৳ {language === 'bn' ? toBengaliNumerals(item.unitRate) : item.unitRate}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrencyBDT(item.totalCost, language)}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 hidden md:table-cell">
                    {language === 'bn' ? item.formulaNoteBn : item.formulaNoteEn}
                  </td>
                </tr>
              ))}

              {/* Labor Row */}
              <tr className="bg-slate-50 dark:bg-slate-850 font-medium">
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {t.laborCost}
                </td>
                <td className="px-4 py-3 font-mono">
                  {language === 'bn' ? toBengaliNumerals(estimation.floorAreaSqFt) : estimation.floorAreaSqFt} {t.sqFt}
                </td>
                <td className="px-4 py-3 font-mono">
                  ৳ {language === 'bn' ? toBengaliNumerals(rates.laborPerSqFt) : rates.laborPerSqFt}
                </td>
                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrencyBDT(estimation.laborCost, language)}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-500 hidden md:table-cell">
                  মেঝে ক্ষেত্রফল অনুযায়ী স্ট্যান্ডার্ড রাজমিস্ত্রি ও ফিনিশিং লেবার
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold text-sm">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right">
                  {t.totalEstimatedCost}:
                </td>
                <td className="px-4 py-3 text-sky-400 font-mono text-base">
                  {formatCurrencyBDT(estimation.grandTotal, language)}
                </td>
                <td className="hidden md:table-cell"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* TRANSPARENCY & DISCLAIMER NOTE */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs">
        <Info size={18} className="shrink-0 mt-0.5" />
        <p>{t.calcNote}</p>
      </div>
    </div>
  );
};
