import { format, isSameDay } from 'date-fns';

import Card from '../../components/common/Card';
import { getEventColor } from '../services/eventColors';

const HOURS = Array.from({ length: 24 }, (_, index) => index);

export default function DayCalendar({
  selectedDate,
  events = [],
  onEventClick,
}) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const dayEvents = events.filter((event) => event.date === dateString);

  const getEventPosition = (event) => {
    const startParts = event.startTime
      ? event.startTime.split(':')
      : ['00', '00'];

    const endParts = event.endTime ? event.endTime.split(':') : null;

    const startHour = Number(startParts[0]) || 0;
    const startMinutes = Number(startParts[1]) || 0;

    const start = startHour * 60 + startMinutes;

    let end = start + 60;

    if (endParts) {
      const endHour = Number(endParts[0]) || 0;
      const endMinutes = Number(endParts[1]) || 0;

      end = endHour * 60 + endMinutes;

      if (end <= start) {
        end = start + 60;
      }
    }

    return {
      top: `${(start / 60) * 40}px`,
      height: `${Math.max(((end - start) / 60) * 40, 22)}px`,
    };
  };

  return (
    <Card
      padding="p-0"
      className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"
    >
      {/* Day header */}
      <div className="border-b border-violet-100 bg-violet-50/60 px-3 py-2">
        <div className="flex items-center gap-3">
          <div
            className={`
              flex h-8 w-8 items-center justify-center
              rounded-full text-sm font-semibold
              ${
                isSameDay(selectedDate, new Date())
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-100 text-violet-600'
              }
            `}
          >
            {format(selectedDate, 'd')}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">
              {format(selectedDate, 'EEEE')}
            </p>

            <p className="text-[10px] text-slate-400">
              {format(selectedDate, 'MMMM yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Day timeline */}
      <div className="max-h-[620px] overflow-auto">
        <div className="grid min-w-[500px] grid-cols-[60px_1fr]">
          {/* Time column */}
          <div className="border-r border-violet-100">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-10 border-b border-violet-50 px-2 pt-0.5 text-[9px] text-slate-400"
              >
                {format(new Date(2020, 0, 1, hour), 'h a')}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="h-10 border-b border-violet-50" />
            ))}

            {/* Events */}
            <div className="pointer-events-none absolute inset-0">
              {dayEvents.map((event) => {
                const color = getEventColor(event.color);
                const position = getEventPosition(event);

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventClick(event)}
                    className={`
                      pointer-events-auto absolute left-2 right-2
                      overflow-hidden rounded-lg border
                      px-3 py-2 text-left
                      transition-shadow hover:shadow-sm
                      ${color.bg}
                      ${color.border}
                      ${color.text}
                    `}
                    style={{
                      top: position.top,
                      minHeight: position.height,
                    }}
                  >
                    <p className="truncate text-xs font-semibold">
                      {event.title}
                    </p>

                    {event.startTime && (
                      <p className="mt-0.5 text-[10px] opacity-75">
                        {event.startTime}
                        {event.endTime ? ` - ${event.endTime}` : ''}
                      </p>
                    )}

                    {event.description && (
                      <p className="mt-1 line-clamp-2 text-[10px] opacity-75">
                        {event.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {dayEvents.length === 0 && (
        <div className="border-t border-violet-100 px-4 py-3 text-center">
          <p className="text-xs text-slate-400">
            No events scheduled for this day.
          </p>
        </div>
      )}
    </Card>
  );
}
