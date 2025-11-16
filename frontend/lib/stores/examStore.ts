import { create } from 'zustand';
import apiClient from '../api/client';

interface Question {
  id: number;
  question_number: number;
  type: string;
  title: string;
  content: string;
  points: number;
  time_limit: number | null;
  competency: string;
  question_content: any;
  is_active?: number;  // 1: 활성, 0: 비활성
  is_answered?: boolean;  // 서버에 저장된 답변 여부
}

interface ExamResult {
  total_score: number;
  competency_scores?: {
    competency_a?: number;
    competency_b?: number;
    competency_c?: number;
    competency_d?: number;
  };
}

interface ExamState {
  examId: number | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  timeRemaining: number;
  aiUsageCount: Record<string, number>;
  examResult: ExamResult | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  
  startExam: () => Promise<void>;
  loadQuestions: () => Promise<void>;
  setAnswer: (questionId: string, answer: any) => void;
  saveAnswer: (questionId: string) => Promise<void>;
  decrementTimer: () => void;
  syncTimer: () => Promise<void>;
  submitExam: () => Promise<void>;
  goToQuestion: (index: number, force?: boolean) => void;
  getAIUsageCount: (questionId: number) => number;
  fetchExamResult: (examId: number) => Promise<void>;
}

export const useExamStore = create<ExamState>((set, get) => ({
  examId: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 9000, // 150 minutes in seconds (for 11 questions)
  aiUsageCount: {},
  examResult: null,
  isLoading: false,
  hasUnsavedChanges: false,

  startExam: async () => {
    try {
      set({ isLoading: true });
      const response = await apiClient.post('/exams/start', {});
      console.log('✅ Exam started successfully via backend API');
      set({ examId: response.data.id, timeRemaining: response.data.timer_remaining });
      await get().loadQuestions();
    } catch (error) {
      console.error('❌ Failed to start exam via backend:', error);
      console.warn('⚠️ WARNING: Using default exam ID (MOCK mode)');
      // 개발 환경: 백엔드가 없어도 기본값으로 진행
      set({ examId: 1, timeRemaining: 9000 });
      await get().loadQuestions();
    } finally {
      set({ isLoading: false });
    }
  },

  loadQuestions: async () => {
    try {
      const response = await apiClient.get('/questions');
      // is_active가 1인 문제만 필터링 (백엔드에서도 필터링하지만 이중 안전장치)
      let activeQuestions = response.data.filter((q: any) => q.is_active === 1);
      // question_number 순서로 정렬
      activeQuestions.sort((a: any, b: any) => a.question_number - b.question_number);
      console.log('✅ Successfully loaded questions from backend API');
      console.log('Questions loaded:', activeQuestions.map((q: any, idx: number) => ({
        display_number: idx + 1,
        question_id: q.id,
        db_question_number: q.question_number,
        title: q.title
      })));
      set({ questions: activeQuestions });
    } catch (error) {
      console.error('❌ Failed to load questions from backend:', error);
      console.warn('⚠️ WARNING: Using MOCK data! Backend is not available.');
      console.warn('⚠️ Please start the backend server to use real database data.');
      alert('⚠️ 백엔드 서버에 연결할 수 없습니다.\nMock 데이터를 사용합니다.\n\n백엔드를 시작하세요:\ncd backend\nuvicorn app.main:main --reload');
      // 개발 환경: Mock 데이터 사용
      const mockQuestions = [
        {
          id: 1,
          question_number: 1,
          type: 'multiple_choice',
          title: 'Self-Attention 메커니즘',
          content: 'Transformer 모델의 Self-Attention 메커니즘에 대한 설명으로 가장 적절한 것은?',
          points: 10,
          time_limit: null,
          competency: '역량 A',
          is_active: 1,
          question_content: {
            question: 'Transformer 모델의 Self-Attention 메커니즘에 대한 설명으로 가장 적절한 것은?',
            options: [
              'Query, Key, Value 벡터를 사용하여 입력 시퀀스 내 각 토큰 간의 관계를 계산한다.',
              'RNN과 동일하게 순차적으로 데이터를 처리한다.',
              'CNN의 필터를 사용하여 지역적 패턴을 학습한다.',
              'LSTM의 게이트 메커니즘을 개선한 것이다.'
            ],
            correct_answer: 0
          }
        },
        {
          id: 2,
          question_number: 2,
          type: 'multiple_choice',
          title: 'AI 도구 특징 비교',
          content: 'ChatGPT, Claude, Gemini 등 생성형 AI 도구들의 특징',
          points: 15,
          time_limit: null,
          competency: '역량 A',
          is_active: 1,
          question_content: {
            question: '생성형 AI 도구들의 특징으로 올바른 것은?',
            options: [
              'ChatGPT는 OpenAI에서 개발한 대화형 AI이다.',
              'Claude는 Google에서 개발했다.',
              'Gemini는 Meta에서 개발했다.',
              'DALL-E는 텍스트 생성 전용 도구이다.'
            ],
            correct_answer: 0
          }
        },
        {
          id: 3,
          question_number: 3,
          type: 'prompt_design',
          title: '구조화된 프롬프트',
          content: '고객 서비스 챗봇을 위한 프롬프트를 설계하세요.',
          points: 10,
          time_limit: 20,
          competency: '역량 B',
          is_active: 1,
          question_content: {
            scenario: '전자상거래 플랫폼의 고객 서비스 챗봇을 구축하려고 합니다.',
            requirements: [
              '예의 바르고 친절한 톤',
              '주문 조회, 배송 추적, 반품 처리 기능',
              '복잡한 문의는 상담원 연결'
            ]
          }
        },
        {
          id: 4,
          question_number: 4,
          type: 'essay',
          title: 'Few-shot Learning',
          content: '제품 리뷰의 감정을 분류하는 Few-shot 프롬프트를 작성하세요.',
          points: 10,
          time_limit: 15,
          competency: '역량 B',
          is_active: 1,
          question_content: {
            task: '제품 리뷰의 감정(긍정/부정/중립)을 분류',
            examples: [
              '리뷰: "정말 좋아요!" → 긍정',
              '리뷰: "별로에요..." → 부정'
            ]
          }
        },
        {
          id: 5,
          question_number: 5,
          type: 'practical',
          title: '업무 자동화 시스템',
          content: '주간 보고서 자동화 시스템을 설계하세요.',
          points: 10,
          time_limit: 25,
          competency: '역량 B',
          is_active: 1,
          question_content: {
            scenario: '매주 월요일 오전 9시에 자동으로 주간 보고서를 생성하는 시스템',
            requirements: [
              '데이터 수집 방법',
              'AI 활용 방안',
              '보고서 형식'
            ]
          }
        },
        {
          id: 6,
          question_number: 6,
          type: 'multiple_choice',
          title: 'AI 신뢰성 검증',
          content: 'AI 환각(Hallucination) 현상에 대한 설명',
          points: 8,
          time_limit: null,
          competency: '역량 C',
          is_active: 1,
          question_content: {
            question: 'AI 환각(Hallucination) 현상을 줄이는 방법으로 적절하지 않은 것은?',
            options: [
              'RAG(Retrieval-Augmented Generation) 사용',
              '프롬프트에 정확한 정보 출처 요구',
              '모델 크기를 무조건 크게 만들기',
              '사실 확인 시스템 통합'
            ],
            correct_answer: 2
          }
        },
        {
          id: 7,
          question_number: 7,
          type: 'fact_checking',
          title: '사실 검증 실습',
          content: 'AI가 생성한 기후변화 콘텐츠를 검증하세요.',
          points: 10,
          time_limit: 20,
          competency: '역량 C',
          is_active: 1,
          question_content: {
            ai_output: '2023년 전 세계 평균 기온은 산업화 이전 대비 1.5도 상승했으며...',
            task: '위 내용의 사실 여부를 검증하고 근거를 제시하세요.'
          }
        },
        {
          id: 8,
          question_number: 8,
          type: 'ethical_review',
          title: '채용 AI 윤리',
          content: 'AI 기반 채용 시스템의 편향성 문제',
          points: 7,
          time_limit: 15,
          competency: '역량 C',
          is_active: 1,
          question_content: {
            scenario: '한 기업이 AI를 활용한 자동 서류 심사 시스템을 도입했습니다. 그런데 특정 성별과 연령대의 합격률이 현저히 낮아지는 현상이 발견되었습니다.',
            requirements: [
              '문제점 분석',
              '개선 방안 제시',
              '윤리 가이드라인 작성'
            ]
          }
        },
        {
          id: 9,
          question_number: 9,
          type: 'multiple_choice',
          title: '개인정보 보호',
          content: 'AI 시스템에서의 개인정보 보호',
          points: 7,
          time_limit: null,
          competency: '역량 D',
          is_active: 1,
          question_content: {
            question: 'AI 시스템에서 개인정보를 보호하는 방법으로 적절한 것은?',
            options: [
              '온프레미스 환경에서 민감 데이터 처리',
              '모든 데이터를 클라우드에 저장',
              '개인정보를 프롬프트에 직접 포함',
              '암호화 없이 전송'
            ],
            correct_answer: 0
          }
        },
        {
          id: 10,
          question_number: 10,
          type: 'essay',
          title: 'AI 이미지 저작권',
          content: 'AI 생성 이미지의 저작권 문제',
          points: 6,
          time_limit: 15,
          competency: '역량 D',
          is_active: 1,
          question_content: {
            scenario: '지브리 스타일 이미지를 생성하는 AI 도구 사용',
            task: '저작권 이슈와 해결 방안을 논하세요.'
          }
        },
        {
          id: 11,
          question_number: 11,
          type: 'practical',
          title: '의료AI 편향성',
          content: 'X-ray 진단 AI의 편향성 문제',
          points: 7,
          time_limit: 20,
          competency: '역량 D',
          is_active: 1,
          question_content: {
            scenario: '특정 인종의 X-ray 진단 정확도가 낮음',
            task: '원인 분석 및 개선 방안'
          }
        }
      ];
      
      // is_active가 1인 문제만 필터링
      const activeQuestions = mockQuestions.filter(q => q.is_active === 1);
      set({ questions: activeQuestions });
    }
  },

  setAnswer: (questionId: string, answer: any) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
      hasUnsavedChanges: true,
    }));
  },

  saveAnswer: async (questionId: string) => {
    const { examId, answers, questions, currentQuestionIndex } = get();
    if (!examId) {
      console.error('❌ Exam ID is missing');
      throw new Error('시험이 시작되지 않았습니다.');
    }

    // 답안 검증: 답안이 비어있는지 확인
    const answerData = answers[questionId];
    if (!answerData) {
      console.warn('⚠️ No answer data found for question:', questionId);
      throw new Error('답안이 비어있습니다.');
    }

    // 현재 문항 정보 확인 (매핑 검증용)
    const currentQuestion = questions.find(q => q.id.toString() === questionId);
    const displayNumber = currentQuestion ? questions.findIndex(q => q.id === currentQuestion.id) + 1 : '?';
    console.log('💾 Saving answer:', {
      questionId: questionId,
      question_id: parseInt(questionId),
      db_question_number: currentQuestion?.question_number,
      display_number: displayNumber,
      current_index: currentQuestionIndex,
      answerData: answerData
    });

    // answerText가 있는 경우 (서술형, 수행형 등)
    if (answerData.answerText !== undefined) {
      // 빈 문자열이 아닌 경우에만 저장 (빈 문자열도 저장 가능하도록 완화)
      // 단, 완전히 빈 객체가 아닌 경우에만 저장
      if (answerData.answerText === '' && Object.keys(answerData).length === 1) {
        console.warn('⚠️ Answer text is empty and no other data');
        throw new Error('답안이 비어있습니다.');
      }
    }
    // selectedOption이 있는 경우 (객관식)
    else if (answerData.selectedOption !== undefined) {
      if (answerData.selectedOption === null || answerData.selectedOption === undefined) {
        console.warn('⚠️ Selected option is null or undefined');
        throw new Error('답안이 비어있습니다.');
      }
    }
    // section1, section2가 있는 경우 (서술형 - 문제점 분석/개선 방안)
    else if (answerData.section1 !== undefined || answerData.section2 !== undefined) {
      const hasSection1 = answerData.section1 && answerData.section1.trim() !== '';
      const hasSection2 = answerData.section2 && answerData.section2.trim() !== '';
      if (!hasSection1 && !hasSection2) {
        console.warn('⚠️ Both sections are empty');
        throw new Error('답안이 비어있습니다.');
      }
    }
    // 다른 형식의 답안도 검증 (예: verifications 배열 등)
    else {
      // 객체가 비어있지 않은지 확인
      const hasContent = Object.keys(answerData).some(key => {
        const value = answerData[key];
        if (typeof value === 'string') return value.trim() !== '';
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined;
      });
      
      if (!hasContent) {
        console.warn('⚠️ No content found in answer data');
        throw new Error('답안이 비어있습니다.');
      }
    }

    try {
      // answer_data가 객체인지 확인
      if (typeof answerData !== 'object' || answerData === null || Array.isArray(answerData)) {
        console.error('❌ Invalid answer_data format:', answerData);
        throw new Error('답안 데이터 형식이 올바르지 않습니다.');
      }

      const requestData = {
        exam_id: examId,
        question_id: parseInt(questionId),
        answer_data: answerData,
      };

      console.log('📤 Sending answer to backend:', requestData);
      console.log('📤 Answer data type:', typeof answerData, 'is object:', typeof answerData === 'object', 'is array:', Array.isArray(answerData));
      
      const response = await apiClient.post('/answers', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10초 타임아웃
      });
      
      console.log('✅ Answer saved to backend successfully:', response.data);
      console.log('✅ Response status:', response.status);
      
      // 저장 성공시 해당 문항을 완료로 표시
      const updatedQuestions = questions.map(q => 
        q.id.toString() === questionId 
          ? { ...q, is_answered: true }
          : q
      );
      set({ questions: updatedQuestions, hasUnsavedChanges: false });
    } catch (error: any) {
      console.error('❌ Failed to save answer to backend:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        request: error.config?.data,
      });
      
      // 네트워크 에러인 경우
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('서버 응답 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
      }
      
      // 에러를 다시 throw하여 상위에서 처리할 수 있도록
      const errorMessage = error.response?.data?.detail || error.message || '답안 저장에 실패했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 로컬에서만 타이머 감소 (매 초마다 호출)
  decrementTimer: () => {
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    }));
  },

  // 서버와 타이머 동기화 (주기적으로 호출)
  syncTimer: async () => {
    const { examId, timeRemaining } = get();
    if (!examId) return;
    
    try {
      await apiClient.patch(`/exams/${examId}/timer`, { timer_remaining: timeRemaining });
    } catch (error) {
      console.error('Failed to sync timer:', error);
      // 개발 환경: 로컬 저장소에 저장
      localStorage.setItem('exam_timer', timeRemaining.toString());
    }
  },

  submitExam: async () => {
    const { examId } = get();
    if (!examId) return;

    try {
      await apiClient.post(`/exams/${examId}/submit`, {});
    } catch (error) {
      console.error('Failed to submit exam:', error);
      // 개발 환경: 로컬 저장소에 제출 상태 저장
      localStorage.setItem('exam_submitted', 'true');
      localStorage.setItem('exam_submit_time', new Date().toISOString());
    }
  },

  goToQuestion: (index: number, force: boolean = false) => {
    if (force) {
      set({ currentQuestionIndex: index, hasUnsavedChanges: false });
    } else {
      set({ currentQuestionIndex: index, hasUnsavedChanges: false });
    }
  },

  getAIUsageCount: (questionId: number) => {
    const { aiUsageCount } = get();
    return aiUsageCount[questionId] || 0;
  },

  fetchExamResult: async (examId: number) => {
    try {
      const response = await apiClient.get(`/exams/${examId}/result`);
      set({ examResult: response.data });
    } catch (error) {
      console.error('Failed to fetch exam result:', error);
      throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록
    }
  },
}));


