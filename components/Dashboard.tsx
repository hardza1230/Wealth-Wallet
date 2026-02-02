import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { parseTransactionWithAI } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  onAddClick: () => void;
  onTransactionAdd: (tx: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onAddClick, onTransactionAdd }) => {
  const [isPasting, setIsPasting] = useState(false);

  // Calculate Totals
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Quick Action: Paste from Clipboard
  const handleQuickPaste = async () => {
    setIsPasting(true);
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        alert("Clipboard is empty!");
        return;
      }
      const txData = await parseTransactionWithAI(text);
      onTransactionAdd({ ...txData, id: crypto.randomUUID() });
    } catch (e) {
      console.error(e);
      alert("Failed to parse text from clipboard.");
    } finally {
      setIsPasting(false);
    }
  };

  // Prepare Chart Data (Grouped by date for richer tooltips)
  const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Aggregate data for the chart to show cumulative balance but maintain daily details
  let runningBalance = 0;
  const chartDataMap = new Map();

  sortedTx.forEach(tx => {
    const dateKey = new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (tx.type === TransactionType.INCOME) runningBalance += tx.amount;
    else runningBalance -= tx.amount;

    if (!chartDataMap.has(dateKey)) {
      chartDataMap.set(dateKey, {
        date: dateKey,
        balance: runningBalance,
        transactions: []
      });
    } else {
      // Update balance for the day to the latest running balance
      chartDataMap.get(dateKey).balance = runningBalance;
    }
    chartDataMap.get(dateKey).transactions.push(tx);
  });

  const chartData = Array.from(chartDataMap.values());

  // Category Data
  const expensesByCategory = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  
  const categoryData = Object.keys(expensesByCategory).map(cat => ({
    name: cat,
    value: expensesByCategory[cat]
  }));

  const COLORS = ['#f43f5e', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];

  // Custom Tooltip Component for Power BI feel
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const txs: Transaction[] = data.transactions || [];
      
      return (
        <div className="bg-dark-900/95 border border-dark-600 p-4 rounded-xl shadow-2xl backdrop-blur-md min-w-[200px]">
          <p className="text-gray-400 text-xs font-bold uppercase mb-2">{label}</p>
          <p className="text-2xl font-bold text-white mb-3">฿{data.balance.toLocaleString()}</p>
          
          {txs.length > 0 && (
            <div className="space-y-2 border-t border-dark-700 pt-2">
              <p className="text-[10px] text-gray-500 uppercase">Activity</p>
              {txs.slice(0, 3).map((t, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-gray-300 truncate max-w-[100px]">{t.merchant}</span>
                  <span className={t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-rose-400'}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}฿{t.amount}
                  </span>
                </div>
              ))}
              {txs.length > 3 && <p className="text-[10px] text-gray-500 text-center">+{txs.length - 3} more</p>}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Worth Card */}
        <div className="bg-gradient-to-br from-dark-800 to-dark-900 p-6 rounded-3xl border border-dark-700 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
          <div className="flex items-baseline space-x-1 relative z-10">
             <span className="text-lg text-gray-500 font-semibold">฿</span>
             <h3 className={`text-4xl font-black tracking-tight ${balance >= 0 ? 'text-white' : 'text-rose-500'}`}>
                {balance.toLocaleString()}
             </h3>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 shadow-xl flex flex-col justify-between hover:bg-dark-800/80 transition-colors">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Income</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-2">+฿{totalIncome.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
           </div>
           <div className="w-full bg-dark-900 h-1.5 rounded-full mt-6 overflow-hidden">
             <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '70%' }}></div>
           </div>
        </div>

        {/* Expense Card */}
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 shadow-xl flex flex-col justify-between hover:bg-dark-800/80 transition-colors">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Expense</p>
                <h3 className="text-2xl font-bold text-rose-400 mt-2">-฿{totalExpense.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              </div>
           </div>
           <div className="w-full bg-dark-900 h-1.5 rounded-full mt-6 overflow-hidden">
             <div className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: '45%' }}></div>
           </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 shadow-xl h-96 relative overflow-hidden">
        <div className="flex justify-between items-center mb-8 relative z-10">
           <div>
             <h4 className="text-white font-bold text-xl">Cash Flow</h4>
             <p className="text-gray-500 text-xs mt-1">Movement Analysis</p>
           </div>
           <div className="flex space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-xs text-gray-300">Net Wealth</span>
              </div>
           </div>
        </div>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={15} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val/1000}k`} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#22c55e" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                animationDuration={1500}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
             <p>No data yet. Start tracking!</p>
          </div>
        )}
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions List */}
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 shadow-xl">
          <div className="flex justify-between items-center mb-6">
             <h4 className="text-white font-bold text-lg">Transactions</h4>
             
             <div className="flex space-x-2">
                {/* Quick Paste Button */}
                <button 
                    onClick={handleQuickPaste}
                    disabled={isPasting}
                    className="flex items-center space-x-1 text-xs bg-dark-700 hover:bg-dark-600 text-emerald-400 font-bold px-3 py-2 rounded-xl transition-all border border-dark-600 hover:border-emerald-500/50 disabled:opacity-50"
                >
                    {isPasting ? (
                        <span className="animate-spin h-3 w-3 border-2 border-emerald-400 rounded-full border-t-transparent"></span>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    )}
                    <span>Smart Paste</span>
                </button>

                <button onClick={onAddClick} className="text-xs bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-xl transition-all border border-dark-600 hover:border-brand-500/50">
                   + Add
                </button>
             </div>
          </div>
          <div className="space-y-4">
            {sortedTx.length === 0 && <p className="text-sm text-gray-500 text-center py-8">History is empty.</p>}
            {[...sortedTx].reverse().slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-dark-700/30 transition-colors group cursor-default">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-105 ${
                    tx.type === TransactionType.INCOME ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 text-emerald-400' : 'bg-gradient-to-br from-rose-500/20 to-rose-900/10 text-rose-400'
                  }`}>
                    {tx.category === 'Food' ? '🍔' : tx.category === 'Utilities' ? '⚡' : tx.category === 'Transport' ? '🚝' : tx.category === 'Salary' ? '💼' : tx.type === TransactionType.INCOME ? '💰' : '🛍️'}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{tx.merchant}</p>
                    <p className="text-gray-500 text-xs mt-0.5 font-medium">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold block text-base ${tx.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}฿{tx.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 shadow-xl">
          <h4 className="text-white font-bold text-lg mb-6">Top Expenses</h4>
          <div className="h-64">
             {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#1e293b', radius: 8}} 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm">
                   <div className="w-12 h-12 bg-dark-700 rounded-full mb-3 flex items-center justify-center opacity-50">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                   </div>
                   No expense data available
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;