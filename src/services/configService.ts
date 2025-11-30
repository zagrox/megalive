import { BotConfig, Plan } from '../types';
import { directus, getAssetUrl } from './directus';
import { readSingleton } from '@directus/sdk';

export const fetchCrmConfig = async (): Promise<Partial<BotConfig>> => {
  try {
    // Use the SDK to fetch the singleton 'configuration' collection
    const configData = await directus.request(readSingleton('configuration'));

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
      // The SDK might return an ID string or an object depending on query depth.
      // For readSingleton default, it usually returns the ID unless fields are specified.
      const logoId = typeof configData.app_logo === 'object' && configData.app_logo !== null 
        ? (configData.app_logo as any).id 
        : configData.app_logo;
          
      mappedConfig.appLogoUrl = getAssetUrl(String(logoId));
    }

    // Handle Bot Avatar Logo
    if (configData.logo) {
      const logoId = typeof configData.logo === 'object' && configData.logo !== null 
        ? (configData.logo as any).id 
        : configData.logo;

      mappedConfig.logoUrl = getAssetUrl(String(logoId));
    }

    return mappedConfig;

  } catch (error) {
    console.error('Error loading CRM configuration:', error);
    return {};
  }
};

export const fetchPricingPlans = async (): Promise<Plan[]> => {
  try {
    // @ts-ignore
    const result = await directus.request(readSingleton('plans'));
    return result?.plans || [];
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return [];
  }
};