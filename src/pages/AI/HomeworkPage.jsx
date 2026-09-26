import { useState } from 'react';
import { RiHomeHeartLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateHomework } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function HomeworkPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({
    subject: 'Fizika',
    grade: '9',
    topic: '',
    type: 'amaliy'
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const generate = async () => {
    if (!form.topic.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos uy vazifasi mavzusini kiriting!' });
      return;
    }

    setLoading(true);
    try {
      const res = await generateHomework({
        subject: form.subject,
        grade: form.grade,
        topic: form.topic,
        type: form.type
      });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Uy vazifalari shakllantirildi!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Xatolik', message: err.message || 'Uy vazifasi yaratishda xatolik.' });
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
        <label className="form-label">Dars Mavzusi</label>
        <input 
          type="text" name="topic" placeholder="Masalan: Nyuton qonunlari" 
          className="input-custom" value={form.topic} onChange={handleChange} 
        />
      </div>
      <div>
        <label className="form-label">Vazifa Turi</label>
        <select name="type" className="input-custom" value={form.type} onChange={handleChange}>
          <option value="amaliy">Amaliy masalalar</option>
          <option value="nazariy">Nazariy va ijodiy savollar</option>
          <option value="loyiha">Kichik loyiha / Izlanish</option>
          <option value="insho">Insho / Esse yozish</option>
        </select>
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="Uy Vazifasi Generator"
      description="Har xil darajadagi amaliy va mantiqiy uy topshiriqlarini avtomatik tayyorlang"
      icon={<RiHomeHeartLine />}
      iconColor="#EC4899"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
