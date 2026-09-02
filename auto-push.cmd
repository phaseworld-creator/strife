@echo off
setlocal enabledelayedexpansion

set "REPO=C:\Users\ON-TH\.folder\Documents\Github\phaseworld-creator\strife"

pushd "%REPO%" || (echo Failed to access repo && pause && exit /b 1)

echo Checking git status...
git status --short

echo.
set /p "MSG=Enter commit message (or leave blank for default): "
if "%MSG%"=="" set "MSG=Auto-push at %date% %time%"

echo.
git add .
git commit -m "%MSG%"
git push

echo.
echo Done.
pause
