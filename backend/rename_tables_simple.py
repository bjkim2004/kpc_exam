"""
로컬 데이터베이스 테이블명 변경 스크립트
gl_kpc_* → kpc_*

실행 방법:
  cd backend
  python rename_tables_simple.py
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
print("로컬 데이터베이스 테이블명 변경")
print("gl_kpc_* → kpc_*")
print("=" * 60)
print()

try:
    # 데이터베이스 연결
    print(f"[+] 데이터베이스 연결 중...")
    engine = create_engine(database_url)
    
    print("[OK] 연결 성공!")
    print()
    
    # ENUM 타입 변경 (각각 별도 트랜잭션)
    print("[+] ENUM 타입 이름 변경 중...")
    enum_changes = [
        "ALTER TYPE gl_kpc_user_role RENAME TO kpc_user_role",
        "ALTER TYPE gl_kpc_exam_status RENAME TO kpc_exam_status",
        "ALTER TYPE gl_kpc_question_type RENAME TO kpc_question_type"
    ]
    
    for sql in enum_changes:
        try:
            with engine.connect() as conn:
                conn.execute(text(sql))
                conn.commit()
                print(f"  [OK] {sql.split('RENAME TO')[1].strip()}")
        except Exception as e:
            if "does not exist" in str(e):
                print(f"  [SKIP] ENUM 이미 변경됨 또는 존재하지 않음")
            else:
                print(f"  [SKIP] {str(e).split(chr(10))[0][:60]}...")
    
    print()
    
    # 테이블 변경 (각각 별도 트랜잭션)
    print("[+] 테이블 이름 변경 중...")
    table_changes = [
        ("gl_kpc_users", "kpc_users"),
        ("gl_kpc_admin_users", "kpc_admin_users"),
        ("gl_kpc_exams", "kpc_exams"),
        ("gl_kpc_questions", "kpc_questions"),
        ("gl_kpc_question_content", "kpc_question_content"),
        ("gl_kpc_answers", "kpc_answers"),
        ("gl_kpc_ai_usage", "kpc_ai_usage")
    ]
    
    for old_name, new_name in table_changes:
        try:
            with engine.connect() as conn:
                conn.execute(text(f"ALTER TABLE {old_name} RENAME TO {new_name}"))
                conn.commit()
                print(f"  [OK] {old_name} -> {new_name}")
        except Exception as e:
            if "does not exist" in str(e):
                print(f"  [SKIP] {new_name} - 이미 변경됨")
            else:
                print(f"  [SKIP] {old_name}: {str(e).split(chr(10))[0][:60]}...")
    
    print()
    print("=" * 60)
    print("[SUCCESS] 테이블명 변경 완료!")
    print("=" * 60)
    
    # 변경된 테이블 목록 확인
    print()
    print("[INFO] 현재 kpc 테이블 목록:")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_name LIKE '%kpc%'
            ORDER BY table_name
        """))
        
        for row in result:
            if row[0].startswith('kpc_') and not row[0].startswith('old_'):
                print(f"  [TABLE] {row[0]}")
        
except Exception as e:
    print()
    print("=" * 60)
    print(f"[ERROR] 오류 발생: {e}")
    print("=" * 60)
    exit(1)

print()
input("완료! 엔터키를 눌러 종료하세요...")

