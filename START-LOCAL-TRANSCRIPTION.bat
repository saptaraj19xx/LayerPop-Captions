@echo off
cd /d "%~dp0local-transcription"
if not exist .venv (
  echo Creating local Python environment...
  py -3.11 -m venv .venv
  if errorlevel 1 (echo Python 3.11 was not found. Install Python 3.11 x64 and tick Add Python to PATH. & pause & exit /b 1)
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (echo Install failed. Check internet connection and Python version. & pause & exit /b 1)
echo.
echo Starting LayerPop local transcription service at http://127.0.0.1:8765
 echo First run downloads the Whisper model. This is free local processing, not a paid cloud API.
python -m uvicorn server:app --host 127.0.0.1 --port 8765
pause
