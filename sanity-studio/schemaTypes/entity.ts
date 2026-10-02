import { defineType, defineField } from 'sanity';

export const entity = defineType({
  name: 'entity',
  title: 'Entity',
  type: 'document',
  fields: [
    defineField({ name: '_id', title: 'ID', type: 'string' }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'entityType', title: 'Entity Type', type: 'string',
      options: { list: ['framework','feature','organization','standard','database','api','protocol'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'aliases', title: 'Aliases', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'relatedEntities', title: 'Related Entities',
      type: 'array', of: [{ type: 'reference', to: [{ type: 'entity' }] }],
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'entityType' } },
});
