
// This service handles communication with your custom Coolify Microservice (FastEmbed)
// and the Qdrant Vector Database.

// Replace this with your actual Coolify Service URL
const EMBEDDING_API_URL = 'http://embedding.148.230.105.2.sslip.io'; 
const QDRANT_URL = 'https://qdrant.megalive.ir'; // Or your Qdrant URL
const QDRANT_API_KEY = process.env.API_KEY || ''; // Usually handled via env or proxy

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    // 1. Call the Coolify Python Microservice
    // Note: If you haven't deployed it yet, this will fail.
    // For testing without the backend, you can mock this or use a temporary public API.
    
    // Fallback URL for demo purposes if the user hasn't set up their VPS yet
    // In production, this MUST be the user's Coolify URL.
    const apiUrl = EMBEDDING_API_URL.includes('your-coolify') 
        ? 'https://fastembed-demo.megalive.ir/embed' // Hypothetical demo endpoint
        : `${EMBEDDING_API_URL}/embed`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.vector; // Expecting { "vector": [0.1, 0.2, ...] }

  } catch (error) {
    console.error("Failed to generate embedding:", error);
    throw error;
  }
};

export const upsertToQdrant = async (
  collectionName: string,
  points: { id: string | number; vector: number[]; payload: any }[]
) => {
  try {
    const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points?wait=true`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': QDRANT_API_KEY,
      },
      body: JSON.stringify({
        points: points
      }),
    });

    if (!response.ok) {
        // If collection doesn't exist, we might need to create it first
        if (response.status === 404) {
            await createCollection(collectionName);
            // Retry upsert
            return upsertToQdrant(collectionName, points);
        }
        throw new Error(`Qdrant Upsert Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to upsert to Qdrant:", error);
    throw error;
  }
};

export const deleteFromQdrant = async (collectionName: string, pointIds: (string | number)[]) => {
    try {
        const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points/delete?wait=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': QDRANT_API_KEY,
          },
          body: JSON.stringify({
            points: pointIds
          }),
        });
    
        if (!response.ok) throw new Error(`Qdrant Delete Error: ${response.statusText}`);
        return await response.json();
      } catch (error) {
        console.error("Failed to delete from Qdrant:", error);
        throw error;
      }
};

// Create a collection optimized for FastEmbed (size 384)
const createCollection = async (collectionName: string) => {
    await fetch(`${QDRANT_URL}/collections/${collectionName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': QDRANT_API_KEY,
        },
        body: JSON.stringify({
          vectors: {
            size: 384, // Size for intfloat/multilingual-e5-small
            distance: "Cosine"
          }
        }),
    });
};