@echo off
cd /d "%~dp0"
title DouLuo Fate Book
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3002"
npm run dev:h5
