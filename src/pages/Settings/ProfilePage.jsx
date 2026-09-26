import { useState } from 'react';
import { 
  RiUserLine, RiAwardLine, RiFlashlightLine, 
  RiEditLine, RiBuildingLine, RiMailLine, RiBookOpenLine 
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Settings.module.scss';

export default function ProfilePage() {
  const { addToast } = useNotification();
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    school: user?.school || '',
    experience: user?.experience || '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast({ type: 'error', title: t('error'), message: t('validation_error_name_email') });
      return;
    }

    updateProfile(formData);
    setIsEditing(false);
    addToast({ type: 'success', title: t('saved_toast'), message: t('profile_saved') });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiUserLine /> {t("profile_title")}</h1>
          <p className={styles.pageSubtitle}>{t("profile_subtitle")}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left side card - Stats & Avatar */}
        <div className={styles.settingsSection} style={{ alignItems: 'center', textAlign: 'center', padding: '30px' }}>
          <div 
            style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary), #7C3AED)', 
              color: 'white', 
              fontSize: '32px', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
              marginBottom: '16px'
            }}
          >
            {getInitials(user?.name)}
          </div>
          
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px' }}>{user?.name}</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lvl {user?.level || 12} · Tajribali Ustoz</span>

          {/* Experience level */}
          <div style={{ width: '100%', margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>{t("xp_progress")}</span>
              <span>{user?.xp} / 3000 XP</span>
            </div>
            <div style={{ height: '8px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #10B981)', width: `${((user?.xp || 2450) / 3000) * 100}%` }} />
            </div>
          </div>

          {/* Streak indicator */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(245, 158, 11, 0.1)', color: '#D97706', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', width: '100%', justifyContent: 'center', fontWeight: '600' }}>
            <RiFlashlightLine style={{ fontSize: '18px' }} />
            {user?.streak || 7} {t("streak_active")}
          </div>
        </div>

        {/* Right side details / edit form */}
        <div className={styles.settingsSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h3 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
              <RiUserLine /> {t("personal_info")}
            </h3>
            {!isEditing && (
              <button className={styles.secondaryBtn} onClick={() => setIsEditing(true)}>
                <RiEditLine /> {t("edit_profile")}
              </button>
            )}
          </div>

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <RiMailLine style={{ color: 'var(--text-muted)', fontSize: '18px' }} />
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t("email_address")}:</span>
                  <strong>{user?.email}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <RiBuildingLine style={{ color: 'var(--text-muted)', fontSize: '18px' }} />
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t("school_uni")}:</span>
                  <strong>{user?.school || '1-sonli maktab, Toshkent'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <RiBookOpenLine style={{ color: 'var(--text-muted)', fontSize: '18px' }} />
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t("teaching_subjects")}:</span>
                  <strong>{user?.subjects?.join(', ') || 'Matematika, Fizika'}</strong>
                </div>
              </div>

              {/* Badges list */}
              <div style={{ marginTop: '10px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', marginBottom: '8px' }}>{t("awards_badges")}:</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {user?.badges?.map((badge, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        background: 'rgba(37,99,235,0.08)', 
                        color: 'var(--primary)', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RiAwardLine /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className={styles.modalForm} style={{ width: '100%', padding: 0 }}>
              <div>
                <label className="form-label">{t("full_name")}</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">{t("email_address")}</label>
                <input 
                  type="email" 
                  className="input-custom" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">{t("school_uni")}</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  value={formData.school}
                  onChange={e => setFormData({ ...formData, school: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">{t("experience_years")}</label>
                <input 
                  type="text" 
                  className="input-custom" 
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Masalan: 8 yil"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsEditing(false)}>{t("cancel_btn")}</button>
                <button type="submit" className={styles.primaryBtn}>{t("save_btn")}</button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
