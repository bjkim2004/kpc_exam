"""Rename tables from gl_kpc_* to kpc_*

Revision ID: rename_tables_kpc
Revises: 
Create Date: 2025-11-14 09:35:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'rename_tables_kpc'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Rename ENUM types
    op.execute("ALTER TYPE gl_kpc_user_role RENAME TO kpc_user_role")
    op.execute("ALTER TYPE gl_kpc_exam_status RENAME TO kpc_exam_status")
    op.execute("ALTER TYPE gl_kpc_question_type RENAME TO kpc_question_type")
    
    # Rename tables
    op.rename_table('gl_kpc_users', 'kpc_users')
    op.rename_table('gl_kpc_admin_users', 'kpc_admin_users')
    op.rename_table('gl_kpc_exams', 'kpc_exams')
    op.rename_table('gl_kpc_questions', 'kpc_questions')
    op.rename_table('gl_kpc_question_content', 'kpc_question_content')
    op.rename_table('gl_kpc_answers', 'kpc_answers')
    op.rename_table('gl_kpc_ai_usage', 'kpc_ai_usage')


def downgrade():
    # Rename tables back
    op.rename_table('kpc_users', 'gl_kpc_users')
    op.rename_table('kpc_admin_users', 'gl_kpc_admin_users')
    op.rename_table('kpc_exams', 'gl_kpc_exams')
    op.rename_table('kpc_questions', 'gl_kpc_questions')
    op.rename_table('kpc_question_content', 'gl_kpc_question_content')
    op.rename_table('kpc_answers', 'gl_kpc_answers')
    op.rename_table('kpc_ai_usage', 'gl_kpc_ai_usage')
    
    # Rename ENUM types back
    op.execute("ALTER TYPE kpc_user_role RENAME TO gl_kpc_user_role")
    op.execute("ALTER TYPE kpc_exam_status RENAME TO gl_kpc_exam_status")
    op.execute("ALTER TYPE kpc_question_type RENAME TO gl_kpc_question_type")



