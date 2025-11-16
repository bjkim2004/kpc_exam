#!/usr/bin/env python3
"""
생성형 AI 활용 역량평가 시스템 자동화 테스트
Playwright MCP를 활용한 E2E 테스트 실행 스크립트
"""

import time
import json
from datetime import datetime
from pathlib import Path

# 테스트 설정
BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:8000"
SCREENSHOTS_DIR = Path("tests/screenshots")
RESULTS_FILE = Path("tests/test-results.json")

# 스크린샷 디렉토리 생성
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

# 색상 코드
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'

def log(message, color=Colors.RESET):
    print(f"{color}{message}{Colors.RESET}")

def log_success(message):
    log(f"[SUCCESS] {message}", Colors.GREEN)

def log_error(message):
    log(f"[ERROR] {message}", Colors.RED)

def log_info(message):
    log(f"[INFO] {message}", Colors.BLUE)

def log_warning(message):
    log(f"[WARNING] {message}", Colors.YELLOW)

def log_section(title):
    log(f"\n{'='*60}", Colors.CYAN)
    log(f"{title}", Colors.BOLD + Colors.CYAN)
    log(f"{'='*60}\n", Colors.CYAN)

# 테스트 결과 저장
test_results = {
    "start_time": datetime.now().isoformat(),
    "end_time": None,
    "total_tests": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}

# 테스트 케이스 정의
test_cases = [
    {
        "id": "TC001",
        "name": "메인 페이지 로드",
        "description": "메인 페이지가 정상적으로 로드되고 주요 요소들이 표시되는지 확인",
        "steps": [
            "브라우저 열기 및 메인 페이지 이동",
            "페이지 텍스트 확인",
            "스크린샷 저장"
        ],
        "expected": [
            "생성형 AI 활용 역량평가 텍스트 존재",
            "Generative AI Proficiency Assessment 텍스트 존재"
        ]
    },
    {
        "id": "TC002",
        "name": "로그인 페이지 테스트",
        "description": "로그인 페이지 표시 및 입력 필드 확인",
        "steps": [
            "로그인 페이지로 이동",
            "이메일 입력 필드 확인",
            "비밀번호 입력 필드 확인",
            "스크린샷 저장"
        ],
        "expected": [
            "로그인 폼 존재",
            "이메일 입력 필드 존재",
            "비밀번호 입력 필드 존재"
        ]
    },
    {
        "id": "TC003",
        "name": "시험 헤더 테스트",
        "description": "시험 화면의 헤더가 검은 배경에 흰 글자로 표시되는지 확인",
        "steps": [
            "시험 페이지로 이동 (인증 필요)",
            "헤더 영역 스크린샷",
            "헤더 텍스트 확인"
        ],
        "expected": [
            "생성형 AI 활용 역량평가 헤더 존재",
            "검은 배경 (bg-black) 적용"
        ]
    },
    {
        "id": "TC004",
        "name": "Admin 페이지 접근",
        "description": "Admin 페이지 접근 및 주요 기능 확인",
        "steps": [
            "Admin 로그인",
            "대시보드 페이지 확인",
            "문제 관리 페이지 이동",
            "스크린샷 저장"
        ],
        "expected": [
            "관리자 대시보드 텍스트 존재",
            "문제 관리 메뉴 존재"
        ]
    },
    {
        "id": "TC005",
        "name": "문제 추가 기능",
        "description": "Admin에서 새 문제를 추가할 수 있는지 확인",
        "steps": [
            "문제 관리 페이지 이동",
            "문항 추가 버튼 클릭",
            "폼 모달 확인",
            "스크린샷 저장"
        ],
        "expected": [
            "문항 추가 버튼 존재",
            "문제 추가 폼 표시"
        ]
    }
]

def print_test_guide():
    """테스트 가이드 출력"""
    log_section("생성형 AI 활용 역량평가 시스템 E2E 테스트")
    
    log_info("이 스크립트는 Playwright MCP를 사용한 테스트 가이드입니다.")
    log_info("실제 테스트 실행은 MCP 도구를 통해 수동으로 진행해야 합니다.\n")
    
    log("[TEST CASES]", Colors.BOLD)
    for i, tc in enumerate(test_cases, 1):
        log(f"\n{i}. [{tc['id']}] {tc['name']}", Colors.YELLOW)
        log(f"   Description: {tc['description']}", Colors.RESET)
        log(f"   Steps:", Colors.RESET)
        for step in tc['steps']:
            log(f"   - {step}", Colors.RESET)
        log(f"   Expected:", Colors.RESET)
        for expected in tc['expected']:
            log(f"   [OK] {expected}", Colors.GREEN)

def print_mcp_commands():
    """MCP 명령어 예시 출력"""
    log_section("Playwright MCP 명령어 예시")
    
    commands = [
        {
            "title": "1. 페이지 열기",
            "command": """mcp_playwright_playwright_navigate({
    "url": "http://localhost:3000",
    "headless": false,
    "width": 1920,
    "height": 1080
})"""
        },
        {
            "title": "2. 페이지 텍스트 가져오기",
            "command": """mcp_playwright_playwright_get_visible_text()"""
        },
        {
            "title": "3. 스크린샷 촬영",
            "command": """mcp_playwright_playwright_screenshot({
    "name": "test-screenshot",
    "fullPage": true,
    "savePng": true
})"""
        },
        {
            "title": "4. 요소 클릭",
            "command": """mcp_playwright_playwright_click({
    "selector": "button[type='submit']"
})"""
        },
        {
            "title": "5. 입력 필드 채우기",
            "command": """mcp_playwright_playwright_fill({
    "selector": "input[type='email']",
    "value": "admin@test.com"
})"""
        },
        {
            "title": "6. HTML 가져오기",
            "command": """mcp_playwright_playwright_get_visible_html({
    "selector": "header",
    "cleanHtml": true
})"""
        }
    ]
    
    for cmd in commands:
        log(f"\n{cmd['title']}", Colors.YELLOW)
        log(cmd['command'], Colors.RESET)

def print_prerequisites():
    """사전 준비사항 출력"""
    log_section("사전 준비사항")
    
    log_info("테스트를 실행하기 전에 다음 사항을 확인하세요:\n")
    
    log("1. 백엔드 서버 실행", Colors.YELLOW)
    log("   cd backend", Colors.RESET)
    log("   python -m uvicorn app.main:app --reload --port 8000\n", Colors.RESET)
    
    log("2. 프론트엔드 서버 실행", Colors.YELLOW)
    log("   cd frontend", Colors.RESET)
    log("   npm run dev\n", Colors.RESET)
    
    log("3. 데이터베이스 확인", Colors.YELLOW)
    log("   - Supabase 연결 확인", Colors.RESET)
    log("   - 테스트 데이터 존재 확인\n", Colors.RESET)
    
    log("4. 테스트 계정 준비", Colors.YELLOW)
    log("   - 일반 사용자: test@example.com", Colors.RESET)
    log("   - 관리자: admin@test.com\n", Colors.RESET)

def save_results():
    """테스트 결과 저장"""
    test_results["end_time"] = datetime.now().isoformat()
    
    with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)
    
    log_success(f"테스트 결과가 저장되었습니다: {RESULTS_FILE}")

def main():
    """메인 함수"""
    print_prerequisites()
    print_test_guide()
    print_mcp_commands()
    
    log_section("테스트 실행 안내")
    log_info("위의 MCP 명령어들을 사용하여 각 테스트 케이스를 실행하세요.")
    log_info("테스트 중 스크린샷은 tests/screenshots/ 디렉토리에 저장됩니다.")
    log_info("결과는 tests/test-results.json에 기록됩니다.\n")
    
    log("[TIPS]", Colors.BOLD + Colors.CYAN)
    log("- headless: false 옵션으로 브라우저 동작을 시각적으로 확인할 수 있습니다", Colors.RESET)
    log("- fullPage: true 옵션으로 전체 페이지 스크린샷을 촬영할 수 있습니다", Colors.RESET)
    log("- selector를 사용하여 특정 요소만 스크린샷을 찍을 수 있습니다\n", Colors.RESET)
    
    log_section("테스트 완료")

if __name__ == "__main__":
    main()

