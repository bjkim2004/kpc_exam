from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
import logging
import json

from app.core.database import get_db
from app.models.user import User
from app.models.exam import Exam
from app.models.answer import Answer
from app.models.question import Question, QuestionContent
from app.schemas.exam import ExamResponse
from app.api.endpoints.auth import get_current_user
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


class DashboardStats(BaseModel):
    total_users: int
    total_exams: int
    exams_in_progress: int
    exams_submitted: int
    exams_graded: int


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_exams = db.query(Exam).count()
    exams_in_progress = db.query(Exam).filter(Exam.status == "in_progress").count()
    exams_submitted = db.query(Exam).filter(Exam.status == "submitted").count()
    exams_graded = db.query(Exam).filter(Exam.status == "graded").count()
    
    return {
        "total_users": total_users,
        "total_exams": total_exams,
        "exams_in_progress": exams_in_progress,
        "exams_submitted": exams_submitted,
        "exams_graded": exams_graded
    }


@router.get("/users", response_model=List[dict])
async def get_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "exam_number": user.exam_number,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        for user in users
    ]


@router.get("/exams", response_model=List[ExamResponse])
async def get_all_exams_admin(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exams = db.query(Exam).all()
    return exams


class GradeRequest(BaseModel):
    score: int


@router.get("/exam/{exam_id}/details")
async def get_exam_details(
    exam_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """시험 상세 정보와 모든 답안 조회"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    # 사용자 정보
    user = db.query(User).filter(User.id == exam.user_id).first()
    
    # 모든 답안 조회 (문항 번호 순서로 정렬)
    # LEFT JOIN을 사용하여 답안이 없어도 문항 정보는 가져올 수 있도록
    answers = db.query(Answer).filter(Answer.exam_id == exam_id).all()
    
    # 답안 정보 구성
    answer_list = []
    for answer in answers:
        question = db.query(Question).filter(Question.id == answer.question_id).first()
        if not question:
            continue  # 문항이 없으면 스킵
        
        # answer_data가 None이거나 빈 딕셔너리인 경우 빈 딕셔너리로 처리
        answer_data = answer.answer_data if answer.answer_data is not None else {}
        
        # 모든 답안을 추가 (빈 답안도 포함)
        answer_list.append({
            "id": answer.id,
            "question_id": answer.question_id,
            "question_number": question.question_number,
            "question_title": question.title,
            "question_type": question.type,
            "question_points": question.points,
            "answer_content": answer_data,  # answer_data를 answer_content로 반환
            "answer_data": answer_data,  # 호환성을 위해 answer_data도 포함
            "score": answer.score,
            "feedback": answer.feedback,
            "submitted_at": answer.submitted_at.isoformat() if answer.submitted_at else None
        })
    
    # 답안을 문항 번호 순서로 정렬
    answer_list.sort(key=lambda x: x["question_number"] if x["question_number"] else 999)
    
    return {
        "exam": {
            "id": exam.id,
            "status": exam.status,
            "start_time": exam.start_time.isoformat() if exam.start_time else None,
            "end_time": exam.end_time.isoformat() if exam.end_time else None,
            "score": exam.score,
            "timer_remaining": exam.timer_remaining
        },
        "user": {
            "id": user.id if user else None,
            "email": user.email if user else None,
            "exam_number": user.exam_number if user else None
        },
        "answers": answer_list
    }


@router.post("/grade/{exam_id}")
async def grade_exam(
    exam_id: int,
    grade_data: GradeRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )
    
    exam.score = grade_data.score
    exam.status = "graded"
    db.commit()
    db.refresh(exam)
    
    return {"message": "Exam graded successfully", "exam_id": exam_id, "score": grade_data.score}


class AnswerGradeRequest(BaseModel):
    score: int
    feedback: str = ""


@router.post("/grade/answer/{answer_id}")
async def grade_answer(
    answer_id: int,
    grade_data: AnswerGradeRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """개별 답안 채점"""
    try:
        logger.info(f"📝 Grading answer: answer_id={answer_id}, score={grade_data.score}, admin_id={admin.id}")
        
        # 답안 조회
        answer = db.query(Answer).filter(Answer.id == answer_id).first()
        
        if not answer:
            logger.error(f"❌ Answer not found: answer_id={answer_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Answer not found"
            )
        
        # 점수 유효성 검사
        if grade_data.score < 0:
            logger.error(f"❌ Invalid score: {grade_data.score}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Score cannot be negative"
            )
        
        # 문항 정보 조회 (최대 점수 확인)
        question = db.query(Question).filter(Question.id == answer.question_id).first()
        if question and grade_data.score > question.points:
            logger.warn(f"⚠️ Score exceeds max points: score={grade_data.score}, max={question.points}")
            # 경고만 하고 저장은 진행 (유연성을 위해)
        
        # 답안 채점 정보 업데이트
        answer.score = grade_data.score
        answer.feedback = grade_data.feedback if grade_data.feedback else None
        db.commit()
        db.refresh(answer)
        logger.info(f"✅ Answer graded successfully: answer_id={answer_id}, score={answer.score}")
        
        # 시험 전체 점수 계산
        exam_id = answer.exam_id
        all_answers = db.query(Answer).filter(Answer.exam_id == exam_id).all()
        total_score = sum(a.score or 0 for a in all_answers)
        
        logger.info(f"📊 Total score for exam {exam_id}: {total_score}")
        
        # 시험 상태 업데이트
        exam = db.query(Exam).filter(Exam.id == exam_id).first()
        if exam:
            exam.score = total_score
            # 모든 답안이 채점되었는지 확인
            all_graded = all(a.score is not None for a in all_answers)
            if all_graded:
                exam.status = "graded"
                logger.info(f"✅ All answers graded for exam {exam_id}, status set to 'graded'")
            db.commit()
            db.refresh(exam)
        else:
            logger.warn(f"⚠️ Exam not found: exam_id={exam_id}")
        
        return {
            "message": "Answer graded successfully",
            "answer_id": answer_id,
            "score": answer.score,
            "feedback": answer.feedback,
            "total_score": total_score,
            "exam_id": exam_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error grading answer: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to grade answer: {str(e)}"
        )


class AutoGenerateQuestionRequest(BaseModel):
    question_type: str  # multiple_choice, practical, essay, etc.
    competency: str  # e.g., "역량 A: 기초 이해 및 활용"
    topic: Optional[str] = None  # Optional specific topic
    question_number: Optional[int] = None  # Optional: if not provided, will auto-increment


@router.post("/questions/auto-generate")
async def auto_generate_question(
    request: AutoGenerateQuestionRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """자동 출제 기능: Gemini를 이용하여 문제 생성"""
    try:
        logger.info(f"🤖 Auto-generating question: type={request.question_type}, competency={request.competency}")
        
        # Generate question using Gemini
        result = await ai_service.generate_question(
            question_type=request.question_type,
            competency=request.competency,
            topic=request.topic if request.topic else None
        )
        
        question_data = result["question_data"]
        
        # Determine question number
        if request.question_number:
            question_number = request.question_number
        else:
            # Auto-increment: find max question number
            max_question = db.query(Question).order_by(Question.question_number.desc()).first()
            question_number = (max_question.question_number + 1) if max_question else 1
        
        # Check if question number already exists
        existing = db.query(Question).filter(Question.question_number == question_number).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question number {question_number} already exists"
            )
        
        # Create question
        new_question = Question(
            question_number=question_number,
            type=request.question_type,
            title=question_data.get("title", f"자동 생성 문제 {question_number}"),
            content=question_data.get("content", ""),
            points=question_data.get("points", 15),
            time_limit=question_data.get("time_limit", 20),
            competency=request.competency,
            is_active=1
        )
        
        try:
            db.add(new_question)
            db.flush()  # Get the ID
            logger.info(f"✅ Question created with ID: {new_question.id}")
        except Exception as e:
            logger.error(f"❌ Error creating question: {str(e)}", exc_info=True)
            db.rollback()
            # 시퀀스 동기화 시도
            try:
                db.execute(text("SELECT setval('kpc_questions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM kpc_questions), true)"))
                db.commit()
                logger.info("✅ Sequence synchronized")
                # 재시도
                db.add(new_question)
                db.flush()
            except Exception as retry_error:
                logger.error(f"❌ Retry failed: {str(retry_error)}", exc_info=True)
                db.rollback()
                raise
        
        # Create question content with scenario, requirements, reference_materials
        # Parse requirements if it's a string
        requirements = question_data.get("requirements")
        if isinstance(requirements, str):
            try:
                requirements = json.loads(requirements)
            except (json.JSONDecodeError, TypeError):
                logger.warning(f"Failed to parse requirements as JSON, using as-is: {requirements}")
        
        # Parse reference_materials if it's a string
        reference_materials = question_data.get("reference_materials")
        if isinstance(reference_materials, str):
            try:
                reference_materials = json.loads(reference_materials)
            except (json.JSONDecodeError, TypeError):
                logger.warning(f"Failed to parse reference_materials as JSON, using as-is: {reference_materials}")
        
        # Handle options - convert string 'null' to None
        options = question_data.get("options")
        if options is None or (isinstance(options, str) and options.lower() == 'null'):
            options = None
        elif request.question_type != "multiple_choice":
            options = None
        
        # Synchronize question_content sequence before creating
        # Find the actual sequence name by querying the database
        sequence_name = None
        try:
            # Query to find the sequence name for the table
            seq_query_result = db.execute(text("""
                SELECT pg_get_serial_sequence('kpc_question_content', 'id') as seq_name
            """))
            seq_result = seq_query_result.fetchone()
            if seq_result and seq_result[0]:
                sequence_name = seq_result[0].split('.')[-1]  # Get just the sequence name
                logger.info(f"✅ Found sequence name: {sequence_name}")
            else:
                # Fallback: try common sequence names
                sequence_names = [
                    'kpc_question_content_id_seq',
                    'gl_kpc_question_content_id_seq'
                ]
                for seq_name in sequence_names:
                    try:
                        db.execute(text(f"SELECT setval('{seq_name}', 1, false)"))
                        sequence_name = seq_name
                        logger.info(f"✅ Found sequence name (fallback): {sequence_name}")
                        break
                    except:
                        continue
        except Exception as seq_error:
            logger.warning(f"⚠️ Failed to find sequence name: {str(seq_error)}")
        
        # Synchronize sequence: set to MAX(id) + 1 with is_called=false
        # This ensures nextval() will return MAX(id) + 1
        if sequence_name:
            try:
                db.execute(text(f"""
                    SELECT setval('{sequence_name}', 
                        COALESCE((SELECT MAX(id) FROM kpc_question_content), 0) + 1, 
                        false)
                """))
                logger.info(f"✅ QuestionContent sequence synchronized: {sequence_name}")
            except Exception as sync_error:
                logger.warning(f"⚠️ Failed to sync sequence {sequence_name}: {str(sync_error)}")
        
        question_content = QuestionContent(
            question_id=new_question.id,
            scenario=question_data.get("scenario"),
            requirements=requirements,
            reference_materials=reference_materials,
            options=options
        )
        
        try:
            db.add(question_content)
            db.flush()  # Flush to get the ID without committing
            logger.info(f"✅ QuestionContent created with ID: {question_content.id}")
        except Exception as e:
            logger.error(f"❌ Error creating question_content: {str(e)}", exc_info=True)
            db.rollback()
            # 시퀀스 동기화 후 재시도
            if sequence_name:
                try:
                    # Get current max ID and set sequence to max + 1
                    max_id_result = db.execute(text("SELECT COALESCE(MAX(id), 0) FROM kpc_question_content"))
                    max_id = max_id_result.scalar() or 0
                    db.execute(text(f"SELECT setval('{sequence_name}', {max_id + 1}, false)"))
                    logger.info(f"✅ QuestionContent sequence synchronized (retry): {sequence_name} -> {max_id + 1}")
                    # 재시도
                    db.add(question_content)
                    db.flush()
                    logger.info(f"✅ QuestionContent created with ID (retry): {question_content.id}")
                except Exception as retry_error:
                    logger.error(f"❌ Retry failed: {str(retry_error)}", exc_info=True)
                    db.rollback()
                    raise
            else:
                logger.error(f"❌ Cannot retry: sequence name not found")
                raise
        
        # Commit both question and question_content together
        db.commit()
        db.refresh(new_question)
        
        logger.info(f"✅ Question auto-generated successfully: question_id={new_question.id}, question_number={question_number}")
        logger.info(f"📋 Generated content - Scenario: {bool(question_content.scenario)}, Requirements: {len(question_content.requirements) if question_content.requirements else 0}, Reference Materials: {bool(question_content.reference_materials)}")
        
        return {
            "message": "Question generated successfully",
            "question_id": new_question.id,
            "question_number": question_number,
            "title": new_question.title,
            "tokens_used": result["tokens_used"],
            "has_scenario": bool(question_content.scenario),
            "has_reference_materials": bool(question_content.reference_materials),
            "requirements_count": len(question_content.requirements) if question_content.requirements else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error auto-generating question: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate question: {str(e)}"
        )


