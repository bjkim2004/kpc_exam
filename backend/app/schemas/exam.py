from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExamBase(BaseModel):
    user_id: int


class ExamCreate(ExamBase):
    pass


class ExamStart(BaseModel):
    pass


class ExamResponse(BaseModel):
    id: int
    user_id: int
    status: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    timer_remaining: int
    score: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class ExamTimerUpdate(BaseModel):
    timer_remaining: int


