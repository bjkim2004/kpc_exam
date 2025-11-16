# 🚨 시험 시작 오류 완벽 해결 가이드

## 📊 문제 진단

### 현재 상황
```
❌ 백엔드 프로세스 2개 중복 실행 (PID: 20880, 24904)
❌ 이전 코드(120분)가 여전히 실행 중
✅ DB는 정리됨 (모든 시험 submitted)
✅ 프론트엔드는 정상 (150분 설정)
```

### 근본 원인
**백엔드가 제대로 재시작되지 않아** 수정된 코드가 적용되지 않았습니다.

---

## 🛠️ 해결 방법 (반드시 순서대로!)

### 1단계: 백엔드 완전 종료 ⚠️

#### 방법 A: 창에서 직접 종료 (권장)
1. **"KPC Backend"** 또는 **"start_backend.bat"** 창 찾기
2. 해당 창을 클릭
3. **`Ctrl + C`** 누르기 (여러 번)
4. 창 닫기

#### 방법 B: 작업 관리자로 종료
1. **Ctrl + Shift + Esc** (작업 관리자 열기)
2. **"세부 정보"** 탭 클릭
3. 다음 프로세스 찾아서 **강제 종료**:
   - `python.exe` (PID: 20880)
   - `python.exe` (PID: 24904)
4. **모든 `python.exe` 프로세스** 종료

#### 방법 C: 명령어로 종료
```cmd
# CMD 새 창에서 실행
taskkill /F /IM python.exe /T
```

---

### 2단계: 포트 확인 ✅

```cmd
# 8000 포트가 비어있는지 확인
netstat -ano | findstr :8000
```

**결과가 아무것도 나오지 않으면 성공!**

---

### 3단계: 백엔드 재시작 🚀

#### 옵션 1: 배치 파일 사용 (가장 쉬움)
```cmd
# 프로젝트 루트에서
start_backend.bat
```

#### 옵션 2: 수동 실행
```cmd
cd G:\sync\New_Project\vibe_coding\kpc\backend

# 가상환경 활성화 (있다면)
venv\Scripts\activate

# 백엔드 시작
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 4단계: 백엔드 정상 작동 확인 ✅

브라우저에서 다음 URL 접속:

```
http://localhost:8000
```

**기대 결과:**
```json
{
  "message": "AI Assessment Platform API",
  "version": "1.0.0"
}
```

**API 문서 확인:**
```
http://localhost:8000/docs
```

---

### 5단계: 시험 시작 테스트 🎯

1. 프론트엔드 접속: **http://localhost:3000**
2. 로그인
3. **"시험 시작하기"** 버튼 클릭
4. 정상적으로 시작되는지 확인

---

## 🔍 여전히 오류가 발생하면?

### 체크리스트

- [ ] 백엔드 프로세스가 **완전히 종료**되었나요?
  ```cmd
  netstat -ano | findstr :8000
  # 아무것도 나오지 않아야 함
  ```

- [ ] 백엔드가 **새로 시작**되었나요?
  ```
  http://localhost:8000 접속 시 응답이 오나요?
  ```

- [ ] **프론트엔드도 재시작**해보셨나요?
  ```cmd
  # 프론트엔드 창에서 Ctrl+C 후
  npm run dev
  ```

- [ ] 브라우저 **캐시를 지우고** 다시 시도해보셨나요?
  ```
  Ctrl + Shift + R (강력 새로고침)
  ```

---

## 🧪 백엔드 API 테스트

프로젝트 루트에 `test_backend_api.py` 파일이 생성되었습니다.

```cmd
# 백엔드가 실행 중인 상태에서
cd G:\sync\New_Project\vibe_coding\kpc
python test_backend_api.py
```

**기대 결과:**
```
[1] Health Check
✅ Status: 200

[2] Login Test
✅ Token obtained: ...

[3] Start Exam Test
✅ Exam started successfully!
Timer: 9000 seconds  ← 이것이 9000(150분)이어야 함!

[4] Get Questions Test
✅ Questions loaded: 11 questions
```

---

## 📝 수정된 내용 확인

### 백엔드 코드 (`backend/app/api/endpoints/exams.py`)

```python
# 새로운 시험 생성 시
new_exam = Exam(
    user_id=current_user.id,
    status=ExamStatus.IN_PROGRESS,
    start_time=datetime.utcnow(),
    timer_remaining=9000  # ✅ 150 minutes (9000 seconds)
)
```

### 자동 종료 로직
```python
# 3시간 이상 된 시험 자동 종료
if time_elapsed > 10800:  # 3 hours
    existing_exam.status = ExamStatus.SUBMITTED
    existing_exam.end_time = datetime.utcnow()
```

---

## 🎯 최종 점검

### 정상 작동 신호
1. ✅ 백엔드 시작 시 "Application startup complete" 메시지
2. ✅ http://localhost:8000 접속 시 JSON 응답
3. ✅ http://localhost:8000/docs에서 API 문서 보임
4. ✅ 시험 시작 시 "in_progress" 상태로 시험 생성
5. ✅ **timer_remaining이 9000 (150분)**

### 오류 신호
1. ❌ "Address already in use" 에러 → 포트 8000이 아직 사용 중
2. ❌ "시험 시작에 실패했습니다" → 백엔드 연결 안 됨
3. ❌ timer_remaining이 7200 → 이전 코드가 여전히 실행 중

---

## 💡 예방책

다음부터는 코드 수정 후:

1. **백엔드 창에서 Ctrl+C** (종료)
2. **위쪽 화살표 ↑** (이전 명령어)
3. **Enter** (재시작)

이렇게 하면 최신 코드가 항상 적용됩니다!

---

## 🆘 긴급 연락처

그래도 안 되면 다음 정보를 알려주세요:

1. `netstat -ano | findstr :8000` 결과
2. 백엔드 창에 나타나는 에러 메시지
3. 브라우저 콘솔(F12) 에러 메시지
4. `test_backend_api.py` 실행 결과

---

**작성일**: 2024-11-12  
**버전**: 1.0






