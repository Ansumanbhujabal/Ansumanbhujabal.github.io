import { afterEach, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it('searches the complete index and restores the paginated view', async () => {
  const dom = new JSDOM(`<!doctype html><input data-log-search><select data-log-sort><option value="newest">Newest</option></select><p data-log-empty hidden></p><div data-log-results><section class="log-month"><article>First page</article></section></div><nav data-log-pagination></nav>`);
  vi.stubGlobal('document', dom.window.document);
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [{
    slug: 'older-note', title: 'Older Note', description: 'Across pages', source: 'Paper',
    category: 'general', contentType: 'article', tags: ['evals'], date: '2026-01-01T00:00:00.000Z',
  }] })));
  await import('../src/scripts/log-search');
  const input = dom.window.document.querySelector<HTMLInputElement>('[data-log-search]')!;
  input.value = 'older';
  input.dispatchEvent(new dom.window.Event('input'));
  await vi.waitFor(() => expect(dom.window.document.querySelector('[data-log-results]')?.textContent).toContain('Older Note'));
  expect(dom.window.document.querySelector('[data-log-pagination]')?.hasAttribute('hidden')).toBe(true);
  input.value = '';
  input.dispatchEvent(new dom.window.Event('input'));
  expect(dom.window.document.querySelector('[data-log-results]')?.textContent).toContain('First page');
  expect(dom.window.document.querySelector('[data-log-pagination]')?.hasAttribute('hidden')).toBe(false);
});
