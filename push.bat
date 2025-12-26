@echo off
setlocal enabledelayedexpansion

REM 
set BRANCH=master
set REPO_URL=https://github.com/coffeesonghau/Coffeesonghau.git
REM 
set WEB_URL=https://coffeesonghau.github.io/Coffeesonghau/ 

REM 
for /f %%i in ('wmic os get LocalDateTime ^| find "."') do set dt=%%i
set ngay=!dt:~0,4!-!dt:~4,2!-!dt:~6,2!
set gio=!dt:~8,2!:!dt:~10,2!
set msg=Update: !ngay! !gio!

echo ==========================================
echo       AUTO DEPLOY - CA PHE SONG HAU
echo       Nhanh: %BRANCH%
echo       Thoi gian: !msg!
echo ==========================================

REM 
echo.
echo [1/4] Dang kiem tra code tren Server (git pull)...
git pull origin %BRANCH%
if %errorlevel% neq 0 (
    echo.
    echo [CANH BAO] Co loi khi Pull. Co the do xung dot file hoac mat mang.
    echo Ban co muon tiep tuc khong?
    pause
)

REM --- 3. Hien thi file da sua ---
echo.
echo [2/4] Cac file ban da sua:
git status --short
echo.

REM --- 4. Add va Commit ---
git add .
git diff --cached --quiet
if !errorlevel! equ 0 (
    echo [THONG BAO] Khong co file nao thay doi de upload.
    goto :End
) else (
    echo [3/4] Dang luu trang thai (git commit)...
    git commit -m "!msg!"
)

REM --- 5. Day len GitHub ---
echo.
echo [4/4] Dang day len GitHub (git push)...
git push origin %BRANCH%

REM --- Kiem tra ket qua ---
if %errorlevel% neq 0 (
    color 4
    echo.
    echo ==========================================
    echo [LOI] UPLOAD THAT BAI! 
    echo Vui long kiem tra lai ket noi Internet hoac loi Git.
    echo ==========================================
    pause
    exit /b
)

:End
echo.
echo ==========================================
echo       DA UPLOAD THANH CONG! (100%%)
echo       Website: %WEB_URL%
echo ==========================================
timeout /t 10