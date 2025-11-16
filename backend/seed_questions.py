"""
Seed script to populate initial questions based on the original HTML designs
Run with: python seed_questions.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.question import Question, QuestionContent, QuestionType

# Create tables
Base.metadata.create_all(bind=engine)

def seed_questions():
    db = SessionLocal()
    
    # Check if questions already exist
    if db.query(Question).count() > 0:
        print("Questions already exist. Skipping seed.")
        db.close()
        return
    
    questions_data = [
        {
            "question_number": 1,
            "type": QuestionType.MULTIPLE_CHOICE,
            "title": "문항 1. 생성형 AI 모델 이해",
            "content": """다음 중 <strong>Transformer 아키텍처</strong>의 핵심 메커니즘인 
            <strong>"Self-Attention"</strong>에 대한 설명으로 가장 적절한 것은?<br><br>
            참고로, ChatGPT(GPT 계열)와 Claude(Claude 계열)는 모두 
            Transformer 기반 대규모 언어 모델(LLM)입니다.""",
            "points": 10,
            "time_limit": 5,
            "competency": "역량 A: 기초 이해 및 활용",
            "options": [
                {"text": "입력 데이터의 각 토큰이 다른 모든 토큰과의 관계를 동시에 계산하여, 문맥 상의 중요도를 파악하는 메커니즘이다."},
                {"text": "입력 데이터를 순차적으로 처리하면서, 이전 단계의 은닉 상태(hidden state)를 다음 단계로 전달하여 문맥을 학습하는 메커니즘이다."},
                {"text": "이미지의 특정 영역에만 집중하여 특징(feature)을 추출하고, 컨볼루션 필터를 통해 패턴을 인식하는 메커니즘이다."},
                {"text": "강화학습을 통해 보상 함수를 최적화하면서, 자기 자신의 과거 출력을 평가하여 학습하는 메커니즘이다."}
            ],
            "reference_materials": "<h3>Transformer와 Self-Attention</h3><p>Transformer는 2017년 'Attention is All You Need' 논문에서 소개된 아키텍처입니다.</p>"
        },
        {
            "question_number": 2,
            "type": QuestionType.COMPREHENSION,
            "title": "문항 2. AI 모델 개념 설명",
            "content": "GPT와 BERT 모델의 차이점을 설명하고, 각각의 장단점을 비교하여 서술하시오.",
            "points": 15,
            "time_limit": 15,
            "competency": "역량 A: 기초 이해 및 활용",
            "requirements": [
                "GPT와 BERT의 기본 구조 설명",
                "학습 방식의 차이점 비교",
                "각 모델의 장단점 분석",
                "실제 활용 사례 제시"
            ]
        },
        {
            "question_number": 3,
            "type": QuestionType.PROMPT_DESIGN,
            "title": "문항 3. 고급 프롬프트 설계",
            "content": "마케팅팀을 위한 신제품 런칭 보도자료 초안을 작성하는 프롬프트를 Few-shot Learning 기법을 활용하여 작성하시오.",
            "points": 20,
            "time_limit": 20,
            "competency": "역량 B: 문제해결 및 실무 적용",
            "requirements": [
                "역할(Role) 설정을 명확하게 포함할 것",
                "2개 이상의 구체적인 예시를 제공할 것",
                "출력 형식을 명시할 것",
                "제약 조건을 포함할 것"
            ]
        },
        {
            "question_number": 4,
            "type": QuestionType.APPLICATION,
            "title": "문항 4. 실무 시나리오 프롬프트 적용",
            "content": "고객 서비스 챗봇을 위한 프롬프트를 작성하고, AI 도구를 사용하여 실제 응답을 테스트하시오.",
            "points": 20,
            "time_limit": 25,
            "competency": "역량 B: 문제해결 및 실무 적용",
            "requirements": [
                "챗봇의 페르소나 정의",
                "다양한 고객 상황에 대한 대응 방식 설계",
                "AI 도구로 테스트 및 결과 분석",
                "개선 방안 제시"
            ]
        },
        {
            "question_number": 5,
            "type": QuestionType.FACT_CHECKING,
            "title": "문항 5. 사실 검증 (Fact-checking)",
            "content": "AI가 생성한 <strong>전기차 시장 분석 보고서</strong> 내용을 검증하시오.",
            "points": 20,
            "time_limit": 40,
            "competency": "역량 C: 비판적 사고 및 평가",
            "requirements": [
                "사실 확인이 필요한 항목을 모두 식별",
                "각 항목에 대해 검증 수행",
                "검증 결과를 표로 정리 (정확함/부정확함/환각)",
                "부정확한 내용에 대한 수정안 제시",
                "신뢰할 수 있는 출처 명시"
            ],
            "scenario": """<h3>2024년 글로벌 전기차 시장 분석</h3>
            <p>테슬라는 2024년 3분기에 총 463,897대의 전기차를 생산하여 전년 동기 대비 54%의 성장을 기록했습니다.</p>
            <p>한국의 경우, 현대자동차의 아이오닉 5가 2024년 상반기 국내 전기차 판매 1위를 차지했으며, 약 42,000대가 판매되었습니다.</p>"""
        },
        {
            "question_number": 6,
            "type": QuestionType.CRITICAL_ANALYSIS,
            "title": "문항 6. AI 응답의 한계 분석",
            "content": "AI가 생성한 의료 정보에 대한 신뢰성과 한계를 분석하고, 개선 방안을 제시하시오.",
            "points": 20,
            "time_limit": 30,
            "competency": "역량 C: 비판적 사고 및 평가",
            "requirements": [
                "AI 응답의 장단점 분석",
                "의료 정보에서의 위험 요소 식별",
                "신뢰성 검증 방법 제안",
                "사용자 가이드라인 작성"
            ]
        },
        {
            "question_number": 7,
            "type": QuestionType.ETHICAL_REVIEW,
            "title": "문항 7. 윤리적 검증 (Ethical Review)",
            "content": """AI가 생성한 채용 공고문의 윤리적·법적 문제점을 식별하고, 개선 방안을 제시하시오.
            <br><br>시나리오: 인사팀이 ChatGPT를 활용하여 채용 공고문을 자동 생성하려 합니다.""",
            "points": 20,
            "time_limit": 25,
            "competency": "역량 D: 윤리 및 책임성",
            "requirements": [
                "최소 4가지 이상의 문제점 식별 (법적 근거 포함)",
                "각 문제점이 발생한 원인 분석",
                "구체적인 개선 방안 제시",
                "향후 AI 활용 시 윤리 가이드라인 제안"
            ],
            "scenario": """<strong>[자격 요건]</strong>
            <ul>
            <li>컴퓨터공학 또는 관련 전공 학사 이상</li>
            <li>만 28세 이하의 패기 넘치는 인재</li>
            <li>3년 이상의 Java/Spring 개발 경험</li>
            <li>원활한 커뮤니케이션이 가능한 남성 지원자 우대</li>
            <li>야근 및 주말 근무 가능자</li>
            <li>군필자 (병역 이행 완료자)</li>
            </ul>"""
        },
        {
            "question_number": 8,
            "type": QuestionType.CASE_STUDY,
            "title": "문항 8. 종합 사례 기반 윤리적 판단",
            "content": "AI를 활용한 대출 심사 시스템의 윤리적 문제를 분석하고, 공정성을 확보하기 위한 방안을 제시하시오.",
            "points": 20,
            "time_limit": 30,
            "competency": "역량 D: 윤리 및 책임성",
            "requirements": [
                "편향성 문제 식별 및 분석",
                "공정성 평가 기준 제시",
                "투명성 확보 방안",
                "모니터링 및 개선 프로세스 설계"
            ]
        }
    ]
    
    try:
        for q_data in questions_data:
            # Create question
            question = Question(
                question_number=q_data["question_number"],
                type=q_data["type"],
                title=q_data["title"],
                content=q_data["content"],
                points=q_data["points"],
                time_limit=q_data.get("time_limit"),
                competency=q_data["competency"]
            )
            db.add(question)
            db.flush()
            
            # Create question content
            question_content = QuestionContent(
                question_id=question.id,
                scenario=q_data.get("scenario"),
                requirements=q_data.get("requirements"),
                reference_materials=q_data.get("reference_materials"),
                options=q_data.get("options")
            )
            db.add(question_content)
        
        db.commit()
        print(f"Successfully seeded {len(questions_data)} questions!")
        
    except Exception as e:
        print(f"Error seeding questions: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_questions()


