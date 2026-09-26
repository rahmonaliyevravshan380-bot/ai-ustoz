import { motion } from 'framer-motion';
import { RiMagicLine, RiDownloadCloud2Line, RiFileCopyLine } from 'react-icons/ri';
import styles from './AIToolLayout.module.scss';
import { useNotification } from '../../context/NotificationContext';

export default function AIToolLayout({
  title,
  description,
  icon,
  iconColor = '#2563EB',
  children,
  result,
  loading,
  onGenerate,
  onCopy,
  onDownload,
  formContent
}) {
  const { addToast } = useNotification();

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else if (result) {
      navigator.clipboard.writeText(result);
      addToast({ type: 'success', title: 'Nusxa olindi', message: 'Natija vaqtinchalik xotiraga nusxalandi' });
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.titleArea}>
          <div className={styles.iconBox} style={{ color: iconColor, background: `${iconColor}18` }}>
            {icon}
          </div>
          <div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.desc}>{description}</p>
          </div>
        </div>
      </motion.div>

      <div className={styles.grid}>
        {/* Left Panel: Form */}
        <motion.div
          className={styles.leftPanel}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Sozlamalar</h3>
            </div>
            <div className={styles.cardBody}>
              {formContent}
              <button
                className={styles.generateBtn}
                onClick={onGenerate}
                disabled={loading}
                style={{ '--btn-color': iconColor }}
              >
                {loading ? <span className={styles.spinner} /> : <RiMagicLine />}
                {loading ? 'Yaratilmoqda...' : 'Yaratish'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Panel: Result */}
        <motion.div
          className={styles.rightPanel}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Natija</h3>
              {result && !loading && (
                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={handleCopy} title="Nusxa olish">
                    <RiFileCopyLine />
                  </button>
                  <button className={styles.actionBtn} onClick={onDownload} title="Yuklab olish">
                    <RiDownloadCloud2Line />
                  </button>
                </div>
              )}
            </div>
            <div className={`${styles.cardBody} ${styles.resultBody}`}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.aiOrb} style={{ '--orb-color': iconColor }} />
                  <p>Sun'iy intellekt ishlamoqda...</p>
                  <div className={styles.loadingSteps}>
                    <div className={styles.step}>Ma'lumotlar tahlil qilinmoqda</div>
                    <div className={styles.step}>Tuzilma yaratilmoqda</div>
                    <div className={styles.step}>Natija shakllantirilmoqda</div>
                  </div>
                </div>
              ) : result ? (
                <div className={styles.resultContent}>
                  {children || <pre className={styles.preFormatted}>{result}</pre>}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon} style={{ color: iconColor }}>{icon}</div>
                  <p>Chap tomondagi sozlamalarni kiriting va <strong>Yaratish</strong> tugmasini bosing</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
