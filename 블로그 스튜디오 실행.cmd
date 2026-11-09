@echo off
setlocal
chcp 65001 >nul
title 블로그 스튜디오
cd /d "%~dp0" || goto failed
set "PORT=8790"
set "STUDIO_URL=http://127.0.0.1:8790/"
call :ready
if not errorlevel 1 goto open
where node.exe >nul 2>&1 || goto failed
if not exist "node_modules\tsx\" goto failed
if not exist "dist\index.html" goto failed
echo 블로그 스튜디오를 시작합니다...
powershell.exe -NoProfile -Command "Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList '--import','tsx','server/index.ts' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden"
if errorlevel 1 goto failed
for /l %%i in (1,1,15) do (
  call :ready
  if not errorlevel 1 goto open
  powershell.exe -NoProfile -Command "Start-Sleep -Milliseconds 500"
)
:failed
echo 스튜디오를 열 수 없습니다. 이 폴더의 README.md에서 설치 및 실행 방법을 확인하세요.
pause
exit /b 1
:open
start "" "%STUDIO_URL%"
exit /b 0
:ready
node.exe -e "fetch('http://127.0.0.1:8790/api/health',{signal:AbortSignal.timeout(1200)}).then(r=>r.json()).then(v=>process.exit(v.ok===true && v.localOnly===true?0:1)).catch(()=>process.exit(1))" >nul 2>&1
exit /b %errorlevel%
