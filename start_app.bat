@echo off
chcp 65001 > nul
title تطبيق التهميش وتوجيه المراسلات
cd /d "%~dp0"

echo =========================================================
echo       جاري تشغيل تطبيق التهميش وتوجيه المراسلات...
echo =========================================================
echo.

:: Open browser in App mode after 2 seconds
start /min cmd /c "timeout /t 2 /nobreak > nul && start msedge --app=http://localhost:5173 || start http://localhost:5173"

:: Start Vite Server
npm run dev
