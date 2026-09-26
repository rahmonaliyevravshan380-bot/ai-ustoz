import { useState } from 'react';
import { RiYoutubeLine } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';
import { generateAICompletion } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';

export default function YouTubeAIPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const generate = async () => {
    if (!videoUrl.trim()) return;
    setLoading(true);
    try {
      const prompt = `Ushbu ta'limiy YouTube video bo'yicha darsda foydalanish uchun Qisqa Konspekt, Asosiy Savollar va Dars rejasi elementlarini tuzing:\nVideo: ${videoUrl}`;
      const res = await generateAICompletion({ prompt });
      setResult(res);
      addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Video tahlili yakunlandi!' });
    } catch (err) {
      addToast({ type: 'error', title: 'Xatolik', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">YouTube Video Havolasi yoki Mavzusi</label>
        <input type="text" placeholder="https://youtube.com/watch?v=... yoki video mavzusi" className="input-custom" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title="YouTube Video Konspekt AI"
      description="O'quv videolari asosida avtomatik konspektlar va muhokama savollari yarating"
      icon={<RiYoutubeLine />}
      iconColor="#FF0000"
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={form}
    />
  );
}
