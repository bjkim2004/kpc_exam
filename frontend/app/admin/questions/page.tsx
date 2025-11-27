'use client';

import { useState, useEffect } from 'react';
import apiClient, { checkBackendConnection } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import QuestionForm from '@/components/admin/QuestionForm';

export default function QuestionsManagementPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    // Check backend connection first
    const init = async () => {
      const isConnected = await checkBackendConnection();
      if (!isConnected) {
        alert('⚠️ 백엔드 서버에 연결할 수 없습니다.\n\n관리자 기능을 사용하려면 백엔드를 시작하세요:\ncd backend\nuvicorn app.main:main --reload');
        router.push('/');
        return;
      }
      loadQuestions();
    };
    init();
  }, []);

  const loadQuestions = async () => {
    try {
      // 관리자는 include_inactive=true로 모든 문제 조회 가능
      const response = await apiClient.get('/questions?include_inactive=true');
      console.log('✅ Questions loaded from backend:', response.data);
      setQuestions(response.data);
    } catch (error: any) {
      console.error('❌ Failed to load questions:', error);
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 문제 목록 (question_number로 정렬)
  const filteredQuestions = questions
    .filter((q: any) => {
      if (filter === 'active') return q.is_active === 1;
      if (filter === 'inactive') return q.is_active === 0;
      return true; // 'all'
    })
    .sort((a: any, b: any) => a.question_number - b.question_number);

  const handleCreate = async (data: any) => {
    try {
      console.log('Creating question with data:', data);
      const response = await apiClient.post('/questions', data);
      console.log('Question created:', response.data);
      alert('문제가 성공적으로 추가되었습니다! ✅');
      setShowCreateModal(false);
      loadQuestions();
    } catch (error: any) {
      console.error('Create question error:', error.response?.data || error);
      const errorMsg = error.response?.data?.detail || error.message || '문제 추가에 실패했습니다.';
      alert(`문제 추가 실패: ${errorMsg}`);
      throw error;
    }
  };

  const handleAutoGenerate = async (formData: any) => {
    try {
      setAutoGenerating(true);
      console.log('🤖 Auto-generating question:', formData);
      
      // Prepare request data - handle empty strings and null values
      const requestData: any = {
        question_type: formData.question_type,
        competency: formData.competency,
      };
      
      // Only include topic if it has a value
      if (formData.topic && formData.topic.trim() !== '') {
        requestData.topic = formData.topic.trim();
      }
      
      // Only include question_number if it has a value
      if (formData.question_number && formData.question_number > 0) {
        requestData.question_number = parseInt(formData.question_number);
      }
      
      console.log('📤 Request data:', requestData);
      
      const response = await apiClient.post('/admin/questions/auto-generate', requestData);
      
      console.log('✅ Question auto-generated:', response.data);
      alert(`문제가 자동 생성되었습니다!\n\n문항 번호: ${response.data.question_number}\n제목: ${response.data.title}\n사용 토큰: ${response.data.tokens_used}`);
      
      setShowAutoGenerateModal(false);
      loadQuestions();
    } catch (error: any) {
      console.error('❌ Auto-generate error:', error);
      const errorMsg = error.response?.data?.detail || error.message || '문제 자동 생성에 실패했습니다.';
      alert(`문제 자동 생성 실패: ${errorMsg}`);
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleQuickAdd = async (competency: string, type: string) => {
    const nextNumber = questions.length > 0 
      ? Math.max(...questions.map(q => q.question_number)) + 1 
      : 1;

    const sampleData = {
      question_number: nextNumber,
      type: type,
      title: `${competency.split(':')[0]} 샘플 문제 ${nextNumber}번`,
      content: `<h3>${competency} 샘플 문제입니다.</h3><p>실제 문제로 수정해주세요.</p>`,
      points: 10,
      time_limit: 10,
      competency: competency,
      scenario: null,
      requirements: [],
      reference_materials: null,
      ai_options: null,
      options: type === 'multiple_choice' ? [
        { text: '샘플 선택지 1' },
        { text: '샘플 선택지 2' },
        { text: '샘플 선택지 3' },
        { text: '샘플 선택지 4' }
      ] : []
    };

    try {
      await apiClient.post('/questions', sampleData);
      alert(`문제 ${nextNumber}번이 추가되었습니다. 수정해서 사용하세요.`);
      setShowQuickAddMenu(false);
      loadQuestions();
    } catch (error: any) {
      alert('샘플 문제 추가 실패: ' + (error.response?.data?.detail || error.message));
    }
  };

  const quickAddOptions = [
    { competency: '역량 A: 기초 이해 및 활용', type: 'multiple_choice', label: '역량 A: 기초 이해 및 활용', color: 'bg-blue-600 hover:bg-blue-700' },
    { competency: '역량 B: 문제해결 및 실무 적용', type: 'prompt_design', label: '역량 B: 문제해결 및 실무 적용', color: 'bg-amber-600 hover:bg-amber-700' },
    { competency: '역량 C: 비판적 사고 및 평가', type: 'fact_checking', label: '역량 C: 비판적 사고 및 평가', color: 'bg-rose-600 hover:bg-rose-700' },
    { competency: '역량 D: 윤리 및 책임성', type: 'ethical_review', label: '역량 D: 윤리 및 책임성', color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  const handleEdit = async (questionId: number) => {
    try {
      const response = await apiClient.get(`/questions/${questionId}`);
      setEditingQuestion(response.data);
    } catch (error) {
      alert('문제를 불러오는데 실패했습니다.');
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      console.log('Updating question with data:', data);
      const response = await apiClient.put(`/questions/${editingQuestion.id}`, data);
      console.log('Update response:', response.data);
      alert('문제가 수정되었습니다.');
      setEditingQuestion(null);
      loadQuestions();
    } catch (error: any) {
      console.error('Update error:', error.response?.data || error);
      alert(error.response?.data?.detail || '문제 수정에 실패했습니다.');
      throw error;
    }
  };

  const handleDelete = async (questionId: number) => {
    if (!confirm('정말 이 문제를 삭제하시겠습니까?\n(비활성화됩니다)')) return;
    
    try {
      await apiClient.delete(`/questions/${questionId}`);
      alert('문제가 삭제되었습니다.');
      loadQuestions();
    } catch (error) {
      alert('문제 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (questionId: number, currentStatus: number) => {
    try {
      // 문제를 다시 불러와서 전체 데이터로 업데이트
      const response = await apiClient.get(`/questions/${questionId}`);
      const question = response.data;
      
      // question_content 데이터를 flatten
      const updateData = {
        question_number: question.question_number,
        type: question.type,
        title: question.title,
        content: question.content,
        points: question.points,
        time_limit: question.time_limit,
        competency: question.competency || '기본 역량',
        is_active: currentStatus === 1 ? 0 : 1,
        // question_content 데이터
        scenario: question.question_content?.scenario || null,
        requirements: question.question_content?.requirements || [],
        reference_materials: question.question_content?.reference_materials || null,
        ai_options: question.question_content?.ai_options || null,
        options: question.question_content?.options || [],
      };
      
      await apiClient.put(`/questions/${questionId}`, updateData);
      loadQuestions();
    } catch (error: any) {
      console.error('Toggle active error:', error.response?.data);
      alert('상태 변경에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  // 문항 순서 변경 (위로 이동)
  const handleMoveUp = async (questionId: number, currentIndex: number) => {
    if (currentIndex === 0) return; // 이미 맨 위
    
    const currentQuestion = filteredQuestions[currentIndex];
    const previousQuestion = filteredQuestions[currentIndex - 1];
    
    // 두 문제의 question_number 교환
    await swapQuestionNumbers(currentQuestion, previousQuestion);
  };

  // 문항 순서 변경 (아래로 이동)
  const handleMoveDown = async (questionId: number, currentIndex: number) => {
    if (currentIndex === filteredQuestions.length - 1) return; // 이미 맨 아래
    
    const currentQuestion = filteredQuestions[currentIndex];
    const nextQuestion = filteredQuestions[currentIndex + 1];
    
    // 두 문제의 question_number 교환
    await swapQuestionNumbers(currentQuestion, nextQuestion);
  };

  // 두 문제의 question_number 교환
  const swapQuestionNumbers = async (question1: any, question2: any) => {
    try {
      // 두 문제를 모두 불러오기
      const [q1Response, q2Response] = await Promise.all([
        apiClient.get(`/questions/${question1.id}`),
        apiClient.get(`/questions/${question2.id}`)
      ]);
      
      const q1 = q1Response.data;
      const q2 = q2Response.data;
      
      // 임시 번호 생성 (현재 최대 번호보다 큰 값 사용)
      const maxNumber = Math.max(...questions.map((q: any) => q.question_number || 0));
      const tempNumber = maxNumber + 1000; // 임시 번호 (충분히 큰 값)
      
      // 첫 번째 문제를 임시 번호로 변경
      const q1UpdateData1 = {
        question_number: tempNumber,
        type: q1.type,
        title: q1.title,
        content: q1.content,
        points: q1.points,
        time_limit: q1.time_limit,
        competency: q1.competency || '기본 역량',
        is_active: q1.is_active,
        scenario: q1.question_content?.scenario || null,
        requirements: q1.question_content?.requirements || [],
        reference_materials: q1.question_content?.reference_materials || null,
        ai_options: q1.question_content?.ai_options || null,
        options: q1.question_content?.options || [],
      };
      
      // 두 번째 문제를 첫 번째 문제의 번호로 변경
      const q2UpdateData = {
        question_number: q1.question_number,
        type: q2.type,
        title: q2.title,
        content: q2.content,
        points: q2.points,
        time_limit: q2.time_limit,
        competency: q2.competency || '기본 역량',
        is_active: q2.is_active,
        scenario: q2.question_content?.scenario || null,
        requirements: q2.question_content?.requirements || [],
        reference_materials: q2.question_content?.reference_materials || null,
        ai_options: q2.question_content?.ai_options || null,
        options: q2.question_content?.options || [],
      };
      
      // 첫 번째 문제를 두 번째 문제의 번호로 변경
      const q1UpdateData2 = {
        question_number: q2.question_number,
        type: q1.type,
        title: q1.title,
        content: q1.content,
        points: q1.points,
        time_limit: q1.time_limit,
        competency: q1.competency || '기본 역량',
        is_active: q1.is_active,
        scenario: q1.question_content?.scenario || null,
        requirements: q1.question_content?.requirements || [],
        reference_materials: q1.question_content?.reference_materials || null,
        ai_options: q1.question_content?.ai_options || null,
        options: q1.question_content?.options || [],
      };
      
      // 순차적으로 업데이트
      await apiClient.put(`/questions/${question1.id}`, q1UpdateData1);
      await apiClient.put(`/questions/${question2.id}`, q2UpdateData);
      await apiClient.put(`/questions/${question1.id}`, q1UpdateData2);
      
      loadQuestions();
    } catch (error: any) {
      console.error('Swap question numbers error:', error);
      alert('순서 변경에 실패했습니다: ' + (error.response?.data?.detail || error.message));
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
      'comprehension': '이해',
      'application': '응용',
      'critical_analysis': '비판적 분석',
      'case_study': '사례 연구',
    };
    return types[type] || type;
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">문제 관리</h1>
            <p className="text-neutral-500 mt-1 text-sm">
              총 <span className="font-semibold text-neutral-700">{questions.length}</span>개 · 활성 <span className="font-semibold text-neutral-700">{questions.filter((q: any) => q.is_active === 1).length}</span>개 · 비활성 <span className="font-semibold text-neutral-700">{questions.filter((q: any) => q.is_active === 0).length}</span>개
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAutoGenerateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-sm text-sm flex items-center gap-2"
              title="Gemini AI를 이용하여 자동으로 문제를 생성합니다"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 자동 출제
            </button>
            <div className="relative">
              <button
                onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-all font-medium shadow-sm text-sm flex items-center gap-2"
                title="역량별 문항을 추가합니다"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                문항 추가
                <svg className={`w-3.5 h-3.5 transition-transform ${showQuickAddMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showQuickAddMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowQuickAddMenu(false)} />
                  <div className="absolute top-full right-0 mt-1.5 w-60 bg-white rounded-md shadow-xl border border-neutral-200 z-20 overflow-hidden">
                    <div className="bg-neutral-900 text-white px-3.5 py-2 font-medium text-xs">
                      역량별 문항 추가
                    </div>
                    {quickAddOptions.map((option) => (
                      <button
                        key={option.competency}
                        onClick={() => handleQuickAdd(option.competency, option.type)}
                        className={`w-full px-3.5 py-2.5 text-left text-white font-medium text-xs ${option.color} transition-all`}
                      >
                        {option.label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setShowQuickAddMenu(false);
                        setShowCreateModal(true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left bg-white hover:bg-neutral-50 text-neutral-900 font-medium text-xs border-t border-neutral-200 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      직접 입력하기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        {questions.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-700">필터:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              전체 ({questions.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                filter === 'active'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              활성 ({questions.filter((q: any) => q.is_active === 1).length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                filter === 'inactive'
                  ? 'bg-neutral-600 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              비활성 ({questions.filter((q: any) => q.is_active === 0).length})
            </button>
          </div>
        )}

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-10 text-center">
            <div className="text-5xl mb-3 opacity-50">📝</div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1.5">
              {filter === 'active' ? '활성 문제가 없습니다' : 
               filter === 'inactive' ? '비활성 문제가 없습니다' : 
               '문제가 없습니다'}
            </h3>
            <p className="text-neutral-500 mb-5 text-sm">
              {filter === 'all' ? '역량별 문항을 추가하여 시작하세요.' : 
               filter === 'active' ? '다른 필터를 선택하거나 새 문제를 추가하세요.' :
               '다른 필터를 선택하세요.'}
            </p>
            
            <div className="mb-5">
              <div className="text-xs font-semibold text-neutral-600 mb-2.5">역량별 문항 추가</div>
              <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
                {quickAddOptions.map((option) => (
                  <button
                    key={option.competency}
                    onClick={() => handleQuickAdd(option.competency, option.type)}
                    className={`px-3.5 py-2.5 text-white rounded-md transition-all font-medium text-xs ${option.color}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-3.5 border-t border-neutral-200">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 transition-all font-medium text-sm"
              >
                <svg className="w-3.5 h-3.5 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                직접 입력하기
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">순서</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">번호</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">제목</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">유형</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">배점</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">시간</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">상태</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {filteredQuestions.map((question, idx) => (
                <tr
                  key={question.id}
                  className={`hover:bg-neutral-50 transition-colors ${
                    question.is_active === 0 ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col gap-1 items-center">
                      <button
                        onClick={() => handleMoveUp(question.id, idx)}
                        disabled={idx === 0}
                        className={`p-1 rounded transition-all ${
                          idx === 0
                            ? 'text-neutral-300 cursor-not-allowed'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                        }`}
                        title="위로 이동"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveDown(question.id, idx)}
                        disabled={idx === filteredQuestions.length - 1}
                        className={`p-1 rounded transition-all ${
                          idx === filteredQuestions.length - 1
                            ? 'text-neutral-300 cursor-not-allowed'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                        }`}
                        title="아래로 이동"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-bold text-neutral-900">{question.question_number}</td>
                  <td className="px-4 py-2.5 text-sm">
                    <div className="font-medium text-neutral-900 line-clamp-1">{question.title}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-xs font-medium">
                      {getTypeLabel(question.type)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-neutral-900">
                    {question.points}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-500">
                    {question.time_limit ? `${question.time_limit}분` : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <button
                      onClick={() => handleToggleActive(question.id, question.is_active)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                        question.is_active === 1
                          ? 'bg-neutral-700 text-white hover:bg-neutral-800'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                    >
                      {question.is_active === 1 ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => handleEdit(question.id)}
                        className="px-2.5 py-1 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-all text-xs font-medium inline-flex items-center gap-1"
                        title="수정"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="px-2.5 py-1 bg-neutral-800 text-white rounded hover:bg-neutral-900 transition-all text-xs font-medium inline-flex items-center gap-1"
                        title="삭제"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full my-16 mx-4 border border-neutral-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">문제 추가</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <QuestionForm
                onSubmit={handleCreate}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )}

        {/* Auto Generate Modal */}
        {showAutoGenerateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full my-16 mx-4 border border-neutral-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-xl font-bold text-neutral-900 tracking-tight">AI 자동 출제</h3>
                </div>
                <button
                  onClick={() => setShowAutoGenerateModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  disabled={autoGenerating}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAutoGenerate({
                    question_type: formData.get('question_type') as string,
                    competency: formData.get('competency') as string,
                    topic: formData.get('topic') as string || null,
                    question_number: formData.get('question_number') ? parseInt(formData.get('question_number') as string) : null
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    문제 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="question_type"
                    required
                    disabled={autoGenerating}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="multiple_choice">객관식</option>
                    <option value="practical">서술형</option>
                    <option value="essay">수행형</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    평가 역량 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="competency"
                    required
                    disabled={autoGenerating}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="역량 A: 기초 이해 및 활용">역량 A: 기초 이해 및 활용</option>
                    <option value="역량 B: 문제해결 및 실무 적용">역량 B: 문제해결 및 실무 적용</option>
                    <option value="역량 C: 윤리적 활용 및 비판적 사고">역량 C: 윤리적 활용 및 비판적 사고</option>
                    <option value="역량 D: 혁신 및 창의적 활용">역량 D: 혁신 및 창의적 활용</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    주제 (선택사항)
                  </label>
                  <input
                    type="text"
                    name="topic"
                    disabled={autoGenerating}
                    placeholder="예: ChatGPT 프롬프트 엔지니어링, AI 윤리 등"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">특정 주제를 지정하면 더 구체적인 문제가 생성됩니다.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    문항 번호 (선택사항)
                  </label>
                  <input
                    type="number"
                    name="question_number"
                    min="1"
                    disabled={autoGenerating}
                    placeholder="자동 할당 (비워두면 자동)"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">비워두면 자동으로 다음 번호가 할당됩니다.</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-purple-900">
                      <p className="font-semibold mb-1">💡 AI 자동 출제 안내</p>
                      <ul className="list-disc list-inside space-y-1 text-purple-800">
                        <li>Google Gemini AI가 문제를 자동으로 생성합니다.</li>
                        <li>생성된 문제는 수정 가능하며, 필요시 내용을 보완해주세요.</li>
                        <li>객관식 문제의 경우 선택지도 자동 생성됩니다.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={autoGenerating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {autoGenerating ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        생성 중...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        문제 생성하기
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAutoGenerateModal(false)}
                    disabled={autoGenerating}
                    className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full my-16 mx-4 border border-neutral-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">문제 수정</h3>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <QuestionForm
                initialData={editingQuestion}
                onSubmit={handleUpdate}
                onCancel={() => setEditingQuestion(null)}
                isEdit
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

