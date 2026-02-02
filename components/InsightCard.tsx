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
      <div className="bg-gradient-to-r from-dark-800 to-dark-900 p-6 rounded-3xl shadow-lg border border-dark-700 text-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl"></div>
        <p className="text-gray-400 font-medium relative z-10">🚀 Start adding transactions to unlock your Wealth Score!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700 shadow-lg animate-pulse h-56 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400 font-bold animate-pulse">
          AI is analyzing your wealth...
        </span>
      </div>
    );
  }

  if (!insight) return null;

  // Circular Gauge Data
  const gaugeData = [
    { name: 'Score', value: insight.healthScore },
    { name: 'Rest', value: 100 - insight.healthScore },
  ];
  
  // Dynamic Colors based on Score
  const getScoreColor = (score: number) => {
    if (score >= 80) return ['#34d399', '#10b981']; // Emerald
    if (score >= 50) return ['#fbbf24', '#f59e0b']; // Amber
    return ['#f87171', '#ef4444']; // Red
  };

  const [colorStart, colorEnd] = getScoreColor(insight.healthScore);

  // Rank Styling Logic
  const getRankStyles = (rank: string) => {
      const r = rank.toLowerCase();
      if (r.includes('wizard') || r.includes('wealth')) {
          return "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]";
      }
      if (r.includes('saver') || r.includes('pro')) {
          return "bg-gradient-to-r from-cyan-300 to-blue-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]";
      }
      return "text-gray-200";
  };

  return (
    <div className="relative overflow-hidden bg-dark-800 rounded-3xl border border-dark-700 shadow-2xl transition-all hover:shadow-brand-500/10 group">
      
      {/* Dynamic Background Glow */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-500"
        style={{ background: `radial-gradient(circle, ${colorEnd}, transparent)` }}
      ></div>

      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        
        {/* Left: Circular Gauge */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={colorStart} />
                  <stop offset="100%" stopColor={colorEnd} />
                </linearGradient>
              </defs>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                startAngle={90}
                endAngle={-270}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                cornerRadius={10}
              >
                <Cell fill="url(#scoreGradient)" />
                <Cell fill="#1e293b" /> {/* Empty part */}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
              {insight.healthScore}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
              Score
            </span>
          </div>
        </div>

        {/* Right: Insights & Rank */}
        <div className="flex-1 w-full text-center md:text-left space-y-4">
          <div>
            <div className="inline-flex items-center space-x-2 mb-2 bg-dark-900/50 backdrop-blur-md px-3 py-1 rounded-full border border-dark-600">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: colorEnd }}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2`} style={{ backgroundColor: colorEnd }}></span>
              </span>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                Wealth Status
              </span>
            </div>
            
            <h2 className={`text-4xl font-black ${getRankStyles(insight.financialRank)}`}>
              {insight.financialRank}
            </h2>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed font-light">
              {insight.summary}
            </p>
          </div>
          
          {/* Chat Bubble Tip */}
          <div className="relative bg-gradient-to-r from-dark-700 to-dark-800 p-4 rounded-xl rounded-tl-none border border-dark-600 shadow-inner mt-2">
            <div className="absolute -top-2 left-0 w-4 h-4 bg-dark-700 clip-triangle"></div> 
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-xs font-bold text-brand-400 uppercase mb-1">AI Suggestion</p>
                <p className="text-sm text-gray-200 italic font-medium">
                  "{insight.savingsTip}"
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InsightCard;