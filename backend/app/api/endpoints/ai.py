from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List

from app.core.database import get_db
from app.core.config import settings
from app.models.exam import Exam
from app.models.answer import AIUsage
from app.models.user import User
from app.services.ai_service import ai_service
from app.api.endpoints.auth import get_current_user

router = APIRouter()


class AIRequest(BaseModel):
    exam_id: int
    question_id: int
    prompt: str
    provider: str = None  # Optional: openai, anthropic, gemini
    context: Dict[str, Any] = {}


class AIResponse(BaseModel):
    response: str
    tokens_used: int
    remaining_uses: int


class FactCheckRequest(BaseModel):
    exam_id: int
    question_id: int
    claim: str
    sources: List[str] = []


@router.post("/chatgpt", response_model=AIResponse)
async def chat_gpt(
    request: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify exam belongs to user
    exam = db.query(Exam).filter(Exam.id == request.exam_id).first()
    if not exam or exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use AI for this exam"
        )
    
    # Check usage limit
    usage_count = db.query(AIUsage).filter(
        AIUsage.exam_id == request.exam_id,
        AIUsage.question_id == request.question_id
    ).count()
    
    if usage_count >= settings.AI_USAGE_LIMIT_PER_QUESTION:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"AI usage limit reached for this question ({settings.AI_USAGE_LIMIT_PER_QUESTION} uses)"
        )
    
    try:
        # Call ChatGPT
        result = await ai_service.chat_gpt(request.prompt, request.context)
        
        # Log usage
        ai_usage = AIUsage(
            exam_id=request.exam_id,
            question_id=request.question_id,
            tool_type="chatgpt",
            prompt=request.prompt,
            response=result["response"],
            tokens_used=result["tokens_used"]
        )
        db.add(ai_usage)
        db.commit()
        
        remaining_uses = settings.AI_USAGE_LIMIT_PER_QUESTION - (usage_count + 1)
        
        return {
            "response": result["response"],
            "tokens_used": result["tokens_used"],
            "remaining_uses": remaining_uses
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/claude", response_model=AIResponse)
async def claude(
    request: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify exam belongs to user
    exam = db.query(Exam).filter(Exam.id == request.exam_id).first()
    if not exam or exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use AI for this exam"
        )
    
    # Check usage limit
    usage_count = db.query(AIUsage).filter(
        AIUsage.exam_id == request.exam_id,
        AIUsage.question_id == request.question_id
    ).count()
    
    if usage_count >= settings.AI_USAGE_LIMIT_PER_QUESTION:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"AI usage limit reached for this question ({settings.AI_USAGE_LIMIT_PER_QUESTION} uses)"
        )
    
    try:
        # Call Claude
        result = await ai_service.claude(request.prompt, request.context)
        
        # Log usage
        ai_usage = AIUsage(
            exam_id=request.exam_id,
            question_id=request.question_id,
            tool_type="claude",
            prompt=request.prompt,
            response=result["response"],
            tokens_used=result["tokens_used"]
        )
        db.add(ai_usage)
        db.commit()
        
        remaining_uses = settings.AI_USAGE_LIMIT_PER_QUESTION - (usage_count + 1)
        
        return {
            "response": result["response"],
            "tokens_used": result["tokens_used"],
            "remaining_uses": remaining_uses
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/gemini", response_model=AIResponse)
async def gemini(
    request: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify exam belongs to user
    exam = db.query(Exam).filter(Exam.id == request.exam_id).first()
    if not exam or exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use AI for this exam"
        )
    
    # Check usage limit
    usage_count = db.query(AIUsage).filter(
        AIUsage.exam_id == request.exam_id,
        AIUsage.question_id == request.question_id
    ).count()
    
    if usage_count >= settings.AI_USAGE_LIMIT_PER_QUESTION:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"AI usage limit reached for this question ({settings.AI_USAGE_LIMIT_PER_QUESTION} uses)"
        )
    
    try:
        # Call Gemini
        result = await ai_service.gemini(request.prompt, request.context)
        
        # Log usage
        ai_usage = AIUsage(
            exam_id=request.exam_id,
            question_id=request.question_id,
            tool_type="gemini",
            prompt=request.prompt,
            response=result["response"],
            tokens_used=result["tokens_used"]
        )
        db.add(ai_usage)
        db.commit()
        
        remaining_uses = settings.AI_USAGE_LIMIT_PER_QUESTION - (usage_count + 1)
        
        return {
            "response": result["response"],
            "tokens_used": result["tokens_used"],
            "remaining_uses": remaining_uses
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/generate", response_model=AIResponse)
async def generate(
    request: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate response using the default AI provider or specified provider
    """
    # Verify exam belongs to user
    exam = db.query(Exam).filter(Exam.id == request.exam_id).first()
    if not exam or exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use AI for this exam"
        )
    
    # Check usage limit
    usage_count = db.query(AIUsage).filter(
        AIUsage.exam_id == request.exam_id,
        AIUsage.question_id == request.question_id
    ).count()
    
    if usage_count >= settings.AI_USAGE_LIMIT_PER_QUESTION:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"AI usage limit reached for this question ({settings.AI_USAGE_LIMIT_PER_QUESTION} uses)"
        )
    
    try:
        # Use specified provider or default
        result = await ai_service.generate(request.prompt, request.provider, request.context)
        
        # Determine tool_type
        tool_type = request.provider or settings.DEFAULT_AI_PROVIDER
        
        # Log usage
        ai_usage = AIUsage(
            exam_id=request.exam_id,
            question_id=request.question_id,
            tool_type=tool_type,
            prompt=request.prompt,
            response=result["response"],
            tokens_used=result["tokens_used"]
        )
        db.add(ai_usage)
        db.commit()
        
        remaining_uses = settings.AI_USAGE_LIMIT_PER_QUESTION - (usage_count + 1)
        
        return {
            "response": result["response"],
            "tokens_used": result["tokens_used"],
            "remaining_uses": remaining_uses
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/verify", response_model=Dict[str, Any])
async def verify_fact(
    request: FactCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify exam belongs to user
    exam = db.query(Exam).filter(Exam.id == request.exam_id).first()
    if not exam or exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use AI for this exam"
        )
    
    try:
        result = await ai_service.fact_check(request.claim, request.sources)
        
        # Log usage
        ai_usage = AIUsage(
            exam_id=request.exam_id,
            question_id=request.question_id,
            tool_type="fact_check",
            prompt=f"Fact check: {request.claim}",
            response=result["verification"],
            tokens_used=result["tokens_used"]
        )
        db.add(ai_usage)
        db.commit()
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fact checking error: {str(e)}"
        )


@router.get("/usage/{exam_id}")
async def get_ai_usage(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify exam belongs to user
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam or exam.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view AI usage for this exam"
        )
    
    usage_records = db.query(AIUsage).filter(AIUsage.exam_id == exam_id).all()
    
    # Group by question
    usage_by_question = {}
    for record in usage_records:
        if record.question_id not in usage_by_question:
            usage_by_question[record.question_id] = []
        usage_by_question[record.question_id].append({
            "tool_type": record.tool_type,
            "timestamp": record.timestamp.isoformat(),
            "tokens_used": record.tokens_used
        })
    
    return usage_by_question


