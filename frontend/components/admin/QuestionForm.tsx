'use client';

import { useState, useEffect } from 'react';

interface QuestionFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function QuestionForm({ initialData, onSubmit, onCancel, isEdit = false }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    question_number: initialData?.question_number || '',
    type: initialData?.type || 'multiple_choice',
    title: initialData?.title || '',
    content: initialData?.content || '',
    points: initialData?.points || 10,
    time_limit: initialData?.time_limit || 10,
    competency: initialData?.competency || '',
    is_active: initialData?.is_active !== undefined ? initialData.is_active : 1,
    // Question content
    scenario: initialData?.question_content?.scenario || '',
    requirements: initialData?.question_content?.requirements || [],
    reference_materials: initialData?.question_content?.reference_materials || '',
    ai_options: initialData?.question_content?.ai_options || null,
    options: initialData?.question_content?.options || [],
  });

  const [optionText, setOptionText] = useState('');
  const [requirementText, setRequirementText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 역량별 구분
  const competencies = [
    { value: '역량 A: 기초 이해 및 활용', label: '역량 A: 기초 이해 및 활용', color: 'bg-neutral-100 text-neutral-700' },
    { value: '역량 B: 문제해결 및 실무 적용', label: '역량 B: 문제해결 및 실무 적용', color: 'bg-neutral-200 text-neutral-800' },
    { value: '역량 C: 비판적 사고 및 평가', label: '역량 C: 비판적 사고 및 평가', color: 'bg-neutral-300 text-neutral-900' },
    { value: '역량 D: 윤리 및 책임성', label: '역량 D: 윤리 및 책임성', color: 'bg-neutral-400 text-neutral-900' },
  ];

  // 문제 유형 (3가지로 단순화)
  const questionTypes = [
    { value: 'multiple_choice', label: '객관식' },
    { value: 'practical', label: '서술형' },
    { value: 'essay', label: '수행형' },
  ];

  const getAvailableTypes = () => {
    return questionTypes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const addOption = () => {
    if (optionText.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, { text: optionText.trim() }]
      });
      setOptionText('');
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_: any, i: number) => i !== index)
    });
  };

  const addRequirement = () => {
    if (requirementText.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementText.trim()]
      });
      setRequirementText('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 역량 선택 (최상단) */}
      <div className="border border-neutral-200 p-4 rounded-md bg-white">
        <h3 className="text-sm font-bold text-neutral-700 mb-3 uppercase tracking-wide">역량 선택</h3>
        <div className="grid grid-cols-2 gap-2">
          {competencies.map((comp) => (
            <button
              key={comp.value}
              type="button"
              onClick={() => {
                setFormData({ ...formData, competency: comp.value });
                // 역량 변경 시 첫 번째 권장 유형으로 자동 설정
                const availableTypes = questionTypesByCompetency[comp.value];
                if (availableTypes && availableTypes.length > 0) {
                  setFormData({ ...formData, competency: comp.value, type: availableTypes[0].value });
                }
              }}
              className={`px-3 py-2 rounded-md border transition-all font-medium text-xs ${
                formData.competency === comp.value
                  ? `${comp.color} border-neutral-400 shadow-sm`
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {comp.label}
            </button>
          ))}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="border border-neutral-200 p-4 rounded-md bg-white">
        <h3 className="text-sm font-bold text-neutral-700 mb-3 uppercase tracking-wide">기본 정보</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              문제 번호 *
            </label>
            <input
              type="number"
              required
              value={formData.question_number}
              onChange={(e) => setFormData({ ...formData, question_number: parseInt(e.target.value) })}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              문제 유형 * {formData.competency && <span className="text-xs text-neutral-400 font-normal">(역량 연동)</span>}
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
            >
              {getAvailableTypes().map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} {type.recommended ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              배점 *
            </label>
            <input
              type="number"
              required
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              권장 시간 (분)
            </label>
            <input
              type="number"
              value={formData.time_limit || ''}
              onChange={(e) => setFormData({ ...formData, time_limit: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 문제 내용 */}
      <div className="border border-neutral-200 p-4 rounded-md bg-white">
        <h3 className="text-sm font-bold text-neutral-700 mb-3 uppercase tracking-wide">문제 내용</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              제목 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              문제 내용 * <span className="text-xs text-neutral-400 font-normal">(HTML 가능)</span>
            </label>
            <textarea
              required
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="HTML 형식으로 입력 가능합니다. 예: <h3>문제 제목</h3><p>내용...</p>"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* 객관식 선택지 */}
      {formData.type === 'multiple_choice' && (
        <div className="border border-neutral-200 p-4 rounded-md bg-white">
          <h3 className="text-sm font-bold text-neutral-700 mb-3 uppercase tracking-wide">객관식 선택지</h3>
          
          <div className="mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={optionText}
                onChange={(e) => setOptionText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                placeholder="선택지 입력 (HTML 가능)"
                className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
              />
              <button
                type="button"
                onClick={addOption}
                className="px-3 py-1.5 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-all font-medium text-sm"
              >
                추가
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {formData.options.map((option: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-md border border-neutral-200">
                <span className="font-bold text-neutral-700 text-xs min-w-[20px]">{idx + 1}.</span>
                <span className="flex-1 text-xs" dangerouslySetInnerHTML={{ __html: option.text }} />
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-all text-xs font-medium"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 추가 정보 */}
      <div className="border border-neutral-200 p-4 rounded-md bg-white">
        <h3 className="text-sm font-bold text-neutral-700 mb-3 uppercase tracking-wide">추가 정보</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              시나리오
            </label>
            <textarea
              rows={3}
              value={formData.scenario}
              onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              참고 자료 <span className="text-xs text-neutral-400 font-normal">(HTML 가능)</span>
            </label>
            <textarea
              rows={3}
              value={formData.reference_materials}
              onChange={(e) => setFormData({ ...formData, reference_materials: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
            />
          </div>

          {/* 평가기준 */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              평가기준
            </label>
            <div className="mb-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={requirementText}
                  onChange={(e) => setRequirementText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  placeholder="평가기준 입력"
                  className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-sm"
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-3 py-1.5 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-all font-medium text-sm"
                >
                  추가
                </button>
              </div>
            </div>
            <ul className="space-y-1">
              {formData.requirements.map((req: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 bg-neutral-50 p-2 rounded-md border border-neutral-200">
                  <span className="flex-1 text-xs">{req}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(idx)}
                    className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 transition-all text-xs font-medium"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 활성 상태 */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-3.5 h-3.5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
              />
              <label htmlFor="is_active" className="text-xs font-medium text-neutral-700">
                문제 활성화
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {submitting ? '저장 중...' : (isEdit ? '수정' : '추가')}
        </button>
      </div>
    </form>
  );
}

