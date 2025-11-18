import { createDirectus, rest } from '@directus/sdk';
import { DirectusSchema } from '../types';

const CRM_URL = process.env.DIRECTUS_CRM_URL || 'https://crm.megalive.ir';

// Initialize the SDK Client
// We use the 'rest' composable for standard API requests.
// If you need authentication later, we can chain .with(authentication())
export const directus = createDirectus<DirectusSchema>(CRM_URL)
  .with(rest());

// Helper to generate full asset URL
export const getAssetUrl = (id: string): string => {
  if (!id) return '';
  if (id.startsWith('http')) return id; // Already a full URL
  return `${CRM_URL}/assets/${id}`;
};