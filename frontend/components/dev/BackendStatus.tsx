'use client';

import { useState, useEffect } from 'react';
import { checkBackendConnection } from '@/lib/api/client';

export default function BackendStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    const connected = await checkBackendConnection();
    setIsConnected(connected);
    setIsChecking(false);
  };

  useEffect(() => {
    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return null; // Initial loading
  }

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold z-50 ${
        isConnected
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white animate-pulse'
      }`}
    >
      <div
        className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-200' : 'bg-red-200'
        } ${isChecking ? 'animate-ping' : ''}`}
      />
      <span>
        {isConnected ? '✅ Backend Connected' : '❌ Backend Disconnected'}
      </span>
      {!isConnected && (
        <button
          onClick={checkStatus}
          className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs"
          disabled={isChecking}
        >
          {isChecking ? '확인 중...' : '재시도'}
        </button>
      )}
    </div>
  );
}





