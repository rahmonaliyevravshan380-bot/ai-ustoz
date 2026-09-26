import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiRobot2Line, RiFileList3Line, RiQuestionLine, RiSlideshowLine,
  RiCodeSSlashLine, RiTranslate2, RiStarFill, RiArrowRightLine,
  RiPlayCircleLine, RiCheckLine, RiMenuLine, RiCloseLine,
  RiMoonLine, RiSunLine, RiBrainLine, RiFlashlightLine,
  RiShieldCheckLine, RiGlobalLine, RiBookOpenLine, RiAwardLine,
  RiGroupLine, RiBarChartLine, RiFilePdf2Line, RiMicLine
} from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import styles from './LandingPage.module.scss';

// ─── Sub-components ────────────────────────────────────────────

function Navbar({ theme, toggleTheme, menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}><RiBrainLine /></div>
          <span>AI <strong>Ustoz</strong></span>
        </Link>

        <div className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
          {['Xususiyatlar', 'Narxlar', 'Testimoniallar', 'FAQ'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className={styles.navLink}
              onClick={() => setMenuOpen(false)}>
              {link}
            </a>
          ))}
        </div>

        <div className={styles.navActions}>
          <button className={styles.themeBtn} onClick={toggleTheme}>
            {theme === 'dark' ? <RiSunLine /> : <RiMoonLine />}
          </button>
          <Link to="/login" className={styles.loginBtn}>Kirish</Link>
          <Link to="/register" className={styles.registerBtn}>
            Boshlash <RiArrowRightLine />
          </Link>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <RiCloseLine /> : <RiMenuLine />}
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const words = ["Dars rejasi", "Test savollar", "Prezentatsiya", "Kod yozish", "Tarjima", "Tahlil"];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroOrbs}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className="container">
        <motion.div
          className={styles.heroBadge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RiFlashlightLine /> O'zbekistondagi birinchi AI o'qituvchi platformasi
        </motion.div>

        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          AI Ustoz —<br />
          Har bir o'qituvchining<br />
          <span className={styles.gradientText}>shaxsiy sun'iy intellekt</span><br />
          yordamchisi
        </motion.h1>

        <motion.div
          className={styles.heroSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={styles.rotatingWord}
            >
              {words[wordIdx]}
            </motion.span>
          </AnimatePresence>
          {' '}sekundlar ichida yarating. O'qituvchilarga vaqt tejang.
        </motion.div>

        <motion.div
          className={styles.heroActions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/register" className={styles.ctaPrimary}>
            Bepul boshlash <RiArrowRightLine />
          </Link>
          <Link to="/dashboard" className={styles.ctaSecondary}>
            <RiPlayCircleLine /> Demo ko'rish
          </Link>
        </motion.div>

        <motion.div
          className={styles.heroStats}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { value: '10,000+', label: "O'qituvchilar" },
            { value: '500K+', label: 'Yaratilgan materiallar' },
            { value: '98%', label: 'Mamnunlik darajasi' },
            { value: '3 sec', label: "O'rtacha yaratish vaqti" },
          ].map(stat => (
            <div key={stat.label} className={styles.stat}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          className={styles.heroPreview}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className={styles.previewBar}>
            <span /><span /><span />
          </div>
          <div className={styles.previewContent}>
            <div className={styles.previewSidebar}>
              {['🏠 Dashboard', '🤖 AI Chat', '📋 Dars Rejasi', '❓ Test Generator', '📊 Tahlil'].map((item, i) => (
                <div key={i} className={`${styles.previewNavItem} ${i === 0 ? styles.active : ''}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className={styles.previewMain}>
              <div className={styles.previewHeader}>
                <div className={styles.previewTitle}>Salom, Jasur! 👋</div>
                <div className={styles.previewDate}>Dushanba, 4 Avgust 2026</div>
              </div>
              <div className={styles.previewCards}>
                {[
                  { label: "Bugungi darslar", value: "4", color: '#2563EB' },
                  { label: "O'quvchilar", value: "112", color: '#7C3AED' },
                  { label: "Bajarilgan AI", value: "23", color: '#22C55E' },
                  { label: "O'rtacha baho", value: "4.3", color: '#F59E0B' },
                ].map(card => (
                  <div key={card.label} className={styles.previewCard} style={{ borderTop: `3px solid ${card.color}` }}>
                    <div className={styles.previewCardValue} style={{ color: card.color }}>{card.value}</div>
                    <div className={styles.previewCardLabel}>{card.label}</div>
                  </div>
                ))}
              </div>
              <div className={styles.previewChat}>
                <div className={styles.chatBubble + ' ' + styles.ai}>
                  <span>🤖</span> 10-sinf uchun algebra dars rejasi tayyor!
                </div>
                <div className={styles.chatBubble + ' ' + styles.user}>
                  Rahmat! Test ham yarating
                </div>
                <div className={styles.chatBubble + ' ' + styles.ai}>
                  <span>🤖</span> 15 ta savol bilan test yaratildi ✅
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: <RiRobot2Line />, title: 'AI Chat', desc: "O'zbek, ingliz va rus tillarida ChatGPT kabi suhbat. Savollar, tushuntirishlar, g'oyalar.", color: '#2563EB', gradient: 'linear-gradient(135deg, #2563EB22, #2563EB11)' },
    { icon: <RiFileList3Line />, title: 'Dars Rejasi', desc: "O'zbekiston maktab dasturiga mos dars rejasi sekundlar ichida. Bloom taksonomiyasi bilan.", color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED22, #7C3AED11)' },
    { icon: <RiQuestionLine />, title: 'Test Generator', desc: "MCQ, to'g'ri-noto'g'ri, juftlash, insho va dasturlash testlari. PDF eksport bilan.", color: '#22C55E', gradient: 'linear-gradient(135deg, #22C55E22, #22C55E11)' },
    { icon: <RiSlideshowLine />, title: 'Prezentatsiya', desc: 'Mavzu bo\'yicha to\'liq prezentatsiya slaydlari. Temalar, notlar va rasmlar bilan.', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B22, #F59E0B11)' },
    { icon: <RiCodeSSlashLine />, title: 'Kod Generator', desc: "HTML, CSS, JavaScript, Python, React va boshqa 10+ til bo'yicha kod yozing.", color: '#EF4444', gradient: 'linear-gradient(135deg, #EF444422, #EF444411)' },
    { icon: <RiGroupLine />, title: 'O\'quvchi Boshqaruvi', desc: "Sinflar, davomat, baholar va hisobotlar. Excel va PDF eksport imkoniyati.", color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D422, #06B6D411)' },
    { icon: <RiBarChartLine />, title: 'Tahlil', desc: "O'quvchilar o'sishi, zaif mavzular, davomat statistikasi — barchasi grafiklarda.", color: '#F97316', gradient: 'linear-gradient(135deg, #F9731622, #F9731611)' },
    { icon: <RiTranslate2 />, title: 'Tarjimon', desc: "O'zbek, ingliz va rus tillarida tarjima. Lotin va kiril yozuvlarini qo'llab-quvvatlaydi.", color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF622, #8B5CF611)' },
    { icon: <RiFilePdf2Line />, title: 'PDF AI', desc: "PDF fayllarni yuklang. Xulosa, tarjima, savol va eslatmalar avtomatik yaratiladi.", color: '#DC2626', gradient: 'linear-gradient(135deg, #DC262622, #DC262611)' },
    { icon: <RiMicLine />, title: 'AI Ovoz', desc: "Matnni ovozga o'qing, ovozni matnga aylantiring. O'zbek tilini qo'llab-quvvatlaydi.", color: '#059669', gradient: 'linear-gradient(135deg, #05966922, #05966911)' },
    { icon: <RiAwardLine />, title: 'Baholash Rubrikasi', desc: "Loyiha va vazifalar uchun baholash mezonlarini avtomatik yarating.", color: '#D97706', gradient: 'linear-gradient(135deg, #D9770622, #D9770611)' },
    { icon: <RiBookOpenLine />, title: 'Prompt Kutubxonasi', desc: "100+ tayyor AI promptlar. Matematika, fizika, IT, adabiyot va boshqa fanlar uchun.", color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED22, #7C3AED11)' },
  ];

  return (
    <section className={styles.features} id="xususiyatlar">
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.sectionBadge}>✨ Imkoniyatlar</div>
          <h2 className={styles.sectionTitle}>Har bir o'qituvchiga kerakli<br /><span className={styles.gradientText}>barcha vositalar</span></h2>
          <p className={styles.sectionDesc}>30+ AI vositasi bitta platformada. ChatGPT + Google Classroom + Canva kombinatsiyasi.</p>
        </motion.div>

        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={styles.featureCard}
              style={{ '--card-gradient': feature.gradient }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
            >
              <div className={styles.featureIcon} style={{ color: feature.color, background: `${feature.color}18` }}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Bepul",
      price: "0",
      period: "/oy",
      features: ["10 ta AI so'rov/oy", "Dars rejasi (3 ta)", "Test generator (5 ta)", "Asosiy dashboard", "1 sinf"],
      cta: "Boshlash",
      popular: false,
    },
    {
      name: "Pro",
      price: "99,000",
      period: "so'm/oy",
      features: ["Cheksiz AI so'rovlar", "Barcha AI vositalar", "PDF/Word eksport", "5 ta sinf", "Tahlil va hisobotlar", "Ustunlik qo'llab-quvvatlash"],
      cta: "Pro ga o'tish",
      popular: true,
    },
    {
      name: "Maktab",
      price: "599,000",
      period: "so'm/oy",
      features: ["Barcha Pro imkoniyatlar", "Cheksiz o'qituvchilar", "Admin panel", "API integratsiya", "O'qitish va onboarding", "24/7 qo'llab-quvvatlash"],
      cta: "Bog'lanish",
      popular: false,
    },
  ];

  return (
    <section className={styles.pricing} id="narxlar">
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.sectionBadge}>💰 Narxlar</div>
          <h2 className={styles.sectionTitle}>Maqbul narxlar</h2>
          <p className={styles.sectionDesc}>Har qanday o'qituvchi va maktab uchun mos tarif rejasi</p>
        </motion.div>

        <div className={styles.pricingGrid}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {plan.popular && <div className={styles.popularBadge}>⭐ Eng mashhur</div>}
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.planPrice}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              <ul className={styles.planFeatures}>
                {plan.features.map(f => (
                  <li key={f}><RiCheckLine className={styles.checkIcon} />{f}</li>
                ))}
              </ul>
              <Link to="/register" className={`${styles.planCta} ${plan.popular ? styles.primaryCta : styles.outlineCta}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: "Shahnoza Yusupova", role: "Matematika o'qituvchisi, Toshkent", text: "AI Ustoz mening ishimni butunlay o'zgartirdi! Dars rejasini 30 daqiqa o'rniga 10 sekundda yarataman. Bu ajoyib!", rating: 5 },
    { name: "Bobur Rahimov", role: "Fizika o'qituvchisi, Samarqand", text: "Test generator juda foydali. 20 ta savol yaratish uchun atigi 5 sekund kerak. O'quvchilarim ham xursand.", rating: 5 },
    { name: "Dilnoza Karimova", role: "Informatika o'qituvchisi, Namangan", text: "Kod generator bizning IT darslarimizni yangi darajaga ko'tardi. React va Python misollari juda sifatli.", rating: 5 },
    { name: "Jasur Umarov", role: "Ingliz tili o'qituvchisi, Farg'ona", text: "Tarjimon va AI Chat ingliz tili darslarida juda kerak bo'ldi. O'zbek tilidagi AI nihomasiga topildi!", rating: 5 },
    { name: "Malika Hasanova", role: "Kimyo o'qituvchisi, Andijon", text: "Baholash rubrikasi va hisobotlar mening vaqtimni uchdan biriga qisqartirdi. Tavsiya qilaman!", rating: 5 },
    { name: "Timur Toshmatov", role: "Tarix o'qituvchisi, Buxoro", text: "Prezentatsiya generator ajoyib slaydlar yaratadi. Endi Canva va PowerPoint kerak emas!", rating: 5 },
  ];

  return (
    <section className={styles.testimonials} id="testimoniallar">
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.sectionBadge}>❤️ Fikr-mulohazalar</div>
          <h2 className={styles.sectionTitle}>O'qituvchilar <span className={styles.gradientText}>sevadi</span></h2>
        </motion.div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className={styles.testimonialCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className={styles.testimonialRating}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <RiStarFill key={i} style={{ color: '#F59E0B' }} />
                ))}
              </div>
              <p className={styles.testimonialText}>"{t.text}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>{t.name[0]}</div>
                <div>
                  <div className={styles.testimonialName}>{t.name}</div>
                  <div className={styles.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(null);

  const faqs = [
    { q: "AI Ustoz qanday ishlaydi?", a: "AI Ustoz sun'iy intellekt texnologiyalaridan foydalanib, o'qituvchilarga dars rejalari, testlar, prezentatsiyalar va boshqa materiallarni avtomatik yaratishga yordam beradi. Siz mavzu va sinfni kiriting, AI qolganini qiladi." },
    { q: "Qaysi tillarni qo'llab-quvvatlaydi?", a: "AI Ustoz O'zbek (lotin va kiril), ingliz va rus tillarini to'liq qo'llab-quvvatlaydi. Barcha materiallar istalgan tilda yaratilishi mumkin." },
    { q: "O'zbekiston maktab dasturiga mos keladimi?", a: "Ha! AI Ustoz O'zbekiston davlat ta'lim standartlari va o'quv dasturlariga mos materiallar yaratadi. 1-11 sinflar uchun barcha fanlar bo'yicha." },
    { q: "Bepul versiyada nima bor?", a: "Bepul versiyada oyiga 10 ta AI so'rov, 3 ta dars rejasi, 5 ta test va asosiy dashboard imkoniyatlari mavjud. Bu boshlanish uchun yetarli." },
    { q: "Ma'lumotlarim xavfsizmi?", a: "Ha, barcha ma'lumotlaringiz shifrlangan holda saqlanadi. Biz hech qachon ma'lumotlaringizni uchinchi taraflarga bermаymiz." },
    { q: "Mobil qurilmalarda ishlaydi?", a: "Ha! AI Ustoz to'liq mobil moslashtirilgan. Telefon, planshet va kompyuterda bir xil mukammal ishlaydi." },
  ];

  return (
    <section className={styles.faq} id="faq">
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.sectionBadge}>❓ FAQ</div>
          <h2 className={styles.sectionTitle}>Ko'p so'raladigan <span className={styles.gradientText}>savollar</span></h2>
        </motion.div>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className={`${styles.faqItem} ${open === i ? styles.faqOpen : ''}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button className={styles.faqQuestion} onClick={() => setOpen(open === i ? null : i)}>
                {faq.q}
                <span className={styles.faqIcon}>{open === i ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    className={styles.faqAnswer}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaOrb} />
      <div className="container">
        <motion.div
          className={styles.ctaContent}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Bugun boshlang. <span className={styles.gradientText}>Bepul.</span></h2>
          <p>10,000+ o'qituvchilar bilan qo'shiling. Kredit karta kerak emas.</p>
          <div className={styles.ctaBtns}>
            <Link to="/register" className={styles.ctaPrimary}>
              Hoziroq boshlash <RiArrowRightLine />
            </Link>
            <Link to="/login" className={styles.ctaSecondary}>
              Kirish
            </Link>
          </div>
          <div className={styles.ctaTrust}>
            <RiShieldCheckLine /> Xavfsiz <span>•</span>
            <RiGlobalLine /> O'zbekiston uchun <span>•</span>
            Bepul boshlanish
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <div className={styles.logoIcon}><RiBrainLine /></div>
              <span>AI <strong>Ustoz</strong></span>
            </div>
            <p>O'zbekiston o'qituvchilari uchun eng ilg'or AI yordamchi platformasi.</p>
            <div className={styles.footerSocials}>
              {['Telegram', 'Instagram', 'YouTube'].map(s => (
                <a key={s} href="#" className={styles.socialLink}>{s}</a>
              ))}
            </div>
          </div>
          {[
            { title: 'Mahsulot', links: ['Xususiyatlar', 'Narxlar', 'Demo', "Yangiliklar"] },
            { title: 'Kompaniya', links: ['Biz haqimizda', 'Blog', 'Aloqa', "Ish o'rinlari"] },
            { title: "Qo'llab-quvvatlash", links: ['FAQ', "Qo'llanma", 'API', 'Status'] },
          ].map(col => (
            <div key={col.title} className={styles.footerCol}>
              <h4>{col.title}</h4>
              {col.links.map(l => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 AI Ustoz. Barcha huquqlar himoyalangan.</p>
          <div className={styles.footerLinks}>
            <a href="#">Maxfiylik siyosati</a>
            <a href="#">Foydalanish shartlari</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.landing}>
      <Navbar theme={theme} toggleTheme={toggleTheme} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
