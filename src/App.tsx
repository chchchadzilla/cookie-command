
import React, { useState } from 'react';
import './App.css';
import { CookieProvider, useCookieStore } from './lib/store';
import { LoginScreen } from './features/auth/LoginScreen';
import { Dashboard } from './features/dashboard/Dashboard';
import { AdminPanel } from './features/admin/AdminPanel';
import { SocialHub } from './features/social/SocialHub';
import { BoothSchedule } from './features/booths/BoothSchedule';
import { TradeCenter } from './features/trades/TradeCenter';
import { InventoryEntry } from './features/inventory/InventoryEntry';
import { NotificationPanel } from './features/notifications/NotificationPanel';
import { Cookie, LogOut, LayoutDashboard, Users, MessageSquare, Store, ArrowLeftRight, Package, Bell } from 'lucide-react';

type Tab = 'dashboard' | 'inventory' | 'admin' | 'chat' | 'booths' | 'trades';

function ProtectedLayout() {
  const { currentUser, logout, isLoading, unreadNotificationCount } = useCookieStore();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  if (isLoading) return <div className="loading-screen"><div className="loading-spinner" /><p>Loading Troop Data...</p></div>;
  if (!currentUser) return <LoginScreen />;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'inventory', label: 'My Cookies', icon: <Package size={18} /> },
    { id: 'trades', label: 'Trades', icon: <ArrowLeftRight size={18} /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={18} /> },
    { id: 'booths', label: 'Booths', icon: <Store size={18} /> },
    { id: 'admin', label: 'Manage Troop', icon: <Users size={18} />, adminOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || currentUser.isAdmin);

  return (
    <div className="layout">
      <header className="main-header">
        <div className="logo-area">
          <div className="logo-circle"><Cookie size={24} color="white" /></div>
          <h1>CookieCommand</h1>
          <span className="troop-badge">Troop 04326</span>
        </div>
        <div className="user-nav">
          <button
            className="notif-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotificationCount > 0 && (
              <span className="notif-badge-count">{unreadNotificationCount}</span>
            )}
          </button>
          <div className="user-pill">
            <span className="scout-name">{currentUser.name}</span>
            <span className={`scout-tag ${currentUser.level.toLowerCase()}`}>{currentUser.level}</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign Out"><LogOut size={18} /></button>
        </div>
      </header>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      <nav className="tab-nav">
        {visibleTabs.map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon}
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'inventory' && <InventoryEntry />}
        {activeTab === 'trades' && <TradeCenter />}
        {activeTab === 'chat' && <SocialHub />}
        {activeTab === 'booths' && <BoothSchedule />}
        {activeTab === 'admin' && currentUser.isAdmin && <AdminPanel />}
      </main>

      <footer className="footer-note">
        Troop 04326 • GSGLA 2025-26 Cookie Season • <span style={{color: '#22c55e'}}>● Connected</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <CookieProvider>
      <ProtectedLayout />
    </CookieProvider>
  );
}

export default App;
