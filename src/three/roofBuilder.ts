/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoofConfig } from '../types';
import { MaterialLibrary } from './materials';

interface BuildingBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  wallHeight: number;
}

export function buildRoofGeometry(
  roofConfig: RoofConfig,
  bounds: BuildingBounds,
  materials: MaterialLibrary
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'roof_group';

  if (!roofConfig.showRoof) {
    return group;
  }

  const { minX, maxX, minZ, maxZ, wallHeight } = bounds;
  const overhang = roofConfig.overhang || 1.5;
  const peakHeight = roofConfig.height || 5.0;

  // Extended roof footprints with overhang
  const x0 = minX - overhang;
  const x1 = maxX + overhang;
  const z0 = minZ - overhang;
  const z1 = maxZ + overhang;

  const width = x1 - x0;
  const depth = z1 - z0;
  const midX = (x0 + x1) / 2;
  const midZ = (z0 + z1) / 2;
  const baseRoofY = wallHeight;

  // Choose roof material
  let roofMat: THREE.Material;
  if (roofConfig.material === 'tin' || roofConfig.material === 'metal_sheet') {
    roofMat = materials.roofTin(roofConfig.color || '#0284C7');
  } else if (roofConfig.material === 'clay_tile' || roofConfig.material === 'shingle') {
    roofMat = materials.roofTile;
  } else {
    roofMat = materials.roofConcrete;
  }

  // 1. GABLE ROOF (দোচালা ছাদ)
  if (roofConfig.type === 'gable') {
    // Ridge runs along length (longer axis)
    const runsX = width >= depth;
    const geom = new THREE.BufferGeometry();
    let vertices: number[] = [];

    if (runsX) {
      // Ridge along X at midZ
      // Left slope: (x0, baseRoofY, z0) -> (x1, baseRoofY, z0) -> (x1, baseRoofY+peakHeight, midZ) -> (x0, baseRoofY+peakHeight, midZ)
      // Triangle 1
      vertices.push(
        x0, baseRoofY, z0,
        x1, baseRoofY, z0,
        x1, baseRoofY + peakHeight, midZ,
        x0, baseRoofY, z0,
        x1, baseRoofY + peakHeight, midZ,
        x0, baseRoofY + peakHeight, midZ,

        // Right slope
        x0, baseRoofY + peakHeight, midZ,
        x1, baseRoofY + peakHeight, midZ,
        x1, baseRoofY, z1,
        x0, baseRoofY + peakHeight, midZ,
        x1, baseRoofY, z1,
        x0, baseRoofY, z1,

        // Gable end triangle West
        x0, baseRoofY, z0,
        x0, baseRoofY + peakHeight, midZ,
        x0, baseRoofY, z1,

        // Gable end triangle East
        x1, baseRoofY, z0,
        x1, baseRoofY, z1,
        x1, baseRoofY + peakHeight, midZ
      );
    } else {
      // Ridge along Z at midX
      vertices.push(
        x0, baseRoofY, z0,
        midX, baseRoofY + peakHeight, z0,
        midX, baseRoofY + peakHeight, z1,
        x0, baseRoofY, z0,
        midX, baseRoofY + peakHeight, z1,
        x0, baseRoofY, z1,

        midX, baseRoofY + peakHeight, z0,
        x1, baseRoofY, z0,
        x1, baseRoofY, z1,
        midX, baseRoofY + peakHeight, z0,
        x1, baseRoofY, z1,
        midX, baseRoofY + peakHeight, z1,

        // Gable triangle North
        x0, baseRoofY, z0,
        x1, baseRoofY, z0,
        midX, baseRoofY + peakHeight, z0,

        // Gable triangle South
        x0, baseRoofY, z1,
        midX, baseRoofY + peakHeight, z1,
        x1, baseRoofY, z1
      );
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, roofMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }

  // 2. DOUBLE-GABLE ROOF (চারচালা / চৌচালা ছাদ) & 3. HIP ROOF
  if (roofConfig.type === 'double_gable' || roofConfig.type === 'hip') {
    const geom = new THREE.BufferGeometry();
    const ridgeOffset = Math.min(width, depth) * 0.25;
    const runsX = width >= depth;
    let vertices: number[] = [];

    if (runsX) {
      const rx0 = x0 + ridgeOffset;
      const rx1 = x1 - ridgeOffset;
      const apexY = baseRoofY + peakHeight;

      // North slope (trapezoid)
      vertices.push(
        x0, baseRoofY, z0,
        x1, baseRoofY, z0,
        rx1, apexY, midZ,
        x0, baseRoofY, z0,
        rx1, apexY, midZ,
        rx0, apexY, midZ,

        // South slope (trapezoid)
        x0, baseRoofY, z1,
        rx0, apexY, midZ,
        rx1, apexY, midZ,
        x0, baseRoofY, z1,
        rx1, apexY, midZ,
        x1, baseRoofY, z1,

        // West triangle
        x0, baseRoofY, z0,
        rx0, apexY, midZ,
        x0, baseRoofY, z1,

        // East triangle
        x1, baseRoofY, z0,
        x1, baseRoofY, z1,
        rx1, apexY, midZ
      );
    } else {
      const rz0 = z0 + ridgeOffset;
      const rz1 = z1 - ridgeOffset;
      const apexY = baseRoofY + peakHeight;

      vertices.push(
        x0, baseRoofY, z0,
        midX, apexY, rz1,
        midX, apexY, rz0,
        x0, baseRoofY, z0,
        x0, baseRoofY, z1,
        midX, apexY, rz1,

        x1, baseRoofY, z0,
        midX, apexY, rz0,
        midX, apexY, rz1,
        x1, baseRoofY, z0,
        midX, apexY, rz1,
        x1, baseRoofY, z1,

        // North triangle
        x0, baseRoofY, z0,
        midX, apexY, rz0,
        x1, baseRoofY, z0,

        // South triangle
        x0, baseRoofY, z1,
        x1, baseRoofY, z1,
        midX, apexY, rz1
      );
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, roofMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }

  // 4. SINGLE-SLOPE (MONO-PITCH / SHED) ROOF
  if (roofConfig.type === 'single_slope') {
    const geom = new THREE.BufferGeometry();
    const highY = baseRoofY + peakHeight;
    const lowY = baseRoofY;

    // Slopes downward from North (z0) to South (z1)
    const vertices = [
      // Top roof slope plane
      x0, highY, z0,
      x1, highY, z0,
      x1, lowY, z1,
      x0, highY, z0,
      x1, lowY, z1,
      x0, lowY, z1,

      // High back wall triangle / rectangle
      x0, baseRoofY, z0,
      x1, baseRoofY, z0,
      x1, highY, z0,
      x0, baseRoofY, z0,
      x1, highY, z0,
      x0, highY, z0,

      // Left triangle
      x0, baseRoofY, z0,
      x0, highY, z0,
      x0, lowY, z1,

      // Right triangle
      x1, baseRoofY, z0,
      x1, lowY, z1,
      x1, highY, z0,
    ];

    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, roofMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }

  // 5. FLAT ROOF WITH PARAPET WALL (ফ্ল্যাট ছাদ + প্যারাপেট রেলিং)
  const slabGeom = new THREE.BoxGeometry(width, 0.5, depth);
  const slabMesh = new THREE.Mesh(slabGeom, materials.roofConcrete);
  slabMesh.position.set(midX, baseRoofY + 0.25, midZ);
  slabMesh.castShadow = true;
  slabMesh.receiveShadow = true;
  group.add(slabMesh);

  // Parapet Wall (3ft high border railing)
  const parapetHeight = 2.5;
  const parapetThickness = 0.5;
  const parapetMat = materials.wallExterior;

  // North parapet
  const pNorth = new THREE.Mesh(
    new THREE.BoxGeometry(width, parapetHeight, parapetThickness),
    parapetMat
  );
  pNorth.position.set(midX, baseRoofY + 0.5 + parapetHeight / 2, z0 + parapetThickness / 2);
  group.add(pNorth);

  // South parapet
  const pSouth = new THREE.Mesh(
    new THREE.BoxGeometry(width, parapetHeight, parapetThickness),
    parapetMat
  );
  pSouth.position.set(midX, baseRoofY + 0.5 + parapetHeight / 2, z1 - parapetThickness / 2);
  group.add(pSouth);

  // West parapet
  const pWest = new THREE.Mesh(
    new THREE.BoxGeometry(parapetThickness, parapetHeight, depth - parapetThickness * 2),
    parapetMat
  );
  pWest.position.set(x0 + parapetThickness / 2, baseRoofY + 0.5 + parapetHeight / 2, midZ);
  group.add(pWest);

  // East parapet
  const pEast = new THREE.Mesh(
    new THREE.BoxGeometry(parapetThickness, parapetHeight, depth - parapetThickness * 2),
    parapetMat
  );
  pEast.position.set(x1 - parapetThickness / 2, baseRoofY + 0.5 + parapetHeight / 2, midZ);
  group.add(pEast);

  return group;
}
