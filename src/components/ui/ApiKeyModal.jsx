import { useState, useEffect } from 'react';
import { RiKeyLine, RiCloseLine, RiCheckLine, RiExternalLinkLine } from 'react-icons/ri';
import { getOpenRouterKey, setOpenRouterKey } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';
import styles from './ApiKeyModal.module.scss';

export default function ApiKeyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState('');
  const { addToast } = useNotification();

  useEffect(() => {
    const handleOpen = () => {
      setKey(getOpenRouterKey());
      setIsOpen(true);
    };

    window.addEventListener('ai-missing-api-key', handleOpen);
    return () => window.removeEventListener('ai-missing-api-key', handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!key.trim()) {
      addToast({ type: 'warning', title: 'Diqqat', message: 'Iltimos, API kalitni kiriting.' });
      return;
    }
    setOpenRouterKey(key.trim());
    setIsOpen(false);
    addToast({
      type: 'success',
      title: 'Kalit saqlandi! 🎉',
      message: 'OpenRouter API kaliti muvaffaqiyatli saqlandi. Endi qayta urinib ko\'ring.'
    });
  };

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <RiKeyLine />
          </div>
          <h3 className={styles.title}>OpenRouter API Kaliti</h3>
        </div>

        <p className={styles.desc}>
          AI assistent (GPT-4o, Claude, Flux) xizmatlaridan foydalanish uchun OpenRouter API kalitingizni kiriting.
        </p>

        <div className={styles.inputGroup}>
          <label>API Kalit (API Key):</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="sk-or-v1-..."
              value={key}
              onChange={e => setKey(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className={styles.hint}>
          💡 Kalitingiz yo'qmi? Uni <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">openrouter.ai/keys <RiExternalLinkLine style={{ verticalAlign: 'middle' }} /></a> sahifasidan bepul olishingiz mumkin.
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={() => setIsOpen(false)}>
            Bekor qilish
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            <RiCheckLine style={{ verticalAlign: 'middle', marginRight: 4 }} /> Saqlash va Faollashtirish
          </button>
        </div>
      </div>
    </div>
  );
}
