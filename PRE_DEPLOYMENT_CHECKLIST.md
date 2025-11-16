# 배포 전 체크리스트

## ✅ 필수 사항

### 1. Google Cloud 설정
- [ ] Google Cloud SDK 설치 완료
- [ ] `gcloud auth login` 실행 완료
- [ ] 프로젝트 ID: `pjt-vibecoding` 설정 완료
- [ ] Cloud Run API 활성화
- [ ] Cloud Build API 활성화

### 2. 환경 변수
- [ ] `backend/.env` 파일 생성 완료
- [ ] `DATABASE_URL` 설정 (Supabase Direct Connection, port 5432)
- [ ] `SECRET_KEY` 설정
- [ ] AI API 키 설정 (선택사항)

### 3. 데이터베이스
- [ ] Supabase 프로젝트 생성 완료
- [ ] 올바른 데이터베이스 비밀번호 확인
- [ ] 테이블 마이그레이션 완료 (Alembic)

### 4. 코드 준비
- [ ] 최신 코드 커밋 완료
- [ ] `requirements.txt` 업데이트
- [ ] `package.json` 업데이트
- [ ] Dockerfile 문법 확인

## ⚠️ 권장 사항

### 로컬 테스트
- [ ] 백엔드 로컬 실행 테스트
- [ ] 프론트엔드 로컬 실행 테스트
- [ ] API 엔드포인트 테스트
- [ ] Docker 빌드 테스트 (`test-docker-build.bat` 실행)

### 보안
- [ ] 민감한 정보 .gitignore에 추가
- [ ] API 키 환경 변수로 관리
- [ ] CORS 설정 확인
- [ ] 프로덕션용 SECRET_KEY 변경

### 성능
- [ ] 메모리/CPU 설정 확인
- [ ] 데이터베이스 인덱스 설정
- [ ] 이미지 최적화
- [ ] 불필요한 의존성 제거

## 🚀 배포 준비 완료!

모든 항목을 확인했다면:

**Windows:**
```cmd
deploy.bat
```

**Mac/Linux:**
```bash
./deploy.sh
```

## 📊 배포 후 모니터링

### 즉시 확인
- [ ] 프론트엔드 접속 가능
- [ ] API 응답 정상
- [ ] 로그인 기능 작동
- [ ] 데이터베이스 연결 정상

### 지속 모니터링
```bash
# 실시간 로그 모니터링
gcloud run services logs tail kpc-backend --region asia-northeast3

# 서비스 상태 확인
gcloud run services list --platform managed --region asia-northeast3
```

## 🆘 문제 발생 시

1. **로그 확인**
   ```bash
   gcloud run services logs read kpc-backend --region asia-northeast3 --limit 100
   ```

2. **환경 변수 재설정**
   ```bash
   gcloud run services update kpc-backend --region asia-northeast3 --update-env-vars KEY=VALUE
   ```

3. **롤백**
   ```bash
   gcloud run services update-traffic kpc-backend --to-revisions REVISION=100 --region asia-northeast3
   ```

## 📚 추가 문서
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 상세 배포 가이드
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - 빠른 배포 가이드



