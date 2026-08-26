export interface LlmsProject {
  name: string; status: string; summary: string;
  repo?: string; demo?: string; metrics?: string[];
}

export function buildLlmsTxt(projects: LlmsProject[]): string {
  const lines: string[] = [
    '# Ansuman SS Bhujabala',
    '',
    '> AI Engineer working on agentic systems, retrieval-augmented generation, and LLM evaluation. Based in Hyderabad, India. Open to AI Engineer, AI Architect, AI Safety Engineer, and generalist roles — remote or relocating.',
    '',
    '## Profile',
    '',
    '- Role: AI Engineer (CTO)',
    '- Focus: agentic systems, RAG, LLM evaluation, adversarial testing, Model Context Protocol, AI security, AIOps',
    '- Location: Hyderabad, India',
    '- Contact: ansumanbhujabal1@gmail.com',
    '- Site: https://ansumanbhujabal.github.io',
    '- GitHub: https://github.com/Ansumanbhujabal',
    '- LinkedIn: https://www.linkedin.com/in/ansuman-simanta-sekhar-bhujabala',
    '- Résumé: https://ansumanbhujabal.github.io/resume.pdf',
    '',
    '## Experience',
    '',
    '### AI Engineer (CTO) — Anyfeast · Feb 2025 – Present · London, UK (Remote)',
    '',
    '- Leading AI engineering for a real-time personalised meal-kit AI ecosystem spanning 50+ dietary verticals including complex health constraints, with validation and evals.',
    '- Architected and scaled a complete harness-engineered recipe engine with guardrails and validation layers, producing 130,000+ diverse recipes serving thousands of customers across the UK and India.',
    '- Led an 8-member team (engineering and doctors) to build an agentic consultation system grounded in verified nutrition data.',
    '',
    '### AI Engineer Intern — Invest4Edu · May 2024 – Jan 2025 · Hyderabad, IN',
    '',
    '- Designed ETL pipelines for educational data scraping handling 10M+ records.',
    '- Built a RAG-based Q&A system over scraped educational content using open-source LLM fine-tuning; added in-house evals and observability with QA teams, achieving 78% accuracy with refusal handling.',
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
