import { useState } from 'react';
import { RiTranslate2 } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { fixGrammarAndImproveText } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function TranslatorPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({
    text: '',
    action: 'translate'
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const generate = async () => {
    if (!form.text.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos matn kiriting!' });
      return;
    }

    setLoading(true);
    try {
      const res = await fixGrammarAndImproveText({
        text: form.text,
        action: form.action
      });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Matn qayta ishlandi!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Xatolik', message: err.message || 'Matnni qayta ishlashda xatolik.' });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Amal Turi</label>
        <select name="action" className="input-custom" value={form.action} onChange={handleChange}>
          <option value="translate">O'zbek adabiy tiliga tarjima qilish</option>
          <option value="grammar">Grammatik va imlo xatolarni tuzatish</option>
          <option value="improve">Matnni professional ta'limiy uslubda takomillashtirish</option>
        </select>
      </div>
      <div>
        <label className="form-label">Kiritiladigan Matn</label>
        <textarea 
          name="text" 
          placeholder="Matningizni shu yerga joylashtiring..." 
          className="input-custom" 
          rows={6}
          value={form.text} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="AI Tarjimon va Matn Yaxshilovchi"
      description="Grammatik xatolarni tuzatish, akademik tarjima va matn uslubini mukammallashtirish"
      icon={<RiTranslate2 />}
      iconColor="#06B6D4"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
