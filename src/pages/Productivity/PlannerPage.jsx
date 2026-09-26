import { useState } from 'react';
import { 
  RiLineChartLine, RiAddLine, RiCheckLine, RiTimeLine, 
  RiCalendarEventLine, RiTrophyLine, RiFireLine, RiBarChartGroupedLine,
  RiFlagLine, RiTaskLine, RiDeleteBin6Line
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell 
} from 'recharts';
import { useNotification } from '../../context/NotificationContext';
import styles from './Productivity.module.scss';

export default function PlannerPage() {
  const { addToast } = useNotification();
  const [period, setPeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  
  // Goals & Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, text: "9-A sinfiga yangi dars rejasini AI bilan yaratish", category: 'daily', done: true, xp: 50 },
    { id: 2, text: "10-B uy vazifalarini tekshirish va baholash", category: 'daily', done: false, xp: 40 },
    { id: 3, text: "Choraklik matematika testlarini shakllantirish", category: 'weekly', done: true, xp: 120 },
    { id: 4, text: "Ota-onalar majlisi taqdimotini tayyorlash", category: 'weekly', done: false, xp: 100 },
    { id: 5, text: "1-chorak sifat ko'rsatkichi hisobotini topshirish", category: 'monthly', done: false, xp: 250 },
    { id: 6, text: "Metodik birlashma yig'ilishida ma'ruza qilish", category: 'monthly', done: true, xp: 300 }
  ]);

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('daily');

  // Teacher Activity Log
  const activityData = [
    { day: 'Dush', tasks: 6, aiCalls: 12, hours: 5 },
    { day: 'Sesh', tasks: 8, aiCalls: 18, hours: 6 },
    { day: 'Chor', tasks: 5, aiCalls: 9, hours: 4 },
    { day: 'Pay', tasks: 9, aiCalls: 22, hours: 7 },
    { day: 'Jum', tasks: 7, aiCalls: 15, hours: 5.5 },
    { day: 'Shan', tasks: 4, aiCalls: 5, hours: 3 },
    { day: 'Yak', tasks: 2, aiCalls: 3, hours: 1 }
  ];

  // Achievements List
  const achievements = [
    { id: 1, title: "7 Kunlik Seriya", desc: "Ketma-ket 7 kun faollik", icon: "🔥", unlocked: true },
    { id: 2, title: "AI Magistri", desc: "100+ AI so'rovlar", icon: "⚡", unlocked: true },
    { id: 3, title: "Mukammal Ustoz", desc: "50 ta dars rejasini yakunlash", icon: "🏆", unlocked: true },
    { id: 4, title: "Top Metodist", desc: "100% vazifalarni o'z vaqtida bajarish", icon: "🎯", unlocked: false }
  ];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const task = {
      id: Date.now(),
      text: newTaskText.trim(),
      category: newTaskCategory,
      done: false,
      xp: newTaskCategory === 'daily' ? 30 : newTaskCategory === 'weekly' ? 80 : 150
    };

    setTasks(prev => [task, ...prev]);
    setNewTaskText('');
    addToast({ type: 'success', title: 'Maqsad qo\'shildi', message: 'Yangi maqsad ro\'yxatga kiritildi.' });
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.done;
        if (nextState) {
          addToast({ type: 'success', title: 'Barakalla! 🎉', message: `+${t.xp} XP to'pladingiz!` });
        }
        return { ...t, done: nextState };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => t.category === period);
  const completedCount = filteredTasks.filter(t => t.done).length;
  const progressPercent = filteredTasks.length ? Math.round((completedCount / filteredTasks.length) * 100) : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiLineChartLine /> Unumdorlik va Rejalashtirish</h1>
          <p className={styles.pageSubtitle}>Maqsadlar, ustoz faoliyati tahlili, erishilgan yutuqlar va unumdorlik</p>
        </div>
      </div>

      {/* Top Productivity Banner */}
      <div className={styles.bannerGrid}>
        <div className={styles.bannerCard} style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
          <div className={styles.bcContent}>
            <span>Bugungi progress</span>
            <h2>{progressPercent}% Maqsadlar Bajarildi</h2>
            <p>{completedCount} / {filteredTasks.length} ta topshiriq yakunlandi</p>
          </div>
          <div className={styles.bcCircle}>
            <RiFireLine />
          </div>
        </div>

        <div className={styles.bannerCard} style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
          <div className={styles.bcContent}>
            <span>To'plangan Tajriba</span>
            <h2>2,450 XP (Lvl 12)</h2>
            <p>Keyingi darajagacha 550 XP qoldi</p>
          </div>
          <div className={styles.bcCircle}>
            <RiTrophyLine />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.mainLayout}>
        {/* Left Column: Goals & Tasks */}
        <div className={styles.leftCol}>
          <div className={styles.sectionBox}>
            <div className={styles.boxHeader}>
              <h3><RiFlagLine /> Maqsadlar Ro'yxati</h3>
              <div className={styles.tabSwitch}>
                <button className={period === 'daily' ? styles.active : ''} onClick={() => setPeriod('daily')}>Kunlik</button>
                <button className={period === 'weekly' ? styles.active : ''} onClick={() => setPeriod('weekly')}>Haftalik</button>
                <button className={period === 'monthly' ? styles.active : ''} onClick={() => setPeriod('monthly')}>Oylik</button>
              </div>
            </div>

            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className={styles.taskForm}>
              <input 
                type="text" 
                placeholder={`${period === 'daily' ? 'Kunlik' : period === 'weekly' ? 'Haftalik' : 'Oylik'} yangi maqsad kiriting...`}
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                className="input-custom"
              />
              <button type="submit" className={styles.primaryBtn}><RiAddLine /> Qo'shish</button>
            </form>

            {/* Task Progress Bar */}
            <div className={styles.progressContainer}>
              <div className={styles.progressLabel}>
                <span>Bajarilish Ko'rsatkichi</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Task List */}
            <div className={styles.taskList}>
              {filteredTasks.length === 0 ? (
                <div className={styles.emptyState}>Ushbu bo'limda hozircha maqsadlar yo'q.</div>
              ) : (
                filteredTasks.map(t => (
                  <div key={t.id} className={`${styles.taskRow} ${t.done ? styles.done : ''}`}>
                    <button className={styles.checkBtn} onClick={() => toggleTask(t.id)}>
                      {t.done ? <RiCheckLine /> : <span />}
                    </button>
                    <span className={styles.taskTitle}>{t.text}</span>
                    <span className={styles.xpBadge}>+{t.xp} XP</span>
                    <button className={styles.delBtn} onClick={() => deleteTask(t.id)}><RiDeleteBin6Line /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Teacher Activity & Achievements */}
        <div className={styles.rightCol}>
          {/* Chart Box */}
          <div className={styles.sectionBox}>
            <div className={styles.boxHeader}>
              <h3><RiBarChartGroupedLine /> Haftalik Faoliyat Tahlili</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }} />
                <Bar dataKey="tasks" name="Bajarilgan vazifalar" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiCalls" name="AI so'rovlar" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Achievements */}
          <div className={styles.sectionBox}>
            <div className={styles.boxHeader}>
              <h3><RiTrophyLine /> Yutuqlar va NISHONLAR</h3>
            </div>
            <div className={styles.achievementsGrid}>
              {achievements.map(ach => (
                <div key={ach.id} className={`${styles.achCard} ${ach.unlocked ? styles.unlocked : styles.locked}`}>
                  <div className={styles.achIcon}>{ach.icon}</div>
                  <div>
                    <h4>{ach.title}</h4>
                    <p>{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
