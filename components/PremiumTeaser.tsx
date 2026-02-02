import React from 'react';

const PremiumTeaser: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-dark-800 border border-dark-700 p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-lg">
        <div className="inline-block p-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-6 shadow-lg shadow-orange-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0v-1H3a1 1 0 010-2h1V8a1 1 0 011-1zm5-5a1 1 0 011 1v1h1a1 1 0 010 2h-1v1a1 1 0 01-2 0v-1H9a1 1 0 010-2h1V3a1 1 0 011-1zM5 12a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0v-1H3a1 1 0 010-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
            <path d="M12 9a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V9z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-extrabold text-white mb-4">Unlock Finance Flow <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Premium</span></h2>
        
        <p className="text-gray-400 mb-8 text-lg">
          Take your wealth management to the next level with our advanced AI features.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
          {[
            "Future Cashflow Forecasting",
            "Couple/Family Account Sync",
            "Investment Portfolio Tracking",
            "Unlimited AI Receipt Scans",
            "Export to CSV/Excel",
            "Custom Category Rules"
          ].map((feature, i) => (
            <div key={i} className="flex items-center space-x-2 text-gray-300">
               <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               <span>{feature}</span>
            </div>
          ))}
        </div>

        <button className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-lg shadow-xl shadow-brand-500/30 transform transition hover:-translate-y-1">
          Start 7-Day Free Trial
        </button>
        <p className="mt-4 text-xs text-gray-500">No credit card required for trial.</p>
      </div>
    </div>
  );
};

export default PremiumTeaser;