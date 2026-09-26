import { useState } from 'react';
import { RiEditBoxLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateAICompletion } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function ExamGeneratorPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({
    subject: 'Matematika',
    grade: '9',
    term: '1-Chorak',
    variantCount: '2'
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `Imtihon / Nazorat Ishi Savollari Yaratish:\n- Fan: ${form.subject}\n- Sinf: ${form.grade}-sinf\n- Davr: ${form.term}\n- Variantlar soni: ${form.variantCount} ta variant.\n\nHar bir variant uchun 5 ta nazariy/amaliy savol va baholash mezonini tayyorlang.`;
      const res = await generateAICompletion({ prompt });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Imtihon savollari shakllantirildi!' });
    } catch (err) {
      addToast({ type: 'error', title: 'Xatolik', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Fan</label>
          <input type="text" name="subject" className="input-custom" value={form.subject} onChange={handleChange} />
        </div>
        <div>
          <label className="form-label">Sinf</label>
          <select name="grade" className="input-custom" value={form.grade} onChange={handleChange}>
            {[1,2,3,4,5,6,7,8,9,10,11].map(g => <option key={g} value={g}>{g}-sinf</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Chorak / Bosqich</label>
          <select name="term" className="input-custom" value={form.term} onChange={handleChange}>
            <option value="1-Chorak">1-Chorak imtihoni</option>
            <option value="2-Chorak">2-Chorak imtihoni</option>
            <option value="3-Chorak">3-Chorak imtihoni</option>
            <option value="4-Chorak">4-Chorak imtihoni</option>
            <option value="Yillik Imtihon">Yillik Yakuniy Imtihon</option>
          </select>
        </div>
        <div>
          <label className="form-label">Variantlar Soni</label>
          <select name="variantCount" className="input-custom" value={form.variantCount} onChange={handleChange}>
            <option value="2">2 Variant (A va B)</option>
            <option value="4">4 Variant (A, B, C, D)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="Imtihon va Nazorat Ishi Generator"
      description="Choraklik va yillik rasmiy nazorat ishlari uchun variantli savollar to'plamini yarating"
      icon={<RiEditBoxLine />}
      iconColor="#DC2626"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
