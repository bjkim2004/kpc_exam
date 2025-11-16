"""
중복된 Foreign Key Constraint 정리 스크립트
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
print("Foreign Key Constraint 정리")
print("=" * 60)
print()

try:
    print("[+] 데이터베이스 연결 중...")
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        print("[OK] 연결 성공!")
        print()
        
        # 현재 Foreign Key 확인
        print("[INFO] 현재 Foreign Key 목록:")
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
        
        fk_list = []
        for row in result:
            fk_list.append({
                'table': row[0],
                'constraint': row[1],
                'column': row[2],
                'ref_table': row[3],
                'ref_column': row[4]
            })
            print(f"  {row[0]}.{row[2]} -> {row[3]}.{row[4]} ({row[1]})")
        
        print()
        print(f"[INFO] 총 {len(fk_list)}개의 Foreign Key constraint 발견")
        print()
        
        # old_kpc 테이블을 참조하는 constraint 찾기
        old_refs = [fk for fk in fk_list if fk['ref_table'].startswith('old_kpc_')]
        
        if old_refs:
            print(f"[WARNING] old_kpc_ 테이블을 참조하는 {len(old_refs)}개의 constraint 발견:")
            for fk in old_refs:
                print(f"  {fk['table']}.{fk['column']} -> {fk['ref_table']}.{fk['ref_column']} ({fk['constraint']})")
            
            print()
            print("[ACTION] old_kpc_ 참조 제거 중...")
            
            for fk in old_refs:
                try:
                    with engine.connect() as new_conn:
                        new_conn.execute(text(f"ALTER TABLE {fk['table']} DROP CONSTRAINT IF EXISTS {fk['constraint']}"))
                        new_conn.commit()
                        print(f"  [OK] {fk['table']}.{fk['constraint']} 제거됨")
                except Exception as e:
                    print(f"  [ERROR] {fk['table']}.{fk['constraint']}: {str(e)[:60]}...")
        else:
            print("[OK] old_kpc_ 테이블 참조가 없습니다.")
        
        print()
        
        # 중복 constraint 확인 (같은 테이블/컬럼에 대한 중복)
        print("[INFO] 중복 constraint 확인 중...")
        seen = {}
        duplicates = []
        
        # 다시 조회
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
            key = f"{row[0]}.{row[2]}"
            if key in seen:
                duplicates.append({
                    'table': row[0],
                    'constraint': row[1],
                    'column': row[2]
                })
                print(f"  [DUPLICATE] {row[0]}.{row[2]} ({row[1]})")
            else:
                seen[key] = row[1]
        
        if duplicates:
            print()
            print(f"[WARNING] {len(duplicates)}개의 중복 constraint 발견")
            print("[ACTION] 중복 constraint 제거 중...")
            
            for dup in duplicates:
                try:
                    with engine.connect() as new_conn:
                        new_conn.execute(text(f"ALTER TABLE {dup['table']} DROP CONSTRAINT IF EXISTS {dup['constraint']}"))
                        new_conn.commit()
                        print(f"  [OK] {dup['table']}.{dup['constraint']} 제거됨")
                except Exception as e:
                    print(f"  [ERROR] {dup['table']}.{dup['constraint']}: {str(e)[:60]}...")
        else:
            print("  [OK] 중복 없음")
        
        print()
        print("=" * 60)
        print("[SUCCESS] Foreign Key constraint 정리 완료!")
        print("=" * 60)
        
except Exception as e:
    print()
    print("=" * 60)
    print(f"[ERROR] 오류 발생: {e}")
    print("=" * 60)
    exit(1)

print()

