@echo off
title Zuba Soil Sense - Startup Manager

REM Change to the directory where this batch file is located
cd /d "%~dp0"

REM Run the Python startup script
python start_zuba.py

REM Pause to keep the window open if there's an error
pause
