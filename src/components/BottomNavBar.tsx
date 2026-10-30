/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ViewTab } from '../types';
import { Home, FolderOpen, Settings } from 'lucide-react';
import { useI18n } from '../localization/i18n';

interface BottomNavBarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { language } = useI18n();

  const items = [
    {
      id: 'dashboard' as ViewTab,
      labelBn: 'হোম',
      labelEn: 'Home',
      icon: <Home size={19} />,
    },
    {
      id: 'projects' as ViewTab,
      labelBn: 'প্রজেক্ট',
      labelEn: 'Projects',
      icon: <FolderOpen size={19} />,
    },
    {
      id: 'settings' as ViewTab,
      labelBn: 'সেটিংস',
      labelEn: 'Settings',
      icon: <Settings size={19} />,
    },
  ];

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-1.5 px-4 flex items-center justify-around shadow-lg z-30 select-none">
      {items.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition ${
              isActive
                ? 'text-[#0284C7] dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="text-[11px] mt-0.5">
              {language === 'bn' ? item.labelBn : item.labelEn}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
