import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  RiRobot2Line, RiCalendarLine, RiGroupLine, RiBookOpenLine,
  RiBarChartLine, RiArrowUpLine, RiArrowRightLine, RiTimeLine,
  RiCheckLine, RiFlashlightLine, RiAddLine, RiBrainLine,
  RiFileList3Line, RiQuestionLine, RiSlideshowLine, RiAlarmLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import UserDataService from '../../services/UserDataService';
import { MONTHLY_PERFORMANCE } from '../../data/mockData';
import styles from './HomePage.module.scss';

// ─── Widget: Stat Card ────────────────────────────────
function StatCard({ title, value, sub, icon, color, trend, gradient }) {
  return (
    <motion.div
      className={styles.statCard}
      style={{ '--card-color': color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className={styles.statTop}>
        <div className={styles.statIcon} style={{ background: `${color}18`, color }}>{icon}</div>
        {trend && (
          <div className={`${styles.statTrend} ${trend > 0 ? styles.up : styles.down}`}>
            <RiArrowUpLine /> {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statTitle}>{title}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </motion.div>
  );
}

// ─── Widget: Pomodoro ─────────────────────────────────
function PomodoroWidget() {
  const { t } = useLanguage();
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) { setRunning(false); setSessions(s => s + 1); setTime(25 * 60); return; }
    const t = setInterval(() => setTime(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, time]);

  const mins = String(Math.floor(time / 60)).padStart(2, '0');
  const secs = String(time % 60).padStart(2, '0');
  const progress = ((25 * 60 - time) / (25 * 60)) * 100;

  return (
    <motion.div className={styles.pomodoroCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.cardHeader}>
        <RiAlarmLine className={styles.cardIcon} style={{ color: '#EF4444' }} />
        <span>{t("pomodoro_timer")}</span>
      </div>
      <div className={styles.pomodoroRing}>
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke="url(#pomGrad)" strokeWidth="8"
            strokeDasharray={`${progress * 2.76} ${276 - progress * 2.76}`}
            strokeDashoffset="69"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="pomGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
        <div className={styles.pomodoroTime}>{mins}:{secs}</div>
      </div>
      <div className={styles.pomodoroControls}>
        <button className={styles.pomBtn} onClick={() => { setTime(25 * 60); setRunning(false); }}>↺</button>
        <button className={styles.pomBtnPrimary} onClick={() => setRunning(r => !r)}>
          {running ? '⏸' : '▶'}
        </button>
        <button className={styles.pomBtn} onClick={() => setRunning(false)}>⏹</button>
      </div>
      <div className={styles.pomSessions}>🍅 {sessions} {t("sessions_today")}</div>
    </motion.div>
  );
}

// ─── Widget: Quick Notes ──────────────────────────────
function QuickNotesWidget() {
  const { t } = useLanguage();
  const [note, setNote] = useState(localStorage.getItem('ai-ustoz-note') || '');

  const saveNote = (val) => {
    setNote(val);
    localStorage.setItem('ai-ustoz-note', val);
  };

  return (
    <motion.div className={styles.notesCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.cardHeader}>
        <RiFileList3Line className={styles.cardIcon} style={{ color: '#F59E0B' }} />
        <span>{t("quick_notes")}</span>
      </div>
      <textarea
        className={styles.noteTextarea}
        placeholder={t("notes_placeholder")}
        value={note}
        onChange={e => saveNote(e.target.value)}
        rows={6}
      />
      <div className={styles.noteCount}>{note.length} {t("character_count")}</div>
    </motion.div>
  );
}

// ─── Main HomePage ────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = () => {
      setClasses(UserDataService.getClasses(user.id));
      setStudents(UserDataService.getStudents(user.id));
    };

    loadData();

    const handleDataChange = (e) => {
      if (e.detail.userId === user.id) {
        if (e.detail.key === 'students' || e.detail.key === 'classes') {
          loadData();
        }
      }
    };

    window.addEventListener('user-data-change', handleDataChange);
    return () => window.removeEventListener('user-data-change', handleDataChange);
  }, [user?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("greeting_morning") : hour < 17 ? t("greeting_afternoon") : t("greeting_evening");

  const now = new Date();
  const dateStr = now.toLocaleDateString(t("feature_lang") === 'English' ? 'en-US' : 'uz-Latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Generate today's lessons dynamically if classes exist
  const todayLessons = classes.map((cls, i) => {
    const times = ['08:00', '10:00', '12:00', '14:00'];
    return {
      time: cls.time ? cls.time.split(' ').pop() : times[i % times.length],
      subject: cls.subject,
      class: cls.name,
      room: cls.room,
      done: i < 2
    };
  });

  const tasks = [
    { id: 1, text: t("feature_lang") === 'English' ? "Prepare new quarterly test questions" : t("feature_lang") === 'Русский язык' ? "Подготовить новые квартальные тесты" : "Yangi choraklik test savollarini tayyorlash", done: false, priority: 'high' },
    { id: 2, text: t("feature_lang") === 'English' ? "Check and grade student notebooks" : t("feature_lang") === 'Русский язык' ? "Проверить тетради учеников" : "O'quvchilar daftarlarini tekshirish", done: false, priority: 'medium' },
    { id: 3, text: t("feature_lang") === 'English' ? "Formulate the lesson plan list" : t("feature_lang") === 'Русский язык' ? "Сформировать список планов уроков" : "Dars rejalari ro'yxatini shakllantirish", done: true, priority: 'low' },
  ];

  const [taskList, setTaskList] = useState(tasks);
  const toggleTask = (id) => setTaskList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const recentChats = [
    { icon: '📚', text: t("feature_lang") === 'English' ? "New Algebra lesson plan" : t("feature_lang") === 'Русский язык' ? "Новый план урока по алгебре" : "Yangi Algebra dars rejasi", time: t("feature_lang") === 'English' ? "Just now" : t("feature_lang") === 'Русский язык' ? "Только что" : "Hozirgina" },
    { icon: '❓', text: t("feature_lang") === 'English' ? "Quizzes for midterm exam" : t("feature_lang") === 'Русский язык' ? "Тесты для контрольной работы" : "Nazorat ishi testlari", time: t("feature_lang") === 'English' ? "1 hour ago" : t("feature_lang") === 'Русский язык' ? "1 час назад" : "1 soat oldin" },
  ];

  const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };

  // Calculate stats
  const averageGpa = students.length > 0 
    ? (students.reduce((acc, s) => acc + parseFloat(s.gpa || 0), 0) / students.length).toFixed(1)
    : '0.0';

  const averageAttendance = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + parseInt(s.attendance || 0), 0) / students.length)
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

  const totalSt = students.length || 1;
  const pieData = [
    { name: t('gpa_5'), value: Math.round((dist[5] / totalSt) * 100), color: '#22C55E' },
    { name: t('gpa_4'), value: Math.round((dist[4] / totalSt) * 100), color: '#2563EB' },
    { name: t('gpa_3'), value: Math.round((dist[3] / totalSt) * 100), color: '#F59E0B' },
    { name: t('gpa_2'), value: Math.round((dist[2] / totalSt) * 100), color: '#EF4444' },
  ];

  const quickTools = [
    { icon: <RiRobot2Line />, label: t('ai_chat'), path: '/dashboard/ai-chat', color: '#2563EB' },
    { icon: <RiFileList3Line />, label: t('lesson_planner'), path: '/dashboard/lesson-planner', color: '#7C3AED' },
    { icon: <RiQuestionLine />, label: t('quiz_generator'), path: '/dashboard/quiz-generator', color: '#22C55E' },
    { icon: <RiSlideshowLine />, label: t('presentation'), path: '/dashboard/presentation', color: '#F59E0B' },
    { icon: <RiBarChartLine />, label: t('analytics'), path: '/dashboard/analytics', color: '#EF4444' },
    { icon: <RiBrainLine />, label: t('prompt_library'), path: '/dashboard/prompt-library', color: '#06B6D4' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className={styles.greeting}>{greeting}, {user?.name?.split(' ')[1] || t('logout')}! 👋</h1>
            <p className={styles.dateStr}>{dateStr}</p>
          </div>
          <div className={styles.headerActions}>
            <Link to="/dashboard/ai-chat" className={styles.aiBtn}>
              <RiRobot2Line /> {t("chat_with_ai")}
            </Link>
          </div>
        </motion.div>

        {/* Quick Tools */}
        <div className={styles.quickTools}>
          {quickTools.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={t.path} className={styles.quickTool}>
                <div className={styles.qtIcon} style={{ background: `${t.color}18`, color: t.color }}>{t.icon}</div>
                <span>{t.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stat Cards */}
        <div className={styles.statsGrid}>
          <StatCard title={t("today_lessons")} value={classes.length} sub={t("active_lessons")} icon={<RiCalendarLine />} color="#2563EB" />
          <StatCard title={t("total_students")} value={students.length} sub={`${classes.length} ${t("in_classes")}`} icon={<RiGroupLine />} color="#7C3AED" />
          <StatCard title={t("average_gpa")} value={averageGpa} sub={t("all_classes")} icon={<RiBookOpenLine />} color="#22C55E" />
          <StatCard title={t("attendance_rate")} value={`${averageAttendance}%`} sub={t("average_value")} icon={<RiBarChartLine />} color="#F59E0B" />
          <StatCard title={t("ai_requests")} value="147" sub={t("this_month")} icon={<RiRobot2Line />} color="#EF4444" trend={34} />
          <StatCard title={t("xp_level")} value={`${user?.xp || 0}`} sub={`Lvl ${user?.level || 1}`} icon={<RiFlashlightLine />} color="#06B6D4" trend={12} />
        </div>

        {/* Main Grid */}
        <div className={styles.mainGrid}>
          {/* Performance Chart */}
          <motion.div
            className={`${styles.chartCard} ${styles.span2}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.cardHeader}>
              <div>
                <h3>O'quvchilar Ko'rsatkichi</h3>
                <p>Oylik o'rtacha baho va davomat</p>
              </div>
              <select className={styles.chartSelect}>
                <option>2025-2026 o'quv yili</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_PERFORMANCE} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: 'var(--text)', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="avg" name="O'rtacha baho" stroke="#2563EB" fill="url(#avgGrad)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="attendance" name="Davomat %" stroke="#22C55E" fill="url(#attGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Grade Distribution Pie */}
          <motion.div
            className={styles.chartCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className={styles.cardHeader}>
              <div>
                <h3>Baholash Taqsimoti</h3>
                <p>Barcha sinflar</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieLegend}>
              {pieData.map(d => (
                <div key={d.name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <strong>{d.value}%</strong>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Today's Lessons */}
          <motion.div
            className={styles.listCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleRow}>
                <RiCalendarLine style={{ color: '#2563EB' }} />
                <h3>Bugungi Darslar</h3>
              </div>
              <Link to="/dashboard/calendar" className={styles.viewAll}>Hammasi →</Link>
            </div>
            <div className={styles.lessonList}>
              {todayLessons.map((l, i) => (
                <div key={i} className={`${styles.lessonItem} ${l.done ? styles.lessonDone : ''}`}>
                  <div className={styles.lessonTime}>{l.time}</div>
                  <div className={styles.lessonDot} style={{ background: l.done ? '#22C55E' : '#2563EB' }} />
                  <div className={styles.lessonInfo}>
                    <span className={styles.lessonSubject}>{l.subject}</span>
                    <span className={styles.lessonMeta}>{l.class} · {l.room}-xona</span>
                  </div>
                  {l.done && <RiCheckLine className={styles.doneIcon} />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tasks */}
          <motion.div
            className={styles.listCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleRow}>
                <RiCheckLine style={{ color: '#22C55E' }} />
                <h3>Bugungi Vazifalar</h3>
              </div>
              <Link to="/dashboard/planner" className={styles.viewAll}>Hammasi →</Link>
            </div>
            <div className={styles.taskList}>
              {taskList.map(t => (
                <div key={t.id} className={`${styles.taskItem} ${t.done ? styles.taskDone : ''}`}>
                  <button className={styles.taskCheck} onClick={() => toggleTask(t.id)}>
                    {t.done ? <RiCheckLine /> : <span />}
                  </button>
                  <span className={styles.taskText}>{t.text}</span>
                  <div className={styles.taskPriority} style={{ background: `${priorityColors[t.priority]}18`, color: priorityColors[t.priority] }}>
                    {t.priority === 'high' ? 'Yuqori' : t.priority === 'medium' ? "O'rta" : 'Past'}
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.addTaskBtn}>
              <RiAddLine /> Vazifa qo'shish
            </button>
          </motion.div>

          {/* Recent AI Chats */}
          <motion.div
            className={styles.listCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleRow}>
                <RiRobot2Line style={{ color: '#7C3AED' }} />
                <h3>So'nggi AI Chatlar</h3>
              </div>
              <Link to="/dashboard/ai-chat" className={styles.viewAll}>Hammasi →</Link>
            </div>
            <div className={styles.chatList}>
              {recentChats.map((c, i) => (
                <Link to="/dashboard/ai-chat" key={i} className={styles.chatItem}>
                  <div className={styles.chatItemIcon}>{c.icon}</div>
                  <div className={styles.chatItemContent}>
                    <span>{c.text}</span>
                    <small>{c.time}</small>
                  </div>
                  <RiArrowRightLine className={styles.chatArrow} />
                </Link>
              ))}
              <Link to="/dashboard/ai-chat" className={styles.newChatBtn}>
                <RiAddLine /> Yangi chat boshlash
              </Link>
            </div>
          </motion.div>

          {/* Classes */}
          <motion.div
            className={styles.listCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleRow}>
                <RiGroupLine style={{ color: '#F59E0B' }} />
                <h3>Sinflarim</h3>
              </div>
              <Link to="/dashboard/classes" className={styles.viewAll}>Hammasi →</Link>
            </div>
            <div className={styles.classList}>
              {classes.length > 0 ? (
                classes.map(cls => {
                  const studentCount = students.filter(s => s.grade && s.grade.split(',').map(g => g.trim()).includes(cls.name)).length;
                  return (
                    <div key={cls.id} className={styles.classItem}>
                      <div className={styles.classColor} style={{ background: cls.color }} />
                      <div className={styles.classInfo}>
                        <span className={styles.className}>{cls.name} · {cls.subject}</span>
                        <span className={styles.classMeta}>{studentCount} o'quvchi · {cls.time}</span>
                      </div>
                      <div className={styles.classBadge} style={{ background: `${cls.color}18`, color: cls.color }}>
                        {studentCount}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                  Hozircha sinflar yo'q. Yangi sinf qo'shing.
                </div>
              )}
            </div>
          </motion.div>

          {/* Pomodoro */}
          <PomodoroWidget />

          {/* Quick Notes */}
          <QuickNotesWidget />
        </div>
      </div>
    </div>
  );
}
