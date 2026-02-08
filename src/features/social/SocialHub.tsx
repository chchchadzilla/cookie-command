
import React, { useState, useEffect, useRef } from 'react';
import { useCookieStore } from '../../lib/store';
import { MessageSquare, Send, Lock, Shield } from 'lucide-react';
import './SocialHub.css';

export function SocialHub() {
  const { messages, sendMessage, currentUser, users } = useCookieStore();
  const [input, setInput] = useState('');
  const [recipient, setRecipient] = useState<string>('GLOBAL');
  const [adminMode, setAdminMode] = useState(false);
  const [viewingConvo, setViewingConvo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, viewingConvo, adminMode]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input, recipient === 'GLOBAL' ? null : recipient);
    setInput('');
  };

  const isAdmin = !!currentUser?.isAdmin;

  // Filter messages
  let filteredMessages = messages;
  if (adminMode && isAdmin) {
    if (viewingConvo) {
      filteredMessages = messages.filter(m => {
        if (!m.recipientId) return false;
        return m.senderId === viewingConvo || m.recipientId === viewingConvo;
      });
    } else {
      // Show all
      filteredMessages = messages;
    }
  } else {
    filteredMessages = messages.filter(m => {
      if (!m.recipientId) return true;
      if (m.senderId === currentUser?.id || m.recipientId === currentUser?.id) return true;
      return false;
    });
  }

  // For admin mode, get list of users with DMs
  const dmUsers = isAdmin ? Array.from(new Set(
    messages.filter(m => m.recipientId).flatMap(m => [m.senderId, m.recipientId!])
  )).filter(id => id !== currentUser?.id).map(id => users.find(u => u.id === id)).filter(Boolean) : [];

  return (
    <div className="social-page">
      <div className="social-card">
        <div className="social-header">
          <h3><MessageSquare size={18} /> Troop Chat</h3>
          {isAdmin && (
            <button className={`admin-mode-btn ${adminMode ? 'active' : ''}`} onClick={() => { setAdminMode(!adminMode); setViewingConvo(null); }}>
              <Shield size={14} /> {adminMode ? 'Exit Admin View' : 'Admin Mode'}
            </button>
          )}
        </div>

        {adminMode && isAdmin && (
          <div className="admin-dm-nav">
            <button className={`dm-nav-btn ${!viewingConvo ? 'active' : ''}`} onClick={() => setViewingConvo(null)}>All Messages</button>
            {dmUsers.map(u => u && (
              <button key={u.id} className={`dm-nav-btn ${viewingConvo === u.id ? 'active' : ''}`} onClick={() => setViewingConvo(u.id)}>
                <Lock size={10} /> {u.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        <div className="chat-viewport" ref={scrollRef}>
          {filteredMessages.length === 0 && <div className="empty-chat">No messages yet. Say hi! 👋</div>}
          {filteredMessages.map(m => {
            const isMe = m.senderId === currentUser?.id;
            const isDM = !!m.recipientId;
            const recipientName = isDM ? users.find(u => u.id === m.recipientId)?.name : null;
            return (
              <div key={m.id} className={`msg-row ${isMe ? 'me' : 'them'}`}>
                <div className="msg-bubble">
                  {isDM && (
                    <div className="dm-badge">
                      <Lock size={9} /> {adminMode ? `${m.senderName} → ${recipientName || 'Unknown'}` : 'Private'}
                    </div>
                  )}
                  {!isMe && !adminMode && <div className="sender-name">{m.senderName}</div>}
                  {adminMode && !isDM && !isMe && <div className="sender-name">{m.senderName}</div>}
                  <div className="msg-text">{m.content}</div>
                  <div className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <div className="target-selector">
            <select value={recipient} onChange={e => setRecipient(e.target.value)}>
              <option value="GLOBAL">📢 Everyone</option>
              {users.filter(u => u.id !== currentUser?.id).map(u => (
                <option key={u.id} value={u.id}>🔒 {u.name}</option>
              ))}
            </select>
          </div>
          <div className="input-row">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
            <button type="submit" className="send-btn"><Send size={16} /></button>
          </div>
        </form>
      </div>
    </div>
  );
}
