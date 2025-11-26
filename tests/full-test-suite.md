# 전체 E2E 테스트 수트

## 테스트 준비

### 1. 서버 실행 확인
```bash
# 터미널 1: 백엔드
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 터미널 2: 프론트엔드  
cd frontend
npm run dev
```

### 2. Playwright 브라우저 설치
```bash
# 방법 1: 전역 설치
npm install -g playwright
npx playwright install chromium

# 방법 2: 프로젝트 로컬 설치
cd frontend
npm install @playwright/test
npx playwright install chromium
```

### 3. 테스트 계정
- **수험자**: test@example.com / password123
- **관리자**: admin@test.com / admin123

---

## Part 1: index.html 페이지 테스트

### 테스트 목표
시작 페이지의 UI와 색상이 정확한지 확인

### 실행 명령어

```javascript
// 1. 페이지 열기
mcp_playwright_playwright_navigate({
    url: "file:///G:/sync/New_Project/vibe_coding/kpc/index.html",
    headless: false,
    width: 1920,
    height: 1080
})

// 2. 전체 페이지 스크린샷
mcp_playwright_playwright_screenshot({
    name: "01-index-page-full",
    fullPage: true,
    savePng: true
})

// 3. 페이지 텍스트 확인
mcp_playwright_playwright_get_visible_text()

// 4. 시험 정보 박스 스크린샷 (파란색 박스)
mcp_playwright_playwright_screenshot({
    name: "02-index-exam-info-box",
    selector: ".exam-info",
    savePng: true
})

// 5. 데모 안내 박스 스크린샷 (초록색 박스)
mcp_playwright_playwright_screenshot({
    name: "03-index-demo-notice-box",
    selector: ".demo-notice",
    savePng: true
})

// 6. 문항 목록 박스 스크린샷 (회색 박스)
mcp_playwright_playwright_screenshot({
    name: "04-index-question-list-box",
    selector: ".question-list",
    savePng: true
})
```

### 검증 체크리스트
- [ ] 헤더 배경색이 진한 파란색(`primary-800`)
- [ ] 시험 정보 박스가 진한 파란색(`info-200`)
- [ ] 데모 안내 박스가 진한 초록색(`success-200`)
- [ ] 문항 목록 박스가 회색(`neutral-200`)
- [ ] 시험 시작하기 버튼이 표시됨

---

## Part 2: 수험자 화면 테스트

### 2-1. 메인 페이지 (로그인 전)

```javascript
// 1. 메인 페이지 열기
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000",
    headless: false,
    width: 1920,
    height: 1080
})

// 2. 전체 페이지 스크린샷
mcp_playwright_playwright_screenshot({
    name: "05-main-page-full",
    fullPage: true,
    savePng: true
})

// 3. 헤더 영역 확인 (검은 배경/흰 글자)
mcp_playwright_playwright_screenshot({
    name: "06-main-header-black-bg",
    selector: "header",
    savePng: true
})

// 4. 페이지 텍스트 확인
mcp_playwright_playwright_get_visible_text()
```

**검증 체크리스트:**
- [ ] 헤더 배경이 검은색(`bg-black`)
- [ ] "생성형 AI 활용 역량평가" 텍스트가 흰색
- [ ] "Generative AI Proficiency Assessment" 텍스트가 회색
- [ ] 수험자 정보가 표시됨
- [ ] 로그아웃 버튼이 있음

### 2-2. 로그인 페이지

```javascript
// 1. 로그인 페이지로 이동 (로그아웃 상태인 경우)
mcp_playwright_playwright_click({
    selector: "button:has-text('로그아웃')"
})

// 2. 로그인 페이지 스크린샷
mcp_playwright_playwright_screenshot({
    name: "07-login-page",
    fullPage: true,
    savePng: true
})

// 3. 이메일 입력
mcp_playwright_playwright_fill({
    selector: "input[type='email']",
    value: "test@example.com"
})

// 4. 비밀번호 입력
mcp_playwright_playwright_fill({
    selector: "input[type='password']",
    value: "password123"
})

// 5. 입력 후 스크린샷
mcp_playwright_playwright_screenshot({
    name: "08-login-form-filled",
    savePng: true
})

// 6. 로그인 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button[type='submit']"
})

// 대기 (2초)
// await new Promise(resolve => setTimeout(resolve, 2000));

// 7. 로그인 후 페이지 스크린샷
mcp_playwright_playwright_screenshot({
    name: "09-after-login",
    fullPage: true,
    savePng: true
})
```

**검증 체크리스트:**
- [ ] 로그인 폼이 정상 표시
- [ ] 이메일/비밀번호 입력 필드 작동
- [ ] 로그인 후 메인 페이지로 리다이렉션

### 2-3. 시험 화면

```javascript
// 1. 시험 페이지로 이동
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000/exam/questions/1",
    headless: false
})

// 2. 전체 시험 화면 스크린샷
mcp_playwright_playwright_screenshot({
    name: "10-exam-page-full",
    fullPage: true,
    savePng: true
})

// 3. 시험 헤더 스크린샷 (검은 배경/흰 글자)
mcp_playwright_playwright_screenshot({
    name: "11-exam-header-black-bg",
    selector: "header",
    savePng: true
})

// 4. 진행 상황 점(dots) 확인
mcp_playwright_playwright_screenshot({
    name: "12-exam-progress-dots",
    selector: "header > div:nth-child(2)",
    savePng: true
})

// 5. 타이머 및 저장 상태 확인
mcp_playwright_playwright_screenshot({
    name: "13-exam-timer-status",
    selector: "header > div:nth-child(3)",
    savePng: true
})

// 6. 문제 내용 영역
mcp_playwright_playwright_screenshot({
    name: "14-exam-question-content",
    selector: "main",
    savePng: true
})

// 7. 객관식 라디오 버튼 확인
mcp_playwright_playwright_screenshot({
    name: "15-exam-radio-buttons",
    selector: ".answer-options",
    savePng: true
})

// 8. 첫 번째 선택지 클릭
mcp_playwright_playwright_click({
    selector: "input[type='radio']:first-of-type"
})

// 9. 선택 후 스크린샷
mcp_playwright_playwright_screenshot({
    name: "16-exam-answer-selected",
    savePng: true
})

// 10. 네비게이션 버튼 영역
mcp_playwright_playwright_screenshot({
    name: "17-exam-navigation",
    selector: "footer",
    savePng: true
})

// 11. 다음 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('다음')"
})

// 12. 다음 문제 스크린샷
mcp_playwright_playwright_screenshot({
    name: "18-exam-next-question",
    fullPage: true,
    savePng: true
})

// 13. 사이드바 열기 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button[title='문항 목록']"
})

// 14. 사이드바 스크린샷
mcp_playwright_playwright_screenshot({
    name: "19-exam-sidebar",
    savePng: true
})
```

**검증 체크리스트:**
- [ ] 헤더가 검은 배경(`bg-black`)에 흰 글자
- [ ] "생성형 AI 활용 역량평가" 텍스트가 흰색
- [ ] 타이머가 작동하고 표시됨
- [ ] 진행 상황 점이 표시됨 (현재 문제는 숫자, 응답한 문제는 ●, 미응답은 ○)
- [ ] 저장 상태가 표시됨
- [ ] 수험번호가 표시됨
- [ ] 객관식 라디오 버튼이 크고 명확하게 표시됨
- [ ] 선택 시 시각적 피드백이 있음
- [ ] 이전/다음 버튼이 중앙에 위치
- [ ] 사이드바가 정상 작동

---

## Part 3: Admin 화면 테스트

### 3-1. Admin 로그인

```javascript
// 1. 로그아웃
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000"
})

mcp_playwright_playwright_click({
    selector: "button:has-text('로그아웃')"
})

// 2. Admin 계정으로 로그인
mcp_playwright_playwright_fill({
    selector: "input[type='email']",
    value: "admin@test.com"
})

mcp_playwright_playwright_fill({
    selector: "input[type='password']",
    value: "admin123"
})

mcp_playwright_playwright_screenshot({
    name: "20-admin-login-form",
    savePng: true
})

mcp_playwright_playwright_click({
    selector: "button[type='submit']"
})

// 대기
// await new Promise(resolve => setTimeout(resolve, 2000));

// 3. Admin 페이지로 이동
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000/admin"
})

mcp_playwright_playwright_screenshot({
    name: "21-admin-dashboard-full",
    fullPage: true,
    savePng: true
})
```

### 3-2. Admin 대시보드

```javascript
// 1. 대시보드 전체 스크린샷
mcp_playwright_playwright_screenshot({
    name: "22-admin-dashboard",
    fullPage: true,
    savePng: true
})

// 2. 사이드바 네비게이션
mcp_playwright_playwright_screenshot({
    name: "23-admin-sidebar",
    selector: "nav",
    savePng: true
})

// 3. 통계 카드 영역
mcp_playwright_playwright_screenshot({
    name: "24-admin-stats",
    selector: ".grid.grid-cols-5",
    savePng: true
})

// 4. 사용자 목록 테이블
mcp_playwright_playwright_screenshot({
    name: "25-admin-users-table",
    selector: "div.bg-white:nth-of-type(1) table",
    savePng: true
})

// 5. 시험 결과 테이블
mcp_playwright_playwright_screenshot({
    name: "26-admin-exams-table",
    selector: "div.bg-white:nth-of-type(2) table",
    savePng: true
})
```

**검증 체크리스트:**
- [ ] 사이드바가 컴팩트하고 깔끔한 디자인
- [ ] 사이드바 아이콘이 SVG로 표시
- [ ] 통계 카드가 뉴트럴 컬러로 표시
- [ ] 테이블이 컴팩트한 디자인
- [ ] 테이블 헤더가 대문자 + wide tracking

### 3-3. 문제 관리 페이지

```javascript
// 1. 문제 관리 페이지로 이동
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000/admin/questions"
})

// 2. 전체 페이지 스크린샷
mcp_playwright_playwright_screenshot({
    name: "27-admin-questions-page",
    fullPage: true,
    savePng: true
})

// 3. 헤더 영역 (문항 추가 버튼 포함)
mcp_playwright_playwright_screenshot({
    name: "28-admin-questions-header",
    selector: "div.flex.items-center.justify-between",
    savePng: true
})

// 4. 문제 목록 테이블
mcp_playwright_playwright_screenshot({
    name: "29-admin-questions-table",
    selector: "table",
    savePng: true
})

// 5. 문항 추가 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('문항 추가')"
})

// 6. 드롭다운 메뉴 스크린샷
mcp_playwright_playwright_screenshot({
    name: "30-admin-add-question-menu",
    savePng: true
})

// 7. "역량 A" 빠른 추가 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('역량 A')"
})

// 대기
// await new Promise(resolve => setTimeout(resolve, 1000));

// 8. 추가된 문제 확인
mcp_playwright_playwright_screenshot({
    name: "31-admin-question-added",
    fullPage: true,
    savePng: true
})
```

**검증 체크리스트:**
- [ ] 문항 추가 드롭다운 메뉴가 표시
- [ ] 역량별 빠른 추가 옵션이 뉴트럴 컬러
- [ ] "직접 입력하기" 옵션이 하단에 표시
- [ ] 테이블이 컴팩트하게 표시
- [ ] 수정/삭제 버튼이 뉴트럴 컬러

### 3-4. 문제 추가 폼 (직접 입력)

```javascript
// 1. 다시 문항 추가 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('문항 추가')"
})

// 2. 직접 입력하기 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('직접 입력하기')"
})

// 3. 모달 전체 스크린샷
mcp_playwright_playwright_screenshot({
    name: "32-admin-question-form-modal",
    savePng: true
})

// 4. 역량 선택 영역
mcp_playwright_playwright_screenshot({
    name: "33-admin-form-competency-section",
    selector: "form > div:nth-child(1)",
    savePng: true
})

// 5. 역량 A 선택
mcp_playwright_playwright_click({
    selector: "button:has-text('역량 A: 기초 이해 및 활용')"
})

// 6. 역량 선택 후 스크린샷
mcp_playwright_playwright_screenshot({
    name: "34-admin-form-competency-selected",
    savePng: true
})

// 7. 기본 정보 섹션
mcp_playwright_playwright_screenshot({
    name: "35-admin-form-basic-info",
    selector: "form > div:nth-child(2)",
    savePng: true
})

// 8. 문제 번호 입력
mcp_playwright_playwright_fill({
    selector: "input[type='number']",
    value: "99"
})

// 9. 제목 입력
mcp_playwright_playwright_fill({
    selector: "input[type='text']",
    value: "테스트 문제"
})

// 10. 배점 입력
mcp_playwright_playwright_fill({
    selector: "input[name='points']",
    value: "10"
})

// 11. 입력 후 스크린샷
mcp_playwright_playwright_screenshot({
    name: "36-admin-form-filled",
    fullPage: true,
    savePng: true
})

// 12. 취소 버튼 영역
mcp_playwright_playwright_screenshot({
    name: "37-admin-form-buttons",
    selector: "div.flex.gap-2.justify-end",
    savePng: true
})

// 13. 취소 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('취소')"
})
```

**검증 체크리스트:**
- [ ] 모달이 깔끔하게 표시 (백드롭 블러 효과)
- [ ] X 닫기 버튼이 우측 상단에 있음
- [ ] 역량 선택이 컴팩트한 디자인
- [ ] 역량 선택 버튼이 뉴트럴 컬러
- [ ] 선택된 역량이 강조 표시
- [ ] 폼 섹션들이 컴팩트하게 정리됨
- [ ] 입력 필드가 작고 밀도가 높음
- [ ] 라벨이 작은 폰트 (text-xs)
- [ ] 버튼이 컴팩트 (px-4 py-2)

### 3-5. 문제 수정

```javascript
// 1. 첫 번째 문제의 수정 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('수정'):first-of-type"
})

// 2. 수정 모달 스크린샷
mcp_playwright_playwright_screenshot({
    name: "38-admin-edit-question-modal",
    fullPage: true,
    savePng: true
})

// 3. 제목 수정
mcp_playwright_playwright_fill({
    selector: "input[name='title']",
    value: "수정된 테스트 문제"
})

// 4. 수정 후 스크린샷
mcp_playwright_playwright_screenshot({
    name: "39-admin-edit-question-modified",
    savePng: true
})

// 5. 취소
mcp_playwright_playwright_click({
    selector: "button:has-text('취소')"
})
```

**검증 체크리스트:**
- [ ] 기존 데이터가 폼에 채워져 있음
- [ ] 수정이 정상적으로 작동
- [ ] 취소 버튼이 작동

### 3-6. 문제 활성/비활성 토글

```javascript
// 1. 활성 상태 버튼 클릭
mcp_playwright_playwright_click({
    selector: "button:has-text('활성'):first-of-type"
})

// 대기
// await new Promise(resolve => setTimeout(resolve, 1000));

// 2. 비활성 상태 스크린샷
mcp_playwright_playwright_screenshot({
    name: "40-admin-question-inactive",
    selector: "tr.opacity-50",
    savePng: true
})

// 3. 다시 활성화
mcp_playwright_playwright_click({
    selector: "button:has-text('비활성'):first-of-type"
})

// 대기
// await new Promise(resolve => setTimeout(resolve, 1000));

// 4. 활성 상태 스크린샷
mcp_playwright_playwright_screenshot({
    name: "41-admin-question-active",
    savePng: true
})
```

**검증 체크리스트:**
- [ ] 비활성화 시 행이 투명하게 표시 (opacity-50)
- [ ] 활성/비활성 버튼 색상이 뉴트럴 톤
- [ ] 상태 변경이 즉시 반영

---

## Part 4: 종합 테스트

### 4-1. 전체 플로우 테스트

```javascript
// 1. 메인 페이지 → 로그인 → 시험 → 제출 → 결과
// (위의 수험자 테스트 참조)

// 2. Admin 로그인 → 문제 관리 → 문제 추가 → 채점
// (위의 Admin 테스트 참조)
```

### 4-2. 반응형 테스트 (모바일)

```javascript
// 1. 모바일 사이즈로 변경
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000",
    width: 375,
    height: 812
})

// 2. 모바일 메인 페이지
mcp_playwright_playwright_screenshot({
    name: "42-mobile-main-page",
    fullPage: true,
    savePng: true
})

// 3. 모바일 시험 화면
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000/exam/questions/1"
})

mcp_playwright_playwright_screenshot({
    name: "43-mobile-exam-page",
    fullPage: true,
    savePng: true
})
```

### 4-3. 브라우저 호환성 테스트

```javascript
// Firefox로 테스트
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000",
    browserType: "firefox"
})

// WebKit (Safari)로 테스트
mcp_playwright_playwright_navigate({
    url: "http://localhost:3000",
    browserType: "webkit"
})
```

---

## 테스트 결과 정리

### 생성된 스크린샷 목록

1. `01-index-page-full.png` - index.html 전체
2. `02-index-exam-info-box.png` - 시험 정보 박스 (파란색)
3. `03-index-demo-notice-box.png` - 데모 안내 박스 (초록색)
4. `04-index-question-list-box.png` - 문항 목록 박스 (회색)
5. `05-main-page-full.png` - 메인 페이지 전체
6. `06-main-header-black-bg.png` - 메인 헤더 (검은 배경)
7. `07-login-page.png` - 로그인 페이지
8. `08-login-form-filled.png` - 로그인 폼 입력 후
9. `09-after-login.png` - 로그인 후 페이지
10. `10-exam-page-full.png` - 시험 화면 전체
11. `11-exam-header-black-bg.png` - 시험 헤더 (검은 배경)
12. `12-exam-progress-dots.png` - 진행 상황 점
13. `13-exam-timer-status.png` - 타이머 및 저장 상태
14. `14-exam-question-content.png` - 문제 내용
15. `15-exam-radio-buttons.png` - 라디오 버튼
16. `16-exam-answer-selected.png` - 답변 선택 후
17. `17-exam-navigation.png` - 네비게이션 버튼
18. `18-exam-next-question.png` - 다음 문제
19. `19-exam-sidebar.png` - 사이드바
20-41. Admin 관련 스크린샷들
42-43. 모바일 뷰 스크린샷들

### 최종 체크리스트

#### 색상 및 디자인
- [ ] 모든 헤더가 검은 배경에 흰 글자
- [ ] index.html 박스들이 진한 색상
- [ ] Admin 화면이 컴팩트하고 뉴트럴 톤
- [ ] 원색 사용이 제거됨

#### 기능
- [ ] 로그인/로그아웃 작동
- [ ] 시험 화면 네비게이션 작동
- [ ] 객관식 라디오 버튼 명확함
- [ ] Admin 문제 추가/수정/삭제 작동
- [ ] 역량별 문제 추가 작동

#### UX
- [ ] 모든 버튼이 명확하게 보임
- [ ] 폼이 사용하기 쉬움
- [ ] 피드백이 즉각적임
- [ ] 로딩 상태가 표시됨

---

## 문제 해결

### Playwright 브라우저 설치 안 됨
```bash
# Windows
npm install -g playwright
npx playwright install chromium --with-deps

# 권한 문제 시
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 서버 연결 실패
- 백엔드: http://localhost:8000 확인
- 프론트엔드: http://localhost:3000 확인
- 방화벽 확인

### 스크린샷 저장 안 됨
- `savePng: true` 옵션 사용
- 저장 경로 권한 확인
- Downloads 폴더 확인

---

## 다음 단계

1. 위의 명령어들을 순차적으로 실행
2. 각 스크린샷을 검토하여 이슈 확인
3. 발견된 이슈를 `tests/test-results.json`에 기록
4. 필요시 버그 수정 후 재테스트








