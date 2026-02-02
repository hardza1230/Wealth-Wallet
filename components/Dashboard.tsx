import React from 'react';
import { Transaction, TransactionType } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  onAddClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onAddClick }) => {
  // Calculate Totals
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Prepare Chart Data (Cumulative Balance)
  const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const chartData = sortedTx.reduce((acc: any[], tx) => {
    const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    const newBalance = tx.type === TransactionType.INCOME 
      ? lastBalance + tx.amount 
      : lastBalance - tx.amount;
    
    acc.push({
      date: new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      balance: newBalance,
      amount: tx.amount,
      type: tx.type
    });
    return acc;
  }, []);

  // Prepare Expense by Category Data
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

  const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-medium">Total Balance</p>
          <h3 className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
            ฿{balance.toLocaleString()}
          </h3>
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Income</p>
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">฿{totalIncome.toLocaleString()}</h3>
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-rose-500/10 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Expense</p>
          </div>
          <h3 className="text-2xl font-bold text-rose-400">฿{totalExpense.toLocaleString()}</h3>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg h-80">
        <h4 className="text-gray-300 font-semibold mb-4">Cash Flow</h4>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `฿${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No transactions yet. Start capturing!</p>
          </div>
        )}
      </div>

      {/* Recent & Categories Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
             <h4 className="text-gray-300 font-semibold">Recent Transactions</h4>
             <button onClick={onAddClick} className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-3 py-1 rounded-full transition-colors">
               + Add New
             </button>
          </div>
          <div className="space-y-3">
            {sortedTx.length === 0 && <p className="text-sm text-gray-500 italic">History is empty.</p>}
            {[...sortedTx].reverse().slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-dark-900/50 rounded-xl hover:bg-dark-700/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === TransactionType.INCOME ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    <span className="text-lg">{tx.type === TransactionType.INCOME ? '💰' : '🏷️'}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm truncate w-32">{tx.merchant}</p>
                    <p className="text-gray-500 text-xs">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-bold ${tx.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === TransactionType.INCOME ? '+' : '-'}฿{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg">
          <h4 className="text-gray-300 font-semibold mb-4">Spending by Category</h4>
          <div className="h-48">
             {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={80} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  Add expenses to see breakdown
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;