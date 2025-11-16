'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/lib/stores/examStore';

interface Props {
  question: any;
}

export default function MultipleChoiceQuestion({ question }: Props) {
  const { answers, setAnswer, questions, currentQuestionIndex } = useExamStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // 표시 번호 계산 (1, 2, 3...)
  const questionIndex = questions.findIndex(q => q.id === question.id);
  const displayNumber = questionIndex >= 0 ? questionIndex + 1 : 1;

  useEffect(() => {
    const saved = answers[question.id]?.selectedOption;
    if (saved) setSelectedOption(saved);
  }, [question.id, answers]);

  const handleSelect = (optionNum: number) => {
    setSelectedOption(optionNum);
    // 로컬 상태에만 저장 (헤더의 저장 버튼 클릭시 서버에 저장됨)
    setAnswer(question.id, { selectedOption: optionNum });
  };

  const options = question.question_content?.options || [];
  const optionLabels = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

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
              <span className="exam-info-badge">객관식</span>
              <span className="text-neutral-400">|</span>
              <span className="exam-info-badge">{question.points}점</span>
              {question.time_limit && (
                <>
                  <span className="text-neutral-400">|</span>
                  <span className="exam-info-badge">권장 {question.time_limit}분</span>
                </>
              )}
            </div>

            <div className="mb-3">
              <h3 className="exam-section-title">문제</h3>
              <div className="exam-html-content" dangerouslySetInnerHTML={{ __html: question.content }} />
            </div>

            {question.question_content?.scenario && (
              <div className="mb-3">
                <h3 className="exam-section-title">🎬 시나리오</h3>
                <div className="exam-html-content" dangerouslySetInnerHTML={{ __html: question.question_content.scenario }} />
              </div>
            )}

            {/* 선택지 - 시나리오 하단에 출력 */}
            <div className="mb-3 space-y-2.5">
              {options.map((option: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(idx + 1)}
                  className={`flex items-start gap-3 p-3.5 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === idx + 1
                      ? 'border-neutral-700 bg-neutral-100 shadow-md answer-selected'
                      : 'border-neutral-300 bg-white hover:border-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  {/* 커스텀 라디오 버튼 */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedOption === idx + 1
                        ? 'border-neutral-700 bg-neutral-700'
                        : 'border-neutral-400 bg-white'
                    }`}>
                      {selectedOption === idx + 1 && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 text-sm text-neutral-800 leading-relaxed">
                    <span className="font-bold text-neutral-800 mr-1.5 text-base">{optionLabels[idx]}</span>
                    <span dangerouslySetInnerHTML={{ __html: option.text || option }} />
                  </div>
                  {selectedOption === idx + 1 && (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-neutral-700 mt-0.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            {question.question_content?.requirements && question.question_content.requirements.length > 0 && (
              <div className="mb-3 py-3 border-t border-b border-purple-300">
                <h3 className="exam-section-title text-purple-900 flex items-center gap-1.5 mb-2">
                  <span>⭐</span>
                  <span>평가기준</span>
                </h3>
                <ul className="space-y-1 pl-4">
                  {question.question_content.requirements.map((req: string, idx: number) => (
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

        {/* Right: Reference + Answer Summary */}
        <div className="flex flex-col gap-3">
          
          {/* Reference Panel */}
          <div className="exam-panel flex-1">
            <div className="exam-panel-header exam-panel-header-secondary">
              <span>📚</span>
              <span>참고 자료</span>
            </div>
            <div className="exam-panel-content">
              {question.question_content?.reference_materials ? (
                <div className="exam-alert exam-alert-info">
                  <div className="font-bold mb-1.5 text-xs">💡 개념 설명</div>
                  <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ 
                    __html: question.question_content.reference_materials 
                  }} />
                </div>
              ) : (
                <div className="bg-neutral-50 border border-dashed border-neutral-300 p-6 rounded text-center text-neutral-600 text-xs">
                  별도의 참고 자료가 제공되지 않습니다.
                </div>
              )}
            </div>
          </div>

          {/* Answer Summary Panel */}
          <div className="exam-panel">
            <div className="exam-panel-header exam-panel-header-primary">
              <span>✓</span>
              <span>선택한 답안</span>
            </div>
            <div className="exam-panel-content">
              {selectedOption !== null ? (
                <div className="flex items-start gap-3 p-3 bg-neutral-100 border border-neutral-700 rounded-lg">
                  <div className="w-10 h-10 bg-neutral-700 text-white rounded-full flex items-center justify-center font-bold text-base flex-shrink-0">
                    {selectedOption}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-neutral-600 mb-1">선택된 답변</div>
                    <div className="text-sm text-neutral-900 leading-relaxed">
                      <span className="font-bold mr-1.5 text-base">{optionLabels[selectedOption - 1]}</span>
                      <span dangerouslySetInnerHTML={{ 
                        __html: options[selectedOption - 1]?.text || options[selectedOption - 1] 
                      }} />
                    </div>
                  </div>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-neutral-700 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="p-6 bg-neutral-50 border border-dashed border-neutral-400 rounded text-center text-neutral-600 text-xs flex flex-col items-center gap-2">
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-neutral-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>답안을 선택해주세요</div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
