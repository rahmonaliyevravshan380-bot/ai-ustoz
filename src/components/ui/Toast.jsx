import { useNotification } from '../../context/NotificationContext';
import { RiCheckLine, RiErrorWarningLine, RiInformationLine, RiAlertLine, RiCloseLine } from 'react-icons/ri';
import styles from './Toast.module.scss';

const ICONS = {
  success: <RiCheckLine />,
  error: <RiErrorWarningLine />,
  warning: <RiAlertLine />,
  info: <RiInformationLine />,
};

const COLORS = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#2563EB',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.icon} style={{ color: COLORS[toast.type] }}>
            {ICONS[toast.type]}
          </div>
          <div className={styles.content}>
            {toast.title && <p className={styles.title}>{toast.title}</p>}
            {toast.message && <p className={styles.message}>{toast.message}</p>}
          </div>
          <button className={styles.close} onClick={() => removeToast(toast.id)}>
            <RiCloseLine />
          </button>
        </div>
      ))}
    </div>
  );
}
