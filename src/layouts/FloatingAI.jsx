import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiBrainLine, RiCloseLine, RiSendPlaneLine, RiRobot2Line } from 'react-icons/ri';
import { useLanguage } from '../context/LanguageContext';
import styles from './FloatingAI.module.scss';

export default function FloatingAI() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const QUICK_PROMPTS = [
    t("prompt_lesson"),
    t("prompt_test"),
    t("prompt_presentation"),
    t("prompt_grading"),
  ];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: t("ai_greeting") }
  ]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', text: msg },
      { role: 'ai', text: `"${msg}" ${t("ai_help_prefix")} 🚀` }
    ]);
    setInput('');
  };

  return (
    <div className={styles.floating}>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.chatPanel}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <div className={styles.aiDot} />
                <RiRobot2Line /> {t("ai_assistant")}
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                <RiCloseLine />
              </button>
            </div>

            <div className={styles.messages}>
              {messages.map((m, i) => (
                <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                  {m.role === 'ai' && <div className={styles.aiAvatar}><RiRobot2Line /></div>}
                  <div className={styles.bubble}>{m.text}</div>
                </div>
              ))}
            </div>

            <div className={styles.quickPrompts}>
              {QUICK_PROMPTS.map(p => (
                <button key={p} className={styles.quickBtn} onClick={() => send(p)}>{p}</button>
              ))}
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                placeholder={t("ask_question_placeholder")}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                className={styles.chatInput}
              />
              <button className={styles.sendBtn} onClick={() => send()}>
                <RiSendPlaneLine />
              </button>
            </div>

            <button className={styles.fullChatBtn} onClick={() => { navigate('/dashboard/ai-chat'); setOpen(false); }}>
              {t("full_chat_btn")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={styles.fab}
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? { rotate: 45 } : { rotate: 0 }}
      >
        {open ? <RiCloseLine /> : <RiBrainLine />}
        {!open && <span className={styles.fabPulse} />}
      </motion.button>
    </div>
  );
}
