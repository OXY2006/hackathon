# AI-Driven Energy Theft & Anomaly Detection System

Electricity theft causes massive financial loss and grid instability. This system analyzes smart meter electricity consumption data and uses AI to detect anomalies and potential theft.

The user uploads electricity consumption data and the system predicts whether it is normal or suspicious.

## Project Structure
- `frontend/`: React application built with Vite and Tailwind CSS.
- `backend/`: Node.js + Express server for handling uploads and routing to ML service.
- `ml_service/`: Python FastAPI service that loads and runs the trained model.
- `models/`: Trained model files (`.pkl`), scaler, imputer, and `model_config.json`.

## Setup Instructions

### Pre-requisites
- Node.js (v18+)
- Python 3.9+
- pip (Python package manager)

---

## 1. How to run ML Service

The ML service is a FastAPI application that performs inference using the pre-trained pickled scikit-learn model.

1. Open a terminal and navigate to the `ml_service` directory:
   ```bash
   cd ml_service
   ```
2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the service:
   ```bash
   python app.py
   ```
   *The service will run on http://localhost:8000.*

---

## 2. How to run Backend

The backend is a Node.js Express server that interfaces between the React frontend and the Python ML service.

1. Open a new terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *(For development with auto-restart, you can run `npm run dev`)*
   
   *The server will run on http://localhost:5000.*

---

## 3. How to run Frontend

The frontend is a React application built with Vite and Tailwind CSS.

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on http://localhost:5173.*

## Usage
1. Ensure all three services are running concurrently.
2. Open the frontend URL in your browser.
3. Use the "Upload Data" page to upload a CSV file with electricity usage data (like `Electricity_Theft_Data.csv`).
4. View the analysis results on the "Prediction Page".
