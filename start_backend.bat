@echo off
echo ========================================================
echo Starting MPLADS AI Monitor Backend (FastAPI + ML Engine)
echo ========================================================
cd /d "%~dp0"
.\venv\Scripts\python backend/run.py
pause
