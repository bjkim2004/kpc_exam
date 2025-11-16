from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, Optional


class AnswerBase(BaseModel):
    exam_id: int
    question_id: int
    answer_data: Dict[str, Any]


class AnswerCreate(AnswerBase):
    pass


class AnswerResponse(AnswerBase):
    id: int
    submitted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    score: Optional[int] = None
    feedback: Optional[str] = None

    class Config:
        from_attributes = True
        # JSON 직렬화 시 None 값도 포함
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class AIUsageCreate(BaseModel):
    exam_id: int
    question_id: int
    tool_type: str
    prompt: str
    response: str
    tokens_used: int = 0


