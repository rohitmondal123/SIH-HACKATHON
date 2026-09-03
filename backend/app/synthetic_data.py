import json
import random
import datetime
from sqlalchemy.orm import Session
from .models import User, Project, Payment, Alert, VerificationLog
from .auth import get_password_hash
from .ml_engine import ai_engine

STATES_DISTRICTS = {
    "Uttar Pradesh": [
        {"district": "Varanasi", "constituency": "Varanasi", "mp": "Narendra Modi", "lat": 25.3176, "lon": 82.9739},
        {"district": "Lucknow", "constituency": "Lucknow", "mp": "Rajnath Singh", "lat": 26.8467, "lon": 80.9462},
        {"district": "Gorakhpur", "constituency": "Gorakhpur", "mp": "Ravi Kishan", "lat": 26.7606, "lon": 83.3732},
        {"district": "Prayagraj", "constituency": "Allahabad", "mp": "Ujjwal Raman Singh", "lat": 25.4358, "lon": 81.8463}
    ],
    "Maharashtra": [
        {"district": "Mumbai South", "constituency": "Mumbai South", "mp": "Arvind Sawant", "lat": 18.9388, "lon": 72.8354},
        {"district": "Pune", "constituency": "Pune", "mp": "Murlidhar Mohol", "lat": 18.5204, "lon": 73.8567},
        {"district": "Nagpur", "constituency": "Nagpur", "mp": "Nitin Gadkari", "lat": 21.1458, "lon": 79.0882},
        {"district": "Nashik", "constituency": "Nashik", "mp": "Rajabhau Waje", "lat": 19.9975, "lon": 73.7898}
    ],
    "Karnataka": [
        {"district": "Bangalore South", "constituency": "Bangalore South", "mp": "Tejasvi Surya", "lat": 12.9249, "lon": 77.5838},
        {"district": "Mysore", "constituency": "Mysore-Kodagu", "mp": "Yaduveer Wadiyar", "lat": 12.2958, "lon": 76.6394},
        {"district": "Dharwad", "constituency": "Dharwad", "mp": "Pralhad Joshi", "lat": 15.4589, "lon": 75.0078}
    ],
    "Tamil Nadu": [
        {"district": "Chennai Central", "constituency": "Chennai Central", "mp": "Dayanidhi Maran", "lat": 13.0827, "lon": 80.2707},
        {"district": "Madurai", "constituency": "Madurai", "mp": "Su. Venkatesan", "lat": 9.9252, "lon": 78.1198},
        {"district": "Coimbatore", "constituency": "Coimbatore", "mp": "Ganapathi P. Rajkumar", "lat": 11.0168, "lon": 76.9558}
    ],
    "West Bengal": [
        {"district": "Kolkata South", "constituency": "Kolkata Dakshin", "mp": "Mala Roy", "lat": 22.5180, "lon": 88.3496},
        {"district": "Darjeeling", "constituency": "Darjeeling", "mp": "Raju Bista", "lat": 27.0410, "lon": 88.2663},
        {"district": "Howrah", "constituency": "Howrah", "mp": "Prasun Banerjee", "lat": 22.5958, "lon": 88.2636}
    ],
    "Bihar": [
        {"district": "Patna", "constituency": "Patna Sahib", "mp": "Ravi Shankar Prasad", "lat": 25.5941, "lon": 85.1376},
        {"district": "Gaya", "constituency": "Gaya", "mp": "Jitan Ram Manjhi", "lat": 24.7914, "lon": 85.0002}
    ],
    "Kerala": [
        {"district": "Thiruvananthapuram", "constituency": "Thiruvananthapuram", "mp": "Shashi Tharoor", "lat": 8.5241, "lon": 76.9366},
        {"district": "Ernakulam", "constituency": "Ernakulam", "mp": "Hibi Eden", "lat": 9.9816, "lon": 76.2999}
    ],
    "Rajasthan": [
        {"district": "Jaipur", "constituency": "Jaipur", "mp": "Manju Sharma", "lat": 26.9124, "lon": 75.7873},
        {"district": "Jodhpur", "constituency": "Jodhpur", "mp": "Gajendra Singh Shekhawat", "lat": 26.2389, "lon": 73.0243}
    ],
    "Gujarat": [
        {"district": "Ahmedabad", "constituency": "Gandhinagar", "mp": "Amit Shah", "lat": 23.0225, "lon": 72.5714},
        {"district": "Surat", "constituency": "Surat", "mp": "Mukesh Dalal", "lat": 21.1702, "lon": 72.8311}
    ],
    "Odisha": [
        {"district": "Bhubaneswar", "constituency": "Bhubaneswar", "mp": "Aparajita Sarangi", "lat": 20.2961, "lon": 85.8245},
        {"district": "Cuttack", "constituency": "Cuttack", "mp": "Bhartruhari Mahtab", "lat": 20.4625, "lon": 85.8830}
    ],
    "Delhi": [
        {"district": "New Delhi", "constituency": "New Delhi", "mp": "Bansuri Swaraj", "lat": 28.6139, "lon": 77.2090},
        {"district": "East Delhi", "constituency": "East Delhi", "mp": "Harsh Malhotra", "lat": 28.6276, "lon": 77.2949}
    ]
}

CATEGORIES = [
    "Drinking Water",
    "Rural Roads & Pathways",
    "Education & School Infrastructure",
    "Health & Sanitation Facilities",
    "Community Centers & Public Halls",
    "Irrigation & Water Conservation",
    "Solar Street Lighting & Renewable Energy",
    "Sports & Youth Facilities",
    "Skill Development Centers"
]

AGENCIES = [
    "District Rural Development Agency (DRDA)",
    "Public Works Department (PWD)",
    "Zilla Parishad Engineering Cell",
    "Municipal Corporation Infrastructure Wing",
    "State Jal Sansthan",
    "Renewable Energy Development Agency (REDA)",
    "Minor Irrigation Department"
]

def generate_synthetic_projects_data() -> list[dict]:
    raw_projects = []
    
    # 1. Primary Highlight Demo Scenario (SIH Problem Statement Specific Test Case)
    demo_project = {
        "project_id": "MPLAD-2024-UP-001",
        "project_name": "Rural Road Development - Chandauli Link Sector 4",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "constituency": "Varanasi",
        "mp_name": "Narendra Modi",
        "work_category": "Rural Roads & Pathways",
        "implementing_agency": "PWD Rural Division Varanasi",
        "estimated_cost": 20.0,
        "sanctioned_amount": 20.0,
        "actual_expenditure": 31.0,
        "amount_released": 31.0,
        "payment_count": 8,
        "project_start_date": "2024-02-15",
        "expected_completion_date": "2025-01-30",
        "actual_completion_date": None,
        "physical_progress": 62.0,
        "financial_progress": 100.0,
        "project_status": "Delayed",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "is_synthetic": True,
        "verification_status": "Pending Review"
    }
    raw_projects.append(demo_project)

    # 2. Duplicate Work Demo in Varanasi (Within 2.5 km of demo project 1)
    dup_project = {
        "project_id": "MPLAD-2024-UP-088",
        "project_name": "Rural Road Development and Paving near Chandauli Sector 4",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "constituency": "Varanasi",
        "mp_name": "Narendra Modi",
        "work_category": "Rural Roads & Pathways",
        "implementing_agency": "Zilla Parishad Engineering Cell",
        "estimated_cost": 18.5,
        "sanctioned_amount": 18.5,
        "actual_expenditure": 12.0,
        "amount_released": 18.5,
        "payment_count": 4,
        "project_start_date": "2024-05-10",
        "expected_completion_date": "2025-03-20",
        "actual_completion_date": None,
        "physical_progress": 40.0,
        "financial_progress": 64.8,
        "project_status": "In Progress",
        "latitude": 25.3210,
        "longitude": 82.9785,
        "is_synthetic": True,
        "verification_status": "Pending Review"
    }
    raw_projects.append(dup_project)

    # 3. Severe Payment Front-loading Anomaly (Maharashtra)
    frontload_project = {
        "project_id": "MPLAD-2024-MH-019",
        "project_name": "Community Drinking Water RO Plant Scheme - Sector B",
        "state": "Maharashtra",
        "district": "Pune",
        "constituency": "Pune",
        "mp_name": "Murlidhar Mohol",
        "work_category": "Drinking Water",
        "implementing_agency": "State Jal Sansthan",
        "estimated_cost": 45.0,
        "sanctioned_amount": 45.0,
        "actual_expenditure": 45.0,
        "amount_released": 45.0,
        "payment_count": 1,
        "project_start_date": "2024-03-01",
        "expected_completion_date": "2025-02-15",
        "actual_completion_date": None,
        "physical_progress": 22.0,
        "financial_progress": 100.0,
        "project_status": "Delayed",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "is_synthetic": True,
        "verification_status": "Pending Review"
    }
    raw_projects.append(frontload_project)

    # 4. Stalled / Dormant Funds Anomaly (Karnataka)
    stalled_project = {
        "project_id": "MPLAD-2024-KA-044",
        "project_name": "Solar Powered Street Light Grid - Ward 14",
        "state": "Karnataka",
        "district": "Bangalore South",
        "constituency": "Bangalore South",
        "mp_name": "Tejasvi Surya",
        "work_category": "Solar Street Lighting & Renewable Energy",
        "implementing_agency": "Renewable Energy Development Agency (REDA)",
        "estimated_cost": 35.0,
        "sanctioned_amount": 35.0,
        "actual_expenditure": 2.1,
        "amount_released": 35.0,
        "payment_count": 1,
        "project_start_date": "2023-11-10",
        "expected_completion_date": "2024-08-30",
        "actual_completion_date": None,
        "physical_progress": 8.0,
        "financial_progress": 6.0,
        "project_status": "Stalled",
        "latitude": 12.9249,
        "longitude": 77.5838,
        "is_synthetic": True,
        "verification_status": "Under Audit"
    }
    raw_projects.append(stalled_project)

    # Generate ~210 additional realistic projects distributed across India
    counter = 100
    for state, dist_list in STATES_DISTRICTS.items():
        state_code = state[:2].upper()
        for dist_info in dist_list:
            # 6 to 9 projects per district
            n_proj = random.randint(7, 10)
            for i in range(n_proj):
                counter += 1
                pid = f"MPLAD-2024-{state_code}-{counter:04d}"
                category = random.choice(CATEGORIES)
                agency = random.choice(AGENCIES)
                
                # Base estimated cost between 5 and 75 Lakhs
                est_cost = round(random.uniform(8.0, 60.0), 2)
                sanctioned = est_cost
                
                # Jitter location slightly around district center (approx 1-15 km)
                lat = dist_info["lat"] + random.uniform(-0.08, 0.08)
                lon = dist_info["lon"] + random.uniform(-0.08, 0.08)
                
                # Anomaly classification distribution: 70% Normal, 20% Medium, 10% High
                dice = random.random()
                
                start_year = 2024 if random.random() > 0.3 else 2023
                start_month = random.randint(1, 10)
                start_day = random.randint(1, 28)
                start_date = f"{start_year}-{start_month:02d}-{start_day:02d}"
                
                exp_month = (start_month + random.randint(6, 12))
                exp_year = start_year + (exp_month // 12)
                exp_month = (exp_month % 12) or 12
                exp_date = f"{exp_year}-{exp_month:02d}-28"
                
                if dice < 0.70:
                    # Normal project
                    physical_prog = round(random.uniform(50.0, 100.0), 1)
                    cost_factor = random.uniform(0.75, 1.02)
                    actual_exp = round(est_cost * (physical_prog / 100.0) * cost_factor, 2)
                    released = round(min(sanctioned, actual_exp * 1.1 + 1.0), 2)
                    payment_count = max(2, int(actual_exp / 4.0))
                    status = "Completed" if physical_prog >= 95.0 else "In Progress"
                    act_date = "2025-06-15" if status == "Completed" else None
                elif dice < 0.88:
                    # Medium risk anomaly (Moderate delay or slight cost drift)
                    physical_prog = round(random.uniform(30.0, 65.0), 1)
                    cost_factor = random.uniform(1.10, 1.25)
                    actual_exp = round(est_cost * cost_factor, 2)
                    released = round(sanctioned * 1.1, 2)
                    payment_count = random.randint(4, 9)
                    status = "Delayed"
                    act_date = None
                else:
                    # High risk anomaly
                    type_high = random.choice(["severe_overrun", "severe_lag", "lump_disbursement"])
                    if type_high == "severe_overrun":
                        actual_exp = round(est_cost * random.uniform(1.40, 1.70), 2)
                        released = actual_exp
                        physical_prog = round(random.uniform(40.0, 70.0), 1)
                        payment_count = random.randint(6, 12)
                        status = "Delayed"
                    elif type_high == "severe_lag":
                        actual_exp = round(est_cost * 0.85, 2)
                        released = sanctioned
                        physical_prog = round(random.uniform(15.0, 35.0), 1)
                        payment_count = random.randint(3, 7)
                        status = "Delayed"
                    else:
                        actual_exp = round(est_cost * 0.95, 2)
                        released = sanctioned
                        physical_prog = round(random.uniform(20.0, 40.0), 1)
                        payment_count = 1
                        status = "Delayed"
                    act_date = None

                p_name_prefixes = {
                    "Drinking Water": ["Piped Drinking Water Supply Line", "Deep Tubewell Installation & Tank", "Jal Jeevan Reverse Osmosis Plant"],
                    "Rural Roads & Pathways": ["Bituminous Pavement Road", "Interlocking CC Road & Drainage", "Culvert & Connectivity Link Road"],
                    "Education & School Infrastructure": ["Smart Classroom Block & IT Lab", "Government School Boundary & Hall", "Vocational Training Wing"],
                    "Health & Sanitation Facilities": ["Primary Health Sub-Center Upgrade", "Community Sanitation & Toilet Complex", "Maternity Ward Modernization"],
                    "Community Centers & Public Halls": ["Multi-Purpose Community Bhavan", "Panchayat Conference Hall", "Ambedkar Cultural Center"],
                    "Irrigation & Water Conservation": ["Check Dam Construction & Desilting", "Rainwater Harvesting Percolation Pit", "Lift Irrigation Channel Repair"],
                    "Solar Street Lighting & Renewable Energy": ["Solar Street LED Grid Installation", "High-Mast Solar Lighting Hub", "Rooftop Solar Array for PHC"],
                    "Sports & Youth Facilities": ["Youth Sports Complex & Running Track", "Open Gymnasium & Badminton Court", "Rural Stadium Pavilion"],
                    "Skill Development Centers": ["Women Self-Help Skill Center", "Digital Literacy & CAD Center", "Rural Artisan Craft Hub"]
                }
                
                prefix = random.choice(p_name_prefixes.get(category, ["Public Asset Construction"]))
                loc_name = f"Village {dist_info['district']} Block-{random.randint(1, 8)}"
                project_name = f"{prefix} at {loc_name}"
                
                financial_prog = round((actual_exp / sanctioned) * 100.0, 1) if sanctioned > 0 else 0.0

                proj_obj = {
                    "project_id": pid,
                    "project_name": project_name,
                    "state": state,
                    "district": dist_info["district"],
                    "constituency": dist_info["constituency"],
                    "mp_name": dist_info["mp"],
                    "work_category": category,
                    "implementing_agency": agency,
                    "estimated_cost": est_cost,
                    "sanctioned_amount": sanctioned,
                    "actual_expenditure": actual_exp,
                    "amount_released": released,
                    "payment_count": payment_count,
                    "project_start_date": start_date,
                    "expected_completion_date": exp_date,
                    "actual_completion_date": act_date,
                    "physical_progress": physical_prog,
                    "financial_progress": financial_prog,
                    "project_status": status,
                    "latitude": round(lat, 5),
                    "longitude": round(lon, 5),
                    "is_synthetic": True,
                    "verification_status": "Pending Review" if dice >= 0.88 else "Verified - Legitimate" if dice < 0.4 else "Pending Review"
                }
                raw_projects.append(proj_obj)

    return raw_projects

def seed_database_if_empty(db: Session):
    """Seed users, projects, payments, and alerts if database is not initialized."""
    # Check if already seeded
    existing_users = db.query(User).count()
    if existing_users > 0:
        return

    print("[DB SEED] Seeding users...")
    demo_users = [
        User(
            email="mp@mplads.gov.in",
            hashed_password=get_password_hash("MPLADS@2026"),
            full_name="Sh. Narendra Modi, Hon'ble MP",
            role="mp",
            state="Uttar Pradesh",
            district="Varanasi",
            constituency="Varanasi"
        ),
        User(
            email="district@mplads.gov.in",
            hashed_password=get_password_hash("District@2026"),
            full_name="Dr. S. K. Sharma, IAS, District Magistrate",
            role="district_authority",
            state="Uttar Pradesh",
            district="Varanasi",
            constituency="Varanasi"
        ),
        User(
            email="state@mplads.gov.in",
            hashed_password=get_password_hash("State@2026"),
            full_name="Smt. Ananya Sen, IAS, State Nodal Officer",
            role="state_nodal",
            state="Uttar Pradesh",
            district=None,
            constituency=None
        ),
        User(
            email="admin@mplads.gov.in",
            hashed_password=get_password_hash("Admin@2026"),
            full_name="Joint Secretary, MoSPI Central Command",
            role="ministry_admin",
            state=None,
            district=None,
            constituency=None
        )
    ]
    for u in demo_users:
        db.add(u)
    db.commit()

    print("[DB SEED] Generating synthetic MPLADS projects & training ML Engine...")
    raw_projects = generate_synthetic_projects_data()
    
    # Train Isolation Forest on features
    ai_engine.train_isolation_forest(raw_projects)
    
    # Process each project through AI evaluation
    db_projects = []
    db_alerts = []
    
    for p_dict in raw_projects:
        ai_res = ai_engine.evaluate_project_risk(p_dict, raw_projects)
        
        proj_model = Project(
            project_id=p_dict["project_id"],
            project_name=p_dict["project_name"],
            state=p_dict["state"],
            district=p_dict["district"],
            constituency=p_dict["constituency"],
            mp_name=p_dict["mp_name"],
            work_category=p_dict["work_category"],
            implementing_agency=p_dict["implementing_agency"],
            sanctioned_amount=p_dict["sanctioned_amount"],
            estimated_cost=p_dict["estimated_cost"],
            actual_expenditure=p_dict["actual_expenditure"],
            amount_released=p_dict["amount_released"],
            payment_count=p_dict["payment_count"],
            project_start_date=p_dict["project_start_date"],
            expected_completion_date=p_dict["expected_completion_date"],
            actual_completion_date=p_dict.get("actual_completion_date"),
            physical_progress=p_dict["physical_progress"],
            financial_progress=p_dict["financial_progress"],
            project_status=p_dict["project_status"],
            latitude=p_dict["latitude"],
            longitude=p_dict["longitude"],
            is_synthetic=True,
            risk_score=ai_res["risk_score"],
            risk_level=ai_res["risk_level"],
            cost_overrun_pct=ai_res["cost_overrun_pct"],
            delay_months=ai_res["delay_months"],
            payment_anomaly_flag=ai_res["payment_anomaly_flag"],
            duplicate_similarity_pct=ai_res["duplicate_similarity_pct"],
            duplicate_of_id=ai_res["duplicate_of_id"],
            fund_utilization_pct=ai_res["fund_utilization_pct"],
            ml_anomaly_score=ai_res["ml_anomaly_score"],
            detected_anomalies_json=json.dumps(ai_res["detected_anomalies"]),
            explanation_json=json.dumps(ai_res["explanations"]),
            recommended_action=ai_res["recommended_action"],
            verification_status=p_dict.get("verification_status", "Pending Review")
        )
        db_projects.append(proj_model)
        
        # If High or Medium risk, create an official alert entry
        if ai_res["risk_level"] in ["HIGH", "MEDIUM"]:
            alert_type = ai_res["detected_anomalies"][0] if ai_res["detected_anomalies"] else "Risk Score Elevated"
            summary_desc = " • ".join(ai_res["explanations"][:2])
            alert_obj = Alert(
                project_id=p_dict["project_id"],
                project_name=p_dict["project_name"],
                state=p_dict["state"],
                district=p_dict["district"],
                risk_level=ai_res["risk_level"],
                risk_score=ai_res["risk_score"],
                alert_type=alert_type,
                description=summary_desc,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 30)),
                is_resolved=False
            )
            db_alerts.append(alert_obj)

    db.bulk_save_objects(db_projects)
    db.bulk_save_objects(db_alerts)
    db.commit()

    # Generate synthetic payment installments for projects
    print("[DB SEED] Generating payment installments and verification logs...")
    payments = []
    logs = []
    
    for p in db_projects:
        n_pay = p.payment_count
        tot_exp = p.actual_expenditure
        if n_pay == 1:
            payments.append(Payment(
                project_id=p.project_id,
                installment_number=1,
                amount=tot_exp,
                payment_date=p.project_start_date,
                recipient_agency=p.implementing_agency,
                payment_mode="PFMS Direct Bank Transfer",
                is_unusual=(tot_exp > 35.0 and p.physical_progress < 50.0),
                anomaly_reason="100% lump-sum disbursement disbursed prior to mid-stage verification" if (tot_exp > 35.0 and p.physical_progress < 50.0) else None
            ))
        else:
            base_amt = round(tot_exp / n_pay, 2)
            for idx in range(1, n_pay + 1):
                p_amt = base_amt if idx < n_pay else round(tot_exp - base_amt * (n_pay - 1), 2)
                payments.append(Payment(
                    project_id=p.project_id,
                    installment_number=idx,
                    amount=max(0.1, p_amt),
                    payment_date=f"2024-{(idx % 12) + 1:02d}-15",
                    recipient_agency=p.implementing_agency,
                    payment_mode="PFMS Direct Bank Transfer",
                    is_unusual=(p.payment_anomaly_flag and idx == 1),
                    anomaly_reason="Unusually heavy initial tranche release" if (p.payment_anomaly_flag and idx == 1) else None
                ))
                
        # Verification logs for demo project
        if p.project_id == "MPLAD-2024-UP-001":
            logs.append(VerificationLog(
                project_id=p.project_id,
                officer_name="Dr. S. K. Sharma, IAS",
                officer_role="District Magistrate",
                status_assigned="Under Audit",
                notes="AI flagged 55% cost overrun and 7 months delay. Ordered Joint Inspection Committee to visit site on 12-Sept.",
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=3)
            ))

    db.bulk_save_objects(payments)
    db.bulk_save_objects(logs)
    db.commit()
    print(f"[DB SEED] Successfully seeded {len(db_projects)} projects, {len(payments)} payments, and {len(db_alerts)} alerts.")
