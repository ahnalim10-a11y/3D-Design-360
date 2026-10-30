/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Furniture } from '../types';

export function createFurnitureMesh(furniture: Furniture): THREE.Group {
  const group = new THREE.Group();
  group.name = `furniture_${furniture.id}`;

  const { type, width: w, depth: d, height: h } = furniture;

  // Pivot at bottom center (Y = 0 is ground)
  switch (type) {
    case 'bed_king':
    case 'bed_single': {
      // 1. Bed wooden frame base
      const frameGeom = new THREE.BoxGeometry(w, 0.4, d);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x5C3A21, roughness: 0.6 });
      const frame = new THREE.Mesh(frameGeom, woodMat);
      frame.position.set(0, 0.3, 0);
      frame.castShadow = true;
      group.add(frame);

      // 2. 4 Wooden legs
      const legGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.3, 8);
      const legPositions = [
        [-w / 2 + 0.2, 0.15, -d / 2 + 0.2],
        [w / 2 - 0.2, 0.15, -d / 2 + 0.2],
        [-w / 2 + 0.2, 0.15, d / 2 - 0.2],
        [w / 2 - 0.2, 0.15, d / 2 - 0.2],
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeom, woodMat);
        leg.position.set(lx, ly, lz);
        group.add(leg);
      });

      // 3. Mattress
      const mattressGeom = new THREE.BoxGeometry(w - 0.2, 0.7, d - 0.3);
      const mattressMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.8 });
      const mattress = new THREE.Mesh(mattressGeom, mattressMat);
      mattress.position.set(0, 0.8, 0.1);
      mattress.castShadow = true;
      group.add(mattress);

      // 4. Headboard
      const headboardGeom = new THREE.BoxGeometry(w, 2.2, 0.25);
      const headboard = new THREE.Mesh(headboardGeom, woodMat);
      headboard.position.set(0, 1.4, -d / 2 + 0.12);
      headboard.castShadow = true;
      group.add(headboard);

      // 5. Pillows
      const pillowGeom = new THREE.BoxGeometry(w * 0.35, 0.25, 1.2);
      const pillowMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.7 });
      const p1 = new THREE.Mesh(pillowGeom, pillowMat);
      p1.position.set(-w * 0.25, 1.25, -d / 2 + 1.0);
      group.add(p1);

      if (type === 'bed_king') {
        const p2 = new THREE.Mesh(pillowGeom, pillowMat);
        p2.position.set(w * 0.25, 1.25, -d / 2 + 1.0);
        group.add(p2);
      }

      // 6. Quilt blanket fold
      const quiltGeom = new THREE.BoxGeometry(w - 0.15, 0.1, d * 0.55);
      const quiltMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.6 });
      const quilt = new THREE.Mesh(quiltGeom, quiltMat);
      quilt.position.set(0, 1.2, d * 0.2);
      group.add(quilt);
      break;
    }

    case 'sofa_3seater':
    case 'sofa_lshape': {
      const sofaMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 });
      const accentMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.7 });

      // 1. Base frame
      const baseGeom = new THREE.BoxGeometry(w, 0.4, d);
      const base = new THREE.Mesh(baseGeom, sofaMat);
      base.position.set(0, 0.3, 0);
      base.castShadow = true;
      group.add(base);

      // 2. Seat cushions
      const seatCount = 3;
      const cushionW = (w - 0.8) / seatCount;
      for (let i = 0; i < seatCount; i++) {
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(cushionW - 0.05, 0.45, d - 0.6), sofaMat);
        cushion.position.set(-w / 2 + 0.4 + (i + 0.5) * cushionW, 0.7, 0.15);
        cushion.castShadow = true;
        group.add(cushion);
      }

      // 3. Backrest
      const backGeom = new THREE.BoxGeometry(w, 1.8, 0.5);
      const back = new THREE.Mesh(backGeom, sofaMat);
      back.position.set(0, 1.4, -d / 2 + 0.25);
      back.castShadow = true;
      group.add(back);

      // 4. Armrests (left and right)
      const armGeom = new THREE.BoxGeometry(0.4, 1.2, d);
      const armL = new THREE.Mesh(armGeom, sofaMat);
      armL.position.set(-w / 2 + 0.2, 1.0, 0);
      group.add(armL);

      const armR = new THREE.Mesh(armGeom, sofaMat);
      armR.position.set(w / 2 - 0.2, 1.0, 0);
      group.add(armR);

      // 5. Throw pillows
      const throw1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.25), accentMat);
      throw1.position.set(-w / 2 + 0.7, 1.1, -d / 2 + 0.6);
      throw1.rotation.y = 0.3;
      group.add(throw1);

      const throw2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.25), accentMat);
      throw2.position.set(w / 2 - 0.7, 1.1, -d / 2 + 0.6);
      throw2.rotation.y = -0.3;
      group.add(throw2);
      break;
    }

    case 'dining_table': {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.5 });
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.6 });

      // 1. Table top
      const topGeom = new THREE.BoxGeometry(w, 0.15, d);
      const top = new THREE.Mesh(topGeom, woodMat);
      top.position.set(0, 2.5, 0);
      top.castShadow = true;
      group.add(top);

      // 2. 4 Table legs
      const legGeom = new THREE.CylinderGeometry(0.12, 0.1, 2.4, 8);
      const tableLegs = [
        [-w / 2 + 0.3, 1.2, -d / 2 + 0.3],
        [w / 2 - 0.3, 1.2, -d / 2 + 0.3],
        [-w / 2 + 0.3, 1.2, d / 2 - 0.3],
        [w / 2 - 0.3, 1.2, d / 2 - 0.3],
      ];
      tableLegs.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeom, woodMat);
        leg.position.set(lx, ly, lz);
        group.add(leg);
      });

      // 3. 4 Dining Chairs placed around table
      const chairOffsets = [
        [-w * 0.25, 0, -d / 2 - 0.8],
        [w * 0.25, 0, -d / 2 - 0.8],
        [-w * 0.25, 0, d / 2 + 0.8],
        [w * 0.25, 0, d / 2 + 0.8],
      ];
      chairOffsets.forEach(([cx, cy, cz]) => {
        const chair = new THREE.Group();
        // seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.2), chairMat);
        seat.position.set(0, 1.5, 0);
        chair.add(seat);
        // legs
        const clGeom = new THREE.CylinderGeometry(0.06, 0.05, 1.45, 6);
        [[-0.5, 0.75, -0.5], [0.5, 0.75, -0.5], [-0.5, 0.75, 0.5], [0.5, 0.75, 0.5]].forEach(([px, py, pz]) => {
          const l = new THREE.Mesh(clGeom, chairMat);
          l.position.set(px, py, pz);
          chair.add(l);
        });
        // backrest
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.1), chairMat);
        back.position.set(0, 2.2, cz < 0 ? -0.55 : 0.55);
        chair.add(back);

        chair.position.set(cx, cy, cz);
        group.add(chair);
      });
      break;
    }

    case 'wardrobe': {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.6 });
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.2 });

      // Main cabinet body
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), woodMat);
      body.position.set(0, h / 2, 0);
      body.castShadow = true;
      group.add(body);

      // Crown moulding top
      const topCrown = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.2, d + 0.2), woodMat);
      topCrown.position.set(0, h + 0.1, 0);
      group.add(topCrown);

      // Door division line
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.04, h - 0.4, 0.02), new THREE.MeshBasicMaterial({ color: 0x1A0F0A }));
      line.position.set(0, h / 2, d / 2 + 0.01);
      group.add(line);

      // Chrome handles
      const handleGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
      const h1 = new THREE.Mesh(handleGeom, handleMat);
      h1.position.set(-0.25, h * 0.5, d / 2 + 0.05);
      group.add(h1);

      const h2 = new THREE.Mesh(handleGeom, handleMat);
      h2.position.set(0.25, h * 0.5, d / 2 + 0.05);
      group.add(h2);
      break;
    }

    case 'kitchen_counter': {
      const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const counterMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.2, metalness: 0.1 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.9, roughness: 0.1 });

      // 1. Lower cabinet
      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(w, 2.7, d), cabinetMat);
      cabinet.position.set(0, 1.35, 0);
      cabinet.castShadow = true;
      group.add(cabinet);

      // 2. Marble Countertop
      const counterTop = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, 0.15, d + 0.15), counterMat);
      counterTop.position.set(0, 2.75, 0);
      counterTop.castShadow = true;
      group.add(counterTop);

      // 3. Stainless steel sink basin cutout
      const sink = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.02, 1.4), chromeMat);
      sink.position.set(0.5, 2.84, 0);
      group.add(sink);

      // 4. Gooseneck Faucet
      const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), chromeMat);
      faucet.position.set(0.5, 3.15, -0.5);
      group.add(faucet);
      break;
    }

    case 'commode': {
      const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.1 });

      // Base pedestal & bowl
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 1.4, 16), ceramicMat);
      bowl.position.set(0, 0.7, 0.2);
      bowl.castShadow = true;
      group.add(bowl);

      // Tank cistern
      const tank = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.6), ceramicMat);
      tank.position.set(0, 1.6, -0.4);
      tank.castShadow = true;
      group.add(tank);

      // Flush button
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8), chromeMat);
      btn.position.set(0, 2.33, -0.4);
      group.add(btn);
      break;
    }

    case 'staircase': {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.6 });
      const railMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.7, roughness: 0.3 });

      const stepsCount = 12;
      const stepH = 10 / stepsCount;
      const stepD = d / stepsCount;

      for (let i = 0; i < stepsCount; i++) {
        const tread = new THREE.Mesh(new THREE.BoxGeometry(w, stepH * 0.8, stepD * 1.1), woodMat);
        tread.position.set(0, (i + 0.5) * stepH, -d / 2 + (i + 0.5) * stepD);
        tread.castShadow = true;
        group.add(tread);
      }

      // Handrail beam
      const handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, Math.hypot(10, d), 8), railMat);
      handrail.position.set(w / 2 - 0.1, 5 + 2.5, 0);
      handrail.rotation.x = Math.atan2(d, 10);
      group.add(handrail);
      break;
    }

    case 'tree': {
      const barkMat = new THREE.MeshStandardMaterial({ color: 0x5C3A21, roughness: 0.9 });
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.8 });
      const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.8 });

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 5, 8), barkMat);
      trunk.position.set(0, 2.5, 0);
      trunk.castShadow = true;
      group.add(trunk);

      // Layer 1 Canopy
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(w * 0.7, 5, 8), foliageMat);
      c1.position.set(0, 5.5, 0);
      c1.castShadow = true;
      group.add(c1);

      // Layer 2 Canopy
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(w * 0.55, 4.5, 8), foliageMat2);
      c2.position.set(0, 8.0, 0);
      c2.castShadow = true;
      group.add(c2);

      // Layer 3 Canopy
      const c3 = new THREE.Mesh(new THREE.ConeGeometry(w * 0.4, 3.5, 8), foliageMat);
      c3.position.set(0, 10.5, 0);
      c3.castShadow = true;
      group.add(c3);
      break;
    }

    case 'car': {
      const carPaint = new THREE.MeshStandardMaterial({ color: 0x0284C7, metalness: 0.8, roughness: 0.2 });
      const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0F172A, roughness: 0.1, transmission: 0.5, transparent: true });
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.9 });

      // Body lower hull
      const hull = new THREE.Mesh(new THREE.BoxGeometry(w, 1.4, d), carPaint);
      hull.position.set(0, 1.1, 0);
      hull.castShadow = true;
      group.add(hull);

      // Cabin
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 1.2, d * 0.5), glassMat);
      cabin.position.set(0, 2.2, -0.2);
      cabin.castShadow = true;
      group.add(cabin);

      // 4 Wheels
      const tireGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.4, 16);
      tireGeom.rotateZ(Math.PI / 2);
      [
        [-w / 2, 0.65, -d * 0.3],
        [w / 2, 0.65, -d * 0.3],
        [-w / 2, 0.65, d * 0.3],
        [w / 2, 0.65, d * 0.3],
      ].forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(tireGeom, tireMat);
        wheel.position.set(wx, wy, wz);
        group.add(wheel);
      });
      break;
    }

    default: {
      // Clean fallback composite box with wooden tone
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 })
      );
      box.position.set(0, h / 2, 0);
      box.castShadow = true;
      group.add(box);
      break;
    }
  }

  // Position and rotate
  group.position.set(furniture.position.x, 0, furniture.position.y);
  group.rotation.y = (furniture.rotation * Math.PI) / 180;

  return group;
}
