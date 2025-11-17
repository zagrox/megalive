import { client, getAssetUrl } from './client';
import { readItems, readSingleton } from '@directus/sdk';
import { BotConfig } from '../types';

export const fetchCrmConfig = async (): Promise<Partial<BotConfig>> => {
  try {
    // We use the generic 'readItems' because 'configuration' might be a singleton or a collection depending on setup.
    // If it's a singleton in Directus, usually readSingleton('configuration') is preferred.
    // Assuming it's a singleton collection:
    
    // Note: Typescript generic <any> is used here for simplicity as we don't have the full schema type generated
    const result = await client.request(readSingleton('configuration'));
    
    if (!result) return {};

    const configData = result as any;

    // Map CMS fields (snake_case) to App Config (camelCase)
    const mappedConfig: Partial<BotConfig> = {};

    if (configData.app_title) mappedConfig.appTitle = configData.app_title;
    if (configData.app_slogan) mappedConfig.appSlogan = configData.app_slogan;
    if (configData.app_color) mappedConfig.appColor = configData.app_color;
    if (configData.name) mappedConfig.name = configData.name;
    if (configData.description) mappedConfig.description = configData.description;
    if (configData.system_instruction) mappedConfig.systemInstruction = configData.system_instruction;
    if (configData.primary_color) mappedConfig.primaryColor = configData.primary_color;
    if (configData.welcome_message) mappedConfig.welcomeMessage = configData.welcome_message;
    if (configData.n8n_webhook_url) mappedConfig.n8nWebhookUrl = configData.n8n_webhook_url;
    if (configData.temperature) mappedConfig.temperature = Number(configData.temperature);

    // Handle App Logo
    if (configData.app_logo) {
        const logoId = typeof configData.app_logo === 'object' && configData.app_logo !== null 
          ? configData.app_logo.id 
          : configData.app_logo;
        mappedConfig.appLogoUrl = getAssetUrl(logoId);
    }

    // Handle Bot Avatar Logo
    if (configData.logo) {
      const logoId = typeof configData.logo === 'object' && configData.logo !== null 
        ? configData.logo.id 
        : configData.logo;
      mappedConfig.logoUrl = getAssetUrl(logoId);
    }

    console.log('Configuration loaded from CRM via SDK:', mappedConfig);
    return mappedConfig;

  } catch (error) {
    console.error('Error loading CRM configuration:', error);
    // Fallback to returning empty object so the app uses defaults
    return {};
  }
};