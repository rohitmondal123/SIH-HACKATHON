import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "mp", "district_authority", "state_nodal", "ministry_admin"
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    constituency = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String, primary_key=True, index=True)
    project_name = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    constituency = Column(String, nullable=False, index=True)
    mp_name = Column(String, nullable=False)
    work_category = Column(String, nullable=False, index=True)
    implementing_agency = Column(String, nullable=False)
    
    # Financial metrics (in INR Lakhs)
    sanctioned_amount = Column(Float, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    actual_expenditure = Column(Float, nullable=False)
    amount_released = Column(Float, nullable=False)
    payment_count = Column(Integer, default=1)
    
    # Timeline
    project_start_date = Column(String, nullable=False)
    expected_completion_date = Column(String, nullable=False)
    actual_completion_date = Column(String, nullable=True)
    
    # Progress (0 - 100%)
    physical_progress = Column(Float, default=0.0)
    financial_progress = Column(Float, default=0.0)
    project_status = Column(String, default="In Progress")  # "In Progress", "Completed", "Delayed", "Stalled"
    
    # Geo Coordinates
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_synthetic = Column(Boolean, default=True)

    # AI/ML Risk Scoring & Indicators
    risk_score = Column(Float, default=0.0) # 0 to 100
    risk_level = Column(String, default="LOW") # "LOW", "MEDIUM", "HIGH"
    cost_overrun_pct = Column(Float, default=0.0)
    delay_months = Column(Float, default=0.0)
    payment_anomaly_flag = Column(Boolean, default=False)
    duplicate_similarity_pct = Column(Float, default=0.0)
    duplicate_of_id = Column(String, nullable=True)
    fund_utilization_pct = Column(Float, default=0.0)
    ml_anomaly_score = Column(Float, default=0.0) # Isolation Forest score
    
    # Explainable AI JSON fields
    detected_anomalies_json = Column(Text, default="[]")
    explanation_json = Column(Text, default="[]")
    recommended_action = Column(Text, nullable=True)
    
    # Human Verification & Governance Action
    verification_status = Column(String, default="Pending Review") # "Pending Review", "Verified - Legitimate", "Under Audit", "Notice Issued", "Resolved"
    last_verified_at = Column(DateTime, nullable=True)
    last_verified_by = Column(String, nullable=True)
    verification_notes = Column(Text, nullable=True)

    # Relationships
    payments = relationship("Payment", back_populates="project", cascade="all, delete-orphan")
    verification_logs = relationship("VerificationLog", back_populates="project", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    installment_number = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    payment_date = Column(String, nullable=False)
    recipient_agency = Column(String, nullable=False)
    payment_mode = Column(String, default="PFMS Direct Transfer")
    is_unusual = Column(Boolean, default=False)
    anomaly_reason = Column(String, nullable=True)

    project = relationship("Project", back_populates="payments")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, index=True, nullable=False)
    project_name = Column(String, nullable=False)
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    risk_level = Column(String, nullable=False, index=True) # "HIGH", "MEDIUM", "LOW"
    risk_score = Column(Float, nullable=False)
    alert_type = Column(String, nullable=False) # "Cost Overrun", "Severe Delay", "Unusual Payment", "Duplicate Work", "Fund Inefficiency", "Composite High Risk"
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=False, index=True)
    officer_name = Column(String, nullable=False)
    officer_role = Column(String, nullable=False)
    status_assigned = Column(String, nullable=False)
    notes = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="verification_logs")
