@echo off
echo ========================================
echo Restarting KPC Application (All Servers)
echo ========================================
echo.

REM Kill port 8000 (Backend)
echo [1/4] Stopping Backend (Port 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

REM Kill port 3000 (Frontend)
echo [2/4] Stopping Frontend (Port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

timeout /t 3 /nobreak >nul

REM Start Backend
echo [3/4] Starting Backend Server...
start "KPC Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 5 /nobreak >nul

REM Start Frontend
echo [4/4] Starting Frontend Server...
start "KPC Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Two command windows have been opened.
echo To stop: Close the windows or Ctrl+C
echo.
pause








