
import React, { useState, useMemo } from 'react';
import { useCookieStore } from '../../lib/store';
import { BoothSignup, TroopMeeting } from '../../lib/types';
import {
  ChevronLeft, ChevronRight, Plus, X, Store, Users as UsersIcon,
  MapPin, Clock, AlertCircle, Trash2, Calendar as CalendarIcon
} from 'lucide-react';
import './CalendarWidget.css';

interface CalendarEvent {
  id: string;
  type: 'booth' | 'meeting';
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
  raw: BoothSignup | TroopMeeting;
}

export function CalendarWidget() {
  const { booths, meetings, currentUser, addBooth, removeBooth, addMeeting, removeMeeting } = useCookieStore();
  const isAdmin = !!currentUser?.isAdmin;

  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<'booth' | 'meeting' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CalendarEvent | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formBusiness, setFormBusiness] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Build all events
  const allEvents: CalendarEvent[] = useMemo(() => {
    const boothEvents: CalendarEvent[] = booths.map(b => ({
      id: b.id,
      type: 'booth' as const,
      title: b.business,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      location: b.location,
      notes: b.notes,
      raw: b,
    }));
    const meetingEvents: CalendarEvent[] = meetings.map(m => ({
      id: m.id,
      type: 'meeting' as const,
      title: m.title,
      date: m.date,
      startTime: m.startTime,
      endTime: m.endTime,
      location: m.location,
      notes: m.description,
      raw: m,
    }));
    return [...boothEvents, ...meetingEvents];
  }, [booths, meetings]);

  // Calendar helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calendarDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = useMemo(() => {
    const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
    // Previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({ day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: true });
    }
    // Next month
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      days.push({ day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false });
    }
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  // Events per date
  const eventsByDate: Record<string, CalendarEvent[]> = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of allEvents) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [allEvents]);

  // Events for selected date
  const selectedDateEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  const goToday = () => {
    setViewDate(new Date());
    setSelectedDate(todayStr);
  };
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const openAddModal = (type: 'booth' | 'meeting') => {
    setFormTitle('');
    setFormDescription('');
    setFormDate(selectedDate || todayStr);
    setFormStartTime('');
    setFormEndTime('');
    setFormLocation('');
    setFormBusiness('');
    setFormNotes('');
    setShowAddModal(type);
  };

  const handleAddBooth = async () => {
    if (!formBusiness.trim() || !formDate || !formStartTime || !formEndTime) return;
    const startH = parseInt(formStartTime.split(':')[0]);
    const startM = parseInt(formStartTime.split(':')[1]);
    const endH = parseInt(formEndTime.split(':')[0]);
    const endM = parseInt(formEndTime.split(':')[1]);
    const diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const duration = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    const formatTimeDisplay = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'pm' : 'am';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
    };

    await addBooth({
      business: formBusiness.trim(),
      location: formLocation.trim(),
      notes: formNotes.trim(),
      date: formDate,
      startTime: formatTimeDisplay(formStartTime),
      endTime: formatTimeDisplay(formEndTime),
      duration,
    });
    setShowAddModal(null);
  };

  const handleAddMeeting = async () => {
    if (!formTitle.trim() || !formDate || !formStartTime || !formEndTime) return;

    const formatTimeDisplay = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'pm' : 'am';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
    };

    await addMeeting({
      title: formTitle.trim(),
      description: formDescription.trim(),
      date: formDate,
      startTime: formatTimeDisplay(formStartTime),
      endTime: formatTimeDisplay(formEndTime),
      location: formLocation.trim(),
    });
    setShowAddModal(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'booth') {
      await removeBooth(deleteConfirm.id);
    } else {
      await removeMeeting(deleteConfirm.id);
    }
    setDeleteConfirm(null);
    setSelectedEvent(null);
  };

  const formatSelectedDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="cal-widget">
      <div className="cal-widget-header">
        <h3><CalendarIcon size={18} /> Troop Calendar</h3>
        {isAdmin && (
          <div className="cal-add-actions">
            <button className="cal-add-btn booth-add" onClick={() => openAddModal('booth')}>
              <Store size={13} /> <span className="cal-add-label">Booth</span>
            </button>
            <button className="cal-add-btn meeting-add" onClick={() => openAddModal('meeting')}>
              <UsersIcon size={13} /> <span className="cal-add-label">Meeting</span>
            </button>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
        <div className="cal-nav-center">
          <span className="cal-month-label">{monthName}</span>
          <button className="cal-today-btn" onClick={goToday}>Today</button>
        </div>
        <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      <div className="cal-grid">
        <div className="cal-grid-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="cal-weekday">{d}</div>
          ))}
        </div>
        <div className="cal-grid-body">
          {calendarDays.map((dayInfo, i) => {
            const dayEvents = eventsByDate[dayInfo.dateStr] || [];
            const isToday = dayInfo.dateStr === todayStr;
            const isSelected = dayInfo.dateStr === selectedDate;
            const hasBooth = dayEvents.some(e => e.type === 'booth');
            const hasMeeting = dayEvents.some(e => e.type === 'meeting');

            return (
              <button
                key={i}
                className={[
                  'cal-day',
                  !dayInfo.isCurrentMonth ? 'other-month' : '',
                  isToday ? 'today' : '',
                  isSelected ? 'selected' : '',
                  dayEvents.length > 0 ? 'has-events' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setSelectedDate(dayInfo.dateStr)}
              >
                <span className="cal-day-num">{dayInfo.day}</span>
                {dayEvents.length > 0 && (
                  <div className="cal-day-dots">
                    {hasBooth && <span className="cal-dot booth-dot" />}
                    {hasMeeting && <span className="cal-dot meeting-dot" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-dot booth-dot" /> Cookie Booth</span>
        <span className="cal-legend-item"><span className="cal-dot meeting-dot" /> Troop Meeting</span>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="cal-events-panel">
          <div className="cal-events-header">
            <h4>{formatSelectedDate(selectedDate)}</h4>
            <button className="cal-events-close" onClick={() => setSelectedDate(null)}><X size={16} /></button>
          </div>
          {selectedDateEvents.length === 0 ? (
            <div className="cal-events-empty">No events on this day</div>
          ) : (
            <div className="cal-events-list">
              {selectedDateEvents
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(ev => (
                  <div
                    key={ev.id}
                    className={`cal-event-card ${ev.type}`}
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <div className={`cal-event-type-bar ${ev.type}`} />
                    <div className="cal-event-info">
                      <div className="cal-event-title">
                        {ev.type === 'booth' ? <Store size={13} /> : <UsersIcon size={13} />}
                        {ev.title}
                      </div>
                      <div className="cal-event-time">
                        <Clock size={11} /> {ev.startTime} – {ev.endTime}
                      </div>
                      {ev.location && (
                        <div className="cal-event-loc">
                          <MapPin size={11} /> {ev.location}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        className="cal-event-delete"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(ev); }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && !deleteConfirm && (
        <div className="cal-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className={`cal-modal-bar ${selectedEvent.type}`} />
            <div className="cal-modal-content">
              <div className="cal-modal-type-badge">
                {selectedEvent.type === 'booth' ? (
                  <><Store size={14} /> Cookie Booth</>
                ) : (
                  <><UsersIcon size={14} /> Troop Meeting</>
                )}
              </div>
              <h4>{selectedEvent.title}</h4>
              <div className="cal-modal-meta">
                <div><CalendarIcon size={14} /> {formatSelectedDate(selectedEvent.date)}</div>
                <div><Clock size={14} /> {selectedEvent.startTime} – {selectedEvent.endTime}</div>
                {selectedEvent.location && <div><MapPin size={14} /> {selectedEvent.location}</div>}
              </div>
              {selectedEvent.notes && (
                <div className="cal-modal-notes">
                  <AlertCircle size={14} /> {selectedEvent.notes}
                </div>
              )}
              <div className="cal-modal-actions">
                <button className="btn-sec" onClick={() => setSelectedEvent(null)}>Close</button>
                {isAdmin && (
                  <button className="btn-danger-sm" onClick={() => setDeleteConfirm(selectedEvent)}>
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="cal-modal-overlay" onClick={() => setShowAddModal(null)}>
          <div className="cal-modal cal-add-modal" onClick={e => e.stopPropagation()}>
            <div className={`cal-modal-bar ${showAddModal}`} />
            <div className="cal-modal-content">
              <h4>{showAddModal === 'booth' ? '🏪 Add Cookie Booth' : '📋 Add Troop Meeting'}</h4>

              {showAddModal === 'booth' ? (
                <>
                  <div className="cal-form-field">
                    <label>Business Name *</label>
                    <input value={formBusiness} onChange={e => setFormBusiness(e.target.value)} placeholder="e.g. Ralphs (Sherman Oaks)" autoFocus />
                  </div>
                  <div className="cal-form-field">
                    <label>Location</label>
                    <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Full address" />
                  </div>
                  <div className="cal-form-row">
                    <div className="cal-form-field">
                      <label>Date *</label>
                      <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="cal-form-row">
                    <div className="cal-form-field">
                      <label>Start Time *</label>
                      <input type="time" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} />
                    </div>
                    <div className="cal-form-field">
                      <label>End Time *</label>
                      <input type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="cal-form-field">
                    <label>Notes</label>
                    <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Special instructions..." rows={2} />
                  </div>
                </>
              ) : (
                <>
                  <div className="cal-form-field">
                    <label>Meeting Title *</label>
                    <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Weekly Troop Meeting" autoFocus />
                  </div>
                  <div className="cal-form-field">
                    <label>Description</label>
                    <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="What's on the agenda?" rows={2} />
                  </div>
                  <div className="cal-form-field">
                    <label>Location</label>
                    <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Meeting location" />
                  </div>
                  <div className="cal-form-row">
                    <div className="cal-form-field">
                      <label>Date *</label>
                      <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="cal-form-row">
                    <div className="cal-form-field">
                      <label>Start Time *</label>
                      <input type="time" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} />
                    </div>
                    <div className="cal-form-field">
                      <label>End Time *</label>
                      <input type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div className="cal-modal-actions">
                <button className="btn-sec" onClick={() => setShowAddModal(null)}>Cancel</button>
                <button
                  className="btn-pri"
                  onClick={showAddModal === 'booth' ? handleAddBooth : handleAddMeeting}
                >
                  <Plus size={16} /> {showAddModal === 'booth' ? 'Add Booth' : 'Add Meeting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="cal-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="cal-modal cal-delete-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-modal-content">
              <div className="cal-delete-icon"><Trash2 size={32} color="#ef4444" /></div>
              <h4>Delete {deleteConfirm.type === 'booth' ? 'Booth' : 'Meeting'}?</h4>
              <p className="cal-delete-msg">
                This will permanently remove <strong>"{deleteConfirm.title}"</strong> on {formatSelectedDate(deleteConfirm.date)}.
                {deleteConfirm.type === 'meeting' && <><br /><br /><em>All scouts will be notified about this cancellation.</em></>}
              </p>
              <div className="cal-modal-actions">
                <button className="btn-sec" onClick={() => setDeleteConfirm(null)}>Keep It</button>
                <button className="btn-danger-sm" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
