/**
 * ATLAS — LLM Provider Service
 * Supports Gemini via @google/genai SDK.
 * Enforces strict data boundary: retrieved content is always treated as DATA, never instructions.
 */

import { GoogleGenAI } from '@google/genai';
import { atlasConfig } from '../config/env.ts';

export class LLMProviderService {
  private ai: GoogleGenAI | null = null;
  private candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ].filter(Boolean) as string[];

  constructor() {
    const key = atlasConfig.geminiApiKey;
    if (key) {
      try {
        this.ai = new GoogleGenAI({ apiKey: key });
        console.log(`[LLMProvider] Gemini initialized (models: ${this.candidateModels.join(', ')})`);
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
    return this.ai ? `Gemini (${this.candidateModels[0]})` : 'unavailable';
  }

  /**
   * Generate reasoning with a strict system instruction that separates policy from data.
   * The system instruction is trusted; the prompt content is treated as untrusted data.
   * Tries candidate models in order to withstand temporary 503 spikes or deprecations.
   */
  public async generateReasoning(params: {
    systemInstruction: string;
    prompt: string;
    temperature?: number;
  }): Promise<string> {
    if (!this.ai) return '';

    for (const model of this.candidateModels) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
          config: {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.2,
          },
        });

        if (response.text) return response.text;
      } catch (err: any) {
        console.warn(`[LLMProvider] Model ${model} failed (${err?.status || err?.message}), trying fallback...`);
      }
    }

    console.error('[LLMProvider] All candidate models failed to generate reasoning.');
    return '';
  }
}

export const llmProvider = new LLMProviderService();
