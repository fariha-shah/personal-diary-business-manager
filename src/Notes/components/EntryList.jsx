import { format, parseISO, isValid } from 'date-fns';
import { FiBookOpen } from 'react-icons/fi';

import EmptyState from '../../components/common/EmptyState';
import { groupEntriesByDate } from '../utils/groupByDate';
function safeFormat(dateString, fallback, pattern) {
  if (!dateString) return fallback;
  const parsed = parseISO(dateString);
  return isValid(parsed) ? format(parsed, pattern) : fallback;
}

export default function EntryList({ entries, activeEntryId, onSelect }) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={FiBookOpen}
        message="Your diary is empty"
        subMessage="Create your first entry and start capturing your memories."
      />
    );
  }

  const groups = groupEntriesByDate(entries);

  return (
    <div>
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {group.label}
          </p>

          <div className="px-2 pb-2">
            {group.entries.map((entry) => {
              const preview =
                entry.content?.trim().slice(0, 70) || 'No content yet';

              const isActive = entry.id === activeEntryId;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelect(entry.id)}
                  className={`
                    group
                    relative
                    mb-1
                    w-full
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    transition-all
                    duration-200
                    ${isActive ? 'bg-purple-50 shadow-sm' : 'hover:bg-slate-50'}
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-purple-500" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Date Circle */}
                    <div
                      className={`
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-lg
                        text-xs font-semibold
                        ${
                          isActive
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-slate-100 text-slate-400'
                        }
                      `}
                    >
                    {safeFormat(entry.date, '—', 'dd')}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`
                          truncate
                          text-sm
                          font-medium
                          ${isActive ? 'text-purple-700' : 'text-slate-700'}
                        `}
                      >
                        {entry.title || 'Untitled'}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {preview}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-300">
                        {safeFormat(entry.createdAt, '', 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
