/**
 * ATLAS — LLM Provider Service
 * Supports Gemini via @google/genai SDK.
 * Enforces strict data boundary: retrieved content is always treated as DATA, never instructions.
 */

import { GoogleGenAI } from '@google/genai';
import { atlasConfig } from '../config/env.ts';

export class LLMProviderService {
  private ai: GoogleGenAI | null = null;
  private modelName = 'gemini-2.0-flash';

  constructor() {
    const key = atlasConfig.geminiApiKey;
    if (key) {
      try {
        this.ai = new GoogleGenAI({ apiKey: key });
        console.log(`[LLMProvider] Gemini initialized (model: ${this.modelName})`);
      } catch (err) {
        console.warn('[LLMProvider] Failed initializing Gemini client:', err);
        this.ai = null;
      }
    }
  }

  public isAvailable(): boolean {
    return this.ai !== null;
  }

  public getProviderName(): string {
    return this.ai ? `Gemini (${this.modelName})` : 'unavailable';
  }

  /**
   * Generate reasoning with a strict system instruction that separates policy from data.
   * The system instruction is trusted; the prompt content is treated as untrusted data.
   */
  public async generateReasoning(params: {
    systemInstruction: string;
    prompt: string;
    temperature?: number;
  }): Promise<string> {
    if (!this.ai) return '';

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
        config: {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature ?? 0.2,
        },
      });

      return response.text ?? '';
    } catch (err) {
      console.error('[LLMProvider] Generation error:', err);
      return '';
    }
  }
}

export const llmProvider = new LLMProviderService();
