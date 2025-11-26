'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/lib/stores/examStore';
import apiClient from '@/lib/api/client';
import { validatePrompt } from '@/lib/utils/promptValidator';

interface Props {
  question: any;
}

export default function PromptDesignQuestion({ question }: Props) {
  const { answers, setAnswer, examId, questions } = useExamStore();
  
  // 표시 번호 계산 (1, 2, 3...)
  const questionIndex = questions.findIndex(q => q.id === question.id);
  const displayNumber = questionIndex >= 0 ? questionIndex + 1 : 1;
  const [answerText, setAnswerText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = answers[question.id];
    if (saved) {
      setAnswerText(saved.answerText || '');
      setUsageCount(saved.usageCount || 0);
    }
  }, [question.id, answers]);

  const handleAnswerChange = (text: string) => {
    setAnswerText(text);
    // 로컬 상태에만 저장 (헤더의 저장 버튼 클릭시 서버에 저장됨)
    setAnswer(question.id, { answerText: text, usageCount });
  };

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

    setIsLoading(true);
    try {
      const response = await apiClient.post('/ai/gemini', {
        exam_id: examId,
        question_id: question.id,
        prompt: prompt,
        context: {}
      });

      setAiResponse(response.data.response);
      setUsageCount((prev) => prev + 1);
      setAnswer(question.id, { answerText, usageCount: usageCount + 1 });
    } catch (error: any) {
      alert(error.response?.data?.detail || 'AI 요청 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPromptToAnswer = () => {
    if (prompt.trim()) {
      const newText = answerText ? answerText + '\n\n' + prompt : prompt;
      setAnswerText(newText);
      setAnswer(question.id, { answerText: newText, usageCount });
    } else {
      alert('복사할 프롬프트가 없습니다.');
    }
  };

  const copyAIResponseToAnswer = () => {
    if (aiResponse.trim()) {
      const newText = answerText ? answerText + '\n\n' + aiResponse : aiResponse;
      setAnswerText(newText);
      setAnswer(question.id, { answerText: newText, usageCount });
    } else {
      alert('복사할 AI 응답이 없습니다.');
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] p-4 bg-neutral-100">
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
                  <span className="exam-info-badge text-blue-700 bg-blue-50 border border-blue-200">{question.competency}</span>
                  <span className="text-neutral-400">|</span>
                </>
              )}
              <span className="exam-info-badge">수행형</span>
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
                <div className="py-3 border-t border-b border-purple-300">
                  <h3 className="exam-section-title text-purple-900 flex items-center gap-1.5 mb-2">
                    <span>⭐</span>
                    <span>평가기준</span>
                  </h3>
                  <ul className="space-y-1 pl-4">
                    {(Array.isArray(question.question_content.requirements) ? 
                      question.question_content.requirements : 
                      [question.question_content.requirements]
                    ).map((req: string, idx: number) => (
                      <li key={idx} className="text-sm text-neutral-800 flex items-start gap-2">
                        <span className="text-purple-600 font-bold flex-shrink-0">•</span>
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
            
            <div className="exam-panel-content flex flex-col gap-2.5 min-h-[400px]">
              {/* Prompt Input */}
              <div className="w-full">
                <h3 className="exam-section-title">프롬프트 입력</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="exam-textarea h-20 resize-none text-xs w-full"
                  placeholder="AI에게 질문하세요..."
                />
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={handleAIRequest}
                    disabled={isLoading}
                    className="exam-btn-primary text-xs"
                  >
                    {isLoading ? '요청 중...' : '전송 ↓'}
                  </button>
                  <button
                    onClick={() => setPrompt('')}
                    className="exam-btn-secondary text-xs"
                  >
                    지우기
                  </button>
                </div>
              </div>
              
              {/* AI Response */}
              <div className="flex flex-col min-h-0 w-full">
                <h3 className="exam-section-title">AI 응답</h3>
                <div className="exam-input overflow-y-auto h-[120px] text-xs leading-relaxed w-full">
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
              <div className="ml-auto flex gap-2">
                <button
                  onClick={copyPromptToAnswer}
                  disabled={!prompt.trim()}
                  className="px-4 py-1.5 bg-white hover:bg-white/90 disabled:bg-white/20 disabled:cursor-not-allowed text-blue-700 hover:text-blue-800 disabled:text-white/50 text-xs font-bold rounded-md shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="text-sm">📋</span>
                  <span>프롬프트 복사</span>
                </button>
                <button
                  onClick={copyAIResponseToAnswer}
                  disabled={!aiResponse.trim()}
                  className="px-4 py-1.5 bg-white hover:bg-white/90 disabled:bg-white/20 disabled:cursor-not-allowed text-green-700 hover:text-green-800 disabled:text-white/50 text-xs font-bold rounded-md shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="text-sm">🤖</span>
                  <span>AI응답 복사</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col h-[calc(100%-2.5rem)] p-3">
              <textarea
                value={answerText}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="exam-textarea flex-1 resize-none text-xs"
                placeholder="답안을 작성하세요..."
              />
              <div className="mt-auto pt-2 flex justify-end items-center text-xs">
                <div className="exam-char-counter">
                  <span className="exam-char-counter-value">{answerText.length}</span> / 2000
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
