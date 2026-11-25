export function trimDescription(value: string, maxWords = 22, maxCharacters = 150): string {
  const words = value.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  let result = '';
  for (const word of words.slice(0, maxWords)) {
    const candidate = result ? `${result} ${word}` : word;
    if ([...candidate].length > maxCharacters) break;
    result = candidate;
  }
  return result || [...(words[0] ?? '')].slice(0, maxCharacters).join('');
}
