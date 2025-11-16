@echo off
REM 환경 변수 설정 스크립트

echo ================================
echo 🔧 환경 변수 설정
echo ================================

REM .env 파일에서 환경 변수 읽기
if not exist "backend\.env" (
    echo ❌ backend\.env 파일이 없습니다!
    echo    .env.example을 참고하여 .env 파일을 생성해주세요.
    exit /b 1
)

echo ✅ .env 파일을 찾았습니다.
echo.
echo 다음 명령어로 Cloud Run에 환경 변수를 설정할 수 있습니다:
echo.
echo gcloud run services update kpc-backend ^
echo   --region asia-northeast3 ^
echo   --update-env-vars DATABASE_URL="your-database-url",^
echo SECRET_KEY="your-secret-key",^
echo OPENAI_API_KEY="your-openai-key",^
echo ANTHROPIC_API_KEY="your-anthropic-key",^
echo GEMINI_API_KEY="your-gemini-key"
echo.
echo 또는 deploy.bat 스크립트를 사용하여 자동으로 설정할 수 있습니다.
echo ================================



