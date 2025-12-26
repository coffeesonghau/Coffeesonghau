@echo off
setlocal enabledelayedexpansion

REM --- 1. Lay thoi gian hien tai de dat ten Commit ---
for /f %%i in ('wmic os get LocalDateTime ^| find "."') do set dt=%%i
set ngay=!dt:~0,4!-!dt:~4,2!-!dt:~6,2!
set gio=!dt:~8,2!:!dt:~10,2!
set msg=Auto Update: !ngay! !gio!

echo ==========================================
echo       AUTO PUSH GITHUB (Master)
echo       Thoi gian: !msg!
echo ==========================================

REM --- 2. Add tat ca file ---
echo [1/3] Dang them file (git add)...
git add .

REM --- 3. Kiem tra xem co gi thay doi khong ---
git diff --cached --quiet
if !errorlevel! equ 0 (
    echo [THONG BAO] Khong co file nao thay doi.
    echo Ban co muon Force Push khong? (Chi dung khi can sua loi history)
    goto :End
) else (
    echo [2/3] Dang luu trang thai (git commit)...
    git commit -m "!msg!"
)

REM --- 4. Day len GitHub ---
echo [3/3] Dang day len Server (git push)...
git push origin master

:End
echo.
echo ==========================================
echo             DA HOAN TAT!
echo ==========================================
timeout /t 5