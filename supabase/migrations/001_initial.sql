-- CookieCommand Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all tables, indexes, and Row Level Security policies.

-- ============================================================
-- 1. USERS TABLE (troop members — scouts + admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Daisy','Brownie','Junior','Cadette','Senior','Ambassador','OrderCzar')),
  is_admin BOOLEAN DEFAULT FALSE,
  pin TEXT NOT NULL,
  banner_color TEXT DEFAULT NULL,
  troop_id TEXT NOT NULL DEFAULT '04326',
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_troop ON public.users(troop_id);
CREATE INDEX idx_users_username ON public.users(username);

-- ============================================================
-- 2. INVENTORY TABLE (per-user, per-cookie-type box counts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cookie_type TEXT NOT NULL,
  starting INTEGER DEFAULT 0,
  additional INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  troop_id TEXT NOT NULL DEFAULT '04326',
  UNIQUE(user_id, cookie_type)
);

CREATE INDEX idx_inventory_user ON public.inventory(user_id);
CREATE INDEX idx_inventory_troop ON public.inventory(troop_id);

-- ============================================================
-- 3. MESSAGES TABLE (group chat + DMs)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  troop_id TEXT NOT NULL DEFAULT '04326',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_troop ON public.messages(troop_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);

-- ============================================================
-- 4. TRADES TABLE (cookie trade proposals)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_user_name TEXT NOT NULL,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_name TEXT NOT NULL,
  offering JSONB NOT NULL DEFAULT '{}',
  requesting JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled')),
  troop_id TEXT NOT NULL DEFAULT '04326',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trades_troop ON public.trades(troop_id);
CREATE INDEX idx_trades_from ON public.trades(from_user_id);
CREATE INDEX idx_trades_to ON public.trades(to_user_id);

-- ============================================================
-- 5. BOOTHS TABLE (cookie booth signups)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.booths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business TEXT NOT NULL,
  location TEXT NOT NULL,
  notes TEXT DEFAULT '',
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration TEXT DEFAULT '',
  troop_id TEXT NOT NULL DEFAULT '04326',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_booths_troop ON public.booths(troop_id);
CREATE INDEX idx_booths_date ON public.booths(date);

-- ============================================================
-- 6. MEETINGS TABLE (troop meetings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT DEFAULT '',
  troop_id TEXT NOT NULL DEFAULT '04326',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meetings_troop ON public.meetings(troop_id);
CREATE INDEX idx_meetings_date ON public.meetings(date);

-- ============================================================
-- 7. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('meeting_added','meeting_deleted')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  troop_id TEXT NOT NULL DEFAULT '04326',
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_troop ON public.notifications(troop_id);

-- ============================================================
-- 8. AUDIT LOG TABLE (inventory change history)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  cookie_type TEXT NOT NULL,
  field TEXT NOT NULL CHECK (field IN ('starting','additional','sold')),
  old_value INTEGER NOT NULL,
  new_value INTEGER NOT NULL,
  changed_by TEXT NOT NULL,
  troop_id TEXT NOT NULL DEFAULT '04326',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_troop ON public.audit_log(troop_id);
CREATE INDEX idx_audit_user ON public.audit_log(user_id);

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- For simplicity with PIN-based auth (not Supabase Auth), we use
-- anon access with the troop_id acting as a scoping mechanism.
-- The app handles authorization logic in the frontend.
-- In a future version, you could integrate Supabase Auth for tighter security.

-- USERS: anyone with the anon key can read users in their troop
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);
CREATE POLICY "Users are insertable by everyone" ON public.users
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users are updatable by everyone" ON public.users
  FOR UPDATE USING (true);
CREATE POLICY "Users are deletable by everyone" ON public.users
  FOR DELETE USING (true);

-- INVENTORY: full access (app-level auth handles permissions)
CREATE POLICY "Inventory full access" ON public.inventory
  FOR ALL USING (true) WITH CHECK (true);

-- MESSAGES: full access
CREATE POLICY "Messages full access" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

-- TRADES: full access  
CREATE POLICY "Trades full access" ON public.trades
  FOR ALL USING (true) WITH CHECK (true);

-- BOOTHS: full access
CREATE POLICY "Booths full access" ON public.booths
  FOR ALL USING (true) WITH CHECK (true);

-- MEETINGS: full access
CREATE POLICY "Meetings full access" ON public.meetings
  FOR ALL USING (true) WITH CHECK (true);

-- NOTIFICATIONS: full access
CREATE POLICY "Notifications full access" ON public.notifications
  FOR ALL USING (true) WITH CHECK (true);

-- AUDIT LOG: full access
CREATE POLICY "Audit log full access" ON public.audit_log
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 10. ENABLE REALTIME for live-sync tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booths;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
