/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, MaterialRateConfig } from '../types';

export interface MaterialQuantityItem {
  key: string;
  nameBn: string;
  nameEn: string;
  quantity: number;
  unitBn: string;
  unitEn: string;
  unitRate: number;
  totalCost: number;
  formulaNoteBn: string;
  formulaNoteEn: string;
}

export interface EstimationResult {
  floorAreaSqFt: number;
  wallArea5inSqFt: number;
  wallArea10inSqFt: number;
  totalWallAreaSqFt: number;
  doorsCount: number;
  windowsCount: number;
  items: MaterialQuantityItem[];
  subtotalMaterials: number;
  laborCost: number;
  grandTotal: number;
}

export const DEFAULT_MATERIAL_RATES: MaterialRateConfig = {
  brickPerPcs: 13,         // BDT 13 / brick
  cementPerBag: 540,       // BDT 540 / 50kg bag
  sandPerCft: 45,          // BDT 45 / cft (Sylhet & local mix)
  khoaPerCft: 125,         // BDT 125 / cft (brick khoa or stone aggregate)
  rodPerKg: 96,            // BDT 96 / kg (60 Grade Rebar)
  tilesPerSqFt: 75,        // BDT 75 / sq ft (Standard ceramic vitrified tiles)
  paintPerLiter: 380,      // BDT 380 / liter
  tinSheetPerBundle: 7500, // BDT 7,500 / bundle
  doorPerUnit: 8500,       // BDT 8,500 / finished door set
  windowPerUnit: 6000,     // BDT 6,000 / aluminum-glass window set
  laborPerSqFt: 220,       // BDT 220 / sq ft standard masonry & finishing labor
};

/**
 * Calculate distance between two 2D points in feet
 */
function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Compute polygon area using Shoelace formula
 */
function getPolygonArea(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Comprehensive Bill of Quantities (BoQ) and Cost Estimation
 */
export function calculateProjectEstimation(
  project: Project,
  customRates?: Partial<MaterialRateConfig>
): EstimationResult {
  const rates: MaterialRateConfig = { ...DEFAULT_MATERIAL_RATES, ...(customRates || {}) };

  // Calculate covered floor area from rooms or plot bounds
  let floorAreaSqFt = 0;
  if (project.rooms && project.rooms.length > 0) {
    floorAreaSqFt = project.rooms.reduce((acc, room) => {
      const area = room.areaSqFt || getPolygonArea(room.points);
      return acc + area;
    }, 0);
  }
  // Fallback to plot size if no rooms defined yet
  if (floorAreaSqFt <= 0) {
    floorAreaSqFt = (project.settings.plotLength || 30) * (project.settings.plotWidth || 20);
  }

  // Account for number of floors
  const totalFloorArea = floorAreaSqFt * (project.settings.floorsCount || 1);

  // Calculate wall lengths and areas
  let wallLength5in = 0;
  let wallLength10in = 0;
  const wallHeight = project.walls.length > 0 ? (project.walls[0].height || 10) : 10;

  project.walls.forEach((w) => {
    const len = getDistance(w.start, w.end);
    if (w.thickness <= 6) {
      wallLength5in += len;
    } else {
      wallLength10in += len;
    }
  });

  // If no walls drawn yet, estimate perimeter and partition walls from floor area
  if (wallLength5in === 0 && wallLength10in === 0 && totalFloorArea > 0) {
    const sideA = Math.sqrt(totalFloorArea);
    wallLength10in = sideA * 4; // Perimeter exterior wall
    wallLength5in = sideA * 3;  // Internal partition walls
  }

  // Doors & Windows deduction area
  const doorArea = project.doors.reduce((acc, d) => acc + (d.width || 3.25) * (d.height || 7), 0);
  const windowArea = project.windows.reduce((acc, w) => acc + (w.width || 4) * (w.height || 4.5), 0);
  const totalOpeningsArea = doorArea + windowArea;

  const grossWallArea5in = wallLength5in * wallHeight;
  const grossWallArea10in = wallLength10in * wallHeight;

  // Deduct 60% openings from exterior 10" walls and 40% from interior 5" walls
  const netWallArea10in = Math.max(0, grossWallArea10in - totalOpeningsArea * 0.6);
  const netWallArea5in = Math.max(0, grossWallArea5in - totalOpeningsArea * 0.4);
  const totalWallAreaSqFt = netWallArea5in + netWallArea10in;

  // 1. Bricks: 5" wall uses 5 bricks/sqft; 10" wall uses 10 bricks/sqft; plus 15% for foundation/soling/wastage
  const wallBricks = (netWallArea5in * 5) + (netWallArea10in * 10);
  const totalBricks = Math.ceil(wallBricks * 1.15);

  // 2. Cement (50kg bags):
  // Mortar & Plaster: ~0.055 bags/sqft of wall area
  // Concrete slabs/beams: ~0.35 bags/sqft of floor area for RCC
  const isRCCRoof = project.roof.type === 'flat' || project.settings.houseType.toLowerCase().includes('concrete');
  const slabCementFactor = isRCCRoof ? 0.35 : 0.12; // Plinth/ground slab only if tin roof
  const totalCementBags = Math.ceil((totalWallAreaSqFt * 0.055) + (totalFloorArea * slabCementFactor));

  // 3. Sand (cft):
  // Mortar + plaster: 0.18 cft/sqft wall; Concrete: 0.45 cft/sqft floor
  const sandFactor = isRCCRoof ? 0.45 : 0.15;
  const totalSandCft = Math.ceil((totalWallAreaSqFt * 0.18) + (totalFloorArea * sandFactor));

  // 4. Coarse Aggregate / Khoa (cft):
  // Concrete coarse aggregate: 0.85 cft/sqft of slab area
  const khoaFactor = isRCCRoof ? 0.85 : 0.25;
  const totalKhoaCft = Math.ceil(totalFloorArea * khoaFactor);

  // 5. Mild Steel Rebar (kg):
  // For RCC floor slab, lintels, grade beams, columns
  const rebarPerSqFt = isRCCRoof ? 4.2 : 1.2; // nominal estimate
  const totalRodKg = Math.ceil(totalFloorArea * rebarPerSqFt);

  // 6. Tiles (sq ft): Floor area + 10% cutting wastage
  const totalTilesSqFt = Math.ceil(totalFloorArea * 1.1);

  // 7. Paint (Liters): Double side wall area + ceiling / 80 sqft per liter coverage
  const paintableArea = (totalWallAreaSqFt * 1.8) + totalFloorArea;
  const totalPaintLiters = Math.ceil(paintableArea / 80);

  // 8. Tin Sheets / Bundles:
  // If tin/metal roof, calculate based on projected area with pitch multiplier
  const isTinRoof = project.roof.material === 'tin' || project.roof.material === 'metal_sheet';
  const roofArea = totalFloorArea * 1.25; // 25% extra for pitch & overhangs
  const tinBundles = isTinRoof ? Math.max(1, Math.ceil(roofArea / 72)) : 0;

  // 9. Doors & Windows
  const doorsCount = Math.max(project.doors.length, Math.ceil(totalFloorArea / 180));
  const windowsCount = Math.max(project.windows.length, Math.ceil(totalFloorArea / 120));

  // Build items array with transparent formulas
  const items: MaterialQuantityItem[] = [
    {
      key: 'brick',
      nameBn: '১ম শ্রেণীর ইট (গাঁথুনি ও সোলিং)',
      nameEn: 'First Class Bricks (Masonry & Foundation)',
      quantity: totalBricks,
      unitBn: 'টি',
      unitEn: 'pcs',
      unitRate: rates.brickPerPcs,
      totalCost: totalBricks * rates.brickPerPcs,
      formulaNoteBn: '৫" দেয়াল = ৫টি/বর্গফুট, ১০" দেয়াল = ১০টি/বর্গফুট + ১৫% ফাউন্ডেশন ও অপচয়',
      formulaNoteEn: '5" wall = 5 pcs/sqft, 10" wall = 10 pcs/sqft + 15% foundation & wastage',
    },
    {
      key: 'cement',
      nameBn: 'পোর্টল্যান্ড সিমেন্ট (৫০ কেজি ব্যাগ)',
      nameEn: 'Portland Cement (50kg Bags)',
      quantity: totalCementBags,
      unitBn: 'ব্যাগ',
      unitEn: 'bags',
      unitRate: rates.cementPerBag,
      totalCost: totalCementBags * rates.cementPerBag,
      formulaNoteBn: 'মর্টার ও প্লাস্টার (১:৪/১:৬) + আরসিসি ছাদ/ফাউন্ডেশন ঢালাই',
      formulaNoteEn: 'Mortar, Plaster (1:4/1:6) + RCC Slab/Beam Concrete (1:2:4)',
    },
    {
      key: 'sand',
      nameBn: 'বালু (সিলেট ও লোকাল বালু মিশ্রণ)',
      nameEn: 'Sand (Sylhet coarse + local plaster sand)',
      quantity: totalSandCft,
      unitBn: 'সিএফটি',
      unitEn: 'cft',
      unitRate: rates.sandPerCft,
      totalCost: totalSandCft * rates.sandPerCft,
      formulaNoteBn: 'গাঁথুনি ও প্লাস্টারিং ০.১৮ cft/বর্গফুট + কংক্রিট ০.৪৫ cft/বর্গফুট',
      formulaNoteEn: 'Masonry & plaster 0.18 cft/sqft + concrete 0.45 cft/sqft',
    },
    {
      key: 'khoa',
      nameBn: 'খোয়া / পাথর কুচি (কংক্রিট ঢালাই)',
      nameEn: 'Coarse Aggregate (Brick Khoa / Stone Chips)',
      quantity: totalKhoaCft,
      unitBn: 'সিএফটি',
      unitEn: 'cft',
      unitRate: rates.khoaPerCft,
      totalCost: totalKhoaCft * rates.khoaPerCft,
      formulaNoteBn: 'মেঝে, কলাম, গ্রেড বিম ও ছাদ ঢালাইয়ের জন্য (১:২:৪ অনুপাত)',
      formulaNoteEn: 'For floor, columns, grade beam & roof casting (1:2:4 mix)',
    },
    {
      key: 'rod',
      nameBn: 'এম এস রড (৬০ গ্রেড রিবার)',
      nameEn: 'Mild Steel Rebar (60 Grade TMT)',
      quantity: totalRodKg,
      unitBn: 'কেজি',
      unitEn: 'kg',
      unitRate: rates.rodPerKg,
      totalCost: totalRodKg * rates.rodPerKg,
      formulaNoteBn: 'গড় আবাসিক ছাদ, বিম ও কলামের নামমাত্র হিসেব (~৪.২ কেজি/বর্গফুট)',
      formulaNoteEn: 'Nominal residential RCC slab/beam/column estimate (~4.2 kg/sqft)',
    },
    {
      key: 'tiles',
      nameBn: 'ফ্লোর ও বাথরুম টাইলস',
      nameEn: 'Floor & Bathroom Ceramic Tiles',
      quantity: totalTilesSqFt,
      unitBn: 'বর্গফুট',
      unitEn: 'sq ft',
      unitRate: rates.tilesPerSqFt,
      totalCost: totalTilesSqFt * rates.tilesPerSqFt,
      formulaNoteBn: 'কক্ষসমূহের মেঝে ক্ষেত্রফল + ১০% কাটিং অপচয়',
      formulaNoteEn: 'Net floor area + 10% cutting and corner wastage',
    },
    {
      key: 'paint',
      nameBn: 'প্লাস্টিক ও ওয়েদারকোট পেইন্ট',
      nameEn: 'Interior & Exterior Paint',
      quantity: totalPaintLiters,
      unitBn: 'লিটার',
      unitEn: 'liters',
      unitRate: rates.paintPerLiter,
      totalCost: totalPaintLiters * rates.paintPerLiter,
      formulaNoteBn: 'দেয়াল ও সিলিং সারফেস (২ কোট পেইন্ট, ৮০ বর্গফুট/লিটার)',
      formulaNoteEn: 'Wall & ceiling surfaces (2 coats, ~80 sqft/liter coverage)',
    },
    {
      key: 'tin',
      nameBn: 'ঢেউটিন / কালার টিন শিট',
      nameEn: 'Corrugated CI Roofing Sheets',
      quantity: tinBundles,
      unitBn: 'বান্ডিল',
      unitEn: 'bundles',
      unitRate: rates.tinSheetPerBundle,
      totalCost: tinBundles * rates.tinSheetPerBundle,
      formulaNoteBn: 'ছাদের মোট আয়তন ও ঢাল অনুযায়ী (১ বান্ডিল = প্রায় ৭২ বর্গফুট)',
      formulaNoteEn: 'Calculated from pitched roof area (1 bundle ≈ 72 sq ft)',
    },
    {
      key: 'doors',
      nameBn: 'দরজা (কাঠ ও পিভিসি ফ্রেমসহ)',
      nameEn: 'Finished Doors (Wood & PVC sets)',
      quantity: doorsCount,
      unitBn: 'টি',
      unitEn: 'units',
      unitRate: rates.doorPerUnit,
      totalCost: doorsCount * rates.doorPerUnit,
      formulaNoteBn: 'প্রধান দরজা, বেডরুম ও বাথরুমের মোট দরজা সেট',
      formulaNoteEn: 'Main entry, bedroom, kitchen & bathroom door units',
    },
    {
      key: 'windows',
      nameBn: 'জানালা (অ্যালুমিনিয়াম ও থাই গ্লাস)',
      nameEn: 'Windows (Thai Aluminum & Glass)',
      quantity: windowsCount,
      unitBn: 'টি',
      unitEn: 'units',
      unitRate: rates.windowPerUnit,
      totalCost: windowsCount * rates.windowPerUnit,
      formulaNoteBn: 'আলো-বাতাসের জন্য প্রতি রুমে ১-২টি আদর্শ জানালা',
      formulaNoteEn: 'Standard 4x4.5 ft window units with safety grills',
    },
  ];

  // Filter out tin if 0 (e.g. flat concrete roof)
  const activeItems = items.filter((item) => item.quantity > 0);

  const subtotalMaterials = activeItems.reduce((acc, it) => acc + it.totalCost, 0);
  const laborCost = Math.round(totalFloorArea * rates.laborPerSqFt);
  const grandTotal = subtotalMaterials + laborCost;

  return {
    floorAreaSqFt: Math.round(totalFloorArea),
    wallArea5inSqFt: Math.round(netWallArea5in),
    wallArea10inSqFt: Math.round(netWallArea10in),
    totalWallAreaSqFt: Math.round(totalWallAreaSqFt),
    doorsCount,
    windowsCount,
    items: activeItems,
    subtotalMaterials,
    laborCost,
    grandTotal,
  };
}
