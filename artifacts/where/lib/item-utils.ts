import type { SavedItem } from '@/types/item';

const dateOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

export function parseRememberStatement(
  statement: string,
): { objectName: string; location: string } | null {
  const cleaned = statement.trim().replace(/\s+/g, ' ');
  const match = cleaned.match(
    /^(?:i\s+)?(?:put|placed|left|kept|stored|stashed)\s+(?:(?:my|the|a|an)\s+)?(.+?)\s+(?:in|inside|into|on|at|under|behind|beside|near)\s+(.+?)[.!?]*$/i,
  );

  if (!match?.[1] || !match[2]) return null;

  const objectName = match[1].trim().replace(/[.!?]+$/, '');
  const location = match[2].trim().replace(/[.!?]+$/, '');
  if (!objectName || !location) return null;

  return { objectName, location };
}

export function getSearchTerms(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[?!.,]+$/g, '')
    .replace(
      /^(?:where(?:'s| is| are| did i put| did i leave| did i keep)|find|locate)\s+(?:(?:my|the|a|an)\s+)?/i,
      '',
    )
    .trim();
}

export function getLatestMatches(
  items: SavedItem[],
  input: string,
): SavedItem[] {
  const terms = getSearchTerms(input);
  const sorted = [...items].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
  const matches = terms
    ? sorted.filter((item) =>
        [item.objectName, item.location, item.note ?? '']
          .join(' ')
          .toLowerCase()
          .includes(terms),
      )
    : sorted;

  const newestByObject = new Map<string, SavedItem>();
  for (const item of matches) {
    const key = item.objectName.trim().toLowerCase();
    if (!newestByObject.has(key)) newestByObject.set(key, item);
  }
  return [...newestByObject.values()];
}

export function formatRelativeDate(isoDate: string): string {
  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) return 'Recently saved';

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(isoDate: string): string {
  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) return 'Date unavailable';
  return new Date(timestamp).toLocaleString(undefined, dateOptions);
}
