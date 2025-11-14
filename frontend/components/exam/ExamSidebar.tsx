'use client';

import { useRouter } from 'next/navigation';
import { useExamStore } from '@/lib/stores/examStore';

interface ExamSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExamSidebar({ isOpen, onClose }: ExamSidebarProps) {
  const router = useRouter();
  const { questions, currentQuestionIndex, answers, goToQuestion } = useExamStore();

  const handleQuestionClick = (index: number) => {
    if (!questions || !questions[index]) return;
    goToQuestion(index);
    router.push(`/exam/questions/${questions[index].question_number}`);
    onClose(); // Close sidebar after selection on mobile
  };

  // 완료된 문항 수 계산
  const getCompletedCount = () => {
    if (!questions || questions.length === 0) return 0;
    return questions.filter((question) => {
      const hasLocalAnswer = answers[question.id.toString()] !== undefined && 
                      answers[question.id.toString()] !== null && 
                      answers[question.id.toString()] !== '';
      const hasServerAnswer = question.is_answered === true;
      return hasLocalAnswer || hasServerAnswer;
    }).length;
  };

  // Early return if questions not loaded
  if (!questions || questions.length === 0) {
    return (
      <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-neutral-300 shadow-elevation-4 z-50">
        <div className="bg-neutral-900 text-white px-3 py-2.5">
          <h2 className="text-sm font-bold">문항 목록</h2>
        </div>
        <div className="p-4 flex items-center justify-center h-[calc(100%-3rem)]">
          <div className="text-xs text-neutral-500">문항을 불러오는 중...</div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Backdrop - Always show when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-800/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel - Compact slide panel */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-56
          bg-white border-r border-neutral-300 
          overflow-y-auto shadow-elevation-4
          z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Black header bar */}
        <div className="bg-neutral-900 text-white px-3 py-2.5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold">문항 목록</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="닫기"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-neutral-300">
            완료: <span className="font-bold text-green-400">{getCompletedCount()}</span> / {questions.length}문항
          </div>
        </div>

        {/* Question list - centered */}
        <div className="p-3 flex flex-col items-center">
          <div className="w-full max-w-[180px] space-y-2">
            {questions.map((question, idx) => {
              // 로컬 답변 (아직 저장 안 됨) 또는 서버에 저장된 답변 확인
              const hasLocalAnswer = answers[question.id.toString()] !== undefined && 
                              answers[question.id.toString()] !== null && 
                              answers[question.id.toString()] !== '';
              const hasServerAnswer = question.is_answered === true;
              const hasAnswer = hasLocalAnswer || hasServerAnswer;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={question.id}
                  onClick={() => handleQuestionClick(idx)}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs transition-all relative ${
                    isCurrent
                      ? 'bg-neutral-900 text-white font-bold shadow-lg ring-2 ring-neutral-700 ring-offset-2'
                      : hasAnswer
                      ? 'bg-green-50 text-green-900 border-2 border-green-500 hover:bg-green-100 shadow-sm hover:shadow-md'
                      : 'bg-white text-neutral-700 border-2 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* 상태 아이콘 */}
                      <span className={`text-lg font-bold flex-shrink-0 ${
                        isCurrent 
                          ? 'text-white' 
                          : hasAnswer 
                          ? 'text-green-600' 
                          : 'text-neutral-400'
                      }`}>
                        {isCurrent ? '▶' : hasAnswer ? '✓' : '○'}
                      </span>
                      <span className="font-semibold">문항 {question.question_number}</span>
                    </div>
                    {/* 상태 배지 */}
                    {!isCurrent && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        hasAnswer 
                          ? 'bg-green-500 text-white' 
                          : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        {hasAnswer ? '완료' : '미완료'}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-xs font-bold text-white/80">
                        현재
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
