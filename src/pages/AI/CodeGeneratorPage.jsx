import { useState } from 'react';
import { RiCodeSSlashLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateAICompletion } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function CodeGeneratorPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({ lang: 'Python', prompt: '' });

  const generate = async () => {
    if (!form.prompt.trim()) return;
    setLoading(true);
    try {
      const prompt = `Ta'lim va Informatika darsi uchun ${form.lang} tilida kod va uning izohini yozib bering:\n\nVazifa: ${form.prompt}`;
      const res = await generateAICompletion({ prompt });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Dastur kodi yaratildi!' });
    } catch (err) {
      addToast({ type: 'error', title: 'Xatolik', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Dasturlash Tili</label>
        <select className="input-custom" value={form.lang} onChange={e => setForm(p => ({ ...p, lang: e.target.value }))}>
          <option value="Python">Python</option>
          <option value="HTML/CSS">HTML / CSS</option>
          <option value="JavaScript">JavaScript</option>
          <option value="C++">C++</option>
          <option value="Scratch">Scratch (Mantiq)</option>
        </select>
      </div>
      <div>
        <label className="form-label">Vazifa Tavsifi</label>
        <textarea rows={4} placeholder="Masalan: 1 dan 100 gacha juft sonlarni chiqaruvchi dastur..." className="input-custom" value={form.prompt} onChange={e => setForm(p => ({ ...p, prompt: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="Informatika va Kod Generator"
      description="Dasturlash darslari uchun tayyor kod namunalari va amaliy topshiriqlar yarating"
      icon={<RiCodeSSlashLine />}
      iconColor="#10B981"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
