'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useExamStore } from '@/lib/stores/examStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const startExam = useExamStore((state) => state.startExam);
  
  const [showStartModal, setShowStartModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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
        <div className="text-sm text-neutral-600">시스템을 준비하고 있습니다...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const questions = [
    { num: 1, title: 'Self-Attention 메커니즘', category: '역량 A', desc: 'Transformer 핵심 개념', type: '객관식', points: 10 },
    { num: 2, title: 'AI 도구 특징 비교', category: '역럅 A', desc: 'ChatGPT, Claude, Gemini, DALL-E', type: '객관식', points: 15 },
    { num: 3, title: '구조화된 프롬프트', category: '역량 B', desc: '고객 서비스 챗봇 설계', type: '서술형', points: 10 },
    { num: 4, title: 'Few-shot Learning', category: '역량 B', desc: '제품 리뷰 감정 분류', type: '서술형', points: 10 },
    { num: 5, title: '업무 자동화 시스템', category: '역량 B', desc: '주간 보고서 자동화', type: '실습형', points: 10 },
    { num: 6, title: 'AI 신뢰성 검증', category: '역량 C', desc: '환각(Hallucination) 대응', type: '객관식', points: 8 },
    { num: 7, title: '사실 검증 실습', category: '역량 C', desc: '기후변화 콘텐츠 검증', type: '실습형', points: 10 },
    { num: 8, title: '채용 AI 윤리', category: '역량 C', desc: '편향성 및 차별 문제', type: '서술형', points: 7 },
    { num: 9, title: '개인정보 보호', category: '역량 D', desc: '온프레미스 vs 클라우드', type: '객관식', points: 7 },
    { num: 10, title: 'AI 이미지 저작권', category: '역량 D', desc: '지브리 스타일 생성 이슈', type: '서술형', points: 6 },
    { num: 11, title: '의료 AI 편향성', category: '역량 D', desc: 'X-ray 진단 정확도 문제', type: '실습형', points: 7 },
  ];

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
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col items-center py-3 bg-neutral-50 border border-neutral-300 rounded">
                <span className="text-neutral-600 mb-1">총 문항 수</span>
                <span className="font-bold text-neutral-900 text-lg">11문항</span>
              </div>
              <div className="flex flex-col items-center py-3 bg-neutral-50 border border-neutral-300 rounded">
                <span className="text-neutral-600 mb-1">총 배점</span>
                <span className="font-bold text-neutral-900 text-lg">100점</span>
              </div>
              <div className="flex flex-col items-center py-3 bg-neutral-50 border border-neutral-300 rounded">
                <span className="text-neutral-600 mb-1">시험 시간</span>
                <span className="font-bold text-neutral-900 text-lg">150분</span>
              </div>
              <div className="flex flex-col items-center py-3 bg-neutral-50 border border-neutral-300 rounded">
                <span className="text-neutral-600 mb-1">합격 기준</span>
                <span className="font-bold text-neutral-900 text-lg">70점</span>
              </div>
            </div>
          </div>

          {/* 평가 역량 */}
          <div>
            <h3 className="text-sm font-bold text-neutral-700 mb-3 px-2 py-1 bg-neutral-100 rounded">평가 역량</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-neutral-50 border border-neutral-300 rounded">
              <div className="font-bold text-neutral-900">역량 A: 기초 이해 및 활용</div>
              <div className="text-neutral-600 mt-1">문항 1-2 (25점)</div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-300 rounded">
              <div className="font-bold text-neutral-900">역량 B: 문제해결 및 실무 적용</div>
              <div className="text-neutral-600 mt-1">문항 3-5 (30점)</div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-300 rounded">
              <div className="font-bold text-neutral-900">역량 C: 비판적 사고 및 평가</div>
              <div className="text-neutral-600 mt-1">문항 6-8 (25점)</div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-300 rounded">
              <div className="font-bold text-neutral-900">역량 D: 윤리 및 책임성</div>
              <div className="text-neutral-600 mt-1">문항 9-11 (20점)</div>
            </div>
          </div>
          </div>
        </div>

        {/* Question List - 2열 배치 */}
        <div className="bg-white border border-neutral-300 rounded-lg shadow-elevation-1 p-6 mb-4">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-200">📝 문항 구성</h2>
          <div className="grid grid-cols-2 gap-3">
            {questions.map((q) => (
              <div
                key={q.num}
                className="flex flex-col p-3 bg-neutral-50 border border-neutral-300 rounded hover:border-neutral-500 hover:shadow-elevation-1 transition-all"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 bg-neutral-900 text-white rounded flex items-center justify-center font-bold text-base flex-shrink-0">
                    {q.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-900 text-base">{q.title}</div>
                    <div className="text-sm text-neutral-600 mt-0.5">{q.desc}</div>
                  </div>
                </div>
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-neutral-200">
                    <div className="text-sm font-semibold text-neutral-600 bg-white px-2.5 py-1 rounded border border-neutral-300">
                      {q.category}
                    </div>
                    <div className="text-sm text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300">
                      {q.type}
                    </div>
                    <div className="text-sm font-bold text-neutral-900 bg-neutral-200 px-2.5 py-1 rounded border border-neutral-400 ml-auto">
                      {q.points}점
                    </div>
                  </div>
              </div>
            ))}
          </div>
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
              <span>모든 답안은 <strong>자동으로 저장</strong>됩니다. 별도의 저장 버튼 클릭은 불필요합니다.</span>
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
              <span>🚺</span>
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
