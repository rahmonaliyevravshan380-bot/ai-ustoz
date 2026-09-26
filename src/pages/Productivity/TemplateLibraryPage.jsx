import { useState } from 'react';
import { 
  RiLayoutLine, RiSearchLine, RiDownloadCloud2Line, 
  RiFileCopyLine, RiCheckLine, RiCloseLine, RiMagicLine 
} from 'react-icons/ri';
import { TEMPLATES } from '../../data/mockData';
import { useNotification } from '../../context/NotificationContext';
import { generateAICompletion } from '../../services/openrouter';
import styles from './Productivity.module.scss';

export default function TemplateLibraryPage() {
  const { addToast } = useNotification();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTemplate, setActiveTemplate] = useState(null);
  
  // AI Fill states
  const [useAI, setUseAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [customizedContent, setCustomizedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'all', label: 'Barchasi' },
    { id: 'lesson', label: 'Dars rejasi' },
    { id: 'exam', label: 'Imtihon / Test' },
    { id: 'certificate', label: 'Sertifikat' },
    { id: 'homework', label: 'Uy vazifasi' },
    { id: 'rubric', label: 'Rubrika' },
    { id: 'attendance', label: 'Davomat' },
    { id: 'letter', label: 'Ota-ona maktubi' },
  ];

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenPreview = (tpl) => {
    setActiveTemplate(tpl);
    setUseAI(false);
    setAiPrompt('');
    setCustomizedContent(`[Shablon: ${tpl.title}]\n\nTavsif: ${tpl.desc}\n\nYuklab olish yoki AI yordamida o'zgartirish tugmasini bosing.`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customizedContent);
    setCopied(true);
    addToast({ type: 'success', title: 'Nusxalandi', message: 'Shablon matni nusxalandi.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAICustomize = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    try {
      const prompt = `Ushbu ta'lim shablonini ("${activeTemplate.title}": ${activeTemplate.desc}) o'qituvchining quyidagi so'rovi bo'yicha to'liq va tayyor ko'rinishda o'zbek tilida to'ldirib/tuzib bering:\n\n${aiPrompt}`;
      const response = await generateAICompletion({ prompt });
      setCustomizedContent(response);
      addToast({ type: 'success', title: 'Tayyor', message: 'Shablon AI yordamida muvaffaqiyatli to\'ldirildi!' });
    } catch (err) {
      addToast({ type: 'error', title: 'AI xatosi', message: err.message });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiLayoutLine /> Shablonlar Shabada</h1>
          <p className={styles.pageSubtitle}>Tayyor hujjatlar, sertifikatlar va jurnallar shablonlari</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <RiSearchLine />
          <input 
            type="text" 
            placeholder="Shablonlar bo'yicha qidiruv..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '4px' }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={selectedCategory === c.id ? styles.primaryBtn : styles.secondaryBtn}
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '15px', whiteSpace: 'nowrap' }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className={styles.emptyState}>
          <RiLayoutLine style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
          <p>Shablonlar topilmadi</p>
        </div>
      ) : (
        <div className={styles.classGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {filteredTemplates.map(tpl => (
            <div 
              key={tpl.id} 
              className={styles.classCard} 
              onClick={() => handleOpenPreview(tpl)}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{tpl.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>{tpl.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{tpl.desc}</p>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>💾 {tpl.downloads} ta yuklangan</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Foydalanish →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Preview and AI generator modal */}
      {activeTemplate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ maxWidth: '650px', width: '90%' }}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>{activeTemplate.icon}</span>
                <h3>{activeTemplate.title} shabloni</h3>
              </div>
              <button onClick={() => setActiveTemplate(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text)' }}>✕</button>
            </div>

            <div className={styles.modalForm} style={{ maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
              {!useAI ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'var(--surface-2)', padding: '14px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                    <strong>Tavsif:</strong> {activeTemplate.desc}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      type="button" 
                      className={styles.secondaryBtn} 
                      style={{ flex: 1 }}
                      onClick={() => {
                        setUseAI(true);
                        setAiPrompt(`Fan: Matematika\nMavzu: Kvadrat tenglamalar dars ishlanmasi uchun...`);
                      }}
                    >
                      <RiMagicLine style={{ color: 'var(--primary)' }} /> AI bilan to'ldirish
                    </button>
                    <button 
                      type="button" 
                      className={styles.primaryBtn} 
                      style={{ flex: 1 }}
                      onClick={() => {
                        addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Shablon yuklab olindi (simulyatsiya).' });
                        setActiveTemplate(null);
                      }}
                    >
                      <RiDownloadCloud2Line /> Standart Hujjat
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* AI prompts */}
                  <form onSubmit={handleAICustomize} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>AI ga so'rov (Hujjatni qanday to'ldirish kerak?)</label>
                    <textarea 
                      className="input-custom" 
                      rows={3}
                      placeholder="Qaysi fan, sinf, yoki qanday mazmun asosida to'ldirish kerakligini yozing..."
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      required
                    />
                    <button type="submit" className={styles.primaryBtn} style={{ alignSelf: 'flex-end' }} disabled={aiLoading}>
                      {aiLoading ? 'Generatsiya qilinmoqda...' : 'Hujjatni yaratish'}
                    </button>
                  </form>

                  {/* AI Result preview */}
                  <div>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Hujjat Matni</label>
                    <div style={{ position: 'relative' }}>
                      <pre 
                        style={{ 
                          whiteSpace: 'pre-wrap', 
                          background: 'var(--surface-2)', 
                          padding: '16px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          fontFamily: 'monospace'
                        }}
                      >
                        {customizedContent}
                      </pre>
                      <button 
                        onClick={handleCopy}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          padding: '6px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        {copied ? <RiCheckLine style={{ color: '#10B981' }} /> : <RiFileCopyLine />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
