import { isToday, isYesterday, parseISO, isValid, format } from 'date-fns';

/**
 * utils/groupByDate.js
 *
 * Groups diary entries into labeled sections — "Today", "Yesterday", then
 * formatted dates ("July 28, 2026") — newest first. Used by EntryList to
 * render the notepad-style grouped sidebar.
 */
export function groupEntriesByDate(entries) {
  // Fall back to today's date for any entry missing/with an invalid date,
  // so one bad record (e.g. created manually in Firestore Console without
  // a date field) never crashes the whole page.
  const safeEntries = entries.map((entry) => {
    const parsed = entry.date ? parseISO(entry.date) : null;
    if (parsed && isValid(parsed)) return entry;

    return {
      ...entry,
      date: new Date().toISOString().slice(0, 10),
    };
  });

  // Newest first: by date, then by creation time within the same date
  const sorted = [...safeEntries].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const groups = [];
  const groupMap = new Map();

  sorted.forEach((entry) => {
    const dateObj = parseISO(entry.date);
    let label;
    if (isToday(dateObj)) label = 'Today';
    else if (isYesterday(dateObj)) label = 'Yesterday';
    else label = format(dateObj, 'MMMM d, yyyy');

    if (!groupMap.has(label)) {
      const group = { label, entries: [] };
      groupMap.set(label, group);
      groups.push(group);
    }
    groupMap.get(label).entries.push(entry);
  });

  return groups;
}