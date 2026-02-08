
export type ScoutLevel = 'Daisy' | 'Brownie' | 'Junior' | 'Cadette' | 'Senior' | 'Ambassador' | 'OrderCzar';

export const COOKIE_TYPES = [
  'Advf','LmUp','Tre','D-S-D','Sam','Tags','TMint','Exp','Toff','C4C'
] as const;

export type CookieType = typeof COOKIE_TYPES[number];

export const COOKIE_LABELS: Record<CookieType, string> = {
  'Advf': 'Adventurefuls',
  'LmUp': 'Lemon-Ups',
  'Tre': 'Trefoils',
  'D-S-D': 'Do-Si-Dos',
  'Sam': 'Samoas',
  'Tags': 'Tagalongs',
  'TMint': 'Thin Mints',
  'Exp': 'Explore Mores',
  'Toff': 'Toffee-tastic',
  'C4C': 'Donations (C4C)'
};

export const COOKIE_PRICE: Record<CookieType, number> = {
  'Advf': 6, 'LmUp': 6, 'Tre': 6, 'D-S-D': 6,
  'Sam': 6, 'Tags': 6, 'TMint': 6, 'Exp': 6,
  'Toff': 7, 'C4C': 6
};

export const TROOP_PROFIT_PER_BOX = 1.00;

export interface User {
  id: string;
  username: string;
  name: string;
  level: ScoutLevel;
  isOnline: boolean;
  isAdmin?: boolean;
  pin: string;
  bannerColor?: string;
}

export interface CookieRecord {
  starting: number;
  additional: number;
  sold: number;
}

export type UserInventory = Record<string, CookieRecord>;
export type AllInventory = Record<string, UserInventory>;

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string | null;
  content: string;
  timestamp: string;
}

export interface TradeRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  offering: Partial<Record<CookieType, number>>;
  requesting: Partial<Record<CookieType, number>>;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  timestamp: string;
}

export interface InventoryLog {
  id: string;
  userId: string;
  userName: string;
  cookieType: string;
  field: 'starting' | 'additional' | 'sold';
  oldValue: number;
  newValue: number;
  changedBy: string;
  timestamp: string;
}

export interface BoothSignup {
  id: string;
  business: string;
  location: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
}

export interface TroopMeeting {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface TroopNotification {
  id: string;
  type: 'meeting_added' | 'meeting_deleted';
  title: string;
  message: string;
  timestamp: string;
  readBy: string[]; // array of user IDs who have read it
}
