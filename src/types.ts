
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'ready' | 'error'; // Removed 'indexing'
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
  phone?: string;
  instagram?: string;
  whatsapp?: string;
  telegram?: string;
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
  chatbot_business?: string;
  chatbot_site?: string;
  chatbot_telegram?: string; // This was existing but maybe unused, now used for contact
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
  chatbot_llm?: number; // Renamed from chatbot_vector (Files count)
  chatbot_vector?: number; // NEW: Actual vector count from Qdrant
  chatbot_human?: string;
  chatbot_folder?: string; // UUID of the related folder
  chatbot_phone?: string; // Contact phone number
  chatbot_instagram?: string; // Contact Instagram
  chatbot_whatsapp?: string; // Contact WhatsApp
  // Usage stats per bot
  chatbot_messages?: string; // Stored as string/bigint in DB
  chatbot_storage?: string; // Stored as string/bigint in DB
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

export interface UserProfile {
  id: number;
  status: string;
  user_created: string;
  date_created: string;
  date_updated: string;
  profile_official: boolean;
  profile_color?: string;
  profile_phone?: string;
  profile_instagram?: string;
  profile_telegram?: string;
  profile_website?: string;
  profile_company?: string;
  // Subscription fields
  profile_plan?: string | number | any; // Relaxed type to handle ID, String, or Relation Object
  profile_chatbots?: number;
  profile_messages?: string;
  profile_storages?: string;
  profile_llm?: number; // Renamed from profile_vectors
  // Subscription timing
  profile_duration?: 'monthly' | 'yearly';
  profile_start?: string;
  profile_end?: string;
}

export interface Plan {
  id: number;
  plan_name: string;
  plan_messages: number;
  plan_llm: number;
  plan_storage: number;
  plan_monthly: number;
  plan_yearly: number;
  plan_bots: number;
  plan_vector?: string; // Kept as string to match DB if needed, though mostly unused in UI math
  plan_copyright?: boolean;
}

export interface LLMJob {
  id: number;
  llm_status: 'ready' | 'start' | 'building' | 'completed' | 'error';
  llm_file: string | DirectusFile; // Can be an ID or the full object
  llm_chatbot: number | Chatbot;
  llm_error?: string | null;
  date_created: string;
}

export interface DirectusSchema {
  configuration: DirectusConfiguration;
  directus_files: DirectusFile;
  chatbot: Chatbot[];
  llm: LLMJob[];
  profile: UserProfile[];
  plan: Plan[];
}

export type TabType = 'dashboard' | 'general' | 'appearance' | 'knowledge' | 'integrations' | 'deploy' | 'profile' | 'create-bot' | 'manage-bots' | 'pricing' | 'checkout';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type BuildStatus = 'idle' | 'ready' | 'start' | 'building' | 'completed' | 'error';

export interface ProcessedFile {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  type: string;
  buildStatus: BuildStatus;
  errorMessage?: string | null;
  llmJobId?: number;
}
