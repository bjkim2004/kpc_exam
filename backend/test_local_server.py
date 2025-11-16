"""
로컬 서버 빠른 테스트 스크립트
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# DATABASE_URL 가져오기
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("[ERROR] DATABASE_URL이 .env 파일에 없습니다.")
    exit(1)

print("=" * 60)
print("로컬 서버 데이터베이스 연결 테스트")
print("=" * 60)
print()

try:
    print("[+] 데이터베이스 연결 테스트...")
    engine = create_engine(
        database_url,
        connect_args={"options": "-c search_path=public"}
    )
    
    with engine.connect() as conn:
        print("[OK] 데이터베이스 연결 성공!")
        
        # kpc_users 테이블 조회 테스트 (스키마 명시)
        print()
        print("[+] kpc_users 테이블 조회 테스트...")
        result = conn.execute(text("SELECT COUNT(*) FROM public.kpc_users"))
        count = result.scalar()
        print(f"[OK] kpc_users 테이블에 {count}개의 레코드 존재")
        
        # SQLAlchemy 모델 import 테스트
        print()
        print("[+] SQLAlchemy 모델 import 테스트...")
        from app.models.user import User, AdminUser
        from app.models.exam import Exam
        from app.models.question import Question, QuestionContent
        from app.models.answer import Answer, AIUsage
        print("[OK] 모든 모델 import 성공!")
        
        # 모델 초기화 테스트
        print()
        print("[+] SQLAlchemy 모델 초기화 테스트...")
        from app.core.database import SessionLocal
        db = SessionLocal()
        
        try:
            # User 모델로 쿼리 테스트
            user_count = db.query(User).count()
            print(f"[OK] User 모델로 쿼리 성공! ({user_count}명의 사용자)")
            
            # AdminUser 모델로 쿼리 테스트
            admin_count = db.query(AdminUser).count()
            print(f"[OK] AdminUser 모델로 쿼리 성공! ({admin_count}명의 관리자)")
            
            # Exam 모델로 쿼리 테스트
            exam_count = db.query(Exam).count()
            print(f"[OK] Exam 모델로 쿼리 성공! ({exam_count}개의 시험)")
            
            # Question 모델로 쿼리 테스트
            question_count = db.query(Question).count()
            print(f"[OK] Question 모델로 쿼리 성공! ({question_count}개의 문제)")
            
            print()
            print("=" * 60)
            print("[SUCCESS] 모든 테스트 통과!")
            print("[INFO] 로컬 서버를 실행할 준비가 되었습니다:")
            print("  uvicorn app.main:app --reload")
            print("=" * 60)
            
        finally:
            db.close()
        
except Exception as e:
    print()
    print("=" * 60)
    print(f"[ERROR] 오류 발생:")
    print(f"{e}")
    print("=" * 60)
    import traceback
    traceback.print_exc()
    exit(1)

print()

