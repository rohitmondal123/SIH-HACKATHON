# MPLADS AI Monitor (SIH26102)

**AI-Powered Supervisory & Analytics Platform to Detect Anomalies, Inefficiencies, and Fraud Indicators in MPLAD Scheme Implementation**

Developed for the **Smart India Hackathon (SIH 2026)** — Problem Statement **SIH26102** (Ministry of Statistics and Programme Implementation - MoSPI).

---

## 🏛️ Core Philosophy & Statutory Compliance

> **Important Safety & Compliance Notice:**
> *"AI-generated risk indicators are not proof of fraud. Final verification and action must be performed by authorized officials."*

The system computes a multi-dimensional **Risk Score (0–100)**, generates **explainable diagnostic rationale**, and recommends statutory verification actions for authorized field authorities.

---

## 🚀 Key Features & Modules

1. **Multi-Vector AI Anomaly Detection Core**:
   - **Cost Overrun Detection**: Quantifies expenditure deviation beyond estimated & sanctioned baselines.
   - **Project Delay & Execution Deficit**: Discrepancy between elapsed timeline and physical completion percentage.
   - **Unusual Payment Pattern Analysis**: Flags front-loaded disbursements, tranche fragmentation, and unearned releases.
   - **Spatial Duplicate Work Detection**: TF-IDF text similarity + Haversine geospatial proximity (<5km radius) to uncover overlapping works.
   - **Fund Utilization Analysis**: Detects dormant/stalled fund releases and over-utilization anomalies.
   - **Isolation Forest ML Model**: Unsupervised multi-variate anomaly scoring on multi-dimensional feature vectors.
   - **Composite Risk Synthesis (0–100)**: Transparent risk categorization (0–30 Low, 31–70 Medium, 71–100 High).

2. **Explainable AI (XAI)**:
   - "Why is this project high-risk?" quantitative evidence and breakdown bars.
   - Prescribed official verification protocols (e.g. joint site visit, Measurement Book (MB) audit, vendor invoice scrutiny).

3. **Human Verification & Governance Audit Trail**:
   - Authorized officials submit field inspection logs, assign statuses (*"Verified - Legitimate"*, *"Under Audit"*, *"Notice Issued"*), and record timestamped audit entries.

4. **Role-Based Access Control (RBAC) & 4 Statutory User Personas**:
   - **Member of Parliament (MP)**: Constituency-centric progress & alert tracking.
   - **District Authority (DM / Collector)**: District expenditure velocity, contractor triage, field verification notes.
   - **State Nodal Authority**: Statewide aggregation, inter-district benchmarking, and regional risk hotspots.
   - **Ministry / Admin (MoSPI)**: Nationwide multi-state statistics, model calibration, and policy oversight.

5. **Interactive Geospatial Risk Map (React-Leaflet)**:
   - Color-coded project markers (Green=Low, Orange=Medium, Red=High with pulse animations).
   - Quick zoom hubs (Varanasi Demo Hub, Mumbai, Bangalore, Kolkata, Chennai, Delhi NCR).

6. **Interactive AI Anomaly Simulation Sandbox**:
   - Live simulator where users/judges can modify parameters (costs, progress, delay, tranches) and watch the backend AI engine compute the risk score in real-time.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, React-Leaflet, Leaflet, Axios |
| **Backend** | Python 3.13, FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic v2 |
| **AI / ML** | Scikit-Learn (Isolation Forest, TF-IDF), Pandas, NumPy, Haversine spatial models |
| **Auth & Security** | JWT (JSON Web Tokens), Bcrypt password hashing, Role-Based Access Control |
| **Database** | SQLite (out-of-the-box zero setup) / PostgreSQL compatible |

---

## 🏃 Getting Started & Running the Application

### 1. Start the Backend API Server
```powershell
# In the root directory (using the virtual environment):
.\venv\Scripts\python backend/run.py
```
*Backend runs on `http://localhost:8000` (Swagger interactive docs at `http://localhost:8000/docs`).*

### 2. Start the React Frontend
```powershell
cd frontend
cmd /c npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 👥 Default Demo User Credentials

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Ministry / Admin (MoSPI)** | `admin@mplads.gov.in` | `Admin@2026` | Nationwide All States & UTs |
| **State Nodal Authority** | `state@mplads.gov.in` | `State@2026` | Uttar Pradesh (All Districts) |
| **District Authority (DM)** | `district@mplads.gov.in` | `District@2026` | Varanasi District |
| **Hon'ble MP** | `mp@mplads.gov.in` | `MPLADS@2026` | Varanasi Constituency |

*(Note: The navbar features an instant 1-click **Demo Persona Switcher** dropdown for quick evaluation without manual relogin).*

---

## 🎯 Important Benchmark Demo Scenario

The application includes the SIH test case:
- **Project Name**: *Rural Road Development - Chandauli Link Sector 4*
- **Project ID**: `MPLAD-2024-UP-001`
- **Estimated Cost**: ₹20.00 Lakh
- **Actual Expenditure**: ₹31.00 Lakh (+55% Cost Overrun)
- **Physical Progress**: 62% (Expected: 100%)
- **Timeline Delay**: 7+ Months
- **AI Risk Score**: **89/100 (HIGH RISK)**
- **Detected Indicators**: Severe Cost Overrun, Critical Project Delay, Similar Nearby Works
- **Recommended Action**: *"Initiate immediate on-site field verification by District Planning Officer. Audit vendor invoices, physical construction measurement book (MB), and verify expenditure ledger against sanctioned estimates."*
