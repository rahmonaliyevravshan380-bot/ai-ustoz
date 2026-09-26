import { useState } from 'react';
import { RiScanLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateAICompletion } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function OCRPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [rawText, setRawText] = useState('');

  const generate = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    try {
      const prompt = `Ushbu skaner qilingan (OCR) matndagi xatolar va belgilarni tuzatib, raqamli toza matn holatiga keltiring:\n\n${rawText}`;
      const res = await generateAICompletion({ prompt });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'OCR matni raqamlashtirildi!' });
    } catch (err) {
      addToast({ type: 'error', title: 'Xatolik', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Skaner Matni (OCR Text)</label>
        <textarea rows={5} placeholder="Skanerdan olingan qoralama matnni kiriting..." className="input-custom" value={rawText} onChange={e => setRawText(e.target.value)} />
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="OCR Matnni Raqamlashtirish"
      description="Kitob yoki varaq skaneridan olingan matnlarni tahlil qilish va tozalash"
      icon={<RiScanLine />}
      iconColor="#06B6D4"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={form}
    />
  );
}
