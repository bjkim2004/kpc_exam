@echo off
echo ========================================
echo Restarting KPC Backend Server
echo ========================================
echo.

REM Kill all Python processes on port 8000
echo Stopping existing backend processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
cd backend

REM Activate virtual environment if exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Start backend
echo.
echo Backend URL: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause






