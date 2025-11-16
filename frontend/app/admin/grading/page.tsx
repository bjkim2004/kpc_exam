'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export default function GradingPage() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded'>('submitted');
  const [gradingExamId, setGradingExamId] = useState<number | null>(null);
  const [examData, setExamData] = useState<any>(null);
  const [loadingExamData, setLoadingExamData] = useState(false);
  const [gradingAnswer, setGradingAnswer] = useState<number | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const response = await apiClient.get('/admin/exams');
      setExams(response.data);
    } catch (error: any) {
      console.error('Failed to load exams:', error);
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadExamDetails = async (examId: number) => {
    setLoadingExamData(true);
    setExamData(null);
    try {
      const response = await apiClient.get(`/admin/exam/${examId}/details`);
      console.log('📋 Exam details response:', response.data);
      console.log('📋 Answers count:', response.data?.answers?.length || 0);
      
      // 응답 데이터 검증
      if (!response.data) {
        throw new Error('시험 정보를 불러올 수 없습니다.');
      }
      
      // answers 배열이 없으면 빈 배열로 초기화
      const answers = response.data.answers || [];
      console.log('📋 Answers data:', answers);
      
      // 각 답안의 데이터 구조 확인
      answers.forEach((answer: any, idx: number) => {
        console.log(`📋 Answer ${idx + 1}:`, {
          id: answer.id,
          question_number: answer.question_number,
          question_type: answer.question_type,
          answer_content: answer.answer_content,
          answer_data: answer.answer_data,
          hasContent: answer.answer_content && Object.keys(answer.answer_content).length > 0
        });
      });
      
      const examDataWithAnswers = {
        ...response.data,
        answers: answers
      };
      
      setExamData(examDataWithAnswers);
      setGradingExamId(examId);
    } catch (error: any) {
      console.error('❌ Failed to load exam details:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message || '시험 정보를 불러오는데 실패했습니다.';
      alert(errorMessage);
      setGradingExamId(null);
      setExamData(null);
    } finally {
      setLoadingExamData(false);
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
      
      // 시험 데이터 다시 로드
      if (gradingExamId) {
        await loadExamDetails(gradingExamId);
      }
      // 시험 목록도 다시 로드
      await loadExams();
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

  const filteredExams = exams.filter(exam => {
    if (filter === 'all') return true;
    return exam.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: '진행 중' },
      'submitted': { bg: 'bg-green-100', text: 'text-green-700', label: '제출 완료' },
      'graded': { bg: 'bg-purple-100', text: 'text-purple-700', label: '채점 완료' },
    };
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">채점 관리</h1>
          <p className="text-neutral-600 mt-2">
            제출된 시험을 확인하고 채점하세요.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            전체 ({exams.length})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'submitted'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            채점 대기 ({exams.filter(e => e.status === 'submitted').length})
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'graded'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            채점 완료 ({exams.filter(e => e.status === 'graded').length})
          </button>
        </div>

        {/* Exams List */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">채점할 시험이 없습니다</h3>
            <p className="text-neutral-600">제출된 시험이 있으면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-100 border-b-2 border-neutral-300">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">시험 ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">사용자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">시작 시간</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">종료 시간</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">점수</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-700">액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold">#{exam.id}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">사용자 {exam.user_id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(exam.status)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {exam.start_time ? new Date(exam.start_time).toLocaleString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {exam.end_time ? new Date(exam.end_time).toLocaleString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {exam.score !== null ? (
                        <span className="font-bold text-lg text-neutral-900">{exam.score}점</span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => loadExamDetails(exam.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          exam.status === 'submitted'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-neutral-700 text-white hover:bg-neutral-800'
                        }`}
                      >
                        {exam.status === 'submitted' ? '채점하기' : '상세보기'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grading Modal */}
        {gradingExamId && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto p-4"
            onClick={() => {
              setGradingExamId(null);
              setExamData(null);
              setGradingAnswer(null);
            }}
          >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl my-4" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header - Compact */}
              <div className="bg-neutral-900 text-white px-4 py-2.5 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">시험 #{gradingExamId}</h2>
                  {examData && (
                    <div className="text-xs text-neutral-300">
                      <span>{examData.user?.exam_number || '-'}</span>
                      {examData.exam?.end_time && (
                        <span className="ml-2">• {new Date(examData.exam.end_time).toLocaleDateString('ko-KR')}</span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setGradingExamId(null);
                    setExamData(null);
                    setGradingAnswer(null);
                  }}
                  className="text-neutral-300 hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                {loadingExamData ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-xl">로딩 중...</div>
                  </div>
                ) : !examData ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-xl text-neutral-600 mb-2">시험 정보를 불러올 수 없습니다.</div>
                      <button
                        onClick={() => {
                          setGradingExamId(null);
                          setExamData(null);
                        }}
                        className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                ) : !examData.answers || examData.answers.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center max-w-md">
                      <div className="text-xl text-neutral-600 mb-2">답안이 없습니다.</div>
                      <p className="text-sm text-neutral-500 mb-2">이 시험에는 제출된 답안이 없습니다.</p>
                      <p className="text-xs text-neutral-400 mb-4">
                        시험 ID: {gradingExamId}<br/>
                        시험 상태: {examData.exam?.status || '알 수 없음'}
                      </p>
                      <div className="text-xs text-neutral-400 mb-4 p-3 bg-neutral-50 rounded">
                        💡 답안이 저장되지 않았을 수 있습니다.<br/>
                        시험 진행 중 답안이 저장되었는지 확인해주세요.
                      </div>
                      <button
                        onClick={() => {
                          setGradingExamId(null);
                          setExamData(null);
                        }}
                        className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Total Score - Compact */}
                    <div className="mb-3 bg-neutral-50 px-3 py-2 rounded flex justify-between items-center">
                      <span className="text-xs font-semibold text-neutral-700">총점</span>
                      <span className="text-lg font-bold text-neutral-900">
                        {examData.answers.reduce((sum: number, ans: any) => sum + (ans.score || 0), 0)}
                        <span className="text-sm text-neutral-500 ml-1">/{examData.answers.reduce((sum: number, ans: any) => sum + (ans.question_points || 0), 0)}</span>
                      </span>
                    </div>

                    {/* Answers List - Compact */}
                    <div className="space-y-2">
                      {examData.answers.map((answer: any, idx: number) => (
                        <div key={answer.id} className="bg-white border border-neutral-200 rounded overflow-hidden">
                          {/* Answer Header - Compact */}
                          <div className="bg-neutral-50 px-3 py-2 flex justify-between items-center border-b border-neutral-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-sm font-bold text-neutral-900 flex-shrink-0">문항 {answer.question_number}</span>
                              <span className="text-sm text-neutral-700 truncate">{answer.question_title}</span>
                              <span className="text-xs text-neutral-500 flex-shrink-0">{getTypeLabel(answer.question_type)}</span>
                              <span className="text-xs text-neutral-500 flex-shrink-0">{answer.question_points}점</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {answer.score !== null ? (
                                <div className="text-right">
                                  <div className="text-base font-bold text-green-600">{answer.score}점</div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setGradingAnswer(answer.id)}
                                  className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition-all"
                                >
                                  채점
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Answer Content - Compact */}
                          <div className="p-3">
                            
                            {(() => {
                              // answer_content가 없거나 null인 경우 처리
                              const answerData = answer.answer_content || answer.answer_data || {};
                              
                              // 디버깅: 실제 데이터 구조 확인
                              console.log(`📝 Answer ${answer.question_number} data:`, {
                                answer_content: answer.answer_content,
                                answer_data: answer.answer_data,
                                answerData: answerData,
                                keys: Object.keys(answerData),
                                isEmpty: Object.keys(answerData).length === 0
                              });
                              
                              // 답안이 완전히 비어있는지 확인
                              const hasAnswerText = answerData.answerText && answerData.answerText.trim() !== '';
                              const hasSelectedOption = answerData.selectedOption !== undefined && answerData.selectedOption !== null;
                              const hasSection1 = answerData.section1 && answerData.section1.trim() !== '';
                              const hasSection2 = answerData.section2 && answerData.section2.trim() !== '';
                              const hasPrompt = answerData.prompt && answerData.prompt.trim() !== '';
                              const hasVerifications = answerData.verifications && Array.isArray(answerData.verifications) && answerData.verifications.length > 0;
                              const hasAnalysis = answerData.analysis && answerData.analysis.trim() !== '';
                              
                              const isEmpty = Object.keys(answerData).length === 0 || 
                                (!hasAnswerText && !hasSelectedOption && !hasSection1 && !hasSection2 && !hasPrompt && !hasVerifications && !hasAnalysis);
                              
                              if (isEmpty && answer.score === null) {
                                return (
                                  <div className="bg-neutral-50 px-3 py-2 rounded text-xs text-neutral-500 italic">
                                    답안이 없습니다.
                                  </div>
                                );
                              }
                              
                              if (answer.question_type === 'multiple_choice') {
                                const selectedOption = answerData.selectedOption;
                                return (
                                  <div className="bg-neutral-50 px-3 py-2 rounded text-sm">
                                    <span className="font-medium text-neutral-700">선택: </span>
                                    <span className="text-neutral-900">
                                      {selectedOption !== undefined && selectedOption !== null ? 
                                        `${selectedOption}번` : '미응답'}
                                    </span>
                                  </div>
                                );
                              } else if (answer.question_type === 'practical') {
                                // 서술형: 문제점 분석과 개선 방안
                                if (answerData.answerText) {
                                  return (
                                    <div className="bg-neutral-50 px-3 py-2 rounded">
                                      <pre className="whitespace-pre-wrap text-xs text-neutral-800 font-sans leading-relaxed">
                                        {answerData.answerText}
                                      </pre>
                                    </div>
                                  );
                                } else {
                                  const hasSection1 = answerData.section1 && answerData.section1.trim() !== '';
                                  const hasSection2 = answerData.section2 && answerData.section2.trim() !== '';
                                  
                                  if (!hasSection1 && !hasSection2) {
                                    return (
                                      <div className="bg-neutral-50 px-3 py-2 rounded text-xs text-neutral-500 italic">
                                        답안이 없습니다.
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div className="bg-neutral-50 px-3 py-2 rounded space-y-2">
                                      {hasSection1 && (
                                        <div>
                                          <h3 className="text-xs font-semibold text-neutral-700 mb-1">🔍 1. 문제점 분석</h3>
                                          <div className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                                            {answerData.section1}
                                          </div>
                                        </div>
                                      )}
                                      {hasSection2 && (
                                        <div>
                                          <h3 className="text-xs font-semibold text-neutral-700 mb-1">💡 2. 개선 방안</h3>
                                          <div className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
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
                                    <div className="bg-neutral-50 px-3 py-2 rounded">
                                      <pre className="whitespace-pre-wrap text-xs text-neutral-800 font-sans leading-relaxed">
                                        {answerData.answerText}
                                      </pre>
                                    </div>
                                  );
                                } else if (answerData.prompt) {
                                  return (
                                    <div className="bg-neutral-50 px-3 py-2 rounded space-y-2">
                                      <div>
                                        <div className="text-xs font-semibold text-neutral-700 mb-1">프롬프트:</div>
                                        <div className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                                          {answerData.prompt}
                                        </div>
                                      </div>
                                      {answerData.aiResponse && (
                                        <div>
                                          <div className="text-xs font-semibold text-neutral-700 mb-1">AI 응답:</div>
                                          <div className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                                            {answerData.aiResponse}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                } else if (answerData.verifications || answerData.analysis) {
                                  // 사실 검증 유형
                                  return (
                                    <div className="bg-neutral-50 px-3 py-2 rounded space-y-2">
                                      {answerData.verifications && Array.isArray(answerData.verifications) && answerData.verifications.length > 0 && (
                                        <div>
                                          <div className="text-xs font-semibold text-neutral-700 mb-1">사실 검증:</div>
                                          <div className="space-y-1">
                                            {answerData.verifications.map((v: any, idx: number) => (
                                              <div key={idx} className="text-xs text-neutral-800 border-l-2 border-blue-400 pl-2">
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
                                          <div className="text-xs font-semibold text-neutral-700 mb-1">분석:</div>
                                          <div className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                                            {answerData.analysis}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                } else if (Object.keys(answerData).length > 0) {
                                  // 기타 형식의 답안
                                  return (
                                    <div className="bg-neutral-50 px-3 py-2 rounded">
                                      <pre className="whitespace-pre-wrap text-xs text-neutral-800 font-sans leading-relaxed">
                                        {typeof answerData === 'string' 
                                          ? answerData 
                                          : JSON.stringify(answerData, null, 2)}
                                      </pre>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="bg-neutral-50 px-3 py-2 rounded text-xs text-neutral-500 italic">
                                      답안이 없습니다.
                                    </div>
                                  );
                                }
                              }
                            })()}

                            {/* Feedback - Compact */}
                            {answer.feedback && (
                              <div className="mt-2 bg-blue-50 border-l-2 border-blue-400 px-2 py-1.5 rounded text-xs">
                                <span className="font-semibold text-blue-900">피드백: </span>
                                <span className="text-blue-800 whitespace-pre-wrap leading-relaxed">{answer.feedback}</span>
                              </div>
                            )}

                            {/* Grading Form - Inline Compact */}
                            {gradingAnswer === answer.id ? (
                              <div className="mt-2 border-t border-neutral-200 pt-2">
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const score = parseInt(formData.get('score') as string);
                                    const feedback = formData.get('feedback') as string;
                                    handleGradeAnswer(answer.id, score, feedback);
                                  }}
                                  className="flex gap-2 items-end"
                                >
                                  <div className="flex-1">
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                      점수 (0~{answer.question_points})
                                    </label>
                                    <input
                                      type="number"
                                      name="score"
                                      min="0"
                                      max={answer.question_points}
                                      required
                                      className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                                      피드백
                                    </label>
                                    <input
                                      type="text"
                                      name="feedback"
                                      className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                      placeholder="선택사항..."
                                    />
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="submit"
                                      className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-all font-semibold"
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setGradingAnswer(null)}
                                      className="px-3 py-1.5 text-xs bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-all font-semibold"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </form>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






