
# 🍪 CookieCommand — Troop 04326 Cookie Management Portal

**CookieCommand** is a full-featured, real-time cookie season management application built for **Girl Scout Troop 04326 (GSGLA)**. It streamlines inventory tracking, sales recording, booth scheduling, scout communications, and troop administration — all in one beautiful, mobile-friendly web app.

> **Copyright © 2025-2026 Chad Keith. All Rights Reserved.**
> Licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Logging In](#-logging-in)
- [Dashboard](#-dashboard)
- [My Cookies (Inventory)](#-my-cookies-inventory)
- [Cookie Trades](#-cookie-trades)
- [Troop Chat](#-troop-chat)
- [Booth Schedule](#-booth-schedule)
- [Troop Calendar](#-troop-calendar)
- [Notifications](#-notifications)
- [Admin: Manage Troop](#-admin-manage-troop)
- [Supported Cookie Types](#-supported-cookie-types)
- [Technical Details](#-technical-details)
- [For Other Troops](#-for-other-troops)
- [FAQ](#-faq)

---

## ✨ Features

| Feature | Description |
|---|---|
| **📊 Dashboard** | At-a-glance stats for boxes assigned, sold, remaining, and total revenue |
| **📦 Inventory Tracking** | Each scout tracks starting, additional, and sold boxes per cookie type |
| **💰 Sales Recording** | Scouts record sales with a confirmation step to prevent mistakes |
| **🔄 Cookie Trades** | Scouts can propose, accept, or decline box trades with each other |
| **💬 Troop Chat** | Global and private (DM) messaging between scouts and leaders |
| **🏪 Booth Schedule** | View upcoming and past cookie booth locations, times, and notes |
| **📅 Troop Calendar** | Interactive calendar showing booths and troop meetings at a glance |
| **🔔 Notifications** | Automatic alerts when meetings are added or cancelled |
| **👥 Admin Panel** | Full troop management: add/remove scouts, edit inventory, transfer boxes |
| **💵 Financial Summary** | Revenue, troop profit ($1/box), and amount owed to GSGLA council |
| **📱 Mobile-Friendly** | Fully responsive design that works on phones, tablets, and desktops |
| **🎨 Personalization** | Scouts can customize their dashboard banner color |
| **🔐 Secure Login** | PIN-based login for scouts; password-based login for admin |
| **💾 Persistent Storage** | All data is saved and persists between sessions |

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/cookie-command.git
cd cookie-command
npm install

# Run locally (no Supabase required — uses localStorage)
npm run dev
```

Or use the provided setup scripts:
- **Windows CMD:** `setup.bat`
- **PowerShell:** `setup.ps1`

For full deployment with Supabase + GitHub Pages, see the [Deployment Guide](./DEPLOYMENT.md).

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│  GitHub Pages (CDN)  │     │   Supabase (Free)    │
│  ┌───────────────┐  │     │  ┌────────────────┐  │
│  │  React SPA    │──┼────▶│  │  PostgreSQL DB │  │
│  │  (Vite build) │  │     │  │  Realtime WS   │  │
│  └───────────────┘  │     │  │  Row Security   │  │
└─────────────────────┘     │  └────────────────┘  │
         ▲                  └──────────────────────┘
         │
    Custom Domain
  (cookiecommand.com)
```

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + TypeScript | Interactive SPA |
| Build | Vite 5 | Dev server, bundling, HMR |
| Database | Supabase (PostgreSQL) | Auth, data, real-time sync |
| Hosting | GitHub Pages | Free static hosting + CDN |
| CI/CD | GitHub Actions | Auto-deploy on push to main |

The app runs in **dual mode**: with Supabase configured, all data syncs in real time across devices. Without Supabase, it falls back to localStorage for local-only usage.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** — [download here](https://nodejs.org)
- A modern web browser (Chrome, Safari, Firefox, Edge)
- **Optional:** Free [Supabase](https://supabase.com) account for multi-device sync

### First Launch

On first launch (in localStorage mode), the app automatically seeds itself with:
- **38 scouts** from Troop 04326 (across all levels: Daisy through Ambassador)
- **Pre-loaded inventory** based on the current cookie season allocations
- **27 booth signups** with real locations, dates, and times
- **1 admin account** (Troop Leader)

When using Supabase, run `npm run seed` to populate the database (see [Deployment Guide](./DEPLOYMENT.md)).

---

## 🔑 Logging In

### As a Scout
1. Enter your **username** (typically your first name + last initial, e.g., `abigailn`)
2. Enter your **4-digit PIN** (provided by your troop leader)
3. Click **Enter Portal**

### As Admin (Troop Leader)
1. Enter username: **`courtneys`**
2. Enter the admin password
3. Click **Enter Portal**

> 💡 **Forgot your login?** Ask your Troop Leader — they can view all usernames and PINs from the Admin Panel.

---

## 📊 Dashboard

The Dashboard is your home screen, showing a summary of cookie season progress.

### What You'll See

- **Banner** — Personalized greeting with your name, level, and customizable color
- **Stat Cards** — Four cards showing:
  - Total Boxes Assigned
  - Boxes Sold
  - Remaining to Sell
  - Total Sales Revenue
- **Troop Calendar** — Interactive monthly calendar (see [Calendar section](#-troop-calendar))
- **Financial Summary** — Breakdown of inventory value, revenue collected, troop proceeds, and amount owed to GSGLA
- **Cookie Breakdown Table** — Per-cookie-type stats showing starting, additional, sold, remaining, and revenue

### For Admins
The admin dashboard shows **aggregate data across all scouts** instead of individual data.

### Customizing Your Banner
Click any color dot in the banner area to change your dashboard theme color. Choose from 12 colors!

---

## 📦 My Cookies (Inventory)

The **My Cookies** tab is where scouts track and record their sales.

### Viewing Your Inventory
Each cookie type is displayed as a card showing:
- Cookie name and abbreviation
- Price per box
- Number of boxes remaining
- Progress bar (percentage sold)
- Starting, Sold, and percentage stats

### Recording a Sale
1. **Tap a cookie card** to expand it
2. **Enter the number of boxes** you sold
3. **Tap "Record Sale"**
4. **Review the confirmation screen** carefully:
   - How many boxes you HAD
   - How many you're recording as SOLD
   - How many you'll have REMAINING
5. **Tap "OK — Confirm Sale"** to finalize

> ⚠️ **Important:** Double-check before confirming! Once recorded, only an admin can adjust the numbers.

---

## 🔄 Cookie Trades

The **Trades** tab lets scouts swap cookie boxes with each other.

### Proposing a Trade
1. Click **"Propose Trade"**
2. Select which scout you want to trade with
3. Under **"You Give"**, enter how many of each cookie type you're offering
4. Under **"You Want"**, enter how many of each type you'd like in return
5. Click **"Send Trade Request"**

### Responding to a Trade
If another scout proposes a trade with you:
1. You'll see it under **"Trades Awaiting Your Response"**
2. Review what they're offering and what they're requesting
3. Click **Accept** ✅ or **Decline** ❌

### How Trades Work
- Accepted trades automatically adjust both scouts' inventory (via the `additional` field)
- The system validates that both parties have enough boxes before completing
- All trades are logged in the Trade History section

---

## 💬 Troop Chat

The **Chat** tab provides real-time messaging for the troop.

### Sending Messages
1. **Select a recipient** from the dropdown:
   - 📢 **Everyone** — sends to the entire troop (public)
   - 🔒 **Individual scout** — sends a private DM
2. Type your message
3. Hit the **Send** button (or press Enter)

### Message Types
- **Public messages** — visible to all troop members
- **Private messages (DMs)** — only visible to sender and recipient

### Admin Mode (Leaders Only)
Admins can activate **Admin Mode** to:
- View **all messages** (including DMs between scouts)
- Filter by individual scout to see their conversations
- Monitor troop communications for safety

---

## 🏪 Booth Schedule

The **Booths** tab displays all cookie booth signups with details.

### Viewing Booths
- **Upcoming** — shows future booths (default view)
- **All** — shows every booth
- **Past** — shows completed booths (grayed out)

### Booth Details
Each booth card shows:
- 📅 Date and day of week
- 🕐 Start time, end time, and duration
- 🏪 Business name
- 📍 Full address/location
- ⚠️ Special notes or instructions (highlighted in yellow)

### Managing Booths (Admin Only)
Admins can **delete booths** by clicking the trash icon on any booth card.

---

## 📅 Troop Calendar

The interactive calendar (on the Dashboard) provides a visual overview of all troop events.

### Navigation
- Use **◀ ▶ arrows** to move between months
- Click **"Today"** to jump to the current date
- Click any **date cell** to see events for that day

### Event Types
- 🔵 **Blue dots** — Cookie Booth events
- 🟢 **Green dots** — Troop Meeting events

### Viewing Event Details
1. Click a date with dots to expand the events panel
2. Click any event card to see full details (location, time, notes)

### Adding Events (Admin Only)
Admins see two buttons at the top of the calendar:
- **🏪 Booth** — Add a new cookie booth
- **👥 Meeting** — Add a new troop meeting

Fill in the required fields (marked with *) and submit. When a meeting is added, **all scouts receive a notification**.

### Deleting Events (Admin Only)
Click the 🗑️ trash icon on any event, then confirm. Deleting a meeting sends a **cancellation notification** to all scouts.

---

## 🔔 Notifications

The **bell icon** (🔔) in the top-right header shows your notifications.

### When You Get Notified
- 📅 **New Troop Meeting** — when the admin schedules a meeting
- 🚫 **Meeting Cancelled** — when the admin removes a meeting

### How It Works
- A **red badge** with a count appears on the bell when you have unread notifications
- Click the bell to open the notification panel
- Notifications are automatically marked as read when you open the panel
- Each notification shows the event title, details, and how long ago it happened

---

## 👥 Admin: Manage Troop

The **Manage Troop** tab is available only to admin users and provides full control over the troop.

### Scout Roster
The left panel shows all scouts with:
- Name and avatar (color-coded by level)
- Scout level badge (Daisy, Brownie, Junior, Cadette, Senior, Ambassador)
- Boxes sold vs. total assigned
- PIN visibility toggle (click 👁️ to reveal/hide)

### Viewing & Editing Inventory
1. Click a scout's name to select them
2. The right panel shows their full inventory table
3. Click any **Starting**, **Additional**, or **Sold** value to edit it
4. Enter the new value and click **Save**
5. All changes are logged with timestamps

### Adding a New Scout
1. Click **"+ Add Girl"**
2. Enter the scout's full name
3. Select their level (Daisy through Ambassador)
4. Click **"Create Scout"**
5. The system auto-generates a username and 4-digit PIN
6. Share the login credentials with the scout

### Removing a Scout
1. Select the scout from the roster
2. Click **"🗑️ Remove"**
3. Confirm the deletion
> ⚠️ This permanently deletes the scout and all their inventory data.

### Quick Transfer
Transfer cookie boxes between scouts:
1. Click **"Quick Transfer"**
2. Select the **From** scout
3. Select the **To** scout
4. Choose the cookie type
5. Enter the quantity
6. Click **Transfer**

### Reset All Data
At the bottom of the admin page, the **"Reset All Data"** button will:
- Wipe all data (inventory, messages, trades, logs)
- Re-seed with the original troop roster and inventory
- Use with extreme caution — this is for starting a new season

---

## 🍪 Supported Cookie Types

| Abbreviation | Full Name | Price |
|---|---|---|
| **Advf** | Adventurefuls | $6 |
| **LmUp** | Lemon-Ups | $6 |
| **Tre** | Trefoils | $6 |
| **D-S-D** | Do-Si-Dos | $6 |
| **Sam** | Samoas | $6 |
| **Tags** | Tagalongs | $6 |
| **TMint** | Thin Mints | $6 |
| **Exp** | Explore Mores | $6 |
| **Toff** | Toffee-tastic | $7 |
| **C4C** | Donations (Cookies for a Cause) | $6 |

> **Troop Profit:** $1.00 per box sold

---

## 🔧 Technical Details

- **Framework:** React 18 (TypeScript)
- **Build Tool:** Vite 5 with HMR
- **State Management:** React Context API with Supabase persistence
- **Database:** Supabase (PostgreSQL) with Row-Level Security
- **Real-time:** Supabase Realtime subscriptions (WebSocket)
- **Icons:** Lucide React
- **Fallback Storage:** localStorage (when Supabase is not configured)
- **Responsive:** Fully mobile-optimized with breakpoints at 380px, 600px, and 1024px
- **Hosting:** GitHub Pages with GitHub Actions CI/CD
- **Dependencies:** date-fns, xlsx (Excel export)

### Key Files

| File | Purpose |
|---|---|
| `src/lib/store.tsx` | Global state management + Supabase realtime |
| `src/utils/persistence.ts` | Data access layer (Supabase + localStorage) |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/types.ts` | TypeScript interfaces for all data models |
| `src/lib/seedData.ts` | Default troop roster + inventory data |
| `supabase/migrations/001_initial.sql` | Full database schema |
| `scripts/seed-supabase.ts` | Database seeding script |

### Documentation

| Document | Description |
|---|---|
| [DOCS.md](./DOCS.md) | Full technical documentation |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Step-by-step deployment guide |

---

## 🌍 For Other Troops

Any Girl Scout troop can fork this project and run their own instance:

1. **Fork** this repo on GitHub
2. Create a free [Supabase](https://supabase.com) project
3. Run the SQL migration in `supabase/migrations/001_initial.sql`
4. Edit `scripts/seed-supabase.ts` with your troop's roster
5. Update `.env` with your Supabase credentials and troop info
6. Run `npm run seed` to populate the database
7. Deploy to GitHub Pages (free) — see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Total cost: $0** (Supabase free tier + GitHub Pages)

---

## ❓ FAQ

**Q: What if a scout forgets their PIN?**
A: The admin can view any scout's PIN from the Manage Troop panel by clicking the eye icon next to their name.

**Q: Can scouts edit their own starting inventory?**
A: No. Only the admin can modify starting and additional box counts. Scouts can only record sales.

**Q: What happens if I accidentally record the wrong number of sales?**
A: Contact your troop leader (admin). They can edit the sold count directly from the admin panel.

**Q: Can I use this on my phone?**
A: Yes! CookieCommand is fully responsive and works great on phones, tablets, and desktops.

**Q: Is my data saved if I close the browser?**
A: Yes. With Supabase configured, data is stored in the cloud and syncs across all devices. Without Supabase, data is saved to localStorage on your device.

**Q: Can multiple people use the app at the same time?**
A: Yes! With Supabase, changes sync in real-time across all connected devices via WebSocket subscriptions.

**Q: Can scouts see each other's private messages?**
A: No. Private messages (DMs) are only visible to the sender and recipient. However, the admin can view all messages in Admin Mode for safety monitoring.

**Q: How does the financial summary calculate?**
A: Revenue = boxes sold × price per box. Troop profit = boxes sold × $1.00. Amount owed to GSGLA = revenue minus troop profit.

---

## 📄 License

Copyright © 2025-2026 **Chad Keith**. All Rights Reserved.

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full details.

---

<p align="center">
  <strong>🍪 CookieCommand</strong><br>
  <em>Troop 04326 • GSGLA 2025-26 Cookie Season</em><br>
  Built with ❤️ by Chad Keith
</p>
