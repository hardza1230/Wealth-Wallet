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

  const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Wealth Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Worth Card */}
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Wealth</p>
          <div className="flex items-baseline space-x-1">
             <span className="text-lg text-gray-500 font-semibold">฿</span>
             <h3 className={`text-4xl font-black ${balance >= 0 ? 'text-white' : 'text-rose-500'}`}>
                {balance.toLocaleString()}
             </h3>
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            Up 12% this month
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Income</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">+฿{totalIncome.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
           </div>
           <div className="w-full bg-dark-900 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }}></div>
           </div>
        </div>

        {/* Expense Card */}
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Expense</p>
                <h3 className="text-2xl font-bold text-rose-400 mt-1">-฿{totalExpense.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              </div>
           </div>
           <div className="w-full bg-dark-900 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-rose-500 h-full rounded-full" style={{ width: '45%' }}></div>
           </div>
        </div>
      </div>

      {/* Main Graph */}
      <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg h-80 relative">
        <div className="flex justify-between items-center mb-6">
           <h4 className="text-white font-bold text-lg">Money Flow</h4>
           <div className="flex space-x-2">
              <span className="w-3 h-3 rounded-full bg-brand-500"></span>
              <span className="text-xs text-gray-400">Net Balance</span>
           </div>
        </div>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <p>Start tracking to see your growth curve!</p>
          </div>
        )}
      </div>

      {/* Split View: Recent & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent List */}
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
             <h4 className="text-white font-bold">Recent Activity</h4>
             <button onClick={onAddClick} className="text-xs bg-dark-700 hover:bg-dark-600 text-white px-3 py-1.5 rounded-lg transition-colors border border-dark-600">
               + Add
             </button>
          </div>
          <div className="space-y-4">
            {sortedTx.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No transactions found.</p>}
            {[...sortedTx].reverse().slice(0, 6).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center group cursor-default">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    tx.type === TransactionType.INCOME ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tx.category === 'Food' ? '🍔' : tx.category === 'Transport' ? '🚝' : tx.category === 'Salary' ? '💼' : tx.type === TransactionType.INCOME ? '💰' : '🛍️'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{tx.merchant}</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${tx.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-white'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}฿{tx.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg">
          <h4 className="text-white font-bold mb-6">Where money goes</h4>
          <div className="h-64">
             {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#1e293b', radius: 4}} 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm">
                   <div className="w-12 h-12 bg-dark-700 rounded-full mb-2"></div>
                   No expense data
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;