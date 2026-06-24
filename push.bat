@echo off
setlocal enabledelayedexpansion

REM --- VE THU MUC CHUA FILE BAT ---
cd /d "%~dp0"

REM --- CAU HINH ---
set BRANCH=master
set WEB_URL=https://coffeesonghau.com/

REM --- TAO THOI GIAN ---
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set ngay=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%
set gio=%dt:~8,2%:%dt:~10,2%
set msg=Update: %ngay% %gio%

echo ==========================================
echo       AUTO DEPLOY - CA PHE SONG HAU
echo       Nhanh: %BRANCH%
echo       Thoi gian: %msg%
echo ==========================================

REM --- DONG GIT TREO ---
taskkill /F /IM git.exe >nul 2>&1
del /f /q .git\index.lock >nul 2>&1

REM --- KIEM TRA FILE THAY DOI ---
echo [1/4] Dang kiem tra file thay doi...
git status --short

git add .
git diff --cached --quiet
if %errorlevel% equ 0 (
echo [THONG BAO] Khong co file nao thay doi.
goto :End
)

REM --- COMMIT ---
echo [2/4] Dang commit...
git commit -m "%msg%"

REM --- CAP NHAT TU GITHUB ---
echo [3/4] Dang lay code moi nhat...
git pull origin %BRANCH% --rebase

if %errorlevel% neq 0 (
color 4
echo [LOI] Loi khi pull code!
pause
exit /b
)

REM --- PUSH ---
echo [4/4] Dang push len GitHub...
git push origin %BRANCH%

if %errorlevel% neq 0 (
color 4
echo [LOI] Push that bai!
pause
exit /b
)

:End
echo ==========================================
echo       DEPLOY THANH CONG!
echo       Website: %WEB_URL%
echo ==========================================
timeout /t 5
