/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Project, Wall, Door, WindowItem } from '../types';
import { MaterialLibrary } from './materials';
import { buildRoofGeometry } from './roofBuilder';
import { createFurnitureMesh } from './furnitureModels';

export function buildArchitecturalScene(
  project: Project,
  materials: MaterialLibrary,
  options?: { cutaway?: boolean }
): THREE.Group {
  const root = new THREE.Group();
  root.name = 'architectural_root';

  const defaultWallHeight = 10.0;
  const cutaway = options?.cutaway ?? false;
  const effectiveWallHeight = cutaway ? 4.5 : defaultWallHeight;

  // Compute building bounding box for floor slab and roof
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

  // 1. TERRAIN & PLINTH GROUND SLAB
  const terrainMargin = 25;
  const terrainWidth = maxX - minX + terrainMargin * 2;
  const terrainDepth = maxZ - minZ + terrainMargin * 2;

  // Outdoor Grass
  const grassGeom = new THREE.PlaneGeometry(terrainWidth, terrainDepth);
  grassGeom.rotateX(-Math.PI / 2);
  const grassMesh = new THREE.Mesh(grassGeom, materials.terrainGrass);
  grassMesh.position.set((minX + maxX) / 2, -0.05, (minZ + maxZ) / 2);
  grassMesh.receiveShadow = true;
  root.add(grassMesh);

  // Plinth Base Slab (raised foundation common in Bangladesh for flood safety)
  const plinthGeom = new THREE.BoxGeometry(
    maxX - minX + 3.0,
    0.6,
    maxZ - minZ + 3.0
  );
  const plinthMesh = new THREE.Mesh(
    plinthGeom,
    new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.9 })
  );
  plinthMesh.position.set((minX + maxX) / 2, 0.3, (minZ + maxZ) / 2);
  plinthMesh.receiveShadow = true;
  root.add(plinthMesh);

  // 2. ROOM FLOORS
  project.rooms.forEach((room) => {
    if (room.points.length >= 3) {
      const shape = new THREE.Shape();
      shape.moveTo(room.points[0].x, room.points[0].y);
      for (let i = 1; i < room.points.length; i++) {
        shape.lineTo(room.points[i].x, room.points[i].y);
      }
      shape.closePath();

      const geom = new THREE.ShapeGeometry(shape);
      geom.rotateX(Math.PI / 2); // align to XZ plane

      const floorMat = room.floorColor
        ? new THREE.MeshStandardMaterial({
            color: new THREE.Color(room.floorColor),
            roughness: 0.3,
            metalness: 0.1,
          })
        : materials.floorTile;

      const floorMesh = new THREE.Mesh(geom, floorMat);
      floorMesh.position.set(0, 0.62, 0); // slightly above plinth
      floorMesh.receiveShadow = true;
      root.add(floorMesh);
    }
  });

  // 3. WALLS WITH OPENINGS FOR DOORS AND WINDOWS
  project.walls.forEach((wall) => {
    const p1 = wall.start;
    const p2 = wall.end;
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (len < 0.5) return;

    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const thickness = (wall.thickness || 10) / 12; // convert inches to feet
    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.y + p2.y) / 2;
    const wallH = cutaway ? 4.5 : (wall.height || defaultWallHeight);

    // Find doors and windows located along this wall
    const wallDoors = project.doors.filter((d) => {
      // Check if door is within 1.5 ft of this wall segment
      const dist = pointToSegmentDist(d.position, p1, p2);
      return dist <= 1.5;
    });

    const wallWindows = project.windows.filter((wn) => {
      const dist = pointToSegmentDist(wn.position, p1, p2);
      return dist <= 1.5;
    });

    if (wallDoors.length === 0 && wallWindows.length === 0) {
      // Solid Wall
      const wallGeom = new THREE.BoxGeometry(len, wallH, thickness);
      const wallMesh = new THREE.Mesh(
        wallGeom,
        wall.thickness >= 10 ? materials.wallExterior : materials.wallInterior
      );
      wallMesh.position.set(midX, wallH / 2 + 0.6, midZ);
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      root.add(wallMesh);
    } else {
      // Wall with Openings: Build segments
      const wallGroup = new THREE.Group();
      wallGroup.position.set(p1.x, 0.6, p1.y);
      wallGroup.rotation.y = -angle;

      // Calculate openings along the wall axis (0 to len)
      interface Opening {
        uStart: number;
        uEnd: number;
        type: 'door' | 'window';
        item: Door | WindowItem;
      }
      const openings: Opening[] = [];

      wallDoors.forEach((d) => {
        const u = projectPointOntoLine(d.position, p1, p2);
        const halfW = (d.width || 3.25) / 2;
        openings.push({
          uStart: Math.max(0, u - halfW),
          uEnd: Math.min(len, u + halfW),
          type: 'door',
          item: d,
        });
      });

      wallWindows.forEach((wn) => {
        const u = projectPointOntoLine(wn.position, p1, p2);
        const halfW = (wn.width || 4) / 2;
        openings.push({
          uStart: Math.max(0, u - halfW),
          uEnd: Math.min(len, u + halfW),
          type: 'window',
          item: wn,
        });
      });

      // Sort openings by start position
      openings.sort((a, b) => a.uStart - b.uStart);

      let currentU = 0;
      const wallMat = wall.thickness >= 10 ? materials.wallExterior : materials.wallInterior;

      openings.forEach((op) => {
        // 1. Solid wall section before opening
        if (op.uStart > currentU + 0.1) {
          const segLen = op.uStart - currentU;
          const seg = new THREE.Mesh(
            new THREE.BoxGeometry(segLen, wallH, thickness),
            wallMat
          );
          seg.position.set(currentU + segLen / 2, wallH / 2, 0);
          seg.castShadow = true;
          seg.receiveShadow = true;
          wallGroup.add(seg);
        }

        const opWidth = op.uEnd - op.uStart;
        const opCenterU = op.uStart + opWidth / 2;

        if (op.type === 'door') {
          // Door opening: lintel above door
          const doorH = Math.min((op.item as Door).height || 7, wallH - 0.5);
          if (wallH > doorH) {
            const lintelH = wallH - doorH;
            const lintel = new THREE.Mesh(
              new THREE.BoxGeometry(opWidth, lintelH, thickness),
              wallMat
            );
            lintel.position.set(opCenterU, doorH + lintelH / 2, 0);
            lintel.castShadow = true;
            wallGroup.add(lintel);
          }
        } else {
          // Window opening: sill below and lintel above
          const sillH = Math.min((op.item as WindowItem).sillHeight || 2.5, wallH - 2);
          const winH = Math.min((op.item as WindowItem).height || 4.5, wallH - sillH - 0.5);

          // Sill below window
          const sill = new THREE.Mesh(
            new THREE.BoxGeometry(opWidth, sillH, thickness),
            wallMat
          );
          sill.position.set(opCenterU, sillH / 2, 0);
          sill.castShadow = true;
          wallGroup.add(sill);

          // Lintel above window
          const topH = wallH - (sillH + winH);
          if (topH > 0.2) {
            const lintel = new THREE.Mesh(
              new THREE.BoxGeometry(opWidth, topH, thickness),
              wallMat
            );
            lintel.position.set(opCenterU, sillH + winH + topH / 2, 0);
            lintel.castShadow = true;
            wallGroup.add(lintel);
          }
        }

        currentU = op.uEnd;
      });

      // Final solid segment after last opening
      if (currentU < len - 0.1) {
        const segLen = len - currentU;
        const seg = new THREE.Mesh(
          new THREE.BoxGeometry(segLen, wallH, thickness),
          wallMat
        );
        seg.position.set(currentU + segLen / 2, wallH / 2, 0);
        seg.castShadow = true;
        seg.receiveShadow = true;
        wallGroup.add(seg);
      }

      root.add(wallGroup);
    }
  });

  // 4. DOORS (3D Frames & Leaves)
  project.doors.forEach((door) => {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(door.position.x, 0.6, door.position.y);
    doorGroup.rotation.y = -(door.rotation * Math.PI) / 180;

    const dw = door.width || 3.25;
    const dh = door.height || 7.0;

    // Wood Door leaf
    const leafGeom = new THREE.BoxGeometry(dw - 0.2, dh - 0.1, 0.15);
    const leaf = new THREE.Mesh(leafGeom, materials.doorWood);
    leaf.position.set(0, dh / 2, 0);
    leaf.castShadow = true;
    doorGroup.add(leaf);

    // Chrome door handle
    const handleGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, metalness: 0.9, roughness: 0.2 });
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.set(dw / 2 - 0.4, dh * 0.48, 0.12);
    doorGroup.add(handle);

    root.add(doorGroup);
  });

  // 5. WINDOWS (Frames & Reflective Glass)
  project.windows.forEach((win) => {
    const winGroup = new THREE.Group();
    const sillH = win.sillHeight || 2.5;
    const winH = win.height || 4.5;
    const winW = win.width || 4.0;

    winGroup.position.set(win.position.x, 0.6 + sillH + winH / 2, win.position.y);
    winGroup.rotation.y = -(win.rotation * Math.PI) / 180;

    // Outer frame
    const frameGeom = new THREE.BoxGeometry(winW, winH, 0.25);
    const frame = new THREE.Mesh(frameGeom, materials.windowFrame);
    winGroup.add(frame);

    // Glass panel
    const glassGeom = new THREE.BoxGeometry(winW - 0.3, winH - 0.3, 0.05);
    const glass = new THREE.Mesh(glassGeom, materials.glass);
    winGroup.add(glass);

    // Window mullion grid bars
    const barMat = materials.windowFrame;
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, winH - 0.2, 0.08), barMat);
    winGroup.add(vBar);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(winW - 0.2, 0.08, 0.08), barMat);
    winGroup.add(hBar);

    root.add(winGroup);
  });

  // 6. FURNITURE (Procedural Composite Meshes)
  project.furniture.forEach((furn) => {
    const mesh = createFurnitureMesh(furn);
    // Adjust Y position above plinth slab
    mesh.position.y += 0.6;
    root.add(mesh);
  });

  // 7. ROOF GEOMETRY
  if (!cutaway && project.roof.showRoof) {
    const roofBounds = {
      minX,
      maxX,
      minZ,
      maxZ,
      wallHeight: defaultWallHeight + 0.6,
    };
    const roofGroup = buildRoofGeometry(project.roof, roofBounds, materials);
    root.add(roofGroup);
  }

  return root;
}

// Distance from point to line segment
function pointToSegmentDist(
  pt: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(pt.x - p1.x, pt.y - p1.y);

  let t = ((pt.x - p1.x) * dx + (pt.y - p1.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;
  return Math.hypot(pt.x - projX, pt.y - projY);
}

// Projection scalar along line segment (0 to length)
function projectPointOntoLine(
  pt: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return 0;
  const t = ((pt.x - p1.x) * dx + (pt.y - p1.y) * dy) / (len * len);
  return Math.max(0, Math.min(len, t * len));
}
