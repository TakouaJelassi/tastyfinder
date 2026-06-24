Write-Host "=== TastyFinder Deploy ===" -ForegroundColor Cyan

$commitMsg = Read-Host "Commit message (leave empty to skip)"

if ($commitMsg -ne "") {
    Write-Host "[1/4] Git commit and push..." -ForegroundColor Yellow
    git add -A
    git commit -m $commitMsg
    git push
} else {
    Write-Host "[1/4] Skipping commit..." -ForegroundColor Gray
}

Write-Host "[2/4] Building Angular app..." -ForegroundColor Yellow
nvm use 22
$env:PATH = "C:\nodejs;" + $env:PATH
ng build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[3/4] Copying index.html..." -ForegroundColor Yellow
node -e "require('fs').copyFileSync('dist/tastyfinder/browser/index.csr.html', 'dist/tastyfinder/browser/index.html')"

Write-Host "[4/4] Deploying to Firebase..." -ForegroundColor Yellow
nvm use 20
$env:PATH = "C:\nodejs;" + $env:PATH
firebase deploy --only hosting

Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "https://myauth-app-8d1d2.web.app" -ForegroundColor Cyan
