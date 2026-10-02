import { defineType, defineField } from 'sanity';

export const knowledge_doc = defineType({
  name: 'knowledge_doc',
  title: 'Knowledge Document',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'docType', title: 'Document Type', type: 'string',
      options: { list: ['release_notes','architecture_spec','changelog','technical_rfc','security_advisory'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'sourceUrl', title: 'Source URL', type: 'url', validation: r => r.required() }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'author', title: 'Author', type: 'string', validation: r => r.required() }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', validation: r => r.required() }),
    defineField({ name: 'content', title: 'Full Content', type: 'text' }),
    defineField({ name: 'extractedClaims', title: 'Extracted Claims', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'referencedEntities', title: 'Referenced Entity IDs', type: 'array', of: [{ type: 'string' }] }),
  ],
  preview: { select: { title: 'title', subtitle: 'docType' } },
});
