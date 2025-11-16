'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useExamStore } from '@/lib/stores/examStore';
import apiClient from '@/lib/api/client';

interface ExamResult {
  exam_id: number;
  total_score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  category_scores: {
    category: string;
    score: number;
    max_score: number;
  }[];
}

export default function ExamResultPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { examId } = useExamStore();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!examId) {
        router.push('/');
        return;
      }

      try {
        const response = await apiClient.get(`/exams/${examId}/result`);
        setResult(response.data);
      } catch (error: any) {
        console.error('Failed to fetch exam result:', error);
        // 에러 발생 시 사용자에게 알림
        alert('시험 결과를 불러오는데 실패했습니다. 관리자에게 문의해주세요.');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [examId, router]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-600' };
    if (percentage >= 60) return { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-warning-700' };
    return { bg: 'bg-neutral-100', text: 'text-neutral-600', badge: 'bg-neutral-500' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-700 mb-4"></div>
          <div className="text-lg text-neutral-700 font-medium">결과를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="text-xl text-neutral-700 mb-4">결과를 불러올 수 없습니다.</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary-700 text-white font-semibold rounded-button hover:bg-primary-600 transition-all shadow-elevation-2"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = getScoreColor(result.percentage);

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">시험 결과</h1>
          <p className="text-neutral-600">수험번호: {user?.exam_number}</p>
        </div>

        {/* Score Card */}
        <div className={`${scoreColor.bg} rounded-lg shadow-elevation-4 p-8 mb-6 border-2 ${result.passed ? 'border-primary-700' : 'border-neutral-300'}`}>
          <div className="text-center">
            <div className="mb-4">
              <span className={`inline-block px-6 py-2 ${scoreColor.badge} text-white font-bold rounded-button text-sm`}>
                {result.passed ? '합격' : '불합격'}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-6xl font-bold text-neutral-900">{result.total_score}</span>
              <span className="text-3xl text-neutral-600 ml-2">/ {result.max_score}</span>
            </div>
            <div className="text-xl text-neutral-600 font-medium">
              득점률: {result.percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="bg-white rounded-lg shadow-elevation-2 p-6 mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">역량별 점수</h2>
          <div className="space-y-4">
            {result.category_scores.map((category, idx) => {
              const categoryPercentage = (category.score / category.max_score) * 100;
              const categoryColor = getScoreColor(categoryPercentage);
              
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-neutral-700">{category.category}</span>
                    <span className={`text-sm font-bold ${categoryColor.text}`}>
                      {category.score} / {category.max_score}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${categoryColor.badge} transition-all duration-500`}
                      style={{ width: `${categoryPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow-elevation-2 p-6 mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">평가 의견</h2>
          <div className="prose prose-sm max-w-none text-neutral-700 leading-relaxed">
            {result.passed ? (
              <>
                <p className="mb-3">
                  <strong className="text-success-700">축하합니다!</strong> 생성형 AI 활용 역량평가를 통과하셨습니다.
                </p>
                <p>
                  귀하는 생성형 AI 도구를 효과적으로 활용하고, 비판적으로 평가하며, 
                  윤리적 고려사항을 이해하는 능력을 입증하셨습니다.
                </p>
              </>
            ) : (
              <>
                <p className="mb-3">
                  <strong className="text-warning-700">아쉽습니다.</strong> 이번 평가에서는 합격 기준에 도달하지 못하셨습니다.
                </p>
                <p>
                  생성형 AI 기술에 대한 이해를 높이고, 실무 활용 능력을 강화하여 
                  다음 기회에 더 나은 결과를 얻으실 수 있을 것입니다.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              // Mock AI feedback
              alert('AI 기반 학습 경로 추천\n\n• 프롬프트 엔지니어링 심화 과정\n• 생성형 AI 윤리 가이드\n• 실무 사례 연구\n\n곧 상세한 추천을 이메일로 받으실 수 있습니다.');
            }}
            className="px-8 py-3 bg-primary-700 text-white font-semibold rounded-button hover:bg-primary-600 transition-all shadow-elevation-2"
          >
            📚 추천 학습 경로 보기
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-white border-2 border-neutral-300 text-neutral-700 font-semibold rounded-button hover:bg-neutral-50 transition-all shadow-elevation-2"
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>결과는 자동으로 저장되었습니다. 관리자가 검토 후 최종 확정됩니다.</p>
        </div>
      </div>
    </div>
  );
}

