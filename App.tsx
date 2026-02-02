import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SmartCapture from './components/SmartCapture';
import InsightCard from './components/InsightCard';
import PremiumTeaser from './components/PremiumTeaser';
import { Transaction, ViewState, TransactionType } from './types';

// Initial Mock Data (Fallback)
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 35000, category: 'Salary', date: '2023-10-01', description: 'Monthly Salary', merchant: 'Company Inc', type: TransactionType.INCOME },
  { id: '2', amount: 1500, category: 'Utilities', date: '2023-10-05', description: 'Electric Bill', merchant: 'MEA', type: TransactionType.EXPENSE },
  { id: '3', amount: 250, category: 'Food', date: '2023-10-06', description: 'Lunch', merchant: 'KFC', type: TransactionType.EXPENSE },
  { id: '4', amount: 5000, category: 'Investment', date: '2023-10-07', description: 'Stock Purchase', merchant: 'Broker', type: TransactionType.EXPENSE },
];

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState['currentView']>('dashboard');
  
  // Persistence: Load from Local Storage or use Initial Data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('finance_flow_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch (e) {
      console.error("Failed to load transactions", e);
      return INITIAL_TRANSACTIONS;
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);

  // Persistence: Save to Local Storage whenever transactions change
  useEffect(() => {
    localStorage.setItem('finance_flow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (tx: Transaction) => {
    setTransactions((prev) => [...prev, tx]);
  };

  const NavButton = ({ view, icon, label }: { view: ViewState['currentView'], icon: any, label: string }) => (
    <button
      onClick={() => setViewState(view)}
      className={`flex flex-col items-center justify-center space-y-1 w-full py-3 transition-colors ${
        viewState === view ? 'text-brand-500' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-brand-500 to-emerald-300 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
               <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Finance Flow</h1>
          </div>
          <button className="relative p-2 rounded-full bg-dark-800 hover:bg-dark-700 transition-colors">
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-800"></span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-24 space-y-6">
        
        {viewState === 'dashboard' && (
          <>
            <InsightCard transactions={transactions} />
            <Dashboard 
              transactions={transactions} 
              onAddClick={() => setShowAddModal(true)} 
              onTransactionAdd={handleAddTransaction}
            />
          </>
        )}

        {viewState === 'insights' && (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-white">Detailed Analysis</h2>
             <InsightCard transactions={transactions} />
             <div className="p-8 text-center text-gray-500 border border-dashed border-dark-700 rounded-2xl">
                More charts coming soon in the next update.
             </div>
          </div>
        )}

        {viewState === 'premium' && (
          <PremiumTeaser />
        )}
      </main>

      {/* Modal for Smart Capture */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <SmartCapture 
             onTransactionAdd={handleAddTransaction} 
             onClose={() => setShowAddModal(false)} 
           />
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/90 backdrop-blur-lg border-t border-dark-700 z-50">
        <div className="max-w-3xl mx-auto px-4 flex justify-around items-center">
          <NavButton 
            view="dashboard" 
            label="Home"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
          />
          
          <div className="relative -top-6">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-tr from-brand-600 to-emerald-400 p-4 rounded-full text-white shadow-xl shadow-brand-500/40 hover:scale-105 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <NavButton 
            view="premium" 
            label="Premium"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
        </div>
      </nav>
    </div>
  );
};

export default App;