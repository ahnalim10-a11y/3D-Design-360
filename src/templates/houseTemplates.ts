/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Wall, Room, Door, WindowItem, Furniture, RoofConfig } from '../types';

export interface HouseTemplate {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'rural' | 'tin_shed' | 'concrete' | 'modern';
  descriptionBn: string;
  descriptionEn: string;
  plotLength: number;
  plotWidth: number;
  floorsCount: number;
  estimatedBudgetBdt: number;
  createProject: () => Project;
}

function makeWall(id: string, x1: number, y1: number, x2: number, y2: number, thickness: 5 | 10 = 10): Wall {
  return {
    id,
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness,
    height: 10,
    color: thickness === 10 ? '#E2E8F0' : '#CBD5E1',
  };
}

function makeRectRoom(
  id: string,
  type: Room['type'],
  nameEn: string,
  nameBn: string,
  x: number,
  y: number,
  w: number,
  h: number,
  floorColor = '#F8FAFC'
): Room {
  return {
    id,
    type,
    name: nameEn,
    nameBn,
    points: [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ],
    areaSqFt: w * h,
    floorColor,
    floorMaterial: 'ceramic_tiles',
  };
}

// 1. Small Rural House (ছোট গ্রামীণ বাড়ি — ১ ঘর + বারান্দা)
function createSmallRural(): Project {
  const rooms: Room[] = [
    makeRectRoom('r1', 'bedroom', 'Main Room', 'মূল শোবার ঘর', 0, 0, 16, 14, '#FEF3C7'),
    makeRectRoom('r2', 'veranda', 'Front Veranda', 'সামনের টানা বারান্দা', 0, 14, 16, 6, '#E0F2FE'),
  ];
  const walls: Wall[] = [
    // Main room
    makeWall('w1', 0, 0, 16, 0, 10),
    makeWall('w2', 16, 0, 16, 14, 10),
    makeWall('w3', 16, 14, 0, 14, 5), // partition wall
    makeWall('w4', 0, 14, 0, 0, 10),
    // Veranda low/open wall
    makeWall('w5', 0, 14, 0, 20, 5),
    makeWall('w6', 0, 20, 16, 20, 5),
    makeWall('w7', 16, 20, 16, 14, 5),
  ];
  const doors: Door[] = [
    { id: 'd1', position: { x: 8, y: 14 }, width: 3.5, height: 7, rotation: 0 },
    { id: 'd2', position: { x: 8, y: 20 }, width: 3.5, height: 7, rotation: 0 },
  ];
  const windows: WindowItem[] = [
    { id: 'wn1', position: { x: 4, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn2', position: { x: 12, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn3', position: { x: 0, y: 7 }, width: 3.5, height: 4, sillHeight: 2.5, rotation: 90 },
    { id: 'wn4', position: { x: 16, y: 7 }, width: 3.5, height: 4, sillHeight: 2.5, rotation: 90 },
  ];
  const furniture: Furniture[] = [
    { id: 'f1', type: 'bed_king', name: 'খাটের সেট', position: { x: 4, y: 4 }, rotation: 0, width: 6.5, depth: 6.5, height: 3 },
    { id: 'f2', type: 'wardrobe', name: 'আলমিরা', position: { x: 13, y: 3 }, rotation: 90, width: 4, depth: 2, height: 6.5 },
  ];
  const roof: RoofConfig = {
    type: 'gable',
    height: 5,
    overhang: 2,
    pitchDegrees: 28,
    material: 'tin',
    color: '#0284C7',
    showRoof: true,
  };
  return {
    settings: {
      id: 'proj_tmpl_small_rural',
      name: 'ছোট গ্রামীণ বাড়ি',
      plotLength: 30,
      plotWidth: 25,
      plotShape: 'rectangle',
      roadDirection: 'south',
      floorsCount: 1,
      houseType: 'গ্রামীণ টিনশেড',
      defaultUnit: 'ft',
      estimatedBudgetBdt: 350000,
      currency: 'BDT',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    rooms,
    walls,
    doors,
    windows,
    furniture,
    roof,
  };
}

// 2. Two-Room Tin-Shed House (দুই রুমের টিনশেড বাড়ি)
function createTwoRoomTinShed(): Project {
  const rooms: Room[] = [
    makeRectRoom('r1', 'bedroom', 'Bedroom 1', 'শোবার ঘর ১', 0, 0, 14, 14, '#FEF3C7'),
    makeRectRoom('r2', 'bedroom', 'Bedroom 2', 'শোবার ঘর ২', 14, 0, 14, 14, '#EDE9FE'),
    makeRectRoom('r3', 'veranda', 'Full Veranda', 'টানা বারান্দা', 0, 14, 28, 6, '#E0F2FE'),
  ];
  const walls: Wall[] = [
    // Outer perimeter
    makeWall('w1', 0, 0, 28, 0, 10),
    makeWall('w2', 28, 0, 28, 14, 10),
    makeWall('w3', 28, 14, 0, 14, 5),
    makeWall('w4', 0, 14, 0, 0, 10),
    // Center divider
    makeWall('w5', 14, 0, 14, 14, 5),
    // Veranda
    makeWall('w6', 0, 14, 0, 20, 5),
    makeWall('w7', 0, 20, 28, 20, 5),
    makeWall('w8', 28, 20, 28, 14, 5),
  ];
  const doors: Door[] = [
    { id: 'd1', position: { x: 7, y: 14 }, width: 3.25, height: 7, rotation: 0 },
    { id: 'd2', position: { x: 21, y: 14 }, width: 3.25, height: 7, rotation: 0 },
    { id: 'd3', position: { x: 14, y: 20 }, width: 4, height: 7, rotation: 0 },
  ];
  const windows: WindowItem[] = [
    { id: 'wn1', position: { x: 7, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn2', position: { x: 21, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn3', position: { x: 0, y: 7 }, width: 3.5, height: 4, sillHeight: 2.5, rotation: 90 },
    { id: 'wn4', position: { x: 28, y: 7 }, width: 3.5, height: 4, sillHeight: 2.5, rotation: 90 },
  ];
  const furniture: Furniture[] = [
    { id: 'f1', type: 'bed_king', name: 'বেডরুম খাট ১', position: { x: 4, y: 4 }, rotation: 0, width: 6.5, depth: 6.5, height: 3 },
    { id: 'f2', type: 'bed_single', name: 'সিঙ্গেল খাট ২', position: { x: 18, y: 4 }, rotation: 0, width: 4, depth: 6.5, height: 2.5 },
    { id: 'f3', type: 'wardrobe', name: 'আলমিরা', position: { x: 25, y: 4 }, rotation: 90, width: 4, depth: 2, height: 6.5 },
  ];
  const roof: RoofConfig = {
    type: 'gable',
    height: 5.5,
    overhang: 2.2,
    pitchDegrees: 30,
    material: 'tin',
    color: '#0284C7',
    showRoof: true,
  };
  return {
    settings: {
      id: 'proj_tmpl_two_room_tin',
      name: 'দুই রুমের টিনশেড বাড়ি',
      plotLength: 35,
      plotWidth: 30,
      plotShape: 'rectangle',
      roadDirection: 'south',
      floorsCount: 1,
      houseType: 'টিনশেড দোচালা',
      defaultUnit: 'ft',
      estimatedBudgetBdt: 580000,
      currency: 'BDT',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    rooms,
    walls,
    doors,
    windows,
    furniture,
    roof,
  };
}

// 3. Three-Room Tin-Shed House (তিন রুমের আদর্শ টিনের বাড়ি)
function createThreeRoomTinShed(): Project {
  const rooms: Room[] = [
    makeRectRoom('r1', 'bedroom', 'Master Bed', 'মাস্টার বেডরুম', 0, 0, 14, 14, '#FEF3C7'),
    makeRectRoom('r2', 'living', 'Drawing Room', 'বসার ঘর (ড্রয়িং)', 14, 0, 14, 14, '#DCFCE7'),
    makeRectRoom('r3', 'bedroom', 'Bedroom 2', 'শোবার ঘর ২', 28, 0, 14, 14, '#EDE9FE'),
    makeRectRoom('r4', 'veranda', 'Front Corridor Veranda', 'প্রশস্ত টানা বারান্দা', 0, 14, 42, 7, '#E0F2FE'),
  ];
  const walls: Wall[] = [
    makeWall('w1', 0, 0, 42, 0, 10),
    makeWall('w2', 42, 0, 42, 14, 10),
    makeWall('w3', 42, 14, 0, 14, 5),
    makeWall('w4', 0, 14, 0, 0, 10),
    makeWall('w5', 14, 0, 14, 14, 5),
    makeWall('w6', 28, 0, 28, 14, 5),
    makeWall('w7', 0, 14, 0, 21, 5),
    makeWall('w8', 0, 21, 42, 21, 5),
    makeWall('w9', 42, 21, 42, 14, 5),
  ];
  const doors: Door[] = [
    { id: 'd1', position: { x: 7, y: 14 }, width: 3.25, height: 7, rotation: 0 },
    { id: 'd2', position: { x: 21, y: 14 }, width: 3.5, height: 7, rotation: 0 },
    { id: 'd3', position: { x: 35, y: 14 }, width: 3.25, height: 7, rotation: 0 },
    { id: 'd4', position: { x: 21, y: 21 }, width: 4, height: 7, rotation: 0 },
  ];
  const windows: WindowItem[] = [
    { id: 'wn1', position: { x: 7, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn2', position: { x: 21, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn3', position: { x: 35, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn4', position: { x: 0, y: 7 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 90 },
    { id: 'wn5', position: { x: 42, y: 7 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 90 },
  ];
  const furniture: Furniture[] = [
    { id: 'f1', type: 'bed_king', name: 'মাস্টার খাট', position: { x: 4, y: 4 }, rotation: 0, width: 6.5, depth: 6.5, height: 3 },
    { id: 'f2', type: 'sofa_3seater', name: 'ড্রয়িং সোফা', position: { x: 21, y: 4 }, rotation: 0, width: 7, depth: 3, height: 2.8 },
    { id: 'f3', type: 'bed_king', name: 'বেড ২ খাট', position: { x: 32, y: 4 }, rotation: 0, width: 6.5, depth: 6.5, height: 3 },
  ];
  const roof: RoofConfig = {
    type: 'gable',
    height: 6,
    overhang: 2.5,
    pitchDegrees: 28,
    material: 'tin',
    color: '#0284C7',
    showRoof: true,
  };
  return {
    settings: {
      id: 'proj_tmpl_three_room_tin',
      name: 'তিন রুমের আদর্শ টিনের বাড়ি',
      plotLength: 50,
      plotWidth: 30,
      plotShape: 'rectangle',
      roadDirection: 'south',
      floorsCount: 1,
      houseType: 'টিনশেড তিনরুম',
      defaultUnit: 'ft',
      estimatedBudgetBdt: 850000,
      currency: 'BDT',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    rooms,
    walls,
    doors,
    windows,
    furniture,
    roof,
  };
}

// 4. House with Veranda (প্রশস্ত বারান্দাসহ বাড়ি)
function createHouseWithVeranda(): Project {
  const p = createTwoRoomTinShed();
  p.settings.id = 'proj_tmpl_veranda_house';
  p.settings.name = 'প্রশস্ত বারান্দাসহ গ্রামীণ বাড়ি';
  p.settings.estimatedBudgetBdt = 620000;
  return p;
}

// 5. Double-Gable Tin Roof House (ঐতিহ্যবাহী চারচালা টিনের ঘর)
function createDoubleGableHouse(): Project {
  const p = createTwoRoomTinShed();
  p.settings.id = 'proj_tmpl_double_gable';
  p.settings.name = 'ঐতিহ্যবাহী চারচালা টিনের ঘর';
  p.roof = {
    type: 'double_gable',
    height: 6.5,
    overhang: 2.5,
    pitchDegrees: 35,
    material: 'tin',
    color: '#0369A1',
    showRoof: true,
  };
  p.settings.estimatedBudgetBdt = 720000;
  return p;
}

// 6. Single-Slope Roof House (আধুনিক একচালা বাড়ি)
function createSingleSlopeHouse(): Project {
  const p = createSmallRural();
  p.settings.id = 'proj_tmpl_single_slope';
  p.settings.name = 'আধুনিক একচালা (Mono-Pitch) বাড়ি';
  p.roof = {
    type: 'single_slope',
    height: 4.5,
    overhang: 2.0,
    pitchDegrees: 20,
    material: 'metal_sheet',
    color: '#047857',
    showRoof: true,
  };
  p.settings.estimatedBudgetBdt = 480000;
  return p;
}

// 7. Modern Concrete House (আধুনিক আরসিসি পাকা একতলা বাড়ি)
function createModernConcreteHouse(): Project {
  const rooms: Room[] = [
    makeRectRoom('r1', 'living', 'Drawing & Living', 'বসার ঘর (ড্রয়িং)', 0, 0, 16, 16, '#F8FAFC'),
    makeRectRoom('r2', 'dining', 'Dining Space', 'খাবার ঘর (ডাইনিং)', 16, 0, 14, 16, '#F1F5F9'),
    makeRectRoom('r3', 'bedroom', 'Master Bed with Attached Bath', 'মাস্টার বেডরুম', 0, 16, 16, 14, '#FEF3C7'),
    makeRectRoom('r4', 'bedroom', 'Guest Bed', 'মেহমান বেডরুম', 16, 16, 14, 14, '#EDE9FE'),
    makeRectRoom('r5', 'kitchen', 'Modern Kitchen', 'পাকঘর (কিচেন)', 30, 0, 10, 12, '#DCFCE7'),
    makeRectRoom('r6', 'bathroom', 'Master Bath', 'বাথরুম ১', 30, 12, 10, 8, '#E0F2FE'),
    makeRectRoom('r7', 'bathroom', 'Common Bath', 'কমন বাথরুম', 30, 20, 10, 10, '#E0F2FE'),
  ];
  const walls: Wall[] = [
    // Exterior perimeter
    makeWall('w1', 0, 0, 40, 0, 10),
    makeWall('w2', 40, 0, 40, 30, 10),
    makeWall('w3', 40, 30, 0, 30, 10),
    makeWall('w4', 0, 30, 0, 0, 10),
    // Partitions
    makeWall('w5', 16, 0, 16, 30, 5),
    makeWall('w6', 0, 16, 30, 16, 5),
    makeWall('w7', 30, 0, 30, 30, 5),
    makeWall('w8', 30, 12, 40, 12, 5),
    makeWall('w9', 30, 20, 40, 20, 5),
  ];
  const doors: Door[] = [
    { id: 'd1', position: { x: 8, y: 0 }, width: 3.5, height: 7, rotation: 180 }, // Main entrance
    { id: 'd2', position: { x: 8, y: 16 }, width: 3.25, height: 7, rotation: 0 },
    { id: 'd3', position: { x: 23, y: 16 }, width: 3.25, height: 7, rotation: 0 },
    { id: 'd4', position: { x: 30, y: 6 }, width: 2.75, height: 7, rotation: 90 },
    { id: 'd5', position: { x: 30, y: 16 }, width: 2.5, height: 7, rotation: 90 },
    { id: 'd6', position: { x: 30, y: 25 }, width: 2.5, height: 7, rotation: 90 },
  ];
  const windows: WindowItem[] = [
    { id: 'wn1', position: { x: 0, y: 8 }, width: 4.5, height: 4.5, sillHeight: 2.5, rotation: 90 },
    { id: 'wn2', position: { x: 0, y: 23 }, width: 4.5, height: 4.5, sillHeight: 2.5, rotation: 90 },
    { id: 'wn3', position: { x: 8, y: 30 }, width: 4.5, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn4', position: { x: 23, y: 30 }, width: 4.5, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn5', position: { x: 40, y: 6 }, width: 3.5, height: 3.5, sillHeight: 3.5, rotation: 90 },
    { id: 'wn6', position: { x: 23, y: 0 }, width: 4.5, height: 4.5, sillHeight: 2.5, rotation: 180 },
  ];
  const furniture: Furniture[] = [
    { id: 'f1', type: 'sofa_lshape', name: 'এল-সোফা সেট', position: { x: 6, y: 8 }, rotation: 0, width: 8, depth: 6, height: 2.8 },
    { id: 'f2', type: 'dining_table', name: 'ডাইনিং টেবিল', position: { x: 23, y: 8 }, rotation: 0, width: 6, depth: 3.5, height: 2.5 },
    { id: 'f3', type: 'bed_king', name: 'মাস্টার বেড', position: { x: 6, y: 23 }, rotation: 0, width: 6.5, depth: 6.5, height: 3 },
    { id: 'f4', type: 'bed_king', name: 'গেস্ট বেড', position: { x: 23, y: 23 }, rotation: 0, width: 6.5, depth: 6.5, height: 3 },
    { id: 'f5', type: 'kitchen_counter', name: 'কিচেন স্ল্যাব', position: { x: 35, y: 2 }, rotation: 0, width: 8, depth: 2, height: 2.8 },
  ];
  const roof: RoofConfig = {
    type: 'flat',
    height: 3, // Parapet height
    overhang: 1.0,
    pitchDegrees: 0,
    material: 'concrete',
    color: '#94A3B8',
    showRoof: true,
  };
  return {
    settings: {
      id: 'proj_tmpl_modern_concrete',
      name: 'আধুনিক আরসিসি পাকা একতলা বাড়ি',
      plotLength: 48,
      plotWidth: 38,
      plotShape: 'rectangle',
      roadDirection: 'north',
      floorsCount: 1,
      houseType: 'পাকা আরসিসি ভবন',
      defaultUnit: 'ft',
      estimatedBudgetBdt: 2250000,
      currency: 'BDT',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    rooms,
    walls,
    doors,
    windows,
    furniture,
    roof,
  };
}

// 8. Two-Storey House (ডুপ্লেক্স দোতলা বাড়ি)
function createTwoStoreyHouse(): Project {
  const p = createModernConcreteHouse();
  p.settings.id = 'proj_tmpl_two_storey';
  p.settings.name = 'ডুপ্লেক্স দোতলা বাড়ি';
  p.settings.floorsCount = 2;
  p.settings.estimatedBudgetBdt = 4200000;
  // Add staircase
  p.furniture.push({
    id: 'f_stair',
    type: 'staircase',
    name: 'দোতলার সিঁড়িঘর',
    position: { x: 26, y: 12 },
    rotation: 90,
    width: 6,
    depth: 8,
    height: 10,
  });
  return p;
}

// 9. House with Separate Kitchen (আলাদা পাকঘর ও গোসলখানাসহ বাড়ি)
function createSeparateKitchenHouse(): Project {
  const p = createTwoRoomTinShed();
  p.settings.id = 'proj_tmpl_sep_kitchen';
  p.settings.name = 'আলাদা পাকঘর ও গোসলখানাসহ বাড়ি';
  p.settings.estimatedBudgetBdt = 820000;
  // Add outdoor kitchen and bath
  p.rooms.push(
    makeRectRoom('r_kitch', 'kitchen', 'Separate Kitchen', 'আলাদা পাকঘর', 32, 0, 10, 10, '#DCFCE7'),
    makeRectRoom('r_bath', 'bathroom', 'Separate Bath', 'আলাদা গোসলখানা', 32, 11, 10, 8, '#E0F2FE')
  );
  p.walls.push(
    makeWall('wk1', 32, 0, 42, 0, 10),
    makeWall('wk2', 42, 0, 42, 19, 10),
    makeWall('wk3', 42, 19, 32, 19, 10),
    makeWall('wk4', 32, 19, 32, 0, 10),
    makeWall('wk5', 32, 10, 42, 10, 5)
  );
  p.doors.push(
    { id: 'dk1', position: { x: 32, y: 5 }, width: 2.75, height: 7, rotation: 90 },
    { id: 'dk2', position: { x: 32, y: 15 }, width: 2.5, height: 7, rotation: 90 }
  );
  return p;
}

// 10. House with Courtyard (মাঝখানে উঠান / আঙিনাসহ বাড়ি)
function createCourtyardHouse(): Project {
  const rooms: Room[] = [
    makeRectRoom('r1', 'living', 'North Unit', 'উত্তর ভিটি ঘর', 0, 0, 24, 12, '#FEF3C7'),
    makeRectRoom('r2', 'bedroom', 'West Unit', 'পশ্চিম ভিটি ঘর', 0, 12, 12, 16, '#EDE9FE'),
    makeRectRoom('r3', 'kitchen', 'East Unit', 'পূর্ব ভিটি পাকঘর ও স্টোর', 20, 12, 12, 16, '#DCFCE7'),
    makeRectRoom('r4', 'custom', 'Inner Courtyard', 'মাঝখানের উঠান (আঙিনা)', 12, 12, 8, 16, '#F8FAFC'),
  ];
  const walls: Wall[] = [
    // Outer perimeter
    makeWall('w1', 0, 0, 32, 0, 10),
    makeWall('w2', 32, 0, 32, 28, 10),
    makeWall('w3', 32, 28, 0, 28, 10),
    makeWall('w4', 0, 28, 0, 0, 10),
    // Courtyard boundaries
    makeWall('w5', 0, 12, 32, 12, 5),
    makeWall('w6', 12, 12, 12, 28, 5),
    makeWall('w7', 20, 12, 20, 28, 5),
  ];
  const doors: Door[] = [
    { id: 'd1', position: { x: 12, y: 12 }, width: 3.5, height: 7, rotation: 0 },
    { id: 'd2', position: { x: 12, y: 20 }, width: 3.25, height: 7, rotation: 90 },
    { id: 'd3', position: { x: 20, y: 20 }, width: 3, height: 7, rotation: 90 },
  ];
  const windows: WindowItem[] = [
    { id: 'wn1', position: { x: 6, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn2', position: { x: 24, y: 0 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 0 },
    { id: 'wn3', position: { x: 0, y: 20 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 90 },
    { id: 'wn4', position: { x: 32, y: 20 }, width: 4, height: 4.5, sillHeight: 2.5, rotation: 90 },
  ];
  const furniture: Furniture[] = [
    { id: 'f1', type: 'bed_king', name: 'খাট', position: { x: 6, y: 6 }, rotation: 0, width: 6.5, depth: 6.5, height: 3 },
    { id: 'f2', type: 'tree', name: 'উঠানের গাছ', position: { x: 16, y: 20 }, rotation: 0, width: 5, depth: 5, height: 12 },
  ];
  const roof: RoofConfig = {
    type: 'hip',
    height: 5.5,
    overhang: 2,
    pitchDegrees: 28,
    material: 'tin',
    color: '#0284C7',
    showRoof: true,
  };
  return {
    settings: {
      id: 'proj_tmpl_courtyard',
      name: 'আঙিনাসহ ঐতিহ্যবাহী উঠান বাড়ি',
      plotLength: 45,
      plotWidth: 40,
      plotShape: 'rectangle',
      roadDirection: 'south',
      floorsCount: 1,
      houseType: 'উঠান বাড়ি',
      defaultUnit: 'ft',
      estimatedBudgetBdt: 1200000,
      currency: 'BDT',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    rooms,
    walls,
    doors,
    windows,
    furniture,
    roof,
  };
}

// 11. House with Garden (সামনে বাগানসহ শৌখিন বাড়ি)
function createGardenHouse(): Project {
  const p = createModernConcreteHouse();
  p.settings.id = 'proj_tmpl_garden_house';
  p.settings.name = 'সামনে বাগানসহ শৌখিন বাড়ি';
  p.settings.estimatedBudgetBdt = 2450000;
  // Add outdoor trees and garden beds
  p.furniture.push(
    { id: 'fg1', type: 'garden_bed', name: 'ফুলের বাগান ১', position: { x: 6, y: -6 }, rotation: 0, width: 8, depth: 4, height: 1.5 },
    { id: 'fg2', type: 'garden_bed', name: 'ফুলের বাগান ২', position: { x: 26, y: -6 }, rotation: 0, width: 8, depth: 4, height: 1.5 },
    { id: 'ft1', type: 'tree', name: 'নারিকেল / ফলজ গাছ', position: { x: 18, y: -8 }, rotation: 0, width: 6, depth: 6, height: 14 }
  );
  return p;
}

// 12. House with Cowshed (গোয়ালঘর ও খামার সংলগ্ন গ্রামীণ বাড়ি)
function createCowshedHouse(): Project {
  const p = createThreeRoomTinShed();
  p.settings.id = 'proj_tmpl_cowshed';
  p.settings.name = 'গোয়ালঘর সংলগ্ন গ্রামীণ খামার বাড়ি';
  p.settings.estimatedBudgetBdt = 1050000;
  p.rooms.push(
    makeRectRoom('r_cow', 'custom', 'Cowshed / Farm', 'গোয়ালঘর ও খামার', 0, 24, 20, 12, '#FEF9C3')
  );
  p.walls.push(
    makeWall('wc1', 0, 24, 20, 24, 10),
    makeWall('wc2', 20, 24, 20, 36, 10),
    makeWall('wc3', 20, 36, 0, 36, 10),
    makeWall('wc4', 0, 36, 0, 24, 10)
  );
  return p;
}

export const BANGLADESH_TEMPLATES: HouseTemplate[] = [
  {
    id: 'tmpl_small_rural',
    nameBn: 'ছোট গ্রামীণ বাড়ি (১ ঘর + বারান্দা)',
    nameEn: 'Small Rural House (1 Room + Veranda)',
    category: 'rural',
    descriptionBn: 'সীমিত জমিতে দ্রুত নির্মাণযোগ্য ঐতিহ্যবাহী ১ রুম ও সামনের লম্বা বারান্দাবিশিষ্ট গ্রামীণ টিনের ঘর।',
    descriptionEn: 'Compact traditional rural single room with front veranda. Low cost and fast construction.',
    plotLength: 30,
    plotWidth: 25,
    floorsCount: 1,
    estimatedBudgetBdt: 350000,
    createProject: createSmallRural,
  },
  {
    id: 'tmpl_two_room_tin',
    nameBn: 'দুই রুমের টিনশেড বাড়ি',
    nameEn: 'Two-Room Tin-Shed House',
    category: 'tin_shed',
    descriptionBn: 'দুইটি প্রশস্ত শোবার ঘর ও সামনের লম্বা বারান্দা সম্বলিত জনপ্রিয় গ্রামীণ পারিবারিক বাড়ি।',
    descriptionEn: 'Classic two-room tin-shed home with deep veranda, ideal for small rural families.',
    plotLength: 35,
    plotWidth: 30,
    floorsCount: 1,
    estimatedBudgetBdt: 580000,
    createProject: createTwoRoomTinShed,
  },
  {
    id: 'tmpl_three_room_tin',
    nameBn: 'তিন রুমের আদর্শ টিনশেড বাড়ি',
    nameEn: 'Three-Room Tin-Shed House',
    category: 'tin_shed',
    descriptionBn: 'মাস্টার বেড, মেহমান রুম, ড্রয়িং রুম ও টানা বারান্দাবিশিষ্ট স্বয়ংসম্পূর্ণ তিন রুমের বাড়ি।',
    descriptionEn: 'Full 3-room layout with master bedroom, guest room, living area and wide front corridor.',
    plotLength: 50,
    plotWidth: 30,
    floorsCount: 1,
    estimatedBudgetBdt: 850000,
    createProject: createThreeRoomTinShed,
  },
  {
    id: 'tmpl_veranda_house',
    nameBn: 'প্রশস্ত বারান্দাসহ বাড়ি',
    nameEn: 'House with Deep Veranda',
    category: 'rural',
    descriptionBn: 'গ্রামাঞ্চলের রোদে-বৃষ্টিতে আরামদায়ক বিশ্রামের জন্য অতিরিক্ত গভীর বারান্দাবিশিষ্ট খোলামেলা নকশা।',
    descriptionEn: 'Spacious extended veranda layout optimized for cross-ventilation and monsoon protection.',
    plotLength: 38,
    plotWidth: 32,
    floorsCount: 1,
    estimatedBudgetBdt: 620000,
    createProject: createHouseWithVeranda,
  },
  {
    id: 'tmpl_double_gable',
    nameBn: 'ঐতিহ্যবাহী চারচালা টিনের ঘর',
    nameEn: 'Double-Gable (Chauchala) Tin Roof House',
    category: 'tin_shed',
    descriptionBn: 'বাংলার ঐতিহ্যবাহী চারচালা স্থাপত্যরীতিতে তৈরি মজবুত ও ঝড়-বৃষ্টি প্রতিরোধী রাজকীয় টিনের বাড়ি।',
    descriptionEn: 'Traditional Bengal Chauchala 4-way pitched tin roof architecture for maximum durability.',
    plotLength: 38,
    plotWidth: 32,
    floorsCount: 1,
    estimatedBudgetBdt: 720000,
    createProject: createDoubleGableHouse,
  },
  {
    id: 'tmpl_single_slope',
    nameBn: 'আধুনিক একচালা বাড়ি',
    nameEn: 'Single-Slope (Mono-Pitch) House',
    category: 'modern',
    descriptionBn: 'পশ্চিমা আধুনিক স্থাপত্যের মিনিমালিস্ট একচালা বা শেড রুফ নকশা। বৃষ্টির পানি নিষ্কাশন খুবই সহজ।',
    descriptionEn: 'Modern minimalist mono-pitch roof home with clean slopes and great rainwater drainage.',
    plotLength: 32,
    plotWidth: 28,
    floorsCount: 1,
    estimatedBudgetBdt: 480000,
    createProject: createSingleSlopeHouse,
  },
  {
    id: 'tmpl_modern_concrete',
    nameBn: 'আধুনিক আরসিসি পাকা একতলা বাড়ি',
    nameEn: 'Modern RCC Concrete Single-Storey House',
    category: 'concrete',
    descriptionBn: '২টি বেডরুম, ড্রয়িং-ডাইনিং, ২টি বাথরুম ও কিচেন সম্বলিত আধুনিক পাকা একতলা বাড়ি।',
    descriptionEn: 'Contemporary RCC concrete home with 2 bedrooms, open drawing/dining, attached baths & kitchen.',
    plotLength: 48,
    plotWidth: 38,
    floorsCount: 1,
    estimatedBudgetBdt: 2250000,
    createProject: createModernConcreteHouse,
  },
  {
    id: 'tmpl_two_storey',
    nameBn: 'ডুপ্লেক্স দোতলা বাড়ি',
    nameEn: 'Two-Storey Duplex House',
    category: 'concrete',
    descriptionBn: 'অভ্যন্তরীণ আধুনিক সিঁড়ি, একাধিক ব্যালকনি ও ড্রয়িং-ডাইনিং সহ আভিজাত্যপূর্ণ দোতলা ডুপ্লেক্স বাড়ি।',
    descriptionEn: 'Two-storey luxury duplex residence with interior staircase and multiple balconies.',
    plotLength: 48,
    plotWidth: 40,
    floorsCount: 2,
    estimatedBudgetBdt: 4200000,
    createProject: createTwoStoreyHouse,
  },
  {
    id: 'tmpl_sep_kitchen',
    nameBn: 'আলাদা পাকঘর ও গোসলখানাসহ বাড়ি',
    nameEn: 'House with Separate Kitchen & Bath',
    category: 'rural',
    descriptionBn: 'গ্রামীণ পরিচ্ছন্নতার সুবিধার্থে মূল ঘর থেকে পৃথক রান্নাঘর ও গোসলখানার স্বাস্থ্যসম্মত লেআউট।',
    descriptionEn: 'Healthy countryside layout keeping cooking fumes and sanitary facilities detached from bedrooms.',
    plotLength: 45,
    plotWidth: 35,
    floorsCount: 1,
    estimatedBudgetBdt: 820000,
    createProject: createSeparateKitchenHouse,
  },
  {
    id: 'tmpl_courtyard',
    nameBn: 'আঙিনাসহ ঐতিহ্যবাহী উঠান বাড়ি',
    nameEn: 'Courtyard House (Uthan House)',
    category: 'rural',
    descriptionBn: 'মাঝখানে খোলামেলা সবুজ উঠান এবং চারপাশে ঘিরে শোবার ঘর, রান্নাঘর ও বারান্দাবিশিষ্ট পারিবারিক রূপরেখা।',
    descriptionEn: 'Centered open courtyard layout surrounded by residential living units for privacy and communal life.',
    plotLength: 45,
    plotWidth: 40,
    floorsCount: 1,
    estimatedBudgetBdt: 1200000,
    createProject: createCourtyardHouse,
  },
  {
    id: 'tmpl_garden_house',
    nameBn: 'সামনে বাগানসহ শৌখিন বাড়ি',
    nameEn: 'House with Front Landscaped Garden',
    category: 'modern',
    descriptionBn: 'সামনে খোলামেলা ফুলের বাগান, ছায়াঘেরা গাছপালা ও দৃষ্টিনন্দন লনসহ নান্দনিক বাড়ি।',
    descriptionEn: 'Picturesque residential bungalow featuring dedicated landscaped garden beds and shaded trees.',
    plotLength: 50,
    plotWidth: 42,
    floorsCount: 1,
    estimatedBudgetBdt: 2450000,
    createProject: createGardenHouse,
  },
  {
    id: 'tmpl_cowshed',
    nameBn: 'গোয়ালঘর সংলগ্ন গ্রামীণ বাড়ি',
    nameEn: 'House with Attached Cowshed / Farm',
    category: 'rural',
    descriptionBn: 'কৃষিজীবী ও খামারি পরিবারের জন্য সুষম নিরাপদ দূরত্বে গোয়ালঘর ও পশু পালনের শেডসহ বাড়ি।',
    descriptionEn: 'Integrated agricultural homestead featuring dedicated livestock shed and storage facilities.',
    plotLength: 50,
    plotWidth: 40,
    floorsCount: 1,
    estimatedBudgetBdt: 1050000,
    createProject: createCowshedHouse,
  },
];
