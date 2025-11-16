@echo off
echo ========================================
echo Starting Frontend Server (Next.js)
echo ========================================
echo.

cd frontend

REM Check if node_modules exists
if not exist node_modules (
    echo node_modules not found! Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Cleaning cache...
if exist .next (
    rmdir /s /q .next 2>nul
    echo Cache deleted
)

echo.
echo Starting Next.js development server...
echo Server will be available at: http://localhost:3000
echo.
echo IMPORTANT: Wait for "Ready" message before accessing!
echo If compilation takes too long, check for TypeScript errors.
echo.

REM Start the frontend server with verbose output
npm run dev

pause
