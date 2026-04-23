# Smart Campus Vehicle Parking Management System

## Pre-Computation Context (For AI Agents)
**Read this entirely before suggesting any code changes or writing new features.** 
This document defines the exact architecture, design philosophy, database schema, and future roadmap of the project.

---

## 1. Project Overview
A full-stack web application designed for a Software Engineering Course Project (Phase 2). It manages vehicle parking on a college campus (VIT Bibwewadi) with specific roles for Students, Security Guards, and Managers to view capacity, record entries/exits, and analyze traffic.

- **Frontend:** React + Vite (Port `5173`)
- **Backend:** Python + FastAPI (Port `8000`)
- **Database:** Relational SQL (SQLAlchemy ORM + SQLite during dev/MySQL in prod)
- **Styling:** Pure CSS (`index.css`) with a strictly enforced **Minimalist Enterprise Light Theme**. (No Tailwind, No Dark Mode, No Neon Glassmorphism).

---

## 2. Core Architecture & Tech Stack

### Backend (`/backend`)
- **Entry Point:** `app/main.py`
- **Database:** `app/database.py` (SessionLocal, Base)
- **Models:**
  - `User`: Handles Students, Guards, and Managers (Role-based access).
  - `ParkingZone`: `id`, `zone_name`, `capacity`, `occupied`, `status` (computed property).
  - `Vehicle`: Tracks active vehicles parked (`reg_no`, `zone_id`, `entry_time`, `is_mis_parked`).
  - `ParkingLog`: Historical ledger of all ENTRY/EXIT actions.
- **Routers:**
  - `/api/auth/login`: JWT-based authentication.
  - `/api/zones/`: Zone CRUD and live occupancy fetching.
  - `/api/vehicles/`: Guard entry/exit actions. Calculates availability.
  - `/api/recommendation/`: Basic algorithm finding the zone with highest `(capacity - occupied)`.
  - `/api/logs/`: Manager analytics.
- **Seeding:** Run `python -m app.seed` to wipe and recreate the 5 standard campus zones and demo users.

### Frontend (`/frontend`)
- **Routing:** `<ProtectedRoute>` wrappers in `App.jsx` checking the `AuthContext` JWT token.
- **Key Components:**
  - `CampusMap.jsx`: **CRITICAL FEATURE.** An interactive, hand-coded SVG map of the campus. 5 distinct polygon zones (Zone A through E). It maps to backend zone names and updates its colors live based on occupancy (Green/Yellow/Red) with hover tooltips.
  - `ZoneCard.jsx`: Simple metric cards displaying a progress bar of zone occupancy.
  - `Dashboard.jsx`: The primary Student view containing the Recommendation Banner and the `CampusMap`.
- **CSS Philosophy:** `index.css` drives the app. Variables like `--bg-main: #f8fafc`, `--border-color: #e2e8f0`, `--status-green: #10b981`. Do not use thick drop shadows or emojis.

---

## 3. Current State & Recent Changes
1. **Re-Theming Complete:** The UI was shifted from an "AI-generated glassmorphism" look to a clean, professional, flat enterprise UI.
2. **Interactive Map Complete:** Replaced static zone lists with `CampusMap.jsx`.
3. **Seed Data:** Database is seeded with 5 real-world locations:
   - `Zone A – Main Gate Bikes` (Capacity: 80)
   - `Zone B – Upper Campus Bikes` (Capacity: 60)
   - `Zone C – Central Car Parking` (Capacity: 40)
   - `Zone D – VIT Block Bikes` (Capacity: 70)
   - `Zone E – Canteen Bikes` (Capacity: 50)
4. **UML Diagrams:** Inside the `../files/` directory, there are 9 `.drawio` XML files. The main 5 diagrams (`01_use_case`, `02_class`, `04_sequence`, `07_component`, `08_deployment`) have been mathematically injected with advanced "Wow Factor" components (ANPR, Mock RTO API, ML Predicton) to show a highly scalable architecture to professors.

---

## 4. Upcoming "Wow Factor" Roadmap (TODO)
If the human requests to "Build the next Wow Factor", pick from this list. These features are already injected into the UML diagrams and just need actual code implementation:

### Phase 2.1: Computer Vision (ANPR) Integration
- **Goal:** Automate the Guard's manual entry of license plates.
- **Spec:** A Python script utilizing `OpenCV` and `EasyOCR` (or a mock API for demonstration) that simulates a camera scanning a plate. The backend should expose `/api/vision/scan` which the frontend Guard Dashboard can call by clicking a "Scan Camera" button.

### Phase 2.2: Event-Driven Real-Time Map (WebSockets)
- **Goal:** Remove the 15-second `setInterval` polling in `Dashboard.jsx`.
- **Spec:** Refactor FastAPI to implement `websockets`. Create a `simulation.py` script that randomly triggers vehicle ENTRY/EXIT events. As vehicles move, the `CampusMap.jsx` SVG polygons should flash and change colors instantly without page reloads.

### Phase 2.3: Mock RTO Microservice
- **Goal:** Show Microservice Architecture competency.
- **Spec:** Create a secondary, isolated FastAPI server (running on Port `8001`) that acts as the "Government VAHAN API". When a vehicle enters, the main backend asynchronously calls this mock server to verify the vehicle's model and insurance status before allowing entry. 

### Phase 2.4: Machine Learning Predictor
- **Goal:** Move from static recommendations to predictive analytics.
- **Spec:** Train a lightweight Scikit-Learn model (`.pkl`) on historical log data. The `/api/recommendation/` endpoint should use this model to predict which zone will have free space 15 minutes from the current time.

---

## 5. Development Commands
- **Start Backend:**
  ```bash
  cd backend
  venv\Scripts\activate
  uvicorn app.main:app --reload --port 8000
  ```
- **Reset Database (Seed):**
  ```bash
  cd backend
  venv\Scripts\activate
  python -m app.seed
  ```
- **Start Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```

## 6. Known Demo Accounts
- **Student:** `om@vit.edu` / `testpass123`
- **Guard:** `guard@vit.edu` / `testpass123`
- **Manager:** `manager@vit.edu` / `testpass123`
