import dotenv from 'dotenv';
dotenv.config();

export interface AtlasConfig {
  port: number;
  nodeEnv: string;
  geminiApiKey: string | null;
  groqApiKey: string | null;
  sanity: {
    projectId: string | null;
    dataset: string;
    apiVersion: string;
    apiToken: string | null;
    contextUrl: string;
    isConfigured: boolean;
  };
  certificate: {
    hmacSecret: string;
    isDefaultSecret: boolean;
  };
  appUrl: string;
}

function loadConfig(): AtlasConfig {
  const sanityProjectId = process.env.SANITY_PROJECT_ID || null;
  const sanityApiToken = process.env.SANITY_API_TOKEN || null;
  const hmacSecret = process.env.CERTIFICATE_HMAC_SECRET || '';
  const isDefaultSecret = !hmacSecret;

  if (isDefaultSecret) {
    console.warn('[Config] CERTIFICATE_HMAC_SECRET is not set. Certificate signing is disabled until configured.');
  }

  const sanityIsConfigured = Boolean(sanityProjectId && sanityApiToken);
  if (!sanityIsConfigured) {
    console.warn('[Config] Sanity is not fully configured. SANITY_PROJECT_ID and SANITY_API_TOKEN are required for live Sanity queries. The knowledge base corpus will be used from the local dataset.');
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || null;
  if (!geminiApiKey) {
    console.warn('[Config] GEMINI_API_KEY is not set. LLM-powered answer synthesis is disabled. Answers will be derived from structured evidence only.');
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    geminiApiKey,
    groqApiKey: process.env.GROQ_API_KEY || null,
    sanity: {
      projectId: sanityProjectId,
      dataset: process.env.SANITY_DATASET || 'production',
      apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
      apiToken: sanityApiToken,
      contextUrl: process.env.SANITY_CONTEXT_URL || 'https://mcp.sanity.io/v1/context',
      isConfigured: sanityIsConfigured,
    },
    certificate: {
      hmacSecret,
      isDefaultSecret,
    },
    appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || '3000'}`,
  };
}

export const atlasConfig = loadConfig();

/** Returns true when all critical services are configured */
export function isFullyConfigured(): boolean {
  return (
    atlasConfig.geminiApiKey !== null &&
    atlasConfig.sanity.isConfigured &&
    !atlasConfig.certificate.isDefaultSecret
  );
}
