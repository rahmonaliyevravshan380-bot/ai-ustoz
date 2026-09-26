import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiBrainLine, RiArrowLeftLine, RiMailLine } from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import styles from './Auth.module.scss';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authBg}>
          <div className={styles.orb1} /><div className={styles.orb2} />
        </div>
        <div className={styles.authLeftContent}>
          <div className={styles.authBrand}>
            <div className={styles.brandIcon}><RiBrainLine /></div>
            <span>AI <strong>Ustoz</strong></span>
          </div>
          <h2>Parolni <span>tiklash</span></h2>
          <p>Email manzilingizga tiklash havolasi yuboramiz. 2 daqiqadan so'ng inbox ni tekshiring.</p>
        </div>
      </div>

      <div className={styles.authRight}>
        <Link to="/login" className={styles.backLink}><RiArrowLeftLine /> Kirish sahifasiga qaytish</Link>

        <motion.div className={styles.authCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {!sent ? (
            <>
              <div className={styles.authCardHeader}>
                <div className={styles.iconCircle}><RiMailLine /></div>
                <h1>Parolni unutdingizmi?</h1>
                <p>Email manzilingizni kiriting, tiklash havolasini yuboramiz</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
                <div className={styles.formGroup}>
                  <label>Email manzil</label>
                  <input
                    type="email"
                    placeholder="jasur@ustoz.uz"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    {...register('email', { required: 'Email majburiy' })}
                  />
                  {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
                </div>
                <button type="submit" className={styles.submitBtn}>Havola yuborish</button>
              </form>
            </>
          ) : (
            <div className={styles.successState}>
              <div className={styles.successIcon}>✉️</div>
              <h2>Email yuborildi!</h2>
              <p><strong>{getValues('email')}</strong> manziliga tiklash havolasi yuborildi. Inbox va spam papkangizni tekshiring.</p>
              <Link to="/login" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Kirish sahifasiga qaytish
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
