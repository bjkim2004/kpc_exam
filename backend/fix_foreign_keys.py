"""
Foreign Key Constraint 이름 수정 스크립트

실행 방법:
  cd backend
  python fix_foreign_keys.py
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
print("Foreign Key Constraint 수정")
print("gl_kpc_* -> kpc_*")
print("=" * 60)
print()

try:
    print("[+] 데이터베이스 연결 중...")
    engine = create_engine(database_url)
    
    print("[OK] 연결 성공!")
    print()
    
    # Foreign Key constraint 재생성
    print("[+] Foreign Key Constraint 재생성 중...")
    
    fk_changes = [
        ("kpc_exams", "gl_kpc_exams_user_id_fkey", "kpc_exams_user_id_fkey", "user_id", "kpc_users", "id"),
        ("kpc_answers", "gl_kpc_answers_exam_id_fkey", "kpc_answers_exam_id_fkey", "exam_id", "kpc_exams", "id"),
        ("kpc_answers", "gl_kpc_answers_question_id_fkey", "kpc_answers_question_id_fkey", "question_id", "kpc_questions", "id"),
        ("kpc_ai_usage", "gl_kpc_ai_usage_exam_id_fkey", "kpc_ai_usage_exam_id_fkey", "exam_id", "kpc_exams", "id"),
        ("kpc_ai_usage", "gl_kpc_ai_usage_question_id_fkey", "kpc_ai_usage_question_id_fkey", "question_id", "kpc_questions", "id"),
        ("kpc_question_content", "gl_kpc_question_content_question_id_fkey", "kpc_question_content_question_id_fkey", "question_id", "kpc_questions", "id"),
    ]
    
    for table, old_constraint, new_constraint, column, ref_table, ref_column in fk_changes:
        try:
            with engine.connect() as conn:
                # 기존 constraint 삭제
                conn.execute(text(f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {old_constraint}"))
                conn.commit()
                
                # 새 constraint 생성
                conn.execute(text(f"ALTER TABLE {table} ADD CONSTRAINT {new_constraint} FOREIGN KEY ({column}) REFERENCES {ref_table}({ref_column})"))
                conn.commit()
                
                print(f"  [OK] {table}.{column} -> {ref_table}.{ref_column}")
        except Exception as e:
            print(f"  [SKIP] {table}: {str(e).split(chr(10))[0][:60]}...")
    
    print()
    print("=" * 60)
    print("[SUCCESS] Foreign Key Constraint 수정 완료!")
    print("=" * 60)
    
    # 결과 확인
    print()
    print("[INFO] 현재 Foreign Key Constraint 목록:")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                tc.table_name, 
                tc.constraint_name, 
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_name LIKE 'kpc_%'
              AND tc.table_name NOT LIKE 'old_kpc_%'
            ORDER BY tc.table_name, tc.constraint_name
        """))
        
        for row in result:
            print(f"  [FK] {row[0]}.{row[2]} -> {row[3]}.{row[4]} ({row[1]})")
        
except Exception as e:
    print()
    print("=" * 60)
    print(f"[ERROR] 오류 발생: {e}")
    print("=" * 60)
    exit(1)

print()
input("완료! 엔터키를 눌러 종료하세요...")



