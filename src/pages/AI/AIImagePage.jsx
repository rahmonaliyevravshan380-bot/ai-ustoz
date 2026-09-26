import { useState } from 'react';
import { RiImageAiLine, RiDownloadCloud2Line, RiRefreshLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { generateImage } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import styles from './AIImagePage.module.scss';

const ASPECT_RATIOS = [
  { id: '1:1',  label: '1:1 — Kvadrat',       icon: '⬛' },
  { id: '16:9', label: '16:9 — Gorizontal',    icon: '▬' },
  { id: '9:16', label: '9:16 — Vertikal',      icon: '▮' },
];

const STYLES = [
  { id: 'realistic',    label: 'Realistik',      emoji: '📷' },
  { id: 'anime',        label: 'Anime',           emoji: '🎌' },
  { id: 'illustration', label: 'Illustratsiya',   emoji: '🎨' },
  { id: '3d',           label: '3D Render',       emoji: '🧊' },
];

const EXAMPLE_PROMPTS = [
  "Sinf xonasida dars berayotgan o'qituvchi",
  "O'quvchilar guruhda loyiha ustida ishlayapti",
  "Zamonaviy maktab kutubxonasi interior",
  "Bolalar geometriya figuralarini o'rganmoqda",
  "Kompyuter darsligi — dasturlash mashg'uloti",
  "Ta'lim texnologiyalari — sun'iy intellekt sinf",
];

export default function AIImagePage() {
  const { addToast } = useNotification();
  const { user, deductCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('realistic');
  const [imageCount, setImageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { imageUrl, prompt }
  const [history, setHistory] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos rasm tavsifini kiriting!' });
      return;
    }

    const cost = imageCount * 5;
    const currentCredits = user?.credits !== undefined ? user.credits : 100;

    console.log("[CREDITS] Current:", currentCredits);
    console.log("[CREDITS] Image cost:", cost);

    if (currentCredits < cost) {
      addToast({
        type: 'error',
        title: 'Kreditlar yetarli emas',
        message: `⚡ ${imageCount} ta rasm yaratish uchun ${cost} kredit kerak. Sizda ${currentCredits} kredit bor.`
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      addToast({ type: 'info', title: '🎨 Yaratilmoqda...', message: `Flux AI ${imageCount} ta rasm generatsiya qilmoqda...` });

      const promises = Array.from({ length: imageCount }).map(() =>
        generateImage({ prompt: prompt.trim(), aspectRatio, style })
      );
      const responses = await Promise.all(promises);

      const successfulImages = responses.filter(r => r && r.imageUrl);
      if (successfulImages.length === 0) {
        throw new Error("Rasm yaratish muvaffaqiyatsiz tugadi.");
      }

      const actualCost = successfulImages.length * 5;
      const newCredits = await deductCredits(actualCost);

      const newResults = successfulImages.map(img => ({
        imageUrl: img.imageUrl,
        prompt: prompt.trim(),
        aspectRatio,
        style,
        timestamp: Date.now()
      }));

      setResult(newResults[0]);
      setHistory(prev => [...newResults, ...prev].slice(0, 8));
      
      addToast({ 
        type: 'success', 
        title: '✅ Rasm tayyor!', 
        message: `${successfulImages.length} ta rasm yaratildi. Sizdan ${actualCost} kredit yechildi.` 
      });
    } catch (err) {
      console.error("[CREDITS] Image generation failed:", err);
      addToast({ type: 'error', title: 'Rasm generatsiya xatosi', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url, name = 'ai-rasm') => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${name}-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={styles.page}>
      {/* Left: Controls */}
      <motion.div className={styles.controls} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className={styles.ctrlHeader}>
          <div className={styles.ctrlIcon}><RiImageAiLine /></div>
          <div>
            <h1>AI Rasm Generator</h1>
            <p>Ta'lim rasmlari va ko'rgazmali materiallar yarating</p>
          </div>
        </div>

        {/* Prompt */}
        <div className={styles.field}>
          <label>Rasm Tavsifi (Prompt)</label>
          <textarea
            className="input-custom"
            rows={4}
            placeholder="Sinf xonasida zamonaviy o'quv jarayoni, yorqin va batafsil..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        {/* Example Prompts */}
        <div className={styles.field}>
          <label>Namuna Promptlar</label>
          <div className={styles.exampleChips}>
            {EXAMPLE_PROMPTS.map(p => (
              <button key={p} className={styles.chip} onClick={() => setPrompt(p)}>{p}</button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className={styles.field}>
          <label>Nisbat (Aspect Ratio)</label>
          <div className={styles.ratioGroup}>
            {ASPECT_RATIOS.map(r => (
              <button
                key={r.id}
                className={`${styles.ratioBtn} ${aspectRatio === r.id ? styles.active : ''}`}
                onClick={() => setAspectRatio(r.id)}
              >
                <span>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className={styles.field}>
          <label>Uslub (Style)</label>
          <div className={styles.styleGrid}>
            {STYLES.map(s => (
              <button
                key={s.id}
                type="button"
                className={`${styles.styleBtn} ${style === s.id ? styles.active : ''}`}
                onClick={() => setStyle(s.id)}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Images */}
        <div className={styles.field}>
          <label>Rasmlar Soni</label>
          <div className={styles.countGroup}>
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                className={`${styles.countBtn} ${imageCount === num ? styles.active : ''}`}
                onClick={() => setImageCount(num)}
              >
                <span>{num} ta</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({num * 5} ⚡)</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <><span className={styles.spinner} /> Yaratilmoqda...</>
          ) : (
            <><RiImageAiLine /> Rasm Yaratish</>
          )}
        </button>
      </motion.div>

      {/* Right: Result */}
      <motion.div className={styles.resultArea} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <h3>Natija</h3>
            {result && (
              <div className={styles.resultActions}>
                <button onClick={() => downloadImage(result.imageUrl)} className={styles.dlBtn}>
                  <RiDownloadCloud2Line /> Yuklash
                </button>
                <button onClick={handleGenerate} className={styles.regenBtn} disabled={loading}>
                  <RiRefreshLine /> Qayta
                </button>
              </div>
            )}
          </div>

          <div className={styles.resultBody}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" className={styles.loadingState} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className={styles.orbRing}>
                    <div className={styles.orb} />
                  </div>
                  <p>🎨 Flux AI rasm yaratmoqda...</p>
                  <span>Bu 10-30 soniya davom etishi mumkin</span>
                  <div className={styles.loadingSteps}>
                    <div className={styles.step}>Promptni tahlil qilmoqda...</div>
                    <div className={styles.step}>Rasm strukturasi yaratilmoqda...</div>
                    <div className={styles.step}>Piksellar renderlanmoqda...</div>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="result" className={styles.imageWrap} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <img
                    src={result.imageUrl}
                    alt={result.prompt}
                    className={`${styles.resultImg} ${styles[`ratio_${result.aspectRatio.replace(':', '_')}`]}`}
                  />
                  <div className={styles.imgMeta}>
                    <span><strong>Prompt:</strong> {result.prompt}</span>
                    <span><strong>Uslub:</strong> {result.style} · <strong>Nisbat:</strong> {result.aspectRatio}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" className={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className={styles.emptyIcon}><RiImageAiLine /></div>
                  <p>Chap tomonda prompt kiriting va <strong>Rasm Yaratish</strong> tugmasini bosing</p>
                  <span>Ta'limiy rasm, poster, banner, infografik va ko'rgazmalar yarating</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className={styles.historySection}>
            <h4>Avvalgi Rasmlar</h4>
            <div className={styles.historyGrid}>
              {history.map((item, i) => (
                <div key={i} className={styles.historyItem} onClick={() => setResult(item)}>
                  <img src={item.imageUrl} alt={item.prompt} />
                  <div className={styles.historyOverlay}>
                    <button onClick={(e) => { e.stopPropagation(); downloadImage(item.imageUrl); }}>
                      <RiDownloadCloud2Line />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
