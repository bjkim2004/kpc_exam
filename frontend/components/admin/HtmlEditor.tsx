'use client';

import { useRef, useState } from 'react';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

const FONT_COLORS = [
  { name: '검정', color: '#000000' },
  { name: '빨강', color: '#EF4444' },
  { name: '주황', color: '#F97316' },
  { name: '노랑', color: '#EAB308' },
  { name: '초록', color: '#22C55E' },
  { name: '파랑', color: '#3B82F6' },
  { name: '남색', color: '#6366F1' },
  { name: '보라', color: '#A855F7' },
  { name: '분홍', color: '#EC4899' },
  { name: '회색', color: '#6B7280' },
];

export default function HtmlEditor({ value, onChange, placeholder, rows = 5, label }: HtmlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const insertTag = (openTag: string, closeTag: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      // 선택된 텍스트가 있으면 태그로 감싸기
      newText = value.substring(0, start) + openTag + selectedText + closeTag + value.substring(end);
      newCursorPos = start + openTag.length + selectedText.length + closeTag.length;
    } else {
      // 선택된 텍스트가 없으면 태그 삽입
      newText = value.substring(0, start) + openTag + closeTag + value.substring(end);
      newCursorPos = start + openTag.length;
    }

    onChange(newText);
    
    // 커서 위치 복원
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const applyColor = (color: string) => {
    insertTag(`<span style="color:${color}">`, '</span>');
    setShowColorPicker(false);
  };

  const toolbarButtons = [
    { label: 'B', title: '굵게', action: () => insertTag('<strong>', '</strong>'), className: 'font-bold' },
    { label: 'I', title: '기울임', action: () => insertTag('<em>', '</em>'), className: 'italic' },
    { label: 'U', title: '밑줄', action: () => insertTag('<u>', '</u>'), className: 'underline' },
    { type: 'divider' },
    { label: 'H3', title: '제목3', action: () => insertTag('<h3>', '</h3>'), className: 'text-xs font-bold' },
    { label: 'H4', title: '제목4', action: () => insertTag('<h4>', '</h4>'), className: 'text-xs font-semibold' },
    { type: 'divider' },
    { label: '•', title: '글머리 기호 목록', action: () => insertTag('<ul>\n  <li>', '</li>\n</ul>'), className: 'font-bold' },
    { label: '1.', title: '번호 목록', action: () => insertTag('<ol>\n  <li>', '</li>\n</ol>'), className: 'font-bold text-xs' },
    { label: 'LI', title: '목록 항목', action: () => insertTag('<li>', '</li>'), className: 'text-xs' },
    { type: 'divider' },
    { label: 'P', title: '문단', action: () => insertTag('<p>', '</p>'), className: 'text-xs' },
    { label: 'BR', title: '줄바꿈', action: () => insertAtCursor('<br/>'), className: 'text-xs' },
    { label: 'HR', title: '구분선', action: () => insertAtCursor('<hr/>'), className: 'text-xs' },
    { type: 'divider' },
    { type: 'color-picker' },
    { type: 'divider' },
    { label: '🔗', title: '링크', action: () => {
      const url = prompt('URL을 입력하세요:', 'https://');
      if (url) insertTag(`<a href="${url}" target="_blank">`, '</a>');
    }},
    { label: '📷', title: '이미지', action: () => {
      const url = prompt('이미지 URL을 입력하세요:', 'https://');
      if (url) insertAtCursor(`<img src="${url}" alt="" style="max-width:100%;"/>`);
    }},
  ];

  return (
    <div className="border border-neutral-300 rounded-md overflow-hidden">
      {/* 툴바 */}
      <div className="flex items-center gap-0.5 p-1.5 bg-neutral-100 border-b border-neutral-300 flex-wrap">
        {toolbarButtons.map((btn, idx) => 
          btn.type === 'divider' ? (
            <div key={idx} className="w-px h-5 bg-neutral-300 mx-1" />
          ) : btn.type === 'color-picker' ? (
            <div key={idx} className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="글자 색상"
                className={`px-2 py-1 min-w-[28px] text-xs bg-white border border-neutral-300 rounded hover:bg-neutral-50 hover:border-neutral-400 transition-all flex items-center gap-1 ${showColorPicker ? 'ring-2 ring-blue-400' : ''}`}
              >
                <span className="font-bold">A</span>
                <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-500 via-green-500 to-blue-500"></span>
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-neutral-300 rounded-md shadow-lg z-10">
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {FONT_COLORS.map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => applyColor(c.color)}
                        title={c.name}
                        className="w-6 h-6 rounded border border-neutral-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c.color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-neutral-200">
                    <input
                      type="color"
                      className="w-6 h-6 cursor-pointer"
                      onChange={(e) => applyColor(e.target.value)}
                      title="직접 선택"
                    />
                    <span className="text-xs text-neutral-500">직접 선택</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              key={idx}
              type="button"
              onClick={btn.action}
              title={btn.title}
              className={`px-2 py-1 min-w-[28px] text-xs bg-white border border-neutral-300 rounded hover:bg-neutral-50 hover:border-neutral-400 transition-all ${btn.className || ''}`}
            >
              {btn.label}
            </button>
          )
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`px-2 py-1 text-xs border rounded transition-all ${
            showPreview 
              ? 'bg-blue-500 text-white border-blue-600' 
              : 'bg-white border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          {showPreview ? '편집' : '미리보기'}
        </button>
      </div>

      {/* 편집 영역 또는 미리보기 */}
      {showPreview ? (
        <div 
          className="p-3 min-h-[120px] bg-white prose prose-sm max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-neutral-400">내용이 없습니다.</p>' }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 focus:outline-none focus:ring-0 font-mono text-xs resize-y border-0"
        />
      )}
    </div>
  );
}

