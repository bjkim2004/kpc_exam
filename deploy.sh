#!/bin/bash

# KPC 프로젝트 Google Cloud Run 배포 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 설정
PROJECT_ID="pjt-vibecoding"
REGION="asia-northeast3"
BACKEND_SERVICE="kpc-backend"
FRONTEND_SERVICE="kpc-frontend"

echo -e "${GREEN}🚀 KPC 프로젝트 배포 시작${NC}"
echo "================================"

# 1. 환경 변수 확인
echo -e "\n${YELLOW}1. 환경 변수 확인 중...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env 파일이 없습니다!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 환경 변수 파일 확인 완료${NC}"

# 2. Google Cloud 프로젝트 설정
echo -e "\n${YELLOW}2. Google Cloud 프로젝트 설정 중...${NC}"
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✅ 프로젝트 설정 완료${NC}"

# 3. 백엔드 빌드 및 배포
echo -e "\n${YELLOW}3. 백엔드 빌드 중...${NC}"
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE .
echo -e "${GREEN}✅ 백엔드 빌드 완료${NC}"

echo -e "\n${YELLOW}4. 백엔드 배포 중...${NC}"
# 환경 변수를 .env에서 읽어서 설정
source .env
gcloud run deploy $BACKEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars DATABASE_URL="$DATABASE_URL",SECRET_KEY="$SECRET_KEY",OPENAI_API_KEY="$OPENAI_API_KEY",ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY",GEMINI_API_KEY="$GEMINI_API_KEY"

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo -e "${GREEN}✅ 백엔드 배포 완료: $BACKEND_URL${NC}"
cd ..

# 4. 프론트엔드 빌드 및 배포
echo -e "\n${YELLOW}5. 프론트엔드 빌드 중...${NC}"
cd frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
  --substitutions="_BACKEND_URL=$BACKEND_URL" .
echo -e "${GREEN}✅ 프론트엔드 빌드 완료${NC}"

echo -e "\n${YELLOW}6. 프론트엔드 배포 중...${NC}"
gcloud run deploy $FRONTEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo -e "${GREEN}✅ 프론트엔드 배포 완료: $FRONTEND_URL${NC}"
cd ..

# 5. 배포 완료
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo -e "\n${YELLOW}📋 배포 정보:${NC}"
echo -e "  Backend:  $BACKEND_URL"
echo -e "  Frontend: $FRONTEND_URL"
echo -e "\n${YELLOW}💡 다음 단계:${NC}"
echo -e "  1. 프론트엔드에 접속하여 테스트"
echo -e "  2. 로그 확인: gcloud run services logs read $BACKEND_SERVICE --region $REGION"
echo -e "${GREEN}================================${NC}"



