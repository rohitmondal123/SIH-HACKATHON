from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Alert
from ..schemas import AlertOut

router = APIRouter(tags=["Alerts"])

@router.get("/alerts", response_model=List[AlertOut])
def get_alerts(
    risk_level: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    alert_type: Optional[str] = None,
    is_resolved: Optional[bool] = None,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)

    if risk_level and risk_level != "All":
        query = query.filter(Alert.risk_level == risk_level)
    if state and state != "All":
        query = query.filter(Alert.state == state)
    if district and district != "All":
        query = query.filter(Alert.district == district)
    if alert_type and alert_type != "All":
        query = query.filter(Alert.alert_type == alert_type)
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)

    return query.order_by(Alert.risk_score.desc(), Alert.created_at.desc()).limit(limit).all()

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    resolution_notes: str = Query(default="Verified and resolved by field officer"),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found"
        )
    alert.is_resolved = True
    alert.resolution_notes = resolution_notes
    db.commit()
    return {"message": "Alert marked as resolved", "alert_id": alert_id}
