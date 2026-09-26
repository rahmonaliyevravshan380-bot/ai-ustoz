import { useState, useEffect } from 'react';
import { 
  RiSchoolLine, RiAddLine, RiSearchLine, 
  RiBookOpenLine, RiCalendarCheckLine, RiEditLine, RiDeleteBin6Line,
  RiGroupLine, RiBarChartBoxLine, RiStickyNoteLine, RiCloseLine, RiFilter3Line
} from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import UserDataService from '../../services/UserDataService';
import { useNotification } from '../../context/NotificationContext';
import styles from './Classroom.module.scss';

export default function ClassesPage() {
  const { addToast } = useNotification();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'attendance', 'notes', 'homework', 'stats'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [formData, setFormData] = useState({ id: null, name: '', subject: 'Matematika', room: '', time: '', color: '#2563EB' });

  // Notes & Homework State
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const [homeworks, setHomeworks] = useState([]);
  const [newHomework, setNewHomework] = useState({ title: '', dueDate: '', desc: '' });

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Load from UserDataService and sync with custom events
  useEffect(() => {
    if (!user?.id) return;
    
    const loadAllData = () => {
      setClasses(UserDataService.getClasses(user.id));
      setStudents(UserDataService.getStudents(user.id));
      setNotes(UserDataService.getClassesNotes(user.id));
      setHomeworks(UserDataService.getClassesHomeworks(user.id));
      setAttendanceRecords(UserDataService.getAttendance(user.id));
    };

    loadAllData();

    const handleDataChange = (e) => {
      if (e.detail.userId === user.id) {
        if (['classes', 'students', 'classes-notes', 'classes-homeworks', 'attendance'].includes(e.detail.key)) {
          loadAllData();
        }
      }
    };

    window.addEventListener('user-data-change', handleDataChange);
    return () => window.removeEventListener('user-data-change', handleDataChange);
  }, [user?.id]);

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase()) ||
    c.room.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ id: null, name: '', subject: 'Matematika', room: '', time: '', color: '#2563EB' });
    setShowModal(true);
  };

  const handleOpenEdit = (cls, e) => {
    e.stopPropagation();
    setModalMode('edit');
    setFormData({ ...cls });
    setShowModal(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const clsToDelete = classes.find(c => c.id === id);
    if (!clsToDelete) return;

    if (window.confirm("Rostdan ham ushbu sinfni o'chirmoqchimisiz?")) {
      const updatedClasses = classes.filter(c => c.id !== id);
      setClasses(updatedClasses);
      UserDataService.setClasses(user.id, updatedClasses);

      // Clean up students: remove this class name from their grade comma-separated list
      const updatedStudents = students.map(st => {
        if (!st.grade) return st;
        const currentGrades = st.grade.split(',').map(g => g.trim()).filter(Boolean);
        const newGrades = currentGrades.filter(g => g !== clsToDelete.name);
        return { ...st, grade: newGrades.join(', ') };
      });
      setStudents(updatedStudents);
      UserDataService.setStudents(user.id, updatedStudents);

      if (selectedClass?.id === id) setSelectedClass(null);
      addToast({ type: 'info', title: 'O\'chirildi', message: 'Sinf ro\'yxatdan o\'chirildi.' });
    }
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Sinf nomi va fanini kiriting!' });
      return;
    }

    if (modalMode === 'create') {
      const newCls = {
        ...formData,
        id: Date.now(),
        students: 0
      };
      const updatedClasses = [...classes, newCls];
      setClasses(updatedClasses);
      UserDataService.setClasses(user.id, updatedClasses);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Yangi sinf qo\'shildi!' });
    } else {
      const oldClass = classes.find(c => c.id === formData.id);
      const updatedClasses = classes.map(c => c.id === formData.id ? { ...c, ...formData } : c);
      setClasses(updatedClasses);
      UserDataService.setClasses(user.id, updatedClasses);

      // If the class name changed, update the students' grades too!
      if (oldClass && oldClass.name !== formData.name) {
        const updatedStudents = students.map(st => {
          if (!st.grade) return st;
          const currentGrades = st.grade.split(',').map(g => g.trim()).filter(Boolean);
          const newGrades = currentGrades.map(g => g === oldClass.name ? formData.name : g);
          return { ...st, grade: newGrades.join(', ') };
        });
        setStudents(updatedStudents);
        UserDataService.setStudents(user.id, updatedStudents);
      }

      if (selectedClass?.id === formData.id) setSelectedClass({ ...selectedClass, ...formData });
      addToast({ type: 'success', title: 'Yangilandi', message: 'Sinf ma\'lumotlari saqlandi!' });
    }
    setShowModal(false);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;
    const item = {
      id: Date.now(),
      classId: selectedClass.id,
      title: newNote.title,
      content: newNote.content,
      date: new Date().toISOString().split('T')[0]
    };
    const updatedNotes = [item, ...notes];
    setNotes(updatedNotes);
    UserDataService.setClassesNotes(user.id, updatedNotes);
    setNewNote({ title: '', content: '' });
    addToast({ type: 'success', title: 'Eslatma qo\'shildi', message: 'Eslatma muvaffaqiyatli saqlandi.' });
  };

  const handleAddHomework = (e) => {
    e.preventDefault();
    if (!newHomework.title || !newHomework.dueDate) return;
    const item = {
      id: Date.now(),
      classId: selectedClass.id,
      title: newHomework.title,
      dueDate: newHomework.dueDate,
      desc: newHomework.desc,
      status: 'Faol'
    };
    const updatedHomeworks = [item, ...homeworks];
    setHomeworks(updatedHomeworks);
    UserDataService.setClassesHomeworks(user.id, updatedHomeworks);
    setNewHomework({ title: '', dueDate: '', desc: '' });
    addToast({ type: 'success', title: 'Vazifa qo\'shildi', message: 'Yangi uy vazifasi e\'lon qilindi.' });
  };

  const toggleAttendance = (studentId) => {
    const key = `${selectedClass.id}_${attendanceDate}_${studentId}`;
    const updated = {
      ...attendanceRecords,
      [key]: attendanceRecords[key] === 'absent' ? 'present' : 'absent'
    };
    setAttendanceRecords(updated);
    UserDataService.setAttendance(user.id, updated);
  };

  const classStudents = selectedClass ? students.filter(s => s.grade && s.grade.split(',').map(g => g.trim()).includes(selectedClass.name)) : [];
  
  const getClassStudentsCount = (className) => {
    return students.filter(s => s.grade && s.grade.split(',').map(g => g.trim()).includes(className)).length;
  };

  const classAvgGpa = classStudents.length > 0 
    ? (classStudents.reduce((acc, s) => acc + parseFloat(s.gpa || 0), 0) / classStudents.length).toFixed(1)
    : '0.0';

  const classAvgAttendance = classStudents.length > 0
    ? Math.round(classStudents.reduce((acc, s) => acc + parseInt(s.attendance || 0), 0) / classStudents.length)
    : 0;

  const classHwCount = selectedClass ? homeworks.filter(h => h.classId === selectedClass.id).length : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiSchoolLine /> Sinf Boshqaruvi</h1>
          <p className={styles.pageSubtitle}>Sinflarni boshqarish, o'quvchilar ro'yxati, davomat va topshiriqlar</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleOpenCreate}>
          <RiAddLine /> Yangi Sinf Qo'shish
        </button>
      </div>

      {/* Main View Layout */}
      {!selectedClass ? (
        /* Class List View */
        <div>
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <RiSearchLine />
              <input 
                type="text" 
                placeholder="Sinf, fan yoki xona bo'yicha qidiruv..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.statsSummary}>
              <span>Jami sinflar: <strong>{classes.length}</strong></span>
              <span>Jami o'quvchilar: <strong>{students.length}</strong></span>
            </div>
          </div>

          <div className={styles.classGrid}>
            {filteredClasses.map(cls => (
              <motion.div 
                key={cls.id} 
                className={styles.classCard}
                onClick={() => setSelectedClass(cls)}
                whileHover={{ y: -4 }}
              >
                <div className={styles.cardHeader} style={{ borderColor: cls.color }}>
                  <div className={styles.classBadge} style={{ background: `${cls.color}20`, color: cls.color }}>
                    {cls.name}
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={(e) => handleOpenEdit(cls, e)} title="Tahrirlash"><RiEditLine /></button>
                    <button onClick={(e) => handleDelete(cls.id, e)} title="O'chirish"><RiDeleteBin6Line /></button>
                  </div>
                </div>
                
                <h3 className={styles.cardSubject}>{cls.subject}</h3>
                
                <div className={styles.cardDetails}>
                  <div><RiGroupLine /> {getClassStudentsCount(cls.name)} ta o'quvchi</div>
                  <div><RiSchoolLine /> {cls.room}-xona</div>
                  <div><RiCalendarCheckLine /> {cls.time}</div>
                </div>

                <div className={styles.cardFooter}>
                  <span>Boshqarish →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Single Class Detail View */
        <div className={styles.detailView}>
          <button className={styles.backBtn} onClick={() => setSelectedClass(null)}>
            ← Barcha sinflarga qaytish
          </button>

          <div className={styles.detailHeader} style={{ background: `linear-gradient(135deg, ${selectedClass.color}15, var(--surface))` }}>
            <div className={styles.dhInfo}>
              <span className={styles.dhBadge} style={{ background: selectedClass.color }}>{selectedClass.name}</span>
              <div>
                <h2>{selectedClass.name} — {selectedClass.subject}</h2>
                <p>{selectedClass.room}-xona · {selectedClass.time} · {classStudents.length} ta o'quvchi</p>
              </div>
            </div>
            <div className={styles.dhActions}>
              <button className={styles.secondaryBtn} onClick={(e) => handleOpenEdit(selectedClass, e)}>
                <RiEditLine /> Sinfni tahrirlash
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabNav}>
            <button className={activeTab === 'students' ? styles.activeTab : ''} onClick={() => setActiveTab('students')}>
              <RiGroupLine /> O'quvchilar ({classStudents.length})
            </button>
            <button className={activeTab === 'attendance' ? styles.activeTab : ''} onClick={() => setActiveTab('attendance')}>
              <RiCalendarCheckLine /> Davomat
            </button>
            <button className={activeTab === 'notes' ? styles.activeTab : ''} onClick={() => setActiveTab('notes')}>
              <RiStickyNoteLine /> Eslatmalar
            </button>
            <button className={activeTab === 'homework' ? styles.activeTab : ''} onClick={() => setActiveTab('homework')}>
              <RiBookOpenLine /> Uy Vazifalari
            </button>
            <button className={activeTab === 'stats' ? styles.activeTab : ''} onClick={() => setActiveTab('stats')}>
              <RiBarChartBoxLine /> Statistika
            </button>
          </div>

          {/* Tab 1: Students */}
          {activeTab === 'students' && (
            <div className={styles.tabContent}>
              <div className={styles.tableWrapper}>
                <table className={styles.customTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>O'quvchi Ismi</th>
                      <th>Telefon</th>
                      <th>Ota-ona</th>
                      <th>O'rtacha Baho</th>
                      <th>Davomat %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((st, i) => (
                      <tr key={st.id}>
                        <td>{i + 1}</td>
                        <td className={styles.studentNameCell}>
                          <div className={styles.avatar}>{st.name[0]}</div>
                          <strong>{st.name}</strong>
                        </td>
                        <td>{st.phone}</td>
                        <td>{st.parent}</td>
                        <td><span className={styles.gpaBadge}>{st.gpa}</span></td>
                        <td>
                          <div className={styles.attendanceBar}>
                            <div className={styles.barFill} style={{ width: `${st.attendance}%` }} />
                            <span>{st.attendance}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Attendance */}
          {activeTab === 'attendance' && (
            <div className={styles.tabContent}>
              <div className={styles.attendanceHeader}>
                <div>
                  <h3>Bugungi Davomat Hisobi</h3>
                  <p>O'quvchini qatnashgan/qatnashmagan sifatida belgilang</p>
                </div>
                <input 
                  type="date" 
                  className="input-custom" 
                  style={{ width: 'auto' }} 
                  value={attendanceDate} 
                  onChange={e => setAttendanceDate(e.target.value)} 
                />
              </div>

              <div className={styles.attendanceGrid}>
                {classStudents.map((st) => {
                  const key = `${selectedClass.id}_${attendanceDate}_${st.id}`;
                  const isAbsent = attendanceRecords[key] === 'absent';

                  return (
                    <div 
                      key={st.id} 
                      className={`${styles.attCard} ${isAbsent ? styles.absent : styles.present}`}
                      onClick={() => toggleAttendance(st.id)}
                    >
                      <div className={styles.attAvatar}>{st.name[0]}</div>
                      <div className={styles.attInfo}>
                        <strong>{st.name}</strong>
                        <span>{isAbsent ? '❌ Darsda yo\'q' : '✅ Darsda bor'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Notes */}
          {activeTab === 'notes' && (
            <div className={styles.tabContent}>
              <form onSubmit={handleAddNote} className={styles.addForm}>
                <h3>Yangi Eslatma Yaratish</h3>
                <input 
                  type="text" 
                  placeholder="Sarlavha..." 
                  className="input-custom" 
                  value={newNote.title} 
                  onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))} 
                />
                <textarea 
                  placeholder="Eslatma mazmuni..." 
                  className="input-custom" 
                  rows={3} 
                  value={newNote.content} 
                  onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))} 
                />
                <button type="submit" className={styles.primaryBtn}>Eslatmani Saqlash</button>
              </form>

              <div className={styles.notesGrid}>
                {notes.filter(n => n.classId === selectedClass.id).map(note => (
                  <div key={note.id} className={styles.noteCard}>
                    <div className={styles.noteDate}>{note.date}</div>
                    <h4>{note.title}</h4>
                    <p>{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Homework */}
          {activeTab === 'homework' && (
            <div className={styles.tabContent}>
              <form onSubmit={handleAddHomework} className={styles.addForm}>
                <h3>Yangi Uy Vazifasi Qo'shish</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <input 
                    type="text" 
                    placeholder="Vazifa nomi..." 
                    className="input-custom" 
                    value={newHomework.title} 
                    onChange={e => setNewHomework(p => ({ ...p, title: e.target.value }))} 
                  />
                  <input 
                    type="date" 
                    className="input-custom" 
                    value={newHomework.dueDate} 
                    onChange={e => setNewHomework(p => ({ ...p, dueDate: e.target.value }))} 
                  />
                </div>
                <textarea 
                  placeholder="Vazifa batafsil izohi..." 
                  className="input-custom" 
                  rows={2} 
                  value={newHomework.desc} 
                  onChange={e => setNewHomework(p => ({ ...p, desc: e.target.value }))} 
                />
                <button type="submit" className={styles.primaryBtn}>Vazifani E'lon Qilish</button>
              </form>

              <div className={styles.hwList}>
                {homeworks.filter(h => h.classId === selectedClass.id).map(hw => (
                  <div key={hw.id} className={styles.hwCard}>
                    <div className={styles.hwHeader}>
                      <h4>{hw.title}</h4>
                      <span className={styles.hwBadge}>Muddati: {hw.dueDate}</span>
                    </div>
                    <p>{hw.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Stats */}
          {activeTab === 'stats' && (
            <div className={styles.tabContent}>
              <div className={styles.statsGridCards}>
                <div className={styles.statMiniCard}>
                  <h4>O'rtacha Sinf Bahosi</h4>
                  <div className={styles.smVal}>{classAvgGpa}</div>
                  <span>Barcha o'quvchilar</span>
                </div>
                <div className={styles.statMiniCard}>
                  <h4>Oylik Davomat %</h4>
                  <div className={styles.smVal}>{classAvgAttendance}%</div>
                  <span>O'rtacha ko'rsatkich</span>
                </div>
                <div className={styles.statMiniCard}>
                  <h4>Faol Vazifalar</h4>
                  <div className={styles.smVal}>{classHwCount} ta</div>
                  <span>E'lon qilingan uy vazifalari</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Class Create/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <motion.div className={styles.modalBox} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className={styles.modalHeader}>
              <h3>{modalMode === 'create' ? "Yangi Sinf Qo'shish" : "Sinfni Tahrirlash"}</h3>
              <button onClick={() => setShowModal(false)}><RiCloseLine /></button>
            </div>

            <form onSubmit={handleSaveClass} className={styles.modalForm}>
              <div>
                <label className="form-label">Sinf Nomi (masalan: 9-A)</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  placeholder="9-A" 
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Fan Nomi</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  placeholder="Matematika" 
                  value={formData.subject}
                  onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Xona Nomi/Raqami</label>
                  <input 
                    type="text" 
                    className="input-custom" 
                    placeholder="201" 
                    value={formData.room}
                    onChange={e => setFormData(p => ({ ...p, room: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Dars Vaqti</label>
                  <input 
                    type="text" 
                    className="input-custom" 
                    placeholder="Du, Ch, Ju 08:00" 
                    value={formData.time}
                    onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Sinf Rang Tegi</label>
                <input 
                  type="color" 
                  className="input-custom" 
                  style={{ height: '45px', padding: '4px' }}
                  value={formData.color}
                  onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className={styles.primaryBtn}>Saqlash</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
