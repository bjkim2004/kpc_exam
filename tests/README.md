# E2E 테스트 가이드

## 개요

이 디렉토리는 **생성형 AI 활용 역량평가 시스템**의 End-to-End 자동화 테스트를 위한 Playwright MCP 기반 테스트 도구를 포함합니다.

## 파일 구조

```
tests/
├── README.md              # 이 파일
├── e2e-test.js           # JavaScript 테스트 시나리오 정의
├── run_tests.py          # Python 테스트 실행 가이드
├── screenshots/          # 스크린샷 저장 디렉토리
└── test-results.json     # 테스트 결과 저장
```

## 사전 준비

### 1. 서버 실행

**백엔드 서버:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**프론트엔드 서버:**
```bash
cd frontend
npm run dev
```

### 2. 테스트 계정

- **일반 사용자:** test@example.com / password123
- **관리자:** admin@test.com / admin123

## 테스트 케이스

### TC001: 메인 페이지 로드
- **목적:** 메인 페이지가 정상적으로 로드되는지 확인
- **검증:** 헤더 텍스트, 레이아웃, 버튼 존재 여부

### TC002: 로그인 기능
- **목적:** 사용자 인증 기능 확인
- **검증:** 로그인 폼, 입력 필드, 제출 후 리다이렉션

### TC003: 시험 페이지
- **목적:** 시험 화면의 UI/UX 확인
- **검증:** 헤더(검은 배경/흰 글자), 문제 표시, 네비게이션

### TC004: Admin 페이지
- **목적:** 관리자 기능 접근 및 확인
- **검증:** 대시보드, 사이드바, 통계 정보

### TC005: 문제 관리
- **목적:** 문제 CRUD 기능 확인
- **검증:** 문제 목록, 추가/수정/삭제 버튼, 폼 모달

## Playwright MCP 명령어

### 1. 페이지 열기
```javascript
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000",
    headless: false,
    width: 1920,
    height: 1080
})
```

### 2. 텍스트 확인
```javascript
mcp_playwright_playwright_get_visible_text()
```

### 3. 스크린샷 촬영
```javascript
mcp_playwright_playwright_screenshot({
    name: "test-screenshot",
    fullPage: true,
    savePng: true
})
```

### 4. 요소 클릭
```javascript
mcp_playwright_playwright_click({
    selector: "button[type='submit']"
})
```

### 5. 입력 필드 작성
```javascript
mcp_playwright_playwright_fill({
    selector: "input[type='email']",
    value: "admin@test.com"
})
```

### 6. HTML 가져오기
```javascript
mcp_playwright_playwright_get_visible_html({
    selector: "header",
    cleanHtml: true
})
```

## 테스트 실행 방법

### Python 가이드 스크립트 실행
```bash
python tests/run_tests.py
```

이 스크립트는 테스트 케이스 목록과 MCP 명령어 예시를 출력합니다.

### 수동 테스트 실행

1. **MCP 도구 사용하여 브라우저 열기**
2. **각 테스트 케이스별로 명령어 실행**
3. **스크린샷 저장 및 결과 확인**
4. **결과를 test-results.json에 기록**

## 테스트 시나리오 예시

### 시나리오 1: 완전한 사용자 플로우

```javascript
// 1. 메인 페이지 열기
await navigate({ url: "http://localhost:3000" });
await screenshot({ name: "01-main-page" });

// 2. 로그인
await fill({ selector: "input[type='email']", value: "test@example.com" });
await fill({ selector: "input[type='password']", value: "password123" });
await click({ selector: "button[type='submit']" });
await screenshot({ name: "02-after-login" });

// 3. 시험 시작
await click({ selector: "button:has-text('시험 시작')" });
await screenshot({ name: "03-exam-start" });

// 4. 문제 풀이
await click({ selector: "input[type='radio']:first-child" });
await click({ selector: "button:has-text('다음')" });
await screenshot({ name: "04-question-answered" });

// 5. 시험 제출
await click({ selector: "button:has-text('제출')" });
await screenshot({ name: "05-exam-submitted" });
```

### 시나리오 2: Admin 문제 관리

```javascript
// 1. Admin 로그인
await navigate({ url: "http://localhost:3000" });
await fill({ selector: "input[type='email']", value: "admin@test.com" });
await fill({ selector: "input[type='password']", value: "admin123" });
await click({ selector: "button[type='submit']" });

// 2. Admin 페이지 이동
await navigate({ url: "http://localhost:3000/admin/questions" });
await screenshot({ name: "admin-01-questions-list" });

// 3. 문항 추가 버튼 클릭
await click({ selector: "button:has-text('문항 추가')" });
await screenshot({ name: "admin-02-add-modal" });

// 4. 역량 선택
await click({ selector: "button:has-text('역량 A')" });
await screenshot({ name: "admin-03-competency-selected" });

// 5. 폼 작성
await fill({ selector: "input[name='question_number']", value: "99" });
await fill({ selector: "input[name='title']", value: "테스트 문제" });
await fill({ selector: "textarea[name='content']", value: "테스트 내용" });
await fill({ selector: "input[name='points']", value: "10" });
await screenshot({ name: "admin-04-form-filled" });

// 6. 제출
await click({ selector: "button[type='submit']" });
await screenshot({ name: "admin-05-submitted" });
```

## 검증 체크리스트

### 메인 페이지
- [ ] "생성형 AI 활용 역량평가" 텍스트 표시
- [ ] "Generative AI Proficiency Assessment" 텍스트 표시
- [ ] 헤더가 검은 배경(`bg-black`)에 흰 글자
- [ ] 로그아웃 버튼 존재

### 시험 페이지
- [ ] 헤더가 검은 배경에 흰 글자로 표시
- [ ] 타이머 작동
- [ ] 진행 상황 점(dots) 표시
- [ ] 이전/다음 버튼 정상 작동
- [ ] 자동 저장 상태 표시

### Admin 페이지
- [ ] 사이드바 네비게이션 표시
- [ ] 대시보드 통계 정보 표시
- [ ] 문제 관리 테이블 표시
- [ ] 문항 추가/수정/삭제 버튼 작동
- [ ] 모달 폼 정상 작동

## 스크린샷 네이밍 규칙

```
{test-case}-{step-number}-{description}.png
```

예시:
- `TC001-01-main-page.png`
- `TC003-02-exam-header.png`
- `TC005-03-question-form.png`

## 주의사항

1. **테스트 순서:** 일부 테스트는 이전 테스트의 상태에 의존할 수 있습니다.
2. **데이터 정리:** 테스트 후 생성된 데이터는 수동으로 삭제해야 합니다.
3. **스크린샷:** 스크린샷은 자동으로 `tests/screenshots/` 디렉토리에 저장됩니다.
4. **타이밍:** 일부 작업은 완료까지 시간이 걸릴 수 있으므로 적절한 대기 시간을 추가하세요.

## 문제 해결

### 브라우저가 열리지 않는 경우
```bash
npx playwright install chromium
```

### 서버 연결 실패
- 백엔드와 프론트엔드 서버가 실행 중인지 확인
- 포트 충돌 확인 (3000, 8000)

### 스크린샷이 저장되지 않는 경우
- `tests/screenshots/` 디렉토리 권한 확인
- `savePng: true` 옵션 사용 확인

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev)
- [MCP 프로토콜](https://modelcontextprotocol.io)
- 프로젝트 Wiki (내부 문서)






