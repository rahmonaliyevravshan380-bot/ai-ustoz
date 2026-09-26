import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import FloatingAI from './FloatingAI';
import ErrorBoundary from '../components/ErrorBoundary';
import styles from './DashboardLayout.module.scss';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`${styles.main} ${collapsed ? styles.collapsed : ''}`}>
        <Topbar collapsed={collapsed} />
        <main className={styles.content}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <FloatingAI />
    </div>
  );
}
