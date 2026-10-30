@echo off
cd /d "%~dp0"
start "" http://localhost:8001
node server.js
