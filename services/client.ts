import { createDirectus, rest, authentication } from '@directus/sdk';

const CRM_URL = 'https://crm.megalive.ir';

// Adapter to make localStorage compatible with Directus SDK storage interface
// The SDK expects { get, set, remove }, but localStorage has { getItem, setItem, removeItem }
const storageAdapter = {
  get: (key: string) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },
  set: (key: string, value: any) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string) => {
    window.localStorage.removeItem(key);
  }
};

// Initialize the Directus client
export const client = createDirectus(CRM_URL)
  .with(authentication('json', { 
    storage: storageAdapter,
    autoRefresh: true 
  }))
  .with(rest());

export const getAssetUrl = (id: string) => {
  if (!id) return '';
  if (id.startsWith('http')) return id;
  return `${CRM_URL}/assets/${id}`;
};