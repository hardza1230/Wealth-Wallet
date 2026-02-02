import React, { useEffect, useState } from 'react';
import { FinancialInsight, Transaction } from '../types';
import { generateWeeklyInsight } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
      fetchInsight();
    }
  }, [transactions.length]);

  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 p-6 rounded-2xl shadow-lg border border-dark-700 text-center animate-fade-in">
        <p className="text-gray-400">Start adding transactions to see your Health Score!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 shadow-lg animate-pulse h-48 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-gray-400 text-sm">AI is calculating your score...</span>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  // Gauge Data
  const gaugeData = [
    { name: 'Score', value: insight.healthScore },
    { name: 'Rest', value: 100 - insight.healthScore },
  ];
  
  // Dynamic Colors based on Score
  const scoreColor = insight.healthScore >= 80 ? '#10b981' : insight.healthScore >= 50 ? '#f59e0b' : '#ef4444';
  const scoreText = insight.healthScore >= 80 ? 'Excellent' : insight.healthScore >= 50 ? 'Good' : 'Critical';

  return (
    <div className="relative overflow-hidden bg-dark-800 rounded-2xl border border-dark-700 shadow-xl transition-all hover:border-brand-500/30 group">
      {/* Glow Effect */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none`} style={{ backgroundColor: scoreColor }}></div>

      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Text Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-dark-900 border border-dark-600 text-gray-300 uppercase tracking-wider">
              Current Rank
            </span>
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {insight.financialRank}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {insight.summary}
          </p>
          
          <div className="flex items-center space-x-2 pt-2">
            <div className="p-1.5 bg-brand-500/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-brand-200 italic">"{insight.savingsTip}"</span>
          </div>
        </div>

        {/* Right: Gauge Chart */}
        <div className="relative w-40 h-24 flex-shrink-0 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={scoreColor} />
                <Cell fill="#334155" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 flex flex-col items-center">
            <span className="text-3xl font-bold text-white">{insight.healthScore}</span>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">{scoreText}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InsightCard;