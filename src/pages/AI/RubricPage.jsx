import { useState } from 'react';
import { RiAwardLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateRubric } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function RubricPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({
    taskTitle: '',
    criteriaList: ''
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const generate = async () => {
    if (!form.taskTitle.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos topshiriq nomini kiriting!' });
      return;
    }

    setLoading(true);
    try {
      const res = await generateRubric({
        taskTitle: form.taskTitle,
        criteriaList: form.criteriaList || "Kontent to'g'riligi, Taqdimot uslubi, Ijodkorlik, Amaliy yechim"
      });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Baholash mezoni yaratildi!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Xatolik', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Topshiriq yoki Loyiha Nomi</label>
        <input 
          type="text" name="taskTitle" placeholder="Masalan: Fizika bo'yicha amaliy loyiha" 
          className="input-custom" value={form.taskTitle} onChange={handleChange} 
        />
      </div>
      <div>
        <label className="form-label">Asosiy Mezonlar (vergul bilan ajrating)</label>
        <textarea 
          name="criteriaList" 
          placeholder="Masalan: Nazariy bilim, Masala yechish, Taqdimot qilish, Vaqtga rioya etish" 
          className="input-custom" 
          rows={3}
          value={form.criteriaList} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="Baholash Mezoni (Rubric) Generator"
      description="Loyiha va topshiriqlarni adolatli va mezonli baholash uchun professional rubric tayyorlang"
      icon={<RiAwardLine />}
      iconColor="#8B5CF6"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
