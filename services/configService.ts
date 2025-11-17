
import { BotConfig } from '../types';

const CRM_BASE_URL = 'https://crm.megalive.ir';

export const fetchCrmConfig = async (): Promise<Partial<BotConfig>> => {
  try {
    // Fetch from the configuration collection
    const response = await fetch(`${CRM_BASE_URL}/items/configuration`);
    
    if (!response.ok) {
      console.warn('Failed to fetch CRM configuration:', response.statusText);
      return {};
    }

    const json = await response.json();
    const data = json.data;

    // Handle both singleton object or array of items
    const configData = Array.isArray(data) ? data[0] : data;

    if (!configData) return {};

    // Map CMS fields (snake_case) to App Config (camelCase)
    const mappedConfig: Partial<BotConfig> = {};

    if (configData.app_title) mappedConfig.appTitle = configData.app_title;
    if (configData.app_slogan) mappedConfig.appSlogan = configData.app_slogan;
    if (configData.name) mappedConfig.name = configData.name;
    if (configData.description) mappedConfig.description = configData.description;
    if (configData.system_instruction) mappedConfig.systemInstruction = configData.system_instruction;
    if (configData.primary_color) mappedConfig.primaryColor = configData.primary_color;
    if (configData.welcome_message) mappedConfig.welcomeMessage = configData.welcome_message;
    if (configData.n8n_webhook_url) mappedConfig.n8nWebhookUrl = configData.n8n_webhook_url;
    if (configData.temperature) mappedConfig.temperature = Number(configData.temperature);

    // Handle App Logo (Sidebar)
    if (configData.app_logo) {
        const logoId = typeof configData.app_logo === 'object' && configData.app_logo !== null 
          ? configData.app_logo.id 
          : configData.app_logo;
          
        mappedConfig.appLogoUrl = logoId.startsWith('http')
          ? logoId
          : `${CRM_BASE_URL}/assets/${logoId}`;
    }

    // Handle Bot Avatar Logo
    if (configData.logo) {
      const logoId = typeof configData.logo === 'object' && configData.logo !== null 
        ? configData.logo.id 
        : configData.logo;

      mappedConfig.logoUrl = logoId.startsWith('http') 
        ? logoId 
        : `${CRM_BASE_URL}/assets/${logoId}`;
    }

    console.log('Configuration loaded from CRM:', mappedConfig);
    return mappedConfig;

  } catch (error) {
    console.error('Error loading CRM configuration:', error);
    return {};
  }
};
