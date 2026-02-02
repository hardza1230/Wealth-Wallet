import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType, FinancialInsight } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-3-flash-preview';

/**
 * Parses raw text or image input into a structured Transaction object.
 * Specialized for Thai Banking Apps (K+, SCB, KMA, Next).
 */
export const parseTransactionWithAI = async (
  textInput: string,
  imageBase64?: string
): Promise<Omit<Transaction, 'id'>> => {
  
  const systemInstruction = `
    You are an expert financial data assistant for 'Finance Flow'.
    Your task: Extract transaction details from Thai Bank App notifications (SMS/Push) or Receipt images.
    
    CRITICAL RULES FOR THAI BANKING CONTEXT:
    1. **Transaction Type Detection**:
       - INCOME keywords: "เงินเข้า", "รับโอนจาก", "Deposit", "Received from", "Xfer from", "โอนเงินเข้า"
       - EXPENSE keywords: "โอนเงินไป", "ถอนเงิน", "ชำระเงิน", "จ่ายบิล", "Paid to", "Transfer to", "Purchase", "Withdrawal", "Payment"
    
    2. **Merchant/Payee Normalization (Smart Labeling)**:
       - "CP ALL", "7-11", "Seven Eleven" -> Set Merchant to "7-Eleven"
       - "Mcd", "McDonald" -> "McDonald's"
       - "Starbucks Coffee" -> "Starbucks"
       - "MEA", "การไฟฟ้านครหลวง", "PEA" -> "Electric Bill" (ค่าไฟฟ้า)
       - "MWA", "การประปา" -> "Water Bill" (ค่าน้ำ)
       - "AIS", "DTAC", "TRUE" -> "Mobile Bill" (ค่าโทรศัพท์)
       - "Grab", "GrabFood" -> "Grab"
       - "Lineman" -> "LINE MAN"
       - If it's a personal transfer (e.g., "Mr. Somchai"), keep the name.

    3. **Category Logic**:
       - "7-Eleven", "FamilyMart" -> "Convenience Store"
       - "KFC", "Bonchon", "MK" -> "Food & Beverage"
       - "BTS", "MRT", "Expressway" -> "Transport"
       - "Netflix", "Spotify", "Youtube", "Apple" -> "Subscription"
       - "Electric Bill", "Water Bill", "Mobile Bill" -> "Utilities"
    
    4. **Date & Description**:
       - If date is missing, use today: ${new Date().toISOString().split('T')[0]}.
       - Description: Summarize the action in Thai if the input is Thai (e.g. "จ่ายค่าไฟ", "ซื้อของเซเว่น").

    5. **Strict JSON Output**: Ensure numbers are pure integers/floats (no currency symbols).
  `;

  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
    parts.push({ text: "Analyze this receipt/slip image." });
  }

  if (textInput) {
    parts.push({ text: `Analyze this text: "${textInput}"` });
  }

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
          category: { type: Type.STRING },
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
 * Generates financial insights with Gamification (Rank/Score).
 */
export const generateWeeklyInsight = async (transactions: Transaction[]): Promise<FinancialInsight> => {
  const txData = JSON.stringify(transactions.slice(0, 30)); 

  const systemInstruction = `
    You are a friendly, witty AI Financial Companion. 
    Analyze the transaction history and calculate a "Wealth Score" (0-100).

    Ranking System:
    - 0-49: "Novice Spender" (ผู้เริ่มต้นเก็บเงิน)
    - 50-79: "Smart Saver" (นักออมมือโปร)
    - 80-100: "Wealth Wizard" (พ่อมดการเงิน)

    Style Guide:
    - Summary: Short, punchy, and modern.
    - Savings Tip: Direct and actionable, like a friend whispering a secret. Use emoji.
    - Output Language: Thai (Fun & Casual).
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: "Analyze my spending, give me my Wealth Score and a fun tip.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Brief analysis" },
          savingsTip: { type: Type.STRING, description: "Specific advice" },
          spendingTrend: { type: Type.STRING, enum: ['UP', 'DOWN', 'STABLE'] },
          healthScore: { type: Type.NUMBER, description: "0-100" },
          financialRank: { type: Type.STRING, description: "The gamified title based on score" }
        },
        required: ["summary", "savingsTip", "spendingTrend", "healthScore", "financialRank"]
      }
    }
  });

  if (!response.text) {
     throw new Error("Failed to generate insight");
  }

  return JSON.parse(response.text);
};