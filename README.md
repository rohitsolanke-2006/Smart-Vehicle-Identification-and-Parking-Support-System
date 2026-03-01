# Smart Campus Vehicle Parking Management & Monitoring System

## Team
| Name | Role | Area |
|---|---|---|
| Om Soma (44) | Backend Core | DB, Auth, Zones, Recommendation |
| Subrat Gedam (52) | Backend APIs | Vehicle CRUD, Logs, Analytics |
| Rohit Solanke (43) | Frontend Core | React setup, Student Dashboard |
| Purvas Sontakke (46) | Frontend Pages | Guard Panel, Manager Dashboard |

## Tech Stack
- **Frontend:** React 18 (Vite) + Vanilla CSS
- **Backend:** Python FastAPI + SQLAlchemy
- **Database:** SQLite (dev) / MySQL (prod)
- **Auth:** JWT (python-jose)

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```
Backend runs at **http://localhost:8000** | API docs at **http://localhost:8000/docs**

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

## Demo Credentials
| Role | Email | Password |
|---|---|---|
| Student | student@viit.ac.in | student123 |
| Guard | guard@viit.ac.in | guard123 |
| Manager | manager@viit.ac.in | manager123 |
