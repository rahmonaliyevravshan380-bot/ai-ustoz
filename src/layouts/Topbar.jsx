import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiSearchLine, RiMoonLine, RiSunLine,
  RiMenuLine, RiSettings4Line, RiLogoutBoxLine, RiUserLine,
  RiFlashlightLine
} from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Topbar.module.scss';

export default function Topbar({ collapsed }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: 'toggle' }));
  };

  return (
    <header className={`${styles.topbar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Left: Hamburger + Search */}
      <div className={styles.left}>
        <button className={styles.mobileMenuBtn} onClick={openMobileSidebar}>
          <RiMenuLine />
        </button>

        <div className={`${styles.searchBox} ${searchOpen ? styles.searchExpanded : ''}`}>
          <RiSearchLine className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className={styles.right}>
        {/* XP Badge */}
        {user && (
          <div className={styles.xpBadge}>
            <RiFlashlightLine /> {user.xp} XP
          </div>
        )}

        {/* Streak */}
        {user && (
          <div className={styles.streakBadge}>
            🔥 {user.streak} {t("days")}
          </div>
        )}

        {/* Credits */}
        {user && (
          <div className={styles.creditsBadge} title={t("credits_title")}>
            ⚡ {user.credits !== undefined ? user.credits : 100}
          </div>
        )}

        {/* Theme toggle */}
        <button className={styles.iconBtn} onClick={toggleTheme} title={t("theme")}>
          {theme === 'dark' ? <RiSunLine /> : <RiMoonLine />}
        </button>

        {/* Profile Dropdown */}
        <div className={styles.dropdown} ref={profileRef}>
          <button
            className={styles.profileBtn}
            onClick={() => setProfileOpen(o => !o)}
          >
            <div className={styles.profileAvatar}>{user?.name?.[0] || 'U'}</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user?.name?.split(' ')[0]}</span>
            </div>
          </button>

          {profileOpen && (
            <div className={styles.dropdownPanel}>
              <div className={styles.profileCard}>
                <div className={styles.profileAvatarLg}>{user?.name?.[0]}</div>
                <div>
                  <div className={styles.profileCardName}>{user?.name}</div>
                  <div className={styles.profileCardEmail}>{user?.email}</div>
                </div>
              </div>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem} onClick={() => { navigate('/dashboard/profile'); setProfileOpen(false); }}>
                <RiUserLine /> {t("profile")}
              </button>
              <button className={styles.dropdownItem} onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false); }}>
                <RiSettings4Line /> {t("settings")}
              </button>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={() => { logout(); navigate('/login'); }}>
                <RiLogoutBoxLine /> {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
