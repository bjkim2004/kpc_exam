@echo off
echo ========================================
echo Starting Backend Server (FastAPI)
echo ========================================
echo.

cd backend

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Creating .env from env.example...
    copy env.example .env
    echo.
    echo Please edit backend\.env with your settings before running again.
    echo.
    pause
    exit /b 1
)

echo Checking database connection...
echo.

REM Run database migrations
echo Running database migrations...
alembic upgrade head
if errorlevel 1 (
    echo.
    echo ERROR: Database migration failed!
    echo Make sure PostgreSQL is running and .env is configured correctly.
    echo.
    pause
    exit /b 1
)

echo.
echo Starting FastAPI server on http://localhost:8000
echo API docs will be available at http://localhost:8000/docs
echo.

REM Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause


