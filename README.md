# 3D DESIGN 360° — Web-Based Android-Ready House Planning Studio

**3D DESIGN 360°** is a mobile-first architectural house planning and 3D visualization web application designed specifically for Bangladesh residential contexts, complete with 2D floor drafting, real-time procedural Three.js 3D modeling, material quantity takeoff (BoQ), budget estimation in BDT, and Android APK packaging support via Capacitor.

---

## 🌟 Key Features

### 1. 2D Interactive Floor Plan Editor
- Real architectural coordinate scale (1 unit = 1 foot) with grid and snap-to-grid controls.
- Wall drawing with dynamic dimension labels in Feet & Inches (`14' - 6"`).
- Wall resizing, movable nodes, and selectable thickness (5" internal partition vs 10" external load-bearing wall).
- Room creation (Master Bedroom, Living, Dining, Kitchen, Bath, Toilet, Veranda, Balcony, Prayer Room, Store).
- Door placement with swing arc direction and window placement.
- Movable, rotatable furniture objects (Beds, Sofas, Dining Tables, Almirahs, Kitchen Slabs, Bath fixtures).
- Multi-step Undo / Redo history, Duplicate, and Delete.
- High-resolution 2D Plan PNG export.

### 2. Real-Time 3D House Studio (Three.js)
- Real procedural geometry generated from 2D walls, floor slabs, doors, and windows.
- Realistic wall openings for doors and windows with sill and lintel framing.
- Full OrbitControls navigation: Touch rotate, pinch zoom, pan.
- Camera view presets: Front, Rear, Left, Right, Top (Orthographic Plan), Isometric (3D).
- Smooth 360° auto-turntable spinning view.
- 1st-Person Virtual Walkthrough mode with on-screen virtual navigation D-pad for mobile Android users.
- Cutaway View (interior room visibility) and Hide Roof / Show Roof toggles.
- High-resolution 3D screenshot capture.

### 3. Roof Designer
- Real 3D parametric roof geometry generator:
  - **Gable Roof (দোচালা ছাদ)**
  - **Double-Gable Roof (ঐতিহ্যবাহী চারচালা / চৌচালা ছাদ)**
  - **Hip Roof (হিপ রুফ)**
  - **Single-Slope Mono-Pitch Roof (আধুনিক একচালা শেড)**
  - **Flat Roof with Parapet Railing (ফ্ল্যাট ছাদ + প্যারাপেট দেয়াল)**
- Editable apex height, pitch degrees, overhang (ft), roof materials (Corrugated Tin, Clay Tiles, Concrete, Color Metal Sheets), and colors.

### 4. 12 Authentic Bangladesh House Templates
1. **Small Rural House (ছোট গ্রামীণ বাড়ি — ১ ঘর + বারান্দা)**
2. **Two-Room Tin-Shed House (দুই রুমের টিনশেড বাড়ি)**
3. **Three-Room Tin-Shed House (তিন রুমের আদর্শ টিনের বাড়ি)**
4. **House with Deep Veranda (প্রশস্ত বারান্দাসহ বাড়ি)**
5. **Double-Gable Tin Roof House (ঐতিহ্যবাহী চারচালা টিনের ঘর)**
6. **Single-Slope Roof House (আধুনিক একচালা বাড়ি)**
7. **Modern RCC Concrete House (আধুনিক আরসিসি পাকা একতলা বাড়ি)**
8. **Two-Storey Duplex House (ডুপ্লেক্স দোতলা বাড়ি)**
9. **House with Separate Kitchen (আলাদা পাকঘর ও গোসলখানাসহ বাড়ি)**
10. **Courtyard House (আঙিনাসহ ঐতিহ্যবাহী উঠান বাড়ি)**
11. **House with Landscaped Garden (সামনে বাগানসহ শৌখিন বাড়ি)**
12. **House with Attached Cowshed / Farm (গোয়ালঘর ও খামার সংলগ্ন গ্রামীণ বাড়ি)**

### 5. Construction & Material Takeoff Calculator (BoQ)
- Standards-based calculation for Bangladeshi residential construction:
  - First-class bricks (5" wall = 5 bricks/sqft; 10" wall = 10 bricks/sqft + foundation/soling allowance).
  - Portland cement (50kg bags) for brickwork mortar (1:6), plastering (1:4), and RCC concrete slabs (1:2:4).
  - Coarse and local sand (cft).
  - Brick khoa / stone coarse aggregate (cft).
  - 60-Grade Mild Steel Rebar (kg).
  - Ceramic floor & wall tiles (sq ft).
  - Interior and exterior weather-coat paint (liters).
  - Corrugated CI roofing sheets (bundles).
  - Door and window counts.
  - Masonry and finishing labor charges.
- User-editable local market unit rates.
- Professional Architectural Specification & BoQ Report Export to PDF (`.pdf`).

### 6. Storage & Compatibility
- **IndexedDB**: Persistent local storage for unlimited house plan projects with autosave.
- **JSON Export & Import**: Backup `.json` files and restore projects anytime.
- **PWA**: Installable web application with offline caching service worker and Web App Manifest.
- **Bilingual**: Bengali (বাংলা) by default, with English toggle.
- **Light & Dark Theme**: Full Navy blue / Slate dark mode and crisp architectural light mode.

---

## 🛠️ Technology Stack

- **Framework**: React 19, TypeScript
- **Bundler**: Vite 8
- **3D Engine**: Three.js (r160+)
- **Styling**: Tailwind CSS v4
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **Local Database**: IndexedDB

---

## 🚀 Development & Build Instructions

### Local Development:
```bash
npm install
npm run dev
```
App runs locally on `http://localhost:3000`.

### Production Build:
```bash
npm run build
```
Generates production assets in the `/dist` directory.

---

## 🌐 Netlify Deployment

1. Push this repository to GitHub.
2. In Netlify, click **Add new site** > **Import an existing project** > **GitHub**.
3. Select your repository.
4. Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. The included `netlify.toml` automatically configures SPA routing and security headers. Click **Deploy Site**.

---

## 📱 Android APK Packaging (Capacitor)

To wrap this application into a native Android APK:

1. **Install Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/android
   npm install -D @capacitor/cli
   ```

2. **Initialize Capacitor:**
   ```bash
   npx cap init "3D DESIGN 360" "com.architecture360.app" --web-dir dist
   ```

3. **Add Android Platform:**
   ```bash
   npx cap add android
   ```

4. **Build Web Assets & Sync to Android:**
   ```bash
   npm run build
   npx cap sync
   ```

5. **Open in Android Studio & Build APK:**
   ```bash
   npx cap open android
   ```
   In Android Studio:
   - Go to **Build** > **Generate Signed Bundle / APK**
   - Select **APK**
   - Create your keystore or select debug keystore
   - Click **Finish** to generate the distributable `.apk` file!
