import { useState } from 'react';
import { RiQuestionnaireLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateQuiz } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function QuizGeneratorPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  const [form, setForm] = useState({
    subject: 'Matematika',
    grade: '9',
    topic: '',
    questionCount: '10',
    difficulty: 'orta'
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const generate = async () => {
    if (!form.topic.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos test mavzusini kiriting!' });
      return;
    }

    setLoading(true);
    try {
      const res = await generateQuiz({
        subject: form.subject,
        grade: form.grade,
        topic: form.topic,
        questionCount: form.questionCount,
        difficulty: form.difficulty
      });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Test savollari tayyorlandi!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Xatolik', message: err.message || 'Test yaratishda xatolik.' });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Fan nomi</label>
          <input 
            type="text" name="subject" placeholder="Masalan: Fizika" 
            className="input-custom" value={form.subject} onChange={handleChange}
          />
        </div>
        <div>
          <label className="form-label">Sinf</label>
          <select name="grade" className="input-custom" value={form.grade} onChange={handleChange}>
            {[1,2,3,4,5,6,7,8,9,10,11].map(g => <option key={g} value={g}>{g}-sinf</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Mavzu yoki Matn</label>
        <textarea 
          name="topic" placeholder="Nima haqida test tuzmoqchisiz? Qisqa mavzu yoki to'liq matn kiriting..." 
          className="input-custom" rows={4} value={form.topic} onChange={handleChange}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Savollar soni</label>
          <input 
            type="number" name="questionCount" min="1" max="30" 
            className="input-custom" value={form.questionCount} onChange={handleChange}
          />
        </div>
        <div>
          <label className="form-label">Qiyinlik darajasi</label>
          <select name="difficulty" className="input-custom" value={form.difficulty} onChange={handleChange}>
            <option value="oson">Oson</option>
            <option value="orta">O'rta</option>
            <option value="murakkab">Murakkab</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="Test Savollari Generator"
      description="Sun'iy intellekt yordamida har qanday fan bo'yicha darajali test savollari tuzing"
      icon={<RiQuestionnaireLine />}
      iconColor="#22C55E"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
