"""
로컬 데이터베이스 상태 확인 스크립트
"""

import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# DATABASE_URL 가져오기
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("[ERROR] DATABASE_URL이 .env 파일에 없습니다.")
    exit(1)

print("=" * 60)
print("로컬 데이터베이스 상태 확인")
print("=" * 60)
print()

try:
    print("[+] 데이터베이스 연결 중...")
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        print("[OK] 연결 성공!")
        print()
        
        # 현재 데이터베이스의 모든 테이블 확인
        print("[INFO] 데이터베이스의 모든 테이블:")
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """))
        
        tables = []
        for row in result:
            tables.append(row[0])
            print(f"  - {row[0]}")
        
        if not tables:
            print("  (테이블 없음)")
        
        print()
        
        # kpc 관련 테이블만 필터링
        kpc_tables = [t for t in tables if 'kpc' in t.lower()]
        
        if kpc_tables:
            print("[INFO] KPC 관련 테이블:")
            for table in kpc_tables:
                print(f"  - {table}")
        else:
            print("[INFO] KPC 관련 테이블이 없습니다.")
        
        print()
        
        # 필요한 테이블 목록
        required_tables = [
            'kpc_users',
            'kpc_admin_users',
            'kpc_exams',
            'kpc_questions',
            'kpc_question_content',
            'kpc_answers',
            'kpc_ai_usage'
        ]
        
        print("[INFO] 필요한 테이블 체크:")
        missing_tables = []
        for table in required_tables:
            if table in tables:
                print(f"  [OK] {table}")
            else:
                print(f"  [MISSING] {table}")
                missing_tables.append(table)
        
        print()
        
        if missing_tables:
            print(f"[WARNING] {len(missing_tables)}개의 테이블이 누락되었습니다!")
            print("[ACTION] 다음 명령어를 실행하세요:")
            print("  python create_local_tables.py")
        else:
            print("[SUCCESS] 모든 필요한 테이블이 존재합니다!")
        
except Exception as e:
    print()
    print("=" * 60)
    print(f"[ERROR] 오류 발생: {e}")
    print("=" * 60)
    exit(1)

print()
print("=" * 60)



