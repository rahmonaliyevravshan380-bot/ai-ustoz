import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiMoneyDollarCircleLine, RiDownloadLine, RiEyeLine, RiArrowUpLine,
  RiVipCrownLine, RiCheckLine, RiTimeLine, RiFileCopyLine,
  RiReceiptLine, RiBankCardLine
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useLanguage } from '../../context/LanguageContext';
import { PaymentService, PAYMENT_STATUS } from '../../services/PaymentService';
import { PLANS } from '../../services/SubscriptionService';
import styles from './BillingPage.module.scss';

const STATUS_LABELS = {
  [PAYMENT_STATUS.PAID]: { label: 'status_paid', color: '#10B981' },
  [PAYMENT_STATUS.PENDING]: { label: 'status_pending', color: '#F59E0B' },
  [PAYMENT_STATUS.PROCESSING]: { label: 'status_processing', color: '#3B82F6' },
  [PAYMENT_STATUS.FAILED]: { label: 'status_failed', color: '#EF4444' },
  [PAYMENT_STATUS.REFUNDED]: { label: 'status_refunded', color: '#8B5CF6' },
  [PAYMENT_STATUS.CANCELLED]: { label: 'status_cancelled', color: '#6B7280' },
  [PAYMENT_STATUS.EXPIRED]: { label: 'status_expired', color: '#6B7280' },
};

export default function BillingPage() {
  const { user } = useAuth();
  const { subscription, statusSummary } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    setTransactions(PaymentService.getTransactions(user.id));
    setInvoices(PaymentService.getInvoices(user.id));
  }, [user?.id]);

  const currentPlan = PLANS[subscription?.planId] || PLANS.free;

  const downloadInvoice = (invoice) => {
    const content = `
${t("ai_assistant")} - ${t("invoice_title")}
========================
${t("invoice_title")}: ${invoice.id}
${t("invoice_date")}: ${new Date(invoice.issuedAt).toLocaleDateString(t("feature_lang") === 'English' ? 'en-US' : 'uz-UZ')}
${t("invoice_user")}: ${user.name} (${user.email})

${t("invoice_order")}
--------
${invoice.lineItems.map(l => `${l.description}: ${new Intl.NumberFormat('uz-UZ').format(l.amount)} UZS`).join('\n')}

${t("invoice_total")}: ${new Intl.NumberFormat('uz-UZ').format(invoice.amount)} UZS
${t("invoice_status")}: ${invoice.status === 'paid' ? t('invoice_paid') : invoice.status.toUpperCase()}

${t("txn_id")}: ${invoice.transactionId || 'N/A'}
========================
${t("ai_assistant")}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoice.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1><RiMoneyDollarCircleLine /> {t("billing_title")}</h1>
          <p>{t("billing_subtitle")}</p>
        </div>
        <button className={styles.upgradeBtn} onClick={() => navigate('/dashboard/subscription')}>
          <RiVipCrownLine /> {t("upgrade_sub")}
        </button>
      </div>

      {/* Current subscription card */}
      <motion.div
        className={styles.subCard}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.subCardLeft}>
          <div className={styles.subIcon}>
            {subscription?.planId === 'free' ? '🎓' : subscription?.planId === 'weekly' ? '🔥' : subscription?.planId === 'monthly' ? '⭐' : '💎'}
          </div>
          <div>
            <div className={styles.subPlanName}>{currentPlan.name} {t("plan_mode")}</div>
            <div className={styles.subStatus}>
              <span className={styles.statusDot} style={{ background: statusSummary?.color }} />
              {statusSummary?.label}
            </div>
          </div>
        </div>
        <div className={styles.subCardRight}>
          {subscription?.expiresAt ? (
            <div className={styles.expiry}>
              <RiTimeLine />
              <span>{t("expires_date")} {new Date(subscription.expiresAt).toLocaleDateString('uz-UZ')}</span>
            </div>
          ) : subscription?.resetAt ? (
            <div className={styles.expiry}>
              <RiTimeLine />
              <span>{t("renews_date")} {new Date(subscription.resetAt).toLocaleDateString('uz-UZ')}</span>
            </div>
          ) : null}

          {subscription?.planId === 'free' && (
            <div className={styles.quotaBar}>
              <div className={styles.quotaText}>
                {t("ai_requests_limit")} {subscription.aiUsed || 0} / {subscription.aiLimit}
              </div>
              <div className={styles.quotaTrack}>
                <div
                  className={styles.quotaFill}
                  style={{ width: `${Math.min(100, ((subscription.aiUsed || 0) / subscription.aiLimit) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Transactions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2><RiBankCardLine /> {t("transactions_header")}</h2>
          <span className={styles.count}>{transactions.length} ta</span>
        </div>

        {transactions.length === 0 ? (
          <div className={styles.empty}>
            <RiBankCardLine className={styles.emptyIcon} />
            <p>{t("no_transactions")}</p>
            <button onClick={() => navigate('/dashboard/subscription')} className={styles.emptyBtn}>
              <RiArrowUpLine /> {t("get_premium")}
            </button>
          </div>
        ) : (
          <div className={styles.txnList}>
            {transactions.map((txn, i) => {
              const statusInfo = STATUS_LABELS[txn.status] || { label: txn.status, color: '#6B7280' };
              return (
                <motion.div
                  key={txn.id}
                  className={styles.txnItem}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={styles.txnIcon}>
                    {txn.planId === 'free' ? '🎓' : txn.planId === 'weekly' ? '🔥' : txn.planId === 'monthly' ? '⭐' : '💎'}
                  </div>
                  <div className={styles.txnInfo}>
                    <div className={styles.txnName}>{txn.planName} {t("subscription_name")}</div>
                    <div className={styles.txnMeta}>
                      {new Date(txn.paidAt).toLocaleDateString('uz-UZ')} · {txn.provider}
                    </div>
                    <div className={styles.txnId}>
                      <RiFileCopyLine size={11} />
                      {txn.id}
                    </div>
                  </div>
                  <div className={styles.txnRight}>
                    <div className={styles.txnAmount}>
                      {new Intl.NumberFormat('uz-UZ').format(txn.amount)} UZS
                    </div>
                    <div
                      className={styles.txnStatus}
                      style={{ background: `${statusInfo.color}22`, color: statusInfo.color }}
                    >
                      {t(statusInfo.label)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2><RiReceiptLine /> {t("invoices_header")}</h2>
          <span className={styles.count}>{invoices.length} ta</span>
        </div>

        {invoices.length === 0 ? (
          <div className={styles.empty}>
            <RiReceiptLine className={styles.emptyIcon} />
            <p>{t("no_invoices")}</p>
          </div>
        ) : (
          <div className={styles.invoiceList}>
            {invoices.map((inv, i) => (
              <motion.div
                key={inv.id}
                className={styles.invoiceItem}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <RiReceiptLine className={styles.invoiceIcon} />
                <div className={styles.invoiceInfo}>
                  <div className={styles.invoiceName}>{inv.id}</div>
                  <div className={styles.invoiceMeta}>
                    {new Date(inv.issuedAt).toLocaleDateString('uz-UZ')} · {inv.planName}
                  </div>
                </div>
                <div className={styles.invoiceAmount}>
                  {new Intl.NumberFormat('uz-UZ').format(inv.amount)} UZS
                </div>
                <button
                  className={styles.downloadBtn}
                  onClick={() => downloadInvoice(inv)}
                  title={t("download_invoice")}
                >
                  <RiDownloadLine />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
