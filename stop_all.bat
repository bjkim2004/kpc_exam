@echo off
echo ========================================
echo Stopping KPC Application
echo ========================================
echo.

echo Stopping all server processes...
echo.

REM Stop processes using ports 3000 and 8000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Stopping process on port 3000 (Frontend)...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Stopping process on port 8000 (Backend)...
    taskkill /F /PID %%a >nul 2>&1
)

REM Stop Node.js processes
echo Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

REM Stop Python processes (be careful with this if you have other Python apps running)
echo Stopping Python/uvicorn processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq KPC Backend*" >nul 2>&1

echo.
echo Done! All services should be stopped.
echo.
pause


