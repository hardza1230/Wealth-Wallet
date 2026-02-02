import React, { useState, useRef } from 'react';
import { parseTransactionWithAI } from '../services/geminiService';
import { Transaction, TransactionType } from '../types';

interface SmartCaptureProps {
  onTransactionAdd: (tx: Transaction) => void;
  onClose: () => void;
}

const SmartCapture: React.FC<SmartCaptureProps> = ({ onTransactionAdd, onClose }) => {
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!textInput && !imageFile) {
      setError("Please provide text or an image.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let base64Image: string | undefined = undefined;

      if (imageFile) {
        base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
             const result = reader.result as string;
             // Remove Data URL prefix to get raw base64
             const base64 = result.split(',')[1];
             resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      const rawTx = await parseTransactionWithAI(textInput, base64Image);

      const newTransaction: Transaction = {
        ...rawTx,
        id: crypto.randomUUID(),
      };

      onTransactionAdd(newTransaction);
      onClose(); // Switch back to dashboard on success

    } catch (err) {
      console.error(err);
      setError("AI Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dark-800 p-6 rounded-2xl shadow-xl max-w-md w-full mx-auto border border-dark-700 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-blue-500 bg-clip-text text-transparent">
          Smart Capture
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs / Inputs */}
      <div className="space-y-4">
        
        {/* Text Area */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Paste Bank SMS / Text</label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="e.g. Paid 200 THB to Starbucks on 12/03..."
            className="w-full h-24 bg-dark-900 border border-dark-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">OR</span>
          <div className="h-px bg-dark-700 w-full ml-4"></div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Upload Receipt</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-dark-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-dark-900/50 transition-all group relative overflow-hidden"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 group-hover:text-brand-400 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-gray-500 group-hover:text-gray-300">Click to upload image</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800/50 text-red-300 text-sm rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center ${
            isLoading 
              ? 'bg-gray-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 hover:shadow-brand-500/25'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Generate Data
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SmartCapture;