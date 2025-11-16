# 배포 요약

## 현재 배포 상태

### 서비스 정보
- **프로젝트 ID**: pjt-vibecoding
- **리전**: asia-northeast3 (Seoul)
- **플랫폼**: Google Cloud Run

### 배포된 서비스

#### 백엔드 (kpc-backend)
- **URL**: https://kpc-backend-480497851489.asia-northeast3.run.app
- **이미지**: gcr.io/pjt-vibecoding/kpc-backend
- **메모리**: 1Gi
- **CPU**: 1
- **포트**: 8080

#### 프론트엔드 (kpc-frontend)
- **URL**: https://kpc-frontend-480497851489.asia-northeast3.run.app
- **이미지**: gcr.io/pjt-vibecoding/kpc-frontend
- **메모리**: 512Mi
- **CPU**: 1
- **포트**: 8080

## 주요 수정 사항

### 2025-11-13

#### 1. 데이터베이스 연결 문제 해결
**문제**: 
- Transaction Pooler (port 6543)의 `postgres.projectref` 사용자 이름 형식 비호환
- 잘못된 Supabase 프로젝트 참조 (`kjglvcjbodlngqgnlznj` → `dktrdivmekmioqqkclzx`)
- 비밀번호 인증 실패

**해결책**:
- Direct Connection (port 5432) 사용으로 변경
- 올바른 Supabase 프로젝트 ID 사용
- 올바른 데이터베이스 비밀번호 필요

**권장 연결 문자열 형식**:
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

#### 2. bcrypt 버전 호환성 문제
**문제**: `passlib[bcrypt]==1.7.4`가 최신 bcrypt와 비호환

**해결책**: `requirements.txt`에 `bcrypt==4.0.1` 명시적 추가

#### 3. Next.js 환경 변수 문제
**문제**: 빌드 시점에 환경 변수 미포함으로 localhost 사용

**해결책**:
- `next.config.js`에 `output: 'standalone'` 추가
- Dockerfile에 빌드 시점 ARG/ENV 추가
- standalone 서버 사용 (`node server.js`)

#### 4. CORS 설정
**백엔드** (`backend/app/core/config.py`):
```python
BACKEND_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "https://kpc-frontend-480497851489.asia-northeast3.run.app"
]
```

## 환경 변수 설정

### 백엔드 필수 환경 변수
```bash
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
SECRET_KEY=your-super-secret-key-change-in-production
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
```

### 프론트엔드 환경 변수
- 빌드 시점에 ARG로 주입
- `NEXT_PUBLIC_API_URL=https://kpc-backend-480497851489.asia-northeast3.run.app`

## 배포 명령어

### 빠른 재배포
```bash
# Windows
deploy.bat

# Mac/Linux
./deploy.sh
```

### 백엔드만 재배포
```bash
cd backend
gcloud builds submit --tag gcr.io/pjt-vibecoding/kpc-backend .
gcloud run deploy kpc-backend \
  --image gcr.io/pjt-vibecoding/kpc-backend \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars DATABASE_URL="...",SECRET_KEY="...",...
```

### 프론트엔드만 재배포
```bash
cd frontend
gcloud builds submit --tag gcr.io/pjt-vibecoding/kpc-frontend .
gcloud run deploy kpc-frontend \
  --image gcr.io/pjt-vibecoding/kpc-frontend \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

## 모니터링

### 로그 확인
```bash
# 백엔드 로그 (최근 50개)
gcloud run services logs read kpc-backend --region asia-northeast3 --limit 50

# 프론트엔드 로그 (최근 50개)
gcloud run services logs read kpc-frontend --region asia-northeast3 --limit 50

# 실시간 로그
gcloud run services logs tail kpc-backend --region asia-northeast3
```

### 서비스 상태
```bash
# 모든 서비스 목록
gcloud run services list --platform managed --region asia-northeast3

# 특정 서비스 상세 정보
gcloud run services describe kpc-backend --platform managed --region asia-northeast3
```

## 알려진 이슈

### 🔴 해결 필요
1. **데이터베이스 비밀번호 확인 필요**
   - 현재 비밀번호 `BJKTEST0116!`로 인증 실패
   - Supabase 대시보드에서 올바른 비밀번호 확인 필요

### ✅ 해결 완료
1. bcrypt 버전 호환성 문제
2. Next.js 환경 변수 빌드 시점 포함
3. 올바른 Supabase 프로젝트 ID 사용
4. CORS 설정

## 다음 단계

1. ✅ Supabase에서 올바른 데이터베이스 비밀번호 확인
2. 🔄 DATABASE_URL 환경 변수 업데이트 및 재배포
3. ✅ 로그인/회원가입 기능 테스트
4. ✅ 프로덕션 환경 모니터링 설정

## 참고 문서
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 상세 배포 가이드
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - 빠른 배포
- [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) - 체크리스트



