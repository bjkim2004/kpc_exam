'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/lib/stores/examStore';

interface ExamSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExamSidebar({ isOpen, onClose }: ExamSidebarProps) {
  const router = useRouter();
  const { questions, currentQuestionIndex, answers, goToQuestion, hasUnsavedChanges, saveAnswer } = useExamStore();
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleQuestionClick = (index: number) => {
    if (!questions || !questions[index]) return;
    
    // 현재 문항과 같은 문항을 클릭한 경우
    if (index === currentQuestionIndex) {
      onClose();
      return;
    }
    
    // 저장되지 않은 변경사항이 있는 경우
    if (hasUnsavedChanges) {
      setPendingNavigation(index);
      setShowUnsavedModal(true);
    } else {
      goToQuestion(index);
      // 표시 번호는 인덱스 + 1 (1, 2, 3...)
      router.push(`/exam/questions/${index + 1}`);
      onClose();
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation !== null && questions[pendingNavigation]) {
      goToQuestion(pendingNavigation, true);
      // 표시 번호는 인덱스 + 1 (1, 2, 3...)
      router.push(`/exam/questions/${pendingNavigation + 1}`);
      setShowUnsavedModal(false);
      setPendingNavigation(null);
      onClose();
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  // 완료된 문항 수 계산 (서버에 저장된 답변만)
  const getCompletedCount = () => {
    if (!questions || questions.length === 0) return 0;
    return questions.filter((question) => question.is_answered === true).length;
  };

  // Early return if questions not loaded
  if (!questions || questions.length === 0) {
    return (
      <aside className="fixed top-0 left-0 h-full w-48 bg-white border-r border-neutral-300 shadow-elevation-4 z-50">
        <div className="bg-neutral-900 text-white px-3 py-2.5">
          <h2 className="text-sm font-bold">문항 목록</h2>
        </div>
        <div className="p-3 flex items-center justify-center h-[calc(100%-3rem)]">
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
          fixed top-0 left-0 h-full w-48
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
        <div className="p-2.5 flex flex-col items-center">
          <div className="w-full space-y-2">
            {questions.map((question, idx) => {
              // 서버에 저장된 답변만 완료로 표시 (저장 버튼 클릭 후)
              const hasAnswer = question.is_answered === true;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={question.id}
                  onClick={() => handleQuestionClick(idx)}
                  className={`w-full px-2.5 py-2 rounded-lg text-xs transition-all relative ${
                    isCurrent
                      ? 'bg-neutral-900 text-white font-bold shadow-lg ring-2 ring-neutral-700 ring-offset-2'
                      : hasAnswer
                      ? 'bg-green-50 text-green-900 border-2 border-green-500 hover:bg-green-100 shadow-sm hover:shadow-md'
                      : 'bg-white text-neutral-700 border-2 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {/* 상태 아이콘 */}
                      <span className={`text-base font-bold flex-shrink-0 ${
                        isCurrent 
                          ? 'text-white' 
                          : hasAnswer 
                          ? 'text-green-600' 
                          : 'text-neutral-400'
                      }`}>
                        {isCurrent ? '▶' : hasAnswer ? '✓' : '○'}
                      </span>
                      <span className="font-semibold">문항 {idx + 1}</span>
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

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (() => {
        const currentQuestion = questions?.[currentQuestionIndex];
        const currentAnswer = currentQuestion ? answers[currentQuestion.id.toString()] : null;
        const hasAnswer = currentAnswer && (
          (currentAnswer.answerText && currentAnswer.answerText.trim() !== '') ||
          (currentAnswer.selectedOption !== undefined && currentAnswer.selectedOption !== null) ||
          (currentAnswer.section1 && currentAnswer.section1.trim() !== '') ||
          (currentAnswer.section2 && currentAnswer.section2.trim() !== '') ||
          (currentAnswer.prompt && currentAnswer.prompt.trim() !== '') ||
          (Array.isArray(currentAnswer.verifications) && currentAnswer.verifications.length > 0) ||
          (currentAnswer.analysis && currentAnswer.analysis.trim() !== '')
        );
        
        return (
          <div className="fixed inset-0 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={handleCancelNavigation}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-orange-600 text-white px-4 py-2.5 rounded-t-lg flex items-center gap-2">
                <span className="text-sm">⚠️</span>
                <span className="text-sm font-semibold">답안 저장 확인</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-neutral-900 mb-3 font-semibold text-center">
                  {hasAnswer ? '답안이 저장되지 않았습니다.' : '저장되지 않은 변경사항이 있습니다.'}
                </p>
                {hasAnswer && (
                  <p className="text-xs text-orange-700 mb-4 text-center">
                    저장하지 않고 이동하면 답안이 손실될 수 있습니다.
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {hasAnswer && (
                    <button
                      onClick={async () => {
                        if (!questions || questions.length === 0) return;
                        const currentQuestion = questions[currentQuestionIndex];
                        if (!currentQuestion) return;
                        try {
                          setIsSaving(true);
                          await saveAnswer(currentQuestion.id.toString());
                          // 저장 성공 후 잠시 대기하여 상태 업데이트 확인
                          await new Promise(resolve => setTimeout(resolve, 300));
                          setIsSaving(false);
                          handleConfirmNavigation();
                        } catch (error: any) {
                          setIsSaving(false);
                          alert(error.message || '저장에 실패했습니다.');
                        }
                      }}
                      disabled={isSaving}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all"
                    >
                      {isSaving ? '💾 저장 중...' : '💾 저장 후 이동'}
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelNavigation}
                      className="flex-1 px-3 py-2 bg-white text-neutral-700 font-semibold text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-all"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleConfirmNavigation}
                      className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-lg transition-all"
                    >
                      {hasAnswer ? '저장 없이 이동' : '이동하기'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
