'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useExamStore } from '@/lib/stores/examStore';
import apiClient from '@/lib/api/client';

interface Question {
  id: number;
  question_number: number;
  title: string;
  content: string;
  type: string;
  points: number;
  competency: string;
  is_active: number;
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const startExam = useExamStore((state) => state.startExam);
  
  const [showStartModal, setShowStartModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // DB에서 문항 목록 가져오기
  useEffect(() => {
    const loadQuestions = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoadingQuestions(true);
        const response = await apiClient.get('/questions');
        // is_active가 1인 문제만 필터링
        const activeQuestions = response.data.filter((q: Question) => q.is_active === 1);
        // question_number 순서로 정렬
        activeQuestions.sort((a: Question, b: Question) => a.question_number - b.question_number);
        setQuestions(activeQuestions);
        console.log('✅ Questions loaded from DB:', activeQuestions);
      } catch (error: any) {
        console.error('❌ Failed to load questions:', error);
        setErrorMessage('문항 정보를 불러오는데 실패했습니다.');
        setShowErrorModal(true);
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (isAuthenticated) {
      loadQuestions();
    }
  }, [isAuthenticated]);

  const handleStartExam = async () => {
    try {
      await startExam();
      router.push('/exam/questions/1');
      setShowStartModal(false);
    } catch (error) {
      setShowStartModal(false);
      setErrorMessage('시험 시작에 실패했습니다. 다시 시도해주세요.');
      setShowErrorModal(true);
    }
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push('/login');
    setShowLogoutModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-5">
          {/* 로딩 스피너 */}
          <div className="w-14 h-14 border-4 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
          
          {/* 진행 상태바 */}
          <div className="w-72">
            <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full loading-progress-bar"></div>
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-neutral-400">
              <span>로딩 중...</span>
              <span>잠시만 기다려주세요</span>
            </div>
          </div>
          
          {/* 메시지 */}
          <div className="text-sm text-neutral-700 font-semibold mt-2">시스템을 준비하고 있습니다</div>
        </div>
      </div>
    );
  }

  // 문제 유형 라벨 매핑
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'multiple_choice': '객관식',
      'prompt_design': '프롬프트 설계',
      'fact_checking': '사실 검증',
      'ethical_review': '윤리 검토',
      'essay': '수행형',
      'practical': '서술형',
    };
    return types[type] || type;
  };

  // content에서 HTML 태그 제거 및 요약 생성
  const getQuestionSummary = (content: string, maxLength: number = 60) => {
    if (!content) return '';
    
    // HTML 태그 제거
    const textContent = content
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/&nbsp;/g, ' ') // &nbsp; 제거
      .replace(/\s+/g, ' ') // 연속된 공백 제거
      .trim();
    
    // 길이 제한
    if (textContent.length <= maxLength) {
      return textContent;
    }
    
    // 문장 끝을 찾아서 자르기
    const truncated = textContent.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');
    
    const lastPunctuation = Math.max(lastPeriod, lastQuestion, lastExclamation);
    const cutPoint = lastPunctuation > maxLength * 0.7 ? lastPunctuation + 1 : (lastSpace > 0 ? lastSpace : maxLength);
    
    return truncated.substring(0, cutPoint) + '...';
  };

  // 시험 정보 계산
  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const examTimeMinutes = 150; // 기본 시험 시간 (분)
  const passingScore = 70; // 합격 기준 점수

  // 역량별 문항 및 점수 계산
  const competencyStats = questions.reduce((acc, q, index) => {
    const comp = q.competency || '기타';
    if (!acc[comp]) {
      acc[comp] = { questions: [], points: 0 };
    }
    // 시험 문항 번호 (1, 2, 3...)
    acc[comp].questions.push(index + 1);
    acc[comp].points += q.points;
    return acc;
  }, {} as Record<string, { questions: number[]; points: number }>);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-black border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">생성형 AI 활용 역량평가</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Generative AI Proficiency Assessment</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Compact User Card */}
              <div className="flex items-center gap-2.5 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg">
                {/* User Icon */}
                <div className="flex items-center justify-center w-8 h-8 bg-neutral-800 rounded-full border border-neutral-600">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-neutral-300">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {/* User Info */}
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-400 leading-tight">수험번호</span>
                  <span className="text-sm font-bold text-white leading-tight">{user?.exam_number}</span>
                </div>
              </div>
              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 hover:border-neutral-600 transition-all"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Compact */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        
        {/* Exam Info Card - 상하 배치 */}
        <div className="bg-white border border-neutral-300 rounded-lg shadow-elevation-1 p-6 mb-4">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-200">📋 시험 정보</h2>
          
          {/* 시험 개요 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-neutral-700 mb-3 px-2 py-1 bg-neutral-100 rounded">시험 개요</h3>
            {loadingQuestions ? (
              <div className="text-center py-4 text-neutral-600">시험 정보를 불러오는 중...</div>
            ) : (
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col items-center py-3 bg-neutral-50 border border-neutral-300 rounded">
                  <span className="text-neutral-600 mb-1">총 문항 수</span>
                  <span className="font-bold text-neutral-900 text-lg">{totalQuestions}문항</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-neutral-50 border border-neutral-300 rounded">
                  <span className="text-neutral-600 mb-1">총 배점</span>
                  <span className="font-bold text-neutral-900 text-lg">{totalPoints}점</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-neutral-50 border border-neutral-300 rounded">
                  <span className="text-neutral-600 mb-1">시험 시간</span>
                  <span className="font-bold text-neutral-900 text-lg">{examTimeMinutes}분</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-neutral-50 border border-neutral-300 rounded">
                  <span className="text-neutral-600 mb-1">합격 기준</span>
                  <span className="font-bold text-neutral-900 text-lg">{passingScore}점</span>
                </div>
              </div>
            )}
          </div>

          {/* 평가 역량 */}
          <div>
            <h3 className="text-sm font-bold text-neutral-700 mb-3 px-2 py-1 bg-neutral-100 rounded">평가 역량</h3>
            {loadingQuestions ? (
              <div className="text-center py-4 text-neutral-600">역량 정보를 불러오는 중...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(competencyStats).map(([comp, stats]) => {
                  const questionRange = stats.questions.length > 0
                    ? `문항 ${Math.min(...stats.questions)}-${Math.max(...stats.questions)}`
                    : '문항 없음';
                  return (
                    <div key={comp} className="p-3 bg-neutral-50 border border-neutral-300 rounded">
                      <div className="font-bold text-neutral-900">{comp}</div>
                      <div className="text-neutral-600 mt-1">{questionRange} ({stats.points}점)</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Question List - 2열 배치 */}
        <div className="bg-white border border-neutral-300 rounded-lg shadow-elevation-1 p-6 mb-4">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-200">📝 문항 구성</h2>
          {loadingQuestions ? (
            <div className="text-center py-8 text-neutral-600">문항 정보를 불러오는 중...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">등록된 문항이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="flex flex-col p-3 bg-neutral-50 border border-neutral-300 rounded hover:border-neutral-500 hover:shadow-elevation-1 transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 bg-neutral-900 text-white rounded flex items-center justify-center font-bold text-base flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-neutral-900 text-base">{q.title}</div>
                      <div className="text-sm text-neutral-600 mt-0.5 line-clamp-2">
                        {getQuestionSummary(q.content)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-neutral-200">
                    <div className="text-sm font-semibold text-neutral-600 bg-white px-2.5 py-1 rounded border border-neutral-300">
                      {q.competency || '기타'}
                    </div>
                    <div className="text-sm text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300">
                      {getTypeLabel(q.type)}
                    </div>
                    <div className="text-sm font-bold text-neutral-900 bg-neutral-200 px-2.5 py-1 rounded border border-neutral-400 ml-auto">
                      {q.points}점
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Important Notes */}
        <div className="bg-neutral-50 border border-neutral-400 rounded-lg p-6 mb-6">
          <h2 className="text-base font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-300">⚠️ 주의사항</h2>
          <ul className="space-y-2.5 text-sm text-neutral-800">
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 font-bold flex-shrink-0">•</span>
              <span>시험 시작 후에는 <strong>중간에 종료할 수 없습니다</strong>. 충분한 시간을 확보한 후 시작하세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 font-bold flex-shrink-0">•</span>
              <span>각 문항 작성 후 <strong>반드시 저장 버튼을 클릭</strong>하여 답안을 저장하세요. 저장하지 않으면 답안이 제출되지 않습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 font-bold flex-shrink-0">•</span>
              <span>일부 문항에서는 <strong>AI 보조 도구</strong>(Gemini)를 제공합니다. 사용 횟수에 제한이 있으니 효율적으로 활용하세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 font-bold flex-shrink-0">•</span>
              <span>시험 제출 후에는 <strong>답안 수정이 불가능</strong>합니다. 신중하게 답안을 작성하세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 font-bold flex-shrink-0">•</span>
              <span>기술적 문제 발생 시 화면 하단의 <strong>'문의하기'</strong> 버튼을 이용하세요.</span>
            </li>
          </ul>
        </div>

        {/* 부정행위 방지 안내 */}
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 mb-6">
          <h2 className="text-base font-bold text-red-900 mb-3 pb-2 border-b border-red-300 flex items-center gap-2">
            🔒 부정행위 방지 시스템
          </h2>
          <ul className="space-y-2.5 text-sm text-red-900">
            <li className="flex items-start gap-2">
              <span className="text-red-900 font-bold flex-shrink-0">•</span>
              <span>시험 화면에서 <strong>우클릭, 복사, 붙여넣기가 제한</strong>됩니다. (답안 작성 영역은 제외)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-900 font-bold flex-shrink-0">•</span>
              <span>문제 내용의 <strong>텍스트 선택 및 드래그가 제한</strong>됩니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-900 font-bold flex-shrink-0">•</span>
              <span><strong>개발자 도구, 소스 보기 등이 차단</strong>됩니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-900 font-bold flex-shrink-0">•</span>
              <span><strong>다른 탭으로 전환 시 경고</strong>가 표시되며, 3회 이상 이탈 시 강력한 경고가 발생합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-900 font-bold flex-shrink-0">•</span>
              <span>시험 중 <strong>화면 이탈 횟수가 기록</strong>되며, 부정행위 판단 자료로 활용될 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-900 font-bold flex-shrink-0">•</span>
              <span>시험 화면에서 <strong>페이지를 벗어나려 할 때 확인 메시지</strong>가 표시됩니다.</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-sm font-bold text-red-900">
              ⚠️ 부정행위가 의심될 경우 시험이 무효 처리될 수 있습니다.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={() => setShowStartModal(true)}
            className="px-12 py-4 bg-neutral-900 text-white font-bold text-lg rounded hover:bg-neutral-800 transition-all shadow-elevation-2 hover:shadow-elevation-3 hover:transform hover:-translate-y-0.5"
          >
            🚀 시험 시작하기
          </button>
          <p className="mt-3 text-sm text-neutral-600">버튼을 클릭하면 즉시 시험이 시작되며 타이머가 작동합니다.</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-300 bg-white mt-6">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm text-neutral-600">
          <p>© 2024 생성형 AI 활용 역량평가 시스템 | Powered by Google Gemini AI</p>
        </div>
      </footer>

      {/* 시험 시작 확인 모달 */}
      {showStartModal && (
        <div className="fixed inset-0 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="exam-panel-header exam-panel-header-primary rounded-t-lg">
              <span>📋</span>
              <span>시험 시작 확인</span>
            </div>
            <div className="p-6">
              <p className="text-base text-neutral-900 mb-4 font-semibold">시험을 시작하시겠습니까?</p>
              <div className="space-y-2 text-sm text-neutral-700 mb-6">
                <p className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>시험이 시작되면 타이머가 작동합니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>중간에 종료할 수 없습니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>충분한 시간을 확보한 후 시작하세요.</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleStartExam}
                  className="flex-1 px-4 py-3 bg-neutral-900 text-white font-bold text-base rounded hover:bg-neutral-800 transition-all"
                >
                  확인
                </button>
                <button
                  onClick={() => setShowStartModal(false)}
                  className="flex-1 px-4 py-3 bg-white text-neutral-700 font-semibold text-base border border-neutral-300 rounded hover:bg-neutral-100 transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="exam-panel-header exam-panel-header-secondary rounded-t-lg">
              <span>🚪</span>
              <span>로그아웃 확인</span>
            </div>
            <div className="p-6">
              <p className="text-base text-neutral-900 mb-6">로그아웃 하시겠습니까?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-neutral-900 text-white font-bold text-base rounded hover:bg-neutral-800 transition-all"
                >
                  확인
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 bg-white text-neutral-700 font-semibold text-base border border-neutral-300 rounded hover:bg-neutral-100 transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 에러 모달 */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="exam-panel-header exam-panel-header-accent rounded-t-lg">
              <span>⚠️</span>
              <span>오류</span>
            </div>
            <div className="p-6">
              <p className="text-base text-neutral-900 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-3 bg-neutral-900 text-white font-bold text-base rounded hover:bg-neutral-800 transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
