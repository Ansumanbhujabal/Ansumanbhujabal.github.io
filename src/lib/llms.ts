export interface LlmsProject {
  name: string; status: string; summary: string;
  repo?: string; demo?: string; metrics?: string[];
}

export function buildLlmsTxt(projects: LlmsProject[]): string {
  const lines: string[] = [
    '# Ansuman SS Bhujabala',
    '',
    '> AI Engineer specialising in agentic systems, retrieval-augmented generation, and LLM evaluation. Based in Hyderabad, India. Open to senior AI engineering roles, remote or relocating.',
    '',
    '## Profile',
    '',
    '- Role: AI Engineer',
    '- Focus: agentic systems, RAG, LLM evaluation, adversarial testing, Model Context Protocol, AI security, AIOps',
    '- Location: Hyderabad, India',
    '- Education: B.Tech Computer Science and Engineering, Parala Maharaja Engineering College',
    '- Contact: ansumanbhujabal1@gmail.com',
    '- Site: https://ansumanbhujabal.github.io',
    '- GitHub: https://github.com/Ansumanbhujabal',
    '- LinkedIn: https://www.linkedin.com/in/ansuman-simanta-sekhar-bhujabala',
    '- Résumé: https://ansumanbhujabal.github.io/resume.pdf',
    '',
    '## Selected work',
    '',
  ];
  for (const p of projects) {
    lines.push(`### ${p.name} (${p.status})`, '', p.summary);
    if (p.metrics?.length) lines.push('', `Metrics: ${p.metrics.join('; ')}`);
    const links = [p.repo && `Repository: ${p.repo}`, p.demo && `Demo: ${p.demo}`].filter(Boolean);
    if (links.length) lines.push('', links.join(' | '));
    lines.push('');
  }
  return lines.join('\n');
}
