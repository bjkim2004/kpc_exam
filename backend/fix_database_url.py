"""
.env 파일의 DATABASE_URL을 수정하여 public 스키마 사용
"""

import os

env_file = ".env"

if not os.path.exists(env_file):
    print("[ERROR] .env 파일을 찾을 수 없습니다.")
    exit(1)

print("=" * 60)
print(".env 파일 DATABASE_URL 수정")
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
        print(f"[INFO] 기존 URL:")
        # 비밀번호 마스킹
        import re
        masked_old = re.sub(r':([^:@]+)@', ':***@', old_url)
        print(f"  {masked_old}")
        
        # 새 URL: search_path 파라미터 추가
        if '?' in old_url:
            # 이미 파라미터가 있으면
            if 'search_path' not in old_url:
                new_url = old_url + '&options=-c%20search_path=public'
            else:
                new_url = old_url
        else:
            # 파라미터가 없으면
            new_url = old_url + '?options=-c%20search_path=public'
        
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
print("=" * 60)
print()



