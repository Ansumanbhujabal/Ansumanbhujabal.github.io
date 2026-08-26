import { describe, it, expect } from 'vitest';
import { checkLinks } from '../scripts/check-links.mjs';

describe('checkLinks', () => {
  it('flags placeholder hrefs', () => {
    expect(checkLinks('<a href="#">Repo</a>')).toEqual(['#']);
  });
  it('flags empty hrefs', () => {
    expect(checkLinks('<a href="">x</a>')).toEqual(['']);
  });
  it('allows in-page anchors with a target name', () => {
    expect(checkLinks('<a href="#work">Work</a>')).toEqual([]);
  });
  it('allows real urls, mailto and rooted paths', () => {
    expect(checkLinks('<a href="https://x.com">a</a><a href="mailto:a@b.c">b</a><a href="/resume.pdf">c</a>')).toEqual([]);
  });
});
