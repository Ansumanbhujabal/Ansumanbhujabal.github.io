interface SearchEntry {
  slug: string; title: string; description: string; source: string;
  category: string; contentType: string; tags: string[]; date: string;
}

const search = document.querySelector<HTMLInputElement>('[data-log-search]');
const sort = document.querySelector<HTMLSelectElement>('[data-log-sort]');
const results = document.querySelector<HTMLElement>('[data-log-results]');
const empty = document.querySelector<HTMLElement>('[data-log-empty]');
const pagination = document.querySelector<HTMLElement>('[data-log-pagination]');
const initial = results ? [...results.childNodes] : [];
let allEntries: Promise<SearchEntry[]> | undefined;
let revision = 0;

function loadEntries(): Promise<SearchEntry[]> {
  allEntries ??= fetch('/log/search.json').then(response => {
    if (!response.ok) throw new Error(`Search index unavailable (${response.status})`);
    return response.json() as Promise<SearchEntry[]>;
  });
  return allEntries;
}

function row(entry: SearchEntry): HTMLElement {
  const article = document.createElement('article');
  article.className = 'log-row';
  const meta = document.createElement('div');
  meta.className = 'log-row-meta';
  const date = document.createElement('time');
  date.dateTime = entry.date;
  date.textContent = new Date(entry.date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const type = document.createElement('span');
  type.textContent = entry.contentType;
  meta.append(date, type);
  const detail = document.createElement('div');
  const heading = document.createElement('h2');
  const link = document.createElement('a');
  link.href = `/log/${encodeURIComponent(entry.slug)}/`;
  link.textContent = entry.title;
  heading.append(link);
  const description = document.createElement('p');
  description.textContent = entry.description;
  detail.append(heading, description);
  const source = document.createElement('div');
  source.className = 'log-row-source';
  const sourceName = document.createElement('span');
  sourceName.textContent = entry.source;
  source.append(sourceName);
  if (entry.tags.length) {
    const tags = document.createElement('div');
    tags.className = 'log-tags';
    for (const tag of entry.tags) {
      const badge = document.createElement('span');
      badge.textContent = tag;
      tags.append(badge);
    }
    source.append(tags);
  }
  article.append(meta, detail, source);
  return article;
}

async function update(): Promise<void> {
  if (!results) return;
  const current = ++revision;
  const query = search?.value.trim().toLocaleLowerCase() ?? '';
  const order = sort?.value ?? 'newest';
  if (!query && order === 'newest') {
    results.replaceChildren(...initial);
    if (empty) empty.hidden = true;
    if (pagination) pagination.hidden = false;
    return;
  }
  try {
    const entries = await loadEntries();
    if (current !== revision) return;
    const category = results.dataset.category;
    const matches = entries.filter(entry => (!category || entry.category === category) &&
      `${entry.title} ${entry.description} ${entry.source} ${entry.category} ${entry.contentType} ${entry.tags.join(' ')}`.toLocaleLowerCase().includes(query));
    matches.sort((a, b) => order === 'title'
      ? a.title.localeCompare(b.title)
      : order === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
    const months = new Map<string, HTMLElement>();
    for (const entry of matches) {
      const month = entry.date.slice(0, 7);
      let section = months.get(month);
      if (!section) {
        section = document.createElement('section');
        section.className = 'log-month';
        const heading = document.createElement('h2');
        heading.textContent = new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        section.append(heading);
        months.set(month, section);
      }
      section.append(row(entry));
    }
    results.replaceChildren(...months.values());
    if (empty) empty.hidden = matches.length > 0;
    if (pagination) pagination.hidden = true;
  } catch {
    if (current !== revision) return;
    if (empty) { empty.textContent = 'Search is temporarily unavailable. Please try again.'; empty.hidden = false; }
  }
}

search?.addEventListener('input', update);
sort?.addEventListener('change', update);
