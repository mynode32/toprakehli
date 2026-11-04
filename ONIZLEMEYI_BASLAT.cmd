@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js kurulu degil. Teslim notlarindaki kurulum adimini uygulayin.
  pause
  exit /b 1
)
echo Tarayicida http://127.0.0.1:4175 adresini acin.
node scripts\serve.mjs
pause
