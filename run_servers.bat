@echo off
title LK Smart Wash - Production Runner
echo Starting LK Smart Wash System...

start cmd /k "cd backend && node server.js"
start cmd /k "cd frontend && npm run dev"

echo Backend and Frontend are starting in separate windows.
echo Keep this window open if you want to see status logs.
pause
