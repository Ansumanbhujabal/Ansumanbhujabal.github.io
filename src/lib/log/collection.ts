import { getCollection } from 'astro:content';
import { toLogView } from './view';
import { sortLogs } from './query';

export async function loadLogViews() {
  return sortLogs((await getCollection('log')).map(toLogView));
}
