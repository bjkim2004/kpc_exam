@echo off
echo ========================================
echo KPC Application Setup
echo ========================================
echo.

echo This script will:
echo   1. Check system requirements
echo   2. Install dependencies
echo   3. Configure environment variables
echo.
pause

REM Check Python
echo.
echo [1/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)
python --version

REM Check Node.js
echo.
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
node --version

REM Install backend dependencies
echo.
echo [3/4] Installing backend dependencies...
cd backend
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo.
echo [4/4] Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies!
    cd ..
    pause
    exit /b 1
)
cd ..

REM Set up environment files
echo.
echo Setting up environment variables...
if not exist backend\.env (
    echo Creating backend\.env from env.example...
    copy backend\env.example backend\.env
    echo.
    echo IMPORTANT: Please edit backend\.env with your settings!
    echo You need to set:
    echo   - SECRET_KEY (generate a random secret)
    echo   - DATABASE_URL (if not using default)
    echo   - OPENAI_API_KEY (for AI features)
    echo   - ANTHROPIC_API_KEY (for AI features)
    echo.
) else (
    echo backend\.env already exists, skipping...
)

if not exist frontend\.env.local (
    echo Creating frontend\.env.local...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > frontend\.env.local
    echo Created frontend\.env.local
) else (
    echo frontend\.env.local already exists, skipping...
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit backend\.env with your Supabase database URL and API keys
echo   2. Make sure Supabase is configured and accessible
echo   3. Start all services: start_all.bat
echo.
echo Database connection string format (Supabase):
echo   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
echo.
pause


