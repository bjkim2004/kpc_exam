from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Union


class QuestionBase(BaseModel):
    question_number: int
    type: str
    title: str
    content: str
    points: int
    time_limit: Optional[int]


class QuestionCreate(QuestionBase):
    competency: str  # 생성 시에만 필요
    scenario: Optional[str] = None
    requirements: Optional[Union[List[str], List[Any]]] = None
    reference_materials: Optional[Union[str, Dict[str, Any]]] = None  # HTML string or JSON
    ai_options: Optional[Dict[str, Any]] = None
    options: Optional[List[Dict[str, Any]]] = None


class QuestionContentResponse(BaseModel):
    scenario: Optional[str]
    requirements: Optional[Union[List[str], List[Any]]]
    reference_materials: Optional[Union[str, Dict[str, Any]]]  # HTML string or JSON
    ai_options: Optional[Dict[str, Any]]
    options: Optional[List[Dict[str, Any]]]

    class Config:
        from_attributes = True


class QuestionResponse(QuestionBase):
    id: int
    is_active: int
    competency: Optional[str]
    question_content: Optional[QuestionContentResponse]
    is_answered: Optional[bool] = False  # 문항 풀이 여부

    class Config:
        from_attributes = True


