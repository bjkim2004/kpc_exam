"""
DATABASE_URL 및 실제 데이터베이스 연결 확인
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
print("DATABASE_URL 및 연결 정보 확인")
print("=" * 60)
print()

# URL 정보 출력 (비밀번호 마스킹)
import re
masked_url = re.sub(r':([^:@]+)@', ':***@', database_url)
print(f"[INFO] DATABASE_URL: {masked_url}")
print()

try:
    print("[+] 데이터베이스 연결 중...")
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        print("[OK] 연결 성공!")
        print()
        
        # 현재 데이터베이스 이름 확인
        result = conn.execute(text("SELECT current_database()"))
        db_name = result.scalar()
        print(f"[INFO] 현재 데이터베이스: {db_name}")
        
        # 현재 스키마 확인
        result = conn.execute(text("SELECT current_schema()"))
        schema_name = result.scalar()
        print(f"[INFO] 현재 스키마: {schema_name}")
        
        # PostgreSQL 버전 확인
        result = conn.execute(text("SELECT version()"))
        version = result.scalar()
        print(f"[INFO] PostgreSQL 버전: {version[:60]}...")
        
        print()
        print("=" * 60)
        print("[INFO] 모든 스키마의 테이블 목록:")
        print("=" * 60)
        
        result = conn.execute(text("""
            SELECT 
                table_schema,
                table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name
        """))
        
        schema_tables = {}
        for row in result:
            schema = row[0]
            table = row[1]
            if schema not in schema_tables:
                schema_tables[schema] = []
            schema_tables[schema].append(table)
        
        for schema, tables in schema_tables.items():
            print(f"\n[{schema}] ({len(tables)} tables)")
            kpc_tables = [t for t in tables if 'kpc' in t.lower()]
            if kpc_tables:
                print("  KPC 관련 테이블:")
                for table in sorted(kpc_tables)[:10]:  # 처음 10개만
                    print(f"    - {table}")
                if len(kpc_tables) > 10:
                    print(f"    ... 외 {len(kpc_tables) - 10}개")
        
        print()
        print("=" * 60)
        
except Exception as e:
    print()
    print("=" * 60)
    print(f"[ERROR] 오류 발생: {e}")
    print("=" * 60)
    exit(1)

print()



