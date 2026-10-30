/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Project,
  ProjectSettings,
  MeasurementUnit,
  PlotShape,
  RoadDirection,
  RoofType,
} from '../types';
import { useI18n } from '../localization/i18n';
import {
  calculateLandArea,
  convertToFeet,
  convertFromFeet,
  formatCurrencyBDT,
  toBengaliNumerals,
} from '../calculations/units';
import { Layers, X, Check, MapPin, Compass, Building, Banknote } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ProjectSettings, roofType?: RoofType) => void;
  existingProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingProject,
}) => {
  const { t, language } = useI18n();

  const [unit, setUnit] = useState<MeasurementUnit>(
    existingProject?.settings.defaultUnit || 'ft'
  );
  const [name, setName] = useState(
    existingProject?.settings.name || (language === 'bn' ? 'আমার স্বপ্নের বাড়ি' : 'My Dream House')
  );

  // Stored in user unit for input field
  const [lengthInput, setLengthInput] = useState(
    existingProject ? convertFromFeet(existingProject.settings.plotLength, unit) : 40
  );
  const [widthInput, setWidthInput] = useState(
    existingProject ? convertFromFeet(existingProject.settings.plotWidth, unit) : 30
  );

  const [plotShape, setPlotShape] = useState<PlotShape>(
    existingProject?.settings.plotShape || 'rectangle'
  );
  const [roadDirection, setRoadDirection] = useState<RoadDirection>(
    existingProject?.settings.roadDirection || 'south'
  );
  const [floorsCount, setFloorsCount] = useState<number>(
    existingProject?.settings.floorsCount || 1
  );
  const [houseType, setHouseType] = useState<string>(
    existingProject?.settings.houseType || 'আধুনিক আরসিসি পাকা বাড়ি'
  );
  const [roofType, setRoofType] = useState<RoofType>(
    existingProject?.roof.type || 'gable'
  );
  const [estimatedBudget, setEstimatedBudget] = useState<number>(
    existingProject?.settings.estimatedBudgetBdt || 1500000
  );

  useEffect(() => {
    if (existingProject) {
      setName(existingProject.settings.name);
      setUnit(existingProject.settings.defaultUnit || 'ft');
      setLengthInput(convertFromFeet(existingProject.settings.plotLength, existingProject.settings.defaultUnit || 'ft'));
      setWidthInput(convertFromFeet(existingProject.settings.plotWidth, existingProject.settings.defaultUnit || 'ft'));
      setPlotShape(existingProject.settings.plotShape);
      setRoadDirection(existingProject.settings.roadDirection);
      setFloorsCount(existingProject.settings.floorsCount);
      setHouseType(existingProject.settings.houseType);
      setRoofType(existingProject.roof.type);
      setEstimatedBudget(existingProject.settings.estimatedBudgetBdt);
    }
  }, [existingProject]);

  if (!isOpen) return null;

  // Internal length & width in feet
  const lengthFt = convertToFeet(lengthInput, unit);
  const widthFt = convertToFeet(widthInput, unit);
  const landArea = calculateLandArea(lengthFt, widthFt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings: ProjectSettings = {
      id: existingProject?.settings.id || 'proj_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      name: name.trim() || 'Untitled House Plan',
      plotLength: Math.max(10, Math.round(lengthFt * 10) / 10),
      plotWidth: Math.max(10, Math.round(widthFt * 10) / 10),
      plotShape,
      roadDirection,
      floorsCount,
      houseType,
      defaultUnit: unit,
      estimatedBudgetBdt: estimatedBudget,
      currency: 'BDT',
      createdAt: existingProject?.settings.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSave(settings, roofType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-600/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
              <Building size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {existingProject ? t.projectDetails : t.newProject}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'প্লটের পরিমাপ, তলার সংখ্যা ও আনুমানিক বাজেট নির্ধারণ করুন'
                  : 'Enter plot dimensions, unit type, number of storeys and estimated budget'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Project Name */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              {t.projectName}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Unit & Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                {t.measurementUnit}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              >
                <option value="ft">{t.unitFeet} (Feet)</option>
                <option value="in">ইঞ্চি (Inches)</option>
                <option value="m">মিটার (Meters)</option>
                <option value="cm">সেন্টিমিটার (cm)</option>
                <option value="mm">মিলিমিটার (mm)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                {t.plotLength} ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                required
                value={lengthInput}
                onChange={(e) => setLengthInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                {t.plotWidth} ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                required
                value={widthInput}
                onChange={(e) => setWidthInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* LAND AREA BREAKDOWN IN BANGLADESHI UNITS */}
          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 space-y-2">
            <div className="font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
              <MapPin size={15} />
              <span>{t.plotArea} (বাংলাদেশি ভূমি পরিমাপ):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
                <div className="text-[11px] text-slate-500">{t.sqFt}</div>
                <div className="font-bold text-sm text-slate-800 dark:text-white">
                  {language === 'bn' ? toBengaliNumerals(landArea.sqFt) : landArea.sqFt}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm border-2 border-sky-500/30">
                <div className="text-[11px] text-sky-600 font-bold">{t.decimals}</div>
                <div className="font-black text-sm text-sky-600 dark:text-sky-400">
                  {language === 'bn' ? toBengaliNumerals(landArea.decimals) : landArea.decimals}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
                <div className="text-[11px] text-slate-500">{t.katha}</div>
                <div className="font-bold text-sm text-slate-800 dark:text-white">
                  {language === 'bn' ? toBengaliNumerals(landArea.katha) : landArea.katha}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
                <div className="text-[11px] text-slate-500">{t.sqMeters}</div>
                <div className="font-bold text-sm text-slate-800 dark:text-white">
                  {language === 'bn' ? toBengaliNumerals(landArea.sqMeters) : landArea.sqMeters}
                </div>
              </div>
            </div>
          </div>

          {/* Floors & Road Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                {t.floorsCount}
              </label>
              <select
                value={floorsCount}
                onChange={(e) => setFloorsCount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              >
                <option value={1}>১ তলা (Single Storey)</option>
                <option value={2}>২ তলা (Duplex / Double Storey)</option>
                <option value={3}>৩ তলা (Triple Storey)</option>
                <option value={4}>৪ তলা (4 Storey)</option>
                <option value={5}>৫ তলা (5 Storey)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                {t.roadDirection}
              </label>
              <select
                value={roadDirection}
                onChange={(e) => setRoadDirection(e.target.value as RoadDirection)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              >
                <option value="south">দক্ষিণমুখী (South Faced - Preferred)</option>
                <option value="north">উত্তরমুখী (North Faced)</option>
                <option value="east">পূর্বমুখী (East Faced)</option>
                <option value="west">পশ্চিমমুখী (West Faced)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                {t.roofType}
              </label>
              <select
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as RoofType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              >
                <option value="gable">{t.gableRoof}</option>
                <option value="double_gable">{t.doubleGableRoof}</option>
                <option value="hip">{t.hipRoof}</option>
                <option value="single_slope">{t.singleSlopeRoof}</option>
                <option value="flat">{t.flatRoof}</option>
              </select>
            </div>
          </div>

          {/* House Type & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                {t.houseType}
              </label>
              <input
                type="text"
                value={houseType}
                onChange={(e) => setHouseType(e.target.value)}
                placeholder="যেমন: আধুনিক পাকা আরসিসি ভবন"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                {t.estimatedBudget}
              </label>
              <input
                type="number"
                step="50000"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sky-600 dark:text-sky-400"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-600 dark:text-slate-300"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg transition"
            >
              <Check size={16} />
              <span>{existingProject ? t.updateProjectBtn : t.createProjectBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
