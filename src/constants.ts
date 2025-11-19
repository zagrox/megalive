import { BotConfig, UploadedFile } from './types';

export const DEFAULT_CONFIG: BotConfig = {
  appTitle: 'Mega Live AI',
  appSlogan: 'نسخه ۱.۰.۰',
  name: 'دستیار هوشمند',
  description: 'پاسخگوی سوالات کاربران درباره خدمات ما',
  systemInstruction: 'شما یک دستیار هوشمند مفید و مودب هستید که به کاربران در مورد خدمات شرکت کمک می‌کنید. همیشه به زبان فارسی پاسخ دهید.',
  primaryColor: '#3b82f6',
  welcomeMessage: 'سلام! چطور می‌توانم امروز به شما کمک کنم؟',
  logoUrl: 'https://picsum.photos/200',
  temperature: 0.7,
  n8nWebhookUrl: 'https://your-n8n-instance.com/webhook/test',
  chatInputPlaceholder: 'پیام خود را بنویسید...',
};

export const MOCK_FILES: UploadedFile[] = [
  {
    id: '1',
    name: 'راهنمای_محصولات_۱۴۰۳.pdf',
    size: 1024 * 1024 * 2.5, // 2.5MB
    status: 'ready',
    uploadDate: '1403/01/15',
  },
  {
    id: '2',
    name: 'قوانین_و_مقررات.docx',
    size: 1024 * 500, // 500KB
    status: 'indexing',
    uploadDate: '1403/01/20',
  },
];