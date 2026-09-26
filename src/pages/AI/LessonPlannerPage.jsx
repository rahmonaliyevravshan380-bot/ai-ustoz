import { useState } from 'react';
import { RiFileList3Line } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateLessonPlan } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function LessonPlannerPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  const [form, setForm] = useState({
    subject: 'Matematika',
    topic: '',
    grade: '9',
    duration: '45 daqiqa',
    goals: ''
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const generate = async () => {
    if (!form.topic.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos dars mavzusini kiriting!' });
      return;
    }

    setLoading(true);
    try {
      const res = await generateLessonPlan({
        subject: form.subject,
        grade: form.grade,
        topic: form.topic,
        duration: form.duration,
        goals: form.goals
      });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Dars rejasi yaratildi!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Xatolik', message: err.message || 'Dars rejasi yaratishda xatolik.' });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Fan nomi</label>
        <input 
          type="text" name="subject" placeholder="Masalan: Informatika, Fizika" 
          className="input-custom" value={form.subject} onChange={handleChange}
        />
      </div>
      <div>
        <label className="form-label">Dars mavzusi</label>
        <input 
          type="text" name="topic" placeholder="Masalan: Kvadrat tenglamalar yechish" 
          className="input-custom" value={form.topic} onChange={handleChange}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Sinf</label>
          <select name="grade" className="input-custom" value={form.grade} onChange={handleChange}>
            {[1,2,3,4,5,6,7,8,9,10,11].map(g => <option key={g} value={g}>{g}-sinf</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Davomiyligi</label>
          <select name="duration" className="input-custom" value={form.duration} onChange={handleChange}>
            <option value="45 daqiqa">45 daqiqa</option>
            <option value="90 daqiqa (Qo'shaloq)">90 daqiqa</option>
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Qo'shimcha maqsadlar / Eslatmalar (Ixtiyoriy)</label>
        <textarea
          name="goals"
          rows={3}
          placeholder="Masalan: Interaktiv o'yinlar va slaydlar bilan o'tilsin..."
          className="input-custom"
          value={form.goals}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="Dars Rejasi Generator"
      description="OpenRouter AI orqali har bir dars uchun mukammal dars rejasini yarating"
      icon={<RiFileList3Line />}
      iconColor="#7C3AED"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
