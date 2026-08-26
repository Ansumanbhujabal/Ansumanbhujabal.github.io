import { describe, it, expect } from 'vitest';
import { buildLlmsTxt } from '../src/lib/llms.ts';

const projects = [
  { name: 'Polly Harness', status: 'live', summary: 'A refund agent built to be attacked.', metrics: ['88.6% pass'] },
  { name: 'Mentis', status: 'live', summary: 'Procurement briefs.', repo: 'https://github.com/x/y' },
];

describe('buildLlmsTxt', () => {
  const out = buildLlmsTxt(projects);
  it('opens with the name as an h1', () => {
    expect(out.split('\n')[0]).toBe('# Ansuman SS Bhujabala');
  });
  it('states the professional role', () => {
    expect(out).toContain('AI Engineer');
  });
  it('includes every project with its summary', () => {
    expect(out).toContain('Polly Harness');
    expect(out).toContain('A refund agent built to be attacked.');
    expect(out).toContain('Mentis');
  });
  it('includes metrics when present', () => {
    expect(out).toContain('88.6% pass');
  });
  it('includes repo links when present', () => {
    expect(out).toContain('https://github.com/x/y');
  });
  it('contains no personal-interest content', () => {
    expect(out.toLowerCase()).not.toContain('anime');
    expect(out.toLowerCase()).not.toContain('anilist');
    expect(out.toLowerCase()).not.toContain('manga');
  });
});
