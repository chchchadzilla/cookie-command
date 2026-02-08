
import React, { useEffect } from 'react';
import { useCookieStore } from '../../lib/store';
import { X, Bell, Calendar, Trash2 } from 'lucide-react';
import './NotificationPanel.css';

interface Props {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: Props) {
  const { notifications, currentUser, markNotificationsRead } = useCookieStore();

  useEffect(() => {
    markNotificationsRead();
  }, []);

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="notif-overlay" onClick={onClose} />
      <div className="notif-panel">
        <div className="notif-panel-header">
          <h3><Bell size={16} /> Notifications</h3>
          <button className="notif-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="notif-panel-body">
          {sorted.length === 0 && (
            <div className="notif-empty">
              <Bell size={32} strokeWidth={1} color="#cbd5e1" />
              <p>No notifications yet</p>
            </div>
          )}
          {sorted.map(n => {
            const isUnread = currentUser ? !n.readBy.includes(currentUser.id) : false;
            return (
              <div key={n.id} className={`notif-item ${isUnread ? 'unread' : ''} ${n.type}`}>
                <div className="notif-item-icon">
                  {n.type === 'meeting_added' ? <Calendar size={16} /> : <Trash2 size={16} />}
                </div>
                <div className="notif-item-content">
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-msg">{n.message}</div>
                  <div className="notif-item-time">{formatTime(n.timestamp)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
