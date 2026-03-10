# AI-Driven Energy Theft & Anomaly Detection System

Detect suspicious electricity consumption patterns using Isolation Forest anomaly detection, SHAP explainability, and AI-powered explanations.

## Architecture

```
frontend (React/Vite)  →  backend (Node/Express)  →  ai-service (Python/FastAPI)
     :5173                     :5000                       :8000
```

## Features

- **CSV Upload** — Upload smart meter electricity data
- **AI Anomaly Detection** — Isolation Forest with 0-100 risk scoring
- **SHAP Explainability** — Feature importance for each flagged meter
- **AI Explanations** — Natural language investigation summaries
- **Dashboard** — Stats cards, risk score cards, consumption charts
- **Geo Heatmap** — Leaflet map with color-coded meter locations
- **Investigation Reports** — Per-meter detailed analysis
- **Fraud Simulation** — One-click demo with synthetic anomalies

## Quick Start

### 1. Generate Sample Data (optional)
```bash
cd data
python generate_data.py
```

### 2. Start AI Service (Python)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Start Backend (Node.js)
```bash
cd backend
npm install
node server.js
```

### 4. Start Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### 5. Use the App
1. Open `http://localhost:5173`
2. Upload `data/sample_meter_data.csv` or click "Simulate Fraud Demo"
3. View the analysis dashboard

## Dataset Format

CSV with columns:
| Column | Type | Description |
|--------|------|-------------|
| meter_id | string | Unique meter identifier |
| timestamp | datetime | Reading timestamp |
| consumption_kwh | float | Electricity consumption |
| latitude | float | GPS latitude |
| longitude | float | GPS longitude |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Chart.js, Leaflet |
| Backend | Node.js, Express, Multer, Axios |
| AI Service | FastAPI, scikit-learn, SHAP, pandas, numpy |
| Model | Isolation Forest |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload CSV dataset |
| POST | `/api/detect` | Run anomaly detection |
| GET | `/api/report/:meter_id` | Get investigation report |
| POST | `/analyze` (AI service) | Full AI pipeline |
