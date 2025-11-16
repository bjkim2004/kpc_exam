'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/lib/stores/examStore';

interface Props {
  question: any;
}

export default function PracticalQuestion({ question }: Props) {
  const { answers, setAnswer, questions } = useExamStore();
  const [section1, setSection1] = useState('');
  const [section2, setSection2] = useState('');
  
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
    }
  }, [question.id, answers]);

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
                0/10회
              </div>
            </div>
            
            <div className="exam-panel-content flex flex-col gap-2.5">
              {/* Prompt Input */}
              <div className="w-full">
                <h3 className="exam-section-title">프롬프트 입력</h3>
                <textarea
                  value=""
                  onChange={() => {}}
                  className="exam-textarea h-20 resize-none text-xs w-full"
                  placeholder="AI에게 질문하세요..."
                  disabled
                />
                <div className="flex gap-1.5 mt-2">
                  <button
                    disabled
                    className="exam-btn-primary text-xs opacity-50 cursor-not-allowed"
                  >
                    전송 ↓
                  </button>
                  <button
                    disabled
                    className="exam-btn-secondary text-xs opacity-50 cursor-not-allowed"
                  >
                    지우기
                  </button>
                </div>
              </div>
              
              {/* AI Response */}
              <div className="flex-1 flex flex-col min-h-0 w-full">
                <h3 className="exam-section-title">AI 응답</h3>
                <div className="flex-1 exam-input overflow-y-auto min-h-[80px] text-xs leading-relaxed w-full">
                  <span className="text-xs text-neutral-400 italic">AI 응답이 여기에 표시됩니다.</span>
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

