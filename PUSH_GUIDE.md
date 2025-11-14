# GitHub Push Guide

주요 구조 파일들은 이미 GitHub에 업로드되었습니다. 나머지 소스 파일들을 로컬에서 push하려면 아래 명령어를 실행하세요.

## 현재 업로드된 파일

✅ README.md  
✅ .gitignore  
✅ 설정 파일들 (cloudbuild.yaml, docker-compose.cloud.yml, setup.bat, start_all.bat)  
✅ Backend 설정 (requirements.txt, Dockerfile, env.example, alembic.ini)  
✅ Backend 핵심 코드 (app/main.py, core/, api/, models/, schemas/)  
✅ Frontend 설정 (package.json, Dockerfile, next.config.js, tsconfig.json, tailwind.config.ts)  
✅ Frontend 핵심 코드 (app/layout.tsx, app/globals.css, lib/api/client.ts)

## 나머지 파일 push 방법

현재 작업 디렉토리에서 다음 명령어를 실행하세요:

```bash
# 1. Git 초기화 (아직 안 했다면)
git init

# 2. Remote repository 추가
git remote add origin https://github.com/bjkim2004/kpc_exam.git

# 3. 기존 main 브랜치 가져오기
git fetch origin main

# 4. 로컬을 원격 브랜치와 동기화
git reset --soft origin/main

# 5. 모든 파일 추가 (.gitignore에 명시된 파일은 자동 제외)
git add .

# 6. Commit
git commit -m "Add remaining source files"

# 7. Push
git push -u origin main
```

## Windows에서 실행하는 경우

Git Bash 또는 Git CMD를 사용하여 위 명령어를 실행하세요.

## 참고사항

- `.gitignore` 파일에 명시된 파일들 (node_modules, __pycache__, .env, logs 등)은 자동으로 제외됩니다.
- 환경 변수 파일 (`.env`)은 절대 push하지 마세요. 대신 `env.example`을 참고하세요.
- 대용량 파일이나 민감한 정보가 포함된 파일이 있는지 확인하세요.

## Repository URL

https://github.com/bjkim2004/kpc_exam
