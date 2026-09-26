import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as RiIcons from 'react-icons/ri';
import { RiBrainLine, RiMenuFoldLine, RiMenuUnfoldLine, RiLogoutBoxLine, RiFlashlightLine, RiCloseLine } from 'react-icons/ri';
import { NAV_ITEMS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Sidebar.module.scss';

function getIcon(iconName) {
  const Icon = RiIcons[iconName];
  return Icon ? <Icon /> : <RiFlashlightLine />;
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => e.detail === 'toggle' && setMobileOpen(o => !o);
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const handleItemClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}><RiBrainLine /></div>
            {(!collapsed || mobileOpen) && <span className={styles.brandName}>AI <strong>Ustoz</strong></span>}
          </div>
          
          {/* Collapse button for desktop */}
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? t("expand") : t("collapse")}
          >
            {collapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>

          {/* Close button for mobile */}
          {mobileOpen && (
            <button
              className={styles.mobileCloseBtn}
              onClick={() => setMobileOpen(false)}
              title="Yopish"
            >
              <RiCloseLine />
            </button>
          )}
        </div>

        {/* User mini card */}
        {(!collapsed || mobileOpen) && user && (
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{user.name[0]}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>
                <RiFlashlightLine /> Lvl {user.level} · {user.xp} XP
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(group => {
            const groupKey = 'nav_group_' + group.group.toLowerCase().replace(/\s+/g, '_');
            return (
              <div key={group.group} className={styles.navGroup}>
                {(!collapsed || mobileOpen) && <span className={styles.groupLabel}>{t(groupKey)}</span>}
                {group.items.map(item => {
                  const itemKey = item.id.replace(/-/g, '_');
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={handleItemClick}
                      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                      title={collapsed && !mobileOpen ? t(itemKey) : ''}
                    >
                      <span className={styles.navIcon}>{getIcon(item.icon)}</span>
                      {(!collapsed || mobileOpen) && (
                        <>
                          <span className={styles.navLabel}>{t(itemKey)}</span>
                          {item.badge && (
                            <span className={styles.navBadge}>{item.badge}</span>
                          )}
                        </>
                      )}
                      {collapsed && !mobileOpen && item.badge && (
                        <span className={styles.collapsedDot} />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <RiLogoutBoxLine />
            {(!collapsed || mobileOpen) && <span>{t("logout")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
