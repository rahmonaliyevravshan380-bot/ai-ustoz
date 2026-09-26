import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiVipCrownLine, RiCheckLine, RiFlashlightLine, RiShieldLine,
  RiArrowRightLine, RiTimeLine, RiInfinityLine, RiStarLine,
  RiCloseLine, RiLoader4Line, RiAlertLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useNotification } from '../../context/NotificationContext';
import { PLANS } from '../../services/SubscriptionService';
import { PaymentService, PAYMENT_PROVIDERS } from '../../services/PaymentService';
import styles from './SubscriptionPage.module.scss';

const PLAN_ORDER = ['free', 'weekly', 'monthly', 'yearly'];

const PLAN_COLORS = {
  free: { gradient: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)', accent: '#9CA3AF' },
  weekly: { gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', accent: '#F59E0B' },
  monthly: { gradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', accent: '#2563EB' },
  yearly: { gradient: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', accent: '#60A5FA' },
};

function PlanCard({ planId, plan, isCurrent, onSelect, loading }) {
  const colors = PLAN_COLORS[planId] || PLAN_COLORS.monthly;
  const isPopular = planId === 'monthly';
  const isFree = planId === 'free';

  return (
    <motion.div
      className={`${styles.planCard} ${isCurrent ? styles.current : ''} ${isPopular ? styles.popular : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: PLAN_ORDER.indexOf(planId) * 0.08 }}
      whileHover={{ y: -6, scale: 1.01 }}
    >
      {plan.badge && (
        <div className={styles.planBadge}>{plan.badge}</div>
      )}
      {isCurrent && (
        <div className={styles.currentBadge}><RiCheckLine /> Joriy plan</div>
      )}

      <div className={styles.planHeader} style={{ background: colors.gradient }}>
        <div className={styles.planIcon}>
          {planId === 'free' ? '🎓' : planId === 'weekly' ? '🔥' : planId === 'monthly' ? '⭐' : '💎'}
        </div>
        <h3 className={styles.planName}>{plan.name}</h3>
        <div className={styles.planPrice}>
          {plan.price === 0 ? (
            <span className={styles.priceFree}>Bepul</span>
          ) : (
            <>
              <span className={styles.priceAmount}>
                {new Intl.NumberFormat('uz-UZ').format(plan.price)}
              </span>
              <span className={styles.priceCurrency}> UZS</span>
              <span className={styles.pricePeriod}>
                /{planId === 'weekly' ? 'hafta' : planId === 'monthly' ? 'oy' : 'yil'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.planBody}>
        <ul className={styles.featureList}>
          {plan.features.map((f, i) => (
            <li key={i} className={styles.featureItem}>
              <RiCheckLine style={{ color: colors.accent, flexShrink: 0 }} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {!isFree && (
          <div className={styles.aiLimit}>
            <RiInfinityLine style={{ color: colors.accent }} />
            <span>Cheksiz AI so'rovlar</span>
          </div>
        )}
        {isFree && (
          <div className={styles.aiLimit}>
            <RiTimeLine style={{ color: colors.accent }} />
            <span>100 so'rov / 7 kun</span>
          </div>
        )}

        <button
          className={`${styles.selectBtn} ${isCurrent ? styles.currentBtn : ''} ${isPopular ? styles.popularBtn : ''}`}
          style={!isCurrent && !isFree ? { background: colors.gradient } : {}}
          onClick={() => !isCurrent && !isFree && onSelect(planId)}
          disabled={isCurrent || isFree || loading}
        >
          {loading === planId ? (
            <><RiLoader4Line className={styles.spinner} /> Jarayon...</>
          ) : isCurrent ? (
            <><RiCheckLine /> Joriy plan</>
          ) : isFree ? (
            'Bepul tarif'
          ) : (
            <><RiArrowRightLine /> Tanlash</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ── Payment Modal ──────────────────────────────────────────────────────────
function PaymentModal({ planId, plan, onClose, onSuccess }) {
  const { user } = useAuth();
  const [provider, setProvider] = useState(PAYMENT_PROVIDERS.DEMO);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    setProcessing(true);
    setError(null);
    try {
      const result = await PaymentService.purchasePlan({
        userId: user.id,
        planId,
        provider,
      });
      if (result.success) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err.message || "To'lov amalga oshmadi. Qayta urinib ko'ring.");
    } finally {
      setProcessing(false);
    }
  };

  const colors = PLAN_COLORS[planId] || PLAN_COLORS.monthly;

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader} style={{ background: colors.gradient }}>
          <div>
            <h2>To'lovni amalga oshiring</h2>
            <p>{plan.name} · {new Intl.NumberFormat('uz-UZ').format(plan.price)} UZS</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><RiCloseLine /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.providerSection}>
            <h3>To'lov usulini tanlang</h3>
            <div className={styles.providerGrid}>
              {[
                { id: 'demo', label: 'Demo (Test)', icon: '🧪', desc: 'Sinovchi rejimi' },
                { id: 'click', label: 'Click', icon: '💙', desc: 'Tez to\'lov' },
                { id: 'payme', label: 'Payme', icon: '🟢', desc: 'Mobil to\'lov' },
                { id: 'stripe', label: 'Stripe', icon: '💳', desc: 'Xalqaro karta' },
              ].map(p => (
                <button
                  key={p.id}
                  className={`${styles.providerCard} ${provider === p.id ? styles.providerActive : ''}`}
                  onClick={() => setProvider(p.id)}
                  disabled={p.id !== 'demo'}
                >
                  <span className={styles.providerIcon}>{p.icon}</span>
                  <span className={styles.providerLabel}>{p.label}</span>
                  <span className={styles.providerDesc}>{p.desc}</span>
                  {p.id !== 'demo' && <span className={styles.comingSoon}>Tez kunda</span>}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.orderSummary}>
            <h3>Buyurtma xulasasi</h3>
            <div className={styles.orderRow}>
              <span>{plan.name} obuna</span>
              <span>{new Intl.NumberFormat('uz-UZ').format(plan.price)} UZS</span>
            </div>
            <div className={styles.orderRow}>
              <span>Chegirma</span>
              <span className={styles.green}>— 0 UZS</span>
            </div>
            <div className={`${styles.orderRow} ${styles.orderTotal}`}>
              <strong>Jami</strong>
              <strong>{new Intl.NumberFormat('uz-UZ').format(plan.price)} UZS</strong>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <RiAlertLine />{error}
            </div>
          )}

          <div className={styles.securityNote}>
            <RiShieldLine />
            <span>256-bit SSL shifrlash bilan himoyalangan to'lov</span>
          </div>

          <button
            className={styles.payBtn}
            style={{ background: colors.gradient }}
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? (
              <><RiLoader4Line className={styles.spinner} /> To'lov amalga oshirilmoqda...</>
            ) : (
              <><RiVipCrownLine /> {new Intl.NumberFormat('uz-UZ').format(plan.price)} UZS To'lash</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Subscription Page ─────────────────────────────────────────────────
export default function SubscriptionPage() {
  const { user } = useAuth();
  const { subscription, statusSummary, activatePlan, refresh } = useSubscription();
  const { addToast, addNotification } = useNotification();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(null);
  const [successTxn, setSuccessTxn] = useState(null);

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handlePaymentSuccess = useCallback(({ transaction, invoice }) => {
    setSelectedPlan(null);
    setSuccessTxn(transaction);
    refresh();
    addToast({ type: 'success', title: 'Obuna faollashtirildi! 🎉', message: `${PLANS[transaction.planId]?.name} rejimi faol.` });
    addNotification({
      type: 'payment',
      title: 'Obuna faollashtirildi',
      message: `${PLANS[transaction.planId]?.name} · ${new Intl.NumberFormat('uz-UZ').format(transaction.amount)} UZS`,
    });
  }, [addToast, addNotification, refresh]);

  const currentPlanId = subscription?.planId || 'free';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.headerBadge}><RiVipCrownLine /> Premium Obuna</div>
          <h1>Reja tanlang</h1>
          <p>AI Ustoz'ning to'liq quvvatini yoching. Istalgan vaqt bekor qilish mumkin.</p>
        </motion.div>

        {statusSummary && (
          <motion.div
            className={styles.currentStatus}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.statusDot} style={{ background: statusSummary.color }} />
            <span>{statusSummary.label}</span>
            {subscription?.resetAt && (
              <span className={styles.resetDate}>
                · Yangilanish: {new Date(subscription.resetAt).toLocaleDateString('uz-UZ')}
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {successTxn && (
          <motion.div
            className={styles.successBanner}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span>🎉</span>
            <div>
              <strong>Obuna faollashtirildi!</strong>
              <span> {PLANS[successTxn.planId]?.name} rejimi muvaffaqiyatli yoqildi. Tranzaktsiya: {successTxn.id}</span>
            </div>
            <button onClick={() => navigate('/dashboard/billing')} className={styles.viewBillingBtn}>
              Hisob-kitob <RiArrowRightLine />
            </button>
            <button className={styles.closeBannerBtn} onClick={() => setSuccessTxn(null)}>
              <RiCloseLine />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Grid */}
      <div className={styles.plansGrid}>
        {PLAN_ORDER.map(planId => (
          <PlanCard
            key={planId}
            planId={planId}
            plan={PLANS[planId]}
            isCurrent={currentPlanId === planId}
            onSelect={handleSelectPlan}
            loading={loading}
          />
        ))}
      </div>

      {/* FAQ */}
      <div className={styles.faqSection}>
        <h2>Ko'p so'raladigan savollar</h2>
        <div className={styles.faqGrid}>
          {[
            { q: 'Istalgan vaqt bekor qilish mumkinmi?', a: 'Ha, obunani istalgan vaqt bekor qilishingiz mumkin. Muddati tugamaguncha premium imkoniyatlar saqlanib qoladi.' },
            { q: 'Bepul reja qanday ishlaydi?', a: 'Bepul rejada har 7 kunda 100 ta AI so\'rov beriladi. Limit tugagach, keyingi haftagacha kutishingiz yoki premium rejimga o\'tishingiz mumkin.' },
            { q: 'To\'lov usullari qanday?', a: 'Hozirda demo rejimi mavjud. Tez orada Click, Payme va Stripe integratsiyalari qo\'shiladi.' },
            { q: 'Premium rejimda nima farq qiladi?', a: 'Premium rejimda AI so\'rovlar cheksiz, AI Rasm, AI Ovoz, hisobot eksporti va admin panel kabi imkoniyatlar to\'liq ochiladi.' },
          ].map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <PaymentModal
            planId={selectedPlan}
            plan={PLANS[selectedPlan]}
            onClose={() => setSelectedPlan(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
