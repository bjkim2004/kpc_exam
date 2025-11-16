'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100">
      <div className="w-full max-w-md">
        {/* Card - Sophisticated Monochrome */}
        <div className="bg-white rounded-lg shadow-elevation-4 overflow-hidden border-2 border-neutral-300">
          {/* Header */}
          <div className="p-8 text-center bg-gradient-to-b from-neutral-100 to-neutral-50 border-b-2 border-neutral-300">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-neutral-900 rounded-button flex items-center justify-center shadow-elevation-3">
                <span className="text-4xl font-black text-white">AI</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
              생성형 AI 역량평가
            </h1>
            <p className="text-neutral-600 text-sm">로그인하여 시작하세요</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 bg-white">
            {error && (
              <div className="mb-6 p-4 bg-neutral-100 border-2 border-neutral-400 rounded-button text-sm text-neutral-900">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wider">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-400 rounded-button focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wider">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-400 rounded-button focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-button shadow-elevation-3 hover:shadow-elevation-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>로그인 중...</span>
                </>
              ) : (
                <span>로그인</span>
              )}
            </button>

            <div className="mt-6 text-center">
              <Link 
                href="/register" 
                className="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                계정이 필요하신가요? <span className="font-bold">회원가입</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-neutral-600 text-sm">
          <p className="mb-2">🤖 Powered by Google Gemini AI</p>
          <p>© 2024 생성형 AI 역량평가 시스템</p>
        </div>
      </div>
    </div>
  );
}
