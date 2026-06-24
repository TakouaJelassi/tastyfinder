@echo off
echo === Building and deploying TastyFinder ===

set NODE22=C:\nvm\v22.23.0
set NODE20=C:\nvm\v20.20.2
set FIREBASE_JS=%NODE22%\node_modules\firebase-tools\lib\bin\firebase.js

rem Service-Account-Key (kein Browser-Login noetig). Pfad ggf. anpassen.
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Takoua Jelassi\Downloads\myauth-app-8d1d2-firebase-adminsdk-fbsvc-230af7fa06.json

echo [1/3] Building Angular app (Node 22)...
set PATH=%NODE22%;%NODE22%\node_modules\.bin;%APPDATA%\npm;%PATH%
call "%NODE22%\npm.cmd" run build
if %errorlevel% neq 0 (
  echo Build failed!
  pause
  exit /b 1
)

echo [2/3] Copying index.html...
"%NODE22%\node.exe" -e "require('fs').copyFileSync('dist/tastyfinder/browser/index.csr.html', 'dist/tastyfinder/browser/index.html')"

echo [3/3] Deploying to Firebase (Node 20 - vermeidet 'Premature close' Bug von Node 22)...
"%NODE20%\node.exe" "%FIREBASE_JS%" deploy --only hosting --project myauth-app-8d1d2 --non-interactive
if %errorlevel% neq 0 (
  echo Deploy failed!
  pause
  exit /b 1
)

echo === Done: https://tastyfinder.web.app ===
pause
