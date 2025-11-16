@echo off
REM Docker 빌드 테스트 스크립트

echo ================================
echo 🧪 Docker 빌드 테스트
echo ================================

echo.
echo 1. 백엔드 Docker 이미지 빌드 테스트...
cd backend
docker build -t kpc-backend-test .
if errorlevel 1 (
    echo ❌ 백엔드 빌드 실패
    exit /b 1
)
echo ✅ 백엔드 빌드 성공
cd ..

echo.
echo 2. 프론트엔드 Docker 이미지 빌드 테스트...
cd frontend
docker build -t kpc-frontend-test --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 .
if errorlevel 1 (
    echo ❌ 프론트엔드 빌드 실패
    exit /b 1
)
echo ✅ 프론트엔드 빌드 성공
cd ..

echo.
echo ================================
echo ✅ 모든 Docker 이미지 빌드 테스트 완료!
echo ================================
echo.
echo 💡 다음 단계:
echo   1. 로컬에서 테스트: docker-compose up
echo   2. Cloud에 배포: deploy.bat
echo ================================



