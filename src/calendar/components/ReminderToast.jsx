import { FiBell, FiX } from 'react-icons/fi';

export default function ReminderToast({ reminders = [], onDismiss, onView }) {
  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {reminders.map((item) => {
        const event = item.event;

        return (
          <div
            key={item.id}
            className="rounded-xl border border-violet-200 bg-white p-3 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <FiBell size={15} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-violet-500">
                      Reminder
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                      {event.title}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDismiss(item.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Dismiss reminder"
                  >
                    <FiX size={14} />
                  </button>
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  {event.date}
                  {event.startTime ? ` at ${event.startTime}` : ''}
                </p>

                {event.description && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                    {event.description}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => onView(event)}
                  className="mt-2 text-[11px] font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                >
                  View event
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
