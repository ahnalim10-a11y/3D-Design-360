/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MeasurementUnit = 'ft' | 'in' | 'm' | 'cm' | 'mm';

export type Language = 'bn' | 'en';

export type ThemeMode = 'light' | 'dark';

export type PlotShape = 'rectangle' | 'l_shape' | 'trapezoid' | 'custom';

export type RoadDirection = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

export type RoofType = 'gable' | 'double_gable' | 'hip' | 'single_slope' | 'flat';

export type RoofMaterial = 'clay_tile' | 'tin' | 'concrete' | 'metal_sheet' | 'slate' | 'shingle';

export type WallThickness = 5 | 10;

export type RoomType =
  | 'bedroom'
  | 'living'
  | 'dining'
  | 'kitchen'
  | 'bathroom'
  | 'toilet'
  | 'study'
  | 'prayer'
  | 'store'
  | 'veranda'
  | 'balcony'
  | 'garage'
  | 'corridor'
  | 'custom';

export interface Point2D {
  x: number; // in feet
  y: number; // in feet
}

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // 5 or 10 inches
  height: number;    // feet
  color?: string;
}

export interface Door {
  id: string;
  wallId?: string;
  position: Point2D;
  width: number;
  height: number;
  rotation: number;
  swingDirection?: 'inward' | 'outward';
  doorType?: 'single' | 'double' | 'sliding';
}

export interface WindowItem {
  id: string;
  wallId?: string;
  position: Point2D;
  width: number;
  height: number;
  sillHeight: number;
  rotation: number;
}

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  nameBn?: string;
  points: Point2D[];
  floorColor?: string;
  floorMaterial?: 'ceramic_tiles' | 'marble' | 'wood' | 'concrete' | 'mosaic';
  areaSqFt?: number;
}

export type FurnitureCategory =
  | 'furniture'
  | 'decor'
  | 'paint';

export type FurnitureType =
  | 'bed_single'
  | 'bed_king'
  | 'sofa_3seater'
  | 'sofa_lshape'
  | 'dining_table'
  | 'coffee_table'
  | 'chair'
  | 'wardrobe'
  | 'tv_unit'
  | 'kitchen_counter'
  | 'commode'
  | 'sink'
  | 'washbasin'
  | 'desk'
  | 'bookshelf'
  | 'staircase'
  | 'gate'
  | 'tree'
  | 'garden_bed'
  | 'car';

export interface Furniture {
  id: string;
  type: FurnitureType;
  name: string;
  nameBn?: string;
  position: Point2D;
  rotation: number;
  width: number;
  depth: number;
  height: number;
  color?: string;
}

export interface RoofConfig {
  type: RoofType;
  height: number;
  overhang: number;
  pitchDegrees: number;
  material: RoofMaterial;
  color: string;
  showRoof: boolean;
  cutawayHeight?: number;
}

export interface ProjectSettings {
  id: string;
  name: string;
  plotLength: number;
  plotWidth: number;
  plotShape: PlotShape;
  roadDirection: RoadDirection;
  floorsCount: number;
  houseType: string;
  defaultUnit: MeasurementUnit;
  estimatedBudgetBdt: number;
  currency: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  settings: ProjectSettings;
  walls: Wall[];
  rooms: Room[];
  doors: Door[];
  windows: WindowItem[];
  furniture: Furniture[];
  roof: RoofConfig;
}

export interface MaterialRateConfig {
  brickPerPcs: number;
  cementPerBag: number;
  sandPerCft: number;
  khoaPerCft: number;
  rodPerKg: number;
  tilesPerSqFt: number;
  paintPerLiter: number;
  tinSheetPerBundle: number;
  doorPerUnit: number;
  windowPerUnit: number;
  laborPerSqFt: number;
}

export type ViewTab =
  | 'splash'
  | 'dashboard'
  | 'new_project'
  | 'planner2d'
  | 'studio3d'
  | 'view360'
  | 'templates'
  | 'roof_designer'
  | 'interior'
  | 'estimator'
  | 'export'
  | 'projects'
  | 'offline_pwa'
  | 'settings';
