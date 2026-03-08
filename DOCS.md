# CookieCommand — Technical Documentation

> **Version:** 2.0 | **Last Updated:** February 7, 2026
> **Author:** Chad Keith | **License:** MIT

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Authentication](#authentication)
- [State Management](#state-management)
- [Feature Modules](#feature-modules)
- [Supabase Integration](#supabase-integration)
- [Deployment Architecture](#deployment-architecture)
- [Multi-Troop Cloning](#multi-troop-cloning)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)

---

## Architecture Overview

CookieCommand is a Girl Scout cookie season management application. The architecture follows a **client-heavy SPA pattern** with Supabase as the backend-as-a-service:

```
┌─────────────────────────────────────────────┐
│           GitHub Pages                      │
│         (Static SPA Hosting)                │
├─────────────────────────────────────────────┤
│                                             │
│   React 18 SPA (TypeScript + Vite)          │
│   ┌───────────┐  ┌──────────┐  ┌────────┐  │
│   │ Dashboard  │  │ Inventory│  │ Trades │  │
│   │ Calendar   │  │ Sales    │  │ Chat   │  │
│   │ Admin      │  │ Booths   │  │ Notifs │  │
│   └─────┬─────┘  └────┬─────┘  └───┬────┘  │
│         │              │            │        │
│   ┌─────┴──────────────┴────────────┴─────┐  │
│   │      Supabase Client SDK              │  │
│   │   (Auth + Realtime + DB Queries)      │  │
│   └──────────────────┬────────────────────┘  │
│                      │                       │
└──────────────────────┼───────────────────────┘
                       │ HTTPS
          ┌────────────┴─────────────┐
          │     Supabase Cloud       │
          │  ┌──────────────────┐    │
          │  │  PostgreSQL DB   │    │
          │  │  ─ users         │    │
          │  │  ─ inventory     │    │
          │  │  ─ messages      │    │
          │  │  ─ trades        │    │
          │  │  ─ booths        │    │
          │  │  ─ meetings      │    │
          │  │  ─ notifications │    │
          │  │  ─ audit_log     │    │
          │  └──────────────────┘    │
          │  ┌──────────────────┐    │
          │  │  Auth (GoTrue)   │    │
          │  │  ─ email/PIN     │    │
          │  │  ─ RLS policies  │    │
          │  └──────────────────┘    │
          │  ┌──────────────────┐    │
          │  │  Realtime        │    │
          │  │  ─ live sync     │    │
          │  └──────────────────┘    │
          └──────────────────────────┘
```

### Key Design Decisions

1. **Supabase as BaaS** — Eliminates the need for a custom backend server. Auth, database, and realtime subscriptions are all handled by Supabase's client SDK.
2. **Vite for bundling** — Fast dev server with HMR, optimized production builds for GitHub Pages.
3. **React Context for state** — Lightweight state management without Redux overhead. Supabase queries happen inside the context provider.
4. **Row Level Security (RLS)** — Supabase RLS policies ensure scouts can only modify their own data; admins get full access.
5. **Realtime subscriptions** — Chat messages, trade requests, and notifications update live across all connected devices.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript | UI framework |
| **Build Tool** | Vite 5 | Dev server, bundling, HMR |
| **Icons** | Lucide React | Icon library |
| **Date Utils** | date-fns | Calendar, date formatting |
| **Spreadsheets** | xlsx (SheetJS) | Export functionality |
| **Database** | Supabase (PostgreSQL) | Persistent storage, auth, realtime |
| **Auth** | Supabase GoTrue | PIN-based scout login, password admin login |
| **Hosting** | GitHub Pages | Static SPA deployment |
| **CI/CD** | GitHub Actions | Automated build + deploy |

---

## Project Structure

```
cookie-command/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD
├── docs/                        # Extra documentation
├── scripts/
│   └── seed-supabase.ts         # Seed Supabase with troop data
├── supabase/
│   └── migrations/
│       └── 001_initial.sql      # Database schema + RLS policies
├── src/
│   ├── App.tsx                  # Root component, layout, tab routing
│   ├── App.css                  # Global + layout styles
│   ├── index.tsx                # React DOM mount point
│   ├── features/
│   │   ├── admin/
│   │   │   ├── AdminPanel.tsx   # Scout roster, inventory editing, transfers
│   │   │   └── AdminPanel.css
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx  # PIN/password login form
│   │   │   └── LoginScreen.css
│   │   ├── booths/
│   │   │   ├── BoothSchedule.tsx # Booth listing (upcoming/past/all)
│   │   │   └── BoothSchedule.css
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx    # Stats cards, financial summary, cookie table
│   │   │   ├── Dashboard.css
│   │   │   ├── CalendarWidget.tsx # Interactive monthly calendar
│   │   │   └── CalendarWidget.css
│   │   ├── inventory/
│   │   │   ├── InventoryEntry.tsx # Cookie cards, sale recording
│   │   │   └── InventoryEntry.css
│   │   ├── notifications/
│   │   │   ├── NotificationPanel.tsx # Meeting alerts overlay
│   │   │   └── NotificationPanel.css
│   │   ├── social/
│   │   │   ├── SocialHub.tsx    # Group chat + DMs + admin monitoring
│   │   │   └── SocialHub.css
│   │   └── trades/
│   │       ├── TradeCenter.tsx  # Trade proposals + history
│   │       └── TradeCenter.css
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client initialization
│   │   ├── store.tsx            # React Context — all state + operations
│   │   ├── seedData.ts          # Seed data (38 scouts, 27 booths)
│   │   └── types.ts             # TypeScript interfaces + constants
│   └── utils/
│       └── persistence.ts       # Storage abstraction layer
├── index.html                   # SPA entry point
├── package.json                 # Dependencies + scripts
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite build config
├── .env.example                 # Environment variable template
├── setup.bat                    # Windows CLI quick-start
├── setup.ps1                    # PowerShell quick-start
├── DOCS.md                      # This file
├── DEPLOYMENT.md                # Deployment guide
├── README.md                    # User-facing documentation
└── LICENSE                      # MIT license
```

---

## Data Model

### Users

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Supabase auth user ID |
| `username` | TEXT UNIQUE | Login username (e.g., `abigailn`) |
| `name` | TEXT | Display name (e.g., "Abigail Newman") |
| `level` | ENUM | Scout level: Daisy, Brownie, Junior, Cadette, Senior, Ambassador, OrderCzar |
| `is_admin` | BOOLEAN | True for troop leaders |
| `pin` | TEXT | 4-digit PIN (scouts) or password (admin) |
| `banner_color` | TEXT | Hex color for dashboard personalization |
| `troop_id` | TEXT | Troop identifier (e.g., "04326") |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |

### Inventory

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Row identifier |
| `user_id` | UUID (FK) | References `users.id` |
| `cookie_type` | TEXT | Cookie abbreviation (Advf, TMint, etc.) |
| `starting` | INTEGER | Boxes initially assigned |
| `additional` | INTEGER | Boxes added/transferred in |
| `sold` | INTEGER | Boxes sold |
| `troop_id` | TEXT | Troop identifier |

### Messages (Chat)

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Message ID |
| `sender_id` | UUID (FK) | Who sent it |
| `sender_name` | TEXT | Display name cache |
| `recipient_id` | UUID (FK, nullable) | NULL = public message |
| `content` | TEXT | Message text |
| `troop_id` | TEXT | Troop scope |
| `created_at` | TIMESTAMPTZ | When sent |

### Trades

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Trade ID |
| `from_user_id` | UUID (FK) | Proposer |
| `from_user_name` | TEXT | Proposer display name |
| `to_user_id` | UUID (FK) | Recipient |
| `to_user_name` | TEXT | Recipient display name |
| `offering` | JSONB | `{ "TMint": 5, "Sam": 3 }` |
| `requesting` | JSONB | `{ "Tags": 2 }` |
| `status` | TEXT | pending, accepted, rejected, cancelled |
| `troop_id` | TEXT | Troop scope |
| `created_at` | TIMESTAMPTZ | When proposed |

### Booths

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Booth ID |
| `business` | TEXT | Store/location name |
| `location` | TEXT | Full address |
| `notes` | TEXT | Special instructions |
| `date` | DATE | Booth date |
| `start_time` | TEXT | Start time (e.g., "2:00pm") |
| `end_time` | TEXT | End time |
| `duration` | TEXT | Duration string |
| `troop_id` | TEXT | Troop scope |

### Meetings

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Meeting ID |
| `title` | TEXT | Meeting name |
| `description` | TEXT | Details |
| `date` | DATE | Meeting date |
| `start_time` | TEXT | Start time |
| `end_time` | TEXT | End time |
| `location` | TEXT | Where |
| `troop_id` | TEXT | Troop scope |

### Notifications

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Notification ID |
| `type` | TEXT | meeting_added, meeting_deleted |
| `title` | TEXT | Alert title |
| `message` | TEXT | Alert body |
| `troop_id` | TEXT | Troop scope |
| `read_by` | UUID[] | Array of user IDs who read it |
| `created_at` | TIMESTAMPTZ | When created |

### Audit Log

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Log entry ID |
| `user_id` | UUID (FK) | Whose inventory changed |
| `user_name` | TEXT | Display name |
| `cookie_type` | TEXT | Which cookie |
| `field` | TEXT | starting, additional, or sold |
| `old_value` | INTEGER | Previous value |
| `new_value` | INTEGER | New value |
| `changed_by` | TEXT | Who made the change |
| `troop_id` | TEXT | Troop scope |
| `created_at` | TIMESTAMPTZ | When changed |

---

## Authentication

### Flow

1. User enters `username` + `PIN` (or password for admin)
2. Frontend calls Supabase with email-style login: `{username}@troop{troopId}.cookiecommand.app`
3. Supabase validates credentials → returns JWT session
4. JWT is stored client-side; Supabase SDK auto-refreshes
5. All subsequent DB queries include the JWT → RLS policies enforce access

### Roles

| Role | Can Do | Cannot Do |
|---|---|---|
| **Scout** | View own dashboard, record own sales, chat, propose/respond to trades, view booths | Edit other scouts, change starting inventory, manage troop |
| **Admin** | Everything above + manage roster, edit any inventory, transfer boxes, add/remove booths & meetings, view all DMs, reset data | N/A |

### PIN Generation

- Scouts get a random 4-digit PIN on account creation
- Admin has a full password (`Whatismypassword2!`)
- PINs are viewable by admin from the Manage Troop panel

---

## State Management

The app uses a single React Context (`CookieProvider`) that wraps the entire app. The context provides:

### State

| State | Type | Description |
|---|---|---|
| `currentUser` | `User \| null` | Logged-in user |
| `users` | `User[]` | All troop members |
| `fullInventory` | `AllInventory` | All scouts' cookie records |
| `messages` | `ChatMessage[]` | All chat messages |
| `trades` | `TradeRequest[]` | All trade requests |
| `logs` | `InventoryLog[]` | Audit trail |
| `booths` | `BoothSignup[]` | All booth signups |
| `meetings` | `TroopMeeting[]` | All troop meetings |
| `notifications` | `TroopNotification[]` | All notifications |

### Operations

| Function | Parameters | Description |
|---|---|---|
| `login` | `(username, pin)` | Authenticate user |
| `logout` | — | Clear session |
| `addUser` | `(name, level)` | Create new scout (admin only) |
| `removeUser` | `(userId)` | Delete scout + inventory (admin only) |
| `updateInventoryField` | `(userId, cookieType, field, value)` | Edit starting/additional/sold |
| `recordSale` | `(cookieType, boxesSold)` | Record current user's sale |
| `transferBoxes` | `(from, to, cookieType, qty)` | Move boxes between scouts (admin) |
| `sendMessage` | `(content, recipientId?)` | Send chat message |
| `createTrade` | `(toUserId, offering, requesting)` | Propose cookie trade |
| `respondTrade` | `(tradeId, accept)` | Accept or decline trade |
| `updateBanner` | `(color)` | Set dashboard banner color |
| `addBooth` | `(booth)` | Create booth signup (admin) |
| `removeBooth` | `(boothId)` | Delete booth (admin) |
| `addMeeting` | `(meeting)` | Schedule troop meeting (admin) |
| `removeMeeting` | `(meetingId)` | Cancel meeting + notify (admin) |
| `markNotificationsRead` | — | Mark all notifications read for current user |
| `resetSystem` | — | Factory reset all data (admin) |
| `getRemaining` | `(userId, cookieType)` | Calculate remaining boxes |

---

## Feature Modules

### 1. LoginScreen (`features/auth/`)
- PIN-based login for scouts, password for admin
- Username auto-lowercased and trimmed
- Error messages for invalid credentials

### 2. Dashboard (`features/dashboard/`)
- **Stat Cards** — Boxes Assigned, Sold, Remaining, Revenue
- **Financial Summary** — Revenue, troop profit ($1/box), amount owed to GSGLA
- **Cookie Breakdown Table** — Per-type stats with progress bars
- **Calendar Widget** — Interactive monthly calendar with booth (blue) and meeting (green) markers
- Admin sees aggregate data across all scouts

### 3. InventoryEntry (`features/inventory/`)
- Cookie type cards with progress bars
- Expandable sale recording with confirmation dialog
- Shows starting + sold + remaining per type

### 4. TradeCenter (`features/trades/`)
- Propose trades: select scout, specify offering/requesting
- Pending trades section with Accept/Decline
- Trade history with status badges
- Validates both parties have sufficient inventory

### 5. SocialHub (`features/social/`)
- Public chat (all troop members)
- Private DMs (select recipient)
- Admin Mode: view all messages, filter by scout
- Timestamps and sender badges

### 6. BoothSchedule (`features/booths/`)
- Upcoming / All / Past filter tabs
- Booth cards with business, address, date, time, duration, notes
- Admin can delete booths
- Past booths shown grayed out

### 7. CalendarWidget (`features/dashboard/`)
- Month navigation with Today button
- Date cells show colored dots (blue=booth, green=meeting)
- Click to expand event details
- Admin can add booths + meetings inline

### 8. NotificationPanel (`features/notifications/`)
- Overlay panel triggered by bell icon
- Shows meeting added/cancelled alerts
- Unread badge count on bell
- Auto-marks read on panel open

### 9. AdminPanel (`features/admin/`)
- Scout roster with level badges + sold/assigned stats
- PIN visibility toggle per scout
- Inline inventory editing (starting, additional, sold)
- Add/Remove scouts
- Quick Transfer between scouts
- Full system reset

---

## Supabase Integration

### Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration SQL from `supabase/migrations/001_initial.sql`
3. Copy your project URL and anon key to `.env`
4. Run the seed script: `npx tsx scripts/seed-supabase.ts`

### Client Configuration

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Realtime Subscriptions

The store subscribes to Supabase Realtime channels for:
- `messages` — live chat updates
- `trades` — trade status changes
- `notifications` — new meeting alerts
- `inventory` — inventory changes (admin transfers, sales)

---

## Deployment Architecture

### Option A: GitHub Pages (Recommended for Frontend)

```
User → cookiecommand.com → GitHub Pages → Supabase Cloud
```

- Frontend is a static SPA built by Vite
- GitHub Actions builds on push to `main` → deploys to `gh-pages` branch
- Custom domain CNAME configured in repo settings
- All data flows directly from browser to Supabase (no middleware)

### Local Development

For local testing before deploying:

```
User → localhost:5173 → Local Vite dev server → Supabase Cloud
```

- Run `npm run dev` to start local development server
- Test on `http://localhost:5173`
- Changes hot-reload automatically with Vite HMR
- For production deployment, use GitHub Pages as described above

---

## Multi-Troop Cloning

Any troop can fork/clone this repo and set up their own instance:

1. Fork the repo on GitHub
2. Create a free Supabase project
3. Run `setup.bat` (Windows) or `setup.ps1` (PowerShell)
4. Edit `.env` with their Supabase credentials
5. Edit `scripts/seed-supabase.ts` with their troop's roster
6. Run `npm run seed` to populate their database
7. Enable GitHub Pages for deployment

The `troop_id` column on every table ensures data isolation if multiple troops ever share a Supabase instance.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyzabc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOi...` |
| `VITE_TROOP_ID` | Troop number | `04326` |
| `VITE_TROOP_NAME` | Troop display name | `Troop 04326` |
| `VITE_COUNCIL` | Council abbreviation | `GSGLA` |

---

## Cookie Types Reference

| Code | Full Name | Price | Notes |
|---|---|---|---|
| `Advf` | Adventurefuls | $6.00 | |
| `LmUp` | Lemon-Ups | $6.00 | |
| `Tre` | Trefoils | $6.00 | |
| `D-S-D` | Do-Si-Dos | $6.00 | |
| `Sam` | Samoas | $6.00 | |
| `Tags` | Tagalongs | $6.00 | |
| `TMint` | Thin Mints | $6.00 | |
| `Exp` | Explore Mores | $6.00 | |
| `Toff` | Toffee-tastic | $7.00 | Gluten-free, premium price |
| `C4C` | Cookies for a Cause | $6.00 | Donation boxes |

**Troop Profit:** $1.00 per box sold (all types)

---

*Built with love for Troop 04326 — GSGLA 2025-26 Cookie Season*
