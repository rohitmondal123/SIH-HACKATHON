import json
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Project, Payment, VerificationLog, User
from ..schemas import ProjectSummary, ProjectDetail, VerificationRequest, VerificationLogOut
from ..auth import get_current_user, require_current_user

router = APIRouter(tags=["Projects"])

def _format_project_detail(p: Project) -> dict:
    anomalies = []
    explanations = []
    try:
        if p.detected_anomalies_json:
            anomalies = json.loads(p.detected_anomalies_json)
    except Exception:
        pass
    try:
        if p.explanation_json:
            explanations = json.loads(p.explanation_json)
    except Exception:
        pass

    return {
        "project_id": p.project_id,
        "project_name": p.project_name,
        "state": p.state,
        "district": p.district,
        "constituency": p.constituency,
        "mp_name": p.mp_name,
        "work_category": p.work_category,
        "implementing_agency": p.implementing_agency,
        "sanctioned_amount": p.sanctioned_amount,
        "estimated_cost": p.estimated_cost,
        "actual_expenditure": p.actual_expenditure,
        "amount_released": p.amount_released,
        "payment_count": p.payment_count,
        "project_start_date": p.project_start_date,
        "expected_completion_date": p.expected_completion_date,
        "actual_completion_date": p.actual_completion_date,
        "physical_progress": p.physical_progress,
        "financial_progress": p.financial_progress,
        "project_status": p.project_status,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "is_synthetic": p.is_synthetic,
        "risk_score": p.risk_score,
        "risk_level": p.risk_level,
        "cost_overrun_pct": p.cost_overrun_pct,
        "delay_months": p.delay_months,
        "payment_anomaly_flag": p.payment_anomaly_flag,
        "duplicate_similarity_pct": p.duplicate_similarity_pct,
        "duplicate_of_id": p.duplicate_of_id,
        "fund_utilization_pct": p.fund_utilization_pct,
        "verification_status": p.verification_status,
        "detected_anomalies": anomalies,
        "explanations": explanations,
        "recommended_action": p.recommended_action,
        "verification_notes": p.verification_notes,
        "last_verified_at": p.last_verified_at,
        "last_verified_by": p.last_verified_by,
        "payments": p.payments,
        "verification_logs": p.verification_logs
    }

@router.get("/projects", response_model=List[ProjectSummary])
def get_projects(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    work_category: Optional[str] = None,
    risk_level: Optional[str] = None,
    project_status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=250, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    query = db.query(Project)

    # Scoping filters
    if state and state != "All":
        query = query.filter(Project.state == state)
    if district and district != "All":
        query = query.filter(Project.district == district)
    if constituency and constituency != "All":
        query = query.filter(Project.constituency == constituency)
    if work_category and work_category != "All":
        query = query.filter(Project.work_category == work_category)
    if risk_level and risk_level != "All":
        query = query.filter(Project.risk_level == risk_level)
    if project_status and project_status != "All":
        query = query.filter(Project.project_status == project_status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Project.project_name.ilike(search_term)) |
            (Project.project_id.ilike(search_term)) |
            (Project.mp_name.ilike(search_term)) |
            (Project.implementing_agency.ilike(search_term))
        )

    # Order by risk score descending by default
    projects = query.order_by(Project.risk_score.desc()).offset(offset).limit(limit).all()
    return projects

@router.get("/high-risk-projects", response_model=List[ProjectSummary])
def get_high_risk_projects(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return db.query(Project).filter(Project.risk_level == "HIGH").order_by(Project.risk_score.desc()).limit(limit).all()

@router.get("/projects/{project_id}", response_model=ProjectDetail)
def get_project_by_id(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )
    return _format_project_detail(project)

@router.get("/risk/{project_id}")
def get_project_risk_breakdown(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )
    
    anomalies = []
    explanations = []
    try:
        if project.detected_anomalies_json:
            anomalies = json.loads(project.detected_anomalies_json)
    except Exception:
        pass
    try:
        if project.explanation_json:
            explanations = json.loads(project.explanation_json)
    except Exception:
        pass

    return {
        "project_id": project.project_id,
        "project_name": project.project_name,
        "risk_score": project.risk_score,
        "risk_level": project.risk_level,
        "cost_overrun_pct": project.cost_overrun_pct,
        "delay_months": project.delay_months,
        "payment_anomaly_flag": project.payment_anomaly_flag,
        "duplicate_similarity_pct": project.duplicate_similarity_pct,
        "duplicate_of_id": project.duplicate_of_id,
        "fund_utilization_pct": project.fund_utilization_pct,
        "ml_anomaly_score": project.ml_anomaly_score,
        "detected_anomalies": anomalies,
        "explanations": explanations,
        "recommended_action": project.recommended_action,
        "verification_status": project.verification_status,
        "disclaimer": "AI-generated risk indicators are not proof of fraud. Final verification and action must be performed by authorized officials."
    }

@router.post("/projects/{project_id}/verify")
def submit_human_verification(
    project_id: str,
    req: VerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user)
):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )
    
    now = datetime.datetime.utcnow()
    project.verification_status = req.status
    project.verification_notes = req.notes
    project.last_verified_at = now
    project.last_verified_by = f"{current_user.full_name} ({current_user.role})"

    log_entry = VerificationLog(
        project_id=project.project_id,
        officer_name=current_user.full_name,
        officer_role=current_user.role,
        status_assigned=req.status,
        notes=req.notes,
        timestamp=now
    )
    db.add(log_entry)
    db.commit()
    db.refresh(project)

    return {
        "message": "Human verification recorded successfully",
        "verification_status": project.verification_status,
        "last_verified_at": project.last_verified_at,
        "last_verified_by": project.last_verified_by
    }
