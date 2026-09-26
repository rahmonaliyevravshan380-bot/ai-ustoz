import { useState } from 'react';
import { RiSlideshowLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generatePresentationOutline } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function PresentationPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [form, setForm] = useState({
    topic: '',
    slideCount: '7',
    audience: "O'quvchilar"
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const generate = async () => {
    if (!form.topic.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos prezentatsiya mavzusini kiriting!' });
      return;
    }

    setLoading(true);
    try {
      const res = await generatePresentationOutline({
        topic: form.topic,
        slideCount: form.slideCount,
        audience: form.audience
      });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Prezentatsiya strukturasi tayyorlandi!' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Xatolik', message: err.message || 'Prezentatsiya yaratishda xatolik.' });
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Prezentatsiya Mavzusi</label>
        <input 
          type="text" 
          name="topic" 
          placeholder="Masalan: Quyosh tizimi va sayyoralar" 
          className="input-custom" 
          value={form.topic} 
          onChange={handleChange} 
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label className="form-label">Slaydlar soni</label>
          <input 
            type="number" 
            name="slideCount" 
            min="3" 
            max="20" 
            className="input-custom" 
            value={form.slideCount} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <label className="form-label">Auditoriya</label>
          <select name="audience" className="input-custom" value={form.audience} onChange={handleChange}>
            <option value="Boshlang'ich sinflar">Boshlang'ich sinflar</option>
            <option value="Yuqori sinf o'quvchilari">Yuqori sinf o'quvchilari</option>
            <option value="O'qituvchilar va Hakamlar">O'qituvchilar va Hakamlar</option>
            <option value="Ota-onalar">Ota-onalar</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="Prezentatsiya Generator"
      description="Slaydlar strukturasi, matnlar va o'qituvchi ma'ruzasi eslatmalarini tayyorlang"
      icon={<RiSlideshowLine />}
      iconColor="#F59E0B"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={formContent}
    />
  );
}
