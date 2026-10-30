/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wall, Room, Door, WindowItem, Furniture, RoomType, MeasurementUnit } from '../types';
import { useI18n } from '../localization/i18n';
import { formatDimension, convertToFeet, convertFromFeet } from '../calculations/units';
import { Trash2, Copy, X, Check, Sliders } from 'lucide-react';

interface PropertyEditorProps {
  selectedItem: {
    type: 'wall' | 'room' | 'door' | 'window' | 'furniture';
    id: string;
  } | null;
  walls: Wall[];
  rooms: Room[];
  doors: Door[];
  windows: WindowItem[];
  furniture: Furniture[];
  unit: MeasurementUnit;
  onUpdateWall: (wall: Wall) => void;
  onUpdateRoom: (room: Room) => void;
  onUpdateDoor: (door: Door) => void;
  onUpdateWindow: (win: WindowItem) => void;
  onUpdateFurniture: (furn: Furniture) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  selectedItem,
  walls,
  rooms,
  doors,
  windows,
  furniture,
  unit,
  onUpdateWall,
  onUpdateRoom,
  onUpdateDoor,
  onUpdateWindow,
  onUpdateFurniture,
  onDelete,
  onDuplicate,
  onClose,
}) => {
  const { t, language } = useI18n();

  if (!selectedItem) return null;

  // WALL EDITOR
  if (selectedItem.type === 'wall') {
    const wall = walls.find((w) => w.id === selectedItem.id);
    if (!wall) return null;

    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const currentLengthFt = Math.hypot(dx, dy);

    const handleLengthChange = (newLenUserUnit: number) => {
      const newLenFt = convertToFeet(newLenUserUnit, unit);
      if (newLenFt <= 0.5) return;
      const angle = Math.atan2(dy, dx);
      onUpdateWall({
        ...wall,
        end: {
          x: Math.round((wall.start.x + Math.cos(angle) * newLenFt) * 10) / 10,
          y: Math.round((wall.start.y + Math.sin(angle) * newLenFt) * 10) / 10,
        },
      });
    };

    return (
      <div className="absolute top-16 right-4 z-40 w-80 rounded-xl bg-white/95 p-4 shadow-2xl backdrop-blur border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-right-4 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400">
            <Sliders size={18} />
            <span>{t.toolWall} ({formatDimension(currentLengthFt, unit, language)})</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {t.length} ({unit})
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={Math.round(convertFromFeet(currentLengthFt, unit) * 10) / 10}
              onChange={(e) => handleLengthChange(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {t.wallThickness}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateWall({ ...wall, thickness: 5 })}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  wall.thickness === 5
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                5" ({language === 'bn' ? 'অভ্যন্তরীণ' : 'Internal'})
              </button>
              <button
                type="button"
                onClick={() => onUpdateWall({ ...wall, thickness: 10 })}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  wall.thickness === 10
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                10" ({language === 'bn' ? 'বহিঃস্থ' : 'External'})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {t.height} ({unit})
            </label>
            <input
              type="number"
              step="0.5"
              min="6"
              max="20"
              value={Math.round(convertFromFeet(wall.height || 10, unit) * 10) / 10}
              onChange={(e) =>
                onUpdateWall({
                  ...wall,
                  height: convertToFeet(parseFloat(e.target.value) || 10, unit),
                })
              }
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onDuplicate}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium"
            >
              <Copy size={14} />
              {t.duplicate}
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-medium"
            >
              <Trash2 size={14} />
              {t.delete}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ROOM EDITOR
  if (selectedItem.type === 'room') {
    const room = rooms.find((r) => r.id === selectedItem.id);
    if (!room) return null;

    const roomTypes: { type: RoomType; labelBn: string; labelEn: string; color: string }[] = [
      { type: 'bedroom', labelBn: 'বেডরুম', labelEn: 'Bedroom', color: '#FEF3C7' },
      { type: 'living', labelBn: 'লিভিং রুম', labelEn: 'Living Room', color: '#DCFCE7' },
      { type: 'dining', labelBn: 'ডাইনিং রুম', labelEn: 'Dining Room', color: '#F1F5F9' },
      { type: 'kitchen', labelBn: 'রান্নাঘর', labelEn: 'Kitchen', color: '#FFEDD5' },
      { type: 'bathroom', labelBn: 'গোসলখানা', labelEn: 'Bathroom', color: '#E0F2FE' },
      { type: 'toilet', labelBn: 'টয়লেট', labelEn: 'Toilet', color: '#E0F2FE' },
      { type: 'veranda', labelBn: 'বারান্দা', labelEn: 'Veranda', color: '#EDE9FE' },
      { type: 'balcony', labelBn: 'ব্যালকনি', labelEn: 'Balcony', color: '#FCE7F3' },
      { type: 'study', labelBn: 'পড়ার ঘর', labelEn: 'Study', color: '#E2E8F0' },
      { type: 'prayer', labelBn: 'নামাজ ঘর', labelEn: 'Prayer Room', color: '#D1FAE5' },
      { type: 'store', labelBn: 'স্টোর রুম', labelEn: 'Store', color: '#F3F4F6' },
      { type: 'garage', labelBn: 'গ্যারেজ', labelEn: 'Garage', color: '#E5E7EB' },
      { type: 'custom', labelBn: 'কাস্টম', labelEn: 'Custom', color: '#FFFFFF' },
    ];

    // Compute bounding box width & height in feet
    const xs = room.points.map((p) => p.x);
    const ys = room.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const widthFt = Math.max(1, maxX - minX);
    const heightFt = Math.max(1, maxY - minY);

    const handleResizeRoom = (newW_unit: number, newH_unit: number) => {
      const newWFt = convertToFeet(newW_unit, unit);
      const newHFt = convertToFeet(newH_unit, unit);
      if (newWFt <= 2 || newHFt <= 2) return;

      const newPoints = [
        { x: minX, y: minY },
        { x: minX + newWFt, y: minY },
        { x: minX + newWFt, y: minY + newHFt },
        { x: minX, y: minY + newHFt },
      ];
      onUpdateRoom({
        ...room,
        points: newPoints,
        areaSqFt: Math.round(newWFt * newHFt * 10) / 10,
      });
    };

    return (
      <div className="absolute top-16 right-4 z-40 w-84 rounded-xl bg-white/95 p-4 shadow-2xl backdrop-blur border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-right-4 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400">
            <Sliders size={18} />
            <span>{language === 'bn' ? room.nameBn || room.name : room.name}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {language === 'bn' ? 'কক্ষের নাম' : 'Room Name'}
            </label>
            <input
              type="text"
              value={language === 'bn' ? room.nameBn || room.name : room.name}
              onChange={(e) => {
                const val = e.target.value;
                onUpdateRoom({
                  ...room,
                  name: val,
                  nameBn: val,
                });
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {language === 'bn' ? 'কক্ষের ধরন' : 'Room Type'}
            </label>
            <select
              value={room.type}
              onChange={(e) => {
                const rt = roomTypes.find((r) => r.type === e.target.value);
                onUpdateRoom({
                  ...room,
                  type: e.target.value as RoomType,
                  floorColor: rt ? rt.color : room.floorColor,
                });
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
            >
              {roomTypes.map((rt) => (
                <option key={rt.type} value={rt.type}>
                  {language === 'bn' ? rt.labelBn : rt.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {t.width} ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                value={Math.round(convertFromFeet(widthFt, unit) * 10) / 10}
                onChange={(e) =>
                  handleResizeRoom(parseFloat(e.target.value) || 5, convertFromFeet(heightFt, unit))
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {t.length} ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                min="3"
                value={Math.round(convertFromFeet(heightFt, unit) * 10) / 10}
                onChange={(e) =>
                  handleResizeRoom(convertFromFeet(widthFt, unit), parseFloat(e.target.value) || 5)
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-xs flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">{t.area}:</span>
            <span className="font-bold text-sky-700 dark:text-sky-300">
              {Math.round(widthFt * heightFt)} {t.sqFt} (
              {(Math.round((widthFt * heightFt / 435.6) * 100) / 100).toFixed(2)} {t.decimals})
            </span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onDuplicate}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium"
            >
              <Copy size={14} />
              {t.duplicate}
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-medium"
            >
              <Trash2 size={14} />
              {t.delete}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DOOR EDITOR
  if (selectedItem.type === 'door') {
    const door = doors.find((d) => d.id === selectedItem.id);
    if (!door) return null;

    return (
      <div className="absolute top-16 right-4 z-40 w-72 rounded-xl bg-white/95 p-4 shadow-2xl backdrop-blur border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-sky-600 dark:text-sky-400">{t.toolDoor}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              {t.width} ({unit})
            </label>
            <input
              type="number"
              step="0.25"
              min="2"
              max="6"
              value={Math.round(convertFromFeet(door.width || 3.25, unit) * 10) / 10}
              onChange={(e) =>
                onUpdateDoor({
                  ...door,
                  width: convertToFeet(parseFloat(e.target.value) || 3.25, unit),
                })
              }
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              {language === 'bn' ? 'ঘূর্ণন (Rotation)' : 'Rotation'}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => onUpdateDoor({ ...door, rotation: deg })}
                  className={`py-1 rounded text-xs font-medium border ${
                    door.rotation === deg ? 'bg-sky-600 text-white border-sky-600' : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onDelete}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-medium"
            >
              <Trash2 size={14} />
              {t.delete}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WINDOW EDITOR
  if (selectedItem.type === 'window') {
    const win = windows.find((w) => w.id === selectedItem.id);
    if (!win) return null;

    return (
      <div className="absolute top-16 right-4 z-40 w-72 rounded-xl bg-white/95 p-4 shadow-2xl backdrop-blur border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-sky-600 dark:text-sky-400">{t.toolWindow}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              {t.width} ({unit})
            </label>
            <input
              type="number"
              step="0.25"
              min="2"
              max="8"
              value={Math.round(convertFromFeet(win.width || 4, unit) * 10) / 10}
              onChange={(e) =>
                onUpdateWindow({
                  ...win,
                  width: convertToFeet(parseFloat(e.target.value) || 4, unit),
                })
              }
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              {language === 'bn' ? 'ঘূর্ণন (Rotation)' : 'Rotation'}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => onUpdateWindow({ ...win, rotation: deg })}
                  className={`py-1 rounded text-xs font-medium border ${
                    win.rotation === deg ? 'bg-sky-600 text-white border-sky-600' : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onDelete}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-medium"
            >
              <Trash2 size={14} />
              {t.delete}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FURNITURE EDITOR
  if (selectedItem.type === 'furniture') {
    const furn = furniture.find((f) => f.id === selectedItem.id);
    if (!furn) return null;

    return (
      <div className="absolute top-16 right-4 z-40 w-76 rounded-xl bg-white/95 p-4 shadow-2xl backdrop-blur border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-sky-600 dark:text-sky-400">{furn.name}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                {t.width} ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={Math.round(convertFromFeet(furn.width, unit) * 10) / 10}
                onChange={(e) =>
                  onUpdateFurniture({
                    ...furn,
                    width: convertToFeet(parseFloat(e.target.value) || 2, unit),
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                {t.length} ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={Math.round(convertFromFeet(furn.depth, unit) * 10) / 10}
                onChange={(e) =>
                  onUpdateFurniture({
                    ...furn,
                    depth: convertToFeet(parseFloat(e.target.value) || 2, unit),
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              {language === 'bn' ? 'ঘূর্ণন (Rotation)' : 'Rotation'} ({furn.rotation}°)
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={furn.rotation}
              onChange={(e) => onUpdateFurniture({ ...furn, rotation: parseInt(e.target.value, 10) })}
              className="w-full accent-sky-600"
            />
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onDuplicate}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium"
            >
              <Copy size={14} />
              {t.duplicate}
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-medium"
            >
              <Trash2 size={14} />
              {t.delete}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
