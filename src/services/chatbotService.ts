

import { directus } from './directus';
import { readItems, createItem, updateItem, readFolders, createFolder } from '@directus/sdk';
import { Chatbot } from '../types';

export const fetchUserChatbots = async (): Promise<Chatbot[]> => {
  try {
    // @ts-ignore
    const result = await directus.request(readItems('chatbot', {
      sort: ['-date_created'],
    }));
    return result as Chatbot[];
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return [];
  }
};

/**
 * Calculates the total stats from all chatbots belonging to the current user
 * and updates the single Profile item for that user.
 */
export const syncProfileStats = async (userId: string): Promise<void> => {
  try {
    // 1. Fetch all chatbots for this user (user_created is automatically handled by permissions, 
    // but explicit filtering ensures we get the right list context)
    // @ts-ignore
    const bots = await directus.request(readItems('chatbot', {
      filter: { user_created: { _eq: userId } },
      fields: ['chatbot_llm', 'chatbot_messages', 'chatbot_storage']
    })) as Chatbot[];

    // 2. Aggregate Stats
    let totalLlm = 0;
    let totalMessages = 0;
    let totalStorage = 0;

    bots.forEach(bot => {
      // LLM (Vectors)
      if (bot.chatbot_llm) {
        totalLlm += bot.chatbot_llm;
      }
      
      // Messages (stored as string/bigint)
      if (bot.chatbot_messages) {
        totalMessages += parseInt(bot.chatbot_messages);
      }

      // Storage (stored as string/bigint)
      if (bot.chatbot_storage) {
        totalStorage += parseInt(bot.chatbot_storage);
      }
    });

    // 3. Find the user's profile item
    // @ts-ignore
    const profiles = await directus.request(readItems('profile', {
      filter: { user_created: { _eq: userId } },
      limit: 1,
      fields: ['id']
    }));

    if (profiles && profiles.length > 0) {
      const profileId = profiles[0].id;

      // 4. Update Profile with aggregated data
      // @ts-ignore
      await directus.request(updateItem('profile', profileId, {
        profile_chatbots: bots.length,
        profile_llm: totalLlm,
        profile_messages: totalMessages.toString(),
        profile_storages: totalStorage.toString()
      }));
    }

  } catch (error) {
    console.error("Failed to sync profile stats:", error);
  }
};

export const createChatbot = async (name: string, slug: string, businessName: string): Promise<Chatbot | null> => {
  try {
    // 1. Create the Chatbot item
    // @ts-ignore
    const result = await directus.request(createItem('chatbot', {
      chatbot_name: name,
      chabot_title: `دستار هوش مصنوعی ${name}`,
      chatbot_slug: slug,
      chatbot_business: businessName,
      chatbot_active: false,
      status: 'published',
      chatbot_messages: "0",
      chatbot_storage: "0",
      chatbot_llm: 0
    }));

    // 2. Create the corresponding folder in Directus
    try {
      // Search for the parent "llm" folder
      // @ts-ignore
      const folders = await directus.request(readFolders({
        filter: {
          name: { _eq: 'llm' }
        },
        limit: 1
      }));

      // If "llm" folder exists, create the subfolder
      if (folders && folders.length > 0) {
        const parentId = folders[0].id;
        
        // @ts-ignore
        await directus.request(createFolder({
          name: slug,
          parent: parentId
        }));
      } else {
        console.warn("Parent folder 'llm' not found. Skipping subfolder creation.");
      }
    } catch (folderError) {
      // Log error but don't fail the whole process since the bot is created
      console.error('Error creating folder for chatbot:', folderError);
    }

    return result as Chatbot;
  } catch (error) {
    console.error('Error creating chatbot:', error);
    throw error;
  }
};

export const updateChatbot = async (id: number, data: Partial<Chatbot>): Promise<Chatbot | null> => {
  try {
    // @ts-ignore
    const result = await directus.request(updateItem('chatbot', id, data, {
      fields: ['*'] // Request the full object back after update
    }));
    return result as Chatbot;
  } catch (error) {
    console.error('Error updating chatbot:', error);
    return null;
  }
};