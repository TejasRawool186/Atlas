import { defineType, defineField } from 'sanity';

export const conflict = defineType({
  name: 'conflict',
  title: 'Conflict',
  type: 'document',
  fields: [
    defineField({ name: 'claimA', title: 'Claim A', type: 'reference', to: [{ type: 'claim' }], validation: r => r.required() }),
    defineField({ name: 'claimB', title: 'Claim B', type: 'reference', to: [{ type: 'claim' }], validation: r => r.required() }),
    defineField({
      name: 'conflictType', title: 'Conflict Type', type: 'string',
      options: { list: ['TEMPORAL_CONFLICT','ATTRIBUTE_CONFLICT','FACTUAL_CONFLICT','DEPRECATION_CONFLICT'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'resolution', title: 'Resolution', type: 'string' }),
    defineField({ name: 'resolutionSource', title: 'Resolution Source', type: 'reference', to: [{ type: 'source' }] }),
    defineField({ name: 'resolutionReason', title: 'Resolution Reason', type: 'text' }),
  ],
  preview: { select: { title: 'conflictType', subtitle: 'resolution' } },
});
