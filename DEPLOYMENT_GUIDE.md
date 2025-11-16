# KPC 프로젝트 Google Cloud 배포 가이드

## 📋 목차
1. [사전 요구사항](#사전-요구사항)
2. [환경 변수 설정](#환경-변수-설정)
3. [배포 방법](#배포-방법)
4. [문제 해결](#문제-해결)

## 사전 요구사항

### 1. Google Cloud SDK 설치
```bash
# Windows
# https://cloud.google.com/sdk/docs/install 에서 설치 파일 다운로드

# Mac/Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. 인증 및 프로젝트 설정
```bash
# Google Cloud 인증
gcloud auth login

# 프로젝트 설정
gcloud config set project pjt-vibecoding

# Cloud Run API 활성화
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## 환경 변수 설정

### 1. backend/.env 파일 생성
```bash
# backend/.env.example을 복사
cp backend/.env.example backend/.env

# 필수 환경 변수 설정
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## 배포 방법

### 방법 1: 자동 배포 스크립트 사용 (권장)

#### Windows
```cmd
deploy.bat
```

#### Mac/Linux
```bash
chmod +x deploy.sh
./deploy.sh
```

### 방법 2: 수동 배포

#### 1. 백엔드 배포
```bash
cd backend

# 이미지 빌드
gcloud builds submit --tag gcr.io/pjt-vibecoding/kpc-backend .

# Cloud Run에 배포
gcloud run deploy kpc-backend \
  --image gcr.io/pjt-vibecoding/kpc-backend \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars DATABASE_URL="$DATABASE_URL",SECRET_KEY="$SECRET_KEY",...
```

#### 2. 프론트엔드 배포
```bash
cd frontend

# 이미지 빌드
gcloud builds submit --tag gcr.io/pjt-vibecoding/kpc-frontend .

# Cloud Run에 배포
gcloud run deploy kpc-frontend \
  --image gcr.io/pjt-vibecoding/kpc-frontend \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

## 배포 확인

### 로그 확인
```bash
# 백엔드 로그
gcloud run services logs read kpc-backend --region asia-northeast3 --limit 50

# 프론트엔드 로그
gcloud run services logs read kpc-frontend --region asia-northeast3 --limit 50
```

### 서비스 URL 확인
```bash
# 백엔드 URL
gcloud run services describe kpc-backend --platform managed --region asia-northeast3 --format 'value(status.url)'

# 프론트엔드 URL
gcloud run services describe kpc-frontend --platform managed --region asia-northeast3 --format 'value(status.url)'
```

## 문제 해결

### 1. 빌드 실패
- `.dockerignore` 파일 확인
- `Dockerfile` 문법 확인
- 의존성 파일 (`requirements.txt`, `package.json`) 확인

### 2. 배포 실패
- 환경 변수가 올바르게 설정되었는지 확인
- Cloud Run API가 활성화되었는지 확인
- IAM 권한 확인

### 3. 런타임 오류
- 로그 확인: `gcloud run services logs read SERVICE_NAME --region REGION`
- 환경 변수 확인
- 데이터베이스 연결 확인

### 4. 데이터베이스 연결 오류
- DATABASE_URL 형식 확인
- Supabase 연결 정보 확인 (Direct Connection 사용)
- 방화벽 설정 확인

## 추가 리소스
- [Google Cloud Run 문서](https://cloud.google.com/run/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)



