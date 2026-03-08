---
description: Copilot instructions for CookieCommand - Girl Scout cookie season management portal
globs: *
---

## PROJECT OVERVIEW

CookieCommand is a full-featured, real-time cookie season management application built for Girl Scout Troop 04326 (GSGLA). It streamlines inventory tracking, sales recording, booth scheduling, scout communications, and troop administration in a mobile-friendly web app.

### Architecture
- **Frontend:** React 18 SPA with TypeScript
- **Build Tool:** Vite 5 with Hot Module Replacement
- **State Management:** React Context API with Supabase persistence
- **Database:** Supabase (PostgreSQL) with Row-Level Security
- **Real-time:** Supabase Realtime subscriptions (WebSocket)
- **Hosting:** GitHub Pages with GitHub Actions CI/CD
- **Fallback Storage:** localStorage (when Supabase is not configured)

### Deployment Model
This application is designed to run on **GitHub Pages** as a static SPA backed by Supabase. It does NOT require ngrok or local server deployment for production use.

## CODE STYLE

### TypeScript
- Use strict TypeScript with explicit types
- Define interfaces in `src/lib/types.ts` for data models
- Avoid `any` types unless absolutely necessary
- Use React 18 functional components with hooks

### React Patterns
- Use React Context API for global state (see `src/lib/store.tsx`)
- Leverage Supabase Realtime subscriptions for live updates
- Keep components focused and single-responsibility
- Use lucide-react for icons consistently

### File Organization
- Components in `src/features/` organized by feature area
- Global state and utilities in `src/lib/`
- Type definitions in `src/lib/types.ts`
- Persistence layer in `src/utils/persistence.ts`

### Naming Conventions
- Component files: PascalCase (e.g., `Dashboard.tsx`)
- Utility files: camelCase (e.g., `persistence.ts`)
- Constants: UPPER_SNAKE_CASE
- React components: PascalCase functions
- Hooks: camelCase starting with `use` prefix

## FOLDER ORGANIZATION

```
src/
├── features/          # Feature-specific components
│   ├── dashboard/     # Dashboard views
│   ├── inventory/     # Cookie inventory tracking
│   ├── trades/        # Cookie trading system
│   ├── chat/          # Messaging system
│   ├── booths/        # Booth scheduling
│   ├── calendar/      # Event calendar
│   └── admin/         # Admin panel
├── lib/
│   ├── store.tsx      # Global state management
│   ├── supabase.ts    # Supabase client init
│   ├── types.ts       # TypeScript interfaces
│   └── seedData.ts    # Default troop data
├── utils/
│   └── persistence.ts # Data access layer (Supabase + localStorage)
└── App.tsx            # Main application component

supabase/
└── migrations/
    └── 001_initial.sql  # Complete database schema

scripts/
└── seed-supabase.ts   # Database seeding script
```

## TECH STACK

### Frontend Dependencies
- **react** (18.2.0) - UI framework
- **react-dom** (18.2.0) - React DOM renderer
- **@supabase/supabase-js** (^2.49.1) - Supabase client
- **date-fns** (^2.30.0) - Date manipulation
- **lucide-react** (^0.263.1) - Icon library
- **xlsx** (^0.18.5) - Excel export functionality

### Dev Dependencies
- **vite** (^5.4.11) - Build tool and dev server
- **typescript** (^5.3.3) - Type checking
- **@vitejs/plugin-react** (^4.2.1) - React support for Vite
- **tsx** (^4.7.0) - TypeScript execution for scripts
- **dotenv** (^16.3.1) - Environment variable management

### Build Configuration
- Uses `vite.config.ts` (TypeScript) for Vite configuration
- Build command: `tsc && vite build`
- TypeScript project references: `tsconfig.json` → `tsconfig.node.json`

## PROJECT-SPECIFIC STANDARDS

### Data Persistence
- Primary: Supabase PostgreSQL with real-time sync
- Fallback: localStorage for local-only mode
- All data access goes through `src/utils/persistence.ts`
- Never directly access Supabase or localStorage from components

### State Management
- Global state managed via React Context in `src/lib/store.tsx`
- Supabase Realtime subscriptions keep state synchronized
- State includes: scouts, inventory, trades, messages, booths, events

### Cookie Types
The app tracks 10 cookie types with specific abbreviations:
- Adventurefuls (Advf), Lemon-Ups (LmUp), Trefoils (Tre), Do-Si-Dos (D-S-D)
- Samoas (Sam), Tagalongs (Tags), Thin Mints (TMint), Explore Mores (Exp)
- Toffee-tastic (Toff), Cookies for a Cause (C4C)
- Standard price: $6/box (except Toffee-tastic: $7/box)
- Troop profit: $1.00 per box sold

### User Roles
- **Scout:** Can view/edit own inventory, record sales, propose trades, send messages
- **Admin:** Full access to manage troop, edit all inventory, view all messages, manage events

### Security
- Row-Level Security (RLS) policies on all Supabase tables
- PIN-based authentication for scouts
- Password-based authentication for admin
- Admin can view all data but scout data is protected by RLS

## WORKFLOW & RELEASE RULES

### Development Workflow
1. Run `npm install` to install dependencies
2. Copy `.env.example` to `.env` and configure Supabase credentials
3. Run `npm run dev` to start local development server on port 5173
4. Run `npm run lint` to type-check TypeScript

### Building
- Build command: `npm run build`
- Runs TypeScript compiler first, then Vite build
- Output directory: `dist/`
- Base path for GitHub Pages: `/cookie-command/`

### Deployment
- **Production:** GitHub Pages via GitHub Actions workflow
- On push to `main`, GitHub Actions builds and deploys automatically
- Requires repository secrets for Supabase credentials
- No local server or ngrok needed for production

### Database Management
- Schema defined in `supabase/migrations/001_initial.sql`
- Seed data with: `npm run seed`
- Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env`

### Environment Variables
Required for production:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key
- `VITE_TROOP_ID` - Troop identification number
- `VITE_TROOP_NAME` - Troop display name
- `VITE_COUNCIL` - Girl Scout council name

## REFERENCE EXAMPLES

### Adding a New Feature Component
```typescript
// src/features/myfeature/MyFeature.tsx
import React from 'react';
import { useStore } from '../../lib/store';

export function MyFeature() {
  const { scouts, updateScout } = useStore();
  
  // Component logic here
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Accessing Data via Persistence Layer
```typescript
import { 
  loadScouts, 
  saveScout, 
  deleteScout 
} from '../../utils/persistence';

// Load data
const scouts = await loadScouts();

// Save data
await saveScout(scoutData);

// Delete data
await deleteScout(scoutId);
```

### Using Supabase Realtime
```typescript
// Already implemented in src/lib/store.tsx
const channel = supabase
  .channel('db-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'scouts' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

### Documentation Files
- **README.md** - User guide with features, usage instructions, FAQ
- **DEPLOYMENT.md** - Deployment guide for GitHub Pages + Supabase
- **DOCS.md** - Technical documentation and architecture details
- **LICENSE** - MIT License

### Key Documentation Sections
- README covers all user-facing features
- DEPLOYMENT.md covers GitHub Pages setup (not ngrok)
- DOCS.md has technical details for developers

## DEBUGGING

### Local Development
- Use browser DevTools for frontend debugging
- Check browser console for React errors
- Use Supabase dashboard for database queries
- Check Network tab for Supabase API calls

### Common Issues
1. **"Missing Supabase config"** - Check `.env` file exists with correct values
2. **Changes don't sync** - Verify Supabase Realtime is enabled in dashboard
3. **Build fails** - Run `npm run lint` to check TypeScript errors
4. **Login doesn't work** - Verify database is seeded with scout/admin accounts

### Testing
- Test locally with `npm run dev`
- Test build with `npm run build && npm run preview`
- Verify Supabase connection before deploying
- Test on mobile devices (app is mobile-first)

## FINAL DOs AND DON'Ts

### DO
- ✅ Use TypeScript with explicit types
- ✅ Access data through the persistence layer (`utils/persistence.ts`)
- ✅ Use lucide-react for icons
- ✅ Design mobile-first (app is primarily used on phones)
- ✅ Use Supabase Realtime for live updates
- ✅ Follow existing component patterns in `src/features/`
- ✅ Update TypeScript interfaces in `src/lib/types.ts` when adding fields
- ✅ Deploy to GitHub Pages for production
- ✅ Test both Supabase mode and localStorage fallback mode

### DON'T
- ❌ Don't access Supabase or localStorage directly from components
- ❌ Don't use `any` types without good reason
- ❌ Don't add new external dependencies without justification
- ❌ Don't remove or modify the localStorage fallback (needed for local dev)
- ❌ Don't change the cookie types or pricing without troop approval
- ❌ Don't add ngrok or local server deployment instructions (use GitHub Pages)
- ❌ Don't modify the database schema without creating a new migration
- ❌ Don't commit `.env` file or secrets to git
- ❌ Don't bypass Row-Level Security policies in Supabase