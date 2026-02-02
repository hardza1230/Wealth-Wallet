import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType, FinancialInsight } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-3-flash-preview';

/**
 * Parses raw text or image input into a structured Transaction object.
 */
export const parseTransactionWithAI = async (
  textInput: string,
  imageBase64?: string
): Promise<Omit<Transaction, 'id'>> => {
  
  const systemInstruction = `
    You are an expert financial data assistant for the 'Finance Flow' app.
    Your task is to extract transaction details from the provided text (e.g., bank SMS, copied text) or receipt image.
    
    Rules:
    1. Identify the Amount, Merchant/Payee, Date, and Category.
    2. Determine if it is INCOME or EXPENSE.
    3. Generate a short, clear description in Thai (if the input is Thai) or English.
    4. If the date is missing, use today's date (${new Date().toISOString().split('T')[0]}).
    5. Be precise with numbers.
  `;

  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg', // Assuming jpeg for simplicity, strictly handled in UI
        data: imageBase64
      }
    });
    parts.push({ text: "Analyze this receipt image." });
  }

  if (textInput) {
    parts.push({ text: `Analyze this text: "${textInput}"` });
  }

  // Schema for structured output
  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          merchant: { type: Type.STRING },
          date: { type: Type.STRING, description: "ISO 8601 format YYYY-MM-DD" },
          description: { type: Type.STRING },
          category: { type: Type.STRING, description: "e.g., Food, Transport, Salary, Bills" },
          type: { type: Type.STRING, enum: [TransactionType.INCOME, TransactionType.EXPENSE] }
        },
        required: ["amount", "merchant", "date", "description", "category", "type"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate transaction data");
  }

  return JSON.parse(response.text);
};

/**
 * Generates financial insights based on transaction history.
 */
export const generateWeeklyInsight = async (transactions: Transaction[]): Promise<FinancialInsight> => {
  const txData = JSON.stringify(transactions.slice(0, 20)); // Limit to last 20 for context window efficiency

  const systemInstruction = `
    You are a financial coach. Analyze the recent transaction history and provide a summary, a specific saving tip, and a health score.
    Input JSON: ${txData}
    
    Output Language: Thai (Make it friendly and encouraging).
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: "Analyze my spending habits.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Brief summary of spending behavior (max 2 sentences)" },
          savingsTip: { type: Type.STRING, description: "Actionable advice to save money" },
          spendingTrend: { type: Type.STRING, enum: ['UP', 'DOWN', 'STABLE'] },
          healthScore: { type: Type.NUMBER, description: "0 to 100 integer representing financial health" }
        },
        required: ["summary", "savingsTip", "spendingTrend", "healthScore"]
      }
    }
  });

  if (!response.text) {
     throw new Error("Failed to generate insight");
  }

  return JSON.parse(response.text);
};