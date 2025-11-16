'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, examsRes] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/exams')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setExams(examsRes.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 mb-5 tracking-tight">관리자 대시보드</h1>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-4 rounded-md shadow-sm border border-neutral-200">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-1">전체 사용자</div>
            <div className="text-2xl font-bold text-neutral-900">{stats?.total_users || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border border-neutral-200">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-1">전체 시험</div>
            <div className="text-2xl font-bold text-neutral-900">{stats?.total_exams || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border border-neutral-200">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-1">진행 중</div>
            <div className="text-2xl font-bold text-neutral-700">{stats?.exams_in_progress || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border border-neutral-200">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-1">제출 완료</div>
            <div className="text-2xl font-bold text-neutral-800">{stats?.exams_submitted || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border border-neutral-200">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-1">채점 완료</div>
            <div className="text-2xl font-bold text-neutral-900">{stats?.exams_graded || 0}</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-md shadow-sm border border-neutral-200 mb-5">
          <div className="px-4 py-3 border-b border-neutral-200">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">사용자 목록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">이메일</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">수험번호</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">역할</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-semibold text-neutral-900">{user.id}</td>
                    <td className="px-4 py-2.5 text-sm text-neutral-900">{user.email}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-600">{user.exam_number}</td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exams Table */}
        <div className="bg-white rounded-md shadow-sm border border-neutral-200">
          <div className="px-4 py-3 border-b border-neutral-200">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">시험 결과</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">시험 ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">사용자 ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">시작 시간</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">종료 시간</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">점수</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-semibold text-neutral-900">{exam.id}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-600">{exam.user_id}</td>
                    <td className="px-4 py-2.5 text-xs">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        exam.status === 'submitted' ? 'bg-neutral-700 text-white' :
                        exam.status === 'graded' ? 'bg-neutral-900 text-white' :
                        'bg-neutral-200 text-neutral-700'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{exam.start_time ? new Date(exam.start_time).toLocaleString('ko-KR') : '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-500">{exam.end_time ? new Date(exam.end_time).toLocaleString('ko-KR') : '-'}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-neutral-900">{exam.score || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-right">
                      {exam.status === 'submitted' && (
                        <button
                          onClick={async () => {
                            const score = prompt('점수를 입력하세요 (0-100):');
                            if (score) {
                              await apiClient.post(`/admin/grade/${exam.id}`, { score: parseInt(score) });
                              loadData();
                            }
                          }}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium"
                        >
                          채점
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


