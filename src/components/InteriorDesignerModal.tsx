/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Furniture, FurnitureType } from '../types';
import { useI18n } from '../localization/i18n';
import {
  ArrowLeft,
  Check,
  Bed,
  Armchair,
  UtensilsCrossed,
  Square,
  Package,
  Bath,
  Droplet,
  DoorClosed,
  Plus,
} from 'lucide-react';

interface InteriorDesignerModalProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onBack: () => void;
  onNavigateTo3D: () => void;
}

export const InteriorDesignerModal: React.FC<InteriorDesignerModalProps> = ({
  project,
  onUpdateProject,
  onBack,
  onNavigateTo3D,
}) => {
  const { language } = useI18n();

  const [activeTab, setActiveTab] = useState<'furniture' | 'decor' | 'paint'>('furniture');
  const [selectedItemType, setSelectedItemType] = useState<FurnitureType>('bed_king');

  const itemsList: { type: FurnitureType; nameBn: string; nameEn: string; icon: React.ReactNode }[] = [
    { type: 'bed_king', nameBn: 'বেড', nameEn: 'Bed', icon: <Bed size={22} className="text-amber-600" /> },
    { type: 'sofa_3seater', nameBn: 'সোফা', nameEn: 'Sofa', icon: <Armchair size={22} className="text-sky-600" /> },
    { type: 'dining_table', nameBn: 'টেবিল', nameEn: 'Table', icon: <UtensilsCrossed size={22} className="text-indigo-600" /> },
    { type: 'chair', nameBn: 'চেয়ার', nameEn: 'Chair', icon: <Square size={22} className="text-purple-600" /> },
    { type: 'wardrobe', nameBn: 'ওয়ার্ডরোব', nameEn: 'Wardrobe', icon: <Package size={22} className="text-rose-600" /> },
    { type: 'kitchen_counter', nameBn: 'কিচেন কেবিনেট', nameEn: 'Kitchen Cabinet', icon: <Square size={22} className="text-emerald-600" /> },
    { type: 'commode', nameBn: 'টয়লেট', nameEn: 'Toilet', icon: <Bath size={22} className="text-cyan-600" /> },
    { type: 'sink', nameBn: 'সিংক', nameEn: 'Sink', icon: <Droplet size={22} className="text-blue-600" /> },
    { type: 'gate', nameBn: 'গেট', nameEn: 'Gate', icon: <DoorClosed size={22} className="text-slate-600" /> },
  ];

  const handleAddItem = () => {
    const itemConfig = itemsList.find((i) => i.type === selectedItemType) || itemsList[0];
    const newFurniture: Furniture = {
      id: 'furn_' + Math.random().toString(36).substring(2, 9),
      type: selectedItemType,
      name: itemConfig.nameEn,
      nameBn: itemConfig.nameBn,
      position: { x: (project.settings.plotLength || 30) / 2, y: (project.settings.plotWidth || 20) / 2 },
      rotation: 0,
      width: selectedItemType === 'bed_king' ? 6.5 : 4,
      depth: selectedItemType === 'bed_king' ? 6.5 : 3,
      height: 3,
    };

    onUpdateProject({
      ...project,
      furniture: [...project.furniture, newFurniture],
    });

    onNavigateTo3D();
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
          {language === 'bn' ? 'ইন্টেরিয়র ডিজাইন' : 'Interior Design'}
        </h2>
      </div>

      {/* 3D CUTAWAY PERSPECTIVE PREVIEW CARD MATCHING SCREEN 9 */}
      <div className="relative w-full h-44 my-4 rounded-2xl bg-gradient-to-tr from-amber-100 via-sky-50 to-orange-100 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        {/* Isometric Cutaway Rooms Illustration */}
        <div className="relative w-48 h-32 border-2 border-amber-800/40 rounded-xl bg-amber-50 dark:bg-slate-900/60 p-2 grid grid-cols-2 gap-2 shadow-lg">
          <div className="border border-dashed border-amber-500/40 rounded-lg p-1.5 flex flex-col justify-end bg-amber-100/40">
            <div className="w-10 h-7 bg-amber-700/80 rounded-xs mb-1" />
            <span className="text-[9px] font-bold text-amber-800 dark:text-amber-200">বেডরুম</span>
          </div>
          <div className="border border-dashed border-sky-500/40 rounded-lg p-1.5 flex flex-col justify-end bg-sky-100/40">
            <div className="w-10 h-6 bg-sky-600/80 rounded-xs mb-1" />
            <span className="text-[9px] font-bold text-sky-800 dark:text-sky-200">লিভিং</span>
          </div>
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          <span className="px-2 py-0.5 rounded-full bg-[#0284C7] text-white text-[10px] font-bold">
            2D
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
            3D
          </span>
        </div>
      </div>

      {/* TABS: ফার্নিচার | সাজসজ্জা | পেইন্ট MATCHING SCREEN 9 */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('furniture')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
            activeTab === 'furniture'
              ? 'bg-white dark:bg-slate-900 text-[#0284C7] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          {language === 'bn' ? 'ফার্নিচার' : 'Furniture'}
        </button>
        <button
          onClick={() => setActiveTab('decor')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
            activeTab === 'decor'
              ? 'bg-white dark:bg-slate-900 text-[#0284C7] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          {language === 'bn' ? 'সাজসজ্জা' : 'Decor'}
        </button>
        <button
          onClick={() => setActiveTab('paint')}
          className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
            activeTab === 'paint'
              ? 'bg-white dark:bg-slate-900 text-[#0284C7] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          {language === 'bn' ? 'পেইন্ট' : 'Paint'}
        </button>
      </div>

      {/* 9 ITEMS GRID MATCHING SCREEN 9 */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {itemsList.map((item) => {
          const isSelected = selectedItemType === item.type;
          return (
            <div
              key={item.type}
              onClick={() => setSelectedItemType(item.type)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition cursor-pointer ${
                isSelected
                  ? 'border-[#0284C7] ring-2 ring-sky-500/20 bg-sky-50 dark:bg-sky-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="mb-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                {item.icon}
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center">
                {language === 'bn' ? item.nameBn : item.nameEn}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Button: বস্তু যোগ করুন */}
      <button
        onClick={handleAddItem}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0284C7] hover:bg-sky-600 active:scale-95 text-white font-bold text-sm shadow-md transition cursor-pointer"
      >
        <Plus size={16} />
        <span>{language === 'bn' ? 'বস্তু যোগ করুন' : 'Add Item'}</span>
      </button>
    </div>
  );
};
