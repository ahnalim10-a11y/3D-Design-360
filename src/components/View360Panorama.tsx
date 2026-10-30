/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArrowLeft, MoreVertical, Play, Pause, RotateCw } from 'lucide-react';
import { useI18n } from '../localization/i18n';

interface View360PanoramaProps {
  onBack: () => void;
}

export const View360Panorama: React.FC<View360PanoramaProps> = ({ onBack }) => {
  const { language } = useI18n();
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [activeRoom, setActiveRoom] = useState<'living' | 'master_bed' | 'kitchen' | 'veranda' | 'bath'>('living');
  const [isPlaying, setIsPlaying] = useState(true);

  const rooms = [
    { id: 'living', nameBn: 'লিভিং রুম (Living Room)', nameEn: 'Living Room', colorTop: '#1E293B', colorFloor: '#E2E8F0', wallColor: '#F8FAFC' },
    { id: 'master_bed', nameBn: 'মাস্টার বেডরুম (Bedroom)', nameEn: 'Master Bedroom', colorTop: '#334155', colorFloor: '#CBD5E1', wallColor: '#FEF3C7' },
    { id: 'kitchen', nameBn: 'কিচেন (Kitchen)', nameEn: 'Modern Kitchen', colorTop: '#1E293B', colorFloor: '#94A3B8', wallColor: '#DCFCE7' },
    { id: 'veranda', nameBn: 'বারান্দা (Veranda)', nameEn: 'Front Veranda', colorTop: '#0F172A', colorFloor: '#64748B', wallColor: '#EDE9FE' },
  ];

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Generate procedural equirectangular panorama texture for each room
  const createRoomPanoramaTexture = (roomId: string): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Ceiling gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (roomId === 'living') {
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(0.35, '#E2E8F0');
      grad.addColorStop(0.65, '#C2410C');
      grad.addColorStop(1, '#78350F');
    } else if (roomId === 'kitchen') {
      grad.addColorStop(0, '#1E293B');
      grad.addColorStop(0.35, '#F1F5F9');
      grad.addColorStop(0.65, '#0284C7');
      grad.addColorStop(1, '#334155');
    } else {
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(0.35, '#FEF3C7');
      grad.addColorStop(0.65, '#B45309');
      grad.addColorStop(1, '#451A03');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Wall panels and window frames
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 4;
    for (let x = 0; x < 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 120);
      ctx.lineTo(x, 380);
      ctx.stroke();
    }

    // Windows with sky view
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(160, 160, 200, 140);
    ctx.fillRect(660, 160, 200, 140);

    // Interior lights glowing on ceiling
    for (let lx = 100; lx < 1024; lx += 200) {
      const radGrad = ctx.createRadialGradient(lx, 60, 5, lx, 60, 60);
      radGrad.addColorStop(0, 'rgba(255, 247, 237, 0.9)');
      radGrad.addColorStop(1, 'rgba(255, 247, 237, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(lx, 60, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Inverted Sphere for 360 panorama
    const sphereGeom = new THREE.SphereGeometry(500, 60, 40);
    sphereGeom.scale(-1, 1, 1); // invert faces inward
    const tex = createRoomPanoramaTexture(activeRoom);
    const sphereMat = new THREE.MeshBasicMaterial({ map: tex });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    scene.add(sphere);
    sphereMeshRef.current = sphere;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = -0.3;
    controls.autoRotate = isPlaying;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.autoRotate = isPlaying;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Update room panorama texture on room switch
  useEffect(() => {
    if (sphereMeshRef.current) {
      const tex = createRoomPanoramaTexture(activeRoom);
      sphereMeshRef.current.material = new THREE.MeshBasicMaterial({ map: tex });
    }
  }, [activeRoom]);

  const activeRoomObj = rooms.find((r) => r.id === activeRoom) || rooms[0];

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-slate-950 select-none overflow-hidden animate-in fade-in">
      {/* 360 Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP HEADER BAR MATCHING SCREEN 6 */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20 text-white">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="px-4 py-1 rounded-full bg-black/50 backdrop-blur border border-white/20 font-bold text-xs">
          {language === 'bn' ? activeRoomObj.nameBn : activeRoomObj.nameEn}
        </div>

        <button className="p-1.5 rounded-full bg-black/40 text-white">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* CENTER 360 BADGE MATCHING SCREEN 6 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full border-2 border-white/80 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white shadow-2xl">
          <span className="font-black text-sm tracking-widest">360°</span>
          <RotateCw size={14} className="mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      {/* PLAY / PAUSE BUTTON */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-white/90 text-[#0284C7] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
          title="Toggle 360 Spin"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
      </div>

      {/* BOTTOM THUMBNAILS CAROUSEL MATCHING SCREEN 6 */}
      <div className="absolute bottom-3 left-0 right-0 z-20 px-4">
        <div className="max-w-xl mx-auto flex items-center gap-2 overflow-x-auto p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 scrollbar-none">
          {rooms.map((room) => {
            const isSelected = activeRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id as any)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#0284C7] text-white shadow-md'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <span>{room.nameBn.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
