'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/lib/stores/examStore';

interface Props {
  question: any;
}

export default function FactCheckingQuestion({ question }: Props) {
  const { answers, setAnswer, questions } = useExamStore();
  
  // 표시 번호 계산 (1, 2, 3...)
  const questionIndex = questions.findIndex(q => q.id === question.id);
  const displayNumber = questionIndex >= 0 ? questionIndex + 1 : 1;
  const [verifications, setVerifications] = useState<any[]>([{ claim: '', result: '', source: '', note: '' }]);
  const [analysis, setAnalysis] = useState('');
  const [activeTab, setActiveTab] = useState<'resources' | 'web' | 'ai'>('resources');
  const [activeAnswerTab, setActiveAnswerTab] = useState<'verification' | 'analysis'>('verification');

  useEffect(() => {
    const saved = answers[question.id];
    if (saved) {
      setVerifications(saved.verifications || [{ claim: '', result: '', source: '', note: '' }]);
      setAnalysis(saved.analysis || '');
    }
  }, [question.id, answers]);

  const handleVerificationChange = (index: number, field: string, value: string) => {
    const updated = [...verifications];
    updated[index] = { ...updated[index], [field]: value };
    setVerifications(updated);
    // 로컬 상태에만 저장 (헤더의 저장 버튼 클릭시 서버에 저장됨)
    setAnswer(question.id, { verifications: updated, analysis });
  };

  const handleAnalysisChange = (text: string) => {
    setAnalysis(text);
    // 로컬 상태에만 저장 (헤더의 저장 버튼 클릭시 서버에 저장됨)
    setAnswer(question.id, { verifications, analysis: text });
  };

  const addRow = () => {
    setVerifications([...verifications, { claim: '', result: '', source: '', note: '' }]);
  };

  return (
    <div className="h-[calc(100vh-140px)] p-4 bg-neutral-100">
      {/* 2x2 Grid Layout - 완벽한 대칭 */}
      <div className="exam-grid-2x2">
        
        {/* Panel 1: Question */}
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
                <div className="py-3 border-t border-b border-purple-300">
                  <h3 className="exam-section-title text-purple-900 flex items-center gap-1.5 mb-2">
                    <span>⭐</span>
                    <span>평가기준</span>
                  </h3>
                  <ul className="space-y-1 pl-4">
                    {(Array.isArray(question.question_content.requirements) 
                      ? question.question_content.requirements 
                      : [question.question_content.requirements]
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

        {/* Panel 2: AI Generated Content */}
        <div className="exam-panel">
          <div className="exam-panel-header exam-panel-header-accent">
            <span>⚠️</span>
            <span>AI 생성 콘텐츠 (검증 대상)</span>
            <div className="ml-auto px-2 py-0.5 bg-white/30 rounded text-xs font-semibold">
              🤖 AI
            </div>
          </div>
          <div className="exam-panel-content bg-neutral-50">
            <div className="exam-alert exam-alert-error">
              <div className="text-sm font-bold mb-1.5">🔍 검증 대상 콘텐츠</div>
              <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ 
                __html: question.question_content?.scenario || '검증 대상 콘텐츠가 없습니다.' 
              }} />
            </div>
          </div>
        </div>

        {/* Panel 3: Verification Tools */}
        <div className="exam-panel">
          <div className="exam-panel-header exam-panel-header-secondary">
            <span>🔍</span>
            <span>검증 도구</span>
          </div>
          
          <div className="exam-tabs">
            <button
              onClick={() => setActiveTab('resources')}
              className={`exam-tab ${activeTab === 'resources' ? 'exam-tab-active' : ''}`}
            >
              📚 제공 자료
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`exam-tab ${activeTab === 'web' ? 'exam-tab-active' : ''}`}
            >
              🌐 웹 검색
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`exam-tab ${activeTab === 'ai' ? 'exam-tab-active' : ''}`}
            >
              🤖 AI 검증
            </button>
          </div>

          <div className="exam-panel-content">
          </div>
        </div>

        {/* Panel 4: Answer Area */}
        <div className="exam-panel">
          <div className="exam-panel-header exam-panel-header-primary">
            <button 
              onClick={() => setActiveAnswerTab('verification')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeAnswerTab === 'verification'
                  ? 'bg-white text-neutral-900'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              1. 검증표
            </button>
            <button 
              onClick={() => setActiveAnswerTab('analysis')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeAnswerTab === 'analysis'
                  ? 'bg-white text-neutral-900'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              2. 분석
            </button>
          </div>

          <div className="exam-panel-content">
            {activeAnswerTab === 'verification' && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="bg-neutral-700 text-white p-1.5 text-xs border border-neutral-600">No</th>
                        <th className="bg-neutral-700 text-white p-1.5 text-xs border border-neutral-600">검증 대상</th>
                        <th className="bg-neutral-700 text-white p-1.5 text-xs border border-neutral-600">결과</th>
                        <th className="bg-neutral-700 text-white p-1.5 text-xs border border-neutral-600">출처</th>
                        <th className="bg-neutral-700 text-white p-1.5 text-xs border border-neutral-600">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.map((v, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                          <td className="p-1 border border-neutral-300 text-center text-xs">{idx + 1}</td>
                          <td className="p-1 border border-neutral-300">
                            <input
                              type="text"
                              value={v.claim}
                              onChange={(e) => handleVerificationChange(idx, 'claim', e.target.value)}
                              className="exam-input p-1 text-xs"
                              placeholder="검증 대상"
                            />
                          </td>
                          <td className="p-1 border border-neutral-300">
                            <select
                              value={v.result}
                              onChange={(e) => handleVerificationChange(idx, 'result', e.target.value)}
                              className="exam-input p-1 text-xs"
                            >
                              <option value="">선택</option>
                              <option value="correct">✓ 정확</option>
                              <option value="incorrect">✗ 부정확</option>
                              <option value="hallucination">⚠️ 환각</option>
                            </select>
                          </td>
                          <td className="p-1 border border-neutral-300">
                            <input
                              type="text"
                              value={v.source}
                              onChange={(e) => handleVerificationChange(idx, 'source', e.target.value)}
                              className="exam-input p-1 text-xs"
                              placeholder="출처"
                            />
                          </td>
                          <td className="p-1 border border-neutral-300">
                            <input
                              type="text"
                              value={v.note}
                              onChange={(e) => handleVerificationChange(idx, 'note', e.target.value)}
                              className="exam-input p-1 text-xs"
                              placeholder="메모"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button
                  onClick={addRow}
                  className="w-full p-2 bg-neutral-50 border border-dashed border-neutral-400 text-neutral-700 rounded text-xs font-semibold hover:bg-neutral-100 transition-all"
                >
                  ➕ 항목 추가
                </button>
              </div>
            )}

            {activeAnswerTab === 'analysis' && (
              <div className="h-full flex flex-col">
                <h3 className="exam-section-title mb-2">종합 분석 및 평가</h3>
                <textarea
                  value={analysis}
                  onChange={(e) => handleAnalysisChange(e.target.value)}
                  className="exam-textarea flex-1 min-h-[200px]"
                  placeholder="[검증 요약] 총 X개 항목 중 Y개 정확...&#10;[주요 오류] 1. ...&#10;[신뢰도 평가] ..."
                />
                <div className="exam-char-counter">
                  글자수: <span className="exam-char-counter-value">{analysis.length}</span> / 1000
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
