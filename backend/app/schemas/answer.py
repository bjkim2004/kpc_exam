from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any


class AnswerBase(BaseModel):
    exam_id: int
    question_id: int
    answer_data: Dict[str, Any]


class AnswerCreate(AnswerBase):
    pass


class AnswerResponse(AnswerBase):
    id: int
    submitted_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIUsageCreate(BaseModel):
    exam_id: int
    question_id: int
    tool_type: str
    prompt: str
    response: str
    tokens_used: int = 0
