import { useState, useEffect } from 'react';
import { 
  RiBookOpenLine, RiFilter3Line, RiAddLine, 
  RiSave3Line, RiEdit2Line, RiCalculatorLine,
  RiSearchLine, RiDeleteBin6Line, RiUserLine,
  RiCheckLine, RiCloseLine, RiCalendarLine,
  RiFileTextLine, RiRefreshLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import UserDataService from '../../services/UserDataService';
import { SUBJECTS } from '../../data/mockData';
import { useNotification } from '../../context/NotificationContext';
import styles from './Classroom.module.scss';

export default function GradebookPage() {
  const { addToast } = useNotification();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0] || 'Matematika');
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  
  // Lesson metadata
  const [topic, setTopic] = useState('Kvadrat tenglamalarni yechish usullari');
  const [note, setNote] = useState('O\'quvchilar mustaqil va nazorat ishida faol qatnashdilar.');

  const [assignments, setAssignments] = useState([
    { id: 'a1', title: 'Nazorat ishi 1', maxScore: 5 },
    { id: 'a2', title: 'Uy vazifasi 1', maxScore: 5 },
    { id: 'a3', title: 'Darsdagi faollik', maxScore: 5 },
  ]);

  const [grades, setGrades] = useState({});
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [editingGrade, setEditingGrade] = useState(null); // { student, assignment, currentGrade }
  const [deleteConfirmAssignment, setDeleteConfirmAssignment] = useState(null);

  // Load classes
  useEffect(() => {
    if (!user?.id) return;
    const loadedClasses = UserDataService.getClasses(user.id);
    setClasses(loadedClasses);
    if (loadedClasses.length > 0 && !selectedClass) {
      setSelectedClass(loadedClasses[0].name);
    }
  }, [user?.id, selectedClass]);

  // Load students & grades
  useEffect(() => {
    if (!user?.id) return;

    const studentList = UserDataService.getStudents(user.id);
    
    // Filter by class
    const classSts = studentList.filter(s => s.grade && s.grade.split(',').map(g => g.trim()).includes(selectedClass));
    setStudents(classSts);

    // Load saved grades
    const savedGrades = UserDataService.getGrades(user.id);
    if (Object.keys(savedGrades).length > 0) {
      setGrades(savedGrades);
    } else {
      const initial = {};
      classSts.forEach(st => {
        initial[`${st.id}_a1`] = Math.floor(Math.random() * 3) + 3;
        initial[`${st.id}_a2`] = Math.floor(Math.random() * 3) + 3;
        initial[`${st.id}_a3`] = Math.floor(Math.random() * 3) + 3;
      });
      setGrades(initial);
      UserDataService.setGrades(user.id, initial);
    }

    // Load saved assignments
    const savedAssigns = UserDataService.getAssignments(user.id);
    if (savedAssigns && savedAssigns.length > 0) {
      setAssignments(savedAssigns);
    } else {
      const defaultAssignments = [
        { id: 'a1', title: 'Nazorat ishi 1', maxScore: 5 },
        { id: 'a2', title: 'Uy vazifasi 1', maxScore: 5 },
        { id: 'a3', title: 'Darsdagi faollik', maxScore: 5 },
      ];
      setAssignments(defaultAssignments);
      UserDataService.setAssignments(user.id, defaultAssignments);
    }
  }, [user?.id, selectedClass, selectedSubject]);

  // Filter students
  const filteredStudents = students.filter(st => st.name.toLowerCase().includes(search.toLowerCase()));

  // Update grade cell
  const handleGradeChange = (studentId, assignmentId, value) => {
    const gradeVal = value === '' ? '' : parseInt(value);
    const updated = {
      ...grades,
      [`${studentId}_${assignmentId}`]: gradeVal
    };
    setGrades(updated);
  };

  const handleSave = () => {
    if (!user?.id) return;
    UserDataService.setGrades(user.id, grades);
    UserDataService.setAssignments(user.id, assignments);
    
    // Recalculate student GPAs
    const studentList = UserDataService.getStudents(user.id);

    const updatedStudents = studentList.map(st => {
      const studentGrades = assignments.map(a => grades[`${st.id}_${a.id}`]).filter(g => typeof g === 'number' && g > 0);
      if (studentGrades.length > 0) {
        const sum = studentGrades.reduce((a, b) => a + b, 0);
        const gpa = (sum / studentGrades.length).toFixed(1);
        return { ...st, gpa };
      }
      return st;
    });

    UserDataService.setStudents(user.id, updatedStudents);
    addToast({ type: 'success', title: 'Saqlandi', message: 'Sinf jurnali va baholar muvaffaqiyatli saqlandi!' });
  };

  const handleAddAssignment = (e) => {
    if (!user?.id) return;
    e.preventDefault();
    if (!newColTitle.trim()) return;

    const newId = `col_${Date.now()}`;
    const newAss = {
      id: newId,
      title: newColTitle.trim(),
      maxScore: 5
    };

    const updatedList = [...assignments, newAss];
    setAssignments(updatedList);
    UserDataService.setAssignments(user.id, updatedList);
    setNewColTitle('');
    setShowAddCol(false);
    addToast({ type: 'success', title: 'Qo\'shildi', message: 'Yangi baholash ustuni qo\'shildi.' });
  };

  const handleDeleteAssignment = (assId) => {
    const updatedList = assignments.filter(a => a.id !== assId);
    setAssignments(updatedList);
    UserDataService.setAssignments(user.id, updatedList);
    setDeleteConfirmAssignment(null);
    addToast({ type: 'info', title: 'O\'chirildi', message: 'Baholash ustuni olib tashlandi.' });
  };

  const getGradeStyleClass = (grade) => {
    if (grade === 5) return styles.grade5;
    if (grade === 4) return styles.grade4;
    if (grade === 3) return styles.grade3;
    if (grade === 2) return styles.grade2;
    return '';
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiBookOpenLine /> Sinf Jurnali</h1>
          <p className={styles.pageSubtitle}>O'quvchilar baholari, dars mavzulari va topshiriqlar jurnali</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className={styles.secondaryBtn} onClick={() => setShowAddCol(true)}>
            <RiAddLine /> Yangi Topshiriq
          </button>
          <button className={styles.primaryBtn} onClick={handleSave}>
            <RiSave3Line /> Jurnalni Saqlash
          </button>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Class Select */}
          <div className={styles.filterSelectWrap}>
            <RiFilter3Line />
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {classes.length > 0 ? (
                classes.map(cls => (
                  <option key={cls.id} value={cls.name}>{cls.name} sinfi</option>
                ))
              ) : (
                <option value="">Sinf yo'q</option>
              )}
            </select>
          </div>

          {/* Subject Select */}
          <div className={styles.filterSelectWrap}>
            <RiBookOpenLine />
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              {SUBJECTS.map((sub, i) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <RiSearchLine />
            <input 
              type="text" 
              placeholder="O'quvchini qidirish..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Teacher Info */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          O'qituvchi: <strong style={{ color: 'var(--text)' }}>{user?.name || 'Ustoz'}</strong>
        </div>
      </div>

      {/* Lesson Details Row */}
      <div className={styles.tabContent} style={{ marginBottom: '24px' }}>
        <div className={styles.sectionHeader}>
          <h3><RiFileTextLine /> Dars Mavzusi va Izoh</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className={styles.formLabel}>Dars Mavzusi</label>
            <input 
              type="text" 
              className={styles.formInput} 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Bugungi dars mavzusini kiriting..."
            />
          </div>
          <div>
            <label className={styles.formLabel}>Dars Izohi</label>
            <input 
              type="text" 
              className={styles.formInput} 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Sinf faolligi yoki izoh..."
            />
          </div>
        </div>
      </div>

      {/* Grade Ledger Table */}
      <div className={styles.tabContent}>
        {filteredStudents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <RiBookOpenLine />
            </div>
            <div className={styles.emptyTitle}>O'quvchilar topilmadi</div>
            <div className={styles.emptyDesc}>
              {search ? `"${search}" bo'yicha o'quvchi topilmadi.` : "Ushbu sinfda hozircha o'quvchilar ro'yxati mavjud emas."}
            </div>
            {search && (
              <button className={styles.secondaryBtn} onClick={() => setSearch('')}>
                <RiRefreshLine /> Qidiruvni tozalash
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th style={{ width: '240px' }}>O'quvchi Ism-sharifi</th>
                  {assignments.map(ass => (
                    <th key={ass.id} style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span>{ass.title}</span>
                        <button 
                          onClick={() => setDeleteConfirmAssignment(ass)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', opacity: 0.6 }}
                          title="Ustunni o'chirish"
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>max: {ass.maxScore} ball</div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', width: '130px', color: 'var(--primary)' }}>
                    O'rtacha (GPA)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(st => {
                  const studentGrades = assignments.map(a => grades[`${st.id}_${a.id}`]).filter(g => typeof g === 'number' && g > 0);
                  const stGpa = studentGrades.length > 0 
                    ? (studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length).toFixed(1)
                    : st.gpa || '0.0';

                  return (
                    <tr key={st.id}>
                      <td style={{ fontWeight: '500' }}>
                        <div className={styles.studentNameCell}>
                          <div className={styles.avatar}>{st.name[0]}</div>
                          <span>{st.name}</span>
                        </div>
                      </td>

                      {assignments.map(ass => {
                        const cellKey = `${st.id}_${ass.id}`;
                        const val = grades[cellKey] ?? '';

                        return (
                          <td key={ass.id} className={styles.gradeCell}>
                            <select
                              value={val}
                              onChange={e => handleGradeChange(st.id, ass.id, e.target.value)}
                              className={`${styles.gradeCellSelect} ${getGradeStyleClass(val)}`}
                            >
                              <option value="">-</option>
                              <option value="5">5 (A'lo)</option>
                              <option value="4">4 (Yaxshi)</option>
                              <option value="3">3 (Qoniqarli)</option>
                              <option value="2">2 (Qoniqarsiz)</option>
                            </select>
                          </td>
                        );
                      })}

                      <td style={{ textAlign: 'center' }}>
                        <span className={styles.gpaBadge}>
                          {stGpa}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Assignment Column */}
      {showAddCol && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Yangi Baholash Topshirig'i</h3>
              <button onClick={() => setShowAddCol(false)}>✕</button>
            </div>
            <form onSubmit={handleAddAssignment} className={styles.modalForm}>
              <div>
                <label className={styles.formLabel}>Topshiriq Nomi</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  placeholder="Masalan: Uy vazifasi 2, Nazorat ishi va h.k"
                  value={newColTitle}
                  onChange={e => setNewColTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowAddCol(false)}>
                  Bekor Qilish
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Ustun Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmAssignment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Topshiriqni O'chirish</h3>
              <button onClick={() => setDeleteConfirmAssignment(null)}>✕</button>
            </div>
            <div className={styles.modalForm}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Rostdan ham <strong>"{deleteConfirmAssignment.title}"</strong> ustunini va unga tegishli barcha baholarni o'chirib tashlamoqchimisiz?
              </p>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setDeleteConfirmAssignment(null)}>
                  Bekor qilish
                </button>
                <button type="button" className={styles.dangerBtn} onClick={() => handleDeleteAssignment(deleteConfirmAssignment.id)}>
                  Ha, O'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
