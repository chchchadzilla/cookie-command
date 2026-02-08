
import React, { useState } from 'react';
import { useCookieStore } from '../../lib/store';
import { Store, MapPin, Clock, AlertCircle, Trash2, Plus } from 'lucide-react';
import './BoothSchedule.css';

export function BoothSchedule() {
  const { booths, currentUser, removeBooth } = useCookieStore();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = !!currentUser?.isAdmin;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...booths].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filtered = sorted.filter(b => {
    const d = new Date(b.date);
    if (filter === 'upcoming') return d >= today;
    if (filter === 'past') return d < today;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleDelete = async (id: string) => {
    await removeBooth(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="booth-page">
      <div className="booth-header">
        <h2><Store size={22} /> Booth Schedule</h2>
        <div className="booth-filters">
          {(['upcoming', 'all', 'past'] as const).map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="booth-list">
        {filtered.length === 0 && <div className="no-booths">No booth signups found for this filter.</div>}
        {filtered.map(b => {
          const isPast = new Date(b.date) < today;
          return (
            <div key={b.id} className={`booth-card ${isPast ? 'past' : ''}`}>
              <div className="booth-date-col">
                <div className="booth-date">{formatDate(b.date)}</div>
                <div className="booth-time"><Clock size={12} /> {b.startTime} – {b.endTime}</div>
                <div className="booth-duration">{b.duration}</div>
              </div>
              <div className="booth-info">
                <div className="booth-business">{b.business}</div>
                <div className="booth-location"><MapPin size={12} /> {b.location}</div>
                {b.notes && (
                  <div className="booth-notes"><AlertCircle size={12} /> {b.notes}</div>
                )}
              </div>
              {isAdmin && (
                <button className="booth-delete-btn" onClick={() => setDeleteConfirm(b.id)} title="Remove booth">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {deleteConfirm && (
        <div className="booth-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="booth-modal" onClick={e => e.stopPropagation()}>
            <h4>Remove this booth?</h4>
            <p>This will permanently delete the booth from the schedule.</p>
            <div className="booth-modal-actions">
              <button className="btn-sec" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
