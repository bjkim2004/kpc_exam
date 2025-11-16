'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/lib/stores/examStore';
import ExamHeader from '@/components/exam/ExamHeader';
import ExamNavigation from '@/components/exam/ExamNavigation';
import ExamSidebar from '@/components/exam/ExamSidebar';
import { checkBackendConnection } from '@/lib/api/client';

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Desktop: always open (true), Mobile: closed by default (false)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loadQuestions, questions } = useExamStore();
  // const [focusLostCount, setFocusLostCount] = useState(0); // 부정행위 방지 기능 비활성화

  useEffect(() => {
    // Check backend connection first
    const checkConnection = async () => {
      const isConnected = await checkBackendConnection();
      if (!isConnected) {
        console.warn('⚠️⚠️⚠️ BACKEND IS NOT RUNNING ⚠️⚠️⚠️');
        console.warn('Mock data will be used for development.');
        console.warn('To use real database:');
        console.warn('1. cd backend');
        console.warn('2. uvicorn app.main:main --reload');
      }
    };
    
    checkConnection();
    
    // Load questions if not already loaded
    if (questions.length === 0) {
      loadQuestions();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ========================================
   * 부정행위 방지 기능 - 별도 요청이 있을 때까지 비활성화
   * ======================================== */
  
  // // 부정행위 방지 조치
  // useEffect(() => {
  //   console.log('🔒 부정행위 방지 시스템 활성화');

  //   // 1. 우클릭 방지
  //   const handleContextMenu = (e: MouseEvent) => {
  //     e.preventDefault();
  //     return false;
  //   };

  //   // 2. 복사/붙여넣기/잘라내기 방지 (textarea 외부에서만)
  //   const handleCopy = (e: ClipboardEvent) => {
  //     const target = e.target as HTMLElement;
  //     if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
  //       e.preventDefault();
  //       return false;
  //     }
  //   };

  //   const handleCut = (e: ClipboardEvent) => {
  //     const target = e.target as HTMLElement;
  //     if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
  //       e.preventDefault();
  //       return false;
  //     }
  //   };

  //   // 3. 텍스트 드래그 선택 방지 (textarea 외부에서만)
  //   const handleSelectStart = (e: Event) => {
  //     const target = e.target as HTMLElement;
  //     if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT' && 
  //         !target.classList.contains('exam-textarea') && 
  //         !target.classList.contains('exam-input')) {
  //       e.preventDefault();
  //       return false;
  //     }
  //   };

  //   // 4. 개발자 도구 단축키 차단
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     // F12
  //     if (e.key === 'F12') {
  //       e.preventDefault();
  //       return false;
  //     }
  //     // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (개발자 도구)
  //     if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
  //       e.preventDefault();
  //       return false;
  //     }
  //     // Ctrl+U (소스 보기)
  //     if (e.ctrlKey && e.key === 'u') {
  //       e.preventDefault();
  //       return false;
  //     }
  //   };

  //   // 5. 탭 전환 / 포커스 이탈 감지
  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       setFocusLostCount(prev => {
  //         const newCount = prev + 1;
  //         console.warn(`⚠️ 경고: 시험 화면 이탈 감지 (${newCount}회)`);
          
  //         // 3회 이상 이탈 시 강력한 경고
  //         if (newCount >= 3) {
  //           alert('⚠️ 경고: 시험 화면을 3회 이상 이탈하였습니다.\n부정행위로 간주될 수 있습니다.\n시험 화면에 계속 머물러주세요.');
  //         } else {
  //           alert(`⚠️ 경고: 시험 화면 이탈이 감지되었습니다. (${newCount}회)\n시험 화면에 집중해주세요.`);
  //         }
  //         return newCount;
  //       });
  //     }
  //   };

  //   const handleBlur = () => {
  //     console.warn('⚠️ 윈도우 포커스 상실');
  //   };

  //   // 이벤트 리스너 등록
  //   document.addEventListener('contextmenu', handleContextMenu);
  //   document.addEventListener('copy', handleCopy);
  //   document.addEventListener('cut', handleCut);
  //   document.addEventListener('selectstart', handleSelectStart);
  //   document.addEventListener('keydown', handleKeyDown);
  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   window.addEventListener('blur', handleBlur);

  //   // CSS로 드래그 방지 추가
  //   const style = document.createElement('style');
  //   style.textContent = `
  //     .exam-protected * {
  //       user-select: none;
  //       -webkit-user-select: none;
  //       -moz-user-select: none;
  //       -ms-user-select: none;
  //     }
  //     .exam-protected textarea,
  //     .exam-protected input,
  //     .exam-protected .exam-textarea,
  //     .exam-protected .exam-input {
  //       user-select: text !important;
  //       -webkit-user-select: text !important;
  //       -moz-user-select: text !important;
  //       -ms-user-select: text !important;
  //     }
  //   `;
  //   document.head.appendChild(style);

  //   // Cleanup
  //   return () => {
  //     document.removeEventListener('contextmenu', handleContextMenu);
  //     document.removeEventListener('copy', handleCopy);
  //     document.removeEventListener('cut', handleCut);
  //     document.removeEventListener('selectstart', handleSelectStart);
  //     document.removeEventListener('keydown', handleKeyDown);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     window.removeEventListener('blur', handleBlur);
  //     document.head.removeChild(style);
  //   };
  // }, []);

  // // 페이지 이탈 방지 경고
  // useEffect(() => {
  //   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //     e.preventDefault();
  //     e.returnValue = '시험이 진행 중입니다. 정말 페이지를 나가시겠습니까?';
  //     return e.returnValue;
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral">
      <ExamHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Slide panel (overlay on all screen sizes) */}
        <ExamSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content - Always full width */}
        <main className="flex-1 overflow-y-auto bg-neutral w-full">
          {children}
        </main>
      </div>
      <ExamNavigation />
      
      {/* 부정행위 방지 안내 - 비활성화 */}
      {/* {focusLostCount > 0 && (
        <div className="fixed bottom-20 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold z-50">
          ⚠️ 화면 이탈: {focusLostCount}회
        </div>
      )} */}
    </div>
  );
}


