@echo off
echo Starting local backend server...
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000



