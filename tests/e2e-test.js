/**
 * 생성형 AI 활용 역량평가 시스템 E2E 테스트
 * Playwright MCP를 사용한 자동화 테스트 스크립트
 */

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000';

// 테스트 시나리오 정의
const testScenarios = {
  // 1. 메인 페이지 테스트
  mainPage: {
    name: '메인 페이지 로드 및 확인',
    url: BASE_URL,
    checks: [
      { type: 'text', value: '생성형 AI 활용 역량평가' },
      { type: 'text', value: 'Generative AI Proficiency Assessment' },
      { type: 'element', selector: 'button', contains: '로그인' }
    ]
  },

  // 2. 로그인 테스트
  login: {
    name: '로그인 기능 테스트',
    steps: [
      { action: 'fill', selector: 'input[type="email"]', value: 'test@example.com' },
      { action: 'fill', selector: 'input[type="password"]', value: 'password123' },
      { action: 'click', selector: 'button[type="submit"]' },
      { action: 'wait', time: 2000 }
    ]
  },

  // 3. 시험 페이지 테스트
  examPage: {
    name: '시험 페이지 네비게이션',
    url: `${BASE_URL}/exam/questions/1`,
    checks: [
      { type: 'text', value: '생성형 AI 활용 역량평가' },
      { type: 'element', selector: 'button', contains: '다음' },
      { type: 'element', selector: 'button', contains: '이전' }
    ]
  },

  // 4. Admin 페이지 테스트
  adminPage: {
    name: 'Admin 페이지 접근',
    url: `${BASE_URL}/admin`,
    checks: [
      { type: 'text', value: '관리자 대시보드' },
      { type: 'text', value: '문제 관리' }
    ]
  },

  // 5. 문제 관리 테스트
  questionManagement: {
    name: '문제 관리 기능',
    url: `${BASE_URL}/admin/questions`,
    checks: [
      { type: 'text', value: '문제 관리' },
      { type: 'element', selector: 'button', contains: '문항 추가' }
    ]
  }
};

// 테스트 결과 저장
const testResults = {
  passed: [],
  failed: [],
  screenshots: []
};

// 색상 코드 (터미널 출력용)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 로그 헬퍼
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// 테스트 실행 함수들은 MCP 도구를 수동으로 호출해야 합니다
// 이 스크립트는 테스트 시나리오 정의와 가이드 역할을 합니다

log('\n' + '='.repeat(60), colors.cyan);
log('생성형 AI 활용 역량평가 시스템 E2E 테스트 스크립트', colors.bright + colors.cyan);
log('='.repeat(60) + '\n', colors.cyan);

logInfo('이 스크립트는 Playwright MCP 도구를 사용한 테스트 가이드입니다.');
logInfo('실제 테스트는 MCP 도구를 통해 수동으로 실행해야 합니다.\n');

// 테스트 시나리오 출력
log('📋 테스트 시나리오:', colors.bright);
Object.entries(testScenarios).forEach(([key, scenario], index) => {
  log(`\n${index + 1}. ${scenario.name}`, colors.yellow);
  if (scenario.url) {
    log(`   URL: ${scenario.url}`, colors.reset);
  }
  if (scenario.checks) {
    log('   체크 항목:', colors.reset);
    scenario.checks.forEach(check => {
      log(`   - ${check.type}: ${check.value || check.selector}`, colors.reset);
    });
  }
  if (scenario.steps) {
    log('   실행 단계:', colors.reset);
    scenario.steps.forEach((step, i) => {
      log(`   ${i + 1}. ${step.action}: ${step.selector || step.time}`, colors.reset);
    });
  }
});

log('\n' + '='.repeat(60), colors.cyan);
log('테스트 실행 방법:', colors.bright + colors.cyan);
log('='.repeat(60) + '\n', colors.cyan);

logInfo('1. 프론트엔드 서버 실행: cd frontend && npm run dev');
logInfo('2. 백엔드 서버 실행: cd backend && python -m uvicorn app.main:app --reload');
logInfo('3. Playwright MCP 도구를 사용하여 각 테스트 시나리오 실행');
logInfo('4. 스크린샷 저장 및 결과 확인\n');

// 샘플 테스트 명령어
log('📝 샘플 MCP 명령어 예시:', colors.bright);
log('');
log('# 1. 브라우저 열기 및 메인 페이지 이동', colors.yellow);
log('mcp_playwright_playwright_navigate({', colors.reset);
log('  url: "http://localhost:3000",', colors.reset);
log('  headless: false,', colors.reset);
log('  width: 1920,', colors.reset);
log('  height: 1080', colors.reset);
log('});', colors.reset);
log('');

log('# 2. 페이지 텍스트 확인', colors.yellow);
log('mcp_playwright_playwright_get_visible_text();', colors.reset);
log('');

log('# 3. 스크린샷 촬영', colors.yellow);
log('mcp_playwright_playwright_screenshot({', colors.reset);
log('  name: "main-page",', colors.reset);
log('  fullPage: true,', colors.reset);
log('  savePng: true', colors.reset);
log('});', colors.reset);
log('');

log('# 4. 입력 필드 채우기', colors.yellow);
log('mcp_playwright_playwright_fill({', colors.reset);
log('  selector: "input[type=email]",', colors.reset);
log('  value: "admin@test.com"', colors.reset);
log('});', colors.reset);
log('');

log('# 5. 버튼 클릭', colors.yellow);
log('mcp_playwright_playwright_click({', colors.reset);
log('  selector: "button[type=submit]"', colors.reset);
log('});', colors.reset);
log('');

log('\n' + '='.repeat(60) + '\n', colors.cyan);

module.exports = {
  testScenarios,
  BASE_URL,
  API_URL
};








