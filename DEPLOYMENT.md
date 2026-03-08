# CookieCommand — Deployment Guide

Complete guide for getting CookieCommand running live for your troop.

---

## Quick Start (3 minutes for local testing)

```bash
git clone https://github.com/chchchadzilla/cookie-command.git
cd cookie-command
.\setup.bat        # Windows CMD
# or
.\setup.ps1        # PowerShell
```

This starts the app in **local mode** (localStorage, no sync between devices). Good for preview/demo.

---

## Full Deployment (Supabase + GitHub Pages)

### Step 1: Create a Supabase Project (Free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"**
3. Give it a name like `cookie-command`
4. Choose a secure database password (save it!)
5. Select the region closest to you
6. Click **"Create new project"** and wait ~2 minutes

### Step 2: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) from your repo
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** — all tables, indexes, and policies will be created

### Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** → `https://YOUR_ID.supabase.co`
   - **anon / public key** → long JWT string
   - **service_role key** → another long JWT string (keep this SECRET)

### Step 4: Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://xyzabc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
VITE_TROOP_ID=04326
VITE_TROOP_NAME=Troop 04326
VITE_COUNCIL=GSGLA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-role-key
```

### Step 5: Seed the Database

```bash
npm run seed
```

This populates Supabase with:
- 1 admin account (Courtney S)
- 38 scout accounts with auto-generated PINs
- Inventory data from the GOT Reconciliation spreadsheet
- 27 cookie booth signups

The script prints all login credentials when it finishes. **Save these!**

### Step 6: Test Locally

```bash
npm run dev
```

Open `http://localhost:5173` — you should see the login screen. Log in as admin (`courtneys` / `Whatismypassword2!`) and verify all scouts + inventory are loaded.

---

## Hosting Options

### Option A: GitHub Pages (Recommended)

Free, fast, custom domain support. Perfect for a static SPA backed by Supabase.

#### Setup

1. Push your code to GitHub
2. Go to your repo → **Settings → Secrets and variables → Actions**
3. Add these **Repository Secrets**:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Optionally add **Repository Variables**:
   - `VITE_TROOP_ID` = `04326`
   - `VITE_TROOP_NAME` = `Troop 04326`
   - `VITE_COUNCIL` = `GSGLA`
5. Go to **Settings → Pages** → set Source to **GitHub Actions**
6. Push to `main` branch — the workflow deploys automatically

Your app will be live at: `https://YOUR_USERNAME.github.io/cookie-command/`

#### Custom Domain

1. Register your domain (e.g., `cookiecommand.com`)
2. In your DNS provider, add a CNAME record:
   ```
   CNAME  www  YOUR_USERNAME.github.io
   ```
3. In GitHub repo → **Settings → Pages → Custom domain**, enter your domain
4. Enable **"Enforce HTTPS"**
5. Update `vite.config.ts` base to `/` (already set)

### Local Development Testing

For local testing before deploying to production:

1. Start your dev server: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Test on your local network by accessing `http://YOUR_LOCAL_IP:5173` from other devices

**Note:** For production deployment, always use GitHub Pages as described above. Local testing is sufficient for development.

---

## For Other Troops (Cloning)

Any Girl Scout troop can set up their own instance:

1. **Fork** this repo on GitHub
2. Create a free Supabase project
3. Run the SQL migration
4. Edit `.env` with your Supabase credentials
5. Edit `scripts/seed-supabase.ts`:
   - Replace `GIRLS_DATA` array with your troop's roster
   - Update the admin credentials
   - Change `TROOP_ID` in `.env`
6. Run `npm run seed`
7. Deploy to GitHub Pages (free)

Total cost: **$0** (Supabase free tier + GitHub Pages)

---

## Supabase Free Tier Limits

| Resource | Free Limit | CookieCommand Usage |
|---|---|---|
| Database size | 500 MB | ~5 MB (tiny) |
| Monthly API requests | Unlimited | Very low |
| Realtime connections | 200 concurrent | 40 scouts max |
| Storage | 1 GB | Not used |
| Edge Functions | 500K/month | Not used |

**A single troop will never come close to these limits.**

---

## Troubleshooting

### "Missing Supabase config" warning
- Make sure `.env` exists with your Supabase URL and key
- The app falls back to localStorage if Supabase isn't configured

### Seed script fails with "relation does not exist"
- Run the SQL migration first (Step 2 above)

### Changes on one device don't appear on another
- Verify Supabase is configured (not running in localStorage mode)
- Check that Realtime is enabled in Supabase dashboard
- Refresh the page on both devices

### GitHub Pages build fails
- Check that secrets are configured in repo settings
- Look at the Actions tab for build error details

### Login doesn't work after seeding
- The seed script prints all credentials — check the terminal output
- Admin: `courtneys` / `Whatismypassword2!`
- Scout PINs are random 4-digit numbers generated during seeding

---

## Architecture Diagram

```
┌──────────────────────────────────────┐
│         Your Custom Domain           │
│      (cookiecommand.com)             │
│              │                       │
│              ▼                       │
│      GitHub Pages (CDN)              │
│    ┌────────────────────┐            │
│    │ Static React SPA   │            │
│    │ (Vite build output)│            │
│    └─────────┬──────────┘            │
│              │ HTTPS API calls       │
│              ▼                       │
│      Supabase Cloud (Free)           │
│    ┌────────────────────┐            │
│    │ PostgreSQL Database│            │
│    │ Row Level Security │            │
│    │ Realtime Engine    │            │
│    └────────────────────┘            │
└──────────────────────────────────────┘
```

**No home server needed for production.** GitHub Pages serves the frontend, Supabase handles everything else.

---

*Built with love for Troop 04326 — GSGLA 2025-26 Cookie Season*
