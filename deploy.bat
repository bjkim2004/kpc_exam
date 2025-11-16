@echo off
REM KPC 프로젝트 Google Cloud Run 배포 스크립트 (Windows)

setlocal enabledelayedexpansion

REM 프로젝트 설정
set PROJECT_ID=pjt-vibecoding
set REGION=asia-northeast3
set BACKEND_SERVICE=kpc-backend
set FRONTEND_SERVICE=kpc-frontend

echo ================================
echo 🚀 KPC 프로젝트 배포 시작
echo ================================

REM 1. 환경 변수 확인
echo.
echo 1. 환경 변수 확인 중...
if not exist "backend\.env" (
    echo ❌ backend\.env 파일이 없습니다!
    exit /b 1
)
echo ✅ 환경 변수 파일 확인 완료

REM 2. Google Cloud 프로젝트 설정
echo.
echo 2. Google Cloud 프로젝트 설정 중...
gcloud config set project %PROJECT_ID%
echo ✅ 프로젝트 설정 완료

REM 3. 백엔드 빌드 및 배포
echo.
echo 3. 백엔드 빌드 중...
cd backend
gcloud builds submit --tag gcr.io/%PROJECT_ID%/%BACKEND_SERVICE% .
if errorlevel 1 (
    echo ❌ 백엔드 빌드 실패
    exit /b 1
)
echo ✅ 백엔드 빌드 완료

echo.
echo 4. 백엔드 배포 중...
REM .env 파일에서 환경 변수 읽기
for /f "tokens=1,* delims==" %%a in (..\.env) do (
    set "%%a=%%b"
)

gcloud run deploy %BACKEND_SERVICE% --image gcr.io/%PROJECT_ID%/%BACKEND_SERVICE% --platform managed --region %REGION% --allow-unauthenticated --port 8080 --memory 1Gi --cpu 1 --set-env-vars DATABASE_URL="%DATABASE_URL%",SECRET_KEY="%SECRET_KEY%",OPENAI_API_KEY="%OPENAI_API_KEY%",ANTHROPIC_API_KEY="%ANTHROPIC_API_KEY%",GEMINI_API_KEY="%GEMINI_API_KEY%"

if errorlevel 1 (
    echo ❌ 백엔드 배포 실패
    exit /b 1
)

for /f "tokens=*" %%i in ('gcloud run services describe %BACKEND_SERVICE% --platform managed --region %REGION% --format "value(status.url)"') do set BACKEND_URL=%%i
echo ✅ 백엔드 배포 완료: %BACKEND_URL%
cd ..

REM 4. 프론트엔드 빌드 및 배포
echo.
echo 5. 프론트엔드 빌드 중...
cd frontend
gcloud builds submit --tag gcr.io/%PROJECT_ID%/%FRONTEND_SERVICE% .
if errorlevel 1 (
    echo ❌ 프론트엔드 빌드 실패
    exit /b 1
)
echo ✅ 프론트엔드 빌드 완료

echo.
echo 6. 프론트엔드 배포 중...
gcloud run deploy %FRONTEND_SERVICE% --image gcr.io/%PROJECT_ID%/%FRONTEND_SERVICE% --platform managed --region %REGION% --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1

if errorlevel 1 (
    echo ❌ 프론트엔드 배포 실패
    exit /b 1
)

for /f "tokens=*" %%i in ('gcloud run services describe %FRONTEND_SERVICE% --platform managed --region %REGION% --format "value(status.url)"') do set FRONTEND_URL=%%i
echo ✅ 프론트엔드 배포 완료: %FRONTEND_URL%
cd ..

REM 5. 배포 완료
echo.
echo ================================
echo 🎉 배포 완료!
echo.
echo 📋 배포 정보:
echo   Backend:  %BACKEND_URL%
echo   Frontend: %FRONTEND_URL%
echo.
echo 💡 다음 단계:
echo   1. 프론트엔드에 접속하여 테스트
echo   2. 로그 확인: gcloud run services logs read %BACKEND_SERVICE% --region %REGION%
echo ================================

endlocal



