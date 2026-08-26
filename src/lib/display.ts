const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function recentLog<T extends { data: { date: Date } }>(entries: T[], limit: number): T[] {
  return [...entries]
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, limit);
}

export function liveFields(
  input: { shipping?: string | null; watching?: string | null; lastLog?: string | null },
): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  if (input.shipping) rows.push({ label: 'Shipping', value: input.shipping });
  if (input.watching) rows.push({ label: 'Watching', value: input.watching });
  if (input.lastLog) rows.push({ label: 'Last log', value: input.lastLog });
  return rows;
}
