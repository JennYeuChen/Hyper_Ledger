import React, { useState, useMemo } from 'react';
import { PlusCircle, Trash2, Wallet, History } from 'lucide-react';

const App = () => {
  // 狀態管理
  const [initialBalance, setInitialBalance] = useState(() => {
    const saved = localStorage.getItem('min_balance');
    return saved ? Number(saved) : 0;
  });
  const [isBalanceSet, setIsBalanceSet] = useState(() => !!localStorage.getItem('min_balance'));
  const [transactions, setTransactions] = useState([]);
  const [tempBalance, setTempBalance] = useState('');
  const [formData, setFormData] = useState({ amount: '', note: '' });

  // 設定初始金額
  const handleSetBalance = (e) => {
    e.preventDefault();
    if (!tempBalance || Number(tempBalance) < 0) return;
    setInitialBalance(Number(tempBalance));
    setIsBalanceSet(true);
    localStorage.setItem('min_balance', tempBalance);
  };

  const currentBalance = useMemo(() => {
    const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return initialBalance - totalExpense;
  }, [initialBalance, transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.note) return;
    const newTransaction = {
      id: Date.now(),
      amount: Number(formData.amount),
      note: formData.note,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions([newTransaction, ...transactions]);
    setFormData({ amount: '', note: '' });
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // 如果還沒設定初始金額，顯示設定畫面
  if (!isBalanceSet) {
    return (
      <div style={{ minHeight: '100-vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '350px', backgroundColor: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#dbeafe', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#2563eb' }}>
            <Wallet size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px' }}>歡迎使用</h2>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>請先輸入你目前擁有的總金額</p>
          <form onSubmit={handleSetBalance}>
            <input
              type="number" placeholder="例如: 5000"
              style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #f1f5f9', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', boxSizing: 'border-box' }}
              value={tempBalance} onChange={(e) => setTempBalance(e.target.value)}
            />
            <button type="submit" style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>開始記帳</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: '40px' }}>
      <header style={{ backgroundColor: 'white', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', sticky: 'top' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0' }}>目前剩餘錢包</p>
        <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '5px 0', color: currentBalance < 0 ? '#ef4444' : '#1e293b' }}>
          ${currentBalance.toLocaleString()}
        </h1>
        <button onClick={() => {localStorage.removeItem('min_balance'); setIsBalanceSet(false);}} style={{ color: '#cbd5e1', fontSize: '10px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>重新設定</button>
      </header>

      <main style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
        <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
            <PlusCircle size={18} color="#ef4444" /> 新增支出紀錄
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text" placeholder="花了什麼？"
              style={{ padding: '15px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '15px' }}
              value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
            <input
              type="number" placeholder="多少錢？"
              style={{ padding: '15px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '15px' }}
              value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
            <button type="submit" style={{ padding: '15px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>送出支出紀錄</button>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={18} /> 支出明細</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>共 {transactions.length} 筆</span>
          </div>

          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#cbd5e1', border: '2px dashed #e2e8f0', borderRadius: '24px' }}>還沒有任何支出喔！</div>
          ) : (
            transactions.map(t => (
              <div key={t.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>支</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{t.note}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{t.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 'bold', color: '#ef4444' }}>-${t.amount.toLocaleString()}</span>
                  <Trash2 size={16} color="#e2e8f0" cursor="pointer" onClick={() => deleteTransaction(t.id)} />
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
