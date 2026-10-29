import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import Card from '../../components/common/Card';
import { getEventColor } from '../services/eventColors';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCalendarDays(currentDate) {
  const start = startOfWeek(startOfMonth(currentDate), {
    weekStartsOn: 0,
  });

  const end = endOfWeek(endOfMonth(currentDate), {
    weekStartsOn: 0,
  });

  const days = [];
  let day = start;

  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }

  return days;
}

export default function MonthCalendar({
  currentDate,
  selectedDate,
  events = [],
  holidays = [],
  diaryDates = new Set(),
  onSelectDate,
}) {
  const calendarDays = getCalendarDays(currentDate);

  const getItemsForDate = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');

    return [
      ...holidays.filter((holiday) => holiday.date === dateString),
      ...events.filter((event) => event.date === dateString),
    ];
  };

  return (
    <Card
      padding="p-0"
      className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"
    >
      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b border-violet-100 bg-violet-50/60">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="border-r border-violet-100 px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-violet-400 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');

          const items = getItemsForDate(day);

          const currentMonth = isSameMonth(day, currentDate);

          const selected = selectedDate ? isSameDay(day, selectedDate) : false;

          const today = isSameDay(day, new Date());

          const hasDiaryEntry = diaryDates.has(dateString);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`
                group relative min-h-[46px]
                border-b border-r border-violet-100
                bg-white p-1 text-left
                transition-all duration-200
                last:border-r-0
                hover:bg-violet-50/50
                sm:min-h-[58px] sm:p-1.5
                ${!currentMonth ? 'bg-slate-50/70' : ''}
                ${selected ? 'bg-violet-50/70' : ''}
              `}
            >
              {/* Date header */}
              <div className="flex items-center justify-between">
                <span
                  className={`
                    flex h-4 w-4 items-center justify-center
                    rounded-full text-[9px] font-semibold
                    transition-all duration-200
                    sm:h-5 sm:w-5 sm:text-[10px]
                    ${
                      today
                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-300'
                        : selected
                          ? 'bg-violet-100 text-violet-600 ring-1 ring-violet-200'
                          : currentMonth
                            ? 'text-slate-700 group-hover:text-violet-600'
                            : 'text-slate-300'
                    }
                  `}
                >
                  {format(day, 'd')}
                </span>

                {hasDiaryEntry && (
                  <span
                    title="Diary entry available"
                    className="h-1.5 w-1.5 rounded-full bg-violet-500 ring-2 ring-violet-100"
                  />
                )}
              </div>

              {/* Events */}
              <div className="mt-0.5 space-y-0.5">
                {items.slice(0, 2).map((item) => {
                  const holiday = item.type === 'holiday';
                  const color = getEventColor(item.color);

                  return (
                    <div
                      key={item.id}
                      title={item.title}
                      className={`
                        truncate rounded-md border px-1 py-0.5
                        text-[8px] font-medium leading-none
                        transition-all duration-200
                        sm:text-[9px]
                        ${
                          holiday
                            ? 'border-red-100 bg-red-50 text-red-500'
                            : `${color.border} ${color.bg} ${color.text}`
                        }
                      `}
                    >
                      {item.startTime ? `${item.startTime} · ` : ''}
                      {item.title}
                    </div>
                  );
                })}

                {items.length > 2 && (
                  <span className="block px-0.5 text-[8px] font-medium text-slate-400">
                    +{items.length - 2} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
