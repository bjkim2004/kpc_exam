"""
백엔드 API 테스트 스크립트
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("KPC Backend API Test")
print("=" * 60)

# 1. Health check
print("\n[1] Health Check")
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"✅ Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"❌ Error: {e}")

# 2. Login test (가정: test@example.com / test123)
print("\n[2] Login Test")
try:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "test123"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get("access_token")
        print(f"✅ Token obtained: {access_token[:30]}...")
        
        # 3. Start exam with token
        print("\n[3] Start Exam Test")
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.post(
            f"{BASE_URL}/api/exams/start",
            headers=headers,
            json={}
        )
        print(f"Status: {response.status_code}")
        if response.status_code in [200, 201]:
            exam_data = response.json()
            print(f"✅ Exam started successfully!")
            print(f"Exam ID: {exam_data.get('id')}")
            print(f"Timer: {exam_data.get('timer_remaining')} seconds")
            print(f"Status: {exam_data.get('status')}")
        else:
            print(f"❌ Failed to start exam")
            print(f"Response: {response.text}")
    else:
        print(f"❌ Login failed")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")

# 4. Get questions
print("\n[4] Get Questions Test")
try:
    response = requests.get(f"{BASE_URL}/api/questions")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        questions = response.json()
        print(f"✅ Questions loaded: {len(questions)} questions")
        for q in questions[:3]:
            print(f"  - Q{q.get('question_number')}: {q.get('title')} ({q.get('points')}점)")
    else:
        print(f"❌ Failed to get questions")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("Test completed")
print("=" * 60)






