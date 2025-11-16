'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useExamStore } from '@/lib/stores/examStore';

interface ExamHeaderProps {
  onMenuClick?: () => void;
}

export default function ExamHeader({ onMenuClick }: ExamHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { timeRemaining, currentQuestionIndex, questions, decrementTimer, syncTimer, submitExam, answers, saveAnswer, hasUnsavedChanges, goToQuestion } = useExamStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingQuestionNumber, setPendingQuestionNumber] = useState<number | null>(null);

  // 타이머 카운트다운 (매 초)
  useEffect(() => {
    const timer = setInterval(() => {
      if (timeRemaining > 0) {
        decrementTimer();
      } else if (timeRemaining === 0 && !showTimeoutModal) {
        // 시간 종료시 자동 제출
        setShowTimeoutModal(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, decrementTimer, showTimeoutModal]);

  // 타이머 서버 동기화 (30초마다)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      syncTimer();
    }, 30000); // 30초마다 동기화

    return () => clearInterval(syncInterval);
  }, [syncTimer]);

  // 시간 종료시 자동 제출
  useEffect(() => {
    if (showTimeoutModal) {
      handleTimeout();
    }
  }, [showTimeoutModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    if (!questions || questions.length === 0) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      setShowSaveModal(true);
      setIsSaving(true);

      await saveAnswer(currentQuestion.id.toString());
      // 타이머도 서버에 동기화
      await syncTimer();
      // 저장 성공 후 1초간 표시
      setTimeout(() => {
        setIsSaving(false);
        setTimeout(() => {
          setShowSaveModal(false);
        }, 500);
      }, 1000);
    } catch (error: any) {
      setIsSaving(false);
      setShowSaveModal(false);
      // 에러 메시지 표시
      const errorMessage = error.message || '저장에 실패했습니다. 다시 시도해주세요.';
      alert(errorMessage);
    }
  };

  // 시간 종료 시 자동 제출
  const handleTimeout = async () => {
    try {
      await syncTimer(); // 최종 타이머 동기화
      await submitExam();
      router.push('/exam/result');
    } catch (error) {
      console.error('Failed to submit exam:', error);
      router.push('/exam/result');
    }
  };

  // 답안 제출
  const handleSubmit = async () => {
    try {
      await submitExam();
      setShowSubmitModal(false);
      router.push('/exam/result');
    } catch (error) {
      alert('시험 제출에 실패했습니다.');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer color logic: Lighter Gray (>30min) → Medium Gray (10-30min) → Dark Gray (<10min)
  const getTimerColor = () => {
    if (timeRemaining < 600) return 'danger'; // < 10min - Darkest
    if (timeRemaining < 1800) return 'warning'; // 10-30min - Medium
    return 'success'; // > 30min - Light
  };

  const timerColor = getTimerColor();
  const shouldBlink = timeRemaining < 600; // Blink when < 10min

  // 문항으로 이동하는 핸들러 (표시 번호 사용)
  const handleQuestionClick = (displayNumber: number) => {
    // 표시 번호는 1부터 시작하므로 인덱스로 변환
    const targetIdx = displayNumber - 1;
    if (targetIdx === currentQuestionIndex) return;
    
    // 저장되지 않은 변경사항이 있는 경우
    if (hasUnsavedChanges) {
      setPendingQuestionNumber(displayNumber);
      setShowUnsavedModal(true);
    } else {
      router.push(`/exam/questions/${displayNumber}`);
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingQuestionNumber !== null) {
      const targetIdx = pendingQuestionNumber - 1;
      if (targetIdx >= 0 && targetIdx < questions.length) {
        goToQuestion(targetIdx, true);
        router.push(`/exam/questions/${pendingQuestionNumber}`);
      }
      setShowUnsavedModal(false);
      setPendingQuestionNumber(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedModal(false);
    setPendingQuestionNumber(null);
  };

  // Progress dots: 모든 문항에 번호 표시, 작은 크기, 클릭 가능
  const getProgressDots = () => {
    if (!questions || questions.length === 0) return null;
    return questions.map((q, idx) => {
      // 서버에 저장된 답변만 완료로 표시 (저장 버튼 클릭 후)
      const hasAnswer = q.is_answered === true;
      const isCurrent = idx === currentQuestionIndex;
      
      const displayNumber = idx + 1; // 표시 번호 (1, 2, 3...)
      
      if (isCurrent) {
        return (
          <button
            key={q.id}
            onClick={() => handleQuestionClick(displayNumber)}
            className="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400/50 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/40 ring-2 ring-blue-300/30 transition-all duration-300 hover:scale-110 cursor-pointer"
            title={`문항 ${displayNumber} (현재)${hasAnswer ? ' - 저장됨' : ''}`}
          >
            {hasAnswer ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="relative z-10">{displayNumber}</span>
            )}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20"></div>
          </button>
        );
      }
      
      return (
        <button
          key={q.id}
          onClick={() => handleQuestionClick(displayNumber)}
          className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 hover:scale-125 cursor-pointer ${
            hasAnswer
              ? 'bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-500/50 hover:shadow-lg'
              : 'bg-white/10 text-slate-400 border border-white/20 hover:bg-white/20 hover:border-white/40 hover:text-white'
          }`}
          title={`문항 ${displayNumber}${hasAnswer ? ' (완료)' : ' (미완료)'}`}
        >
          {hasAnswer ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="relative z-10">{displayNumber}</span>
          )}
          {hasAnswer && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20"></div>
          )}
        </button>
      );
    });
  };

  return (
    <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 h-20 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-xl shadow-2xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none"></div>
      
      {/* Left: Menu Button + Exam Name */}
      <div className="flex items-center gap-5 relative z-10">
        {/* Menu Button - Glassmorphism */}
        <button
          onClick={onMenuClick}
          className="group p-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
          aria-label="문항 목록 열기"
          title="문항 목록"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-white/90 group-hover:text-white transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-white tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            생성형 AI 활용 역량평가
          </h1>
          <p className="text-xs text-slate-400 font-medium">Generative AI Assessment</p>
        </div>
      </div>

      {/* Center: Progress Dots - Compact & Clickable */}
      <div className="flex items-center gap-1.5 relative z-10 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
        {getProgressDots()}
      </div>

      {/* Right: Timer, Submit Button, User */}
      <div className="flex items-center gap-3.5 relative z-10">
        {/* Timer - Premium Design */}
        <div
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 backdrop-blur-sm shadow-xl ${
            timerColor === 'danger'
              ? `bg-gradient-to-r from-red-600 to-red-700 text-white border border-red-500/50 shadow-red-500/50 ${shouldBlink ? 'timer-warning' : ''}`
              : timerColor === 'warning'
              ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white border border-orange-500/50 shadow-orange-500/30'
              : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-600/50'
          }`}
        >
          <span className="text-lg">⏱</span>
          <span className="tabular-nums text-base">{formatTime(timeRemaining)}</span>
        </div>

        {/* Submit Button - Premium Design */}
        <button
          onClick={() => setShowSubmitModal(true)}
          className="group flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm rounded-xl border border-blue-500/50 transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 hover:-translate-y-0.5"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>답안 제출</span>
        </button>

        {/* User Card - Premium Glassmorphism */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full border border-white/20 shadow-lg">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium leading-tight">수험번호</span>
            <span className="text-sm font-bold text-white tabular-nums leading-tight">{user?.exam_number}</span>
          </div>
        </div>
      </div>

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

      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="exam-panel-header bg-red-600 rounded-t-lg">
              <span>⏰</span>
              <span>시험 시간 종료</span>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-neutral-900 mb-2">시험 시간이 종료되었습니다</p>
              <p className="text-sm text-neutral-600 mb-6 text-center">
                시험이 자동으로 제출됩니다.<br />
                잠시만 기다려주세요...
              </p>
              <div className="w-16 h-16 border-4 border-neutral-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowSubmitModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="exam-panel-header exam-panel-header-primary rounded-t-lg">
              <span>📝</span>
              <span>답안 제출 확인</span>
            </div>
            <div className="p-6">
              <p className="text-base text-neutral-900 mb-4 font-semibold">
                정말 답안을 제출하시겠습니까?
              </p>
              <div className="space-y-2 text-sm text-neutral-700 mb-6">
                <p className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>제출 후에는 답안을 수정할 수 없습니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>저장하지 않은 답안은 제출되지 않습니다.</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-lg transition-all shadow-lg"
                >
                  제출하기
                </button>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-4 py-3 bg-white text-neutral-700 font-semibold text-base border-2 border-neutral-300 rounded-lg hover:bg-neutral-100 transition-all"
                >
                  취소
                </button>
              </div>
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
    </header>
  );
}


