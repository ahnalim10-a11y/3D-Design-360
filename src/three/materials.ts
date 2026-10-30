/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural texture generators
function createTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 3;

  // 4x4 grid of tiles
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTinRoofTexture(baseColor = '#0284C7'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Corrugated waves shading
  for (let x = 0; x < 128; x++) {
    const sinVal = Math.sin((x / 128) * Math.PI * 8);
    const brightness = 0.8 + 0.25 * sinVal;
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, 0, 1, 256);
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, -sinVal * 0.25)})`;
    ctx.fillRect(x, 0, 1, 256);
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, sinVal * 0.2)})`;
    ctx.fillRect(x, 0, 1, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface MaterialLibrary {
  wallExterior: THREE.MeshStandardMaterial;
  wallInterior: THREE.MeshStandardMaterial;
  floorTile: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  doorWood: THREE.MeshStandardMaterial;
  windowFrame: THREE.MeshStandardMaterial;
  roofTin: (color?: string) => THREE.MeshStandardMaterial;
  roofTile: THREE.MeshStandardMaterial;
  roofConcrete: THREE.MeshStandardMaterial;
  terrainGrass: THREE.MeshStandardMaterial;
}

export function createMaterialLibrary(): MaterialLibrary {
  const tileTex = createTileTexture();

  return {
    wallExterior: new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.85,
      metalness: 0.05,
    }),
    wallInterior: new THREE.MeshStandardMaterial({
      color: 0xFAF5FF,
      roughness: 0.9,
      metalness: 0.02,
    }),
    floorTile: new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.35,
      metalness: 0.1,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x93C5FD,
      transmission: 0.85,
      opacity: 0.45,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    }),
    doorWood: new THREE.MeshStandardMaterial({
      color: 0x854D0E,
      roughness: 0.55,
      metalness: 0.1,
    }),
    windowFrame: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.6,
    }),
    roofTin: (color = '#0284C7') => {
      const tex = createTinRoofTexture(color);
      return new THREE.MeshStandardMaterial({
        map: tex,
        color: new THREE.Color(color),
        roughness: 0.35,
        metalness: 0.45,
        side: THREE.DoubleSide,
      });
    },
    roofTile: new THREE.MeshStandardMaterial({
      color: 0xDC2626,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide,
    }),
    roofConcrete: new THREE.MeshStandardMaterial({
      color: 0x94A3B8,
      roughness: 0.9,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }),
    terrainGrass: new THREE.MeshStandardMaterial({
      color: 0x22C55E,
      roughness: 0.95,
      metalness: 0.0,
    }),
  };
}
