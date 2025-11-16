@echo off
REM 로컬 데이터베이스 테이블명 변경 스크립트 (Windows)

echo ========================================
echo 로컬 데이터베이스 테이블명 변경
echo gl_kpc_* → kpc_*
echo ========================================
echo.

REM .env 파일에서 DATABASE_URL 읽기
set ENV_FILE=.env
if not exist %ENV_FILE% (
    echo Error: .env 파일을 찾을 수 없습니다.
    pause
    exit /b 1
)

REM Python을 사용하여 직접 SQL 실행
echo 테이블명 변경 중...
python -c "import os; from sqlalchemy import create_engine, text; from dotenv import load_dotenv; load_dotenv(); engine = create_engine(os.getenv('DATABASE_URL')); conn = engine.connect(); conn.execute(text('ALTER TYPE IF EXISTS gl_kpc_user_role RENAME TO kpc_user_role')); conn.execute(text('ALTER TYPE IF EXISTS gl_kpc_exam_status RENAME TO kpc_exam_status')); conn.execute(text('ALTER TYPE IF EXISTS gl_kpc_question_type RENAME TO kpc_question_type')); conn.execute(text('ALTER TABLE IF EXISTS gl_kpc_users RENAME TO kpc_users')); conn.execute(text('ALTER TABLE IF EXISTS gl_kpc_admin_users RENAME TO kpc_admin_users')); conn.execute(text('ALTER TABLE IF EXISTS gl_kpc_exams RENAME TO kpc_exams')); conn.execute(text('ALTER TABLE IF EXISTS gl_kpc_questions RENAME TO kpc_questions')); conn.execute(text('ALTER TABLE IF EXISTS gl_kpc_question_content RENAME TO kpc_question_content')); conn.execute(text('ALTER TABLE IF EXISTS gl_kpc_answers RENAME TO kpc_answers')); conn.execute(text('ALTER TABLE IF EXISTS gl_kpc_ai_usage RENAME TO kpc_ai_usage')); conn.commit(); conn.close(); print('✅ 테이블명 변경 완료!')"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ 테이블명 변경 완료!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ 오류 발생!
    echo ========================================
)

echo.
pause



