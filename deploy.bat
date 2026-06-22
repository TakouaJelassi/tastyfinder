@echo off
echo === TastyFinder Deploy ===

set /p COMMIT_MSG="Commit message (leave empty to skip): "

if not "%COMMIT_MSG%"=="" (
  echo [1/4] Git commit and push...
  git add -A
  git commit -m "%COMMIT_MSG%"
  git push
) else (
  echo [1/4] Skipping commit...
)

echo [2/4] Building Angular app...
cmd /c "nvm use 22 && ng build"
if %errorlevel% neq 0 (
  echo Build failed!
  pause
  exit /b 1
)

echo [3/4] Copying index.html...
cmd /c "nvm use 22 && node -e \"require('fs').copyFileSync('dist/tastyfinder/browser/index.csr.html', 'dist/tastyfinder/browser/index.html')\""

echo [4/4] Deploying to Firebase...
cmd /c "nvm use 20 && firebase deploy --only hosting"

echo === Done! ===
echo https://myauth-app-8d1d2.web.app
pause
