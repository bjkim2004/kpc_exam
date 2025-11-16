from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.exam import Exam, ExamStatus
from app.models.user import User
from app.models.answer import Answer
from app.models.question import Question
from app.schemas.exam import ExamResponse, ExamStart, ExamTimerUpdate
from app.api.endpoints.auth import get_current_user

router = APIRouter()


@router.post("/start", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def start_exam(
    exam_data: ExamStart,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user already has an exam in progress
    existing_exam = db.query(Exam).filter(
        Exam.user_id == current_user.id,
        Exam.status.in_([ExamStatus.NOT_STARTED, ExamStatus.IN_PROGRESS])
    ).first()
    
    if existing_exam:
        if existing_exam.status == ExamStatus.IN_PROGRESS:
            return existing_exam
        # If not started, update it to in progress
        existing_exam.status = ExamStatus.IN_PROGRESS
        existing_exam.start_time = datetime.utcnow()
        db.commit()
        db.refresh(existing_exam)
        return existing_exam
    
    # Create new exam
    new_exam = Exam(
        user_id=current_user.id,
        status=ExamStatus.IN_PROGRESS,
        start_time=datetime.utcnow(),
        timer_remaining=7200  # 120 minutes
    )
    
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    
    return new_exam


# 더 구체적인 경로를 먼저 정의하여 라우팅 우선순위 확보
@router.get("/{exam_id}/result")
async def get_exam_result(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """시험 결과 조회 - 총점, 역량별 점수, 합격 여부 등"""
    # 시험 확인
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # 시험이 현재 사용자의 것인지 확인
    if exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this exam"
        )
    
    # 모든 답안 조회
    answers = db.query(Answer).filter(Answer.exam_id == exam_id).all()
    
    # 모든 문항 조회 (최대 점수 계산용)
    questions = db.query(Question).filter(Question.is_active == 1).all()
    
    # 총 점수 계산
    total_score = sum(answer.score or 0 for answer in answers)
    
    # 최대 점수 계산
    max_score = sum(question.points for question in questions)
    
    # 득점률 계산
    percentage = (total_score / max_score * 100) if max_score > 0 else 0
    
    # 합격 여부 (70점 이상)
    passed = total_score >= 70
    
    # 역량별 점수 계산
    competency_scores: Dict[str, Dict[str, Any]] = {}
    
    for answer in answers:
        question = db.query(Question).filter(Question.id == answer.question_id).first()
        if not question:
            continue
        
        competency = question.competency or "기타"
        score = answer.score or 0
        
        if competency not in competency_scores:
            # 해당 역량의 최대 점수 계산
            competency_questions = [q for q in questions if q.competency == competency]
            competency_max_score = sum(q.points for q in competency_questions)
            
            competency_scores[competency] = {
                "category": competency,
                "score": 0,
                "max_score": competency_max_score,
                "percentage": 0
            }
        
        competency_scores[competency]["score"] += score
    
    # 역량별 백분율 계산
    for comp in competency_scores.values():
        if comp["max_score"] > 0:
            comp["percentage"] = (comp["score"] / comp["max_score"] * 100)
    
    # 리스트로 변환
    category_scores = list(competency_scores.values())
    
    return {
        "exam_id": exam_id,
        "total_score": total_score,
        "max_score": max_score,
        "percentage": round(percentage, 1),
        "passed": passed,
        "category_scores": category_scores
    }


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # Check if the exam belongs to the current user
    if exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this exam"
        )
    
    return exam


@router.patch("/{exam_id}/timer", response_model=ExamResponse)
async def update_timer(
    exam_id: int,
    timer_data: ExamTimerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    if exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this exam"
        )
    
    exam.timer_remaining = timer_data.timer_remaining
    db.commit()
    db.refresh(exam)
    
    return exam


@router.post("/{exam_id}/submit", response_model=ExamResponse)
async def submit_exam(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    if exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to submit this exam"
        )
    
    if exam.status == ExamStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam already submitted"
        )
    
    exam.status = ExamStatus.SUBMITTED
    exam.end_time = datetime.utcnow()
    db.commit()
    db.refresh(exam)
    
    return exam


@router.get("/", response_model=List[ExamResponse])
async def get_all_exams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exams = db.query(Exam).filter(Exam.user_id == current_user.id).all()
    return exams


