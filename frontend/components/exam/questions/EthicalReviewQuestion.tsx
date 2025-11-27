'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/lib/stores/examStore';

interface Props {
  question: any;
}

export default function EthicalReviewQuestion({ question }: Props) {
  const { answers, setAnswer, questions } = useExamStore();
  
  // 표시 번호 계산 (1, 2, 3...)
  const questionIndex = questions.findIndex(q => q.id === question.id);
  const displayNumber = questionIndex >= 0 ? questionIndex + 1 : 1;
  const [section1, setSection1] = useState('');
  const [section2, setSection2] = useState('');
  const [section3, setSection3] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = answers[question.id];
    if (saved) {
      setSection1(saved.section1 || '');
      setSection2(saved.section2 || '');
      setSection3(saved.section3 || '');
    }
  }, [question.id, answers]);

  const handleSectionChange = (section: number, text: string) => {
    const updates = { section1, section2, section3 };
    updates[`section${section}` as keyof typeof updates] = text;
    
    if (section === 1) setSection1(text);
    if (section === 2) setSection2(text);
    if (section === 3) setSection3(text);
    
    // 로컬 상태에만 저장 (헤더의 저장 버튼 클릭시 서버에 저장됨)
    setAnswer(question.id, updates);
  };

  return (
    <div className="h-[calc(100vh-100px)] p-4 bg-neutral-100">
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
              <span className="exam-info-badge">윤리검토</span>
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
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="exam-section-title mb-0">🎬 시나리오</h3>
                    <button
                      onClick={() => setShowModal(true)}
                      className="exam-btn-secondary text-xs"
                    >
                      💡 참고
                    </button>
                  </div>
                  <div className="exam-alert exam-alert-error">
                    <div className="font-bold mb-1.5 flex items-center gap-1.5 text-xs">
                      <span>⚠️</span>
                      <span>윤리적 검토 필요</span>
                    </div>
                    <div className="exam-html-content" dangerouslySetInnerHTML={{ 
                      __html: question.question_content.scenario 
                    }} />
                  </div>
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

        {/* Right: Answer Area */}
        <div className="exam-panel">
          <div className="exam-panel-header exam-panel-header-primary">
            <span>✍️</span>
            <span>답안 작성</span>
          </div>
          <div className="exam-panel-content flex flex-col gap-3">
            
            {/* Section 1 */}
            <div>
              <div className="exam-section-title mb-1.5">1. 문제점 분석</div>
              <textarea
                value={section1}
                onChange={(e) => handleSectionChange(1, e.target.value)}
                className="exam-textarea h-24 resize-none text-xs"
                placeholder="[문제점] 법적 근거..."
              />
              <div className="exam-char-counter">
                <span className="exam-char-counter-value">{section1.length}</span> / 1500
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <div className="exam-section-title mb-1.5">2. 개선 방안</div>
              <textarea
                value={section2}
                onChange={(e) => handleSectionChange(2, e.target.value)}
                className="exam-textarea h-24 resize-none text-xs"
                placeholder="1. 학습 데이터 정제..."
              />
              <div className="exam-char-counter">
                <span className="exam-char-counter-value">{section2.length}</span> / 1000
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <div className="exam-section-title mb-1.5">3. 윤리 가이드라인</div>
              <textarea
                value={section3}
                onChange={(e) => handleSectionChange(3, e.target.value)}
                className="exam-textarea h-24 resize-none text-xs"
                placeholder="[원칙 1] Human-in-the-loop..."
              />
              <div className="exam-char-counter">
                <span className="exam-char-counter-value">{section3.length}</span> / 500
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Reference Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-neutral-800/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[75vh] flex flex-col my-24 mx-6" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="exam-panel-header exam-panel-header-secondary rounded-t-lg">
              <span>💡</span>
              <span>참고 지식</span>
              <button 
                onClick={() => setShowModal(false)} 
                className="ml-auto text-white text-xl font-bold hover:text-neutral-200"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto text-xs">
              <div className="space-y-4">
                <div>
                  <h4 className="exam-section-title">📖 채용 관련 법규</h4>
                  <div className="space-y-2">
                    <div className="exam-alert exam-alert-info">
                      <div className="font-bold mb-1.5">1. 고용상 연령차별금지법</div>
                      <p>모집·채용 시 연령을 이유로 차별 금지</p>
                    </div>
                    <div className="exam-alert exam-alert-info">
                      <div className="font-bold mb-1.5">2. 남녀고용평등법</div>
                      <p>모집·채용 시 남녀 차별 금지</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="exam-section-title">⚖️ AI 활용 주의사항</h4>
                  <ul className="space-y-1.5 pl-5">
                    <li className="list-disc"><span className="font-semibold">편향된 학습 데이터:</span> 과거 차별적 관행 재생산</li>
                    <li className="list-disc"><span className="font-semibold">투명성 부족:</span> 의사결정 과정 설명 불가</li>
                    <li className="list-disc"><span className="font-semibold">책임 소재:</span> 법적 책임은 최종 사용자</li>
                    <li className="list-disc"><span className="font-semibold">Human-in-the-loop:</span> 전문가 검토 필수</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
