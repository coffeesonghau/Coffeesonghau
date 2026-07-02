@echo off
title CoffeeSongHau Git Auto Push
color 0A

echo ======================================
echo       CoffeeSongHau Git Auto Push
echo ======================================
echo.

:: Chuyen den thu muc project (doi lai duong dan neu can)
cd /d "C:\Users%USERNAME%\Documents\CoffeeSongHau"

:: Kiem tra co thay doi khong
echo [1/4] Checking changes...
git status

echo.
set /p msg=Nhap commit message:

:: Add tat ca file
echo.
echo [2/4] Adding files...
git add .

:: Commit
echo.
echo [3/4] Committing...
git commit -m "%msg%"

:: Push len branch master
echo.
echo [4/4] Pushing to GitHub...
git push origin master

echo.
echo ======================================
echo Push completed!
echo ======================================
pause
