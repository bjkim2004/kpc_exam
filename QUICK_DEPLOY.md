# ⚡ 빠른 배포 가이드

## 1분 만에 배포하기

### Windows 사용자
```cmd
REM 1. 환경 변수 설정 (backend/.env 파일 생성)
copy backend\.env.example backend\.env
notepad backend\.env

REM 2. 배포 실행
deploy.bat
```

### Mac/Linux 사용자
```bash
# 1. 환경 변수 설정
cp backend/.env.example backend/.env
nano backend/.env

# 2. 배포 실행
chmod +x deploy.sh
./deploy.sh
```

## 환경 변수 체크리스트

`backend/.env` 파일에 다음 값들이 설정되어 있는지 확인:

- [ ] `DATABASE_URL` - Supabase PostgreSQL 연결 문자열 (Direct Connection, port 5432)
- [ ] `SECRET_KEY` - JWT 토큰용 비밀 키
- [ ] `OPENAI_API_KEY` - OpenAI API 키 (선택사항)
- [ ] `ANTHROPIC_API_KEY` - Anthropic API 키 (선택사항)
- [ ] `GEMINI_API_KEY` - Google Gemini API 키 (선택사항)

## 배포 후 확인사항

1. ✅ 프론트엔드 URL 접속
2. ✅ 회원가입 테스트
3. ✅ 로그인 테스트
4. ✅ 백엔드 API 응답 확인

## 문제 발생 시

```bash
# 로그 확인
gcloud run services logs read kpc-backend --region asia-northeast3 --limit 50

# 서비스 재시작
gcloud run services update kpc-backend --region asia-northeast3
```

## 도움말
- 상세 가이드: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- 체크리스트: [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)



