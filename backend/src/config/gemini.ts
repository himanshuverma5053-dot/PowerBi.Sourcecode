import { GoogleGenAI } from '@google/genai';
import { ENV } from './env.js';

let geminiClient: GoogleGenAI | null = null;

/**
 * Lazy initialization for Google Gemini API Client
 * Ensures no startup crash if API key is not yet set
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && ENV.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: ENV.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'magadh-tyres-backend/1.0',
          }
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Gemini Client:', err);
    }
  }
  return geminiClient;
}
