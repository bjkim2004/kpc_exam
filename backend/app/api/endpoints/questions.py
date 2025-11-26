from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models.question import Question, QuestionContent
from app.models.user import User
from app.schemas.question import QuestionResponse, QuestionCreate
from app.api.endpoints.auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[QuestionResponse])
async def get_all_questions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    include_inactive: bool = False
):
    # 관리자는 비활성 문제도 볼 수 있음
    # question_content를 함께 로드
    if include_inactive or current_user.role == "admin":
        questions = db.query(Question).options(joinedload(Question.question_content)).order_by(Question.question_number).all()
    else:
        questions = db.query(Question).options(joinedload(Question.question_content)).filter(Question.is_active == 1).order_by(Question.question_number).all()
    
    # 각 문항에 대해 is_answered는 항상 false로 반환
    # 프론트엔드에서 현재 시험의 저장된 답변만 확인하여 업데이트
    question_responses = []
    for question in questions:
        question_dict = {
            "id": question.id,
            "question_number": question.question_number,
            "type": question.type,
            "title": question.title,
            "content": question.content,
            "points": question.points,
            "time_limit": question.time_limit,
            "is_active": question.is_active,
            "competency": question.competency,
            "question_content": question.question_content,
            "is_answered": False  # 항상 false로 반환, 프론트엔드에서 현재 시험 기준으로 업데이트
        }
        
        question_responses.append(QuestionResponse(**question_dict))
    
    return question_responses


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).options(joinedload(Question.question_content)).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return question


@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create questions"
        )
    
    # Check if question number already exists
    existing_question = db.query(Question).filter(
        Question.question_number == question_data.question_number
    ).first()
    
    if existing_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question number already exists"
        )
    
    # Create question
    new_question = Question(
        question_number=question_data.question_number,
        type=question_data.type,
        title=question_data.title,
        content=question_data.content,
        points=question_data.points,
        time_limit=question_data.time_limit,
        competency=question_data.competency
    )
    
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    # Create question content
    question_content = QuestionContent(
        question_id=new_question.id,
        scenario=question_data.scenario,
        requirements=question_data.requirements,
        reference_materials=question_data.reference_materials,
        ai_options=question_data.ai_options,
        options=question_data.options
    )
    
    db.add(question_content)
    db.commit()
    db.refresh(new_question)
    
    return new_question


class QuestionUpdate(QuestionCreate):
    is_active: int = 1


@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update questions"
        )
    
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    print(f"Updating question {question_id}")
    print(f"Received content: {question_data.content}")
    print(f"Before update - Question content: {question.content}")
    
    # Update question
    question.question_number = question_data.question_number
    question.type = question_data.type
    question.title = question_data.title
    question.content = question_data.content
    question.points = question_data.points
    question.time_limit = question_data.time_limit
    question.competency = question_data.competency
    question.is_active = question_data.is_active
    
    print(f"After update - Question content: {question.content}")
    
    # Update question content
    if question.question_content:
        question.question_content.scenario = question_data.scenario
        question.question_content.requirements = question_data.requirements
        question.question_content.reference_materials = question_data.reference_materials
        question.question_content.ai_options = question_data.ai_options
        question.question_content.options = question_data.options
    else:
        # Create question content if it doesn't exist
        question_content = QuestionContent(
            question_id=question.id,
            scenario=question_data.scenario,
            requirements=question_data.requirements,
            reference_materials=question_data.reference_materials,
            ai_options=question_data.ai_options,
            options=question_data.options
        )
        db.add(question_content)
    
    # Commit changes
    try:
        db.commit()
        db.refresh(question)
        print(f"Successfully committed. Final content: {question.content}")
    except Exception as e:
        db.rollback()
        print(f"Commit failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update question: {str(e)}"
        )
    
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete questions"
        )
    
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Soft delete
    question.is_active = 0
    db.commit()
    
    return None


