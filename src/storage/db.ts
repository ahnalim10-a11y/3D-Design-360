/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types';

const DB_NAME = '3D_DESIGN_360_DB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        const store = db.createObjectStore(STORE_PROJECTS, { keyPath: 'settings.id' });
        store.createIndex('updatedAt', 'settings.updatedAt', { unique: false });
        store.createIndex('name', 'settings.name', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProjectToDB(project: Project): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORE_PROJECTS);
    const updatedProject: Project = {
      ...project,
      settings: {
        ...project.settings,
        updatedAt: Date.now(),
      },
    };
    const request = store.put(updatedProject);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllProjectsFromDB(): Promise<Project[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readonly');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result as Project[]) || [];
      // Sort by updatedAt descending
      results.sort((a, b) => (b.settings.updatedAt || 0) - (a.settings.updatedAt || 0));
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getProjectByIdFromDB(id: string): Promise<Project | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readonly');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProjectFromDB(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function duplicateProjectInDB(project: Project, newNamePrefix = 'Copy of '): Promise<Project> {
  const newId = 'proj_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  const duplicated: Project = {
    ...project,
    settings: {
      ...project.settings,
      id: newId,
      name: `${newNamePrefix}${project.settings.name}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
  await saveProjectToDB(duplicated);
  return duplicated;
}

/**
 * Export project object as downloadable JSON file
 */
export function exportProjectJSON(project: Project) {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = project.settings.name.replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, '_');
  anchor.download = `${safeName || 'House_Plan'}_3D_Design_360.json`;
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate uploaded JSON file
 */
export async function importProjectJSON(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed || !parsed.settings || !Array.isArray(parsed.walls)) {
          throw new Error('Invalid project format.');
        }
        // Give new ID on import to avoid collisions if re-importing
        const importedProject: Project = {
          ...parsed,
          settings: {
            ...parsed.settings,
            id: 'proj_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
            name: `${parsed.settings.name} (Imported)`,
            updatedAt: Date.now(),
          },
        };
        resolve(importedProject);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
