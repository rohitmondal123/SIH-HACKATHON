from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from ..database import get_db
from ..models import Project, Alert
from ..schemas import DashboardStats, AlertOut

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_data(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if state and state != "All":
        query = query.filter(Project.state == state)
    if district and district != "All":
        query = query.filter(Project.district == district)
    if constituency and constituency != "All":
        query = query.filter(Project.constituency == constituency)

    all_projects = query.all()
    total_count = len(all_projects)

    if total_count == 0:
        return {
            "total_projects": 0,
            "total_sanctioned_lakhs": 0.0,
            "total_expenditure_lakhs": 0.0,
            "completed_projects": 0,
            "delayed_projects": 0,
            "cost_overrun_projects": 0,
            "high_risk_projects": 0,
            "medium_risk_projects": 0,
            "low_risk_projects": 0,
            "suspicious_payment_cases": 0,
            "average_fund_utilization_pct": 0.0,
            "risk_distribution": [],
            "state_breakdown": [],
            "category_breakdown": [],
            "recent_alerts": []
        }

    total_sanctioned = sum(p.sanctioned_amount for p in all_projects)
    total_expenditure = sum(p.actual_expenditure for p in all_projects)
    completed_count = sum(1 for p in all_projects if p.project_status == "Completed")
    delayed_count = sum(1 for p in all_projects if p.project_status == "Delayed" or p.delay_months > 0)
    overrun_count = sum(1 for p in all_projects if p.cost_overrun_pct > 5.0)
    high_risk_count = sum(1 for p in all_projects if p.risk_level == "HIGH")
    medium_risk_count = sum(1 for p in all_projects if p.risk_level == "MEDIUM")
    low_risk_count = sum(1 for p in all_projects if p.risk_level == "LOW")
    suspicious_payments = sum(1 for p in all_projects if p.payment_anomaly_flag)
    avg_utilization = (total_expenditure / total_sanctioned * 100.0) if total_sanctioned > 0 else 0.0

    # Risk Distribution for chart
    risk_distribution = [
        {"name": "Low Risk (0-30)", "value": low_risk_count, "color": "#10B981"},
        {"name": "Medium Risk (31-70)", "value": medium_risk_count, "color": "#F59E0B"},
        {"name": "High Risk (71-100)", "value": high_risk_count, "color": "#EF4444"}
    ]

    # State Breakdown
    state_agg = {}
    for p in all_projects:
        s = p.state
        if s not in state_agg:
            state_agg[s] = {"state": s, "total": 0, "high_risk": 0, "sanctioned": 0.0, "expenditure": 0.0}
        state_agg[s]["total"] += 1
        if p.risk_level == "HIGH":
            state_agg[s]["high_risk"] += 1
        state_agg[s]["sanctioned"] += p.sanctioned_amount
        state_agg[s]["expenditure"] += p.actual_expenditure

    state_breakdown = sorted(list(state_agg.values()), key=lambda x: x["total"], reverse=True)

    # Category Breakdown
    cat_agg = {}
    for p in all_projects:
        c = p.work_category
        if c not in cat_agg:
            cat_agg[c] = {"category": c, "count": 0, "high_risk": 0, "sanctioned": 0.0}
        cat_agg[c]["count"] += 1
        if p.risk_level == "HIGH":
            cat_agg[c]["high_risk"] += 1
        cat_agg[c]["sanctioned"] += p.sanctioned_amount

    category_breakdown = sorted(list(cat_agg.values()), key=lambda x: x["count"], reverse=True)

    # Recent Alerts
    alerts_query = db.query(Alert)
    if state and state != "All":
        alerts_query = alerts_query.filter(Alert.state == state)
    if district and district != "All":
        alerts_query = alerts_query.filter(Alert.district == district)
    recent_alerts = alerts_query.order_by(Alert.created_at.desc()).limit(8).all()

    return {
        "total_projects": total_count,
        "total_sanctioned_lakhs": round(total_sanctioned, 2),
        "total_expenditure_lakhs": round(total_expenditure, 2),
        "completed_projects": completed_count,
        "delayed_projects": delayed_count,
        "cost_overrun_projects": overrun_count,
        "high_risk_projects": high_risk_count,
        "medium_risk_projects": medium_risk_count,
        "low_risk_projects": low_risk_count,
        "suspicious_payment_cases": suspicious_payments,
        "average_fund_utilization_pct": round(avg_utilization, 1),
        "risk_distribution": risk_distribution,
        "state_breakdown": state_breakdown,
        "category_breakdown": category_breakdown,
        "recent_alerts": recent_alerts
    }
