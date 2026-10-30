/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, ProjectSettings, MeasurementUnit, PlotShape, RoadDirection, RoofType } from '../types';
import { useI18n } from '../localization/i18n';
import { toBengaliNumerals } from '../calculations/units';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';

interface NewProjectViewProps {
  onBack: () => void;
  onProceed: (settings: ProjectSettings, roofType: RoofType) => void;
}

export const NewProjectView: React.FC<NewProjectViewProps> = ({
  onBack,
  onProceed,
}) => {
  const { language } = useI18n();

  const [name, setName] = useState('আমার বাড়ি');
  const [length, setLength] = useState(50);
  const [width, setWidth] = useState(30);
  const [unit, setUnit] = useState<MeasurementUnit>('ft');
  const [plotShape, setPlotShape] = useState<PlotShape>('rectangle');
  const [roadDirection, setRoadDirection] = useState<RoadDirection>('east');
  const [floorsCount, setFloorsCount] = useState(2);
  const [houseType, setHouseType] = useState('আধুনিক বাড়ি');
  const [roofType, setRoofType] = useState<RoofType>('gable');
  const [budget, setBudget] = useState('১০,০০,০০০ টাকা');

  // Calculate area
  const areaSqFt = length * width;
  const areaSqM = Math.round(areaSqFt / 10.7639 * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBudget = parseInt(budget.replace(/[^0-9]/g, ''), 10) || 1000000;
    const settings: ProjectSettings = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      name: name || 'আমার বাড়ি',
      plotLength: length,
      plotWidth: width,
      plotShape,
      roadDirection,
      floorsCount,
      houseType,
      defaultUnit: unit,
      estimatedBudgetBdt: cleanBudget,
      currency: 'BDT',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onProceed(settings, roofType);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 select-none animate-in fade-in">
      {/* Header with Back Arrow matching Screen 3 */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          {language === 'bn' ? 'নতুন প্রজেক্ট' : 'New Project'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
        {/* প্রজেক্টের নাম */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            {language === 'bn' ? 'প্রজেক্টের নাম' : 'Project Name'}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
          />
        </div>

        {/* প্লটের দৈর্ঘ্য */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            {language === 'bn' ? 'প্লটের দৈর্ঘ্য' : 'Plot Length'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="10"
              required
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value) || 10)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
            />
            <div className="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-semibold text-slate-700 dark:text-slate-300">
              ফুট ▾
            </div>
          </div>
        </div>

        {/* প্লটের প্রস্থ */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            {language === 'bn' ? 'প্লটের প্রস্থ' : 'Plot Width'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="10"
              required
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value) || 10)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
            />
            <div className="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-semibold text-slate-700 dark:text-slate-300">
              ফুট ▾
            </div>
          </div>
        </div>

        {/* একক */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            একক
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
          >
            <option value="ft">ফুট ও ইঞ্চি ▾</option>
            <option value="m">মিটার ▾</option>
          </select>
        </div>

        {/* প্লটের আকার */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            প্লটের আকার
          </label>
          <select
            value={plotShape}
            onChange={(e) => setPlotShape(e.target.value as PlotShape)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
          >
            <option value="rectangle">আয়তাকার ▾</option>
            <option value="l_shape">এল-আকৃতির ▾</option>
            <option value="trapezoid">ট্রাপিজিয়াম ▾</option>
            <option value="custom">কাস্টম ▾</option>
          </select>
        </div>

        {/* রোডের দিক */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            রোডের দিক
          </label>
          <select
            value={roadDirection}
            onChange={(e) => setRoadDirection(e.target.value as RoadDirection)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
          >
            <option value="east">পূর্ব ▾</option>
            <option value="south">দক্ষিণ ▾</option>
            <option value="north">উত্তর ▾</option>
            <option value="west">পশ্চিম ▾</option>
          </select>
        </div>

        {/* তলা সংখ্যা */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            তলা সংখ্যা
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={floorsCount}
            onChange={(e) => setFloorsCount(parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
          />
        </div>

        {/* বাড়ির ধরন */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            বাড়ির ধরন
          </label>
          <select
            value={houseType}
            onChange={(e) => setHouseType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
          >
            <option value="আধুনিক বাড়ি">আধুনিক বাড়ি ▾</option>
            <option value="টিনশেড বাড়ি">টিনশেড বাড়ি ▾</option>
            <option value="ডুপ্লেক্স বাড়ি">ডুপ্লেক্স বাড়ি ▾</option>
            <option value="গ্রামীণ বাড়ি">গ্রামীণ বাড়ি ▾</option>
          </select>
        </div>

        {/* ছাদের ধরন */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            ছাদের ধরন
          </label>
          <select
            value={roofType}
            onChange={(e) => setRoofType(e.target.value as RoofType)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
          >
            <option value="gable">গ্যাবল ছাদ ▾</option>
            <option value="double_gable">চারচালা ছাদ ▾</option>
            <option value="hip">হিপ ছাদ ▾</option>
            <option value="single_slope">একচালা ছাদ ▾</option>
            <option value="flat">ফ্ল্যাট ছাদ ▾</option>
          </select>
        </div>

        {/* আনুমানিক বাজেট */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            আনুমানিক বাজেট
          </label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-white"
          />
        </div>

        {/* প্লটের আয়তন (Live Calculated Badge matching Screen 3) */}
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-sky-800 dark:text-sky-300 text-xs">
          <div className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">প্লটের আয়তন</div>
          <div className="font-bold text-sm text-[#0284C7] dark:text-sky-400 mt-0.5">
            {toBengaliNumerals(areaSqFt.toLocaleString())} বর্গফুট (≈ {toBengaliNumerals(areaSqM)} m²)
          </div>
        </div>

        {/* Action Button: পরবর্তী */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-sky-600 active:scale-95 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          {language === 'bn' ? 'পরবর্তী' : 'Next'}
        </button>
      </form>
    </div>
  );
};
