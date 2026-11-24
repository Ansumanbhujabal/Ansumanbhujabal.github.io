import { describe, expect, it } from 'vitest';
import { logSchema } from '../src/lib/log/schema';
import { toLogView } from '../src/lib/log/view';

describe('log contract', () => {
  it('accepts the legacy four-field entry', () => {
    const parsed = logSchema.parse({
      date: '2026-08-26', kind: 'read', title: 'Alignment', url: 'https://example.com/a',
    });
    expect(parsed).toMatchObject({ category: 'general', tags: [], generation: 'manual', indexable: true });
  });

  it('accepts generated metadata and normalizes a display view', () => {
    const data = logSchema.parse({
      date: '2026-11-24', kind: 'read', title: 'Agent evaluation',
      url: 'https://example.com/a', canonicalSourceUrl: 'https://example.com/a',
      source: 'Example', description: 'A concrete evaluation note.', category: 'evals',
      contentType: 'article', tags: ['evals', 'agents'], generation: 'copilot', indexable: true,
    });
    const view = toLogView({ id: '2026-11-24-agent-evaluation.md', data, body: 'Synopsis.' } as never);
    expect(view).toMatchObject({ slug: '2026-11-24-agent-evaluation', source: 'Example', synopsis: 'Synopsis.' });
  });

  it('derives safe defaults for a legacy entry', () => {
    const data = logSchema.parse({ date: '2026-08-26', kind: 'read', title: 'Alignment', url: 'https://example.com/a' });
    const view = toLogView({ id: '2026-08-26-alignment.md', data, body: 'My note.' } as never);
    expect(view.source).toBe('example.com');
    expect(view.description).toBe('My note.');
    expect(view.contentType).toBe('article');
  });
});
