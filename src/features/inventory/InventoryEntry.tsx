
import React, { useState } from 'react';
import { useCookieStore } from '../../lib/store';
import { COOKIE_TYPES, COOKIE_LABELS, COOKIE_PRICE, CookieType } from '../../lib/types';
import { Package, Check, AlertTriangle } from 'lucide-react';
import './InventoryEntry.css';

export function InventoryEntry() {
  const { currentUser, fullInventory, updateInventoryField, recordSale } = useCookieStore();
  const [selectedCookie, setSelectedCookie] = useState<CookieType | null>(null);
  const [saleAmount, setSaleAmount] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    cookieType: CookieType;
    currentRemaining: number;
    boxesSold: number;
    newRemaining: number;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;
  const myInv = fullInventory[currentUser.id] || {};

  const handleRecordSale = (ct: CookieType) => {
    const amt = parseInt(saleAmount);
    if (isNaN(amt) || amt <= 0) return;

    const rec = myInv[ct] || { starting: 0, additional: 0, sold: 0 };
    const currentRemaining = rec.starting + rec.additional - rec.sold;

    if (amt > currentRemaining) {
      alert(`You only have ${currentRemaining} boxes of ${COOKIE_LABELS[ct]} remaining. You can't sell more than you have!`);
      return;
    }

    setConfirmModal({
      cookieType: ct,
      currentRemaining,
      boxesSold: amt,
      newRemaining: currentRemaining - amt
    });
  };

  const confirmSale = async () => {
    if (!confirmModal) return;
    await recordSale(confirmModal.cookieType, confirmModal.boxesSold);
    setConfirmModal(null);
    setSaleAmount('');
    setSelectedCookie(null);
    setSuccessMsg(`✅ Recorded ${confirmModal.boxesSold} boxes of ${COOKIE_LABELS[confirmModal.cookieType]} sold!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="inventory-page">
      <div className="inv-header-section">
        <h2><Package size={22} /> My Cookie Inventory</h2>
        <p>Record your sales below. Each entry requires confirmation.</p>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}

      <div className="inv-grid">
        {COOKIE_TYPES.map(ct => {
          const rec = myInv[ct] || { starting: 0, additional: 0, sold: 0 };
          const remaining = rec.starting + rec.additional - rec.sold;
          const totalAssigned = rec.starting + rec.additional;
          const isSelected = selectedCookie === ct;
          const soldPct = totalAssigned > 0 ? Math.round((rec.sold / totalAssigned) * 100) : 0;

          return (
            <div key={ct} className={`inv-cookie-card ${isSelected ? 'selected' : ''} ${totalAssigned === 0 ? 'empty' : ''}`}>
              <div className="icc-top" onClick={() => { setSelectedCookie(isSelected ? null : ct); setSaleAmount(''); }}>
                <div className="icc-name">
                  <span className="icc-abbr">{ct}</span>
                  <div>
                    <div className="icc-full">{COOKIE_LABELS[ct]}</div>
                    <div className="icc-price">${COOKIE_PRICE[ct]}/box</div>
                  </div>
                </div>
                <div className="icc-remaining">
                  <span className={`remaining-num ${remaining === 0 && totalAssigned > 0 ? 'sold-out' : ''}`}>{remaining}</span>
                  <span className="remaining-label">remaining</span>
                </div>
              </div>

              <div className="icc-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${soldPct}%` }} />
                </div>
                <div className="progress-stats">
                  <span>Assigned: {totalAssigned}</span>
                  <span>Sold: {rec.sold}</span>
                  <span>{soldPct}%</span>
                </div>
              </div>

              {isSelected && totalAssigned > 0 && (
                <div className="icc-sale-form">
                  <label>How many boxes did you sell?</label>
                  <div className="sale-input-row">
                    <input
                      type="number"
                      min="1"
                      max={remaining}
                      value={saleAmount}
                      onChange={e => setSaleAmount(e.target.value)}
                      placeholder="Enter # of boxes"
                      autoFocus
                    />
                    <button className="btn-record" onClick={() => handleRecordSale(ct)} disabled={!saleAmount || parseInt(saleAmount) <= 0}>
                      Record Sale
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon"><AlertTriangle size={40} color="#f59e0b" /></div>
            <h3>Confirm Your Sale</h3>
            <div className="confirm-details">
              <div className="confirm-cookie">{COOKIE_LABELS[confirmModal.cookieType]}</div>
              <div className="confirm-line">
                <span>You HAD</span>
                <strong>{confirmModal.currentRemaining} boxes</strong>
              </div>
              <div className="confirm-line highlight">
                <span>You are entering that you SOLD</span>
                <strong>{confirmModal.boxesSold} boxes</strong>
              </div>
              <div className="confirm-line result">
                <span>That means you now have</span>
                <strong>{confirmModal.newRemaining} boxes</strong>
              </div>
            </div>
            <p className="confirm-warning">DOUBLE CHECK THIS IS CORRECT BEFORE PRESSING 'OK' TO CONFIRM</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setConfirmModal(null)}>Go Back</button>
              <button className="btn-confirm" onClick={confirmSale}>
                <Check size={16} /> OK — Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
