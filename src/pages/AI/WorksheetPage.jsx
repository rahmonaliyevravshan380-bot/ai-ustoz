import { useState } from 'react';
import { RiFileTextLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateAICompletion } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function WorksheetPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({ topic: '', grade: '9' });

  const generate = async () => {
    if (!form.topic.trim()) return;
    setLoading(true);
    try {
      const prompt = `${form.grade}-sinf uchun "${form.topic}" mavzusida darsda tarqatishga mo'ljallangan Interaktiv Tarqatma Varaqa (Worksheet) va mashqlar to'plamini tayyorlang.`;
      const res = await generateAICompletion({ prompt });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Tarqatma varaqa tayyorlandi!' });
    } catch (err) {
      addToast({ type: 'error', title: 'Xatolik', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Mavzu</label>
        <input type="text" placeholder="Masalan: Kimyoviy reaksiyalar" className="input-custom" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} />
      </div>
      <div>
        <label className="form-label">Sinf</label>
        <select className="input-custom" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}>
          {[1,2,3,4,5,6,7,8,9,10,11].map(g => <option key={g} value={g}>{g}-sinf</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="Tarqatma Varaqalar (Worksheets)"
      description="Darsda tarqatish va mustaqil ishlash uchun tayyor varaqalar yarating"
      icon={<RiFileTextLine />}
      iconColor="#2563EB"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
