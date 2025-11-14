'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/lib/stores/examStore';

export default function ExamNavigation() {
  const router = useRouter();
  const { currentQuestionIndex, questions, submitExam } = useExamStore();
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      router.push(`/exam/questions/${questions[currentQuestionIndex - 1].question_number}`);
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      router.push(`/exam/questions/${questions[currentQuestionIndex + 1].question_number}`);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitExam();
      setShowSubmitModal(false);
      router.push('/exam/result');
    } catch (error) {
      alert('시험 제출에 실패했습니다.');
    }
  };

  return (
    <>
      <footer className="bg-white border-t-2 border-neutral-300 h-16 flex items-center justify-between px-6 shadow-elevation-2">
        {/* Left: Navigation buttons */}
        <div className="flex items-center gap-4">
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

        {/* Right: Help, Submit */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('문의사항이 있으시면 시험 관리자에게 연락해주세요.\n\n이메일: support@example.com\n전화: 02-1234-5678')}
            className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border-2 border-neutral-400 rounded-button hover:bg-neutral-100 transition-all shadow-elevation-1"
          >
            문의하기
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-2 text-sm font-semibold text-white bg-neutral-900 rounded-button hover:bg-neutral-800 transition-all shadow-elevation-3"
          >
            시험 종료
          </button>
        </div>
      </footer>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={() => setShowSubmitModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-neutral-300" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">시험 제출 확인</h3>
            <p className="text-base text-neutral-700 mb-8 leading-relaxed">
              정말 시험을 제출하시겠습니까?<br />
              제출 후에는 답안을 수정할 수 없습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-6 py-2.5 text-sm font-semibold text-neutral-700 bg-neutral-100 border-2 border-neutral-300 rounded-button hover:bg-neutral-200 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-neutral-900 rounded-button hover:bg-neutral-800 transition-all shadow-elevation-2"
              >
                제출하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
