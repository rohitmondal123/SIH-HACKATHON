from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Project

router = APIRouter(tags=["Analytics"])

@router.get("/analytics")
def get_detailed_analytics(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    
    if not projects:
        return {"states": [], "districts": [], "categories": [], "risk_metrics": {}}

    # 1. State comparison
    state_map = {}
    for p in projects:
        s = p.state
        if s not in state_map:
            state_map[s] = {
                "state": s,
                "total_projects": 0,
                "high_risk_count": 0,
                "sanctioned_total": 0.0,
                "expenditure_total": 0.0,
                "delayed_count": 0,
                "overrun_count": 0,
                "avg_risk_score": 0.0
            }
        state_map[s]["total_projects"] += 1
        if p.risk_level == "HIGH":
            state_map[s]["high_risk_count"] += 1
        if p.project_status == "Delayed" or p.delay_months > 0:
            state_map[s]["delayed_count"] += 1
        if p.cost_overrun_pct > 5:
            state_map[s]["overrun_count"] += 1
        state_map[s]["sanctioned_total"] += p.sanctioned_amount
        state_map[s]["expenditure_total"] += p.actual_expenditure
        state_map[s]["avg_risk_score"] += p.risk_score

    state_list = []
    for s, data in state_map.items():
        cnt = data["total_projects"]
        state_list.append({
            "state": s,
            "total_projects": cnt,
            "high_risk_count": data["high_risk_count"],
            "high_risk_pct": round((data["high_risk_count"] / cnt) * 100.0, 1),
            "sanctioned_total": round(data["sanctioned_total"], 2),
            "expenditure_total": round(data["expenditure_total"], 2),
            "fund_utilization_pct": round((data["expenditure_total"] / data["sanctioned_total"] * 100.0), 1) if data["sanctioned_total"] > 0 else 0.0,
            "delayed_count": data["delayed_count"],
            "overrun_count": data["overrun_count"],
            "avg_risk_score": round(data["avg_risk_score"] / cnt, 1)
        })

    state_list = sorted(state_list, key=lambda x: x["total_projects"], reverse=True)

    # 2. District comparison
    dist_map = {}
    for p in projects:
        d = f"{p.district} ({p.state})"
        if d not in dist_map:
            dist_map[d] = {
                "district": p.district,
                "state": p.state,
                "total_projects": 0,
                "high_risk_count": 0,
                "sanctioned": 0.0,
                "expenditure": 0.0,
                "avg_risk_score": 0.0
            }
        dist_map[d]["total_projects"] += 1
        if p.risk_level == "HIGH":
            dist_map[d]["high_risk_count"] += 1
        dist_map[d]["sanctioned"] += p.sanctioned_amount
        dist_map[d]["expenditure"] += p.actual_expenditure
        dist_map[d]["avg_risk_score"] += p.risk_score

    district_list = []
    for d, data in dist_map.items():
        cnt = data["total_projects"]
        district_list.append({
            "district": data["district"],
            "state": data["state"],
            "total_projects": cnt,
            "high_risk_count": data["high_risk_count"],
            "sanctioned": round(data["sanctioned"], 2),
            "expenditure": round(data["expenditure"], 2),
            "avg_risk_score": round(data["avg_risk_score"] / cnt, 1)
        })

    district_list = sorted(district_list, key=lambda x: x["avg_risk_score"], reverse=True)

    # 3. Work Category stats
    cat_map = {}
    for p in projects:
        c = p.work_category
        if c not in cat_map:
            cat_map[c] = {
                "category": c,
                "count": 0,
                "high_risk_count": 0,
                "avg_cost_overrun": 0.0,
                "avg_delay_months": 0.0,
                "total_sanctioned": 0.0
            }
        cat_map[c]["count"] += 1
        if p.risk_level == "HIGH":
            cat_map[c]["high_risk_count"] += 1
        cat_map[c]["avg_cost_overrun"] += p.cost_overrun_pct
        cat_map[c]["avg_delay_months"] += p.delay_months
        cat_map[c]["total_sanctioned"] += p.sanctioned_amount

    category_list = []
    for c, data in cat_map.items():
        cnt = data["count"]
        category_list.append({
            "category": c,
            "count": cnt,
            "high_risk_count": data["high_risk_count"],
            "avg_cost_overrun": round(data["avg_cost_overrun"] / cnt, 1),
            "avg_delay_months": round(data["avg_delay_months"] / cnt, 1),
            "total_sanctioned": round(data["total_sanctioned"], 2)
        })

    category_list = sorted(category_list, key=lambda x: x["count"], reverse=True)

    # 4. Progress Distribution (Physical vs Financial Scatter/Buckets)
    progress_matrix = []
    for p in projects[:60]:  # sample for crisp visualization
        progress_matrix.append({
            "project_id": p.project_id,
            "name": p.project_name[:25] + "...",
            "physical": p.physical_progress,
            "financial": min(150.0, p.financial_progress),
            "risk_score": p.risk_score,
            "risk_level": p.risk_level
        })

    return {
        "states": state_list,
        "districts": district_list,
        "categories": category_list,
        "progress_matrix": progress_matrix,
        "disclaimer": "AI-generated risk indicators are not proof of fraud. Final verification and action must be performed by authorized officials."
    }
