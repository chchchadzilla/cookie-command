@echo off
REM ============================================================
REM CookieCommand — Quick Setup Script (Windows CMD)
REM Run this from the project root directory.
REM ============================================================

echo.
echo  ================================================
echo    CookieCommand Setup
echo    Girl Scout Cookie Season Manager
echo  ================================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/ (LTS version recommended)
    echo Then re-run this script.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. It should come with Node.js.
    pause
    exit /b 1
)

echo [OK] npm found:
npm --version
echo.

REM Install dependencies
echo [STEP 1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed. Check the output above.
    pause
    exit /b 1
)
echo [OK] Dependencies installed.
echo.

REM Create .env from template if it doesn't exist
if not exist ".env" (
    echo [STEP 2/4] Creating .env from template...
    copy ".env.example" ".env" >nul
    echo [OK] .env file created. You need to edit it with your Supabase credentials.
    echo     Open .env in a text editor and fill in:
    echo       - VITE_SUPABASE_URL
    echo       - VITE_SUPABASE_ANON_KEY
    echo       - SUPABASE_SERVICE_ROLE_KEY (for seeding only)
    echo.
) else (
    echo [STEP 2/4] .env file already exists. Skipping.
    echo.
)

REM Check if Supabase is configured
echo [STEP 3/4] Checking Supabase configuration...
findstr /C:"YOUR_PROJECT_ID" .env >nul 2>nul
if %errorlevel% equ 0 (
    echo [WARNING] Supabase is NOT configured yet.
    echo   The app will run in LOCAL MODE (localStorage) until you configure Supabase.
    echo   See DEPLOYMENT.md for Supabase setup instructions.
    echo.
) else (
    echo [OK] Supabase appears to be configured.
    echo.
)

REM Start dev server
echo [STEP 4/4] Starting development server...
echo.
echo  ================================================
echo    CookieCommand is starting!
echo    Open http://localhost:5173 in your browser
echo    Press Ctrl+C to stop the server
echo  ================================================
echo.

call npm run dev
