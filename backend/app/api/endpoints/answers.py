from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.answer import Answer
from app.models.exam import Exam
from app.models.user import User
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.api.endpoints.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# POST 엔드포인트 - 빈 문자열("")을 사용하여 trailing slash 없이 매칭
# FastAPI에서 ""는 루트 경로를 의미하며 /api/answers로 매칭됨
# "/"는 /api/answers/로 매칭되므로 프론트엔드 요청(/api/answers)과 불일치
@router.post("", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
async def save_answer(
    answer_data: AnswerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"💾 Saving answer for exam_id={answer_data.exam_id}, question_id={answer_data.question_id}, user_id={current_user.id}")
        logger.debug(f"Answer data type: {type(answer_data.answer_data)}, value: {answer_data.answer_data}")
        
        # answer_data 유효성 검사
        if answer_data.answer_data is None:
            logger.error("❌ answer_data is None")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Answer data cannot be None"
            )
        
        if not isinstance(answer_data.answer_data, dict):
            logger.error(f"❌ answer_data is not a dict: {type(answer_data.answer_data)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Answer data must be a dictionary"
            )
        
        # Verify exam belongs to user
        exam = db.query(Exam).filter(Exam.id == answer_data.exam_id).first()
        
        if not exam:
            logger.error(f"❌ Exam not found: exam_id={answer_data.exam_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exam not found"
            )
        
        if exam.user_id != current_user.id:
            logger.error(f"❌ Unauthorized: exam.user_id={exam.user_id}, current_user.id={current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to save answer for this exam"
            )
        
        # Check if answer already exists
        existing_answer = db.query(Answer).filter(
            Answer.exam_id == answer_data.exam_id,
            Answer.question_id == answer_data.question_id
        ).first()
        
        now = datetime.now(timezone.utc)
        
        if existing_answer:
            # Update existing answer
            logger.info(f"📝 Updating existing answer: answer_id={existing_answer.id}")
            try:
                existing_answer.answer_data = answer_data.answer_data
                existing_answer.updated_at = now
                # submitted_at이 없으면 설정
                if existing_answer.submitted_at is None:
                    existing_answer.submitted_at = now
                db.commit()
                db.refresh(existing_answer)
                logger.info(f"✅ Answer updated successfully: answer_id={existing_answer.id}")
                return existing_answer
            except Exception as e:
                logger.error(f"❌ Error updating answer: {str(e)}", exc_info=True)
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to update answer: {str(e)}"
                )
        
        # Create new answer
        logger.info(f"✨ Creating new answer")
        try:
            new_answer = Answer(
                exam_id=answer_data.exam_id,
                question_id=answer_data.question_id,
                answer_data=answer_data.answer_data,
                submitted_at=now
            )
            
            db.add(new_answer)
            db.commit()
            db.refresh(new_answer)
            logger.info(f"✅ Answer created successfully: answer_id={new_answer.id}, submitted_at={new_answer.submitted_at}")
            
            return new_answer
        except Exception as e:
            logger.error(f"❌ Error creating answer: {str(e)}", exc_info=True)
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create answer: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error saving answer: {str(e)}", exc_info=True)
        try:
            db.rollback()
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save answer: {str(e)}"
        )


# GET 엔드포인트 - 더 구체적인 경로로 변경하여 POST와 충돌 방지
@router.get("/exam/{exam_id}/question/{question_id}", response_model=AnswerResponse)
async def get_answer(
    exam_id: int,
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify exam belongs to user
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam or exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access answers for this exam"
        )
    
    answer = db.query(Answer).filter(
        Answer.exam_id == exam_id,
        Answer.question_id == question_id
    ).first()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    return answer


@router.get("/exam/{exam_id}", response_model=List[AnswerResponse])
async def get_exam_answers(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify exam belongs to user
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam or exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access answers for this exam"
        )
    
    answers = db.query(Answer).filter(Answer.exam_id == exam_id).all()
    return answers


