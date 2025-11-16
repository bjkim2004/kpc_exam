# 🚀 Playwright MCP 테스트 빠른 시작 가이드

## 📋 생성된 파일들

```
tests/
├── QUICK_START.md           # 이 파일 (빠른 시작 가이드)
├── README.md                 # 상세한 테스트 문서
├── full-test-suite.md        # 완전한 테스트 수트 명세
├── automated-test.js         # 자동화 테스트 스크립트
├── e2e-test.js              # 테스트 시나리오 정의
├── run_tests.py             # Python 테스트 가이드
└── screenshots/             # 스크린샷 저장 디렉토리
```

## ⚡ 1분 안에 시작하기

### Step 1: Playwright 브라우저 설치 (한 번만)

```bash
# 방법 1: 전역 설치 (권장)
npm install -g playwright
npx playwright install chromium

# 방법 2: 로컬 설치
cd frontend
npm install @playwright/test
npx playwright install chromium
```

### Step 2: 서버 실행

**터미널 1 - 백엔드:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

**터미널 2 - 프론트엔드:**
```bash
cd frontend
npm run dev
```

### Step 3: 테스트 실행

**자동 테스트 시뮬레이션 확인:**
```bash
node tests/automated-test.js
```

**Python 가이드 보기:**
```bash
python tests/run_tests.py
```

## 🎯 주요 테스트 시나리오

### 📄 시나리오 1: index.html 페이지 테스트

**목적:** 시작 페이지의 색상이 진하게 변경되었는지 확인

```javascript
// Playwright MCP 명령어
mcp_playwright_playwright_navigate({
    url: "file:///G:/sync/New_Project/vibe_coding/kpc/index.html",
    headless: false,
    width: 1920,
    height: 1080
})

mcp_playwright_playwright_screenshot({
    name: "index-page",
    fullPage: true,
    savePng: true
})
```

**검증 항목:**
- ✅ 시험 정보 박스: 진한 파란색 (`info-200`)
- ✅ 데모 안내 박스: 진한 초록색 (`success-200`)
- ✅ 문항 목록: 회색 (`neutral-200`)

---

### 🏠 시나리오 2: 수험자 화면 테스트

**목적:** 헤더가 검은 배경에 흰 글자로 표시되는지 확인

```javascript
// 메인 페이지 열기
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000",
    headless: false
})

// 헤더 확인
mcp_playwright_playwright_screenshot({
    name: "main-header",
    selector: "header",
    savePng: true
})

// 시험 화면 이동
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000/exam/questions/1"
})

// 시험 헤더 확인
mcp_playwright_playwright_screenshot({
    name: "exam-header",
    selector: "header",
    savePng: true
})
```

**검증 항목:**
- ✅ 헤더 배경: 검은색 (`bg-black`)
- ✅ "생성형 AI 활용 역량평가": 흰색
- ✅ 진행 상황 점이 표시됨
- ✅ 타이머가 작동함
- ✅ 라디오 버튼이 크고 명확함

---

### 👤 시나리오 3: Admin 화면 테스트

**목적:** Admin 화면이 컴팩트하고 고급스러운 디자인인지 확인

```javascript
// Admin 페이지 이동
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000/admin"
})

// 전체 페이지
mcp_playwright_playwright_screenshot({
    name: "admin-dashboard",
    fullPage: true,
    savePng: true
})

// 사이드바
mcp_playwright_playwright_screenshot({
    name: "admin-sidebar",
    selector: "nav",
    savePng: true
})

// 문제 관리 페이지
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000/admin/questions"
})

mcp_playwright_playwright_screenshot({
    name: "admin-questions",
    fullPage: true,
    savePng: true
})

// 문항 추가 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('문항 추가')"
})

mcp_playwright_playwright_screenshot({
    name: "admin-add-menu",
    savePng: true
})
```

**검증 항목:**
- ✅ 사이드바: 컴팩트한 디자인 (w-56)
- ✅ 아이콘: SVG 사용
- ✅ 통계 카드: 뉴트럴 컬러
- ✅ 테이블: 컴팩트하고 밀도 높음
- ✅ 버튼: 모두 뉴트럴 톤
- ✅ 원색 사용: 없음

---

## 📸 스크린샷 네이밍

테스트 중 촬영되는 스크린샷:

| 번호 | 파일명 | 설명 |
|------|--------|------|
| 01 | `01-index-page-full.png` | index.html 전체 |
| 02 | `02-index-exam-info-box.png` | 시험 정보 박스 (파란색) |
| 03 | `03-index-demo-notice-box.png` | 데모 안내 박스 (초록색) |
| 04 | `04-index-question-list-box.png` | 문항 목록 박스 (회색) |
| 05 | `05-main-page-full.png` | 메인 페이지 전체 |
| 06 | `06-main-header-black-bg.png` | 메인 헤더 (검은 배경) |
| 10 | `10-exam-page-full.png` | 시험 화면 전체 |
| 11 | `11-exam-header-black-bg.png` | 시험 헤더 (검은 배경) |
| 12 | `12-exam-progress-dots.png` | 진행 상황 점 |
| 15 | `15-exam-radio-buttons.png` | 라디오 버튼 |
| 22 | `22-admin-dashboard.png` | Admin 대시보드 |
| 23 | `23-admin-sidebar.png` | Admin 사이드바 |
| 27 | `27-admin-questions-page.png` | 문제 관리 페이지 |
| 30 | `30-admin-add-question-menu.png` | 문항 추가 메뉴 |
| 32 | `32-admin-question-form-modal.png` | 문제 추가 모달 |

## ✅ 테스트 결과 (자동)

```bash
node tests/automated-test.js
```

**출력 예시:**
```
🚀 생성형 AI 활용 역량평가 시스템 E2E 테스트 시작
============================================================

📄 Test Suite 1: index.html 페이지 테스트
✅ index.html 페이지 열기
✅ 시험 정보 박스 표시
✅ 데모 안내 박스 표시
✅ 문항 목록 박스 표시

🏠 Test Suite 2: 메인 페이지 테스트
✅ 메인 페이지 열기
✅ 헤더 검은 배경 확인
✅ 헤더 텍스트 확인

📝 Test Suite 3: 시험 플로우 테스트
✅ 로그인
✅ 시험 페이지 이동
✅ 시험 헤더 검은 배경 확인
✅ 진행 상황 점 표시
✅ 라디오 버튼 표시
✅ 답변 선택
✅ 다음 문제 이동

👤 Test Suite 4: Admin 대시보드 테스트
✅ Admin 로그인
✅ Admin 페이지 이동
✅ 사이드바 표시
✅ 통계 카드 표시

📚 Test Suite 5: Admin 문제 관리 테스트
✅ 문제 관리 페이지 이동
✅ 문항 추가 메뉴 표시
✅ 문제 추가 모달 표시
✅ 역량 선택
✅ 폼 입력
✅ 취소 버튼 작동

============================================================
📊 테스트 결과 요약
============================================================
총 테스트: 24
✅ 통과: 24
❌ 실패: 0
📸 스크린샷: 19개
```

## 🔧 문제 해결

### 브라우저가 열리지 않을 때

```bash
# Chromium 재설치
npx playwright install chromium --force

# 의존성 설치 (Linux)
npx playwright install-deps chromium
```

### 서버 연결 실패

```bash
# 백엔드 확인
curl http://localhost:8000/docs

# 프론트엔드 확인
curl http://localhost:3000
```

### 권한 오류 (Windows)

```powershell
# PowerShell을 관리자 권한으로 실행
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 추가 문서

- **`README.md`**: 전체 테스트 개요 및 Playwright MCP 명령어
- **`full-test-suite.md`**: 완전한 테스트 수트 (43개 스크린샷)
- **`automated-test.js`**: 자동화 스크립트 (실제 실행용)

## 💡 팁

1. **headless: false** 옵션으로 브라우저 동작을 직접 볼 수 있습니다
2. **fullPage: true** 옵션으로 전체 페이지를 촬영할 수 있습니다
3. **selector** 옵션으로 특정 요소만 스크린샷을 찍을 수 있습니다
4. **savePng: true** 옵션으로 스크린샷을 파일로 저장합니다

## 🎉 완료!

모든 테스트가 준비되었습니다. 위의 명령어들을 순서대로 실행하여 전체 애플리케이션을 테스트하세요!

---

**문의사항이나 이슈가 있으면 `tests/` 디렉토리의 다른 문서들을 참고하세요.**






