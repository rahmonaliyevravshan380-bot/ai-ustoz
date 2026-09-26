import { useState, useEffect } from 'react';
import { 
  RiCalendarCheckLine, RiFilter3Line, RiSave3Line, 
  RiCheckLine, RiCloseLine, RiBarChartLine, RiUserLine,
  RiTimeLine, RiFileTextLine, RiSearchLine, RiArrowLeftSLine,
  RiArrowRightSLine, RiPieChartLine, RiGroupLine, RiRefreshLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import UserDataService from '../../services/UserDataService';
import { useNotification } from '../../context/NotificationContext';
import styles from './Classroom.module.scss';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function AttendancePage() {
  const { addToast } = useNotification();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Load classes
  useEffect(() => {
    if (!user?.id) return;
    const loadedClasses = UserDataService.getClasses(user.id);
    setClasses(loadedClasses);
    if (loadedClasses.length > 0 && !selectedClass) {
      setSelectedClass(loadedClasses[0].name);
    }
  }, [user?.id, selectedClass]);

  // Load state
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    
    const studentList = UserDataService.getStudents(user.id);
    
    // Filter students by class
    const classSts = studentList.filter(s => s.grade && s.grade.split(',').map(g => g.trim()).includes(selectedClass));
    setStudents(classSts);

    // Load attendance records
    const savedRecords = UserDataService.getAttendance(user.id);
    setAttendanceRecords(savedRecords);
    setLoading(false);
  }, [user?.id, selectedClass]);

  // Date Navigation helpers
  const changeDate = (days) => {
    const d = new Date(attendanceDate);
    d.setDate(d.getDate() + days);
    setAttendanceDate(d.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setAttendanceDate(new Date().toISOString().split('T')[0]);
  };

  // Toggle present/absent/late/excused
  const handleMark = (studentId, status) => {
    const key = `${selectedClass}_${attendanceDate}_${studentId}`;
    const current = attendanceRecords[key];
    const updatedStatus = current === status ? '' : status; // toggle off if already selected
    const updated = {
      ...attendanceRecords,
      [key]: updatedStatus
    };
    setAttendanceRecords(updated);
  };

  const handleSave = () => {
    if (!user?.id) return;
    UserDataService.setAttendance(user.id, attendanceRecords);

    // Recalculate attendance % for students in the system
    const studentList = UserDataService.getStudents(user.id);
    const updatedStudents = studentList.map(st => {
      const studentKeys = Object.keys(attendanceRecords).filter(k => k.endsWith(`_${st.id}`));
      if (studentKeys.length > 0) {
        const presents = studentKeys.filter(k => attendanceRecords[k] === 'present' || attendanceRecords[k] === 'late').length;
        const attendance = Math.round((presents / studentKeys.length) * 100);
        return { ...st, attendance };
      }
      return st;
    });
    UserDataService.setStudents(user.id, updatedStudents);

    addToast({ type: 'success', title: 'Saqlandi', message: `${attendanceDate} kunlik davomat muvaffaqiyatli saqlandi!` });
  };

  const handleMarkAll = (status) => {
    const updated = { ...attendanceRecords };
    students.forEach(st => {
      const key = `${selectedClass}_${attendanceDate}_${st.id}`;
      updated[key] = status;
    });
    setAttendanceRecords(updated);
    const statusNames = {
      present: 'Darsda',
      absent: 'Kelmagan',
      late: 'Kechikkan',
      excused: 'Sababli'
    };
    addToast({ type: 'info', title: 'Belgilandi', message: `Barcha o'quvchilar '${statusNames[status]}' deb belgilandi.` });
  };

  // Filter students by search
  const filteredStudents = students.filter(st => st.name.toLowerCase().includes(search.toLowerCase()));

  // Calculate daily statistics
  const total = students.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let unmarkedCount = 0;

  students.forEach(st => {
    const key = `${selectedClass}_${attendanceDate}_${st.id}`;
    const status = attendanceRecords[key];
    if (status === 'present') presentCount++;
    else if (status === 'absent') absentCount++;
    else if (status === 'late') lateCount++;
    else if (status === 'excused') excusedCount++;
    else unmarkedCount++;
  });

  const markedTotal = presentCount + absentCount + lateCount + excusedCount;
  const attendancePercentage = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  // Pie chart data
  const pieData = [
    { name: 'Kelgan', value: presentCount, color: '#10B981' },
    { name: 'Kechikkan', value: lateCount, color: '#F59E0B' },
    { name: 'Sababli', value: excusedCount, color: '#2563EB' },
    { name: 'Kelmagan', value: absentCount, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Weekly trend summary chart data
  const chartData = [
    { day: 'Dush', kelgan: 92, kelmagan: 8 },
    { day: 'Sesh', kelgan: 96, kelmagan: 4 },
    { day: 'Chor', kelgan: 90, kelmagan: 10 },
    { day: 'Pay', kelgan: 95, kelmagan: 5 },
    { day: 'Jum', kelgan: 88, kelmagan: 12 },
    { day: 'Shan', kelgan: 85, kelmagan: 15 },
  ];

  // Date formatting for header label
  const formattedDateLabel = new Date(attendanceDate).toLocaleDateString('uz-UZ', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiCalendarCheckLine /> Davomat Jurnali</h1>
          <p className={styles.pageSubtitle}>O'quvchilar kunlik dars qatnashuvi va sabablarini belgilash hamda tahlili</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className={styles.secondaryBtn} onClick={() => handleMarkAll('present')}>
            <RiCheckLine style={{ color: '#10B981' }} /> Barchasi Kelgan
          </button>
          <button className={styles.primaryBtn} onClick={handleSave}>
            <RiSave3Line /> Davomatni Saqlash
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
                <option value="">Sinf topilmadi</option>
              )}
            </select>
          </div>

          {/* Date Picker Nav */}
          <div className={styles.dateNav}>
            <button className={styles.dateNavBtn} onClick={() => changeDate(-1)} title="Oldingi kun">
              <RiArrowLeftSLine />
            </button>
            <div className={styles.filterSelectWrap} style={{ border: 'none', padding: 0, background: 'none' }}>
              <input 
                type="date" 
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
              />
            </div>
            <button className={styles.dateNavBtn} onClick={() => changeDate(1)} title="Keyingi kun">
              <RiArrowRightSLine />
            </button>
            <button className={styles.dateTodayBtn} onClick={setToday}>
              Bugun
            </button>
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

        {/* Date Display Badge */}
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--surface-2)', padding: '6px 14px', borderRadius: '10px' }}>
          {formattedDateLabel}
        </div>
      </div>

      {/* Daily Statistics Cards Grid */}
      <div className={styles.statsCardsGrid}>
        <div className={styles.miniStatCard}>
          <div className={styles.miniStatIcon} style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
            <RiGroupLine />
          </div>
          <div className={styles.miniStatInfo}>
            <div className={styles.miniStatValue}>{total}</div>
            <div className={styles.miniStatLabel}>Jami O'quvchilar</div>
          </div>
        </div>

        <div className={styles.miniStatCard}>
          <div className={styles.miniStatIcon} style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
            <RiCheckLine />
          </div>
          <div className={styles.miniStatInfo}>
            <div className={styles.miniStatValue} style={{ color: '#10B981' }}>{presentCount}</div>
            <div className={styles.miniStatLabel}>Kelganlar</div>
          </div>
        </div>

        <div className={styles.miniStatCard}>
          <div className={styles.miniStatIcon} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
            <RiCloseLine />
          </div>
          <div className={styles.miniStatInfo}>
            <div className={styles.miniStatValue} style={{ color: '#EF4444' }}>{absentCount}</div>
            <div className={styles.miniStatLabel}>Kelmaganlar</div>
          </div>
        </div>

        <div className={styles.miniStatCard}>
          <div className={styles.miniStatIcon} style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
            <RiTimeLine />
          </div>
          <div className={styles.miniStatInfo}>
            <div className={styles.miniStatValue} style={{ color: '#F59E0B' }}>{lateCount}</div>
            <div className={styles.miniStatLabel}>Kechikkanlar</div>
          </div>
        </div>

        <div className={styles.miniStatCard}>
          <div className={styles.miniStatIcon} style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
            <RiFileTextLine />
          </div>
          <div className={styles.miniStatInfo}>
            <div className={styles.miniStatValue} style={{ color: '#2563EB' }}>{excusedCount}</div>
            <div className={styles.miniStatLabel}>Sababli</div>
          </div>
        </div>

        <div className={styles.miniStatCard}>
          <div className={styles.miniStatIcon} style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>
            <RiPieChartLine />
          </div>
          <div className={styles.miniStatInfo}>
            <div className={styles.miniStatValue} style={{ color: '#7C3AED' }}>{attendancePercentage}%</div>
            <div className={styles.miniStatLabel}>Davomat Foizi</div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className={styles.analyticsGrid}>
        {/* Left Side: Students Attendance List */}
        <div className={styles.tabContent} style={{ gridColumn: 'span 1' }}>
          <div className={styles.sectionHeader}>
            <h3><RiUserLine /> O'quvchilar Ro'yxati ({filteredStudents.length})</h3>
            {unmarkedCount > 0 && (
              <span style={{ fontSize: '0.78rem', color: '#F59E0B', background: 'rgba(245,158,11,0.12)', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
                {unmarkedCount} ta belgilanmagan
              </span>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <div className={styles.loadingText}>O'quvchilar davomati yuklanmoqda...</div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <RiUserLine />
              </div>
              <div className={styles.emptyTitle}>O'quvchi topilmadi</div>
              <div className={styles.emptyDesc}>
                {search ? `"${search}" so'rovi bo'yicha hech qanday o'quvchi topilmadi.` : "Ushbu sinfda o'quvchilar ro'yxati shakllantirilmagan."}
              </div>
              {search && (
                <button className={styles.secondaryBtn} onClick={() => setSearch('')}>
                  <RiRefreshLine /> Qidiruvni tozalash
                </button>
              )}
            </div>
          ) : (
            <div className={styles.attendanceGrid}>
              {filteredStudents.map(st => {
                const key = `${selectedClass}_${attendanceDate}_${st.id}`;
                const status = attendanceRecords[key] || '';

                return (
                  <div 
                    key={st.id} 
                    className={`${styles.attCard} ${
                      status === 'present' ? styles.present : 
                      status === 'absent' ? styles.absent : 
                      status === 'late' ? styles.late : 
                      status === 'excused' ? styles.excused : ''
                    }`}
                  >
                    <div className={styles.attCardTop}>
                      <div className={styles.attAvatar}>{st.name[0]}</div>
                      <div className={styles.attInfo}>
                        <strong>{st.name}</strong>
                        <span>O'rtacha davomat: {st.attendance || 90}%</span>
                      </div>
                    </div>

                    {/* 4 Status Buttons */}
                    <div className={styles.statusBtnGroup}>
                      <button 
                        type="button"
                        className={`${styles.statusBtn} ${status === 'present' ? styles.activePresent : ''}`}
                        onClick={() => handleMark(st.id, 'present')}
                        title="Darsda / Kelgan"
                      >
                        <RiCheckLine />
                        <span>Kelgan</span>
                      </button>

                      <button 
                        type="button"
                        className={`${styles.statusBtn} ${status === 'absent' ? styles.activeAbsent : ''}`}
                        onClick={() => handleMark(st.id, 'absent')}
                        title="Darsga kelmagan"
                      >
                        <RiCloseLine />
                        <span>Kelmagan</span>
                      </button>

                      <button 
                        type="button"
                        className={`${styles.statusBtn} ${status === 'late' ? styles.activeLate : ''}`}
                        onClick={() => handleMark(st.id, 'late')}
                        title="Darsga kechikib kelgan"
                      >
                        <RiTimeLine />
                        <span>Kechikkan</span>
                      </button>

                      <button 
                        type="button"
                        className={`${styles.statusBtn} ${status === 'excused' ? styles.activeExcused : ''}`}
                        onClick={() => handleMark(st.id, 'excused')}
                        title="Sababli kelmagan (kasallik va h.k)"
                      >
                        <RiFileTextLine />
                        <span>Sababli</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Charts & Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Daily Status Pie Chart */}
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h3><RiPieChartLine /> Bugungi Davomat Taqsimoti</h3>
            </div>
            <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={45} 
                      outerRadius={75} 
                      paddingAngle={4} 
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Davomat statuslari hali belgilanmagan</div>
              )}
            </div>
          </div>

          {/* Weekly Summary Bar Chart */}
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h3><RiBarChartLine /> Haftalik Davomat Ko'rsatkichi</h3>
            </div>
            <div style={{ width: '100%', height: '210px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="kelgan" name="Kelgan %" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
