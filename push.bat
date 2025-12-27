@echo off
setlocal enabledelayedexpansion

REM --- 1. CHUYEN VE DUNG THU MUC CHUA CODE ---
cd /d "%~dp0"

REM --- CAU HINH ---
set BRANCH=master
set REPO_URL=https://github.com/coffeesonghau/Coffeesonghau.git
set WEB_URL=https://coffeesonghau.github.io/Coffeesonghau/ 

REM --- LAY THOI GIAN ---
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set ngay=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%
set gio=%dt:~8,2%:%dt:~10,2%
set msg=Update: %ngay% %gio%

echo ==========================================
echo       AUTO DEPLOY - CA PHE SONG HAU
echo       Nhanh: %BRANCH%
echo       Thoi gian: %msg%
echo ==========================================

REM --- KIEM TRA TRANG THAI ---
echo [1/4] Dang kiem tra code tren Server (git pull)...
git pull origin %BRANCH%

REM --- ADD VA COMMIT ---
echo [2/4] Cac file se duoc upload:
git status --short

git add .
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo [THONG BAO] Khong co file nao thay doi de upload.
    goto :End
)

echo [3/4] Dang luu trang thai (git commit)...
git commit -m "%msg%"

REM --- PUSH LEN GITHUB ---
echo [4/4] Dang day len GitHub (git push)...
git push origin %BRANCH%

if %errorlevel% neq 0 (
    color 4
    echo [LOI] UPLOAD THAT BAI!
    echo Vui long kiem tra Internet hoac xung dot code.
    pause
    exit /b
)

:End
echo ==========================================
echo       DA UPLOAD THANH CONG!
echo       Website: %WEB_URL%
echo ==========================================
timeout /t 10