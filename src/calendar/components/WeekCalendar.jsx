import { addDays, format, isSameDay, startOfWeek } from 'date-fns';

import Card from '../../components/common/Card';
import { getEventColor } from '../services/eventColors';

const HOURS = Array.from({ length: 24 }, (_, index) => index);

export default function WeekCalendar({
  currentDate,
  selectedDate,
  events = [],
  onSelectDate,
  onEventClick,
}) {
  const weekStart = startOfWeek(currentDate, {
    weekStartsOn: 0,
  });

  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index)
  );

  const getEventsForDate = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');

    return events.filter((event) => event.date === dateString);
  };

  return (
    <Card
      padding="p-0"
      className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"
    >
      {/* Week header */}
      <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-violet-100 bg-violet-50/60">
        <div className="border-r border-violet-100" />

        {weekDays.map((day) => {
          const today = isSameDay(day, new Date());
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className="border-r border-violet-100 px-1 py-1.5 text-center last:border-r-0"
            >
              <p className="text-[8px] font-semibold uppercase tracking-wide text-violet-400">
                {format(day, 'EEE')}
              </p>

              <span
                className={`
                  mx-auto mt-0.5 flex h-5 w-5 items-center justify-center
                  rounded-full text-[9px] font-semibold
                  ${
                    today
                      ? 'bg-violet-600 text-white'
                      : selected
                        ? 'bg-violet-100 text-violet-600'
                        : 'text-slate-600'
                  }
                `}
              >
                {format(day, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Week body */}
      <div className="max-h-[620px] overflow-auto">
        <div className="grid min-w-[700px] grid-cols-[52px_repeat(7,minmax(0,1fr))]">
          {/* Time column */}
          <div className="border-r border-violet-100">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-10 border-b border-violet-50 px-1 pt-0.5 text-[8px] text-slate-400"
              >
                {format(new Date(2020, 0, 1, hour), 'h a')}
              </div>
            ))}
          </div>

          {/* Days */}
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(day);

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-violet-100 last:border-r-0"
              >
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      const clickedDate = new Date(day);
                      clickedDate.setHours(hour, 0, 0, 0);

                      onSelectDate(clickedDate);
                    }}
                    className="block h-10 w-full border-b border-violet-50 transition-colors hover:bg-violet-50/40"
                    aria-label={`${format(day, 'EEEE')} ${hour}:00`}
                  />
                ))}

                {/* Events */}
                <div className="pointer-events-none absolute inset-x-1 top-0">
                  {dayEvents.map((event) => {
                    const color = getEventColor(event.color);

                    const startHour = event.startTime
                      ? Number(event.startTime.split(':')[0])
                      : 0;

                    const startMinutes = event.startTime
                      ? Number(event.startTime.split(':')[1] || 0)
                      : 0;

                    const endHour = event.endTime
                      ? Number(event.endTime.split(':')[0])
                      : startHour + 1;

                    const endMinutes = event.endTime
                      ? Number(event.endTime.split(':')[1] || 0)
                      : startMinutes;

                    const start = startHour * 60 + startMinutes;

                    const end = endHour * 60 + endMinutes;

                    const duration = Math.max(end - start, 30);

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onEventClick(event)}
                        className={`
                          pointer-events-auto absolute left-0 right-0
                          overflow-hidden rounded-md border
                          px-1.5 py-1 text-left
                          ${color.bg}
                          ${color.border}
                          ${color.text}
                        `}
                        style={{
                          top: `${(start / 60) * 40}px`,
                          minHeight: `${Math.max((duration / 60) * 40, 22)}px`,
                        }}
                      >
                        <p className="truncate text-[8px] font-semibold sm:text-[9px]">
                          {event.title}
                        </p>

                        {event.startTime && (
                          <p className="truncate text-[7px] opacity-75 sm:text-[8px]">
                            {event.startTime}
                            {event.endTime ? ` - ${event.endTime}` : ''}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
