import { useState } from 'react';
import { 
  RiMoneyDollarCircleLine, RiAddLine, RiArrowUpLine, RiArrowDownLine,
  RiBankCardLine, RiDownload2Line, RiSearchLine, RiFilter3Line, RiPieChartLine,
  RiFileExcelLine, RiCalendarCheckLine
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { useNotification } from '../../context/NotificationContext';
import styles from './Financial.module.scss';

export default function ReportsPage() {
  const { addToast } = useNotification();
  
  // Transaction State
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', title: "Oylik Maosh (O'qituvchi)", category: "Oylik", amount: 4800000, date: "2026-08-01", note: "Xalq ta'limi vazirligi" },
    { id: 2, type: 'income', title: "Repetitorlik va AI Kurslar", category: "Qo'shimcha", amount: 2200000, date: "2026-08-03", note: "9-A o'quvchilari" },
    { id: 3, type: 'expense', title: "Kantselyariya va bosma materiallar", category: "O'quv Jihozlari", amount: 350000, date: "2026-08-02", note: "Test varaqalari va qog'oz" },
    { id: 4, type: 'expense', title: "Internet va Aloqa", category: "Kommunal", amount: 180000, date: "2026-08-04", note: "Wi-Fi to'lovi" },
    { id: 5, type: 'expense', title: "Transport xarajatlari", category: "Transport", amount: 250000, date: "2026-08-04", note: "Taksi va yo'l" },
    { id: 6, type: 'income', title: "Olimpiada Mukofoti", category: "Bonus", amount: 1500000, date: "2026-08-05", note: "1-o'rin shogird uchun" }
  ]);

  const [filterType, setFilterType] = useState('all'); // 'all' | 'income' | 'expense'
  const [search, setSearch] = useState('');
  
  // New Transaction Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    type: 'income',
    title: '',
    category: 'Oylik',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      addToast({ type: 'error', title: 'Xatolik', message: 'Iltimos barcha maydonlarni to\'ldiring!' });
      return;
    }

    const newT = {
      id: Date.now(),
      ...form,
      amount: Number(form.amount)
    };

    setTransactions(prev => [newT, ...prev]);
    setForm({ type: 'income', title: '', category: 'Oylik', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
    setShowAddForm(false);
    addToast({ type: 'success', title: 'Muvaffaqiyatli', message: 'Yangi moliyaviy yozuv saqlandi!' });
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Turi,Sarlavha,Kategoriya,Summa (SO'M),Sana,Izoh\n";
    transactions.forEach(t => {
      csvContent += `${t.type === 'income' ? 'Kirim' : 'Chiqim'},"${t.title}",${t.category},${t.amount},${t.date},"${t.note}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hisobot_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({ type: 'success', title: 'Yuklab olindi', message: 'Moliyaviy hisobot Excel/CSV formatida yuklandi.' });
  };

  const monthlyChartData = [
    { month: 'Sen', income: 4200000, expense: 800000 },
    { month: 'Okt', income: 4500000, expense: 950000 },
    { month: 'Noy', income: 4800000, expense: 700000 },
    { month: 'Dek', income: 5500000, expense: 1200000 },
    { month: 'Yan', income: 4900000, expense: 650000 },
    { month: 'Fev', income: 8500000, expense: 780000 },
  ];

  const pieData = [
    { name: "Oylik Maosh", value: 4800000, color: '#2563EB' },
    { name: "Qo'shimcha Repetitorlik", value: 2200000, color: '#10B981' },
    { name: "Mukofot va Bonus", value: 1500000, color: '#F59E0B' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><RiMoneyDollarCircleLine /> Hisob va Moliya Moduli</h1>
          <p className={styles.pageSubtitle}>O'qituvchining daromadlari, xarajatlari, maosh hisobi va statistikasi</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={styles.secondaryBtn} onClick={handleExportCSV}>
            <RiFileExcelLine /> CSV/Excel Eksport
          </button>
          <button className={styles.primaryBtn} onClick={() => setShowAddForm(true)}>
            <RiAddLine /> Yangi Operatsiya
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.scIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <RiArrowUpLine />
          </div>
          <div>
            <span>Jami Kirim (Daromad)</span>
            <h2>{totalIncome.toLocaleString()} SO'M</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.scIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <RiArrowDownLine />
          </div>
          <div>
            <span>Jami Chiqim (Xarajat)</span>
            <h2>{totalExpense.toLocaleString()} SO'M</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.scIcon} style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' }}>
            <RiBankCardLine />
          </div>
          <div>
            <span>Sof Balans / Jamg'arma</span>
            <h2>{netBalance.toLocaleString()} SO'M</h2>
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className={styles.modalOverlay}>
          <motion.div className={styles.modalBox} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className={styles.modalHeader}>
              <h3>Yangi Moliyaviy Yozuv</h3>
              <button onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTransaction} className={styles.modalForm}>
              <div>
                <label className="form-label">Operatsiya Turi</label>
                <select name="type" className="input-custom" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="income">Kirim (Daromad)</option>
                  <option value="expense">Chiqim (Xarajat)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Sarlavha / Nomi</label>
                <input 
                  type="text" placeholder="Masalan: Avgust oylik maoshi" 
                  className="input-custom" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Summa (SO'M)</label>
                  <input 
                    type="number" placeholder="500000" 
                    className="input-custom" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Kategoriya</label>
                  <input 
                    type="text" placeholder="Oylik, Jihoz, Transport..." 
                    className="input-custom" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Sana</label>
                <input 
                  type="date" className="input-custom" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowAddForm(false)}>Bekor qilish</button>
                <button type="submit" className={styles.primaryBtn}>Saqlash</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Main Charts & Table */}
      <div className={styles.mainGrid}>
        {/* Monthly Income/Expense Chart */}
        <div className={styles.chartBox}>
          <h3>Oylik Dinamika (Kirim va Chiqim)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }} />
              <Bar dataKey="income" name="Daromad" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Xarajat" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Table */}
        <div className={styles.tableBox}>
          <div className={styles.tableHeader}>
            <div className={styles.searchBox}>
              <RiSearchLine />
              <input 
                type="text" placeholder="Qidiruv..." 
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <button className={filterType === 'all' ? styles.activeFilter : ''} onClick={() => setFilterType('all')}>Hammasi</button>
              <button className={filterType === 'income' ? styles.activeFilter : ''} onClick={() => setFilterType('income')}>Kirim</button>
              <button className={filterType === 'expense' ? styles.activeFilter : ''} onClick={() => setFilterType('expense')}>Chiqim</button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Turi</th>
                  <th>Nomi</th>
                  <th>Kategoriya</th>
                  <th>Sana</th>
                  <th>Summa</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className={`${styles.typeBadge} ${t.type === 'income' ? styles.in : styles.out}`}>
                        {t.type === 'income' ? '↑ Kirim' : '↓ Chiqim'}
                      </span>
                    </td>
                    <td><strong>{t.title}</strong></td>
                    <td>{t.category}</td>
                    <td>{t.date}</td>
                    <td className={t.type === 'income' ? styles.incText : styles.expText}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} SO'M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
