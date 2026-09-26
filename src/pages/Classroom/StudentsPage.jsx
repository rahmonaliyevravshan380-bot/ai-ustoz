import { useState, useEffect } from 'react';
import { 
  RiGroupLine, RiSearchLine, RiAddLine, RiEditLine, 
  RiDeleteBin6Line, RiFilter3Line, RiDownload2Line, 
  RiUserAddLine, RiMailLine, RiPhoneLine, RiCalendarLine,
  RiAlertLine
} from 'react-icons/ri';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import UserDataService from '../../services/UserDataService';
import styles from './Classroom.module.scss';

export default function StudentsPage() {
  const { addToast } = useNotification();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    gpa: '4.5',
    attendance: '95',
    status: 'active',
    phone: '',
    parent: ''
  });

  // Load from UserDataService and listen to custom events for sync
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    
    const loadData = () => {
      const data = UserDataService.getStudents(user.id);
      setStudents(data);
      setClasses(UserDataService.getClasses(user.id));
      setLoading(false);
    };

    loadData();

    const handleDataChange = (e) => {
      if (e.detail.userId === user.id) {
        if (e.detail.key === 'students' || e.detail.key === 'classes') {
          const data = UserDataService.getStudents(user.id);
          setStudents(data);
          setClasses(UserDataService.getClasses(user.id));
        }
      }
    };
    
    window.addEventListener('user-data-change', handleDataChange);
    return () => {
      window.removeEventListener('user-data-change', handleDataChange);
    };
  }, [user?.id]);

  const saveToStorage = (updatedList) => {
    if (!user?.id) return;
    setStudents(updatedList);
    UserDataService.setStudents(user.id, updatedList);
  };

  // Search & Filter
  const filteredStudents = students.filter(st => {
    const q = searchQuery.toLowerCase().trim();
    const matchesStatus = selectedStatus === 'All' || st.status === selectedStatus;
    const matchesClass = selectedClass === 'All' || (st.grade && st.grade.split(',').map(g => g.trim()).includes(selectedClass));
    
    if (!q) {
      return matchesClass && matchesStatus;
    }
    
    // Detailed fields match
    const nameMatch = (st.name || '').toLowerCase().includes(q);
    const parentMatch = (st.parent || '').toLowerCase().includes(q);
    const phoneMatch = (st.phone || '').includes(q);
    const gradeMatch = st.grade && st.grade.split(',').map(g => g.trim().toLowerCase()).some(g => g.includes(q));
    
    const matchesSearch = nameMatch || parentMatch || phoneMatch || gradeMatch;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  // CRUD Actions
  const handleOpenAdd = () => {
    setCurrentStudent(null);
    setFormData({
      name: '',
      grade: classes[0]?.name || '',
      gpa: '4.5',
      attendance: '95',
      status: 'active',
      phone: '',
      parent: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setCurrentStudent(student);
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("O'quvchini o'chirishni tasdiqlaysizmi?")) {
      const updated = students.filter(st => st.id !== id);
      saveToStorage(updated);
      addToast({ type: 'success', title: 'O\'chirildi', message: 'O\'quvchi ro\'yxatdan olib tashlandi.' });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Ism kiritilishi shart!' });
      return;
    }

    if (currentStudent) {
      // Edit
      const updated = students.map(st => st.id === currentStudent.id ? { ...st, ...formData } : st);
      saveToStorage(updated);
      addToast({ type: 'success', title: 'Yangilandi', message: 'O\'quvchi ma\'lumotlari yangilandi.' });
    } else {
      // Add
      const newStudent = {
        id: Date.now(),
        ...formData
      };
      const updated = [newStudent, ...students];
      saveToStorage(updated);
      addToast({ type: 'success', title: 'Qo\'shildi', message: 'Yangi o\'quvchi ro\'yxatga qo\'shildi.' });
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    let csv = 'ID,Ism,Sinf,GPA,Davomat %,Telefon,Ota-ona,Status\n';
    filteredStudents.forEach(st => {
      csv += `${st.id},"${st.name}",${st.grade},${st.gpa},${st.attendance},"${st.phone}","${st.parent}",${st.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `o'quvchilar_${selectedClass}.csv`;
    link.click();
    addToast({ type: 'success', title: 'Eksport qilindi', message: 'CSV fayli muvaffaqiyatli yuklab olindi.' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiGroupLine /> O'quvchilar Ro'yxati</h1>
          <p className={styles.pageSubtitle}>Barcha sinflardagi o'quvchilarning umumiy bazasi</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={styles.secondaryBtn} onClick={handleExport} disabled={filteredStudents.length === 0}>
            <RiDownload2Line /> CSV Eksport
          </button>
          <button className={styles.primaryBtn} onClick={handleOpenAdd}>
            <RiUserAddLine /> O'quvchi Qo'shish
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <RiSearchLine />
          <input 
            type="text" 
            placeholder="O'quvchi ismi, sinfi, ota-onasi yoki telefoni..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingRight: '30px' }}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')} 
              style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className={styles.filterSelectWrap}>
            <RiFilter3Line />
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="All">Barcha Sinflar</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterSelectWrap}>
            <RiFilter3Line />
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="All">Barcha Statuslar</option>
              <option value="active">Faol</option>
              <option value="inactive">Faol emas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className={styles.tabContent}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yuklanmoqda...</span>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className={styles.emptyState}>
            <RiGroupLine style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
            <p>O'quvchilar topilmadi</p>
            <span>Qidiruv shartlarini o'zgartirib ko'ring yoki yangi o'quvchi qo'shing.</span>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Ism-sharif</th>
                  <th>Sinf</th>
                  <th>GPA (O'rtacha baho)</th>
                  <th>Davomat %</th>
                  <th>Telefon</th>
                  <th>Ota-ona</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(st => (
                  <tr key={st.id}>
                    <td>
                      <div className={styles.studentNameCell}>
                        <div className={styles.avatar}>{st.name ? st.name[0] : 'O'}</div>
                        <div>
                          <strong>{st.name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {st.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{st.grade}</td>
                    <td><span className={styles.gpaBadge}>{st.gpa}</span></td>
                    <td>
                      <div className={styles.attendanceBar}>
                        <div className={styles.barFill} style={{ width: `${st.attendance}%` }} />
                        <span>{st.attendance}%</span>
                      </div>
                    </td>
                    <td><RiPhoneLine style={{ verticalAlign: 'middle', marginRight: '4px' }} />{st.phone}</td>
                    <td><RiMailLine style={{ verticalAlign: 'middle', marginRight: '4px' }} />{st.parent}</td>
                    <td>
                      <span className={`${styles.typeBadge} ${st.status === 'active' ? styles.in : styles.out}`}>
                        {st.status === 'active' ? 'Faol' : 'Faol emas'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.cardActions} style={{ justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenEdit(st)} title="Tahrirlash"><RiEditLine /></button>
                        <button onClick={() => handleDelete(st.id)} title="O'chirish"><RiDeleteBin6Line style={{ color: '#EF4444' }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>{currentStudent ? "O'quvchi ma'lumotlarini tahrirlash" : "Yangi o'quvchi qo'shish"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text)' }}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div>
                <label className="form-label">To'liq ismi</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Abdullayev Ali"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Sinf (Sinflar)</label>
                  {classes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', background: 'var(--surface-2)' }}>
                      {classes.map(cls => {
                        const checkedGrades = formData.grade ? formData.grade.split(',').map(g => g.trim()).filter(Boolean) : [];
                        const isChecked = checkedGrades.includes(cls.name);
                        return (
                          <label key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={e => {
                                let newGrades = [...checkedGrades];
                                if (e.target.checked) {
                                  if (!newGrades.includes(cls.name)) newGrades.push(cls.name);
                                } else {
                                  newGrades = newGrades.filter(g => g !== cls.name);
                                }
                                setFormData({ ...formData, grade: newGrades.join(', ') });
                              }}
                            />
                            {cls.name}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '6px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      Avval sinf qo'shing
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select 
                    className="input-custom"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Faol</option>
                    <option value="inactive">Faol emas</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">GPA (O'rtacha baho)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="5"
                    className="input-custom" 
                    value={formData.gpa}
                    onChange={e => setFormData({ ...formData, gpa: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Davomat %</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    className="input-custom" 
                    value={formData.attendance}
                    onChange={e => setFormData({ ...formData, attendance: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Telefon raqam</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div>
                <label className="form-label">Ota-ona ma'lumoti</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  value={formData.parent}
                  onChange={e => setFormData({ ...formData, parent: e.target.value })}
                  placeholder="Ota-onasi ismi va kontaktlari"
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
