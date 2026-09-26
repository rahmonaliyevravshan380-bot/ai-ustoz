import { useState, useEffect } from 'react';
import { 
  RiSettingsLine, RiMoonLine, RiSunLine, RiPaletteLine, 
  RiRobot2Line, RiBellLine, RiRefreshLine, RiGlobalLine 
} from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Settings.module.scss';

const PRESET_COLORS = [
  { name: 'color_moviy', value: '#2563EB' },
  { name: 'color_binafsha', value: '#7C3AED' },
  { name: 'color_yashil', value: '#10B981' },
  { name: 'color_olovrang', value: '#F59E0B' },
  { name: 'color_havorang', value: '#06B6D4' },
  { name: 'color_qizil', value: '#EF4444' },
];

export default function SettingsPage() {
  const { addToast } = useNotification();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  
  // AI Settings State
  const [defaultModel, setDefaultModel] = useState(() => 
    localStorage.getItem('ai-ustoz-default-model') || 'openai/gpt-4o-mini'
  );
  
  // Notification states
  const [alerts, setAlerts] = useState({
    lesson: true,
    homework: true,
    meeting: false,
    ai: true
  });

  // Load alert settings
  useEffect(() => {
    const saved = localStorage.getItem('ai-ustoz-alert-settings');
    if (saved) setAlerts(JSON.parse(saved));
  }, []);

  const handleSaveModel = (e) => {
    const model = e.target.value;
    setDefaultModel(model);
    localStorage.setItem('ai-ustoz-default-model', model);
    addToast({ type: 'success', title: t('saved_toast'), message: `${t('default_model')} '${model}' ${t('model_changed_toast')}.` });
  };

  const handleToggleAlert = (key) => {
    const updated = { ...alerts, [key]: !alerts[key] };
    setAlerts(updated);
    localStorage.setItem('ai-ustoz-alert-settings', JSON.stringify(updated));
  };

  const handleResetData = () => {
    if (window.confirm(t("confirm_reset"))) {
      localStorage.clear();
      addToast({ type: 'info', title: t('cleared_toast'), message: t('data_deleted_toast') });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiSettingsLine /> {t("settings_title")}</h1>
          <p className={styles.pageSubtitle}>{t("settings_subtitle")}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
        
        {/* 1. Theme and Color Scheme */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}><RiPaletteLine /> {t("interface_design")}</h3>
          
          {/* Dark Mode toggle */}
          <div className={styles.settingsRow}>
            <div>
              <span className={styles.rowLabel}>{t("dark_mode")}</span>
              <p className={styles.rowDesc}>{t("dark_mode_desc")}</p>
            </div>
            <button className={styles.toggleBtn} onClick={toggleTheme}>
              {theme === 'dark' ? <RiSunLine style={{ color: '#F59E0B' }} /> : <RiMoonLine />}
              {theme === 'dark' ? t("day_mode") : t("night_mode")}
            </button>
          </div>

          {/* Accent Color picker */}
          <div className={styles.settingsRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <div>
              <span className={styles.rowLabel}>{t("accent_color")}</span>
              <p className={styles.rowDesc}>{t("accent_color_desc")}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setAccentColor(c.value)}
                  style={{
                    backgroundColor: c.value,
                    color: 'white',
                    border: accentColor === c.value ? '3.5px solid var(--text)' : '1px solid transparent',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title={t(c.name)}
                >
                  {accentColor === c.value ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. AI Settings */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}><RiRobot2Line /> {t("ai_settings")}</h3>
          
          <div className={styles.settingsRow}>
            <div>
              <span className={styles.rowLabel}>{t("default_model")}</span>
              <p className={styles.rowDesc}>{t("default_model_desc")}</p>
            </div>
            <select className="input-custom" style={{ width: '220px' }} value={defaultModel} onChange={handleSaveModel}>
              <option value="openai/gpt-4o-mini">GPT-4o Mini (Tezkor)</option>
              <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
              <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
            </select>
          </div>
        </div>

        {/* 3. Notification Settings */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}><RiBellLine /> {t("notifications_settings")}</h3>
          
          {[
            { key: 'lesson', label: t('notif_lesson'), desc: t('notif_lesson_desc') },
            { key: 'homework', label: t('notif_homework'), desc: t('notif_homework_desc') },
            { key: 'meeting', label: t('notif_meeting'), desc: t('notif_meeting_desc') },
            { key: 'ai', label: t('notif_ai'), desc: t('notif_ai_desc') },
          ].map(item => (
            <div key={item.key} className={styles.settingsRow}>
              <div>
                <span className={styles.rowLabel}>{item.label}</span>
                <p className={styles.rowDesc}>{item.desc}</p>
              </div>
              <input 
                type="checkbox" 
                checked={alerts[item.key]} 
                onChange={() => handleToggleAlert(item.key)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>

        {/* 4. Language Settings */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}><RiGlobalLine /> {t("language_settings")}</h3>
          <div className={styles.settingsRow}>
            <div>
              <span className={styles.rowLabel}>{t("system_language")}</span>
              <p className={styles.rowDesc}>{t("system_language_desc")}</p>
            </div>
            <select className="input-custom" style={{ width: '150px' }} value={language} onChange={e => changeLanguage(e.target.value)}>
              <option value="uz">{t("feature_lang")}</option>
              <option value="ru">Русский язык</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* 5. System Actions */}
        <div className={styles.settingsSection} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <h3 className={styles.sectionTitle} style={{ color: '#EF4444' }}><RiRefreshLine /> {t("system_actions")}</h3>
          <div className={styles.settingsRow}>
            <div>
              <span className={styles.rowLabel} style={{ color: '#EF4444' }}>{t("clear_data")}</span>
              <p className={styles.rowDesc}>{t("clear_data_desc")}</p>
            </div>
            <button 
              className={styles.secondaryBtn} 
              style={{ borderColor: '#EF4444', color: '#EF4444' }}
              onClick={handleResetData}
            >
              {t("clear_data_btn")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
