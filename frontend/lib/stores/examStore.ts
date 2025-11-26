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
      
      // 시험 시작 시 모든 상태 초기화
      set({ 
        questions: [], 
        answers: {}, 
        currentQuestionIndex: 0,
        hasUnsavedChanges: false,
        aiUsageCount: {}
      });
      
      const response = await apiClient.post('/exams/start', {});
      console.log('✅ Exam started successfully via backend API');
      console.log('✅ New exam ID:', response.data.id);
      set({ examId: response.data.id, timeRemaining: response.data.timer_remaining });
      await get().loadQuestions();
    } catch (error: any) {
      console.error('❌ Failed to start exam:', error);
      const errorMessage = error.response?.data?.detail || error.message || '시험 시작에 실패했습니다.';
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  loadQuestions: async () => {
    const { examId } = get();
    try {
      const response = await apiClient.get('/questions');
      // is_active가 1인 문제만 필터링 (백엔드에서도 필터링하지만 이중 안전장치)
      let activeQuestions = response.data.filter((q: any) => q.is_active === 1);
      // question_number 순서로 정렬
      activeQuestions.sort((a: any, b: any) => a.question_number - b.question_number);
      
      // 백엔드에서 반환한 is_answered를 무시하고 항상 false로 초기화
      // (백엔드는 이전 시험의 상태를 반환할 수 있음)
      activeQuestions = activeQuestions.map((q: any) => {
        // 기존 is_answered 제거하고 새로 설정
        const { is_answered: _, ...questionWithoutAnswered } = q;
        return {
          ...questionWithoutAnswered,
          is_answered: false
        };
      });
      
      console.log('✅ Successfully loaded questions from backend API');
      console.log('Questions loaded:', activeQuestions.map((q: any, idx: number) => ({
        display_number: idx + 1,
        question_id: q.id,
        db_question_number: q.question_number,
        title: q.title,
        is_answered: q.is_answered
      })));
      
      // examId가 있으면 현재 시험의 저장된 답변만 확인
      if (examId) {
        try {
          const answersResponse = await apiClient.get(`/answers/exam/${examId}`);
          const savedAnswers = answersResponse.data;
          console.log('📋 Loaded saved answers for current exam:', savedAnswers);
          
          // 저장된 답변이 있는 문항의 is_answered를 true로 설정
          if (savedAnswers && savedAnswers.length > 0) {
            const answeredQuestionIds = new Set(savedAnswers.map((a: any) => a.question_id));
            activeQuestions = activeQuestions.map((q: any) => ({
              ...q,
              is_answered: answeredQuestionIds.has(q.id)
            }));
            console.log('✅ Updated is_answered status:', activeQuestions.map((q: any) => ({
              id: q.id,
              is_answered: q.is_answered
            })));
          }
        } catch (error) {
          console.log('ℹ️ No saved answers found for this exam (exam_id:', examId, ')');
        }
      } else {
        console.log('ℹ️ No examId yet, all questions set to is_answered: false');
      }
      
      set({ questions: activeQuestions });
    } catch (error: any) {
      console.error('❌ Failed to load questions:', error);
      const errorMessage = error.response?.data?.detail || error.message || '문항을 불러오는데 실패했습니다.';
      throw new Error(errorMessage);
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
    }
  },

  submitExam: async () => {
    const { examId } = get();
    if (!examId) {
      throw new Error('시험이 시작되지 않았습니다.');
    }

    try {
      await apiClient.post(`/exams/${examId}/submit`, {});
    } catch (error: any) {
      console.error('Failed to submit exam:', error);
      const errorMessage = error.response?.data?.detail || error.message || '시험 제출에 실패했습니다.';
      throw new Error(errorMessage);
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


