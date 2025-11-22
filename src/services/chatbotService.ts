

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

export const createChatbot = async (name: string, slug: string, businessName: string): Promise<Chatbot | null> => {
  try {
    // 1. Create the Chatbot item
    // @ts-ignore
    const result = await directus.request(createItem('chatbot', {
      chatbot_name: name,
      chabot_title: name,
      chatbot_slug: slug,
      chatbot_business: businessName,
      chatbot_active: true,
      status: 'published'
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
      // Log error but don't fail the whole process since the bot is already created
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