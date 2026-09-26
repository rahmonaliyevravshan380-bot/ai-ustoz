import { useState, useEffect } from 'react';
import { 
  RiToolsLine, RiTimerLine, RiUserHeartLine, 
  RiGroupLine, RiVolumeUpLine, RiPlayLine, RiPauseLine, RiRefreshLine 
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import UserDataService from '../../services/UserDataService';
import { useNotification } from '../../context/NotificationContext';
import styles from './Productivity.module.scss';

export default function ClassroomToolsPage() {
  const { addToast } = useNotification();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  
  // Timer state
  const [timerVal, setTimerVal] = useState(60); // 60 seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerOriginalVal, setTimerOriginalVal] = useState(60);

  // Random picker state
  const [pickerRunning, setPickerRunning] = useState(false);
  const [pickedName, setPickedName] = useState('');

  // Group generator state
  const [groupCount, setGroupCount] = useState(4);
  const [generatedGroups, setGeneratedGroups] = useState([]);

  // Noise meter state
  const [noiseLevel, setNoiseLevel] = useState(10);
  const [noiseRunning, setNoiseRunning] = useState(false);

  // Load classes
  useEffect(() => {
    if (!user?.id) return;
    const loadedClasses = UserDataService.getClasses(user.id);
    setClasses(loadedClasses);
    if (loadedClasses.length > 0 && !selectedClass) {
      setSelectedClass(loadedClasses[0].name);
    }
  }, [user?.id, selectedClass]);

  // Load students for active class
  useEffect(() => {
    if (!user?.id) return;
    const studentList = UserDataService.getStudents(user.id);
    setStudents(studentList.filter(st => st.grade && st.grade.split(',').map(g => g.trim()).includes(selectedClass)));
  }, [user?.id, selectedClass]);

  // Timer useEffect
  useEffect(() => {
    if (!timerRunning) return;
    if (timerVal <= 0) {
      setTimerRunning(false);
      addToast({ type: 'info', title: 'Vaqt tugadi!', message: 'Sinf mashg\'uloti vaqti tugadi.' });
      return;
    }
    const t = setInterval(() => setTimerVal(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timerRunning, timerVal]);

  // Noise simulation useEffect
  useEffect(() => {
    if (!noiseRunning) return;
    const n = setInterval(() => {
      setNoiseLevel(Math.floor(Math.random() * 80) + 10);
    }, 400);
    return () => clearInterval(n);
  }, [noiseRunning]);

  // Picker spin action
  const handlePickRandom = () => {
    if (students.length === 0) return;
    setPickerRunning(true);
    setPickedName("Tanlanmoqda...");

    let counter = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * students.length);
      setPickedName(students[idx].name);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setPickerRunning(false);
        addToast({ type: 'success', title: 'O\'quvchi tanlandi', message: 'Tashabbuskor o\'quvchi aniqlandi.' });
      }
    }, 100);
  };

  // Group split action
  const handleGenerateGroups = () => {
    if (students.length === 0) return;
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const groups = Array.from({ length: groupCount }, () => []);
    
    shuffled.forEach((st, idx) => {
      groups[idx % groupCount].push(st.name);
    });

    setGeneratedGroups(groups);
    addToast({ type: 'success', title: 'Guruhlar tuzildi', message: `${groupCount} ta guruh shakllantirildi.` });
  };

  const formattedMins = String(Math.floor(timerVal / 60)).padStart(2, '0');
  const formattedSecs = String(timerVal % 60).padStart(2, '0');

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiToolsLine /> Sinf Vositalari (Classroom Tools)</h1>
          <p className={styles.pageSubtitle}>Dars davomida interaktivlikni oshiruvchi yordamchi uskunalar</p>
        </div>
        <div className={styles.filterSelectWrap} style={{ background: 'var(--surface)' }}>
          <RiGroupLine />
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {classes.length > 0 ? (
              classes.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))
            ) : (
              <option value="">Sinf yo'q</option>
            )}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* 1. Timer / Stopwatch */}
        <div className={styles.tabContent}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RiTimerLine /> Sinf Taymeri (Timer)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>
              {formattedMins}:{formattedSecs}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {[1, 5, 10, 15].map(m => (
                <button 
                  key={m} 
                  className={styles.secondaryBtn} 
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => { setTimerVal(m * 60); setTimerOriginalVal(m * 60); setTimerRunning(false); }}
                >
                  +{m} daq
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className={timerRunning ? styles.secondaryBtn : styles.primaryBtn} 
                onClick={() => setTimerRunning(!timerRunning)}
              >
                {timerRunning ? <RiPauseLine /> : <RiPlayLine />} {timerRunning ? 'Pauza' : 'Boshlash'}
              </button>
              <button className={styles.secondaryBtn} onClick={() => { setTimerVal(timerOriginalVal); setTimerRunning(false); }}>
                <RiRefreshLine /> Qayta tiklash
              </button>
            </div>
          </div>
        </div>

        {/* 2. Random name picker */}
        <div className={styles.tabContent}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RiUserHeartLine /> Tasodifiy Tanlov (Random Picker)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', justifyContent: 'center', height: '150px' }}>
            {pickedName ? (
              <div 
                style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: pickerRunning ? 'var(--text-muted)' : 'var(--primary)',
                  margin: '16px 0',
                  padding: '8px 24px',
                  background: 'var(--surface-2)',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)'
                }}
              >
                {pickedName}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '16px 0' }}>O'quvchini aniqlang</div>
            )}

            <button className={styles.primaryBtn} onClick={handlePickRandom} disabled={pickerRunning || students.length === 0}>
              Sinfdan tanlash
            </button>
          </div>
        </div>

        {/* 3. Group generator */}
        <div className={styles.tabContent} style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RiGroupLine /> Guruhlar Generator (Group Maker)
          </h3>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Guruhlar soni:</label>
            <input 
              type="number" 
              className="input-custom" 
              style={{ width: '80px' }} 
              value={groupCount} 
              onChange={e => setGroupCount(Math.max(2, parseInt(e.target.value) || 2))} 
            />
            <button className={styles.primaryBtn} onClick={handleGenerateGroups} disabled={students.length === 0}>
              Guruhlarni taqsimlash
            </button>
          </div>

          {generatedGroups.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {generatedGroups.map((g, idx) => (
                <div key={idx} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '8px' }}>
                    {idx + 1}-Guruh
                  </h4>
                  <ul style={{ paddingLeft: '16px', fontSize: '12px', lineHeight: '1.6' }}>
                    {g.map((name, i) => <li key={i}>{name}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
