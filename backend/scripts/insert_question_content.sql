-- 문항 1: 객관식 - Self-Attention 개념
-- question_id는 실제 DB의 id 값으로 조회 후 사용해야 함
-- 여기서는 question_number로 조인하여 처리

-- 문항 1, 2: 객관식 답안 및 정답 정보 (JSON 형식)
UPDATE kpc_questions SET content = content || '

<div style="margin-top:20px;padding:15px;background:#d4edda;border-left:4px solid #28a745;">
<strong>💡 Tip:</strong> Self-Attention의 핵심은 "모든 토큰 간의 관계"를 동시에 계산한다는 점입니다.
</div>'
WHERE question_number = 1;

-- 문항 2 팁 추가
UPDATE kpc_questions SET content = content || '

<div style="margin-top:20px;padding:15px;background:#fff3cd;border-left:4px solid:#ffc107;">
<strong>⚠️ 주의:</strong> 각 AI 도구의 핵심 기능과 한계를 정확히 이해해야 합니다.
</div>'
WHERE question_number = 2;

-- 배점 확인 쿼리
SELECT 
  competency,
  COUNT(*) as question_count,
  SUM(points) as total_points
FROM kpc_questions
GROUP BY competency
ORDER BY competency;

-- 문항 유형별 통계
SELECT 
  type,
  COUNT(*) as count,
  SUM(points) as total_points
FROM kpc_questions
GROUP BY type
ORDER BY type;

-- 전체 문항 요약
SELECT 
  question_number,
  type,
  title,
  points,
  time_limit,
  LEFT(competency, 30) as competency
FROM kpc_questions
ORDER BY question_number;






