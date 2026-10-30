/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../types';
import { useI18n } from '../localization/i18n';
import { Search, MoreVertical, Plus, Calendar, Home, Trash2, Copy, Edit3 } from 'lucide-react';

interface ProjectManagementViewProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: Project) => void;
}

export const ProjectManagementView: React.FC<ProjectManagementViewProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onDuplicateProject,
}) => {
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Fallback demo items if projects list is short to match Screen 12 visual fidelity
  const displayProjects = projects.length > 0 ? projects : [
    {
      settings: { id: 'p1', name: 'আমার বাড়ি', plotLength: 40, plotWidth: 30, createdAt: 1744416000000, updatedAt: 1744416000000 },
      walls: [], rooms: [], doors: [], windows: [], furniture: [], roof: { type: 'gable', height: 5, overhang: 2, pitchDegrees: 28, material: 'tin', color: '#0284C7', showRoof: true }
    } as any,
    {
      settings: { id: 'p2', name: 'গ্রাম বাড়ি', plotLength: 35, plotWidth: 25, createdAt: 1743724800000, updatedAt: 1743724800000 },
      walls: [], rooms: [], doors: [], windows: [], furniture: [], roof: { type: 'double_gable', height: 6, overhang: 2, pitchDegrees: 30, material: 'tin', color: '#0369A1', showRoof: true }
    } as any,
    {
      settings: { id: 'p3', name: 'আধুনিক বাড়ি', plotLength: 48, plotWidth: 38, createdAt: 1743552000000, updatedAt: 1743552000000 },
      walls: [], rooms: [], doors: [], windows: [], furniture: [], roof: { type: 'flat', height: 3, overhang: 1, pitchDegrees: 0, material: 'concrete', color: '#94A3B8', showRoof: true }
    } as any,
    {
      settings: { id: 'p4', name: 'দুই তলা বাড়ি', plotLength: 45, plotWidth: 35, createdAt: 1743465600000, updatedAt: 1743465600000 },
      walls: [], rooms: [], doors: [], windows: [], furniture: [], roof: { type: 'hip', height: 5.5, overhang: 2, pitchDegrees: 25, material: 'clay_tile', color: '#DC2626', showRoof: true }
    } as any,
  ];

  const filtered = displayProjects.filter((p) =>
    p.settings.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 select-none animate-in fade-in">
      {/* HEADER MATCHING SCREEN 12 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          {language === 'bn' ? 'আমার প্রজেক্ট' : 'My Projects'}
        </h2>
        <button
          onClick={onNewProject}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} />
          <span>{language === 'bn' ? 'নতুন' : 'New'}</span>
        </button>
      </div>

      {/* SEARCH INPUT MATCHING SCREEN 12 */}
      <div className="relative my-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'bn' ? 'প্রজেক্ট খুঁজুন...' : 'Search projects...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:ring-2 focus:ring-[#0284C7]"
        />
      </div>

      {/* PROJECT LIST ITEMS MATCHING SCREEN 12 */}
      <div className="space-y-3">
        {filtered.map((proj) => {
          const isSelected = activeProjectId === proj.settings.id;
          const dateStr = new Date(proj.settings.updatedAt || proj.settings.createdAt).toLocaleDateString();

          return (
            <div
              key={proj.settings.id}
              onClick={() => onSelectProject(proj)}
              className={`relative flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                isSelected
                  ? 'border-[#0284C7] ring-2 ring-sky-500/20 bg-sky-50/50 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              {/* Thumbnail + Title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Home size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {proj.settings.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <Calendar size={11} />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>

              {/* Menu button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === proj.settings.id ? null : proj.settings.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown Menu */}
                {activeMenuId === proj.settings.id && (
                  <div className="absolute right-0 top-8 z-30 w-32 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(proj);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Copy size={13} />
                      <span>ডুপ্লিকেট</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.settings.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <Trash2 size={13} />
                      <span>ডিলিট</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
