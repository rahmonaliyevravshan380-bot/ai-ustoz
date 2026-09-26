import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { RiBrainLine, RiEyeLine, RiEyeOffLine, RiGoogleLine, RiMicrosoftLine, RiArrowLeftLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import styles from './Auth.module.scss';

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: authRegister, loading } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  // Initialize React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleRegister = async (data) => {
    console.log("[REGISTER] Form submitted");
    console.log("[REGISTER] Validation passed");
    console.log("[REGISTER] Form data:", data);

    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    const payload = {
      ...data,
      name: fullName,
    };

    try {
      console.log("[REGISTER] Sending POST request...");
      const response = await authRegister(payload);
      console.log("[REGISTER] Response:", response);
      console.log("[REGISTER] Registration successful");

      addToast({ type: 'success', title: 'Xush kelibsiz!', message: "Hisob muvaffaqiyatli yaratildi" });
      navigate('/dashboard');
    } catch (error) {
      console.error("[REGISTER] REAL ERROR:", error);
      addToast({
        type: 'error',
        title: 'Xato',
        message: error.message || error.toString() || "Ro'yxatdan o'tishda xato"
      });
    }
  };

  const onInvalid = (validationErrors) => {
    console.log("[REGISTER] Validation started");
    console.error("[REGISTER] Validation errors:", validationErrors);
  };

  const handleButtonClick = () => {
    console.log("[REGISTER] Button clicked");
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
          <h2>Birgalikda <span>o'sib</span><br />boraylik!</h2>
          <p>O'zbekistondagi 10,000+ o'qituvchilarga qo'shiling va AI imkoniyatlaridan foydalaning</p>
          <div className={styles.authFeatures}>
            {["✅ Bepul boshlash", "🚀 5 daqiqada sozlash", "🎓 1-11 sinf materiallari", "🔒 Xavfsiz va ishonchli"].map(f => (
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
            <h1>Ro'yxatdan o'tish</h1>
            <p>Bepul hisob yarating</p>
          </div>

          <div className={styles.socialBtns}>
            <button className={styles.socialBtn}><RiGoogleLine /> Google</button>
            <button className={styles.socialBtn}><RiMicrosoftLine /> Microsoft</button>
          </div>

          <div className={styles.divider}><span>yoki email bilan</span></div>

          <form onSubmit={handleSubmit(handleRegister, onInvalid)} className={styles.authForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Ism</label>
                <input
                  type="text"
                  placeholder="Jasur"
                  className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                  {...register('firstName', { required: 'Ism majburiy' })}
                />
                {errors.firstName && <span className={styles.errorMsg}>{errors.firstName.message}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Familiya</label>
                <input
                  type="text"
                  placeholder="Abdullayev"
                  className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                  {...register('lastName', { required: 'Familiya majburiy' })}
                />
                {errors.lastName && <span className={styles.errorMsg}>{errors.lastName.message}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Email manzil</label>
              <input
                type="email"
                placeholder="jasur@ustoz.uz"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                {...register('email', { required: 'Email majburiy', pattern: { value: /^\S+@\S+\.\S+$/, message: "To'g'ri email" } })}
              />
              {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Maktab / Tashkilot</label>
              <input
                type="text"
                placeholder="1-sonli maktab, Toshkent"
                className={styles.input}
                {...register('school')}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Parol</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Kamida 6 ta belgi"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  {...register('password', { required: 'Parol majburiy', minLength: { value: 6, message: "Kamida 6 ta belgi" } })}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s => !s)}>
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" {...register('terms', { required: true })} />
              <span>
                <Link to="/terms">Foydalanish shartlari</Link> va{' '}
                <Link to="/privacy">maxfiylik siyosati</Link>ga roziman
              </span>
            </label>
            {errors.terms && <span className={styles.errorMsg}>Shartlarga rozilik kerak</span>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              onClick={handleButtonClick}
            >
              {loading ? <span className={styles.spinner} /> : "Hisob yaratish"}
            </button>
          </form>

          <p className={styles.authSwitch}>
            Hisobingiz bormi? <Link to="/login">Kirish</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
