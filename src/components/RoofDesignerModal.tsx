/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, RoofConfig, RoofType, RoofMaterial } from '../types';
import { useI18n } from '../localization/i18n';
import { ArrowLeft, Check, Sliders } from 'lucide-react';

interface RoofDesignerModalProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onBack: () => void;
}

export const RoofDesignerModal: React.FC<RoofDesignerModalProps> = ({
  project,
  onUpdateProject,
  onBack,
}) => {
  const { language } = useI18n();

  const [roofType, setRoofType] = useState<RoofType>(project.roof.type || 'gable');
  const [roofHeight, setRoofHeight] = useState(project.roof.height || 12);
  const [pitchDegrees, setPitchDegrees] = useState(project.roof.pitchDegrees || 30);
  const [roofOverhang, setRoofOverhang] = useState(project.roof.overhang || 2);
  const [roofMaterial, setRoofMaterial] = useState<RoofMaterial>(project.roof.material || 'clay_tile');
  const [roofColor, setRoofColor] = useState(project.roof.color || '#DC2626');

  const materialsList: { id: RoofMaterial; label: string; color: string }[] = [
    { id: 'clay_tile', label: 'লাল টালি', color: '#DC2626' },
    { id: 'tin', label: 'ঢেউটিন', color: '#0284C7' },
    { id: 'concrete', label: 'কনক্রিট', color: '#94A3B8' },
    { id: 'metal_sheet', label: 'মেটাল শিট', color: '#047857' },
    { id: 'slate', label: 'স্লেট', color: '#334155' },
  ];

  const handleApply = () => {
    const updatedRoof: RoofConfig = {
      ...project.roof,
      type: roofType,
      height: roofHeight,
      pitchDegrees,
      overhang: roofOverhang,
      material: roofMaterial,
      color: roofColor,
      showRoof: true,
    };
    onUpdateProject({
      ...project,
      roof: updatedRoof,
    });
    onBack();
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 select-none animate-in fade-in">
      {/* HEADER */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          {language === 'bn' ? 'ছাদ ডিজাইনার' : 'Roof Designer'}
        </h2>
      </div>

      {/* 3D ROOF VISUAL PREVIEW CARD AS SHOWN IN SCREEN 8 */}
      <div className="relative w-full h-44 my-4 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-200 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        {/* Visual 3D House Roof Illustration */}
        <div className="relative flex flex-col items-center">
          {/* Pitched Roof Polygon */}
          <div
            className="w-48 h-20 transition-all duration-300"
            style={{
              clipPath:
                roofType === 'single_slope'
                  ? 'polygon(0% 20%, 100% 0%, 100% 100%, 0% 100%)'
                  : 'polygon(50% 0%, 100% 100%, 0% 100%)',
              backgroundColor: roofColor,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          />
          {/* House body */}
          <div className="w-40 h-16 bg-white dark:bg-slate-200 border-x-4 border-b-4 border-slate-300 flex items-center justify-around px-4">
            <div className="w-8 h-10 bg-sky-300 border border-slate-400 rounded-xs" />
            <div className="w-8 h-12 bg-amber-800 border border-slate-700 rounded-t-xs" />
            <div className="w-8 h-10 bg-sky-300 border border-slate-400 rounded-xs" />
          </div>
        </div>

        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-bold">
          {roofType.toUpperCase()}
        </div>
      </div>

      {/* FORM CONTROLS MATCHING SCREEN 8 */}
      <div className="space-y-4 text-xs">
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
            <option value="gable">গ্যাবল ছাদ (Gable Roof)</option>
            <option value="double_gable">চারচালা ছাদ (Double Gable)</option>
            <option value="hip">হিপ ছাদ (Hip Roof)</option>
            <option value="single_slope">একচালা ছাদ (Single Slope)</option>
            <option value="flat">ফ্ল্যাট ছাদ (Flat Roof)</option>
          </select>
        </div>

        {/* ছাদের উচ্চতা */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-600 dark:text-slate-300 font-semibold">
            <span>ছাদের উচ্চতা</span>
            <span className="font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[#0284C7] font-bold">
              {roofHeight} ft
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="20"
            step="1"
            value={roofHeight}
            onChange={(e) => setRoofHeight(parseInt(e.target.value, 10))}
            className="w-full accent-[#0284C7]"
          />
        </div>

        {/* পিচ (ঢাল) */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-600 dark:text-slate-300 font-semibold">
            <span>পিচ (ঢাল)</span>
            <span className="font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[#0284C7] font-bold">
              {pitchDegrees} °
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={pitchDegrees}
            onChange={(e) => setPitchDegrees(parseInt(e.target.value, 10))}
            className="w-full accent-[#0284C7]"
          />
        </div>

        {/* ওভারহ্যাং */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-600 dark:text-slate-300 font-semibold">
            <span>ওভারহ্যাং</span>
            <span className="font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[#0284C7] font-bold">
              {roofOverhang} ft
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={roofOverhang}
            onChange={(e) => setRoofOverhang(parseFloat(e.target.value))}
            className="w-full accent-[#0284C7]"
          />
        </div>

        {/* ছাদ উপকরণ (Material Swatches) */}
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-2">
            ছাদ উপকরণ
          </label>
          <div className="flex items-center justify-between gap-2">
            {materialsList.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setRoofMaterial(m.id);
                  setRoofColor(m.color);
                }}
                className={`flex-1 p-2 rounded-xl flex flex-col items-center gap-1 border transition cursor-pointer ${
                  roofMaterial === m.id
                    ? 'border-[#0284C7] ring-2 ring-sky-500/20 bg-sky-50 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full border border-black/20 shadow-xs"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button: প্রয়োগ করুন */}
        <button
          onClick={handleApply}
          className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-sky-600 active:scale-95 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          {language === 'bn' ? 'প্রয়োগ করুন' : 'Apply'}
        </button>
      </div>
    </div>
  );
};
