
import React, { useState } from 'react';
import { useCookieStore } from '../../lib/store';
import { COOKIE_TYPES, COOKIE_LABELS, CookieType } from '../../lib/types';
import { ArrowLeftRight, Check, X, Plus } from 'lucide-react';
import './TradeCenter.css';

export function TradeCenter() {
  const { currentUser, users, trades, createTrade, respondTrade, getRemaining } = useCookieStore();
  const [showCreate, setShowCreate] = useState(false);
  const [tradeTo, setTradeTo] = useState('');
  const [offerItems, setOfferItems] = useState<Partial<Record<CookieType, number>>>({});
  const [requestItems, setRequestItems] = useState<Partial<Record<CookieType, number>>>({});

  if (!currentUser) return null;

  const myTrades = trades.filter(t => t.fromUserId === currentUser.id || t.toUserId === currentUser.id);
  const pendingForMe = myTrades.filter(t => t.toUserId === currentUser.id && t.status === 'pending');
  const otherTrades = myTrades.filter(t => !(t.toUserId === currentUser.id && t.status === 'pending'));

  const girls = users.filter(u => u.id !== currentUser.id && !u.isAdmin);

  const handleCreate = async () => {
    if (!tradeTo) return;
    const hasOffer = Object.values(offerItems).some(v => v && v > 0);
    const hasRequest = Object.values(requestItems).some(v => v && v > 0);
    if (!hasOffer && !hasRequest) return;

    await createTrade(tradeTo, offerItems, requestItems);
    setShowCreate(false);
    setOfferItems({});
    setRequestItems({});
    setTradeTo('');
  };

  const renderCookieList = (items: Partial<Record<CookieType, number>>) => {
    const entries = Object.entries(items).filter(([, v]) => v && v > 0);
    if (entries.length === 0) return <span className="trade-empty">Nothing</span>;
    return entries.map(([ct, qty]) => (
      <span key={ct} className="trade-item-badge">{qty}× {COOKIE_LABELS[ct as CookieType]}</span>
    ));
  };

  return (
    <div className="trade-page">
      <div className="trade-header">
        <h2><ArrowLeftRight size={22} /> Cookie Trades</h2>
        <button className="btn-new-trade" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Propose Trade
        </button>
      </div>

      {pendingForMe.length > 0 && (
        <div className="trade-section">
          <h3>⏳ Trades Awaiting Your Response</h3>
          {pendingForMe.map(t => (
            <div key={t.id} className="trade-card pending">
              <div className="trade-card-header">
                <strong>{t.fromUserName}</strong> wants to trade with you
              </div>
              <div className="trade-card-body">
                <div className="trade-side">
                  <div className="trade-side-label">They give you:</div>
                  <div className="trade-items">{renderCookieList(t.offering)}</div>
                </div>
                <div className="trade-arrow">⇄</div>
                <div className="trade-side">
                  <div className="trade-side-label">You give them:</div>
                  <div className="trade-items">{renderCookieList(t.requesting)}</div>
                </div>
              </div>
              <div className="trade-card-actions">
                <button className="btn-accept" onClick={() => respondTrade(t.id, true)}><Check size={14} /> Accept</button>
                <button className="btn-reject" onClick={() => respondTrade(t.id, false)}><X size={14} /> Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="trade-section">
        <h3>📋 Trade History</h3>
        {otherTrades.length === 0 && <div className="no-trades">No trades yet. Propose one!</div>}
        {otherTrades.map(t => (
          <div key={t.id} className={`trade-card ${t.status}`}>
            <div className="trade-card-header">
              <strong>{t.fromUserName}</strong> ⇄ <strong>{t.toUserName}</strong>
              <span className={`trade-status ${t.status}`}>{t.status}</span>
            </div>
            <div className="trade-card-body">
              <div className="trade-side">
                <div className="trade-side-label">{t.fromUserName} offers:</div>
                <div className="trade-items">{renderCookieList(t.offering)}</div>
              </div>
              <div className="trade-arrow">⇄</div>
              <div className="trade-side">
                <div className="trade-side-label">{t.toUserName} offers:</div>
                <div className="trade-items">{renderCookieList(t.requesting)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Trade Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="trade-modal" onClick={e => e.stopPropagation()}>
            <h4>Propose a Trade</h4>
            <div className="modal-field">
              <label>Trade With</label>
              <select value={tradeTo} onChange={e => setTradeTo(e.target.value)}>
                <option value="">Select a scout...</option>
                {girls.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div className="trade-form-sides">
              <div className="trade-form-side">
                <h5>🎁 You Give</h5>
                {COOKIE_TYPES.map(ct => {
                  const rem = getRemaining(currentUser.id, ct);
                  if (rem <= 0) return null;
                  return (
                    <div key={ct} className="trade-form-row">
                      <span>{ct}</span>
                      <input type="number" min="0" max={rem} value={offerItems[ct] || ''}
                        onChange={e => setOfferItems(p => ({ ...p, [ct]: parseInt(e.target.value) || 0 }))}
                        placeholder={`max ${rem}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="trade-form-side">
                <h5>🙏 You Want</h5>
                {COOKIE_TYPES.map(ct => (
                  <div key={ct} className="trade-form-row">
                    <span>{ct}</span>
                    <input type="number" min="0" value={requestItems[ct] || ''}
                      onChange={e => setRequestItems(p => ({ ...p, [ct]: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-sec" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-pri" onClick={handleCreate}>Send Trade Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
