import { useState } from 'react';
import { RiRobot2Line } from 'react-icons/ri';
import AIToolLayout from '../../components/layouts/AIToolLayout';

export default function PromptLibraryPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setResult('Mock natija... (Siz kiritgan ma\'lumotlarga asoslanib yaratildi)');
    setLoading(false);
  };

  const form = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Mavzu / So'rov</label>
        <input type='text' placeholder='Nimadir kiriting...' className='input-custom' />
      </div>
    </div>
  );

  return (
    <AIToolLayout
      title='PromptLibraryPage'
      description='Suniy intellekt yordamida yaratish'
      icon={<RiRobot2Line />}
      loading={loading}
      result={result}
      onGenerate={generate}
      formContent={form}
    />
  );
}

