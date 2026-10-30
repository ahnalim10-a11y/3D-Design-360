/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Project,
  Wall,
  Room,
  Door,
  WindowItem,
  Furniture,
  Point2D,
  MeasurementUnit,
  FurnitureType,
  RoomType,
} from '../types';
import { useI18n } from '../localization/i18n';
import { formatDimension, formatFeetInches } from '../calculations/units';
import { PropertyEditor } from './PropertyEditor';
import {
  MousePointer,
  Square,
  DoorOpen,
  Maximize2,
  Armchair,
  Hand,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Magnet,
  Grid,
  Download,
  Plus,
} from 'lucide-react';

export type PlannerTool =
  | 'select'
  | 'wall'
  | 'room'
  | 'door'
  | 'window'
  | 'furniture'
  | 'pan';

interface FloorPlanner2DProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  unit: MeasurementUnit;
}

interface HistoryState {
  walls: Wall[];
  rooms: Room[];
  doors: Door[];
  windows: WindowItem[];
  furniture: Furniture[];
}

export const FloorPlanner2D: React.FC<FloorPlanner2DProps> = ({
  project,
  onUpdateProject,
  unit,
}) => {
  const { t, language } = useI18n();
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Active Tool & Editor State
  const [activeTool, setActiveTool] = useState<PlannerTool>('select');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'wall' | 'room' | 'door' | 'window' | 'furniture';
    id: string;
  } | null>(null);

  // Snapping and Grid
  const [snapGrid, setSnapGrid] = useState(true);
  const snapSize = 0.5; // feet snap increment

  // Canvas View Transform (1 unit = 1 foot)
  const [scale, setScale] = useState(24); // pixels per foot
  const [offset, setOffset] = useState<Point2D>({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const [wallStart, setWallStart] = useState<Point2D | null>(null);
  const [currentMouseFt, setCurrentMouseFt] = useState<Point2D>({ x: 0, y: 0 });
  const [roomBoxStart, setRoomBoxStart] = useState<Point2D | null>(null);

  // Moving / Dragging existing element
  const [dragTarget, setDragTarget] = useState<{
    type: 'wall' | 'wall_start' | 'wall_end' | 'room' | 'door' | 'window' | 'furniture';
    id: string;
    startMouseFt: Point2D;
    initialData: any;
  } | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  // Selected Furniture Type to place
  const [selectedFurnType, setSelectedFurnType] = useState<FurnitureType>('bed_king');
  const [showFurnPicker, setShowFurnPicker] = useState(false);

  // Selected Room Type to place
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('bedroom');

  // Push current state to undo history before making mutations
  const pushHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev.slice(-30), // keep max 30 steps
      {
        walls: JSON.parse(JSON.stringify(project.walls)),
        rooms: JSON.parse(JSON.stringify(project.rooms)),
        doors: JSON.parse(JSON.stringify(project.doors)),
        windows: JSON.parse(JSON.stringify(project.windows)),
        furniture: JSON.parse(JSON.stringify(project.furniture)),
      },
    ]);
    setFuture([]);
  }, [project]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setFuture((prev) => [
      {
        walls: JSON.parse(JSON.stringify(project.walls)),
        rooms: JSON.parse(JSON.stringify(project.rooms)),
        doors: JSON.parse(JSON.stringify(project.doors)),
        windows: JSON.parse(JSON.stringify(project.windows)),
        furniture: JSON.parse(JSON.stringify(project.furniture)),
      },
      ...prev,
    ]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    onUpdateProject({
      ...project,
      walls: last.walls,
      rooms: last.rooms,
      doors: last.doors,
      windows: last.windows,
      furniture: last.furniture,
    });
    setSelectedItem(null);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((prev) => [
      ...prev,
      {
        walls: JSON.parse(JSON.stringify(project.walls)),
        rooms: JSON.parse(JSON.stringify(project.rooms)),
        doors: JSON.parse(JSON.stringify(project.doors)),
        windows: JSON.parse(JSON.stringify(project.windows)),
        furniture: JSON.parse(JSON.stringify(project.furniture)),
      },
    ]);
    setFuture((prev) => prev.slice(1));
    onUpdateProject({
      ...project,
      walls: next.walls,
      rooms: next.rooms,
      doors: next.doors,
      windows: next.windows,
      furniture: next.furniture,
    });
    setSelectedItem(null);
  };

  // Convert screen client coordinates to feet coordinates
  const clientToFeet = useCallback(
    (clientX: number, clientY: number): Point2D => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left - offset.x) / scale;
      const rawY = (clientY - rect.top - offset.y) / scale;

      if (!snapGrid) {
        return { x: Math.round(rawX * 10) / 10, y: Math.round(rawY * 10) / 10 };
      }
      return {
        x: Math.round(rawX / snapSize) * snapSize,
        y: Math.round(rawY / snapSize) * snapSize,
      };
    },
    [offset, scale, snapGrid, snapSize]
  );

  // Mouse / Touch Event Handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button === 1 || activeTool === 'pan' || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const pt = clientToFeet(e.clientX, e.clientY);

    // TOOL: WALL DRAWING
    if (activeTool === 'wall') {
      if (!wallStart) {
        setWallStart(pt);
      } else {
        // Complete wall if length > 0.5 ft
        const dist = Math.hypot(pt.x - wallStart.x, pt.y - wallStart.y);
        if (dist >= 0.5) {
          pushHistory();
          const newWall: Wall = {
            id: 'wall_' + Math.random().toString(36).substring(2, 9),
            start: { ...wallStart },
            end: { ...pt },
            thickness: 10,
            height: 10,
            color: '#E2E8F0',
          };
          onUpdateProject({
            ...project,
            walls: [...project.walls, newWall],
          });
          // Continue chained drawing from end point
          setWallStart(pt);
        }
      }
      return;
    }

    // TOOL: ROOM RECTANGLE DRAWING
    if (activeTool === 'room') {
      if (!roomBoxStart) {
        setRoomBoxStart(pt);
      } else {
        const minX = Math.min(roomBoxStart.x, pt.x);
        const maxX = Math.max(roomBoxStart.x, pt.x);
        const minY = Math.min(roomBoxStart.y, pt.y);
        const maxY = Math.max(roomBoxStart.y, pt.y);
        const w = maxX - minX;
        const h = maxY - minY;

        if (w >= 3 && h >= 3) {
          pushHistory();
          const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
          const roomColors: Record<RoomType, string> = {
            bedroom: '#FEF3C7',
            living: '#DCFCE7',
            dining: '#F1F5F9',
            kitchen: '#FFEDD5',
            bathroom: '#E0F2FE',
            toilet: '#E0F2FE',
            study: '#E2E8F0',
            prayer: '#D1FAE5',
            store: '#F3F4F6',
            veranda: '#EDE9FE',
            balcony: '#FCE7F3',
            garage: '#E5E7EB',
            corridor: '#F8FAFC',
            custom: '#FFFFFF',
          };

          const newRoom: Room = {
            id: roomId,
            type: selectedRoomType,
            name: selectedRoomType.toUpperCase(),
            nameBn: t[selectedRoomType as keyof typeof t] as string,
            points: [
              { x: minX, y: minY },
              { x: maxX, y: minY },
              { x: maxX, y: maxY },
              { x: minX, y: maxY },
            ],
            areaSqFt: w * h,
            floorColor: roomColors[selectedRoomType] || '#F8FAFC',
          };

          // Generate bounding walls for this room
          const w1: Wall = { id: 'w_' + Math.random(), start: { x: minX, y: minY }, end: { x: maxX, y: minY }, thickness: 10, height: 10 };
          const w2: Wall = { id: 'w_' + Math.random(), start: { x: maxX, y: minY }, end: { x: maxX, y: maxY }, thickness: 10, height: 10 };
          const w3: Wall = { id: 'w_' + Math.random(), start: { x: maxX, y: maxY }, end: { x: minX, y: maxY }, thickness: 10, height: 10 };
          const w4: Wall = { id: 'w_' + Math.random(), start: { x: minX, y: maxY }, end: { x: minX, y: minY }, thickness: 10, height: 10 };

          onUpdateProject({
            ...project,
            rooms: [...project.rooms, newRoom],
            walls: [...project.walls, w1, w2, w3, w4],
          });
        }
        setRoomBoxStart(null);
      }
      return;
    }

    // TOOL: DOOR PLACEMENT
    if (activeTool === 'door') {
      pushHistory();
      const newDoor: Door = {
        id: 'door_' + Math.random().toString(36).substring(2, 9),
        position: pt,
        width: 3.25,
        height: 7,
        rotation: 0,
      };
      onUpdateProject({
        ...project,
        doors: [...project.doors, newDoor],
      });
      setSelectedItem({ type: 'door', id: newDoor.id });
      setActiveTool('select');
      return;
    }

    // TOOL: WINDOW PLACEMENT
    if (activeTool === 'window') {
      pushHistory();
      const newWin: WindowItem = {
        id: 'win_' + Math.random().toString(36).substring(2, 9),
        position: pt,
        width: 4,
        height: 4.5,
        sillHeight: 2.5,
        rotation: 0,
      };
      onUpdateProject({
        ...project,
        windows: [...project.windows, newWin],
      });
      setSelectedItem({ type: 'window', id: newWin.id });
      setActiveTool('select');
      return;
    }

    // TOOL: FURNITURE PLACEMENT
    if (activeTool === 'furniture') {
      pushHistory();
      const furnSpecs: Record<FurnitureType, { w: number; d: number; h: number; name: string }> = {
        bed_single: { w: 4, d: 6.5, h: 2.5, name: 'সিঙ্গেল খাট' },
        bed_king: { w: 6.5, d: 6.5, h: 3, name: 'মাস্টার খাট' },
        sofa_3seater: { w: 7, d: 3, h: 2.8, name: '৩-সিটার সোফা' },
        sofa_lshape: { w: 8, d: 6, h: 2.8, name: 'এল-সোফা' },
        dining_table: { w: 6, d: 3.5, h: 2.5, name: 'ডাইনিং টেবিল' },
        coffee_table: { w: 3.5, d: 2, h: 1.5, name: 'টি টেবিল' },
        chair: { w: 2, d: 2, h: 3, name: 'চেয়ার' },
        wardrobe: { w: 4.5, d: 2, h: 6.5, name: 'আলমিরা' },
        tv_unit: { w: 5, d: 1.5, h: 2, name: 'টিভি ইউনিট' },
        kitchen_counter: { w: 8, d: 2, h: 2.8, name: 'কিচেন স্ল্যাব' },
        sink: { w: 2.5, d: 2, h: 2.8, name: 'কিচেন সিংক' },
        commode: { w: 1.8, d: 2.2, h: 2.5, name: 'কমোড' },
        washbasin: { w: 2, d: 1.8, h: 2.8, name: 'বেসিন' },
        desk: { w: 4, d: 2.2, h: 2.5, name: 'পড়ার টেবিল' },
        bookshelf: { w: 4, d: 1.2, h: 6, name: 'বুক শেলফ' },
        staircase: { w: 6, d: 8, h: 10, name: 'সিঁড়িঘর' },
        car: { w: 6, d: 14, h: 5, name: 'গাড়ি' },
        gate: { w: 10, d: 1, h: 6, name: 'গেট' },
        tree: { w: 6, d: 6, h: 14, name: 'গাছ' },
        garden_bed: { w: 8, d: 4, h: 1.5, name: 'বাগান' },
      };
      const spec = furnSpecs[selectedFurnType] || { w: 4, d: 4, h: 3, name: 'আসবাব' };
      const newFurn: Furniture = {
        id: 'furn_' + Math.random().toString(36).substring(2, 9),
        type: selectedFurnType,
        name: spec.name,
        position: pt,
        rotation: 0,
        width: spec.w,
        depth: spec.d,
        height: spec.h,
      };
      onUpdateProject({
        ...project,
        furniture: [...project.furniture, newFurn],
      });
      setSelectedItem({ type: 'furniture', id: newFurn.id });
      setActiveTool('select');
      return;
    }

    // Clicking on empty space in select mode deselects
    if (activeTool === 'select' && !dragTarget) {
      setSelectedItem(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const pt = clientToFeet(e.clientX, e.clientY);
    setCurrentMouseFt(pt);

    // Handle dragging existing item
    if (dragTarget) {
      const dx = pt.x - dragTarget.startMouseFt.x;
      const dy = pt.y - dragTarget.startMouseFt.y;

      if (dragTarget.type === 'wall') {
        const wall = project.walls.find((w) => w.id === dragTarget.id);
        if (wall) {
          onUpdateProject({
            ...project,
            walls: project.walls.map((w) =>
              w.id === dragTarget.id
                ? {
                    ...w,
                    start: { x: dragTarget.initialData.start.x + dx, y: dragTarget.initialData.start.y + dy },
                    end: { x: dragTarget.initialData.end.x + dx, y: dragTarget.initialData.end.y + dy },
                  }
                : w
            ),
          });
        }
      } else if (dragTarget.type === 'wall_start') {
        onUpdateProject({
          ...project,
          walls: project.walls.map((w) =>
            w.id === dragTarget.id ? { ...w, start: pt } : w
          ),
        });
      } else if (dragTarget.type === 'wall_end') {
        onUpdateProject({
          ...project,
          walls: project.walls.map((w) =>
            w.id === dragTarget.id ? { ...w, end: pt } : w
          ),
        });
      } else if (dragTarget.type === 'door') {
        onUpdateProject({
          ...project,
          doors: project.doors.map((d) =>
            d.id === dragTarget.id
              ? {
                  ...d,
                  position: { x: dragTarget.initialData.position.x + dx, y: dragTarget.initialData.position.y + dy },
                }
              : d
          ),
        });
      } else if (dragTarget.type === 'window') {
        onUpdateProject({
          ...project,
          windows: project.windows.map((wn) =>
            wn.id === dragTarget.id
              ? {
                  ...wn,
                  position: { x: dragTarget.initialData.position.x + dx, y: dragTarget.initialData.position.y + dy },
                }
              : wn
          ),
        });
      } else if (dragTarget.type === 'furniture') {
        onUpdateProject({
          ...project,
          furniture: project.furniture.map((f) =>
            f.id === dragTarget.id
              ? {
                  ...f,
                  position: { x: dragTarget.initialData.position.x + dx, y: dragTarget.initialData.position.y + dy },
                }
              : f
          ),
        });
      }
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    if (dragTarget) {
      setDragTarget(null);
    }
  };

  // Keyboard Delete & Escape handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWallStart(null);
        setRoomBoxStart(null);
        setSelectedItem(null);
        setActiveTool('select');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItem && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          handleDeleteItem();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, project]);

  // Item Mutation Callbacks
  const handleDeleteItem = () => {
    if (!selectedItem) return;
    pushHistory();
    if (selectedItem.type === 'wall') {
      onUpdateProject({
        ...project,
        walls: project.walls.filter((w) => w.id !== selectedItem.id),
      });
    } else if (selectedItem.type === 'room') {
      onUpdateProject({
        ...project,
        rooms: project.rooms.filter((r) => r.id !== selectedItem.id),
      });
    } else if (selectedItem.type === 'door') {
      onUpdateProject({
        ...project,
        doors: project.doors.filter((d) => d.id !== selectedItem.id),
      });
    } else if (selectedItem.type === 'window') {
      onUpdateProject({
        ...project,
        windows: project.windows.filter((w) => w.id !== selectedItem.id),
      });
    } else if (selectedItem.type === 'furniture') {
      onUpdateProject({
        ...project,
        furniture: project.furniture.filter((f) => f.id !== selectedItem.id),
      });
    }
    setSelectedItem(null);
  };

  const handleDuplicateItem = () => {
    if (!selectedItem) return;
    pushHistory();
    const offsetFt = 2;
    if (selectedItem.type === 'wall') {
      const orig = project.walls.find((w) => w.id === selectedItem.id);
      if (orig) {
        const copy: Wall = {
          ...orig,
          id: 'wall_' + Math.random().toString(36).substring(2, 9),
          start: { x: orig.start.x + offsetFt, y: orig.start.y + offsetFt },
          end: { x: orig.end.x + offsetFt, y: orig.end.y + offsetFt },
        };
        onUpdateProject({ ...project, walls: [...project.walls, copy] });
        setSelectedItem({ type: 'wall', id: copy.id });
      }
    } else if (selectedItem.type === 'room') {
      const orig = project.rooms.find((r) => r.id === selectedItem.id);
      if (orig) {
        const copy: Room = {
          ...orig,
          id: 'room_' + Math.random().toString(36).substring(2, 9),
          name: `${orig.name} (Copy)`,
          points: orig.points.map((p) => ({ x: p.x + offsetFt, y: p.y + offsetFt })),
        };
        onUpdateProject({ ...project, rooms: [...project.rooms, copy] });
        setSelectedItem({ type: 'room', id: copy.id });
      }
    } else if (selectedItem.type === 'furniture') {
      const orig = project.furniture.find((f) => f.id === selectedItem.id);
      if (orig) {
        const copy: Furniture = {
          ...orig,
          id: 'furn_' + Math.random().toString(36).substring(2, 9),
          position: { x: orig.position.x + offsetFt, y: orig.position.y + offsetFt },
        };
        onUpdateProject({ ...project, furniture: [...project.furniture, copy] });
        setSelectedItem({ type: 'furniture', id: copy.id });
      }
    }
  };

  // Export 2D Plan to PNG Image
  const handleExportPNG = () => {
    if (!svgRef.current) return;
    const svgElem = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = svgElem.clientWidth * 2;
    canvas.height = svgElem.clientHeight * 2;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${project.settings.name}_2D_Plan.png`;
        downloadLink.href = pngUrl;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="relative w-full h-[calc(100vh-68px)] flex flex-col bg-slate-900 text-slate-100 select-none overflow-hidden">
      {/* TOP CONTROL TOOLBAR MATCHING SCREEN 4 */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950 border-b border-slate-800 z-30">
        {/* Left: Tools */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => {
              setActiveTool('select');
              setWallStart(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTool === 'select'
                ? 'bg-[#0284C7] text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MousePointer size={15} />
            <span className="hidden sm:inline">{t.toolSelect}</span>
          </button>

          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            title={t.undo}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={handleRedo}
            disabled={future.length === 0}
            title={t.redo}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
          >
            <Redo2 size={16} />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            onClick={() => setScale((s) => Math.min(60, s * 1.2))}
            title={t.zoomIn}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(8, s / 1.2))}
            title={t.zoomOut}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => {
              setScale(24);
              setOffset({ x: 80, y: 80 });
            }}
            title={t.resetView}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Center: 2D | 3D Toggle Pill Matching Screen 4 & 5 */}
        <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 p-0.5">
          <button
            onClick={() => setActiveTool('select')}
            className="px-3 py-1 rounded-lg bg-[#0284C7] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            2D
          </button>
          <button
            onClick={() => (window as any).__switchTo3D?.()}
            className="px-3 py-1 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            3D
          </button>
        </div>

        {/* Right: Export & Grid Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSnapGrid(!snapGrid)}
            title={t.snapToGrid}
            className={`p-1.5 rounded-lg text-xs transition ${
              snapGrid ? 'bg-sky-600/30 text-sky-400 border border-sky-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Magnet size={16} />
          </button>

          <button
            onClick={handleExportPNG}
            title={t.exportPng}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0284C7] hover:bg-sky-500 text-white text-xs font-semibold shadow transition"
          >
            <Download size={14} />
            <span className="hidden sm:inline">PNG</span>
          </button>
        </div>
      </div>

      {/* DRAWING / INSTRUCTION HINT BAR */}
      <div className="px-4 py-1.5 bg-slate-950/40 text-slate-400 text-xs flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <span>
            {activeTool === 'wall' && (wallStart ? `দেয়াল সম্পন্ন করতে ক্লিক করুন (দৈর্ঘ্য: ${formatFeetInches(Math.hypot(currentMouseFt.x - wallStart.x, currentMouseFt.y - wallStart.y), language)})` : 'দেয়ালের প্রথম বিন্দু নির্বাচন করুন')}
            {activeTool === 'room' && (roomBoxStart ? 'রুমের দ্বিতীয় কোণা নির্বাচন করুন' : 'রুম আঁকার প্রথম কোণ নির্বাচন করুন')}
            {activeTool === 'door' && 'দরজা বসাতে যেকোনো স্থানে ক্লিক করুন'}
            {activeTool === 'window' && 'জানালা বসাতে ক্লিক করুন'}
            {activeTool === 'furniture' && 'আসবাব বসাতে ক্লিক করুন'}
            {activeTool === 'select' && 'আইটেম সিলেক্ট বা ড্র্যাগ করতে ক্লিক করুন'}
            {activeTool === 'pan' && 'ক্যানভাস সরাতে টেনে নিন'}
          </span>
        </div>
        <div className="font-mono text-[11px] text-sky-400">
          X: {formatFeetInches(currentMouseFt.x, language)} | Y: {formatFeetInches(currentMouseFt.y, language)} | {Math.round(scale)}px/ft
        </div>
      </div>

      {/* SVG INTERACTIVE CANVAS */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
        <svg
          ref={svgRef}
          className={`w-full h-full select-none ${
            activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            {/* Grid Pattern: 1 ft minor, 5 ft major */}
            <pattern
              id="grid-minor"
              width={scale}
              height={scale}
              patternUnits="userSpaceOnUse"
              x={offset.x % scale}
              y={offset.y % scale}
            >
              <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#1E293B" strokeWidth="0.5" />
            </pattern>
            <pattern
              id="grid-major"
              width={scale * 5}
              height={scale * 5}
              patternUnits="userSpaceOnUse"
              x={offset.x % (scale * 5)}
              y={offset.y % (scale * 5)}
            >
              <rect width={scale * 5} height={scale * 5} fill="url(#grid-minor)" />
              <path d={`M ${scale * 5} 0 L 0 0 0 ${scale * 5}`} fill="none" stroke="#334155" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#grid-major)" />

          {/* Plot Boundary */}
          {project.settings.plotLength > 0 && project.settings.plotWidth > 0 && (
            <rect
              x={offset.x}
              y={offset.y}
              width={project.settings.plotLength * scale}
              height={project.settings.plotWidth * scale}
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.4"
            />
          )}

          {/* RENDER ROOMS */}
          {project.rooms.map((room) => {
            const pointsStr = room.points
              .map((p) => `${p.x * scale + offset.x},${p.y * scale + offset.y}`)
              .join(' ');
            const isSelected = selectedItem?.type === 'room' && selectedItem.id === room.id;

            // Compute center of room for label
            const avgX = room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length;
            const avgY = room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length;

            return (
              <g
                key={room.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem({ type: 'room', id: room.id });
                }}
                className="cursor-pointer"
              >
                <polygon
                  points={pointsStr}
                  fill={room.floorColor || '#F8FAFC'}
                  fillOpacity="0.25"
                  stroke={isSelected ? '#38BDF8' : '#64748B'}
                  strokeWidth={isSelected ? 3 : 1}
                />
                {/* Room Center Label */}
                <g transform={`translate(${avgX * scale + offset.x}, ${avgY * scale + offset.y})`}>
                  <rect
                    x="-60"
                    y="-20"
                    width="120"
                    height="40"
                    rx="8"
                    fill="#0F172A"
                    fillOpacity="0.85"
                    stroke={isSelected ? '#38BDF8' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    {language === 'bn' ? room.nameBn || room.name : room.name}
                  </text>
                  <text
                    x="0"
                    y="12"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="10"
                    fontWeight="medium"
                    fontFamily="system-ui"
                  >
                    {Math.round(room.areaSqFt || 0)} {t.sqFt}
                  </text>
                </g>
              </g>
            );
          })}

          {/* RENDER WALLS */}
          {project.walls.map((wall) => {
            const x1 = wall.start.x * scale + offset.x;
            const y1 = wall.start.y * scale + offset.y;
            const x2 = wall.end.x * scale + offset.x;
            const y2 = wall.end.y * scale + offset.y;
            const isSelected = selectedItem?.type === 'wall' && selectedItem.id === wall.id;
            const wallLengthFt = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);

            // Wall thickness in pixels: 10" = 0.83ft, 5" = 0.41ft
            const strokePx = (wall.thickness / 12) * scale;

            // Center point of wall for dimension tag
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            return (
              <g
                key={wall.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem({ type: 'wall', id: wall.id });
                }}
                className="cursor-pointer"
              >
                {/* Wall Base Stroke */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isSelected ? '#38BDF8' : wall.color || '#E2E8F0'}
                  strokeWidth={Math.max(4, strokePx)}
                  strokeLinecap="square"
                />

                {/* Wall Dimension Badge */}
                {wallLengthFt >= 2 && (
                  <g transform={`translate(${midX}, ${midY}) rotate(${angle > 90 || angle < -90 ? angle + 180 : angle})`}>
                    <rect
                      x="-35"
                      y="-16"
                      width="70"
                      height="14"
                      rx="4"
                      fill="#0284C7"
                      fillOpacity="0.9"
                    />
                    <text
                      x="0"
                      y="-5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="system-ui"
                    >
                      {formatDimension(wallLengthFt, unit, language)}
                    </text>
                  </g>
                )}

                {/* End Point Drag Handles if selected */}
                {isSelected && (
                  <>
                    <circle
                      cx={x1}
                      cy={y1}
                      r="6"
                      fill="#38BDF8"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-move"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragTarget({
                          type: 'wall_start',
                          id: wall.id,
                          startMouseFt: clientToFeet(e.clientX, e.clientY),
                          initialData: { ...wall },
                        });
                      }}
                    />
                    <circle
                      cx={x2}
                      cy={y2}
                      r="6"
                      fill="#38BDF8"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-move"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDragTarget({
                          type: 'wall_end',
                          id: wall.id,
                          startMouseFt: clientToFeet(e.clientX, e.clientY),
                          initialData: { ...wall },
                        });
                      }}
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* RENDER DOORS */}
          {project.doors.map((door) => {
            const cx = door.position.x * scale + offset.x;
            const cy = door.position.y * scale + offset.y;
            const wPx = door.width * scale;
            const isSelected = selectedItem?.type === 'door' && selectedItem.id === door.id;

            return (
              <g
                key={door.id}
                transform={`translate(${cx}, ${cy}) rotate(${door.rotation})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem({ type: 'door', id: door.id });
                }}
                className="cursor-pointer"
              >
                {/* Door Opening Gap */}
                <line x1={-wPx / 2} y1="0" x2={wPx / 2} y2="0" stroke="#0F172A" strokeWidth="6" />
                {/* Door Leaf */}
                <line
                  x1={-wPx / 2}
                  y1="0"
                  x2={-wPx / 2}
                  y2={-wPx}
                  stroke={isSelected ? '#38BDF8' : '#F59E0B'}
                  strokeWidth="3"
                />
                {/* Door Swing Arc */}
                <path
                  d={`M ${-wPx / 2} ${-wPx} A ${wPx} ${wPx} 0 0 1 ${wPx / 2} 0`}
                  fill="none"
                  stroke={isSelected ? '#38BDF8' : '#F59E0B'}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Handle circle */}
                <circle cx={-wPx / 2 + 6} cy={-wPx + 8} r="2.5" fill="#F59E0B" />
              </g>
            );
          })}

          {/* RENDER WINDOWS */}
          {project.windows.map((win) => {
            const cx = win.position.x * scale + offset.x;
            const cy = win.position.y * scale + offset.y;
            const wPx = win.width * scale;
            const isSelected = selectedItem?.type === 'window' && selectedItem.id === win.id;

            return (
              <g
                key={win.id}
                transform={`translate(${cx}, ${cy}) rotate(${win.rotation})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem({ type: 'window', id: win.id });
                }}
                className="cursor-pointer"
              >
                {/* Window Frame */}
                <rect
                  x={-wPx / 2}
                  y="-4"
                  width={wPx}
                  height="8"
                  fill="#0F172A"
                  stroke={isSelected ? '#38BDF8' : '#38BDF8'}
                  strokeWidth="1.5"
                />
                {/* Glass Panels */}
                <line x1={-wPx / 2 + 2} y1="0" x2={wPx / 2 - 2} y2="0" stroke="#7DD3FC" strokeWidth="2.5" />
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#38BDF8" strokeWidth="1" />
              </g>
            );
          })}

          {/* RENDER FURNITURE */}
          {project.furniture.map((furn) => {
            const cx = furn.position.x * scale + offset.x;
            const cy = furn.position.y * scale + offset.y;
            const wPx = furn.width * scale;
            const dPx = furn.depth * scale;
            const isSelected = selectedItem?.type === 'furniture' && selectedItem.id === furn.id;

            return (
              <g
                key={furn.id}
                transform={`translate(${cx}, ${cy}) rotate(${furn.rotation})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem({ type: 'furniture', id: furn.id });
                }}
                className="cursor-pointer"
              >
                <rect
                  x={-wPx / 2}
                  y={-dPx / 2}
                  width={wPx}
                  height={dPx}
                  rx="4"
                  fill="#1E293B"
                  stroke={isSelected ? '#38BDF8' : '#64748B'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="#CBD5E1"
                  fontSize="9"
                  fontFamily="system-ui"
                  pointerEvents="none"
                >
                  {furn.name}
                </text>
              </g>
            );
          })}

          {/* ACTIVE DRAWING WALL PREVIEW */}
          {wallStart && (
            <g>
              <line
                x1={wallStart.x * scale + offset.x}
                y1={wallStart.y * scale + offset.y}
                x2={currentMouseFt.x * scale + offset.x}
                y2={currentMouseFt.y * scale + offset.y}
                stroke="#38BDF8"
                strokeWidth="4"
                strokeDasharray="4 4"
              />
              <circle
                cx={wallStart.x * scale + offset.x}
                cy={wallStart.y * scale + offset.y}
                r="4"
                fill="#38BDF8"
              />
            </g>
          )}

          {/* ACTIVE DRAWING ROOM RECTANGLE PREVIEW */}
          {roomBoxStart && (
            <rect
              x={Math.min(roomBoxStart.x, currentMouseFt.x) * scale + offset.x}
              y={Math.min(roomBoxStart.y, currentMouseFt.y) * scale + offset.y}
              width={Math.abs(currentMouseFt.x - roomBoxStart.x) * scale}
              height={Math.abs(currentMouseFt.y - roomBoxStart.y) * scale}
              fill="#38BDF8"
              fillOpacity="0.15"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* BOTTOM TOOLS BAR MATCHING SCREEN 4 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur select-none">
          <button
            onClick={() => {
              setActiveTool('wall');
              setWallStart(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTool === 'wall'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Square size={16} />
            <span>দেয়াল</span>
          </button>

          <button
            onClick={() => {
              setActiveTool('room');
              setWallStart(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTool === 'room'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Maximize2 size={16} />
            <span>কক্ষ</span>
          </button>

          <button
            onClick={() => {
              setActiveTool('door');
              setWallStart(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTool === 'door'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <DoorOpen size={16} />
            <span>দরজা</span>
          </button>

          <button
            onClick={() => {
              setActiveTool('window');
              setWallStart(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTool === 'window'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Square size={16} className="rotate-45" />
            <span>জানালা</span>
          </button>

          <button
            onClick={() => {
              setActiveTool('furniture');
              setShowFurnPicker(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTool === 'furniture'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Armchair size={16} />
            <span>ফার্নিচার</span>
          </button>

          <button
            onClick={() => {
              setActiveTool('select');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTool === 'select'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MousePointer size={16} />
            <span>মাপ</span>
          </button>
        </div>

        {/* PROPERTY EDITOR FLOATING MODAL */}
        <PropertyEditor
          selectedItem={selectedItem}
          walls={project.walls}
          rooms={project.rooms}
          doors={project.doors}
          windows={project.windows}
          furniture={project.furniture}
          unit={unit}
          onUpdateWall={(w) => {
            pushHistory();
            onUpdateProject({
              ...project,
              walls: project.walls.map((item) => (item.id === w.id ? w : item)),
            });
          }}
          onUpdateRoom={(r) => {
            pushHistory();
            onUpdateProject({
              ...project,
              rooms: project.rooms.map((item) => (item.id === r.id ? r : item)),
            });
          }}
          onUpdateDoor={(d) => {
            pushHistory();
            onUpdateProject({
              ...project,
              doors: project.doors.map((item) => (item.id === d.id ? d : item)),
            });
          }}
          onUpdateWindow={(wn) => {
            pushHistory();
            onUpdateProject({
              ...project,
              windows: project.windows.map((item) => (item.id === wn.id ? wn : item)),
            });
          }}
          onUpdateFurniture={(f) => {
            pushHistory();
            onUpdateProject({
              ...project,
              furniture: project.furniture.map((item) => (item.id === f.id ? f : item)),
            });
          }}
          onDelete={handleDeleteItem}
          onDuplicate={handleDuplicateItem}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
};
