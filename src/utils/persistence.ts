
import { supabase, TROOP_ID } from '../lib/supabase';
import {
  User,
  CookieType,
  COOKIE_TYPES,
  AllInventory,
  CookieRecord,
  ChatMessage,
  TradeRequest,
  InventoryLog,
  BoothSignup,
  TroopMeeting,
  TroopNotification,
} from '../lib/types';

// ============================================================
// Supabase-backed persistence layer
// Falls back to localStorage if Supabase is not configured.
// ============================================================

const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return !!url && !url.includes('YOUR_PROJECT_ID');
};

// ---------- LOCAL STORAGE FALLBACK ----------

const localPersistence = {
  setItem: async (key: string, value: string): Promise<void> => {
    try { localStorage.setItem(key, value); } catch { /* quota exceeded */ }
  },
  getItem: async (key: string): Promise<string | null> => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  removeItem: async (key: string): Promise<void> => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
  clear: async (): Promise<void> => {
    try { localStorage.clear(); } catch { /* noop */ }
  },
};

// ---------- SUPABASE DATA ACCESS ----------

export const db = {
  // ----- USERS -----
  async getUsers(): Promise<User[]> {
    if (!isSupabaseConfigured()) {
      const raw = await localPersistence.getItem('users_v2');
      return raw ? JSON.parse(raw) : [];
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('troop_id', TROOP_ID)
      .order('name');
    if (error) { console.error('getUsers error:', error); return []; }
    return (data || []).map(mapDbUser);
  },

  async upsertUser(user: User): Promise<void> {
    if (!isSupabaseConfigured()) {
      const users = await this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) users[idx] = user; else users.push(user);
      await localPersistence.setItem('users_v2', JSON.stringify(users));
      return;
    }
    const { error } = await supabase.from('users').upsert(mapUserToDb(user));
    if (error) console.error('upsertUser error:', error);
  },

  async saveAllUsers(users: User[]): Promise<void> {
    if (!isSupabaseConfigured()) {
      await localPersistence.setItem('users_v2', JSON.stringify(users));
      return;
    }
    const { error } = await supabase.from('users').upsert(users.map(mapUserToDb));
    if (error) console.error('saveAllUsers error:', error);
  },

  async deleteUser(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const users = await this.getUsers();
      await localPersistence.setItem('users_v2', JSON.stringify(users.filter(u => u.id !== userId)));
      return;
    }
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) console.error('deleteUser error:', error);
  },

  // ----- INVENTORY -----
  async getInventory(): Promise<AllInventory> {
    if (!isSupabaseConfigured()) {
      const raw = await localPersistence.getItem('inventory_v2');
      return raw ? JSON.parse(raw) : {};
    }
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('troop_id', TROOP_ID);
    if (error) { console.error('getInventory error:', error); return {}; }
    return mapDbInventory(data || []);
  },

  async saveInventory(inv: AllInventory): Promise<void> {
    if (!isSupabaseConfigured()) {
      await localPersistence.setItem('inventory_v2', JSON.stringify(inv));
      return;
    }
    const rows = flattenInventory(inv);
    if (rows.length === 0) return;
    const { error } = await supabase.from('inventory').upsert(rows, { onConflict: 'user_id,cookie_type' });
    if (error) console.error('saveInventory error:', error);
  },

  async deleteInventoryForUser(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const inv = await this.getInventory();
      delete inv[userId];
      await localPersistence.setItem('inventory_v2', JSON.stringify(inv));
      return;
    }
    const { error } = await supabase.from('inventory').delete().eq('user_id', userId);
    if (error) console.error('deleteInventoryForUser error:', error);
  },

  // ----- MESSAGES -----
  async getMessages(): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured()) {
      const raw = await localPersistence.getItem('messages_v2');
      return raw ? JSON.parse(raw) : [];
    }
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('troop_id', TROOP_ID)
      .order('created_at');
    if (error) { console.error('getMessages error:', error); return []; }
    return (data || []).map(mapDbMessage);
  },

  async addMessage(msg: ChatMessage): Promise<void> {
    if (!isSupabaseConfigured()) {
      const msgs = await this.getMessages();
      msgs.push(msg);
      await localPersistence.setItem('messages_v2', JSON.stringify(msgs));
      return;
    }
    const { error } = await supabase.from('messages').insert(mapMessageToDb(msg));
    if (error) console.error('addMessage error:', error);
  },

  // ----- TRADES -----
  async getTrades(): Promise<TradeRequest[]> {
    if (!isSupabaseConfigured()) {
      const raw = await localPersistence.getItem('trades_v2');
      return raw ? JSON.parse(raw) : [];
    }
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('troop_id', TROOP_ID)
      .order('created_at', { ascending: false });
    if (error) { console.error('getTrades error:', error); return []; }
    return (data || []).map(mapDbTrade);
  },

  async addTrade(trade: TradeRequest): Promise<void> {
    if (!isSupabaseConfigured()) {
      const trades = await this.getTrades();
      trades.push(trade);
      await localPersistence.setItem('trades_v2', JSON.stringify(trades));
      return;
    }
    const { error } = await supabase.from('trades').insert(mapTradeToDb(trade));
    if (error) console.error('addTrade error:', error);
  },

  async updateTradeStatus(tradeId: string, status: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const trades = await this.getTrades();
      const updated = trades.map(t => t.id === tradeId ? { ...t, status: status as any } : t);
      await localPersistence.setItem('trades_v2', JSON.stringify(updated));
      return;
    }
    const { error } = await supabase.from('trades').update({ status }).eq('id', tradeId);
    if (error) console.error('updateTradeStatus error:', error);
  },

  // ----- BOOTHS -----
  async getBooths(): Promise<BoothSignup[]> {
    if (!isSupabaseConfigured()) {
      const raw = await localPersistence.getItem('booths_v2');
      return raw ? JSON.parse(raw) : [];
    }
    const { data, error } = await supabase
      .from('booths')
      .select('*')
      .eq('troop_id', TROOP_ID)
      .order('date');
    if (error) { console.error('getBooths error:', error); return []; }
    return (data || []).map(mapDbBooth);
  },

  async addBooth(booth: BoothSignup): Promise<void> {
    if (!isSupabaseConfigured()) {
      const booths = await this.getBooths();
      booths.push(booth);
      await localPersistence.setItem('booths_v2', JSON.stringify(booths));
      return;
    }
    const { error } = await supabase.from('booths').insert(mapBoothToDb(booth));
    if (error) console.error('addBooth error:', error);
  },

  async deleteBooth(boothId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const booths = await this.getBooths();
      await localPersistence.setItem('booths_v2', JSON.stringify(booths.filter(b => b.id !== boothId)));
      return;
    }
    const { error } = await supabase.from('booths').delete().eq('id', boothId);
    if (error) console.error('deleteBooth error:', error);
  },

  async saveAllBooths(booths: BoothSignup[]): Promise<void> {
    if (!isSupabaseConfigured()) {
      await localPersistence.setItem('booths_v2', JSON.stringify(booths));
      return;
    }
    const { error } = await supabase.from('booths').upsert(booths.map(mapBoothToDb));
    if (error) console.error('saveAllBooths error:', error);
  },

  // ----- MEETINGS -----
  async getMeetings(): Promise<TroopMeeting[]> {
    if (!isSupabaseConfigured()) {
      const raw = await localPersistence.getItem('meetings_v2');
      return raw ? JSON.parse(raw) : [];
    }
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('troop_id', TROOP_ID)
      .order('date');
    if (error) { console.error('getMeetings error:', error); return []; }
    return (data || []).map(mapDbMeeting);
  },

  async addMeeting(meeting: TroopMeeting): Promise<void> {
    if (!isSupabaseConfigured()) {
      const meetings = await this.getMeetings();
      meetings.push(meeting);
      await localPersistence.setItem('meetings_v2', JSON.stringify(meetings));
      return;
    }
    const { error } = await supabase.from('meetings').insert(mapMeetingToDb(meeting));
    if (error) console.error('addMeeting error:', error);
  },

  async deleteMeeting(meetingId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const meetings = await this.getMeetings();
      await localPersistence.setItem('meetings_v2', JSON.stringify(meetings.filter(m => m.id !== meetingId)));
      return;
    }
    const { error } = await supabase.from('meetings').delete().eq('id', meetingId);
    if (error) console.error('deleteMeeting error:', error);
  },

  // ----- NOTIFICATIONS -----
  async getNotifications(): Promise<TroopNotification[]> {
    if (!isSupabaseConfigured()) {
      const raw = await localPersistence.getItem('notifications_v2');
      return raw ? JSON.parse(raw) : [];
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('troop_id', TROOP_ID)
      .order('created_at', { ascending: false });
    if (error) { console.error('getNotifications error:', error); return []; }
    return (data || []).map(mapDbNotification);
  },

  async addNotification(notif: TroopNotification): Promise<void> {
    if (!isSupabaseConfigured()) {
      const notifs = await this.getNotifications();
      notifs.push(notif);
      await localPersistence.setItem('notifications_v2', JSON.stringify(notifs));
      return;
    }
    const { error } = await supabase.from('notifications').insert(mapNotificationToDb(notif));
    if (error) console.error('addNotification error:', error);
  },

  async markNotificationsRead(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const notifs = await this.getNotifications();
      const updated = notifs.map(n =>
        n.readBy.includes(userId) ? n : { ...n, readBy: [...n.readBy, userId] }
      );
      await localPersistence.setItem('notifications_v2', JSON.stringify(updated));
      return;
    }
    const { data: notifs } = await supabase
      .from('notifications')
      .select('id, read_by')
      .eq('troop_id', TROOP_ID);
    if (!notifs) return;
    for (const n of notifs) {
      if (!(n.read_by || []).includes(userId)) {
        await supabase
          .from('notifications')
          .update({ read_by: [...(n.read_by || []), userId] })
          .eq('id', n.id);
      }
    }
  },

  // ----- AUDIT LOG -----
  async getLogs(): Promise<InventoryLog[]> {
    if (!isSupabaseConfigured()) {
      const raw = await localPersistence.getItem('logs_v2');
      return raw ? JSON.parse(raw) : [];
    }
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('troop_id', TROOP_ID)
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) { console.error('getLogs error:', error); return []; }
    return (data || []).map(mapDbLog);
  },

  async addLog(log: InventoryLog): Promise<void> {
    if (!isSupabaseConfigured()) {
      const logs = await this.getLogs();
      logs.push(log);
      await localPersistence.setItem('logs_v2', JSON.stringify(logs));
      return;
    }
    const { error } = await supabase.from('audit_log').insert(mapLogToDb(log));
    if (error) console.error('addLog error:', error);
  },

  // ----- RESET -----
  async clearAll(): Promise<void> {
    if (!isSupabaseConfigured()) {
      await localPersistence.clear();
      return;
    }
    await supabase.from('audit_log').delete().eq('troop_id', TROOP_ID);
    await supabase.from('notifications').delete().eq('troop_id', TROOP_ID);
    await supabase.from('messages').delete().eq('troop_id', TROOP_ID);
    await supabase.from('trades').delete().eq('troop_id', TROOP_ID);
    await supabase.from('inventory').delete().eq('troop_id', TROOP_ID);
    await supabase.from('meetings').delete().eq('troop_id', TROOP_ID);
    await supabase.from('booths').delete().eq('troop_id', TROOP_ID);
    await supabase.from('users').delete().eq('troop_id', TROOP_ID);
  },
};

// ============================================================
// MAPPING HELPERS: DB rows <-> App types
// ============================================================

function mapDbUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    level: row.level,
    isAdmin: row.is_admin,
    isOnline: row.is_online || false,
    pin: row.pin,
    bannerColor: row.banner_color || undefined,
  };
}

function mapUserToDb(user: User): any {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    level: user.level,
    is_admin: user.isAdmin || false,
    is_online: user.isOnline || false,
    pin: user.pin,
    banner_color: user.bannerColor || null,
    troop_id: TROOP_ID,
  };
}

function mapDbInventory(rows: any[]): AllInventory {
  const inv: AllInventory = {};
  for (const row of rows) {
    if (!inv[row.user_id]) inv[row.user_id] = {};
    inv[row.user_id][row.cookie_type] = {
      starting: row.starting,
      additional: row.additional,
      sold: row.sold,
    };
  }
  return inv;
}

function flattenInventory(inv: AllInventory): any[] {
  const rows: any[] = [];
  for (const [userId, cookies] of Object.entries(inv)) {
    for (const [cookieType, rec] of Object.entries(cookies)) {
      rows.push({
        user_id: userId,
        cookie_type: cookieType,
        starting: (rec as CookieRecord).starting,
        additional: (rec as CookieRecord).additional,
        sold: (rec as CookieRecord).sold,
        troop_id: TROOP_ID,
      });
    }
  }
  return rows;
}

function mapDbMessage(row: any): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    recipientId: row.recipient_id,
    content: row.content,
    timestamp: row.created_at,
  };
}

function mapMessageToDb(msg: ChatMessage): any {
  return {
    id: msg.id,
    sender_id: msg.senderId,
    sender_name: msg.senderName,
    recipient_id: msg.recipientId,
    content: msg.content,
    troop_id: TROOP_ID,
    created_at: msg.timestamp,
  };
}

function mapDbTrade(row: any): TradeRequest {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    fromUserName: row.from_user_name,
    toUserId: row.to_user_id,
    toUserName: row.to_user_name,
    offering: row.offering,
    requesting: row.requesting,
    status: row.status,
    timestamp: row.created_at,
  };
}

function mapTradeToDb(trade: TradeRequest): any {
  return {
    id: trade.id,
    from_user_id: trade.fromUserId,
    from_user_name: trade.fromUserName,
    to_user_id: trade.toUserId,
    to_user_name: trade.toUserName,
    offering: trade.offering,
    requesting: trade.requesting,
    status: trade.status,
    troop_id: TROOP_ID,
    created_at: trade.timestamp,
  };
}

function mapDbBooth(row: any): BoothSignup {
  return {
    id: row.id,
    business: row.business,
    location: row.location,
    notes: row.notes || '',
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration || '',
  };
}

function mapBoothToDb(booth: BoothSignup): any {
  return {
    id: booth.id,
    business: booth.business,
    location: booth.location,
    notes: booth.notes,
    date: booth.date,
    start_time: booth.startTime,
    end_time: booth.endTime,
    duration: booth.duration,
    troop_id: TROOP_ID,
  };
}

function mapDbMeeting(row: any): TroopMeeting {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location || '',
  };
}

function mapMeetingToDb(meeting: TroopMeeting): any {
  return {
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    date: meeting.date,
    start_time: meeting.startTime,
    end_time: meeting.endTime,
    location: meeting.location,
    troop_id: TROOP_ID,
  };
}

function mapDbNotification(row: any): TroopNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    timestamp: row.created_at,
    readBy: row.read_by || [],
  };
}

function mapNotificationToDb(notif: TroopNotification): any {
  return {
    id: notif.id,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    troop_id: TROOP_ID,
    read_by: notif.readBy,
    created_at: notif.timestamp,
  };
}

function mapDbLog(row: any): InventoryLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    cookieType: row.cookie_type,
    field: row.field,
    oldValue: row.old_value,
    newValue: row.new_value,
    changedBy: row.changed_by,
    timestamp: row.created_at,
  };
}

function mapLogToDb(log: InventoryLog): any {
  return {
    id: log.id,
    user_id: log.userId,
    user_name: log.userName,
    cookie_type: log.cookieType,
    field: log.field,
    old_value: log.oldValue,
    new_value: log.newValue,
    changed_by: log.changedBy,
    troop_id: TROOP_ID,
    created_at: log.timestamp,
  };
}

// Legacy persistence export for backward compatibility
export const persistence = localPersistence;
