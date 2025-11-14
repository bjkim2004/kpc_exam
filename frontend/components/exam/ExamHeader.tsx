'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useExamStore } from '@/lib/stores/examStore';

interface ExamHeaderProps {
  onMenuClick?: () => void;
}

export default function ExamHeader({ onMenuClick }: ExamHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const { timeRemaining, currentQuestionIndex, questions, updateTimer, answers, saveAnswer } = useExamStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeRemaining > 0) {
        updateTimer(timeRemaining - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, updateTimer]);

  // 저장 버튼 클릭 핸들러
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

  // Progress dots: filled (●) for answered, empty (○) for unanswered
  const getProgressDots = () => {
    if (!questions || questions.length === 0) return null;
    return questions.map((q, idx) => {
      const hasAnswer = answers[q.id.toString()] !== undefined && answers[q.id.toString()] !== null && answers[q.id.toString()] !== '';
      const isCurrent = idx === currentQuestionIndex;
      
      if (isCurrent) {
        return (
          <div
            key={q.id}
            className="w-10 h-10 rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center text-white text-sm font-bold shadow-elevation-2 ring-2 ring-neutral-400"
            title={`문항 ${idx + 1} (현재)`}
          >
            {idx + 1}
          </div>
        );
      }
      
      return (
        <div
          key={q.id}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
            hasAnswer
              ? 'bg-neutral-700 text-white'
              : 'bg-neutral-300 text-neutral-500'
          }`}
          title={`문항 ${idx + 1} ${hasAnswer ? '(응답완료)' : '(미응답)'}`}
        >
          {hasAnswer ? '●' : '○'}
        </div>
      );
    });
  };

  return (
    <header className="bg-black border-b-2 border-neutral-800 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Menu Button + Exam Name */}
      <div className="flex items-center gap-4">
        {/* Menu Button - Shows sidebar (Always visible) */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="문항 목록 열기"
          title="문항 목록"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="text-base font-semibold text-white">
          생성형 AI 활용 역량평가
        </h1>
      </div>

      {/* Center: Progress Dots */}
      <div className="flex items-center gap-2.5">
        {getProgressDots()}
      </div>

      {/* Right: Timer, Save Button, User */}
      <div className="flex items-center gap-3">
        {/* Timer - More Prominent */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
            timerColor === 'danger'
              ? `bg-red-600 text-white border-2 border-red-500 ${shouldBlink ? 'timer-warning' : ''}`
              : timerColor === 'warning'
              ? 'bg-neutral-600 text-white border-2 border-neutral-500'
              : 'bg-neutral-700 text-white border-2 border-neutral-600'
          }`}
        >
          <span className="text-base">⏱</span>
          <span className="tabular-nums">{formatTime(timeRemaining)}</span>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg border-2 border-green-500 transition-all shadow-sm hover:shadow-md"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>저장</span>
        </button>

        {/* User Card - Compact & Elegant */}
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg">
          <div className="flex items-center justify-center w-7 h-7 bg-neutral-800 rounded-full border border-neutral-600">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-neutral-300">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white tabular-nums">{user?.exam_number}</span>
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
    </header>
  );
}
