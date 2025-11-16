'use client';

import { ReactNode } from 'react';

interface QuestionWrapperProps {
  question: any;
  children: ReactNode;
}

export default function QuestionWrapper({ question, children }: QuestionWrapperProps) {
  return (
    <div className="min-h-full p-6 bg-neutral-100">
      <div className="max-w-7xl mx-auto">
        {/* Question Header */}
        <div className="bg-white border border-neutral-300 rounded-lg shadow-elevation-2 mb-6">
          <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-neutral-800">#{String(question.question_number).padStart(2, '0')}</span>
                <h1 className="text-lg font-semibold text-neutral-900">{question.title}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span>배점: <span className="font-semibold text-neutral-800">{question.points}점</span></span>
                {question.time_limit && (
                  <span>권장 시간: <span className="font-semibold text-neutral-800">{question.time_limit}분</span></span>
                )}
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="px-6 py-6">
            <div className="prose prose-sm max-w-none text-neutral-800 leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: question.content }} />
            
            {/* Multimedia Support */}
            {question.question_content?.image && (
              <div className="mt-4">
                <img 
                  src={question.question_content.image} 
                  alt="Question image" 
                  className="max-w-full rounded-lg border border-neutral-300 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    window.open(question.question_content.image, '_blank');
                  }}
                />
              </div>
            )}
            
            {question.question_content?.audio && (
              <div className="mt-4">
                <audio controls className="w-full">
                  <source src={question.question_content.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {question.question_content?.video && (
              <div className="mt-4">
                <video controls className="w-full rounded-lg">
                  <source src={question.question_content.video} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              </div>
            )}

            {/* Requirements */}
            {question.question_content?.requirements && (
              <div className="mt-6 p-4 bg-neutral-100 border-l-4 border-neutral-700 rounded-lg">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">요구사항</h3>
                <div className="text-sm text-neutral-700" dangerouslySetInnerHTML={{ __html: question.question_content.requirements }} />
              </div>
            )}

            {/* Reference Materials */}
            {question.question_content?.reference_materials && (
              <div className="mt-6 p-4 bg-neutral-100 border border-neutral-300 rounded-lg">
                <h3 className="text-sm font-semibold text-neutral-800 mb-2">📚 참고 자료</h3>
                <div className="text-sm text-neutral-700" dangerouslySetInnerHTML={{ __html: question.question_content.reference_materials }} />
              </div>
            )}
          </div>
        </div>

        {/* Answer Area */}
        {children}
      </div>
    </div>
  );
}
