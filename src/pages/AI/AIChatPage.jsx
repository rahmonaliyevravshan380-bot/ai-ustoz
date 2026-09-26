import { useState, useRef, useEffect, useCallback } from 'react';
import {
  RiRobot2Line, RiSendPlaneLine, RiUserLine, RiDeleteBin6Line,
  RiFileCopyLine, RiCheckLine, RiStopCircleLine, RiRefreshLine,
  RiMicLine, RiMicOffLine, RiVolumeMuteLine, RiVolumeUpLine,
  RiImageLine, RiDownloadCloud2Line, RiMagicLine,
  RiArrowUpLine, RiArrowDownLine,
} from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AIChatPage.module.scss';
import { streamAIChat, generateImage, detectIntent, generateAICompletion } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

// ─── Markdown-like renderer (no external lib) ─────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} style={{ margin: '10px 0 4px', fontSize: '1rem' }}>{line.slice(4)}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} style={{ margin: '12px 0 4px', fontSize: '1.1rem' }}>{line.slice(3)}</h2>;
    if (line.startsWith('# ')) return <h1 key={i} style={{ margin: '14px 0 4px', fontSize: '1.2rem' }}>{line.slice(2)}</h1>;
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <div key={i} style={{ paddingLeft: '16px', margin: '2px 0' }}>• {line.slice(2)}</div>;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <strong key={i} style={{ display: 'block', margin: '4px 0' }}>{line.slice(2, -2)}</strong>;
    }
    if (line.trim() === '') return <br key={i} />;
    // Inline bold
    const boldParts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={i} style={{ margin: '2px 0', lineHeight: '1.6' }}>
        {boldParts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
      </div>
    );
  });
}

// ─── Image Message Component ────────────────────────────────────────
function ImageMessage({ imageUrl, prompt }) {
  const [loaded, setLoaded] = useState(false);

  const downloadImage = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-ustoz-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className={styles.imageResult}>
      {!loaded && <div className={styles.imgSkeleton}><div className={styles.shimmer} /></div>}
      <img
        src={imageUrl}
        alt={prompt}
        className={styles.generatedImg}
        style={{ display: loaded ? 'block' : 'none' }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      {loaded && (
        <button className={styles.downloadImgBtn} onClick={downloadImage} title="Yuklash">
          <RiDownloadCloud2Line /> Rasmni Yuklash
        </button>
      )}
    </div>
  );
}

// ─── Suggestion Chips ────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: '📚 Dars Rejasi Yarat', prompt: '9-A sinf uchun "Kvadrat tenglamalar" mavzusida dars rejasini yarating' },
  { label: '📝 Test Tuz', prompt: '10-sinf Fizika "Mexanika" bo\'yicha 10 ta test savoli tuzing' },
  { label: '🖼️ Rasm Yarat', prompt: 'O\'quvchilar sinf xonasida tajriba o\'tkazayapti rasmi' },
  { label: '🏠 Uy Vazifasi', prompt: '9-sinf algebra mavzusida uy vazifasi yarating' },
  { label: '📊 Prezentatsiya', prompt: '"Sun\'iy intellekt" mavzusida 7 ta slayd rejasini yarating' },
  { label: '🌐 Tarjima Qil', prompt: 'Bu matnni o\'zbek tiliga tarjima qiling: Science helps us understand' },
];

// ─── Main AIChatPage ──────────────────────────────────────────────────
export default function AIChatPage() {
  const { addToast } = useNotification();
  const { user, deductCredits } = useAuth();

  // Messages: { role: 'user'|'ai', text: string, imageUrl?: string, isImage?: bool }
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai-ustoz-chat-v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      role: 'ai',
      text: "Salom! Men **AI Ustoz** — sizning shaxsiy ta'lim assistentingizman. 🎓\n\nMen quyidagilarda yordam bera olaman:\n- 📚 **Dars rejalari** va metodika\n- 📝 **Test va imtihon savollari** yaratish\n- 🖼️ **Ta'lim rasmlari** generatsiya (\"sinf rasmi\" yozing!)\n- 🏠 **Uy vazifalari** va baholash\n- 📊 **Prezentatsiya** va hisobotlar\n- 🌐 **Tarjima** va matn takomillashtirish\n\nSavolingizni yozing yoki pastdagi tugmalardan birini bosing!"
    }]
  });

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [imageSettings, setImageSettings] = useState({ aspectRatio: '1:1', style: 'realistic' });
  const [showImageSettings, setShowImageSettings] = useState(false);

  const abortControllerRef = useRef(null);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('ai-ustoz-chat-v2', JSON.stringify(messages.slice(-100)));
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'uz-UZ';

    rec.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      const combined = finalText || interimText;
      setTranscript(combined);
      setInput(prev => finalText ? prev + finalText : combined);
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech') {
        addToast({ type: 'error', title: 'Mikrofon xatosi', message: e.error });
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current = rec;
    return () => rec.abort();
  }, []);

  const toggleMic = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({ type: 'error', title: 'Qo\'llab-quvvatlanmaydi', message: 'Brauzeringiz mikrofon funksiyasini qo\'llab-quvvatlamaydi.' });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
      addToast({ type: 'info', title: 'Tinglamoqda...', message: 'Gapirishni boshlang. Tugatish uchun yana tugmani bosing.' });
    }
  }, [isListening]);

  // Text-to-Speech
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Clean markdown before speaking
    const cleaned = text
      .replace(/#{1,6} /g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, 'rasm')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/```[\s\S]*?```/g, 'kod bloki')
      .replace(/`(.*?)`/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'uz-UZ';
    utterance.rate = 1.0;
    utterance.pitch = 1;

    // Try to find an Uzbek voice, fall back to any
    const voices = window.speechSynthesis.getVoices();
    const uzVoice = voices.find(v => v.lang.startsWith('uz')) || voices.find(v => v.lang.startsWith('ru')) || voices[0];
    if (uzVoice) utterance.voice = uzVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  // ─── Core Send Logic ────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const userText = (overrideText || input).trim();
    if (!userText || isGenerating) return;

    const intent = detectIntent(userText);
    const cost = intent === 'image' ? 5 : 1;
    const currentCredits = user?.credits !== undefined ? user.credits : 100;

    console.log("[CREDITS] Current:", currentCredits);
    console.log("[CREDITS] Chat cost:", intent !== 'image' ? 1 : 0);
    console.log("[CREDITS] Image cost:", intent === 'image' ? 5 : 0);

    if (currentCredits < cost) {
      if (intent === 'image') {
        addToast({
          type: 'error',
          title: 'Kreditlar yetarli emas',
          message: `⚡ 1 ta rasm yaratish uchun 5 kredit kerak. Sizda ${currentCredits} kredit bor.`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Kreditlar tugadi',
          message: `⚡ Kreditlaringiz tugadi. Davom etish uchun tarifni yangilang.`
        });
      }
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setInput('');
    setTranscript('');

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsGenerating(true);

    // ── IMAGE GENERATION PATH ──────────────────────────────────────
    if (intent === 'image') {
      const placeholderIdx = newMessages.length;
      setMessages(prev => [...prev, { role: 'ai', text: '', isImage: true, loading: true }]);

      try {
        addToast({ type: 'info', title: 'Rasm yaratilmoqda...', message: 'Flux AI bilan rasm generatsiya qilinmoqda.' });

        const { imageUrl } = await generateImage({
          prompt: userText,
          aspectRatio: imageSettings.aspectRatio,
          style: imageSettings.style,
        });

        setMessages(prev => {
          const updated = [...prev];
          updated[placeholderIdx] = {
            role: 'ai',
            text: `✅ Rasm muvaffaqiyatli yaratildi!\n**Prompt:** ${userText}\n**Uslub:** ${imageSettings.style} | **Nisbat:** ${imageSettings.aspectRatio}`,
            isImage: true,
            imageUrl,
            loading: false,
          };
          return updated;
        });

        // Deduct credits on successful image generation
        await deductCredits(5);

        addToast({ type: 'success', title: 'Rasm tayyor!', message: 'Rasmni yuklab olish uchun tugmani bosing.' });
      } catch (err) {
        console.error('Image gen error:', err);
        setMessages(prev => {
          const updated = [...prev];
          updated[placeholderIdx] = {
            role: 'ai',
            text: `❌ Rasm yaratishda xatolik: ${err.message}\n\nEhtimol bu model hozir mavjud emas. Iltimos, oddiy matnli so'rovdan foydalaning.`,
            isImage: false,
            loading: false,
          };
          return updated;
        });
        addToast({ type: 'error', title: 'Rasm xatosi', message: err.message });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // ── STREAMING CHAT PATH ────────────────────────────────────────
    const aiIdx = newMessages.length;
    setMessages(prev => [...prev, { role: 'ai', text: '' }]);
    abortControllerRef.current = new AbortController();

    try {
      let accumulated = '';
      await streamAIChat({
        messages: newMessages,
        onChunk: (chunk) => {
          accumulated += chunk;
          setMessages(prev => {
            const updated = [...prev];
            if (updated[aiIdx]) updated[aiIdx] = { role: 'ai', text: accumulated };
            return updated;
          });
        },
        signal: abortControllerRef.current.signal,
      });

      // Deduct credits on successful streaming completion
      await deductCredits(1);
    } catch (err) {
      if (err.name !== 'AbortError') {
        addToast({ type: 'error', title: 'AI xatosi', message: err.message });
        setMessages(prev => {
          const updated = [...prev];
          if (updated[aiIdx] && !updated[aiIdx].text) {
            updated[aiIdx] = {
              role: 'ai',
              text: `❌ Xatolik: ${err.message}\n\nIltimos API kalitingizni va internet ulanishingizni tekshiring.`,
            };
          }
          return updated;
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [input, isGenerating, isListening, messages, imageSettings]);

  const handleStop = () => {
    abortControllerRef.current?.abort();
    window.speechSynthesis?.cancel();
    setIsGenerating(false);
    setIsSpeaking(false);
  };

  const handleClear = () => {
    if (!window.confirm('Chat tarixini tozalamoqchimisiz?')) return;
    window.speechSynthesis?.cancel();
    const init = [{ role: 'ai', text: 'Yangi chat boshlandi. Qanday yordam bera olaman? 😊' }];
    setMessages(init);
    localStorage.setItem('ai-ustoz-chat-v2', JSON.stringify(init));
    addToast({ type: 'info', title: 'Tozalandi', message: 'Chat tarixi o\'chirildi.' });
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text || '');
    setCopiedIndex(idx);
    addToast({ type: 'success', title: 'Nusxalandi!', message: 'Matn buferga nusxalandi.' });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = async () => {
    if (isGenerating || messages.length < 2) return;
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return;
    const trimmed = messages.slice(0, lastUserIdx + 1);
    setMessages(trimmed);
    const lastUserMsg = trimmed[lastUserIdx].text;
    // Re-trigger send with the last user message
    await handleSend(lastUserMsg);
  };

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.aiIcon}><RiRobot2Line /></div>
          <div>
            <h2>AI Ustoz Smart Chat</h2>
            <p>Matn · Rasm · Ovoz · Intent Detection</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className={styles.optionsBtn}
            onClick={() => setShowImageSettings(s => !s)}
            title="Rasm sozlamalari"
            style={{ color: showImageSettings ? 'var(--primary)' : undefined }}
          >
            <RiImageLine />
          </button>
          <button className={styles.optionsBtn} onClick={handleClear} title="Chatni tozalash">
            <RiDeleteBin6Line />
          </button>
        </div>
      </div>

      {/* Image Settings Panel */}
      <AnimatePresence>
        {showImageSettings && (
          <motion.div
            className={styles.imageSettingsPanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.imgSettingsInner}>
              <span><RiImageLine /> Rasm Generatsiya Sozlamalari:</span>
              <div className={styles.imgSettingsGroup}>
                <label>Nisbat:</label>
                {['1:1', '16:9', '9:16'].map(r => (
                  <button
                    key={r}
                    className={imageSettings.aspectRatio === r ? styles.settingActive : styles.settingBtn}
                    onClick={() => setImageSettings(p => ({ ...p, aspectRatio: r }))}
                  >{r}</button>
                ))}
              </div>
              <div className={styles.imgSettingsGroup}>
                <label>Uslub:</label>
                {[
                  { id: 'realistic', label: '📷 Realistik' },
                  { id: 'anime', label: '🎌 Anime' },
                  { id: 'illustration', label: '🎨 Illustratsiya' },
                  { id: '3d', label: '🧊 3D' },
                ].map(s => (
                  <button
                    key={s.id}
                    className={imageSettings.style === s.id ? styles.settingActive : styles.settingBtn}
                    onClick={() => setImageSettings(p => ({ ...p, style: s.id }))}
                  >{s.label}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`${styles.messageWrapper} ${styles[msg.role]}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.messageAvatar}>
              {msg.role === 'ai' ? <RiRobot2Line /> : <RiUserLine />}
            </div>
            <div className={styles.msgContent}>
              {/* Show typing skeleton for empty AI messages */}
              {msg.role === 'ai' && msg.loading && (
                <div className={styles.imgLoadingSkeleton}>
                  <div className={styles.shimmer} />
                  <p>🎨 Rasm yaratilmoqda...</p>
                </div>
              )}

              {/* Image result */}
              {msg.isImage && msg.imageUrl && (
                <ImageMessage imageUrl={msg.imageUrl} prompt={msg.text} />
              )}

              {/* Text bubble */}
              {msg.text && !msg.loading && (
                <div className={styles.messageBubble}>
                  {msg.role === 'ai' ? renderMarkdown(msg.text) : msg.text}
                </div>
              )}

              {/* Empty generating state */}
              {msg.role === 'ai' && !msg.text && !msg.loading && isGenerating && i === messages.length - 1 && (
                <div className={styles.typingIndicator}>
                  <span /><span /><span />
                </div>
              )}

              {/* Message Actions */}
              {msg.text && !msg.loading && (
                <div className={`${styles.msgActions} ${msg.role === 'user' ? styles.userActions : ''}`}>
                  <button onClick={() => handleCopy(msg.text, i)}>
                    {copiedIndex === i ? <><RiCheckLine style={{ color: '#22C55E' }} /> Nusxalandi</> : <><RiFileCopyLine /> Nusxalash</>}
                  </button>
                  {msg.role === 'ai' && (
                    <>
                      <button onClick={() => speakText(msg.text)}>
                        {isSpeaking ? <><RiVolumeMuteLine /> To'xtatish</> : <><RiVolumeUpLine /> Ovoz</>}
                      </button>
                      {i === messages.length - 1 && !isGenerating && (
                        <button onClick={handleRegenerate}><RiRefreshLine /> Qayta</button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Global typing indicator */}
        {isGenerating && messages[messages.length - 1]?.role !== 'ai' && (
          <div className={`${styles.messageWrapper} ${styles.ai}`}>
            <div className={styles.messageAvatar}><RiRobot2Line /></div>
            <div className={styles.typingIndicator}>
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions Row */}
      {messages.length <= 1 && (
        <div className={styles.suggestionsRow}>
          {SUGGESTIONS.map(s => (
            <button key={s.label} className={styles.chipBtn} onClick={() => handleSend(s.prompt)}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Transcript Live Preview */}
      {isListening && transcript && (
        <div className={styles.transcriptPreview}>
          <RiMicLine /> {transcript}
        </div>
      )}

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isListening ? '🎤 Tinglamoqda...' : "Savolingizni yozing (Enter — yuborish, Shift+Enter — yangi qator). 'rasm yarat' yozsangiz rasm yaratadi!"}
            rows={2}
            className={styles.chatInput}
            disabled={isListening}
          />
          <div className={styles.inputBtns}>
            {/* Mic button */}
            <button
              className={`${styles.micBtn} ${isListening ? styles.micActive : ''}`}
              onClick={toggleMic}
              title={isListening ? "Mikrofoni o'chirish" : 'Ovozdan matn'}
            >
              {isListening ? <RiMicOffLine /> : <RiMicLine />}
            </button>

            {/* Send / Stop */}
            {isGenerating ? (
              <button className={`${styles.sendBtn} ${styles.stopBtn}`} onClick={handleStop} title="To'xtatish">
                <RiStopCircleLine />
              </button>
            ) : (
              <button className={styles.sendBtn} onClick={() => handleSend()} disabled={!input.trim() && !isListening}>
                <RiSendPlaneLine />
              </button>
            )}
          </div>
        </div>
        <div className={styles.inputFooter}>
          <RiMagicLine /> OpenRouter · GPT-4o-Mini · Flux Schnell · STT/TTS
        </div>
      </div>
    </div>
  );
}
