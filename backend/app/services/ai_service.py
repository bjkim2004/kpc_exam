import openai
from anthropic import Anthropic
from typing import Dict, Any, List, Optional
from app.core.config import settings
import time
import threading
from collections import deque

# Safely import google.generativeai
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError as e:
    print(f"Warning: google.generativeai not available: {e}")
    genai = None
    GENAI_AVAILABLE = False


class GeminiKeyPool:
    """Gemini API 키 풀링 및 Rate Limiting 관리"""
    
    def __init__(self, keys: List[str], rate_limit_per_minute: int = 15):
        self.keys = keys
        self.rate_limit = rate_limit_per_minute
        self.current_index = 0
        self.lock = threading.Lock()
        # 각 키별 요청 타임스탬프 기록 (슬라이딩 윈도우)
        self.request_times: Dict[str, deque] = {key: deque() for key in keys}
        # 각 키별 클라이언트 캐시
        self.clients: Dict[str, Any] = {}
        print(f"[KeyPool] Gemini Key Pool initialized with {len(keys)} key(s)")
    
    def _clean_old_requests(self, key: str):
        """1분이 지난 요청 기록 제거"""
        current_time = time.time()
        while self.request_times[key] and current_time - self.request_times[key][0] > 60:
            self.request_times[key].popleft()
    
    def _get_available_key(self) -> Optional[str]:
        """Rate Limit을 고려하여 사용 가능한 키 반환"""
        current_time = time.time()
        
        # 모든 키를 순회하며 사용 가능한 키 찾기
        for _ in range(len(self.keys)):
            key = self.keys[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.keys)
            
            self._clean_old_requests(key)
            
            # Rate Limit 확인
            if len(self.request_times[key]) < self.rate_limit:
                return key
        
        # 모든 키가 Rate Limit에 도달한 경우, 가장 여유로운 키 반환
        min_requests = float('inf')
        best_key = self.keys[0]
        for key in self.keys:
            self._clean_old_requests(key)
            if len(self.request_times[key]) < min_requests:
                min_requests = len(self.request_times[key])
                best_key = key
        
        return best_key
    
    def get_client(self) -> tuple:
        """사용 가능한 키로 Gemini 클라이언트 반환"""
        with self.lock:
            key = self._get_available_key()
            if not key:
                raise ValueError("No available Gemini API keys")
            
            # 요청 시간 기록
            self.request_times[key].append(time.time())
            
            # 클라이언트가 캐시에 없으면 생성
            if key not in self.clients:
                genai.configure(api_key=key)
                self.clients[key] = genai.GenerativeModel('models/gemini-2.5-flash-lite')
            
            # 해당 키로 configure 설정 (멀티키 환경에서 필요)
            genai.configure(api_key=key)
            
            return self.clients[key], key
    
    def get_status(self) -> Dict[str, Any]:
        """키 풀 상태 반환"""
        with self.lock:
            status = {
                "total_keys": len(self.keys),
                "rate_limit_per_minute": self.rate_limit,
                "keys_status": []
            }
            for i, key in enumerate(self.keys):
                self._clean_old_requests(key)
                status["keys_status"].append({
                    "key_index": i,
                    "key_preview": f"{key[:8]}...{key[-4:]}",
                    "requests_last_minute": len(self.request_times[key]),
                    "available_requests": max(0, self.rate_limit - len(self.request_times[key]))
                })
            return status


class AIService:
    def __init__(self):
        # Initialize OpenAI client safely
        self.openai_client = None
        if settings.OPENAI_API_KEY:
            try:
                self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception as e:
                print(f"Warning: Failed to initialize OpenAI client: {e}")
        
        # Initialize Anthropic client safely
        self.anthropic_client = None
        if settings.ANTHROPIC_API_KEY:
            try:
                self.anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception as e:
                print(f"Warning: Failed to initialize Anthropic client: {e}")
        
        # Initialize Gemini Key Pool
        self.gemini_key_pool: Optional[GeminiKeyPool] = None
        self.gemini_client = None
        
        if GENAI_AVAILABLE and genai:
            # 여러 키 파싱 (GEMINI_API_KEYS가 설정되어 있으면 사용, 아니면 GEMINI_API_KEY 사용)
            gemini_keys = []
            
            if settings.GEMINI_API_KEYS:
                # 콤마로 구분된 여러 키 파싱
                gemini_keys = [k.strip() for k in settings.GEMINI_API_KEYS.split(',') if k.strip()]
            
            if not gemini_keys and settings.GEMINI_API_KEY:
                # 단일 키만 있는 경우
                gemini_keys = [settings.GEMINI_API_KEY]
            
            if gemini_keys:
                try:
                    rate_limit = getattr(settings, 'GEMINI_RATE_LIMIT_PER_KEY', 15)
                    self.gemini_key_pool = GeminiKeyPool(gemini_keys, rate_limit)
                    # 기본 클라이언트도 설정 (호환성)
                    genai.configure(api_key=gemini_keys[0])
                    self.gemini_client = genai.GenerativeModel('models/gemini-2.5-flash-lite')
                    print(f"[OK] Gemini initialized with {len(gemini_keys)} API key(s)")
                except Exception as e:
                    print(f"Warning: Failed to initialize Gemini client: {e}")
        elif settings.GEMINI_API_KEY and not GENAI_AVAILABLE:
            print(f"Warning: Gemini API key provided but google.generativeai package not available")
        
        self.default_provider = settings.DEFAULT_AI_PROVIDER
    
    async def chat_gpt(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call OpenAI ChatGPT API"""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant for an AI competency assessment."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            return {
                "response": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens,
                "model": response.model
            }
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def claude(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call Anthropic Claude API"""
        if not self.anthropic_client:
            raise ValueError("Anthropic API key not configured")
        
        try:
            response = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return {
                "response": response.content[0].text,
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
                "model": response.model
            }
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")
    
    async def gemini(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call Google Gemini API - Optimized for speed with key pooling"""
        if not self.gemini_key_pool and not self.gemini_client:
            if not GENAI_AVAILABLE:
                raise ValueError("google.generativeai package not available")
            raise ValueError("Gemini API key not configured")
        
        # 최대 재시도 횟수 (키 개수만큼)
        max_retries = len(self.gemini_key_pool.keys) if self.gemini_key_pool else 1
        last_error = None
        
        for attempt in range(max_retries):
            try:
                # 키 풀에서 클라이언트 가져오기
                if self.gemini_key_pool:
                    client, used_key = self.gemini_key_pool.get_client()
                else:
                    client = self.gemini_client
                    used_key = "single"
                
                # Optimized generation config for faster response
                generation_config = {
                    "temperature": 0.7,
                    "max_output_tokens": 1024,  # Limit output length for speed
                }
                
                response = client.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                
                # Fast text extraction - try response.text first
                response_text = self._extract_gemini_text_fast(response)
                
                if not response_text:
                    raise ValueError("No text content in response")
                
                return {
                    "response": response_text,
                    "tokens_used": (len(prompt) + len(response_text)) // 4,
                    "model": "gemini-2.5-flash-lite",
                    "key_index": self.gemini_key_pool.keys.index(used_key) if self.gemini_key_pool and used_key != "single" else 0
                }
            except Exception as e:
                last_error = e
                error_msg = str(e).lower()
                # Rate limit 또는 quota 에러인 경우 다음 키로 재시도
                if "quota" in error_msg or "rate" in error_msg or "limit" in error_msg or "429" in error_msg:
                    print(f"[WARN] Gemini API rate limit hit (attempt {attempt + 1}/{max_retries}), trying next key...")
                    continue
                # 다른 에러는 즉시 발생
                raise Exception(f"Gemini API error: {str(e)}")
        
        # 모든 키가 실패한 경우
        raise Exception(f"Gemini API error (all keys exhausted): {str(last_error)}")
    
    def _extract_gemini_text_fast(self, response) -> str:
        """Fast text extraction from Gemini response"""
        # Method 1: Try response.text directly (fastest)
        try:
            return response.text
        except:
            pass
        
        # Method 2: Try candidates
        try:
            if response.candidates:
                candidate = response.candidates[0]
                if candidate.content and candidate.content.parts:
                    return "".join(p.text for p in candidate.content.parts if hasattr(p, 'text'))
        except:
            pass
        
        # Method 3: Try parts
        try:
            if response.parts:
                return "".join(p.text for p in response.parts if hasattr(p, 'text'))
        except:
            pass
        
        return ""
    
    def _extract_gemini_text(self, response) -> str:
        """Safely extract text from Gemini response (fallback)"""
        return self._extract_gemini_text_fast(response)
    
    async def generate(self, prompt: str, provider: str = None, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate response using the specified AI provider or the default one
        """
        provider = provider or self.default_provider
        
        if provider == "openai":
            return await self.chat_gpt(prompt, context)
        elif provider == "anthropic":
            return await self.claude(prompt, context)
        elif provider == "gemini":
            return await self.gemini(prompt, context)
        else:
            raise ValueError(f"Unknown AI provider: {provider}")
    
    async def fact_check(self, claim: str, sources: list = None) -> Dict[str, Any]:
        """
        Perform fact checking using AI
        In a full implementation, this would include web search integration
        """
        prompt = f"""Please fact-check the following claim:

Claim: {claim}

Provide:
1. Whether the claim is accurate, inaccurate, or needs more context
2. Evidence or reasoning for your assessment
3. Suggested corrections if inaccurate

Be precise and cite specific concerns."""

        result = await self.generate(prompt)
        
        return {
            "claim": claim,
            "verification": result["response"],
            "confidence": "AI-assisted verification",
            "tokens_used": result["tokens_used"]
        }
    
    async def generate_question(self, question_type: str, competency: str, topic: str = None) -> Dict[str, Any]:
        """
        Generate a question using Gemini AI based on type and competency
        
        Args:
            question_type: Type of question (multiple_choice, practical, essay, etc.)
            competency: Competency area (e.g., "역량 A: 기초 이해 및 활용")
            topic: Optional specific topic to focus on
        
        Returns:
            Dict containing generated question data
        """
        if not self.gemini_client:
            if not GENAI_AVAILABLE:
                raise ValueError("google.generativeai package not available. Please install it with: pip install google-generativeai")
            raise ValueError("Gemini API key not configured")
        
        # Map question types to Korean labels
        type_labels = {
            "multiple_choice": "객관식",
            "practical": "서술형",
            "essay": "수행형",
            "prompt_design": "프롬프트 설계",
            "fact_checking": "사실 검증",
            "ethical_review": "윤리 검토"
        }
        
        type_label = type_labels.get(question_type, question_type)
        
        # Build prompt for Gemini
        if question_type == "practical":
            # 서술형 문제의 경우 특별한 프롬프트 사용
            prompt = f"""당신은 생성형 AI 활용 역량평가를 위한 문제 출제 전문가입니다.

다음 요구사항에 따라 **서술형 문제**를 생성해주세요:

**문제 유형**: 서술형 (문제점 분석 및 개선방안 제시)
**평가 역량**: {competency}
{f"**주제**: {topic}" if topic else ""}

**서술형 문제 출제 요구사항**:
1. 생성형 AI(ChatGPT, Claude, Gemini 등) 활용과 관련된 **실무 상황**을 제시해야 합니다.
2. 제시된 상황에서 **문제점을 찾아 분석**하고, **개선방안을 제시**하는 문제여야 합니다.
3. 문제는 두 부분으로 구성됩니다:
   - **1. 문제점 분석**: 제시된 상황에서 발견할 수 있는 문제점들을 구체적으로 분석
   - **2. 개선 방안**: 발견한 문제점에 대한 실질적이고 구체적인 개선방안 제시
4. 문제 난이도는 중급 수준으로 설정해주세요.
5. 실무에서 실제로 발생할 수 있는 상황을 시나리오로 제공해주세요.

**출력 형식 (JSON)**:
{{
  "title": "문제 제목 (간결하고 명확하게)",
  "content": "문제 내용 (HTML 형식으로 작성, <h3>, <p>, <strong> 등 사용 가능)",
  "points": 점수 (10-20 사이의 정수),
  "time_limit": 제한 시간 (분 단위, 10-30 사이의 정수),
  "scenario": "문제 상황 시나리오 (실무 상황을 구체적으로 묘사, HTML 형식 가능)",
  "requirements": ["평가 기준 1", "평가 기준 2", "평가 기준 3"],
  "reference_materials": {{
    "title": "참고자료 제목",
    "content": "참고자료 내용 (HTML 형식 가능)"
  }},
  "options": [{{
    "text": "선택지 1"
  }}, {{
    "text": "선택지 2"
  }}, {{
    "text": "선택지 3"
  }}, {{
    "text": "선택지 4"
  }}]
}}

**참고사항**:
- **서술형 문제 특별 요구사항**: 
  - 문제 내용(content)에는 '제시된 상황을 분석하여 문제점을 찾고, 개선방안을 제시하시오'와 같은 지시문을 포함해주세요.
  - 시나리오(scenario)에는 분석할 실무 상황을 구체적으로 묘사해주세요. 예를 들어, "한 기업이 ChatGPT를 활용하여 고객 문의를 자동 응답하는 시스템을 도입했는데..."와 같은 구체적인 상황을 제시해주세요.
  - 평가기준(requirements)에는 '문제점 분석의 구체성 및 정확성', '개선방안의 실현 가능성 및 실용성', '생성형 AI 활용 관점의 적절성' 등을 포함해주세요.
- **시나리오(scenario)**: 실무 상황을 구체적으로 묘사하여 문제의 맥락을 제공해주세요. 서술형 문제의 경우 분석할 구체적인 상황을 제시해주세요.
- **평가기준(requirements)**: 최소 3개 이상의 구체적인 평가 기준을 배열로 제공해주세요. 서술형 문제의 경우 문제점 분석과 개선방안 제시에 대한 평가 기준을 포함해주세요.
- **참고자료(reference_materials)**: 문제 해결에 도움이 되는 참고 자료를 제공해주세요 (제목과 내용 포함).
- JSON 형식으로만 응답하고, 다른 설명은 포함하지 마세요.
- content, scenario, reference_materials 필드는 HTML 태그를 사용할 수 있지만, JSON 이스케이프 처리를 해주세요.

문제를 생성해주세요:"""
        else:
            # 일반 문제 유형의 프롬프트
            prompt = f"""당신은 생성형 AI 활용 역량평가를 위한 문제 출제 전문가입니다.

다음 요구사항에 따라 문제를 생성해주세요:

**문제 유형**: {type_label}
**평가 역량**: {competency}
{f"**주제**: {topic}" if topic else ""}

**출제 요구사항**:
1. 생성형 AI(ChatGPT, Claude, Gemini 등)의 실제 활용 역량을 평가할 수 있는 문제여야 합니다.
2. 문제는 명확하고 구체적이어야 하며, 실무에서 활용 가능한 수준이어야 합니다.
3. 문제 난이도는 중급 수준으로 설정해주세요.

**출력 형식 (JSON)**:
{{
  "title": "문제 제목 (간결하고 명확하게)",
  "content": "문제 내용 (HTML 형식으로 작성, <h3>, <p>, <strong> 등 사용 가능)",
  "points": 점수 (10-20 사이의 정수),
  "time_limit": 제한 시간 (분 단위, 10-30 사이의 정수),
  "scenario": "문제 상황 시나리오 (실무 상황을 구체적으로 묘사, HTML 형식 가능)",
  "requirements": ["평가 기준 1", "평가 기준 2", "평가 기준 3"],
  "reference_materials": {{
    "title": "참고자료 제목",
    "content": "참고자료 내용 (HTML 형식 가능)"
  }},
  "options": [{{
    "text": "선택지 1"
  }}, {{
    "text": "선택지 2"
  }}, {{
    "text": "선택지 3"
  }}, {{
    "text": "선택지 4"
  }}]
}}

**참고사항**:
- {type_label} 문제의 경우, 문제 내용에 충분한 맥락과 정보를 제공해주세요.
- 객관식 문제의 경우 정답이 명확하고, 오답 선택지도 그럴듯하게 만들어주세요.
- 서술형/수행형 문제의 경우 구체적인 평가 기준이 명확해야 합니다.
- **시나리오(scenario)**: 실무 상황을 구체적으로 묘사하여 문제의 맥락을 제공해주세요.
- **평가기준(requirements)**: 최소 3개 이상의 구체적인 평가 기준을 배열로 제공해주세요.
- **참고자료(reference_materials)**: 문제 해결에 도움이 되는 참고 자료를 제공해주세요 (제목과 내용 포함).
- JSON 형식으로만 응답하고, 다른 설명은 포함하지 마세요.
- content, scenario, reference_materials 필드는 HTML 태그를 사용할 수 있지만, JSON 이스케이프 처리를 해주세요.

문제를 생성해주세요:"""

        try:
            # 키 풀에서 클라이언트 가져오기
            if self.gemini_key_pool:
                client, _ = self.gemini_key_pool.get_client()
            else:
                client = self.gemini_client
            
            response = client.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 4000,  # 시나리오, 참고자료, 평가기준 포함으로 토큰 수 증가
                }
            )
            
            # Parse JSON response
            import json
            import re
            
            response_text = response.text.strip()
            
            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = response_text
            
            # Parse JSON
            try:
                question_data = json.loads(json_str)
            except json.JSONDecodeError:
                # Try to fix common JSON issues
                json_str = json_str.replace("'", '"')
                json_str = re.sub(r'(\w+):', r'"\1":', json_str)
                question_data = json.loads(json_str)
            
            # Validate and set defaults
            if "points" not in question_data:
                question_data["points"] = 15
            if "time_limit" not in question_data:
                question_data["time_limit"] = 20
            if "scenario" not in question_data:
                question_data["scenario"] = None
            if "requirements" not in question_data or not isinstance(question_data.get("requirements"), list):
                # 기본 평가 기준 생성
                if question_type == "practical":
                    # 서술형 문제의 경우 문제점 분석과 개선방안에 특화된 평가 기준
                    question_data["requirements"] = [
                        "문제점 분석의 구체성 및 정확성",
                        "개선방안의 실현 가능성 및 실용성",
                        "생성형 AI 활용 관점의 적절성"
                    ]
                else:
                    question_data["requirements"] = [
                        "문제 해결 과정의 논리성",
                        "생성형 AI 도구 활용의 적절성",
                        "결과물의 완성도 및 실용성"
                    ]
            if "reference_materials" not in question_data:
                question_data["reference_materials"] = None
            if "options" not in question_data and question_type == "multiple_choice":
                question_data["options"] = [
                    {"text": "선택지 1"},
                    {"text": "선택지 2"},
                    {"text": "선택지 3"},
                    {"text": "선택지 4"}
                ]
            
            estimated_tokens = (len(prompt) + len(response.text)) // 4
            
            return {
                "question_data": question_data,
                "tokens_used": estimated_tokens,
                "model": "gemini-2.5-flash-lite"
            }
            
        except Exception as e:
            raise Exception(f"Failed to generate question: {str(e)}")


# Create singleton instance
ai_service = AIService()


