import { useState, useEffect } from 'react';
import { 
  RiCalendarLine, RiAddLine, RiArrowLeftSLine, 
  RiArrowRightSLine, RiCloseLine, RiDeleteBin6Line, RiFileList3Line 
} from 'react-icons/ri';
import { useNotification } from '../../context/NotificationContext';
import styles from './Productivity.module.scss';

export default function CalendarPage() {
  const { addToast } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    date: '',
    time: '09:00',
    category: 'lesson', // lesson, meeting, exam, personal
    desc: ''
  });

  const categories = {
    lesson: { label: 'Dars', color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
    meeting: { label: 'Majlis', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    exam: { label: 'Imtihon', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    personal: { label: 'Shaxsiy', color: '#10B981', bg: 'rgba(16,185,129,0.12)' }
  };

  // Load events
  useEffect(() => {
    const saved = localStorage.getItem('ai-ustoz-calendar-events');
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      const defaultEvents = [
        { id: 1, title: '9-A matematika nazorat', date: new Date().toISOString().split('T')[0], time: '09:00', category: 'exam', desc: '1-chorak choraklik imtihon.' },
        { id: 2, title: 'Ota-onalar yig\'ilishi', date: new Date().toISOString().split('T')[0], time: '16:00', category: 'meeting', desc: 'Chorak yakuni va baholar muhokamasi.' },
      ];
      setEvents(defaultEvents);
      localStorage.setItem('ai-ustoz-calendar-events', JSON.stringify(defaultEvents));
    }
  }, []);

  const saveEvents = (updatedList) => {
    setEvents(updatedList);
    localStorage.setItem('ai-ustoz-calendar-events', JSON.stringify(updatedList));
  };

  // Date helper methods
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Map Sunday to 6, Monday to 0
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Navigate months
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build grid days
  const gridCells = [];
  // Previous month filler days
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    gridCells.push({ day: prevMonthDays - i, isCurrentMonth: false, monthOffset: -1 });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push({ day: i, isCurrentMonth: true, monthOffset: 0 });
  }
  // Next month filler days
  const remaining = 42 - gridCells.length;
  for (let i = 1; i <= remaining; i++) {
    gridCells.push({ day: i, isCurrentMonth: false, monthOffset: 1 });
  }

  const getEventsForDate = (d, offset) => {
    const targetDate = new Date(year, month + offset, d);
    const dateStr = targetDate.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const handleDayClick = (d, offset) => {
    const targetDate = new Date(year, month + offset, d);
    const dateStr = targetDate.toISOString().split('T')[0];
    setSelectedDateStr(dateStr);
    setSelectedDayEvents(events.filter(e => e.date === dateStr));
  };

  const handleOpenAddEvent = () => {
    setFormData({
      id: null,
      title: '',
      date: selectedDateStr || new Date().toISOString().split('T')[0],
      time: '09:00',
      category: 'lesson',
      desc: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Tadbir nomi kiritilishi lozim!' });
      return;
    }

    let updated;
    if (formData.id) {
      // Edit
      updated = events.map(ev => ev.id === formData.id ? { ...ev, ...formData } : ev);
      addToast({ type: 'success', title: 'Yangilandi', message: 'Tadbir ma\'lumotlari yangilandi.' });
    } else {
      // Create
      const newEvent = { ...formData, id: Date.now() };
      updated = [...events, newEvent];
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Taqvimga yangi tadbir qo\'shildi!' });
    }

    saveEvents(updated);
    setIsModalOpen(false);
    
    // Refresh day details view
    if (formData.date === selectedDateStr) {
      setSelectedDayEvents(updated.filter(ev => ev.date === selectedDateStr));
    }
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Tadbirni o'chirmoqchimisiz?")) {
      const updated = events.filter(e => e.id !== id);
      saveEvents(updated);
      setSelectedDayEvents(updated.filter(e => e.date === selectedDateStr));
      addToast({ type: 'info', title: 'O\'chirildi', message: 'Tadbir taqvimdan olib tashlandi.' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiCalendarLine /> Taqvim</h1>
          <p className={styles.pageSubtitle}>Darslar, imtihonlar va ota-onalar yig'ilishi rejalashtirish taqvimi</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleOpenAddEvent}>
          <RiAddLine /> Tadbir Rejalashtirish
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '24px', flexWrap: 'wrap' }}>
        {/* Calendar Box */}
        <div className={styles.tabContent} style={{ padding: '20px' }}>
          {/* Calendar Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{monthNames[month]} {year}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.secondaryBtn} style={{ padding: '6px 12px' }} onClick={prevMonth}><RiArrowLeftSLine /></button>
              <button className={styles.secondaryBtn} style={{ padding: '6px 12px' }} onClick={nextMonth}><RiArrowRightSLine /></button>
            </div>
          </div>

          {/* Day Names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: '600', fontSize: '12px', paddingBottom: '10px', color: 'var(--text-muted)' }}>
            <div>Dush</div><div>Sesh</div><div>Chor</div><div>Pay</div><div>Jum</div><div>Shan</div><div>Yak</div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            {gridCells.map((cell, idx) => {
              const dayEvents = getEventsForDate(cell.day, cell.monthOffset);
              const isToday = cell.isCurrentMonth && 
                              cell.day === new Date().getDate() && 
                              month === new Date().getMonth() && 
                              year === new Date().getFullYear();

              return (
                <div 
                  key={idx} 
                  onClick={() => handleDayClick(cell.day, cell.monthOffset)}
                  style={{
                    minHeight: '80px',
                    padding: '6px',
                    borderRadius: '8px',
                    background: isToday ? 'rgba(37,99,235,0.06)' : cell.isCurrentMonth ? 'var(--surface-2)' : 'var(--surface)',
                    border: isToday ? '1px solid var(--primary)' : '1px solid var(--border)',
                    opacity: cell.isCurrentMonth ? 1 : 0.4,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontWeight: isToday ? 'bold' : 'normal', color: isToday ? 'var(--primary)' : 'var(--text)' }}>
                    {cell.day}
                  </span>
                  
                  {/* Event Dots */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px', overflow: 'hidden', maxLines: 2 }}>
                    {dayEvents.slice(0, 2).map(e => (
                      <div 
                        key={e.id}
                        style={{
                          fontSize: '9px',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          backgroundColor: categories[e.category]?.bg,
                          color: categories[e.category]?.color,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div style={{ fontSize: '8px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        +{dayEvents.length - 2} ta yana
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day View */}
        <div className={styles.tabContent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Kun Tafsilotlari</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedDateStr || 'Kun tanlang'}</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedDayEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <RiFileList3Line style={{ fontSize: '32px', display: 'block', margin: '0 auto 8px', opacity: 0.5 }} />
                Bu kunda hech qanday tadbirlar rejalashtirilmagan.
              </div>
            ) : (
              selectedDayEvents.map(e => (
                <div 
                  key={e.id} 
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${categories[e.category]?.color}`,
                    background: 'var(--surface-2)',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                    <span>{e.title}</span>
                    <button 
                      onClick={() => handleDeleteEvent(e.id)} 
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                    ⏰ {e.time} | {categories[e.category]?.label}
                  </div>
                  {e.desc && <div style={{ marginTop: '6px', fontSize: '12px' }}>{e.desc}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h3>Taqvimga tadbir qo'shish</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text)' }}>✕</button>
            </div>
            <form onSubmit={handleSaveEvent} className={styles.modalForm}>
              <div>
                <label className="form-label">Tadbir nomi</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Fizikadan dars o'tish"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Sana</label>
                  <input 
                    type="date" 
                    className="input-custom" 
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Vaqt</label>
                  <input 
                    type="time" 
                    className="input-custom" 
                    value={formData.time} 
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Turi</label>
                <select 
                  className="input-custom" 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="lesson">Dars</option>
                  <option value="meeting">Majlis</option>
                  <option value="exam">Imtihon</option>
                  <option value="personal">Shaxsiy</option>
                </select>
              </div>

              <div>
                <label className="form-label">Tavsif (Izoh)</label>
                <textarea 
                  className="input-custom" 
                  rows={3} 
                  value={formData.desc} 
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Batafsil ma'lumot kiriting..."
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className={styles.primaryBtn}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
