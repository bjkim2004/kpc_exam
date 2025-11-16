from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Answer(Base):
    __tablename__ = "kpc_answers"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("kpc_exams.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("kpc_questions.id"), nullable=False)
    answer_data = Column(JSON, nullable=False)  # Stores the answer in JSON format
    score = Column(Integer, nullable=True)  # 채점 점수
    feedback = Column(Text, nullable=True)  # 채점 피드백
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    exam = relationship("Exam", back_populates="answers")


class AIUsage(Base):
    __tablename__ = "kpc_ai_usage"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("kpc_exams.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("kpc_questions.id"), nullable=False)
    tool_type = Column(String, nullable=False)  # 'chatgpt' or 'claude'
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    tokens_used = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    exam = relationship("Exam", back_populates="ai_usage")


