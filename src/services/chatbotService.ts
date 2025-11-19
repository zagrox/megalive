import { directus } from './directus';
import { readItems, createItem, updateItem } from '@directus/sdk';
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

export const createChatbot = async (name: string): Promise<Chatbot | null> => {
  try {
    // @ts-ignore
    const result = await directus.request(createItem('chatbot', {
      chatbot_name: name,
      chabot_title: name,
      chatbot_active: true,
      status: 'published'
    }));
    return result as Chatbot;
  } catch (error) {
    console.error('Error creating chatbot:', error);
    return null;
  }
};

export const updateChatbot = async (id: number, data: Partial<Chatbot>): Promise<Chatbot | null> => {
  try {
    // @ts-ignore
    const result = await directus.request(updateItem('chatbot', id, data));
    return result as Chatbot;
  } catch (error) {
    console.error('Error updating chatbot:', error);
    return null;
  }
};
