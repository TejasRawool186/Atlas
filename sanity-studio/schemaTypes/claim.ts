import { defineType, defineField } from 'sanity';

export const claim = defineType({
  name: 'claim',
  title: 'Claim',
  type: 'document',
  fields: [
    defineField({ name: 'statement', title: 'Statement', type: 'string', validation: r => r.required() }),
    defineField({ name: 'subject', title: 'Subject Entity', type: 'reference', to: [{ type: 'entity' }], validation: r => r.required() }),
    defineField({ name: 'predicate', title: 'Predicate', type: 'string', validation: r => r.required() }),
    defineField({ name: 'objectText', title: 'Object (text)', type: 'string' }),
    defineField({ name: 'sources', title: 'Sources', type: 'array', of: [{ type: 'reference', to: [{ type: 'source' }] }] }),
    defineField({ name: 'validFrom', title: 'Valid From', type: 'datetime' }),
    defineField({ name: 'validUntil', title: 'Valid Until', type: 'datetime' }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: { list: ['active','superseded','disputed','retracted'] },
      validation: r => r.required(),
    }),
    defineField({
      name: 'confidence', title: 'Confidence', type: 'string',
      options: { list: ['high','medium','low'] },
    }),
  ],
  preview: { select: { title: 'statement', subtitle: 'status' } },
});
