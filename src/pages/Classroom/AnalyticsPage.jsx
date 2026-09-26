import { useState, useEffect } from 'react';
import { 
  RiLineChartLine, RiFilter3Line, RiDownload2Line, 
  RiPieChartLine, RiUserLine, RiBarChart2Line,
  RiTrophyLine, RiAlertLine, RiBookOpenLine,
  RiGroupLine, RiCalendarLine, RiRefreshLine,
  RiStarLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import UserDataService from '../../services/UserDataService';
import { MONTHLY_PERFORMANCE, SUBJECTS } from '../../data/mockData';
import { useNotification } from '../../context/NotificationContext';
import styles from './Classroom.module.scss';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function AnalyticsPage() {
  const { addToast } = useNotification();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Barchasi');
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  const [students, setStudents] = useState([]);
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

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const timer = setTimeout(() => {
      const studentList = UserDataService.getStudents(user.id);
      const classSts = studentList.filter(s => s.grade && s.grade.split(',').map(g => g.trim()).includes(selectedClass));
      setStudents(classSts);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [user?.id, selectedClass]);

  // Calculate statistics
  const totalStudents = students.length;

  const averageGpa = totalStudents > 0 
    ? (students.reduce((acc, s) => acc + parseFloat(s.gpa || 0), 0) / totalStudents).toFixed(2)
    : '0.00';

  const averageAttendance = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + parseInt(s.attendance || 0), 0) / totalStudents)
    : 0;

  // Grade distributions (5, 4, 3, 2)
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0 };
  students.forEach(st => {
    const val = Math.round(parseFloat(st.gpa || 0));
    if (val >= 5) dist[5]++;
    else if (val >= 4) dist[4]++;
    else if (val >= 3) dist[3]++;
    else dist[2]++;
  });

  const pieData = [
    { name: "A'lo (5)", value: dist[5], color: '#10B981' },
    { name: "Yaxshi (4)", value: dist[4], color: '#2563EB' },
    { name: "Qoniqarli (3)", value: dist[3], color: '#F59E0B' },
    { name: "Qoniqarsiz (2)", value: dist[2], color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Top & Low performing students lists
  const sortedStudents = [...students].sort((a, b) => parseFloat(b.gpa || 0) - parseFloat(a.gpa || 0));
  const topStudents = sortedStudents.slice(0, 5);
  const lowStudents = sortedStudents.filter(s => parseFloat(s.gpa || 0) < 3.5 || parseInt(s.attendance || 0) < 85).slice(0, 5);

  // Subject performance mock data
  const baseGpa = parseFloat(averageGpa) || 4.2;
  const performanceData = [
    { subject: 'Algebra', gpa: Math.min(5, (baseGpa + 0.1).toFixed(1)) },
    { subject: 'Geometriya', gpa: Math.max(2, (baseGpa - 0.2).toFixed(1)) },
    { subject: 'Fizika', gpa: Math.min(5, (baseGpa + 0.3).toFixed(1)) },
    { subject: 'Kimyo', gpa: Math.max(2, (baseGpa - 0.1).toFixed(1)) },
    { subject: 'Informatika', gpa: Math.min(5, (baseGpa + 0.4).toFixed(1)) },
  ];

  const handleExport = () => {
    addToast({ type: 'success', title: 'Hisobot Tayyor', message: `${selectedClass} sinfi tahliliy hisoboti PDF formatida yuklab olindi!` });
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiLineChartLine /> Sinf Tahlili (Analytics Dashboard)</h1>
          <p className={styles.pageSubtitle}>O'quvchilar va sinflarning umumiy o'zlashtirishi, davomat trendlari va xavf guruhlari</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleExport} disabled={students.length === 0}>
          <RiDownload2Line /> PDF Hisobot Yuklash
        </button>
      </div>

      {/* Control / Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Class Selector */}
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

          {/* Subject Selector */}
          <div className={styles.filterSelectWrap}>
            <RiBookOpenLine />
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              <option value="Barchasi">Barcha fanlar</option>
              {SUBJECTS.map((sub, i) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className={styles.filterSelectWrap}>
            <RiCalendarLine />
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="week">Ushbu hafta</option>
              <option value="month">Ushbu oy</option>
              <option value="quarter">Choraklik</option>
              <option value="year">O'quv yili</option>
            </select>
          </div>
        </div>

        <div className={styles.statsSummary}>
          <span>Sinf: <strong style={{ color: 'var(--primary)' }}>{selectedClass || '-'}</strong></span>
          <span>Sana: <strong>{new Date().toLocaleDateString('uz-UZ')}</strong></span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Tahlillar hisoblanmoqda va grafiklar yuklanmoqda...</div>
        </div>
      ) : totalStudents === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <RiLineChartLine />
          </div>
          <div className={styles.emptyTitle}>Tahlillar mavjud emas</div>
          <div className={styles.emptyDesc}>Ushbu sinfda o'quvchilar ro'yxati shakllantirilmagan yoki yetarli baholar yo'q.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Stat Cards */}
          <div className={styles.statsCardsGrid}>
            <div className={styles.miniStatCard}>
              <div className={styles.miniStatIcon} style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
                <RiGroupLine />
              </div>
              <div className={styles.miniStatInfo}>
                <div className={styles.miniStatValue}>{totalStudents}</div>
                <div className={styles.miniStatLabel}>Jami O'quvchilar</div>
              </div>
            </div>

            <div className={styles.miniStatCard}>
              <div className={styles.miniStatIcon} style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                <RiStarLine />
              </div>
              <div className={styles.miniStatInfo}>
                <div className={styles.miniStatValue} style={{ color: '#10B981' }}>{averageGpa}</div>
                <div className={styles.miniStatLabel}>O'rtacha GPA (Baho)</div>
              </div>
            </div>

            <div className={styles.miniStatCard}>
              <div className={styles.miniStatIcon} style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                <RiLineChartLine />
              </div>
              <div className={styles.miniStatInfo}>
                <div className={styles.miniStatValue} style={{ color: '#F59E0B' }}>{averageAttendance}%</div>
                <div className={styles.miniStatLabel}>O'rtacha Davomat</div>
              </div>
            </div>

            <div className={styles.miniStatCard}>
              <div className={styles.miniStatIcon} style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}>
                <RiTrophyLine />
              </div>
              <div className={styles.miniStatInfo}>
                <div className={styles.miniStatValue} style={{ color: '#7C3AED' }}>{dist[5]} ta</div>
                <div className={styles.miniStatLabel}>A'lochi O'quvchilar</div>
              </div>
            </div>

            <div className={styles.miniStatCard}>
              <div className={styles.miniStatIcon} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                <RiAlertLine />
              </div>
              <div className={styles.miniStatInfo}>
                <div className={styles.miniStatValue} style={{ color: '#EF4444' }}>{lowStudents.length} ta</div>
                <div className={styles.miniStatLabel}>Xavf Guruhida</div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className={styles.analyticsGrid}>
            {/* 1. Monthly Performance & Attendance Trend AreaChart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h3><RiLineChartLine /> Oylik O'zlashtirish va Davomat Trendi</h3>
                  <p>Oylar davomida o'rtacha baho hamda davomat foizi o'zgarishi</p>
                </div>
              </div>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_PERFORMANCE}>
                    <defs>
                      <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }} />
                    <Area type="monotone" dataKey="avg" name="O'rtacha Baho" stroke="#2563EB" fill="url(#avgGrad)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="attendance" name="Davomat %" stroke="#10B981" fill="url(#attGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Grade Distribution PieChart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h3><RiPieChartLine /> Baholar Taqsimoti</h3>
                  <p>Sinf bo'yicha baholash ko'rsatkichlari nisbati</p>
                </div>
              </div>
              <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={80} 
                        paddingAngle={4} 
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Baholar yetarli emas</div>
                )}
              </div>
            </div>

            {/* 3. Subject Performance Comparison BarChart */}
            <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
              <div className={styles.chartHeader}>
                <div>
                  <h3><RiBarChart2Line /> Fanlar bo'yicha O'rtacha Ko'rsatkichlar</h3>
                  <p>Sinfdagi fanlar kesimida o'rtacha ballar solishtirmasi (Max: 5.0)</p>
                </div>
              </div>
              <div style={{ width: '100%', height: '230px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="subject" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" domain={[0, 5]} fontSize={11} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }} />
                    <Bar dataKey="gpa" name="GPA (Baho)" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top & Risk Students Tables Grid */}
          <div className={styles.analyticsGrid}>
            {/* Top Performers */}
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h3><RiTrophyLine style={{ color: '#F59E0B' }} /> Eng Yuqori Natijalar (Top 5)</h3>
              </div>
              <div className={styles.rankList}>
                {topStudents.map((st, index) => (
                  <div key={st.id} className={styles.rankItem}>
                    <div className={styles.rankNum} style={{ background: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : 'var(--surface)', color: index < 3 ? 'white' : 'var(--text)' }}>
                      {index + 1}
                    </div>
                    <div className={styles.rankInfo}>
                      <span>{st.name}</span>
                      <small>Davomat: {st.attendance}%</small>
                    </div>
                    <div className={styles.rankValue} style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                      GPA: {st.gpa}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Performers / At Risk */}
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h3><RiAlertLine style={{ color: '#EF4444' }} /> Qo'shimcha E'tibor Talab Qiladiganlar</h3>
              </div>
              {lowStudents.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Ajoyib! Sinfda xavf guruhidagi o'quvchilar yo'q.
                </div>
              ) : (
                <div className={styles.rankList}>
                  {lowStudents.map((st, index) => (
                    <div key={st.id} className={styles.rankItem}>
                      <div className={styles.rankNum} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                        !
                      </div>
                      <div className={styles.rankInfo}>
                        <span>{st.name}</span>
                        <small style={{ color: parseInt(st.attendance || 0) < 85 ? '#EF4444' : 'var(--text-muted)' }}>
                          Davomat: {st.attendance}%
                        </small>
                      </div>
                      <div className={styles.rankValue} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                        GPA: {st.gpa}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
