import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { corpusEngine } from '../backend/services/sanity/corpus.ts';

describe('CorpusEngine (Sanity Mirror)', () => {
  test('discovers all registered Sanity schemas', () => {
    const schemas = corpusEngine.getSchemas();
    const typeNames = schemas.map(s => s.typeName);

    assert.ok(typeNames.includes('entity'));
    assert.ok(typeNames.includes('claim'));
    assert.ok(typeNames.includes('source'));
    assert.ok(typeNames.includes('relationship'));
    assert.ok(typeNames.includes('conflict'));
    assert.ok(typeNames.includes('knowledge_doc'));
  });

  test('resolves entities by text search query', () => {
    const results = corpusEngine.findEntitiesByQuery('Feature X');
    assert.ok(results.length > 0);
    assert.ok(results.some(e => e.name.includes('Feature X')));
  });

  test('executes GROQ filter queries against local store', () => {
    const claims = corpusEngine.executeGroq('*[_type == "claim"]');
    assert.ok(Array.isArray(claims));
    assert.ok(claims.length > 0);
  });
});
