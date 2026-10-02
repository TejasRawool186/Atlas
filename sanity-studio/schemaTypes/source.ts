import { defineType, defineField } from 'sanity';

export const source = defineType({
  name: 'source',
  title: 'Source',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'url', title: 'URL', type: 'url', validation: r => r.required() }),
    defineField({ name: 'publisher', title: 'Publisher', type: 'string' }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
    defineField({
      name: 'sourceType', title: 'Source Type', type: 'string',
      options: { list: ['official_release','documentation','git_commit','changelog','rfcs','benchmark','community_forum'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'author', title: 'Author', type: 'string' }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text' }),
  ],
  preview: { select: { title: 'title', subtitle: 'publisher' } },
});
