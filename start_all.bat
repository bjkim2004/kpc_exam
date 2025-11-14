@echo off
echo ========================================
echo Starting AI Assessment Platform
echo ========================================
echo.

REM Check if backend directory exists
if not exist backend (
    echo ERROR: backend directory not found!
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist frontend (
    echo ERROR: frontend directory not found!
    pause
    exit /b 1
)

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All servers are starting!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000/docs
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul
