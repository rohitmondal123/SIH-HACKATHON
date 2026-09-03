from fastapi import APIRouter
from ..schemas import AnalyzeRequest, AnalyzeResponse
from ..ml_engine import ai_engine

router = APIRouter(tags=["AI Simulation & Sandbox"])

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_custom_project(req: AnalyzeRequest):
    """
    Real-time AI/ML analysis on user-provided or simulated project parameters.
    Returns composite risk score (0-100), detected anomaly tags, quantitative explanations,
    and official recommended verification actions.
    """
    proj_dict = {
        "project_id": "SIM-SANDBOX-001",
        "project_name": req.project_name,
        "work_category": req.work_category,
        "estimated_cost": req.estimated_cost,
        "sanctioned_amount": req.sanctioned_amount,
        "actual_expenditure": req.actual_expenditure,
        "amount_released": req.amount_released,
        "payment_count": req.payment_count,
        "project_start_date": req.project_start_date,
        "expected_completion_date": req.expected_completion_date,
        "physical_progress": req.physical_progress,
        "financial_progress": req.financial_progress or (round((req.actual_expenditure / req.sanctioned_amount) * 100.0, 1) if req.sanctioned_amount > 0 else 0.0),
        "latitude": 25.3176,
        "longitude": 82.9739,
        "state": req.state or "Uttar Pradesh",
        "district": req.district or "Varanasi"
    }

    ai_result = ai_engine.evaluate_project_risk(proj_dict)

    return AnalyzeResponse(
        risk_score=ai_result["risk_score"],
        risk_level=ai_result["risk_level"],
        cost_overrun_pct=ai_result["cost_overrun_pct"],
        delay_months=ai_result["delay_months"],
        payment_anomaly_flag=ai_result["payment_anomaly_flag"],
        fund_utilization_pct=ai_result["fund_utilization_pct"],
        ml_anomaly_score=ai_result["ml_anomaly_score"],
        detected_anomalies=ai_result["detected_anomalies"],
        explanations=ai_result["explanations"],
        recommended_action=ai_result["recommended_action"]
    )
