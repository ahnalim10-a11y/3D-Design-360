/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Project, RoofConfig, RoofType, RoofMaterial } from '../types';
import { useI18n } from '../localization/i18n';
import { createMaterialLibrary, MaterialLibrary } from './materials';
import { buildArchitecturalScene } from './sceneBuilder';
import {
  RotateCw,
  Eye,
  Camera,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Download,
  Sliders,
  Footprints,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface ThreeStudio3DProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  defaultMode?: 'orbit' | '360' | 'walkthrough';
}

export const ThreeStudio3D: React.FC<ThreeStudio3DProps> = ({
  project,
  onUpdateProject,
  defaultMode = 'orbit',
}) => {
  const { t, language } = useI18n();
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Studio State
  const [viewMode, setViewMode] = useState<'normal' | 'cutaway'>('normal');
  const [showRoof, setShowRoof] = useState(project.roof.showRoof ?? true);
  const [isAutoSpin, setIsAutoSpin] = useState(defaultMode === '360');
  const [isWalkthrough, setIsWalkthrough] = useState(defaultMode === 'walkthrough');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'views' | 'roof' | 'mode'>('views');

  // Roof customization
  const [roofType, setRoofType] = useState<RoofType>(project.roof.type || 'gable');
  const [roofHeight, setRoofHeight] = useState(project.roof.height || 5.5);
  const [roofOverhang, setRoofOverhang] = useState(project.roof.overhang || 2.0);
  const [roofColor, setRoofColor] = useState(project.roof.color || '#0284C7');
  const [roofMaterial, setRoofMaterial] = useState<RoofMaterial>(project.roof.material || 'tin');

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buildingMeshGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<MaterialLibrary | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Walkthrough position & angle
  const walkPosRef = useRef<{ x: number; y: number; z: number }>({ x: 15, y: 5.5, z: 15 });
  const walkAngleRef = useRef<number>(0);

  // Center calculation for camera focus
  const getProjectCenter = useCallback(() => {
    let minX = 0;
    let maxX = project.settings.plotLength || 35;
    let minZ = 0;
    let maxZ = project.settings.plotWidth || 25;

    if (project.walls.length > 0) {
      const allX = project.walls.flatMap((w) => [w.start.x, w.end.x]);
      const allZ = project.walls.flatMap((w) => [w.start.y, w.end.y]);
      minX = Math.min(...allX);
      maxX = Math.max(...allX);
      minZ = Math.min(...allZ);
      maxZ = Math.max(...allZ);
    }

    return {
      x: (minX + maxX) / 2,
      y: 5.0,
      z: (minZ + maxZ) / 2,
      radius: Math.max(maxX - minX, maxZ - minZ, 25),
    };
  }, [project]);

  // INITIALIZE THREE.JS SCENE ON MOUNT
  useEffect(() => {
    if (!mountRef.current) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0F1D);
    scene.fog = new THREE.FogExp2(0x0A0F1D, 0.008);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    const center = getProjectCenter();
    camera.position.set(center.x + center.radius * 1.2, center.radius * 0.9, center.z + center.radius * 1.2);
    camera.lookAt(center.x, 3, center.z);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // RoomEnvironment Studio Reflection
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      // fallback
    }

    // 3-Point Studio Lighting
    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xFFF7ED, 2.2);
    sunLight.position.set(center.x + 30, 45, center.z + 35);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 150;
    const shadowD = center.radius * 1.5;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Cool Sky / Ground Fill
    const hemiLight = new THREE.HemisphereLight(0xBAE6FD, 0x1E293B, 1.1);
    scene.add(hemiLight);

    // Back rim light
    const rimLight = new THREE.DirectionalLight(0x7DD3FC, 0.8);
    rimLight.position.set(center.x - 30, 25, center.z - 35);
    scene.add(rimLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.target.set(center.x, 3, center.z);
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below ground
    controls.minDistance = 3;
    controls.maxDistance = 250;
    controlsRef.current = controls;

    // Materials
    materialsRef.current = createMaterialLibrary();

    // Render loop
    const tick = () => {
      animFrameIdRef.current = requestAnimationFrame(tick);
      if (controlsRef.current) {
        if (isAutoSpin) {
          controlsRef.current.autoRotate = true;
          controlsRef.current.autoRotateSpeed = 2.0;
        } else {
          controlsRef.current.autoRotate = false;
        }
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    tick();

    // Resize observer
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  // SYNCHRONIZE 3D MODEL WITH PROJECT DATA AND VIEW MODE
  useEffect(() => {
    if (!sceneRef.current || !materialsRef.current) return;

    // Remove existing building geometry group
    if (buildingMeshGroupRef.current) {
      sceneRef.current.remove(buildingMeshGroupRef.current);
      buildingMeshGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
    }

    // Build fresh architectural 3D geometry
    const buildingGroup = buildArchitecturalScene(project, materialsRef.current, {
      cutaway: viewMode === 'cutaway',
    });
    sceneRef.current.add(buildingGroup);
    buildingMeshGroupRef.current = buildingGroup;
  }, [project, viewMode]);

  // CAMERA VIEW PRESETS
  const setCameraPreset = (
    preset: 'front' | 'rear' | 'left' | 'right' | 'top' | 'iso'
  ) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const center = getProjectCenter();
    const d = center.radius * 1.5;

    setIsWalkthrough(false);
    setIsAutoSpin(false);

    controlsRef.current.target.set(center.x, 3, center.z);

    switch (preset) {
      case 'front': // South
        cameraRef.current.position.set(center.x, 8, center.z + d);
        break;
      case 'rear': // North
        cameraRef.current.position.set(center.x, 8, center.z - d);
        break;
      case 'left': // West
        cameraRef.current.position.set(center.x - d, 8, center.z);
        break;
      case 'right': // East
        cameraRef.current.position.set(center.x + d, 8, center.z);
        break;
      case 'top': // Plan View
        cameraRef.current.position.set(center.x, d * 1.6, center.z + 0.1);
        break;
      case 'iso': // Isometric
      default:
        cameraRef.current.position.set(center.x + d * 0.9, d * 0.8, center.z + d * 0.9);
        break;
    }
    controlsRef.current.update();
  };

  // ROOF CUSTOMIZER UPDATE
  const handleApplyRoof = () => {
    const updatedRoof: RoofConfig = {
      ...project.roof,
      type: roofType,
      height: roofHeight,
      overhang: roofOverhang,
      color: roofColor,
      material: roofMaterial,
      showRoof,
    };
    onUpdateProject({
      ...project,
      roof: updatedRoof,
    });
  };

  // CAPTURE HIGH RESOLUTION 3D SCREENSHOT PNG
  const handleCaptureScreenshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    // Force immediate draw buffer refresh
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `${project.settings.name}_3D_View.png`;
    a.href = dataUrl;
    a.click();
  };

  // WALKTHROUGH CONTROLS
  const handleWalk = (direction: 'forward' | 'backward' | 'left' | 'right') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const step = 2.0;
    const forward = new THREE.Vector3();
    cameraRef.current.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (direction === 'forward') {
      walkPosRef.current.x += forward.x * step;
      walkPosRef.current.z += forward.z * step;
    } else if (direction === 'backward') {
      walkPosRef.current.x -= forward.x * step;
      walkPosRef.current.z -= forward.z * step;
    } else if (direction === 'left') {
      walkPosRef.current.x -= right.x * step;
      walkPosRef.current.z -= right.z * step;
    } else if (direction === 'right') {
      walkPosRef.current.x += right.x * step;
      walkPosRef.current.z += right.z * step;
    }

    cameraRef.current.position.set(
      walkPosRef.current.x,
      walkPosRef.current.y,
      walkPosRef.current.z
    );
    controlsRef.current.target.set(
      walkPosRef.current.x + forward.x * 10,
      walkPosRef.current.y,
      walkPosRef.current.z + forward.z * 10
    );
    controlsRef.current.update();
  };

  const startWalkthroughMode = () => {
    const center = getProjectCenter();
    walkPosRef.current = { x: center.x, y: 5.5, z: center.z };
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(center.x, 5.5, center.z);
      controlsRef.current.target.set(center.x, 5.5, center.z - 15);
      controlsRef.current.update();
    }
    setIsWalkthrough(true);
    setIsAutoSpin(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-68px)] overflow-hidden bg-slate-950">
      {/* 3D WEBGL CANVAS MOUNT CONTAINER */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP HEADER STATUS & QUICK ACTIONS MATCHING SCREEN 5 */}
      <div className="absolute top-3 left-0 right-0 px-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (window as any).__switchToDashboard?.()}
            className="p-1.5 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700/60 text-white cursor-pointer hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* 2D | 3D Toggle Pill Matching Screen 4 & 5 */}
        <div className="flex items-center rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700 p-0.5 shadow-lg">
          <button
            onClick={() => (window as any).__switchTo2D?.()}
            className="px-3.5 py-1 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            2D
          </button>
          <button
            className="px-3.5 py-1 rounded-lg bg-[#0284C7] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            3D
          </button>
        </div>

        {/* Top Right: Compass & Screenshot */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700/60 text-sky-400 flex items-center justify-center shadow-lg">
            <Compass size={18} />
          </div>

          <button
            onClick={handleCaptureScreenshot}
            className="p-1.5 rounded-lg bg-[#0284C7] hover:bg-sky-500 text-white shadow-lg transition cursor-pointer"
            title="Download 3D Screenshot PNG"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>

      {/* FLOATING ORBIT PILL MATCHING SCREEN 5 */}
      <div className="absolute top-16 left-4 z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 text-xs font-bold text-sky-400 shadow-lg">
          <RotateCw size={14} />
          <span>Orbit</span>
        </div>
      </div>

      {/* WALKTHROUGH VIRTUAL D-PAD (FOR MOBILE / TOUCH ANDROID USERS) */}
      {isWalkthrough && (
        <div className="absolute bottom-28 left-6 z-30 flex flex-col items-center bg-slate-900/90 p-3 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur">
          <div className="text-[10px] font-bold text-sky-400 mb-1">{t.walkthroughMode}</div>
          <button
            onClick={() => handleWalk('forward')}
            className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 rounded-lg text-white"
          >
            <ArrowUp size={20} />
          </button>
          <div className="flex gap-2 my-1">
            <button
              onClick={() => handleWalk('left')}
              className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 rounded-lg text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => handleWalk('backward')}
              className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 rounded-lg text-white"
            >
              <ArrowDown size={20} />
            </button>
            <button
              onClick={() => handleWalk('right')}
              className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 rounded-lg text-white"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK (THREE.JS GUIDELINES COMPLIANT) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-3 pointer-events-auto">
        <div className="relative rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl text-slate-100 overflow-hidden">
          {/* Collapse / Expand Toggle Tab */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/80">
            {/* Dock Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveTab('views');
                  setDockCollapsed(false);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'views' && !dockCollapsed
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.viewPresets}
              </button>
              <button
                onClick={() => {
                  setActiveTab('roof');
                  setDockCollapsed(false);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'roof' && !dockCollapsed
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.roofCustomizer}
              </button>
              <button
                onClick={() => {
                  setActiveTab('mode');
                  setDockCollapsed(false);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'mode' && !dockCollapsed
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.view360} & {t.walkthrough}
              </button>
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setDockCollapsed(!dockCollapsed)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded transition"
            >
              <span>{dockCollapsed ? '▲' : '▼'}</span>
              <span className="hidden sm:inline">{dockCollapsed ? 'Expand HUD' : 'Collapse HUD'}</span>
            </button>
          </div>

          {/* DOCK CONTENT BODY */}
          {!dockCollapsed && (
            <div className="p-3.5 space-y-3">
              {/* TAB 1: CAMERA VIEW PRESETS MATCHING SCREEN 5 */}
              {activeTab === 'views' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5 text-center">
                    <button
                      onClick={() => setCameraPreset('front')}
                      className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-center transition flex flex-col items-center"
                    >
                      <span>🏠</span>
                      <span>Front</span>
                    </button>
                    <button
                      onClick={() => setCameraPreset('rear')}
                      className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-center transition flex flex-col items-center"
                    >
                      <span>🔄</span>
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => setCameraPreset('left')}
                      className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-center transition flex flex-col items-center"
                    >
                      <span>⬅️</span>
                      <span>Left</span>
                    </button>
                    <button
                      onClick={() => setCameraPreset('right')}
                      className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-center transition flex flex-col items-center"
                    >
                      <span>➡️</span>
                      <span>Right</span>
                    </button>
                    <button
                      onClick={() => setCameraPreset('top')}
                      className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-center transition flex flex-col items-center"
                    >
                      <span>🔝</span>
                      <span>Top</span>
                    </button>
                    <button
                      onClick={() => setCameraPreset('iso')}
                      className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-center transition flex flex-col items-center"
                    >
                      <span>📦</span>
                      <span>Iso</span>
                    </button>
                  </div>

                  {/* Roof [ ON | OFF ] Switch Matching Screen 5 */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-300">Roof:</span>
                      <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-700">
                        <button
                          onClick={() => {
                            setShowRoof(true);
                            onUpdateProject({
                              ...project,
                              roof: { ...project.roof, showRoof: true },
                            });
                          }}
                          className={`px-3 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            showRoof ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-400'
                          }`}
                        >
                          ON
                        </button>
                        <button
                          onClick={() => {
                            setShowRoof(false);
                            onUpdateProject({
                              ...project,
                              roof: { ...project.roof, showRoof: false },
                            });
                          }}
                          className={`px-3 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            !showRoof ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400'
                          }`}
                        >
                          OFF
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const newMode = viewMode === 'normal' ? 'cutaway' : 'normal';
                        setViewMode(newMode);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        viewMode === 'cutaway'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {t.cutawayView}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ROOF DESIGNER */}
              {activeTab === 'roof' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                    {(
                      [
                        { type: 'gable', label: t.gableRoof },
                        { type: 'double_gable', label: t.doubleGableRoof },
                        { type: 'hip', label: t.hipRoof },
                        { type: 'single_slope', label: t.singleSlopeRoof },
                        { type: 'flat', label: t.flatRoof },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.type}
                        onClick={() => {
                          setRoofType(r.type);
                          onUpdateProject({
                            ...project,
                            roof: { ...project.roof, type: r.type },
                          });
                        }}
                        className={`p-2 rounded-lg font-medium text-center transition truncate ${
                          roofType === r.type
                            ? 'bg-sky-600 text-white shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title={r.label}
                      >
                        {r.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{t.roofHeight}</span>
                        <span className="text-sky-400 font-mono">{roofHeight} ft</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        step="0.5"
                        value={roofHeight}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setRoofHeight(val);
                          onUpdateProject({
                            ...project,
                            roof: { ...project.roof, height: val },
                          });
                        }}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{t.roofOverhang}</span>
                        <span className="text-sky-400 font-mono">{roofOverhang} ft</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.25"
                        value={roofOverhang}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setRoofOverhang(val);
                          onUpdateProject({
                            ...project,
                            roof: { ...project.roof, overhang: val },
                          });
                        }}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>{t.roofMaterial}</span>
                      </div>
                      <select
                        value={roofMaterial}
                        onChange={(e) => {
                          const mat = e.target.value as RoofMaterial;
                          setRoofMaterial(mat);
                          onUpdateProject({
                            ...project,
                            roof: { ...project.roof, material: mat },
                          });
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        <option value="tin">ঢেউটিন / কালার টিন (Tin CI Sheet)</option>
                        <option value="clay_tile">মাটির টালি (Clay Tile)</option>
                        <option value="concrete">কংক্রিট ছাদ (RCC Concrete)</option>
                        <option value="metal_sheet">কালার মেটাল শিট (Metal Sheet)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 360° TURNTABLE & WALKTHROUGH */}
              {activeTab === 'mode' && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsAutoSpin(!isAutoSpin)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                      isAutoSpin
                        ? 'bg-sky-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <RotateCw size={16} className={isAutoSpin ? 'animate-spin' : ''} />
                    <span>{t.autoSpin360}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isWalkthrough) {
                        setIsWalkthrough(false);
                      } else {
                        startWalkthroughMode();
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                      isWalkthrough
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Footprints size={16} />
                    <span>{t.walkthroughMode}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
