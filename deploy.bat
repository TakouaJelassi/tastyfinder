@echo off
echo === Building and deploying TastyFinder ===

set NODE22=C:\nvm\v22.23.0
set NODE20=C:\nvm\v20.20.2

echo [1/3] Building Angular app...
set PATH=%NODE22%;%NODE22%\node_modules\.bin;%APPDATA%\npm;%PATH%
call "%NODE22%\npm.cmd" run build
if %errorlevel% neq 0 (
  echo Build failed!
  pause
  exit /b 1
)

echo [2/3] Copying index.html...
"%NODE22%\node.exe" -e "require('fs').copyFileSync('dist/tastyfinder/browser/index.csr.html', 'dist/tastyfinder/browser/index.html')"

echo [3/3] Deploying to Firebase...
set PATH=%NODE20%;%NODE20%\node_modules\.bin;%APPDATA%\npm;%PATH%
call "%NODE20%\node.exe" "%APPDATA%\npm\node_modules\firebase-tools\lib\bin\firebase.js" deploy --only hosting

echo === Done: https://myauth-app-8d1d2.web.app ===
pause
