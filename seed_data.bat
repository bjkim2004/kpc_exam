@echo off
echo ========================================
echo Seeding Initial Questions to Database
echo ========================================
echo.

cd backend

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

echo Running seed script...
python seed_questions.py

if errorlevel 1 (
    echo.
    echo ERROR: Seeding failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Seeding completed successfully!
echo ========================================
echo.

pause

