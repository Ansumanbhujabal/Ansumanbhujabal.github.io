const search = document.querySelector<HTMLInputElement>('[data-log-search]');
const sort = document.querySelector<HTMLSelectElement>('[data-log-sort]');
const results = document.querySelector<HTMLElement>('[data-log-results]');
const empty = document.querySelector<HTMLElement>('[data-log-empty]');

function update() {
  if (!results) return;
  const query = search?.value.trim().toLowerCase() ?? '';
  const rows = [...results.querySelectorAll<HTMLElement>('[data-log-row]')];
  for (const row of rows) row.hidden = Boolean(query) && !(row.dataset.search ?? '').includes(query);
  const visible = rows.filter(row => !row.hidden);
  if (sort?.value === 'oldest') visible.reverse();
  if (sort?.value === 'title') visible.sort((a, b) => (a.querySelector('h2')?.textContent ?? '').localeCompare(b.querySelector('h2')?.textContent ?? ''));
  for (const row of visible) results.append(row);
  if (empty) empty.hidden = visible.length > 0;
}

search?.addEventListener('input', update);
sort?.addEventListener('change', update);
