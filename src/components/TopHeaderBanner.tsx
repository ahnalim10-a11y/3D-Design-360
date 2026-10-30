/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ViewTab } from '../types';
import {
  Square,
  Box,
  RotateCw,
  Armchair,
  Coins,
  Upload,
  Smartphone,
  Home,
  CheckCircle2,
} from 'lucide-react';

interface TopHeaderBannerProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export const TopHeaderBanner: React.FC<TopHeaderBannerProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const quickLinks: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'planner2d', label: '2D Plan', icon: <Square size={17} /> },
    { id: 'studio3d', label: '3D Model', icon: <Box size={17} /> },
    { id: 'view360', label: '360° View', icon: <RotateCw size={17} /> },
    { id: 'interior', label: 'Interior', icon: <Armchair size={17} /> },
    { id: 'estimator', label: 'Budget', icon: <Coins size={17} /> },
    { id: 'export', label: 'Export', icon: <Upload size={17} /> },
    { id: 'offline_pwa', label: 'Offline', icon: <Smartphone size={17} /> },
  ];

  return (
    <div className="w-full bg-[#0284C7] text-white shadow-md border-b border-sky-600/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* LEFT BRAND LOGO & TITLE */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          {/* Logo icon */}
          <div className="w-10 h-10 rounded-xl bg-white text-[#0284C7] flex items-center justify-center shadow-md font-black text-xl group-hover:scale-105 transition">
            <Home size={22} className="text-[#0284C7]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-black text-base sm:text-lg tracking-tight leading-tight">
              <span>3D DESIGN</span>
              <span className="text-white bg-sky-900/40 px-1.5 py-0.2 rounded font-extrabold text-sm sm:text-base border border-white/30">
                360°
              </span>
            </div>
            <div className="text-[10px] tracking-wider font-medium text-sky-100 uppercase">
              Plan • Design • Visualize • Build
            </div>
          </div>
        </div>

        {/* CENTER SLOGAN */}
        <div className="hidden md:flex flex-col items-center text-center">
          <div className="font-bold text-sm sm:text-base tracking-wide text-white drop-shadow-sm">
            আপনার স্বপ্নের বাড়ি, এখন 3D-তে
          </div>
        </div>

        {/* RIGHT QUICK NAVIGATION ICONS & SMART PLANNING BADGE */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-1 bg-sky-700/60 p-1 rounded-xl border border-sky-400/40">
            {quickLinks.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                    isActive
                      ? 'bg-white text-[#0284C7] shadow-sm'
                      : 'text-white/90 hover:bg-sky-600/70 hover:text-white'
                  }`}
                  title={item.label}
                >
                  {item.icon}
                  <span className="mt-0.5 leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* SMART PLANNING BADGE */}
          <div className="hidden lg:flex flex-col items-end text-right border-l border-sky-400/40 pl-3">
            <div className="font-extrabold text-xs text-white flex items-center gap-1">
              <span>স্মার্ট প্ল্যানিং</span>
            </div>
            <div className="text-[10px] text-sky-200 font-medium">
              বেটার লাইফ 🏠
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
