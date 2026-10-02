/**
 * ATLAS — Article & Webpage Knowledge Extractor
 * Fetches external articles/documentation via HTTP, cleans HTML,
 * and extracts structured knowledge docs, atomic claims, and suggested audit questions.
 */

import { llmProvider } from '../../llm/provider.ts';

export interface ExtractedArticle {
  title: string;
  docType: string;
  sourceUrl: string;
  author: string;
  publishedAt: string;
  summary: string;
  content: string;
  extractedClaims: string[];
  suggestedQuestions: string[];
}

export class ArticleExtractorService {
  /**
   * Cleans raw HTML text into clean readable plain text.
   */
  private cleanHtml(html: string): { title: string; author: string; description: string; text: string } {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';

    // Extract meta description
    const descMatch =
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract meta author
    const authorMatch =
      html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+property=["']article:author["']\s+content=["']([^"']+)["']/i);
    const author = authorMatch ? authorMatch[1].trim() : '';

    // Strip scripts, styles, header, nav, footer, noscript
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');

    // Convert block elements to newlines
    text = text.replace(/<\/(p|div|h[1-6]|li|article|section|tr)>/gi, '\n');
    // Strip remaining tags
    text = text.replace(/<[^>]+>/g, ' ');
    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean whitespace
    const cleanLines = text
      .split('\n')
      .map(line => line.trim().replace(/\s+/g, ' '))
      .filter(line => line.length > 25); // Filter out short menu artifacts

    return {
      title,
      author,
      description,
      text: cleanLines.slice(0, 40).join('\n\n'), // Up to ~40 good paragraphs
    };
  }

  /**
   * Fetches an external webpage and transforms it into a structured Knowledge Document.
   */
  public async fetchAndExtract(
    url: string,
    overrides?: { title?: string; docType?: string; author?: string }
  ): Promise<ExtractedArticle> {
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      throw new Error('A valid HTTP or HTTPS URL is required');
    }

    // 1. Fetch the webpage
    let html = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ATLAS-Auditor/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch article: HTTP ${response.status} ${response.statusText}`);
      }

      html = await response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Could not access URL (${url}): ${msg}`);
    }

    // 2. Parse & clean text
    const { title: rawTitle, author: rawAuthor, description, text: cleanedContent } = this.cleanHtml(html);

    const fallbackTitle = overrides?.title || rawTitle || new URL(url).pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || 'Untitled Article';
    const fallbackAuthor = overrides?.author || rawAuthor || new URL(url).hostname;
    const fallbackDocType = overrides?.docType || 'technical_rfc';
    const fallbackSummary = description || cleanedContent.slice(0, 300) || 'Imported document content from external source.';

    // 3. AI Extraction using Gemini if available
    if (llmProvider.isAvailable() && cleanedContent.length > 60) {
      try {
        const systemPrompt = `You are the ATLAS Epistemic Knowledge Extractor.
Extract structured knowledge from the provided webpage text into pure JSON matching this exact schema:
{
  "title": "Concise, descriptive title for the document",
  "docType": "one of: technical_rfc, architecture_spec, release_notes, security_advisory, changelog, policy_document",
  "author": "Author, organization, or publisher",
  "summary": "2 to 3 sentence comprehensive summary of the core facts, rules, or announcements",
  "extractedClaims": [
    "Atomic factual claim 1 (self-contained, verifiable statement)",
    "Atomic factual claim 2",
    "Atomic factual claim 3",
    "Atomic factual claim 4"
  ],
  "suggestedQuestions": [
    "Investigation question 1 verifying a core claim",
    "Investigation question 2 testing potential temporal drift or constraints",
    "Investigation question 3 testing an edge case"
  ]
}
Return ONLY valid raw JSON with NO markdown code fences, NO explanation, and NO conversational filler.`;

        const userPrompt = `Source URL: ${url}
Parsed Title: ${fallbackTitle}
Parsed Author: ${fallbackAuthor}
Cleaned Page Text:
${cleanedContent.slice(0, 4500)}`;

        const responseText = await llmProvider.generateReasoning({
          systemInstruction: systemPrompt,
          prompt: userPrompt,
          temperature: 0.2,
        });

        // Parse JSON output
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            title: overrides?.title || parsed.title || fallbackTitle,
            docType: overrides?.docType || parsed.docType || fallbackDocType,
            sourceUrl: url,
            author: overrides?.author || parsed.author || fallbackAuthor,
            publishedAt: new Date().toISOString(),
            summary: parsed.summary || fallbackSummary,
            content: cleanedContent.slice(0, 8000),
            extractedClaims: Array.isArray(parsed.extractedClaims) && parsed.extractedClaims.length > 0
              ? parsed.extractedClaims
              : [parsed.summary || fallbackSummary],
            suggestedQuestions: Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
              ? parsed.suggestedQuestions
              : [`What are the core requirements and statements defined in ${fallbackTitle}?`],
          };
        }
      } catch (aiErr) {
        console.warn('[ArticleExtractor] AI extraction failed, using heuristic extraction:', aiErr);
      }
    }

    // 4. Heuristic Fallback
    const sentences = cleanedContent
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.length > 30 && s.length < 180)
      .slice(0, 5);

    return {
      title: fallbackTitle,
      docType: fallbackDocType,
      sourceUrl: url,
      author: fallbackAuthor,
      publishedAt: new Date().toISOString(),
      summary: fallbackSummary,
      content: cleanedContent.slice(0, 8000),
      extractedClaims: sentences.length > 0 ? sentences : [fallbackSummary],
      suggestedQuestions: [
        `What are the core requirements or facts established in ${fallbackTitle}?`,
        `Does ${fallbackTitle} specify any operational constraints or deprecated behaviors?`,
        `According to ${fallbackAuthor}, how does this specification apply to autonomous systems?`,
      ],
    };
  }
}

export const articleExtractor = new ArticleExtractorService();
