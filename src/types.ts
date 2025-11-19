
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
  name: string;
  description: string;
  systemInstruction: string;
  primaryColor: string;
  welcomeMessage: string;
  logoUrl: string;
  temperature: number;
  n8nWebhookUrl: string;
  chatInputPlaceholder: string;
  isActive?: boolean;
  suggestions: string[];
}

// --- Directus Schema Definitions ---

export interface Chatbot {
  id: number;
  status: string;
  user_created: string;
  date_created: string;
  user_updated: string;
  date_updated: string;
  chatbot_name: string;
  chabot_title: string; // Note: typo from DB schema maintained
  chatbot_site?: string;
  chatbot_telegram?: string;
  chatbot_webhook?: string;
  chatbot_welcome?: string;
  chatbot_logo?: string;
  chatbot_prompt?: string;
  chatbot_active: boolean;
  chatbot_suggestion?: string[];
  chatbot_pro: boolean;
  chatbot_input?: string;
  chatbot_color?: string;
  chatbot_slug?: string;
}

export interface DirectusFile {
  id: string;
  filename_download: string;
  filesize: string; // Directus returns filesize as string or number depending on version, usually number in API V2
  uploaded_on: string;
  type: string;
}

export interface DirectusConfiguration {
  app_title?: string;
  app_slogan?: string;
  app_logo?: string | DirectusFile; // Can be ID or expanded object
  name?: string;
  description?: string;
  system_instruction?: string;
  primary_color?: string;
  welcome_message?: string;
  n8n_webhook_url?: string;
  temperature?: number;
  logo?: string | DirectusFile; // Bot avatar
  app_role?: string; // The ID of the role for new users
}

export interface DirectusSchema {
  configuration: DirectusConfiguration;
  directus_files: DirectusFile;
  chatbot: Chatbot[];
}

export type TabType = 'dashboard' | 'general' | 'appearance' | 'knowledge' | 'integrations' | 'deploy' | 'profile' | 'create-bot';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}