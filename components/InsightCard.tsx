import React, { useEffect, useState } from 'react';
import { FinancialInsight, Transaction } from '../types';
import { generateWeeklyInsight } from '../services/geminiService';

interface InsightCardProps {
  transactions: Transaction[];
}

const InsightCard: React.FC<InsightCardProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<FinancialInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      if (transactions.length === 0) return;
      setLoading(true);
      try {
        const data = await generateWeeklyInsight(transactions);
        setInsight(data);
      } catch (error) {
        console.error("Failed to load insights", error);
      } finally {
        setLoading(false);
      }
    };

    if (transactions.length > 0) {
      // Debounce or simple check to avoid too many API calls
      // In a real app, store this in global state or local storage to prevent re-fetching on every mount
      fetchInsight();
    }
  }, [transactions.length]);

  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-lg border border-indigo-700/50 text-center">
        <p className="text-indigo-200">Start adding transactions to unlock AI insights!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 rounded-2xl shadow-xl transform transition-all hover:scale-[1.01]">
      <div className="bg-dark-900/90 backdrop-blur-sm p-6 rounded-xl h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              AI Financial Coach
            </h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Health Score</span>
            <span className={`text-2xl font-black ${insight.healthScore > 70 ? 'text-emerald-400' : insight.healthScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {insight.healthScore}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-indigo-300 mb-1 font-semibold uppercase tracking-wide">Weekly Summary</p>
            <p className="text-gray-100 leading-relaxed text-sm">{insight.summary}</p>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <p className="text-xs text-indigo-300 font-bold mb-1">SMART TIP</p>
              <p className="text-sm text-white italic">"{insight.savingsTip}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;