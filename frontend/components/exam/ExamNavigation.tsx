'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useExamStore } from '@/lib/stores/examStore';

export default function ExamNavigation() {
  const router = useRouter();
  const { currentQuestionIndex, questions, answers, saveAnswer, hasUnsavedChanges, goToQuestion } = useExamStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<number | null>(null);

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      const targetIndex = currentQuestionIndex - 1;
      if (hasUnsavedChanges) {
        setPendingNavigation(targetIndex);
        setShowUnsavedModal(true);
      } else {
        // 표시 번호는 인덱스 + 1
        router.push(`/exam/questions/${targetIndex + 1}`);
      }
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      const targetIndex = currentQuestionIndex + 1;
      if (hasUnsavedChanges) {
        setPendingNavigation(targetIndex);
        setShowUnsavedModal(true);
      } else {
        // 표시 번호는 인덱스 + 1
        router.push(`/exam/questions/${targetIndex + 1}`);
      }
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation !== null) {
      goToQuestion(pendingNavigation, true);
      // 표시 번호는 인덱스 + 1
      router.push(`/exam/questions/${pendingNavigation + 1}`);
      setShowUnsavedModal(false);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handleSave = async () => {
    if (!questions || questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setShowSaveModal(true);
    setIsSaving(true);

    try {
      await saveAnswer(currentQuestion.id.toString());
      // 저장 성공 후 1초간 표시
      setTimeout(() => {
        setIsSaving(false);
        setTimeout(() => {
          setShowSaveModal(false);
        }, 500);
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      setShowSaveModal(false);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <footer className="bg-white border-t-2 border-neutral-300 h-16 flex items-center justify-between px-6 shadow-elevation-2 relative">
        {/* Left: IITP Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.svg"
            alt="정보통신기획평가원"
            width={244}
            height={32}
            className="object-contain"
            priority
          />
        </div>

        {/* Center: Navigation buttons */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="px-6 py-2.5 text-sm font-semibold text-neutral-700 bg-white border-2 border-neutral-400 rounded-button hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-elevation-1"
          >
            ◄ 이전
          </button>
          <button
            onClick={handleNext}
            disabled={isLastQuestion}
            className="px-6 py-2.5 text-sm font-semibold text-neutral-700 bg-white border-2 border-neutral-400 rounded-button hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-elevation-1"
          >
            다음 ►
          </button>
        </div>

        {/* Right: Help, Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('문의사항이 있으시면 시험 관리자에게 연락해주세요.\n\n이메일: support@example.com\n전화: 02-1234-5678')}
            className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border-2 border-neutral-400 rounded-button hover:bg-neutral-100 transition-all shadow-elevation-1"
          >
            문의하기
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-button transition-all shadow-elevation-3"
          >
            저장
          </button>
        </div>
      </footer>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
            <div className="exam-panel-header exam-panel-header-primary rounded-t-lg">
              <span>💾</span>
              <span>답안 저장</span>
            </div>
            <div className="p-6 flex flex-col items-center">
              {isSaving ? (
                <>
                  <div className="w-16 h-16 border-4 border-neutral-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-base font-semibold text-neutral-900">저장 중입니다...</p>
                  <p className="text-sm text-neutral-600 mt-1">잠시만 기다려주세요</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-neutral-900">저장되었습니다!</p>
                  <p className="text-sm text-neutral-600 mt-1">답안이 안전하게 저장되었습니다</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
