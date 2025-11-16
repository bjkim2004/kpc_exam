-- 로컬 데이터베이스 테이블명 변경 스크립트
-- 실행 방법: psql -U postgres -d your_database_name -f rename_tables_local.sql

-- 1. ENUM 타입 이름 변경
ALTER TYPE gl_kpc_user_role RENAME TO kpc_user_role;
ALTER TYPE gl_kpc_exam_status RENAME TO kpc_exam_status;
ALTER TYPE gl_kpc_question_type RENAME TO kpc_question_type;

-- 2. 테이블 이름 변경
ALTER TABLE gl_kpc_users RENAME TO kpc_users;
ALTER TABLE gl_kpc_admin_users RENAME TO kpc_admin_users;
ALTER TABLE gl_kpc_exams RENAME TO kpc_exams;
ALTER TABLE gl_kpc_questions RENAME TO kpc_questions;
ALTER TABLE gl_kpc_question_content RENAME TO kpc_question_content;
ALTER TABLE gl_kpc_answers RENAME TO kpc_answers;
ALTER TABLE gl_kpc_ai_usage RENAME TO kpc_ai_usage;

-- 완료 메시지
SELECT 'Tables renamed successfully from gl_kpc_* to kpc_*' AS status;



