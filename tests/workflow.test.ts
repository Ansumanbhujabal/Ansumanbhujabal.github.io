import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ingest = readFileSync('.github/workflows/ingest-reading.yml', 'utf8');
const deploy = readFileSync('.github/workflows/deploy.yml', 'utf8');
const form = readFileSync('.github/ISSUE_TEMPLATE/log-reading.yml', 'utf8');

describe('reading automation workflow', () => {
  it('accepts one URL and labels the issue', () => {
    expect(form).toContain('label: URL');
    expect(form).toContain('reading-link');
    expect(form.match(/type: input/g)).toHaveLength(1);
  });
  it('authorizes before checkout and serializes publishers', () => {
    expect(ingest.indexOf("github.event.issue.user.login == 'Ansumanbhujabal'")).toBeLessThan(ingest.indexOf('actions/checkout'));
    expect(ingest).toContain('group: reading-log-publish');
    expect(ingest).toContain('cancel-in-progress: false');
  });
  it('grants only required repository permissions and passes Copilot secret separately', () => {
    expect(ingest).toContain('contents: write');
    expect(ingest).toContain('issues: write');
    expect(ingest).toContain('COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}');
    expect(ingest).not.toContain('write-all');
  });
  it('calls reusable deployment with the published SHA', () => {
    expect(deploy).toContain('workflow_call:');
    expect(ingest).toContain('uses: ./.github/workflows/deploy.yml');
    expect(ingest).toContain('needs.publish.outputs.commit_sha');
  });
});
