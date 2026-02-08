# ============================================================
# CookieCommand — Quick Setup Script (PowerShell)
# Run this from the project root directory:
#   .\setup.ps1
# If you get an execution policy error, run:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# ============================================================

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Green
Write-Host "    CookieCommand Setup" -ForegroundColor Green
Write-Host "    Girl Scout Cookie Season Manager" -ForegroundColor Green
Write-Host "  ================================================" -ForegroundColor Green
Write-Host ""

# Check for Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ (LTS version recommended)" -ForegroundColor Yellow
    Write-Host "Then re-run this script." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for npm
try {
    $npmVersion = npm --version 2>$null
    Write-Host "[OK] npm found: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] npm is not installed." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 1: Install dependencies
Write-Host "[STEP 1/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install failed. Check the output above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Dependencies installed." -ForegroundColor Green
Write-Host ""

# Step 2: Create .env
if (-not (Test-Path ".env")) {
    Write-Host "[STEP 2/5] Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] .env file created." -ForegroundColor Green
    Write-Host ""
    Write-Host "  You need to edit .env with your Supabase credentials:" -ForegroundColor Yellow
    Write-Host "    VITE_SUPABASE_URL         = your Supabase project URL" -ForegroundColor DarkGray
    Write-Host "    VITE_SUPABASE_ANON_KEY     = your Supabase anon/public key" -ForegroundColor DarkGray
    Write-Host "    SUPABASE_SERVICE_ROLE_KEY   = your service role key (for seeding)" -ForegroundColor DarkGray
    Write-Host ""
} else {
    Write-Host "[STEP 2/5] .env file already exists. Skipping." -ForegroundColor DarkGray
    Write-Host ""
}

# Step 3: Check Supabase config
Write-Host "[STEP 3/5] Checking Supabase configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
if ($envContent -match "YOUR_PROJECT_ID") {
    Write-Host "[WARNING] Supabase is NOT configured yet." -ForegroundColor Yellow
    Write-Host "  The app will run in LOCAL MODE (localStorage) until you configure Supabase." -ForegroundColor DarkGray
    Write-Host "  See DEPLOYMENT.md for full Supabase setup instructions." -ForegroundColor DarkGray
} else {
    Write-Host "[OK] Supabase appears to be configured." -ForegroundColor Green
}
Write-Host ""

# Step 4: Ask about seeding
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
$supabaseConfigured = $envContent -notmatch "YOUR_PROJECT_ID"

if ($supabaseConfigured) {
    $seedResponse = Read-Host "[STEP 4/5] Seed Supabase with troop data? (y/N)"
    if ($seedResponse -eq 'y' -or $seedResponse -eq 'Y') {
        Write-Host "Seeding Supabase..." -ForegroundColor Yellow
        npx tsx scripts/seed-supabase.ts
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Supabase seeded with troop data." -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Seeding had issues. You can retry with: npm run seed" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[SKIP] Skipping seed. Run 'npm run seed' later to populate data." -ForegroundColor DarkGray
    }
} else {
    Write-Host "[STEP 4/5] Skipping seed (Supabase not configured)." -ForegroundColor DarkGray
}
Write-Host ""

# Step 5: Start dev server
Write-Host "[STEP 5/5] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  ================================================" -ForegroundColor Green
Write-Host "    CookieCommand is starting!" -ForegroundColor Green
Write-Host "    Open http://localhost:5173 in your browser" -ForegroundColor Cyan
Write-Host "    Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host "  ================================================" -ForegroundColor Green
Write-Host ""

npm run dev
