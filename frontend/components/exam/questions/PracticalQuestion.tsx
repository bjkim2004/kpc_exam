'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/lib/stores/examStore';
import apiClient from '@/lib/api/client';
import { validatePrompt } from '@/lib/utils/promptValidator';

interface Props {
  question: any;
}

export default function PracticalQuestion({ question }: Props) {
  const { answers, setAnswer, questions, examId } = useExamStore();
  const [section1, setSection1] = useState('');
  const [section2, setSection2] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // 표시 번호 계산 (1, 2, 3...)
  const questionIndex = questions.findIndex(q => q.id === question.id);
  const displayNumber = questionIndex >= 0 ? questionIndex + 1 : 1;

  useEffect(() => {
    const saved = answers[question.id];
    if (saved) {
      // 개별 섹션이 있으면 사용
      if (saved.section1 !== undefined || saved.section2 !== undefined) {
        setSection1(saved.section1 || '');
        setSection2(saved.section2 || '');
      } 
      // answerText만 있으면 파싱
      else if (saved.answerText) {
        const text = saved.answerText;
        // "1. 문제점 분석"과 "2. 개선 방안"으로 분리
        const section1Match = text.match(/1\.\s*문제점\s*분석\s*\n([\s\S]*?)(?=\n\n2\.\s*개선\s*방안|$)/);
        const section2Match = text.match(/2\.\s*개선\s*방안\s*\n([\s\S]*)/);
        
        setSection1(section1Match ? section1Match[1].trim() : '');
        setSection2(section2Match ? section2Match[1].trim() : '');
      }
      setUsageCount(saved.usageCount || 0);
    }
  }, [question.id, answers]);

  const handleAIRequest = async () => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력하세요.');
      return;
    }

    if (usageCount >= 10) {
      alert('AI 사용 횟수 제한에 도달했습니다.');
      return;
    }

    // 프롬프트 유사도 검사
    const validation = validatePrompt(
      prompt,
      question.content,
      question.question_content?.scenario
    );
    
    if (!validation.isValid) {
      alert(`⚠️ 프롬프트 제한\n\n${validation.reason}`);
      return;
    }

    if (!examId) {
      alert('시험이 시작되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/ai/gemini', {
        exam_id: examId,
        question_id: question.id,
        prompt: prompt,
        context: {}
      });

      setAiResponse(response.data.response);
      const newUsageCount = usageCount + 1;
      setUsageCount(newUsageCount);
      
      // usageCount도 함께 저장
      const hasContent = section1.trim() !== '' || section2.trim() !== '';
      const integratedAnswer = hasContent 
        ? `1. 문제점 분석\n${section1}\n\n2. 개선 방안\n${section2}`
        : '';
      setAnswer(question.id, { answerText: integratedAnswer, section1, section2, usageCount: newUsageCount });
    } catch (error: any) {
      alert(error.response?.data?.detail || 'AI 요청 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (section: number, text: string) => {
    let updatedSection1 = section1;
    let updatedSection2 = section2;
    
    if (section === 1) {
      setSection1(text);
      updatedSection1 = text;
    }
    if (section === 2) {
      setSection2(text);
      updatedSection2 = text;
    }
    
    // 제목을 포함하여 통합된 답안 생성 (내용이 있을 때만)
    // 빈 답안 체크: section1과 section2가 모두 비어있으면 빈 문자열로 저장
    const hasContent = updatedSection1.trim() !== '' || updatedSection2.trim() !== '';
    const integratedAnswer = hasContent 
      ? `1. 문제점 분석\n${updatedSection1}\n\n2. 개선 방안\n${updatedSection2}`
      : '';
    
    // 로컬 상태에만 저장 (헤더의 저장 버튼 클릭시 서버에 저장됨)
    setAnswer(question.id, { answerText: integratedAnswer, section1: updatedSection1, section2: updatedSection2 });
  };

  return (
    <div className="h-[calc(100vh-100px)] p-4 bg-neutral-100">
      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 rounded-2xl shadow-xl px-6 py-5 flex items-center gap-3 border border-neutral-200">
            <svg className="w-5 h-5 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="text-sm font-medium text-neutral-700">AI 응답 생성 중...</div>
          </div>
        </div>
      )}

      {/* 2 Column Layout - 좌우 대칭 50:50 */}
      <div className="grid grid-cols-2 gap-3 h-full">
        
        {/* Left: Question Panel */}
        <div className="exam-panel">
          <div className="exam-panel-header exam-panel-header-primary">
            <span>📋</span>
            <span>문항 영역</span>
          </div>
          <div className="exam-panel-content">
            <h2 className="text-base font-bold text-neutral-900 mb-2">
              <span className="text-blue-600 mr-2">문항{displayNumber}</span>
              {question.title}
            </h2>
            
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200 text-xs">
              {question.competency && (
                <>
                  <span className={`exam-info-badge font-semibold px-2.5 py-1 rounded-md ${
                    question.competency.includes('역량 A') ? 'text-blue-900 bg-blue-50 border border-blue-300' :
                    question.competency.includes('역량 B') ? 'text-amber-900 bg-amber-50 border border-amber-300' :
                    question.competency.includes('역량 C') ? 'text-rose-900 bg-rose-50 border border-rose-300' :
                    question.competency.includes('역량 D') ? 'text-purple-900 bg-purple-50 border border-purple-300' :
                    'text-gray-700 bg-gray-50 border border-gray-200'
                  }`}>{question.competency}</span>
                  <span className="text-neutral-400">|</span>
                </>
              )}
              <span className="exam-info-badge">서술형</span>
              <span className="text-neutral-400">|</span>
              <span className="exam-info-badge">{question.points}점</span>
              {question.time_limit && (
                <>
                  <span className="text-neutral-400">|</span>
                  <span className="exam-info-badge">권장 {question.time_limit}분</span>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="exam-section-title">📝 문제내용</h3>
                <div className="exam-html-content" dangerouslySetInnerHTML={{ __html: question.content }} />
              </div>

              {question.question_content?.scenario && (
                <div>
                  <h3 className="exam-section-title">🎬 시나리오</h3>
                  <div className="exam-html-content" dangerouslySetInnerHTML={{ __html: question.question_content.scenario }} />
                </div>
              )}

              {question.question_content?.requirements && question.question_content.requirements.length > 0 && (
                <div className="py-3 border-t border-b border-blue-300">
                  <h3 className="exam-section-title text-blue-900 flex items-center gap-1.5 mb-2">
                    <span>⭐</span>
                    <span>평가기준</span>
                  </h3>
                  <ul className="space-y-1 pl-4">
                    {(Array.isArray(question.question_content.requirements) ? 
                      question.question_content.requirements : 
                      [question.question_content.requirements]
                    ).map((req: string, idx: number) => (
                      <li key={idx} className="text-sm text-neutral-800 flex items-start gap-2">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Tool + Answer Area */}
        <div className="flex flex-col gap-3">
          
          {/* AI Tool Section */}
          <div className="exam-panel flex-[0_0_50%]">
            <div className="exam-panel-header exam-panel-header-primary">
              <span>🤖</span>
              <span className="text-sm font-bold">생성형 AI 선택</span>
              <div className="flex gap-1.5 ml-3">
                <span className="px-2.5 py-0.5 bg-white text-neutral-800 rounded text-xs font-bold">✨ Gemini</span>
                <span className="px-2.5 py-0.5 bg-white/20 text-white/60 rounded text-xs">💬 GPT</span>
                <span className="px-2.5 py-0.5 bg-white/20 text-white/60 rounded text-xs">🧠 Claude</span>
              </div>
              <div className="ml-auto px-2 py-0.5 bg-white/30 rounded text-xs font-semibold">
                {usageCount}/10회
              </div>
            </div>
            
            <div className="exam-panel-content flex flex-col gap-2.5">
              {/* Prompt Input */}
              <div className="w-full">
                <h3 className="exam-section-title">프롬프트 입력</h3>
                <div className="flex gap-2">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="exam-textarea h-24 resize-none text-xs flex-1"
                    placeholder="AI에게 질문하세요..."
                  />
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={handleAIRequest}
                      disabled={isLoading}
                      className="exam-btn-primary text-xs h-[30px] px-3"
                    >
                      {isLoading ? '요청 중...' : '전송 ↓'}
                    </button>
                    <button
                      onClick={() => setPrompt('')}
                      className="exam-btn-secondary text-xs h-[30px] px-3"
                    >
                      지우기
                    </button>
                  </div>
                </div>
              </div>
              
              {/* AI Response */}
              <div className="flex-1 flex flex-col min-h-0 w-full">
                <h3 className="exam-section-title">AI 응답</h3>
                <div className="flex-1 exam-input overflow-y-auto min-h-[80px] text-xs leading-relaxed w-full">
                  {aiResponse ? (
                    <div className="whitespace-pre-wrap">{aiResponse}</div>
                  ) : (
                    <span className="text-xs text-neutral-400 italic">AI 응답이 여기에 표시됩니다.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Answer Area */}
          <div className="exam-panel flex-[0_0_50%]">
            <div className="exam-panel-header exam-panel-header-primary">
              <span>✍️</span>
              <span>답안 작성</span>
            </div>
            <div className="flex flex-col h-[calc(100%-2.5rem)]">
              <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
                {/* Section 1 */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="exam-section-title mb-1.5 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                    🔍 1. 문제점 분석
                  </div>
                  <textarea
                    value={section1}
                    onChange={(e) => handleSectionChange(1, e.target.value)}
                    className="exam-textarea flex-1 resize-none text-xs min-h-[80px]"
                    placeholder="문제점을 구체적으로 분석하여 작성하세요..."
                  />
                  <div className="exam-char-counter mt-1">
                    <span className="exam-char-counter-value">{section1.length}</span> / 1500
                  </div>
                </div>

                {/* Section 2 */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="exam-section-title mb-1.5 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                    💡 2. 개선 방안
                  </div>
                  <textarea
                    value={section2}
                    onChange={(e) => handleSectionChange(2, e.target.value)}
                    className="exam-textarea flex-1 resize-none text-xs min-h-[80px]"
                    placeholder="개선 방안을 구체적으로 작성하세요..."
                  />
                  <div className="exam-char-counter mt-1">
                    <span className="exam-char-counter-value">{section2.length}</span> / 1000
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

