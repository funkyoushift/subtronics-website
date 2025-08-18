@echo off
REM One-click updater for Micro Center bundles
SETLOCAL ENABLEDELAYEDEXPANSION
cd /d %~dp0
cd ..
echo Running Sync Bundles (AMD + Intel)...
python tools\sync_bundles.py
IF %ERRORLEVEL% NEQ 0 (
  echo.
  echo Sync failed. If "python" is not found, try:
  echo   py tools\sync_bundles.py
  echo or install Python from https://www.python.org/downloads/
  pause
  exit /b 1
)
echo.
echo Done! Updated assets\js\builds.json
pause
