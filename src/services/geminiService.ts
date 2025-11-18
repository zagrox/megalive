import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Simulate the N8N bot chat using Gemini
export const sendChatMessage = async (
  history: Message[],
  newMessage: string,
  systemInstruction: string
): Promise<string> => {
  try {
    const ai = getAI();
    
    // We map our history to the format expected by the chat if we were maintaining state,
    // but for a simple stateless simulation relative to the 'n8n' feel, we'll just
    // generate content with the system instruction + history context.
    // Using the Chat API is better for maintaining context.
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "متاسفم، مشکلی در دریافت پاسخ رخ داد.";
  } catch (error) {
    console.error("Error sending message:", error);
    return "خطا در ارتباط با هوش مصنوعی. لطفا کلید API خود را بررسی کنید.";
  }
};

// Helper to generate a better system prompt based on a business description
export const generateSystemPrompt = async (businessDescription: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `
      من می‌خواهم یک چت‌بات برای کسب و کارم بسازم.
      توضیحات کسب و کار: "${businessDescription}"
      
      لطفا یک "System Instruction" (دستورالعمل سیستمی) حرفه‌ای و کامل به زبان فارسی برای این چت‌بات بنویس.
      لحن باید محترمانه و کمک‌کننده باشد.
      فقط متن دستورالعمل را خروجی بده، بدون توضیحات اضافه.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
};