@echo off
title Design Beleza - Local
cd /d "%~dp0"

where npm >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERRO] Node.js nao encontrado no PATH.
  echo Instale em https://nodejs.org e reinicie o terminal.
  pause
  exit /b 1
)

if not exist ".env.local" (
  echo [AVISO] Arquivo .env.local nao encontrado.
  echo Crie .env.local com ANTHROPIC_API_KEY para a geracao funcionar.
  echo Veja RODAR-LOCAL.md ou copie .env.example para .env.local.
  echo.
)

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 ( pause & exit /b 1 )
  echo.
)

echo Servidor local: http://localhost:3000
echo Para parar: Ctrl+C
echo.
call npm run dev
pause
