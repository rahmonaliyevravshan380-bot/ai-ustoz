import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { RiBrainLine, RiEyeLine, RiEyeOffLine, RiGoogleLine, RiMicrosoftLine, RiArrowLeftLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import styles from './Auth.module.scss';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    console.log('[LoginPage Step 1] Form submitted for:', data.email);
    try {
      console.log('[LoginPage Step 2] Calling login auth handler...');
      await login(data.email, data.password);
      console.log('[LoginPage Step 3] Login successful! Navigating to dashboard.');
      addToast({ type: 'success', title: 'Xush kelibsiz!', message: 'Muvaffaqiyatli kirdingiz' });
      navigate('/dashboard');
    } catch (err) {
      console.error('[LoginPage Exception] Login failed:', err);
      addToast({ type: 'error', title: 'Xato', message: err.message || "Email yoki parol noto'g'ri" });
    }
  };

  const handleDemo = async () => {
    await login('demo@ustoz.uz', 'demo123');
    addToast({ type: 'success', title: 'Demo rejim', message: 'Demo hisobga kirdingiz' });
    navigate('/dashboard');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
        </div>
        <div className={styles.authLeftContent}>
          <div className={styles.authBrand}>
            <div className={styles.brandIcon}><RiBrainLine /></div>
            <span>AI <strong>Ustoz</strong></span>
          </div>
          <h2>O'qituvchilik<br />kelajagi — <span>AI bilan</span></h2>
          <p>Dars rejasi, testlar, hisobotlar va boshqa 30+ vosita bitta platformada</p>
          <div className={styles.authFeatures}>
            {["⚡ Sekundlar ichida dars rejasi", "🎯 Test va imtihonlar", "📊 O'quvchi tahlili", "🌐 O'zbek tilida"].map(f => (
              <div key={f} className={styles.authFeatureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <Link to="/" className={styles.backLink}><RiArrowLeftLine /> Bosh sahifa</Link>

        <motion.div
          className={styles.authCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.authCardHeader}>
            <h1>Kirish</h1>
            <p>Hisobingizga kiring</p>
          </div>

          <div className={styles.socialBtns}>
            <button className={styles.socialBtn} onClick={handleDemo}>
              <RiGoogleLine /> Google
            </button>
            <button className={styles.socialBtn} onClick={handleDemo}>
              <RiMicrosoftLine /> Microsoft
            </button>
          </div>

          <div className={styles.divider}><span>yoki email bilan</span></div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label>Email manzil</label>
              <input
                type="email"
                placeholder="jasur@ustoz.uz"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                {...register('email', { required: 'Email majburiy', pattern: { value: /^\S+@\S+\.\S+$/, message: "To'g'ri email kiriting" } })}
              />
              {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label>Parol</label>
                <Link to="/forgot-password" className={styles.forgotLink}>Parolni unutdingizmi?</Link>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  {...register('password', { required: 'Parol majburiy', minLength: { value: 6, message: "Kamida 6 ta belgi" } })}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s => !s)}>
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
            </div>

            <div className={styles.rememberRow}>
              <label className={styles.checkbox}>
                <input type="checkbox" />
                <span>Meni eslab qol</span>
              </label>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Kirish'}
            </button>

            <button type="button" className={styles.demoBtn} onClick={handleDemo}>
              Demo bilan kirish
            </button>
          </form>

          <p className={styles.authSwitch}>
            Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
