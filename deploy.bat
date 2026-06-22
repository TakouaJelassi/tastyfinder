@echo off
echo === TastyFinder Deploy ===

set /p COMMIT_MSG="Commit message: "

echo [1/5] Git commit and push...
git add -A
git commit -m "%COMMIT_MSG%"
git push

echo [2/5] Switching to Node 22 for build...
call nvm use 22

echo [3/5] Building Angular app...
call ng build
if %errorlevel% neq 0 (
  echo Build failed!
  pause
  exit /b 1
)

echo [4/5] Copying index.html...
node -e "require('fs').copyFileSync('dist/tastyfinder/browser/index.csr.html', 'dist/tastyfinder/browser/index.html')"

echo [5/5] Switching to Node 20 and deploying to Firebase...
call nvm use 20
call firebase deploy --only hosting

echo === Done! ===
echo https://myauth-app-8d1d2.web.app
pause
