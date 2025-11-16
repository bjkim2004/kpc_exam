"""
DATABASE_URL 포트를 Transaction Pooler (6543) → Session Pooler (5432)로 변경
"""

import os
import re

env_file = ".env"

if not os.path.exists(env_file):
    print("[ERROR] .env 파일을 찾을 수 없습니다.")
    exit(1)

print("=" * 60)
print(".env 파일 DATABASE_URL 포트 변경")
print("Transaction Pooler (6543) → Session Pooler (5432)")
print("=" * 60)
print()

# .env 파일 읽기
with open(env_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# DATABASE_URL 수정
modified = False
new_lines = []

for line in lines:
    if line.startswith('DATABASE_URL='):
        # 기존 URL
        old_url = line.strip().split('=', 1)[1].strip('"')
        masked_old = re.sub(r':([^:@]+)@', ':***@', old_url)
        print(f"[INFO] 기존 URL:")
        print(f"  {masked_old}")
        
        # 포트 변경: 6543 -> 5432
        new_url = old_url.replace(':6543/', ':5432/')
        
        masked_new = re.sub(r':([^:@]+)@', ':***@', new_url)
        print(f"\n[INFO] 새 URL:")
        print(f"  {masked_new}")
        
        new_lines.append(f'DATABASE_URL="{new_url}"\n')
        modified = True
    else:
        new_lines.append(line)

if not modified:
    print("[ERROR] DATABASE_URL을 찾을 수 없습니다.")
    exit(1)

# .env 파일 쓰기
with open(env_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print()
print("=" * 60)
print("[SUCCESS] .env 파일이 수정되었습니다!")
print("[INFO] Session Pooler는 search_path 설정이 제대로 작동합니다.")
print("=" * 60)
print()



