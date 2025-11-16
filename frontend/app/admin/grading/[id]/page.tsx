'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

export default function ExamGradingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.id as string);
  
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gradingAnswer, setGradingAnswer] = useState<number | null>(null);

  useEffect(() => {
    loadExamDetails();
  }, [examId]);

  const loadExamDetails = async () => {
    try {
      const response = await apiClient.get(`/admin/exam/${examId}/details`);
      setExamData(response.data);
    } catch (error: any) {
      console.error('Failed to load exam details:', error);
      alert('시험 정보를 불러오는데 실패했습니다.');
      router.push('/admin/grading');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeAnswer = async (answerId: number, score: number, feedback: string) => {
    try {
      console.log('📝 Grading answer:', { answerId, score, feedback });
      
      const response = await apiClient.post(`/admin/grade/answer/${answerId}`, {
        score,
        feedback: feedback || ''
      });
      
      console.log('✅ Grade saved successfully:', response.data);
      
      alert('채점이 완료되었습니다.');
      loadExamDetails();
      setGradingAnswer(null);
    } catch (error: any) {
      console.error('❌ Failed to grade answer:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      const errorMessage = error.response?.data?.detail || error.message || '채점에 실패했습니다.';
      alert(`채점에 실패했습니다: ${errorMessage}`);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'multiple_choice': '객관식',
      'prompt_design': '프롬프트 설계',
      'fact_checking': '사실 검증',
      'ethical_review': '윤리 검토',
      'essay': '수행형',
      'practical': '서술형',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">시험을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const totalScore = examData.answers.reduce((sum: number, ans: any) => sum + (ans.score || 0), 0);
  const totalPoints = examData.answers.reduce((sum: number, ans: any) => sum + (ans.question_points || 0), 0);

  return (
    <div className="p-8 bg-neutral-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/grading')}
            className="text-neutral-600 hover:text-neutral-900 mb-4 flex items-center gap-2"
          >
            <span>←</span> 목록으로 돌아가기
          </button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">시험 #{examId} 채점</h1>
                <div className="mt-2 space-y-1 text-sm text-neutral-600">
                  <p>수험생: <span className="font-semibold">{examData.user.exam_number}</span> ({examData.user.email})</p>
                  <p>제출 시간: {examData.exam.end_time ? new Date(examData.exam.end_time).toLocaleString('ko-KR') : '-'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-600 mb-1">총점</div>
                <div className="text-4xl font-bold text-neutral-900">
                  {totalScore}
                  <span className="text-2xl text-neutral-500">/{totalPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          {examData.answers.map((answer: any, idx: number) => (
            <div key={answer.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Answer Header */}
              <div className="bg-neutral-900 text-white px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">
                    문제 {answer.question_number}: {answer.question_title}
                  </h3>
                  <div className="text-sm text-neutral-300 mt-1">
                    {getTypeLabel(answer.question_type)} • {answer.question_points}점
                  </div>
                </div>
                <div className="text-right">
                  {answer.score !== null ? (
                    <div>
                      <div className="text-2xl font-bold">{answer.score}점</div>
                      <span className="text-xs text-green-300">채점 완료</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setGradingAnswer(answer.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all"
                    >
                      채점하기
                    </button>
                  )}
                </div>
              </div>

              {/* Answer Content */}
              <div className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-3">학생 답안:</h4>
                
                {(() => {
                  // answer_content가 없거나 null인 경우 처리
                  const answerData = answer.answer_content || answer.answer_data || {};
                  
                  // 디버깅: 실제 데이터 구조 확인
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Answer data for question', answer.question_number, ':', answerData);
                  }
                  
                  if (answer.question_type === 'multiple_choice') {
                    const selectedOption = answerData.selectedOption;
                    return (
                      <div className="bg-neutral-100 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-neutral-900">
                          선택: {selectedOption !== undefined && selectedOption !== null ? 
                            `${selectedOption}번` : '미응답'}
                        </div>
                      </div>
                    );
                  } else if (answer.question_type === 'practical') {
                    // 서술형: 문제점 분석과 개선 방안
                    if (answerData.answerText) {
                      return (
                        <div className="bg-neutral-100 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm text-neutral-800 font-sans">
                            {answerData.answerText}
                          </pre>
                        </div>
                      );
                    } else {
                      const hasSection1 = answerData.section1 && answerData.section1.trim() !== '';
                      const hasSection2 = answerData.section2 && answerData.section2.trim() !== '';
                      
                      if (!hasSection1 && !hasSection2) {
                        return (
                          <div className="bg-neutral-100 p-4 rounded-lg">
                            <div className="text-neutral-500 italic">답안이 없습니다.</div>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="bg-neutral-100 p-4 rounded-lg space-y-4">
                          {hasSection1 && (
                            <div>
                              <h3 className="font-semibold text-neutral-900 mb-2">🔍 1. 문제점 분석</h3>
                              <div className="text-sm text-neutral-800 whitespace-pre-wrap">
                                {answerData.section1}
                              </div>
                            </div>
                          )}
                          {hasSection2 && (
                            <div>
                              <h3 className="font-semibold text-neutral-900 mb-2">💡 2. 개선 방안</h3>
                              <div className="text-sm text-neutral-800 whitespace-pre-wrap">
                                {answerData.section2}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  } else {
                    // 수행형, 프롬프트 설계 등
                    if (answerData.answerText) {
                      return (
                        <div className="bg-neutral-100 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm text-neutral-800 font-sans">
                            {answerData.answerText}
                          </pre>
                        </div>
                      );
                    } else if (answerData.prompt) {
                      return (
                        <div className="bg-neutral-100 p-4 rounded-lg space-y-3">
                          <div>
                            <div className="font-semibold text-neutral-900 mb-2">프롬프트:</div>
                            <div className="text-sm text-neutral-800 whitespace-pre-wrap">
                              {answerData.prompt}
                            </div>
                          </div>
                          {answerData.aiResponse && (
                            <div>
                              <div className="font-semibold text-neutral-900 mb-2">AI 응답:</div>
                              <div className="text-sm text-neutral-800 whitespace-pre-wrap">
                                {answerData.aiResponse}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else if (answerData.verifications || answerData.analysis) {
                      // 사실 검증 유형
                      return (
                        <div className="bg-neutral-100 p-4 rounded-lg space-y-3">
                          {answerData.verifications && Array.isArray(answerData.verifications) && answerData.verifications.length > 0 && (
                            <div>
                              <div className="font-semibold text-neutral-900 mb-2">사실 검증:</div>
                              <div className="space-y-2">
                                {answerData.verifications.map((v: any, idx: number) => (
                                  <div key={idx} className="text-sm text-neutral-800 border-l-2 border-blue-500 pl-3">
                                    <div className="font-medium">주장: {v.claim || '-'}</div>
                                    <div>결과: {v.result || '-'}</div>
                                    <div>출처: {v.source || '-'}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {answerData.analysis && (
                            <div>
                              <div className="font-semibold text-neutral-900 mb-2">분석:</div>
                              <div className="text-sm text-neutral-800 whitespace-pre-wrap">
                                {answerData.analysis}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else if (Object.keys(answerData).length > 0) {
                      // 기타 형식의 답안
                      return (
                        <div className="bg-neutral-100 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm text-neutral-800 font-sans">
                            {typeof answerData === 'string' 
                              ? answerData 
                              : JSON.stringify(answerData, null, 2)}
                          </pre>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-neutral-100 p-4 rounded-lg">
                          <div className="text-neutral-500 italic">답안이 없습니다.</div>
                        </div>
                      );
                    }
                  }
                })()}

                {/* Feedback */}
                {answer.feedback && (
                  <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h5 className="font-semibold text-blue-900 mb-2">피드백:</h5>
                    <p className="text-blue-800 text-sm whitespace-pre-wrap">{answer.feedback}</p>
                  </div>
                )}
              </div>

              {/* Grading Form */}
              {gradingAnswer === answer.id && (
                <div className="border-t border-neutral-200 bg-neutral-50 p-6">
                  <h4 className="font-semibold text-neutral-900 mb-4">채점</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const score = parseInt(formData.get('score') as string);
                      const feedback = formData.get('feedback') as string;
                      handleGradeAnswer(answer.id, score, feedback);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        점수 (0 ~ {answer.question_points}점)
                      </label>
                      <input
                        type="number"
                        name="score"
                        min="0"
                        max={answer.question_points}
                        required
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        피드백 (선택사항)
                      </label>
                      <textarea
                        name="feedback"
                        rows={4}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        placeholder="학생에게 전달할 피드백을 입력하세요..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all font-semibold"
                      >
                        채점 완료
                      </button>
                      <button
                        type="button"
                        onClick={() => setGradingAnswer(null)}
                        className="px-6 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-all font-semibold"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}






