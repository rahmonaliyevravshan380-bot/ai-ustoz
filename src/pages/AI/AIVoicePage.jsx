import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiMicLine, RiMicOffLine, RiVolumeUpLine, RiVolumeMuteLine,
  RiPlayLine, RiPauseLine, RiStopLine, RiSendPlaneLine,
  RiRefreshLine, RiFileCopyLine, RiCheckLine,
} from 'react-icons/ri';
import { generateAICompletion } from '../../services/openrouter';
import { useNotification } from '../../context/NotificationContext';
import styles from './AIVoicePage.module.scss';

const UZBEK_TEXTS = [
  'Hisob-kitob 1 dan 100 gacha',
  'Dars boshlash uchun tayyorlanish',
  'Bugungi ob-havo qanday?',
  'O\'quvchilar uy vazifasi tayyor',
];

export default function AIVoicePage() {
  const { addToast } = useNotification();

  // STT State
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [sttSupported, setSttSupported] = useState(false);
  const recognitionRef = useRef(null);

  // AI Response
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speakingText, setSpeakingText] = useState('');

  const utteranceRef = useRef(null);

  // Init
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSttSupported(!!SpeechRecognition);
    setTtsSupported('speechSynthesis' in window);

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'uz-UZ';

      rec.onresult = (e) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t;
          else interim += t;
        }
        setLiveTranscript(interim);
        if (final) setFinalTranscript(prev => prev + final);
      };

      rec.onerror = (e) => {
        if (e.error !== 'no-speech') {
          addToast({ type: 'error', title: 'STT xatosi', message: e.error });
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        setLiveTranscript('');
      };

      recognitionRef.current = rec;
    }

    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ─── STT Controls ────────────────────────────────────────────────
  const startListening = () => {
    if (!recognitionRef.current) return;
    setFinalTranscript('');
    setLiveTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
      addToast({ type: 'info', title: '🎤 Tinglamoqda', message: 'Gapirishni boshlang...' });
    } catch (e) {
      addToast({ type: 'error', title: 'Mikrofon xatosi', message: e.message });
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ─── AI Send ─────────────────────────────────────────────────────
  const sendToAI = useCallback(async (text) => {
    const txt = text || finalTranscript;
    if (!txt.trim()) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos avval biror narsa gapiring yoki yozing!' });
      return;
    }

    setAiLoading(true);
    setAiResponse('');

    try {
      const response = await generateAICompletion({
        prompt: txt.trim(),
        max_tokens: 1000,
      });
      setAiResponse(response);

      // Auto-play TTS after AI responds
      if (window.speechSynthesis) {
        speakResponse(response);
      }
    } catch (err) {
      addToast({ type: 'error', title: 'AI xatosi', message: err.message });
    } finally {
      setAiLoading(false);
    }
  }, [finalTranscript]);

  // ─── TTS Controls ────────────────────────────────────────────────
  const speakResponse = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const clean = text
      .replace(/#{1,6} /g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, 'kod bloki')
      .replace(/`(.*?)`/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'uz-UZ';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const uzVoice = voices.find(v => v.lang.startsWith('uz'))
      || voices.find(v => v.lang.startsWith('ru'))
      || voices[0];
    if (uzVoice) utterance.voice = uzVoice;

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); setSpeakingText(clean); };
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); setSpeakingText(''); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const pauseSpeaking = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeSpeaking = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeakingText('');
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast({ type: 'success', title: 'Nusxalandi', message: 'Matn buferga nusxalandi.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const fullText = finalTranscript + liveTranscript;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.hIcon}><RiMicLine /></div>
        <div>
          <h1>AI Ovoz Assistent</h1>
          <p>Nutqni matnga o'zgartirish (STT) · AI javob · Matni ovozda o'qish (TTS)</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left: STT */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <RiMicLine /> Nutqni Yozuvga Aylantirish (STT)
          </div>

          {!sttSupported && (
            <div className={styles.notSupported}>
              ⚠️ Brauzeringiz nutqni tanish funksiyasini qo'llab-quvvatlamaydi. Chrome yoki Edge ishlating.
            </div>
          )}

          {/* Mic Visualizer */}
          <div className={styles.micVisual}>
            <motion.div
              className={`${styles.micCircle} ${isListening ? styles.listening : ''}`}
              animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            >
              {isListening ? <RiMicLine /> : <RiMicOffLine />}
            </motion.div>
            {isListening && (
              <div className={styles.waves}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.wave} style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
            <p className={styles.micStatus}>
              {isListening ? '🔴 Tinglamoqda...' : '⚪ Boshlash uchun tugmani bosing'}
            </p>
          </div>

          {/* STT Buttons */}
          <div className={styles.sttBtns}>
            {!isListening ? (
              <button className={styles.startBtn} onClick={startListening} disabled={!sttSupported}>
                <RiMicLine /> Tinglashni Boshlash
              </button>
            ) : (
              <button className={styles.stopBtn} onClick={stopListening}>
                <RiStopLine /> To'xtatish
              </button>
            )}
          </div>

          {/* Transcript Box */}
          <div className={styles.transcriptBox}>
            {fullText ? (
              <>
                <p>{finalTranscript}<span className={styles.interim}>{liveTranscript}</span></p>
                <button className={styles.copyBtn} onClick={() => copyText(fullText)}>
                  {copied ? <RiCheckLine /> : <RiFileCopyLine />} Nusxalash
                </button>
              </>
            ) : (
              <span className={styles.placeholder}>Aytganlaringiz bu yerga yoziladi...</span>
            )}
          </div>

          {/* Send to AI */}
          <button
            className={styles.sendAiBtn}
            onClick={() => sendToAI(fullText)}
            disabled={!fullText.trim() || aiLoading}
          >
            {aiLoading ? <span className={styles.spinner} /> : <RiSendPlaneLine />}
            {aiLoading ? "AI ishlayapti..." : "AI ga yuborish"}
          </button>

          {/* Quick TTS Test */}
          <div className={styles.quickSection}>
            <span>Tezkor TTS Namunalari:</span>
            <div className={styles.quickChips}>
              {UZBEK_TEXTS.map(t => (
                <button key={t} className={styles.quickChip} onClick={() => speakResponse(t)}>
                  🔊 {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Response + TTS */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <RiVolumeUpLine /> AI Javob va Matni Ovozda O'qish (TTS)
          </div>

          {!ttsSupported && (
            <div className={styles.notSupported}>
              ⚠️ Brauzeringiz TTS funksiyasini qo'llab-quvvatlamaydi.
            </div>
          )}

          {/* AI Response Area */}
          <div className={styles.responseBox}>
            <AnimatePresence mode="wait">
              {aiLoading ? (
                <motion.div key="loading" className={styles.aiLoading} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className={styles.aiOrb} />
                  <p>AI fikrlayapti...</p>
                </motion.div>
              ) : aiResponse ? (
                <motion.div key="response" className={styles.aiResponseContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {aiResponse}
                </motion.div>
              ) : (
                <div className={styles.responsePlaceholder}>
                  🤖 AI javob bu yerda ko'rsatiladi. Nutq yozib, <strong>"AI ga yuborish"</strong> tugmasini bosing.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* TTS Controls */}
          {aiResponse && (
            <div className={styles.ttsControls}>
              <div className={styles.ttsLabel}>
                {isSpeaking ? (
                  <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    🔊 O'qilmoqda...
                  </motion.div>
                ) : (
                  '🔈 Ovoz boshqaruvi'
                )}
              </div>

              <div className={styles.ttsBtns}>
                {!isSpeaking ? (
                  <button className={styles.ttsPlayBtn} onClick={() => speakResponse(aiResponse)}>
                    <RiPlayLine /> O'qish
                  </button>
                ) : (
                  <>
                    {!isPaused ? (
                      <button className={styles.ttsPauseBtn} onClick={pauseSpeaking}>
                        <RiPauseLine /> Pauza
                      </button>
                    ) : (
                      <button className={styles.ttsPlayBtn} onClick={resumeSpeaking}>
                        <RiPlayLine /> Davom
                      </button>
                    )}
                    <button className={styles.ttsStopBtn} onClick={stopSpeaking}>
                      <RiStopLine /> To'xtat
                    </button>
                  </>
                )}
                <button className={styles.ttsCopyBtn} onClick={() => copyText(aiResponse)}>
                  {copied ? <RiCheckLine /> : <RiFileCopyLine />} Nusxalash
                </button>
                <button className={styles.ttsRegenBtn} onClick={() => sendToAI(fullText)}>
                  <RiRefreshLine /> Qayta
                </button>
              </div>

              {isSpeaking && (
                <div className={styles.speakingBar}>
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={styles.bar}
                      style={{ animationDelay: `${i * 0.08}s`, animationPlayState: isPaused ? 'paused' : 'running' }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual TTS Input */}
          <div className={styles.manualTts}>
            <label>Qo'lda matn kiritib o'qitish</label>
            <textarea
              className="input-custom"
              rows={3}
              placeholder="Bu yerga matn yozib, 'O'qish' tugmasini bosing..."
              id="manualTtsInput"
            />
            <button
              className={styles.manualPlayBtn}
              onClick={() => {
                const el = document.getElementById('manualTtsInput');
                if (el?.value) speakResponse(el.value);
              }}
            >
              <RiVolumeUpLine /> Matni O'qish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
