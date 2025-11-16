from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ExamStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class Exam(Base):
    __tablename__ = "kpc_exams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("kpc_users.id"), nullable=False)
    status = Column(Enum(ExamStatus, name='kpc_exam_status', create_type=False, values_callable=lambda x: [e.value for e in x]), default=ExamStatus.NOT_STARTED, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    timer_remaining = Column(Integer, default=7200)  # 120 minutes in seconds
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="exams")
    answers = relationship("Answer", back_populates="exam", foreign_keys="[Answer.exam_id]")
    ai_usage = relationship("AIUsage", back_populates="exam", foreign_keys="[AIUsage.exam_id]")


