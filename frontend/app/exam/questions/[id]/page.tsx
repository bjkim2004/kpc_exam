'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useExamStore } from '@/lib/stores/examStore';
import MultipleChoiceQuestion from '@/components/exam/questions/MultipleChoiceQuestion';
import PromptDesignQuestion from '@/components/exam/questions/PromptDesignQuestion';
import FactCheckingQuestion from '@/components/exam/questions/FactCheckingQuestion';
import EthicalReviewQuestion from '@/components/exam/questions/EthicalReviewQuestion';
import PracticalQuestion from '@/components/exam/questions/PracticalQuestion';

export default function QuestionPage() {
  const params = useParams();
  const displayNumber = parseInt(params.id as string); // 시험 화면 표시 번호 (1, 2, 3...)
  const { questions, goToQuestion, currentQuestionIndex } = useExamStore();

  useEffect(() => {
    if (questions.length > 0) {
      // 표시 번호는 1부터 시작하므로 인덱스로 변환 (displayNumber - 1)
      const index = displayNumber - 1;
      if (index >= 0 && index < questions.length && index !== currentQuestionIndex) {
        goToQuestion(index);
      }
    }
  }, [displayNumber, questions, goToQuestion, currentQuestionIndex]);

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl">문항을 불러오는 중...</div>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

  if (!question) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl">문항을 찾을 수 없습니다.</div>
      </div>
    );
  }

  // Render appropriate component based on question type
  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple_choice':
        return <MultipleChoiceQuestion question={question} />;
      case 'prompt_design':
      case 'essay':
        return <PromptDesignQuestion question={question} />;
      case 'practical':
        return <PracticalQuestion question={question} />;
      case 'fact_checking':
        return <FactCheckingQuestion question={question} />;
      case 'ethical_review':
        return <EthicalReviewQuestion question={question} />;
      case 'comprehension':
      case 'application':
      case 'critical_analysis':
      case 'case_study':
        return <PromptDesignQuestion question={question} />;
      default:
        return (
          <div className="p-8 text-center">
            <p className="text-lg text-neutral-600">
              문항 유형을 지원하지 않습니다: {question.type}
            </p>
          </div>
        );
    }
  };

  return renderQuestion();
}


