/**
 * 프롬프트 유사도 검사 유틸리티
 * 문제 내용과 유사한 프롬프트 입력을 방지
 */

/**
 * HTML 태그 제거
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 텍스트 정규화 (공백 제거, 특수문자 제거)
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글, 영문, 숫자만 유지)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 텍스트를 n-gram으로 분할
 */
function getNGrams(text: string, n: number = 3): Set<string> {
  const normalized = normalizeText(text);
  const ngrams = new Set<string>();
  
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.add(normalized.substring(i, i + n));
  }
  
  return ngrams;
}

/**
 * 두 텍스트 간의 자카드 유사도 계산
 */
export function calculateJaccardSimilarity(text1: string, text2: string): number {
  const ngrams1 = getNGrams(text1, 4);
  const ngrams2 = getNGrams(text2, 4);
  
  if (ngrams1.size === 0 || ngrams2.size === 0) return 0;
  
  const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
  const union = new Set([...ngrams1, ...ngrams2]);
  
  return intersection.size / union.size;
}

/**
 * 프롬프트가 문제 내용의 상당 부분을 포함하는지 확인
 */
export function containsSignificantPortion(prompt: string, questionText: string, threshold: number = 0.3): boolean {
  const normalizedPrompt = normalizeText(prompt);
  const normalizedQuestion = normalizeText(questionText);
  
  if (normalizedPrompt.length < 20 || normalizedQuestion.length < 20) return false;
  
  // 연속된 문자열 일치 검사 (20자 이상)
  const minMatchLength = 20;
  for (let i = 0; i <= normalizedQuestion.length - minMatchLength; i++) {
    const substring = normalizedQuestion.substring(i, i + minMatchLength);
    if (normalizedPrompt.includes(substring)) {
      return true;
    }
  }
  
  // 자카드 유사도 검사
  const similarity = calculateJaccardSimilarity(prompt, questionText);
  return similarity >= threshold;
}

/**
 * 문제에서 핵심 키워드 추출
 */
export function extractKeywords(text: string): string[] {
  const normalized = normalizeText(stripHtml(text));
  const words = normalized.split(/\s+/).filter(word => word.length >= 2);
  
  // 빈도수 계산
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // 빈도순 정렬 후 상위 키워드 반환
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * 프롬프트에 문제 키워드가 많이 포함되어 있는지 확인
 */
export function hasHighKeywordOverlap(prompt: string, questionText: string, threshold: number = 0.5): boolean {
  const keywords = extractKeywords(questionText);
  if (keywords.length === 0) return false;
  
  const normalizedPrompt = normalizeText(prompt);
  
  const matchCount = keywords.filter(keyword => 
    normalizedPrompt.includes(keyword)
  ).length;
  
  return matchCount / keywords.length >= threshold;
}

export interface PromptValidationResult {
  isValid: boolean;
  reason?: string;
  similarity?: number;
}

/**
 * 프롬프트 유효성 검사 메인 함수
 */
export function validatePrompt(
  prompt: string, 
  questionContent: string, 
  questionScenario?: string
): PromptValidationResult {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, reason: '프롬프트를 입력해주세요.' };
  }
  
  // 문제 텍스트 결합
  const fullQuestionText = stripHtml(questionContent) + ' ' + stripHtml(questionScenario || '');
  
  // 1. 연속 문자열 포함 검사
  if (containsSignificantPortion(prompt, fullQuestionText, 0.3)) {
    return { 
      isValid: false, 
      reason: '문제 내용을 직접 복사하여 사용할 수 없습니다. 자신만의 프롬프트를 작성해주세요.',
      similarity: 1.0
    };
  }
  
  // 2. 자카드 유사도 검사
  const similarity = calculateJaccardSimilarity(prompt, fullQuestionText);
  if (similarity >= 0.4) {
    return { 
      isValid: false, 
      reason: `프롬프트가 문제 내용과 너무 유사합니다 (유사도: ${Math.round(similarity * 100)}%). 자신만의 표현으로 질문해주세요.`,
      similarity
    };
  }
  
  // 3. 키워드 중복 검사
  if (hasHighKeywordOverlap(prompt, fullQuestionText, 0.6)) {
    return { 
      isValid: false, 
      reason: '문제의 핵심 키워드를 그대로 사용하지 마세요. 다른 표현으로 질문해주세요.',
      similarity: 0.6
    };
  }
  
  return { isValid: true, similarity };
}

