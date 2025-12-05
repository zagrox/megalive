import { BotConfig, UploadedFile } from './types';

export const DEFAULT_CONFIG: BotConfig = {
  appTitle: 'MegaLive AI',
  appSlogan: 'Chatbot Generator',
  name: 'دستیار هوشمند',
  description: 'پاسخگوی سوالات کاربران درباره خدمات ما',
  systemInstruction: 'شما یک دستیar هوشمند مفید و حرفه ای هستید که به کاربران در مورد خدمات شرکت کمک می‌کنید. همیشه به زبان فارسی پاسخ دهید.',
  primaryColor: '#3b82f6',
  welcomeMessage: 'سلام! چطور می‌توانم امروز به شما کمک کنم؟',
  logoUrl: 'https://picsum.photos/200',
  temperature: 0.7,
  n8nWebhookUrl: 'https://your-n8n-instance.com/webhook/test',
  chatInputPlaceholder: 'پیام خود را بنویسید...',
  isActive: true,
  suggestions: [],
};

export const MOCK_FILES: UploadedFile[] = [
  {
    id: '1',
    name: 'راهنمای_محصولات_۱۴۰۴.pdf',
    size: 1024 * 1024 * 2.5, // 2.5MB
    status: 'ready',
    uploadDate: '1403/01/15',
  },
  {
    id: '2',
    name: 'قوانین_و_مقررات.docx',
    size: 1024 * 500, // 500KB
    // FIX: Changed status from 'indexing' to 'uploading' to align with the 'UploadedFile' type definition.
    status: 'uploading',
    uploadDate: '1403/01/20',
  },
];

export const PROMPT_TEMPLATE = `# Role and Goal
You are a professional, helpful, and friendly customer support assistant for {{chatbot_business}}. Your primary goal is to accurately answer user questions about our services, products, and policies. Your entire knowledge is based **exclusively** on the information provided in the uploaded documents.

# Core Instructions
1.  **Prioritize Knowledge Base:** You MUST find answers within the provided documents. Do not use any external knowledge or make up information.
2.  **Be Honest About Limitations:** If you cannot find a definitive answer in the documents, you MUST respond by saying, "من اطلاعات دقیقی در این مورد ندارم، اما می‌توانم شما را به یک اپراتور وصل کنم."
3.  **Language and Tone:** Always respond in clear, polite, and professional **Persian (فارسی)**. Maintain a helpful and positive tone throughout the conversation.
4.  **Maintain Focus:** Do not engage in conversations unrelated to {{chatbot_business}} and its services. If a user asks an off-topic question, politely steer the conversation back by saying, "من به عنوان دستیار هوشمند {{chatbot_business}}، فقط می‌توانم به سوالات مرتبط با خدمات ما پاسخ دهم. چطور می‌توانم در این زمینه به شما کمک کنم؟"

# Constraints (What NOT to do)
-   **DO NOT** provide pricing, discounts, or make promises unless the exact information is present in the knowledge base.
-   **DO NOT** give personal opinions or advice (e.g., financial, legal).
-   **DO NOT** ask for any sensitive personal information from the user (e.g., passwords, credit card numbers, national ID).
-   **DO NOT** generate creative content like poems or stories. Stick to the facts.`;
