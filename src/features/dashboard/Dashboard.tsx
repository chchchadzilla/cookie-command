
import React from 'react';
import { useCookieStore } from '../../lib/store';
import { COOKIE_TYPES, COOKIE_LABELS, COOKIE_PRICE, TROOP_PROFIT_PER_BOX, CookieType } from '../../lib/types';
import { TrendingUp, DollarSign, Package, PieChart } from 'lucide-react';
import { CalendarWidget } from './CalendarWidget';
import './Dashboard.css';

const BANNER_COLORS = ['#00AE58','#563625','#00B2E2','#FDE291','#C41E3A','#002A5C','#f59e0b','#8b5cf6','#ec4899','#10b981','#f97316','#6366f1'];

export function Dashboard() {
  const { currentUser, fullInventory, users, getRemaining, updateBanner } = useCookieStore();
  if (!currentUser) return null;

  const isAdmin = !!currentUser.isAdmin;
  const banner = currentUser.bannerColor || '#00AE58';

  let targetUsers = isAdmin ? users.filter(u => !u.isAdmin) : [currentUser];
  let totalStarting = 0, totalAdditional = 0, totalSold = 0, totalRemaining = 0;
  let totalValue = 0, totalTroopProfit = 0, totalOwedToCouncil = 0;

  const cookieTotals: Record<string, { starting: number; additional: number; sold: number; remaining: number }> = {};
  COOKIE_TYPES.forEach(ct => { cookieTotals[ct] = { starting: 0, additional: 0, sold: 0, remaining: 0 }; });

  for (const u of targetUsers) {
    for (const ct of COOKIE_TYPES) {
      const rec = fullInventory[u.id]?.[ct];
      if (!rec) continue;
      const remaining = rec.starting + rec.additional - rec.sold;
      cookieTotals[ct].starting += rec.starting;
      cookieTotals[ct].additional += rec.additional;
      cookieTotals[ct].sold += rec.sold;
      cookieTotals[ct].remaining += remaining;

      totalStarting += rec.starting;
      totalAdditional += rec.additional;
      totalSold += rec.sold;
      totalRemaining += remaining;

      const soldValue = rec.sold * COOKIE_PRICE[ct];
      totalValue += soldValue;
      totalTroopProfit += rec.sold * TROOP_PROFIT_PER_BOX;
    }
  }
  totalOwedToCouncil = totalValue - totalTroopProfit;

  const totalAllBoxes = totalStarting + totalAdditional;
  const totalAllValue = (() => {
    let v = 0;
    for (const ct of COOKIE_TYPES) {
      v += (cookieTotals[ct].starting + cookieTotals[ct].additional) * COOKIE_PRICE[ct];
    }
    return v;
  })();

  return (
    <div className="dashboard-page">
      {/* Banner */}
      <div className="dash-banner" style={{ background: `linear-gradient(135deg, ${banner}, ${banner}cc)` }}>
        <div className="banner-content">
          <h2>{isAdmin ? '🍪 Troop 04326 Overview' : `🍪 ${currentUser.name}'s Dashboard`}</h2>
          <p>{isAdmin ? `${targetUsers.length} Scouts • 2025-26 Cookie Season` : `${currentUser.level} Scout • GSGLA`}</p>
        </div>
        {!isAdmin && (
          <div className="banner-colors">
            {BANNER_COLORS.map(c => (
              <button key={c} className={`color-dot ${banner === c ? 'active' : ''}`} style={{ background: c }} onClick={() => updateBanner(c)} />
            ))}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card blue">
          <Package size={20} />
          <div className="stat-info">
            <div className="stat-value">{totalAllBoxes.toLocaleString()}</div>
            <div className="stat-label">Total Boxes Assigned</div>
          </div>
        </div>
        <div className="stat-card green">
          <TrendingUp size={20} />
          <div className="stat-info">
            <div className="stat-value">{totalSold.toLocaleString()}</div>
            <div className="stat-label">Boxes Sold</div>
          </div>
        </div>
        <div className="stat-card amber">
          <Package size={20} />
          <div className="stat-info">
            <div className="stat-value">{totalRemaining.toLocaleString()}</div>
            <div className="stat-label">Remaining to Sell</div>
          </div>
        </div>
        <div className="stat-card purple">
          <DollarSign size={20} />
          <div className="stat-info">
            <div className="stat-value">${totalValue.toLocaleString()}</div>
            <div className="stat-label">Total Sales Revenue</div>
          </div>
        </div>
      </div>

      {/* Calendar Widget */}
      <CalendarWidget />

      <div className="dash-row">
        <div className="dash-panel financial-summary">
          <h3><DollarSign size={18} /> Financial Summary</h3>
          <div className="fin-grid">
            <div className="fin-item">
              <span className="fin-label">Total Inventory Value</span>
              <span className="fin-value">${totalAllValue.toLocaleString()}</span>
            </div>
            <div className="fin-item">
              <span className="fin-label">Revenue Collected</span>
              <span className="fin-value green-text">${totalValue.toLocaleString()}</span>
            </div>
            <div className="fin-item">
              <span className="fin-label">Troop Proceeds ($1/box)</span>
              <span className="fin-value green-text">${totalTroopProfit.toLocaleString()}</span>
            </div>
            <div className="fin-item">
              <span className="fin-label">Owed to GSGLA</span>
              <span className="fin-value red-text">${totalOwedToCouncil.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Breakdown */}
      <div className="dash-panel cookie-breakdown">
        <h3><PieChart size={18} /> Cookie Breakdown</h3>
        <div className="cookie-table-wrapper">
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Price</th>
                <th>Starting</th>
                <th>Additional</th>
                <th>Sold</th>
                <th>Remaining</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {COOKIE_TYPES.map(ct => {
                const t = cookieTotals[ct];
                const rev = t.sold * COOKIE_PRICE[ct];
                return (
                  <tr key={ct}>
                    <td className="cookie-name-cell">
                      <span className="cookie-abbr">{ct}</span>
                      <span className="cookie-full">{COOKIE_LABELS[ct]}</span>
                    </td>
                    <td>${COOKIE_PRICE[ct]}</td>
                    <td>{t.starting}</td>
                    <td>{t.additional > 0 ? `+${t.additional}` : '—'}</td>
                    <td className="sold-cell">{t.sold}</td>
                    <td className={t.remaining > 0 ? 'remaining-cell' : 'zero-cell'}>{t.remaining}</td>
                    <td className="rev-cell">${rev.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>TOTAL</strong></td>
                <td></td>
                <td><strong>{totalStarting}</strong></td>
                <td><strong>{totalAdditional > 0 ? `+${totalAdditional}` : '—'}</strong></td>
                <td><strong>{totalSold}</strong></td>
                <td><strong>{totalRemaining}</strong></td>
                <td><strong>${totalValue.toLocaleString()}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
