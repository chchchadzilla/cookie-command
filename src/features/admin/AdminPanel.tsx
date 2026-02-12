
import React, { useState } from 'react';
import { useCookieStore } from '../../lib/store';
import { COOKIE_TYPES, COOKIE_LABELS, COOKIE_PRICE, CookieType, ScoutLevel } from '../../lib/types';
import { Users, Plus, Trash2, Eye, EyeOff, Edit3, ArrowRight, RefreshCw, Upload } from 'lucide-react';
import { EbuddieImport } from './EbuddieImport';
import './AdminPanel.css';

export function AdminPanel() {
  const { currentUser, users, fullInventory, updateInventoryField, removeUser, addUser, transferBoxes, resetSystem, getRemaining } = useCookieStore();
  const [activeTab, setActiveTab] = useState<'manage' | 'import'>('manage');
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [selectedGirl, setSelectedGirl] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState<ScoutLevel>('Junior');
  const [editModal, setEditModal] = useState<{ userId: string; cookieType: CookieType; field: 'starting' | 'additional' | 'sold' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [transferModal, setTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferCookie, setTransferCookie] = useState<CookieType>('TMint');
  const [transferQty, setTransferQty] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!currentUser?.isAdmin) return null;

  const girls = users.filter(u => !u.isAdmin).sort((a, b) => a.name.localeCompare(b.name));

  const togglePin = (uid: string) => setShowPins(p => ({ ...p, [uid]: !p[uid] }));

  const handleAddGirl = async () => {
    if (!newName.trim()) return;
    const u = await addUser(newName, newLevel);
    setAddModal(false);
    setNewName('');
    alert(`Created ${u.name}\nUsername: ${u.username}\nPIN: ${u.pin}`);
  };

  const handleEdit = async () => {
    if (!editModal) return;
    const val = parseInt(editValue);
    if (isNaN(val) || val < 0) return;
    await updateInventoryField(editModal.userId, editModal.cookieType, editModal.field, val, true);
    setEditModal(null);
    setEditValue('');
  };

  const handleTransfer = async () => {
    const qty = parseInt(transferQty);
    if (!transferFrom || !transferTo || isNaN(qty) || qty <= 0) return;
    await transferBoxes(transferFrom, transferTo, transferCookie, qty);
    setTransferModal(false);
    setTransferQty('');
  };

  const handleDelete = async (uid: string) => {
    await removeUser(uid);
    setDeleteConfirm(null);
    if (selectedGirl === uid) setSelectedGirl(null);
  };

  const selGirl = selectedGirl ? users.find(u => u.id === selectedGirl) : null;
  const selInv = selectedGirl ? fullInventory[selectedGirl] || {} : {};

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2><Users size={22} /> Troop Management</h2>
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Users size={16} /> Manage Scouts
          </button>
          <button 
            className={`admin-tab ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={16} /> Import from eBuddie
          </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <EbuddieImport />
      )}

      {activeTab === 'manage' && (
        <>
          <div className="manage-header-actions">
            <button className="btn-transfer" onClick={() => setTransferModal(true)}>
              <ArrowRight size={16} /> Quick Transfer
            </button>
            <button className="btn-add" onClick={() => setAddModal(true)}>
              <Plus size={16} /> Add Girl
            </button>
          </div>

      <div className="admin-layout">
        {/* Girl List */}
        <div className="girl-list-panel">
          <div className="girl-list-header">
            <h3>Scouts ({girls.length})</h3>
          </div>
          <div className="girl-list">
            {girls.map(g => {
              const totalBoxes = COOKIE_TYPES.reduce((sum, ct) => {
                const r = fullInventory[g.id]?.[ct];
                return sum + (r ? r.starting + r.additional : 0);
              }, 0);
              const totalSold = COOKIE_TYPES.reduce((sum, ct) => {
                const r = fullInventory[g.id]?.[ct];
                return sum + (r ? r.sold : 0);
              }, 0);

              return (
                <div key={g.id} className={`girl-item ${selectedGirl === g.id ? 'active' : ''}`} onClick={() => setSelectedGirl(g.id)}>
                  <div className="girl-item-main">
                    <div className={`girl-avatar ${g.level.toLowerCase()}`}>{g.name.charAt(0)}</div>
                    <div className="girl-item-info">
                      <div className="girl-item-name">{g.name}</div>
                      <div className="girl-item-meta">
                        <span className={`level-tag ${g.level.toLowerCase()}`}>{g.level}</span>
                        <span className="girl-item-stat">{totalSold}/{totalBoxes} sold</span>
                      </div>
                    </div>
                  </div>
                  <div className="girl-item-pin">
                    <button className="pin-toggle" onClick={e => { e.stopPropagation(); togglePin(g.id); }}>
                      {showPins[g.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <span className="pin-display">{showPins[g.id] ? g.pin : '••••'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="girl-detail-panel">
          {selGirl ? (
            <>
              <div className="detail-header">
                <div>
                  <h3>{selGirl.name}</h3>
                  <p>Username: <strong>{selGirl.username}</strong> • PIN: <strong>{showPins[selGirl.id] ? selGirl.pin : '••••'}</strong></p>
                </div>
                <button className="btn-delete-girl" onClick={() => setDeleteConfirm(selGirl.id)}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
              <div className="detail-inv-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Starting</th>
                      <th>Additional</th>
                      <th>Sold</th>
                      <th>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_TYPES.map(ct => {
                      const rec = selInv[ct] || { starting: 0, additional: 0, sold: 0 };
                      const remaining = rec.starting + rec.additional - rec.sold;
                      return (
                        <tr key={ct}>
                          <td className="ct-cell"><span className="ct-badge">{ct}</span> {COOKIE_LABELS[ct]}</td>
                          <td>
                            <button className="edit-cell" onClick={() => { setEditModal({ userId: selGirl.id, cookieType: ct, field: 'starting' }); setEditValue(String(rec.starting)); }}>
                              {rec.starting} <Edit3 size={10} />
                            </button>
                          </td>
                          <td>
                            <button className="edit-cell" onClick={() => { setEditModal({ userId: selGirl.id, cookieType: ct, field: 'additional' }); setEditValue(String(rec.additional)); }}>
                              {rec.additional} <Edit3 size={10} />
                            </button>
                          </td>
                          <td>
                            <button className="edit-cell" onClick={() => { setEditModal({ userId: selGirl.id, cookieType: ct, field: 'sold' }); setEditValue(String(rec.sold)); }}>
                              {rec.sold} <Edit3 size={10} />
                            </button>
                          </td>
                          <td className={remaining > 0 ? 'has-remaining' : 'no-remaining'}>{remaining}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <Users size={48} strokeWidth={1} color="#cbd5e1" />
              <p>Select a scout to view and edit their inventory</p>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="danger-section">
        <button className="btn-reset" onClick={() => { if (confirm('⚠️ This will RESET ALL DATA. Are you sure?')) resetSystem(); }}>
          <RefreshCw size={16} /> Reset All Data (New Season)
        </button>
      </div>
        </>
      )}

      {/* Add Girl Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>Add New Scout</h4>
            <div className="modal-field">
              <label>Full Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Jane Smith" autoFocus />
            </div>
            <div className="modal-field">
              <label>Level</label>
              <select value={newLevel} onChange={e => setNewLevel(e.target.value as ScoutLevel)}>
                <option>Daisy</option>
                <option>Brownie</option>
                <option>Junior</option>
                <option>Cadette</option>
                <option>Senior</option>
                <option>Ambassador</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-sec" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="btn-pri" onClick={handleAddGirl}>Create Scout</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>Edit {editModal.field.charAt(0).toUpperCase() + editModal.field.slice(1)}: {COOKIE_LABELS[editModal.cookieType]}</h4>
            <div className="modal-field">
              <label>New Value</label>
              <input type="number" min="0" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn-sec" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn-pri" onClick={handleEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal && (
        <div className="modal-overlay" onClick={() => setTransferModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>Quick Transfer Boxes</h4>
            <div className="modal-field">
              <label>From</label>
              <select value={transferFrom} onChange={e => setTransferFrom(e.target.value)}>
                <option value="">Select scout...</option>
                {girls.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>To</label>
              <select value={transferTo} onChange={e => setTransferTo(e.target.value)}>
                <option value="">Select scout...</option>
                {girls.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Cookie Type</label>
              <select value={transferCookie} onChange={e => setTransferCookie(e.target.value as CookieType)}>
                {COOKIE_TYPES.map(ct => <option key={ct} value={ct}>{COOKIE_LABELS[ct]}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Quantity</label>
              <input type="number" min="1" value={transferQty} onChange={e => setTransferQty(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-sec" onClick={() => setTransferModal(false)}>Cancel</button>
              <button className="btn-pri" onClick={handleTransfer}>Transfer</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>⚠️ Remove Scout?</h4>
            <p>This will permanently delete <strong>{users.find(u => u.id === deleteConfirm)?.name}</strong> and all their inventory data.</p>
            <div className="modal-actions">
              <button className="btn-sec" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
