
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, CookieType, COOKIE_TYPES, AllInventory, CookieRecord, ChatMessage, TradeRequest, InventoryLog, BoothSignup, ScoutLevel, TroopMeeting, TroopNotification } from './types';
import { db } from '../utils/persistence';
import { generateSeedUsers, generateSeedInventory, BOOTH_SIGNUPS } from './seedData';
import { supabase } from './supabase';

const ADMIN_USER = 'courtneys';
const ADMIN_PASSWORD = 'Whatismypassword2!';

function ensureUserInventory(inv: AllInventory, userId: string): void {
  if (!inv[userId]) {
    const rec: Record<string, CookieRecord> = {};
    COOKIE_TYPES.forEach(ct => { rec[ct] = { starting: 0, additional: 0, sold: 0 }; });
    inv[userId] = rec;
  }
  for (const ct of COOKIE_TYPES) {
    if (!inv[userId][ct]) {
      inv[userId][ct] = { starting: 0, additional: 0, sold: 0 };
    }
  }
}

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  fullInventory: AllInventory;
  messages: ChatMessage[];
  trades: TradeRequest[];
  logs: InventoryLog[];
  booths: BoothSignup[];
  meetings: TroopMeeting[];
  notifications: TroopNotification[];
  isLoading: boolean;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  addUser: (name: string, level: ScoutLevel) => Promise<User>;
  removeUser: (userId: string) => Promise<void>;
  updateInventoryField: (userId: string, cookieType: CookieType, field: 'starting' | 'additional' | 'sold', value: number, byAdmin?: boolean) => Promise<void>;
  recordSale: (cookieType: CookieType, boxesSold: number) => Promise<void>;
  transferBoxes: (fromUserId: string, toUserId: string, cookieType: CookieType, qty: number) => Promise<void>;
  sendMessage: (content: string, recipientId?: string | null) => Promise<void>;
  createTrade: (toUserId: string, offering: Partial<Record<CookieType, number>>, requesting: Partial<Record<CookieType, number>>) => Promise<void>;
  respondTrade: (tradeId: string, accept: boolean) => Promise<void>;
  updateBanner: (color: string) => Promise<void>;
  resetSystem: () => Promise<void>;
  getRemaining: (userId: string, ct: CookieType) => number;
  addBooth: (booth: Omit<BoothSignup, 'id'>) => Promise<void>;
  removeBooth: (boothId: string) => Promise<void>;
  addMeeting: (meeting: Omit<TroopMeeting, 'id'>) => Promise<void>;
  removeMeeting: (meetingId: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  unreadNotificationCount: number;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [fullInventory, setFullInventory] = useState<AllInventory>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [trades, setTrades] = useState<TradeRequest[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [booths, setBooths] = useState<BoothSignup[]>([]);
  const [meetings, setMeetings] = useState<TroopMeeting[]>([]);
  const [notifications, setNotifications] = useState<TroopNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      let loadedUsers = await db.getUsers();
      
      if (loadedUsers.length > 0) {
        // Ensure admin password is current
        const adminIdx = loadedUsers.findIndex(u => u.username === ADMIN_USER && u.isAdmin);
        if (adminIdx >= 0 && loadedUsers[adminIdx].pin !== ADMIN_PASSWORD) {
          loadedUsers[adminIdx] = { ...loadedUsers[adminIdx], pin: ADMIN_PASSWORD };
          await db.upsertUser(loadedUsers[adminIdx]);
        }
        setUsers(loadedUsers);
      } else {
        // First run — seed data
        const seed = generateSeedUsers();
        setUsers(seed);
        await db.saveAllUsers(seed);

        const seedInv = generateSeedInventory(seed);
        setFullInventory(seedInv);
        await db.saveInventory(seedInv);
      }

      const loadedInv = await db.getInventory();
      if (Object.keys(loadedInv).length > 0) setFullInventory(loadedInv);

      setMessages(await db.getMessages());
      setTrades(await db.getTrades());
      setLogs(await db.getLogs());

      const loadedBooths = await db.getBooths();
      if (loadedBooths.length > 0) {
        setBooths(loadedBooths);
      } else {
        setBooths(BOOTH_SIGNUPS);
        await db.saveAllBooths(BOOTH_SIGNUPS);
      }

      setMeetings(await db.getMeetings());
      setNotifications(await db.getNotifications());

      setIsLoading(false);
    };
    init();

    // Set up Supabase realtime subscriptions
    const channel = supabase
      .channel('troop-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
        setMessages(await db.getMessages());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, async () => {
        setTrades(await db.getTrades());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async () => {
        setNotifications(await db.getNotifications());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, async () => {
        setFullInventory(await db.getInventory());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booths' }, async () => {
        setBooths(await db.getBooths());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, async () => {
        setMeetings(await db.getMeetings());
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveUsers = async (u: User[]) => {
    setUsers(u);
    await db.saveAllUsers(u);
  };

  const saveInventory = async (inv: AllInventory) => {
    setFullInventory(inv);
    await db.saveInventory(inv);
  };

  const saveMessages = async (m: ChatMessage[]) => {
    setMessages(m);
    // Messages are saved individually via db.addMessage
  };

  const saveTrades = async (t: TradeRequest[]) => {
    setTrades(t);
    // Trades are saved individually or updated via db methods
  };

  const saveLogs = async (l: InventoryLog[]) => {
    setLogs(l);
    // Logs are saved individually via db.addLog
  };

  const saveBooths = async (b: BoothSignup[]) => {
    setBooths(b);
    await db.saveAllBooths(b);
  };

  const saveMeetings = async (m: TroopMeeting[]) => {
    setMeetings(m);
    // Meetings saved individually via db methods
  };

  const saveNotifications = async (n: TroopNotification[]) => {
    setNotifications(n);
    // Notifications saved individually via db methods
  };

  const login = async (username: string, pin: string): Promise<boolean> => {
    const clean = username.toLowerCase().trim();
    const user = users.find(u => u.username === clean);
    if (!user) return false;
    if (user.isAdmin) {
      if (pin === ADMIN_PASSWORD || pin === user.pin) {
        setCurrentUser(user);
        return true;
      }
      return false;
    }
    if (pin === user.pin) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addUser = async (name: string, level: ScoutLevel): Promise<User> => {
    const clean = name.trim().toLowerCase().replace(/[^a-z\s]/g, '');
    const parts = clean.split(/\s+/);
    let un = parts[0] + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '');
    if (users.find(u => u.username === un)) {
      un = parts[0] + (parts.length > 1 ? parts[parts.length - 1].substring(0, 3) : '') + String(Math.floor(Math.random() * 9));
    }
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const newUser: User = {
      id: `u_${un}`,
      username: un,
      name: name.trim(),
      level,
      isOnline: false,
      isAdmin: false,
      pin
    };
    const updated = [...users, newUser];
    await saveUsers(updated);

    const inv = { ...fullInventory };
    const rec: Record<string, CookieRecord> = {};
    COOKIE_TYPES.forEach(ct => { rec[ct] = { starting: 0, additional: 0, sold: 0 }; });
    inv[newUser.id] = rec;
    await saveInventory(inv);

    return newUser;
  };

  const removeUser = async (userId: string) => {
    if (!currentUser?.isAdmin) return;
    await db.deleteUser(userId);
    await db.deleteInventoryForUser(userId);
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    const inv = { ...fullInventory };
    delete inv[userId];
    setFullInventory(inv);
  };

  const getRemaining = (userId: string, ct: CookieType): number => {
    const rec = fullInventory[userId]?.[ct];
    if (!rec) return 0;
    return rec.starting + rec.additional - rec.sold;
  };

  const updateInventoryField = async (userId: string, cookieType: CookieType, field: 'starting' | 'additional' | 'sold', value: number, byAdmin: boolean = false) => {
    const inv = { ...fullInventory };
    ensureUserInventory(inv, userId);

    const oldVal = inv[userId][cookieType][field];
    inv[userId][cookieType] = { ...inv[userId][cookieType], [field]: value };
    await saveInventory(inv);

    const user = users.find(u => u.id === userId);
    const logEntry: InventoryLog = {
      id: crypto.randomUUID(),
      userId,
      userName: user?.name || 'Unknown',
      cookieType,
      field,
      oldValue: oldVal,
      newValue: value,
      changedBy: currentUser?.name || 'System',
      timestamp: new Date().toISOString()
    };
    await db.addLog(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const recordSale = async (cookieType: CookieType, boxesSold: number) => {
    if (!currentUser) return;
    const rec = fullInventory[currentUser.id]?.[cookieType];
    if (!rec) return;
    const newSold = rec.sold + boxesSold;
    await updateInventoryField(currentUser.id, cookieType, 'sold', newSold);
  };

  const transferBoxes = async (fromUserId: string, toUserId: string, cookieType: CookieType, qty: number) => {
    if (!currentUser?.isAdmin) return;
    const inv = { ...fullInventory };
    ensureUserInventory(inv, fromUserId);
    ensureUserInventory(inv, toUserId);

    const fromRec = inv[fromUserId][cookieType];
    const fromRemaining = fromRec.starting + fromRec.additional - fromRec.sold;
    if (fromRemaining < qty) return;
    inv[fromUserId][cookieType] = { ...fromRec, additional: fromRec.additional - qty };

    inv[toUserId][cookieType] = { ...inv[toUserId][cookieType], additional: inv[toUserId][cookieType].additional + qty };

    await saveInventory(inv);

    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);
    const log1: InventoryLog = {
      id: crypto.randomUUID(), userId: fromUserId, userName: fromUser?.name || '', cookieType,
      field: 'additional', oldValue: fullInventory[fromUserId]?.[cookieType]?.additional || 0,
      newValue: inv[fromUserId][cookieType].additional,
      changedBy: `Transfer to ${toUser?.name}`, timestamp: new Date().toISOString()
    };
    const log2: InventoryLog = {
      id: crypto.randomUUID(), userId: toUserId, userName: toUser?.name || '', cookieType,
      field: 'additional', oldValue: fullInventory[toUserId]?.[cookieType]?.additional || 0,
      newValue: inv[toUserId][cookieType].additional,
      changedBy: `Transfer from ${fromUser?.name}`, timestamp: new Date().toISOString()
    };
    await db.addLog(log1);
    await db.addLog(log2);
    setLogs(prev => [...prev, log1, log2]);
  };

  const sendMessage = async (content: string, recipientId: string | null = null) => {
    if (!currentUser) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId,
      content,
      timestamp: new Date().toISOString()
    };
    await db.addMessage(msg);
    setMessages(prev => [...prev, msg]);
  };

  const createTrade = async (toUserId: string, offering: Partial<Record<CookieType, number>>, requesting: Partial<Record<CookieType, number>>) => {
    if (!currentUser) return;
    const toUser = users.find(u => u.id === toUserId);
    const trade: TradeRequest = {
      id: crypto.randomUUID(),
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId,
      toUserName: toUser?.name || '',
      offering,
      requesting,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    await db.addTrade(trade);
    setTrades(prev => [...prev, trade]);
  };

  const respondTrade = async (tradeId: string, accept: boolean) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade || trade.status !== 'pending') return;

    if (accept) {
      const inv = { ...fullInventory };
      ensureUserInventory(inv, trade.fromUserId);
      ensureUserInventory(inv, trade.toUserId);

      for (const [ct, qty] of Object.entries(trade.offering)) {
        if (!qty || qty <= 0) continue;
        const cookieType = ct as CookieType;
        const fromRec = inv[trade.fromUserId][cookieType];
        const fromRemaining = fromRec.starting + fromRec.additional - fromRec.sold;
        if (fromRemaining < qty) { return; }
      }
      for (const [ct, qty] of Object.entries(trade.requesting)) {
        if (!qty || qty <= 0) continue;
        const cookieType = ct as CookieType;
        const toRec = inv[trade.toUserId][cookieType];
        const toRemaining = toRec.starting + toRec.additional - toRec.sold;
        if (toRemaining < qty) { return; }
      }

      for (const [ct, qty] of Object.entries(trade.offering)) {
        if (!qty || qty <= 0) continue;
        const cookieType = ct as CookieType;
        inv[trade.fromUserId][cookieType] = {
          ...inv[trade.fromUserId][cookieType],
          additional: inv[trade.fromUserId][cookieType].additional - qty
        };
        inv[trade.toUserId][cookieType] = {
          ...inv[trade.toUserId][cookieType],
          additional: inv[trade.toUserId][cookieType].additional + qty
        };
      }
      for (const [ct, qty] of Object.entries(trade.requesting)) {
        if (!qty || qty <= 0) continue;
        const cookieType = ct as CookieType;
        inv[trade.toUserId][cookieType] = {
          ...inv[trade.toUserId][cookieType],
          additional: inv[trade.toUserId][cookieType].additional - qty
        };
        inv[trade.fromUserId][cookieType] = {
          ...inv[trade.fromUserId][cookieType],
          additional: inv[trade.fromUserId][cookieType].additional + qty
        };
      }
      await saveInventory(inv);
    }

    const updated = trades.map(t => t.id === tradeId ? { ...t, status: accept ? 'accepted' as const : 'rejected' as const } : t);
    await db.updateTradeStatus(tradeId, accept ? 'accepted' : 'rejected');
    setTrades(updated);
  };

  const updateBanner = async (color: string) => {
    if (!currentUser) return;
    const updated = users.map(u => u.id === currentUser.id ? { ...u, bannerColor: color } : u);
    setCurrentUser({ ...currentUser, bannerColor: color });
    await saveUsers(updated);
  };

  const addBooth = async (booth: Omit<BoothSignup, 'id'>) => {
    if (!currentUser?.isAdmin) return;
    const newBooth: BoothSignup = { id: crypto.randomUUID(), ...booth };
    await db.addBooth(newBooth);
    setBooths(prev => [...prev, newBooth]);
  };

  const removeBooth = async (boothId: string) => {
    if (!currentUser?.isAdmin) return;
    await db.deleteBooth(boothId);
    setBooths(prev => prev.filter(b => b.id !== boothId));
  };

  const addMeeting = async (meeting: Omit<TroopMeeting, 'id'>) => {
    if (!currentUser?.isAdmin) return;
    const newMeeting: TroopMeeting = { id: crypto.randomUUID(), ...meeting };
    await db.addMeeting(newMeeting);
    setMeetings(prev => [...prev, newMeeting]);

    const notif: TroopNotification = {
      id: crypto.randomUUID(),
      type: 'meeting_added',
      title: '📅 New Troop Meeting',
      message: `"${meeting.title}" has been scheduled for ${formatDateForNotif(meeting.date)} at ${meeting.startTime}.${meeting.location ? ' Location: ' + meeting.location : ''}`,
      timestamp: new Date().toISOString(),
      readBy: [currentUser.id]
    };
    await db.addNotification(notif);
    setNotifications(prev => [...prev, notif]);
  };

  const removeMeeting = async (meetingId: string) => {
    if (!currentUser?.isAdmin) return;
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    await db.deleteMeeting(meetingId);
    setMeetings(prev => prev.filter(m => m.id !== meetingId));

    const notif: TroopNotification = {
      id: crypto.randomUUID(),
      type: 'meeting_deleted',
      title: '🚫 Meeting Cancelled',
      message: `"${meeting.title}" on ${formatDateForNotif(meeting.date)} has been cancelled.`,
      timestamp: new Date().toISOString(),
      readBy: [currentUser.id]
    };
    await db.addNotification(notif);
    setNotifications(prev => [...prev, notif]);
  };

  const markNotificationsRead = async () => {
    if (!currentUser) return;
    await db.markNotificationsRead(currentUser.id);
    const updated = notifications.map(n => {
      if (n.readBy.includes(currentUser.id)) return n;
      return { ...n, readBy: [...n.readBy, currentUser.id] };
    });
    setNotifications(updated);
  };

  const unreadNotificationCount = currentUser
    ? notifications.filter(n => !n.readBy.includes(currentUser.id)).length
    : 0;

  const resetSystem = async () => {
    if (!currentUser?.isAdmin) return;
    await db.clearAll();
    const seed = generateSeedUsers();
    const seedInv = generateSeedInventory(seed);
    setUsers(seed);
    setFullInventory(seedInv);
    setMessages([]);
    setTrades([]);
    setLogs([]);
    setBooths(BOOTH_SIGNUPS);
    setMeetings([]);
    setNotifications([]);
    const admin = seed.find(u => u.isAdmin)!;
    setCurrentUser(admin);
    await db.saveAllUsers(seed);
    await db.saveInventory(seedInv);
    await db.saveAllBooths(BOOTH_SIGNUPS);
  };

  return (
    <StoreContext.Provider value={{
      currentUser, users, fullInventory, messages, trades, logs, booths, meetings, notifications, isLoading,
      login, logout, addUser, removeUser,
      updateInventoryField, recordSale, transferBoxes,
      sendMessage, createTrade, respondTrade,
      updateBanner, resetSystem, getRemaining,
      addBooth, removeBooth, addMeeting, removeMeeting,
      markNotificationsRead, unreadNotificationCount
    }}>
      {children}
    </StoreContext.Provider>
  );
}

function formatDateForNotif(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function useCookieStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useCookieStore must be within CookieProvider');
  return ctx;
}
