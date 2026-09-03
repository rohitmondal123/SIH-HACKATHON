from typing import Optional, List, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- Payment Schemas ---
class PaymentOut(BaseModel):
    id: int
    project_id: str
    installment_number: int
    amount: float
    payment_date: str
    recipient_agency: str
    payment_mode: str
    is_unusual: bool
    anomaly_reason: Optional[str] = None

    class Config:
        from_attributes = True

# --- Verification Schemas ---
class VerificationRequest(BaseModel):
    status: str
    notes: str

class VerificationLogOut(BaseModel):
    id: int
    project_id: str
    officer_name: str
    officer_role: str
    status_assigned: str
    notes: str
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectSummary(BaseModel):
    project_id: str
    project_name: str
    state: str
    district: str
    constituency: str
    mp_name: str
    work_category: str
    implementing_agency: str
    sanctioned_amount: float
    estimated_cost: float
    actual_expenditure: float
    amount_released: float
    payment_count: int
    project_start_date: str
    expected_completion_date: str
    actual_completion_date: Optional[str] = None
    physical_progress: float
    financial_progress: float
    project_status: str
    latitude: float
    longitude: float
    is_synthetic: bool
    risk_score: float
    risk_level: str
    cost_overrun_pct: float
    delay_months: float
    payment_anomaly_flag: bool
    duplicate_similarity_pct: float
    duplicate_of_id: Optional[str] = None
    fund_utilization_pct: float
    verification_status: str

    class Config:
        from_attributes = True

class ProjectDetail(ProjectSummary):
    detected_anomalies: List[str] = []
    explanations: List[str] = []
    recommended_action: Optional[str] = None
    verification_notes: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    last_verified_by: Optional[str] = None
    payments: List[PaymentOut] = []
    verification_logs: List[VerificationLogOut] = []

    class Config:
        from_attributes = True

class ProjectFilterParams(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    work_category: Optional[str] = None
    risk_level: Optional[str] = None
    project_status: Optional[str] = None
    search: Optional[str] = None
    limit: int = 100
    offset: int = 0

# --- Alert Schemas ---
class AlertOut(BaseModel):
    id: int
    project_id: str
    project_name: str
    state: str
    district: str
    risk_level: str
    risk_score: float
    alert_type: str
    description: str
    created_at: datetime
    is_resolved: bool
    resolution_notes: Optional[str] = None

    class Config:
        from_attributes = True

# --- Dashboard & Analytics Schemas ---
class DashboardStats(BaseModel):
    total_projects: int
    total_sanctioned_lakhs: float
    total_expenditure_lakhs: float
    completed_projects: int
    delayed_projects: int
    cost_overrun_projects: int
    high_risk_projects: int
    medium_risk_projects: int
    low_risk_projects: int
    suspicious_payment_cases: int
    average_fund_utilization_pct: float
    risk_distribution: List[dict]
    state_breakdown: List[dict]
    category_breakdown: List[dict]
    recent_alerts: List[AlertOut]

# --- AI Sandbox / Custom Analysis Schemas ---
class AnalyzeRequest(BaseModel):
    project_name: str
    work_category: str
    estimated_cost: float
    sanctioned_amount: float
    actual_expenditure: float
    amount_released: float
    payment_count: int
    project_start_date: str
    expected_completion_date: str
    physical_progress: float
    financial_progress: Optional[float] = None
    state: Optional[str] = "Uttar Pradesh"
    district: Optional[str] = "Varanasi"

class AnalyzeResponse(BaseModel):
    risk_score: float
    risk_level: str
    cost_overrun_pct: float
    delay_months: float
    payment_anomaly_flag: bool
    fund_utilization_pct: float
    ml_anomaly_score: float
    detected_anomalies: List[str]
    explanations: List[str]
    recommended_action: str
    disclaimer: str = "AI-generated risk indicators are not proof of fraud. Final verification and action must be performed by authorized officials."
