@echo off
echo Starting AI-Driven Energy Theft System...

echo Starting ML Service on port 8000...
start cmd /k "cd ml_service && pip install -r requirements.txt && python app.py"

echo Starting Backend API on port 5000...
start cmd /k "cd backend && npm install && npm start"

echo Starting Frontend Dev Server on port 5173...
start cmd /k "cd frontend && npm install && npm run dev"

echo All services are starting! 
echo Once they load, you can access the frontend at: http://localhost:5173
pause
