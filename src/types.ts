
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
}

// --- Directus Schema Definitions ---

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
}

export type TabType = 'dashboard' | 'general' | 'appearance' | 'knowledge' | 'integrations' | 'deploy' | 'profile';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
