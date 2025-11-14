'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useExamStore } from '@/lib/stores/examStore';

interface ExamHeaderProps {
  onMenuClick?: () => void;
}

export default function ExamHeader({ onMenuClick }: ExamHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const { timeRemaining, currentQuestionIndex, questions, updateTimer, answers } = useExamStore();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeRemaining > 0) {
        updateTimer(timeRemaining - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, updateTimer]);

  // Auto-save status simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

      {/* Right: Timer, Save Status, User */}
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

        {/* Save Status - Compact */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg">
          {saveStatus === 'saved' ? (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-medium text-green-400">저장완료</span>
            </>
          ) : (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium text-white">저장중</span>
            </>
          )}
        </div>

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
    </header>
  );
}
