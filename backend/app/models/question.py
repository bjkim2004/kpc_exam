from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class QuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    PROMPT_DESIGN = "prompt_design"
    FACT_CHECKING = "fact_checking"
    ETHICAL_REVIEW = "ethical_review"
    COMPREHENSION = "comprehension"
    APPLICATION = "application"
    CRITICAL_ANALYSIS = "critical_analysis"
    CASE_STUDY = "case_study"
    ESSAY = "essay"
    PRACTICAL = "practical"


class Question(Base):
    __tablename__ = "kpc_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_number = Column(Integer, unique=True, nullable=False, index=True)
    type = Column(Enum(QuestionType, name='kpc_question_type', create_type=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    points = Column(Integer, nullable=False)
    time_limit = Column(Integer, nullable=True)  # in minutes
    competency = Column(String, nullable=False)  # e.g., "역량 A: 기초 이해 및 활용"
    is_active = Column(Integer, default=1)

    # Relationships
    question_content = relationship("QuestionContent", back_populates="question", uselist=False)


class QuestionContent(Base):
    __tablename__ = "kpc_question_content"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("kpc_questions.id"), unique=True, nullable=False)
    scenario = Column(Text, nullable=True)
    requirements = Column(JSON, nullable=True)  # List of requirements
    reference_materials = Column(JSON, nullable=True)  # Reference materials data
    ai_options = Column(JSON, nullable=True)  # AI tool configurations
    options = Column(JSON, nullable=True)  # For multiple choice questions
    
    # Relationships
    question = relationship("Question", back_populates="question_content")


