
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'indexing' | 'ready' | 'error';
  uploadDate: string;
}

export interface BotConfig {
  appTitle?: string;
  appSlogan?: string;
  appLogoUrl?: string;
  appColor?: string;
  name: string;
  description: string;
  systemInstruction: string;
  primaryColor: string;
  welcomeMessage: string;
  logoUrl: string; // In a real app, this might be a file upload too
  temperature: number;
  n8nWebhookUrl: string;
}

export type TabType = 'dashboard' | 'general' | 'appearance' | 'knowledge' | 'integrations' | 'deploy' | 'profile';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}