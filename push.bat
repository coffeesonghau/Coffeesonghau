@echo off
setlocal enabledelayedexpansion
title CoffeeSongHau Auto Git Push Pro

cd /d "%~dp0"

set BRANCH=master
set LOGFILE=git_push_log.txt

color 0A

echo ======================================
echo       CoffeeSongHau Git Auto Push
echo ======================================

:: Tao commit message theo thoi gian
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set msg=Auto Update %%i

echo.
echo [1/5] Checking changes...
git status

echo.
echo [2/5] Adding files...
git add .

:: Kiem tra co thay doi khong
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes detected.
    pause
    exit /b
)

echo.
echo [3/5] Pulling latest from GitHub...
git pull origin %BRANCH% --rebase
if %errorlevel% neq 0 (
    echo [ERROR] Pull failed. Resolve conflict manually.
    pause
    exit /b
)

echo.
echo [4/5] Commiting...
git commit -m "%msg%"
if %errorlevel% neq 0 (
    echo [ERROR] Commit failed.
    pause
    exit /b
)

echo.
echo [5/5] Pushing to GitHub...
git push origin %BRANCH%
if %errorlevel% neq 0 (
    echo [ERROR] Push failed.
    pause
    exit /b
)

echo [%date% %time%] SUCCESS: %msg% >> %LOGFILE%

echo.
echo ======================================
echo Push completed successfully!
echo ======================================
pause