/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Project, ViewTab, ThemeMode, ProjectSettings, RoofType } from './types';
import { I18nProvider, useI18n } from './localization/i18n';
import { BANGLADESH_TEMPLATES } from './templates/houseTemplates';
import { saveProjectToDB, getProjectByIdFromDB, getAllProjectsFromDB, deleteProjectFromDB, duplicateProjectInDB } from './storage/db';
import { TopHeaderBanner } from './components/TopHeaderBanner';
import { BottomStatusBanner } from './components/BottomStatusBanner';
import { BottomNavBar } from './components/BottomNavBar';
import { SplashScreen } from './components/SplashScreen';
import { HomeDashboardView } from './components/HomeDashboardView';
import { NewProjectView } from './components/NewProjectView';
import { FloorPlanner2D } from './planner/FloorPlanner2D';
import { ThreeStudio3D } from './three/ThreeStudio3D';
import { View360Panorama } from './components/View360Panorama';
import { TemplatesModal } from './components/TemplatesModal';
import { RoofDesignerModal } from './components/RoofDesignerModal';
import { InteriorDesignerModal } from './components/InteriorDesignerModal';
import { MaterialBudgetView } from './components/MaterialBudgetView';
import { SaveExportView } from './components/SaveExportView';
import { ProjectManagementView } from './components/ProjectManagementView';
import { OfflinePWAView } from './components/OfflinePWAView';
import { SettingsView } from './components/SettingsView';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import { CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { language } = useI18n();

  // Active Screen Tab (starts at dashboard, user can see splash or any screen)
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Theme Mode
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('3d_design_360_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('3d_design_360_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active Project State
  const [project, setProject] = useState<Project>(() => {
    return BANGLADESH_TEMPLATES[1].createProject();
  });

  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [isAndroidGuideOpen, setIsAndroidGuideOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Expose global window helpers so buttons inside 2D/3D views can jump smoothly
  useEffect(() => {
    (window as any).__switchTo2D = () => setCurrentTab('planner2d');
    (window as any).__switchTo3D = () => setCurrentTab('studio3d');
    (window as any).__switchToDashboard = () => setCurrentTab('dashboard');
  }, []);

  const refreshProjects = async () => {
    try {
      const list = await getAllProjectsFromDB();
      setSavedProjects(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [project]);

  // Save project to IndexedDB
  const handleSaveProject = useCallback(async () => {
    try {
      await saveProjectToDB(project);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
      refreshProjects();
    } catch (e) {
      console.error(e);
    }
  }, [project]);

  // Handle Project Creation from Screen 3
  const handleCreateProject = (settings: ProjectSettings, roofType: RoofType) => {
    const newProj: Project = {
      settings,
      walls: [],
      rooms: [],
      doors: [],
      windows: [],
      furniture: [],
      roof: {
        type: roofType,
        height: 12,
        overhang: 2,
        pitchDegrees: 30,
        material: 'clay_tile',
        color: '#DC2626',
        showRoof: true,
      },
    };
    setProject(newProj);
    saveProjectToDB(newProj);
    setCurrentTab('planner2d');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. TOP HEADER BANNER (SCREEN REFERENCE HEADER) */}
      <TopHeaderBanner
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* SAVE TOAST */}
      {saveToast && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xl animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>প্রজেক্ট সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* 2. MAIN ACTIVE SCREEN BODY */}
      <main className="flex-1 w-full flex flex-col">
        {/* Screen 1: Splash */}
        {currentTab === 'splash' && (
          <SplashScreen onStart={() => setCurrentTab('dashboard')} />
        )}

        {/* Screen 2 / 15 / 16: Home Dashboard */}
        {currentTab === 'dashboard' && (
          <HomeDashboardView
            onSelectTab={setCurrentTab}
            onOpenNewProject={() => setCurrentTab('new_project')}
          />
        )}

        {/* Screen 3: New Project Creation */}
        {currentTab === 'new_project' && (
          <NewProjectView
            onBack={() => setCurrentTab('dashboard')}
            onProceed={handleCreateProject}
          />
        )}

        {/* Screen 4: 2D Floor Plan Editor */}
        {currentTab === 'planner2d' && (
          <FloorPlanner2D
            project={project}
            onUpdateProject={setProject}
            unit={project.settings.defaultUnit || 'ft'}
          />
        )}

        {/* Screen 5: 3D House View */}
        {currentTab === 'studio3d' && (
          <ThreeStudio3D
            project={project}
            onUpdateProject={setProject}
            defaultMode="orbit"
          />
        )}

        {/* Screen 6: 360 View / Walkthrough */}
        {currentTab === 'view360' && (
          <View360Panorama onBack={() => setCurrentTab('dashboard')} />
        )}

        {/* Screen 7: House Templates Gallery */}
        {currentTab === 'templates' && (
          <TemplatesModal
            isOpen={true}
            onClose={() => setCurrentTab('dashboard')}
            onSelectTemplate={(tmpl) => {
              setProject(tmpl);
              saveProjectToDB(tmpl);
              setCurrentTab('studio3d');
            }}
          />
        )}

        {/* Screen 8: Roof Designer */}
        {currentTab === 'roof_designer' && (
          <RoofDesignerModal
            project={project}
            onUpdateProject={setProject}
            onBack={() => setCurrentTab('studio3d')}
          />
        )}

        {/* Screen 9: Interior Designer */}
        {currentTab === 'interior' && (
          <InteriorDesignerModal
            project={project}
            onUpdateProject={setProject}
            onBack={() => setCurrentTab('dashboard')}
            onNavigateTo3D={() => setCurrentTab('studio3d')}
          />
        )}

        {/* Screen 10: Material & Budget Calculator */}
        {currentTab === 'estimator' && (
          <MaterialBudgetView
            project={project}
            onBack={() => setCurrentTab('dashboard')}
          />
        )}

        {/* Screen 11: Save & Export */}
        {currentTab === 'export' && (
          <SaveExportView
            project={project}
            onUpdateProject={setProject}
            onSave={handleSaveProject}
            onOpenProjects={() => setCurrentTab('projects')}
            onBack={() => setCurrentTab('dashboard')}
            onExportPdf={() => setCurrentTab('estimator')}
            onExportPng={() => setCurrentTab('studio3d')}
          />
        )}

        {/* Screen 12: Project Management */}
        {currentTab === 'projects' && (
          <ProjectManagementView
            projects={savedProjects}
            activeProjectId={project.settings.id}
            onSelectProject={(p) => {
              setProject(p);
              setCurrentTab('planner2d');
            }}
            onNewProject={() => setCurrentTab('new_project')}
            onDeleteProject={async (id) => {
              await deleteProjectFromDB(id);
              refreshProjects();
            }}
            onDuplicateProject={async (p) => {
              await duplicateProjectInDB(p);
              refreshProjects();
            }}
          />
        )}

        {/* Screen 13: Offline Support PWA */}
        {currentTab === 'offline_pwa' && (
          <OfflinePWAView onBack={() => setCurrentTab('dashboard')} />
        )}

        {/* Screen 14: Settings */}
        {currentTab === 'settings' && (
          <SettingsView
            onBack={() => setCurrentTab('dashboard')}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenExport={() => setCurrentTab('export')}
          />
        )}
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (Home | Projects | Settings) */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* 4. BOTTOM STATUS BANNER MATCHING DESIGN STRIP */}
      <BottomStatusBanner onOpenAndroidGuide={() => setIsAndroidGuideOpen(true)} />

      {/* MODALS */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(tmpl) => {
          setProject(tmpl);
          saveProjectToDB(tmpl);
          setCurrentTab('studio3d');
        }}
      />

      <AndroidGuideModal
        isOpen={isAndroidGuideOpen}
        onClose={() => setIsAndroidGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
