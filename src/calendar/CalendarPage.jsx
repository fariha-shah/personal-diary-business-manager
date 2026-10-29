import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMonths, format, subMonths } from 'date-fns';
import {
  FiBookOpen,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
} from 'react-icons/fi';

import useReminders from './hooks/useReminders';
import useCalendar from './hooks/useCalendar';

import MonthCalendar from './components/MonthCalendar';
import WeekCalendar from './components/WeekCalendar';
import DayCalendar from './components/DayCalendar';
import EventModal from './components/EventModal';
import EventDetailsModal from './components/EventDetailsModal';
import ReminderToast from './components/ReminderToast';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import ConfirmDialog from '../components/common/ConfirmDialog';

import { useDiary } from '../Notes/hooks/useDiary';

const CALENDAR_VIEWS = [
  {
    label: 'Month',
    value: 'month',
  },
  {
    label: 'Week',
    value: 'week',
  },
  {
    label: 'Day',
    value: 'day',
  },
];

export default function CalendarPage({ onOpenDiaryEntry }) {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [calendarView, setCalendarView] = useState('month');

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);

  const [viewingEvent, setViewingEvent] = useState(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [reminderPopups, setReminderPopups] = useState([]);

  const { events, addEvent, updateEvent, deleteEvent } = useCalendar();

  const { entries: diaryEntries } = useDiary();

  /*
   * Reminder handling
   */
  const handleReminderDue = useCallback((event) => {
    setReminderPopups((current) => [
      ...current,
      {
        id: `${event.id}-${Date.now()}`,
        event,
      },
    ]);
  }, []);

  useReminders(events, handleReminderDue);

  const handleDismissReminder = (id) => {
    setReminderPopups((current) => current.filter((item) => item.id !== id));
  };

  const handleViewReminder = (event) => {
    setViewingEvent(event);

    setReminderPopups((current) =>
      current.filter((item) => item.event.id !== event.id)
    );
  };

  /*
   * Selected date data
   */
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  const selectedDayEvents = useMemo(() => {
    return events.filter((event) => event.date === selectedDateString);
  }, [events, selectedDateString]);

  const selectedDayDiaryEntries = useMemo(() => {
    return diaryEntries.filter((entry) => entry.date === selectedDateString);
  }, [diaryEntries, selectedDateString]);

  const diaryDates = useMemo(() => {
    return new Set(
      diaryEntries.filter((entry) => entry.date).map((entry) => entry.date)
    );
  }, [diaryEntries]);

  /*
   * Date selection
   */
  const handleSelectDate = (date) => {
    setSelectedDate(date);

    if (
      date.getMonth() !== currentDate.getMonth() ||
      date.getFullYear() !== currentDate.getFullYear()
    ) {
      setCurrentDate(date);
    }
  };

  /*
   * Previous / next navigation
   */
  const handlePrevious = () => {
    if (calendarView === 'month') {
      setCurrentDate((date) => subMonths(date, 1));

      return;
    }

    if (calendarView === 'week') {
      setSelectedDate((date) => {
        const nextDate = new Date(date);

        nextDate.setDate(nextDate.getDate() - 7);

        setCurrentDate(nextDate);

        return nextDate;
      });

      return;
    }

    const nextDate = new Date(selectedDate);

    nextDate.setDate(nextDate.getDate() - 1);

    setSelectedDate(nextDate);
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    if (calendarView === 'month') {
      setCurrentDate((date) => addMonths(date, 1));

      return;
    }

    if (calendarView === 'week') {
      setSelectedDate((date) => {
        const nextDate = new Date(date);

        nextDate.setDate(nextDate.getDate() + 7);

        setCurrentDate(nextDate);

        return nextDate;
      });

      return;
    }

    const nextDate = new Date(selectedDate);

    nextDate.setDate(nextDate.getDate() + 1);

    setSelectedDate(nextDate);
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDate(today);
  };

  /*
   * Event modal
   */
  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (formData) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      addEvent(formData);
    }

    handleCloseEventModal();
  };

  /*
   * Event details
   */
  const handleOpenEventDetails = (event) => {
    setViewingEvent(event);
  };

  const handleCloseEventDetails = () => {
    setViewingEvent(null);
  };

  const handleEditEvent = () => {
    if (!viewingEvent) {
      return;
    }

    setEditingEvent(viewingEvent);
    setViewingEvent(null);
    setIsEventModalOpen(true);
  };

  /*
   * Delete event
   */
  const handleDeleteEvent = () => {
    if (!viewingEvent) {
      return;
    }

    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteEvent = () => {
    if (!viewingEvent) {
      return;
    }

    deleteEvent(viewingEvent.id);

    setViewingEvent(null);
    setIsDeleteConfirmOpen(false);
  };

  /*
   * Diary
   */
  const handleOpenDiaryEntry = (entryId) => {
    if (!entryId) {
      return;
    }

    if (onOpenDiaryEntry) {
      onOpenDiaryEntry(entryId);
      return;
    }

    navigate('/notes', { state: { entryToOpen: entryId } });
  };

  /*
   * Calendar title
   */
  const getViewTitle = () => {
    if (calendarView === 'month') {
      return format(currentDate, 'MMMM yyyy');
    }

    if (calendarView === 'week') {
      return 'This Week';
    }

    return format(selectedDate, 'dd MMMM yyyy');
  };

  return (
    // -m-6 cancels MainLayout's p-6 padding and px-8 py-6 re-adds it here —
    // same trick used by Notes.jsx / Calculator.jsx / PersonalExpenses.jsx
    // so this page gets its own light background instead of the dark
    // shell background showing through.
    <div className="-m-6 min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 animate-[fadeIn_0.35s_ease-out]">
      <div className="mx-auto w-full max-w-6xl">
        {/* Reminder notifications */}
        <ReminderToast
          reminders={reminderPopups}
          onDismiss={handleDismissReminder}
          onView={handleViewReminder}
        />

        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <FiCalendar size={18} />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-text-primary sm:text-xl">
                Calendar
              </h1>

              <p className="mt-0.5 text-xs text-text-secondary">
                Manage your events and important dates.
              </p>
            </div>
          </div>

          <Button size="sm" icon={FiPlus} onClick={handleAddEvent}>
            Add Event
          </Button>
        </div>

        {/* Calendar views */}
        <div className="mb-2.5">
          <Tabs
            tabs={CALENDAR_VIEWS}
            active={calendarView}
            onChange={setCalendarView}
          />
        </div>

        {/* Toolbar */}
        <Card padding="p-2.5" className="mb-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-violet-50 hover:text-violet-600"
                aria-label="Previous"
              >
                <FiChevronLeft size={16} />
              </button>

              <h2 className="min-w-[130px] text-center text-sm font-semibold text-text-primary">
                {getViewTitle()}
              </h2>

              <button
                type="button"
                onClick={handleNext}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-violet-50 hover:text-violet-600"
                aria-label="Next"
              >
                <FiChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <Button variant="secondary" size="sm" onClick={handleToday}>
                Today
              </Button>

              <span className="text-[11px] text-text-muted">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </span>
            </div>
          </div>
        </Card>

        {/* Calendar views */}
        {calendarView === 'month' && (
          <MonthCalendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            holidays={[]}
            diaryDates={diaryDates}
            onSelectDate={handleSelectDate}
          />
        )}

        {calendarView === 'week' && (
          <WeekCalendar
            currentDate={selectedDate}
            selectedDate={selectedDate}
            events={events}
            onSelectDate={handleSelectDate}
            onEventClick={handleOpenEventDetails}
          />
        )}

        {calendarView === 'day' && (
          <DayCalendar
            selectedDate={selectedDate}
            events={events}
            onEventClick={handleOpenEventDetails}
          />
        )}

        {/* Selected date */}
        <Card padding="p-3.5" className="mt-2.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                Selected Date
              </p>

              <h3 className="mt-0.5 text-sm font-semibold text-text-primary">
                {format(selectedDate, 'EEEE, dd MMMM yyyy')}
              </h3>
            </div>

            <Button size="sm" icon={FiPlus} onClick={handleAddEvent}>
              Add Event
            </Button>
          </div>

          {/* Events */}
          {selectedDayEvents.length > 0 ? (
            <div className="mt-3 space-y-2">
              {selectedDayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleOpenEventDetails(event)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-navy-700 bg-navy-900/50 px-3 py-2.5 text-left transition-colors hover:border-violet-400/40 hover:bg-navy-900"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {event.title}
                    </p>

                    {(event.startTime || event.endTime) && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        {event.startTime || '--'}
                        {event.endTime ? ` - ${event.endTime}` : ''}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs font-medium text-violet-500">
                    View
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-navy-700 px-4 py-4 text-center">
              <p className="text-xs text-text-muted">
                No events for this date.
              </p>

              <button
                type="button"
                onClick={handleAddEvent}
                className="mt-1 text-xs font-medium text-violet-500 hover:underline"
              >
                Add an event
              </button>
            </div>
          )}

          {/* Diary entries */}
          <div className="mt-4 border-t border-navy-700 pt-4">
            <div className="flex items-center gap-2">
              <FiBookOpen size={15} className="text-violet-500" />

              <h3 className="text-sm font-semibold text-text-primary">Diary</h3>

              {selectedDayDiaryEntries.length > 0 && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                  {selectedDayDiaryEntries.length}
                </span>
              )}
            </div>

            {selectedDayDiaryEntries.length > 0 ? (
              <div className="mt-3 space-y-2">
                {selectedDayDiaryEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleOpenDiaryEntry(entry.id)}
                    className="group w-full rounded-lg border border-navy-700 bg-navy-900/40 px-3 py-2.5 text-left transition-colors hover:border-violet-400/40 hover:bg-navy-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {entry.title || 'Untitled Entry'}
                        </p>

                        {entry.content && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">
                            {entry.content}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-[10px] font-medium text-violet-500 opacity-70 transition-opacity group-hover:opacity-100">
                        Open →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-navy-700 px-4 py-4 text-center">
                <p className="text-xs text-text-muted">
                  No diary entry for this date.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Add / Edit event */}
        <EventModal
          isOpen={isEventModalOpen}
          onClose={handleCloseEventModal}
          selectedDate={selectedDateString}
          editingEvent={editingEvent}
          onSave={handleSaveEvent}
        />

        {/* Event details */}
        <EventDetailsModal
          isOpen={Boolean(viewingEvent) && !isDeleteConfirmOpen}
          onClose={handleCloseEventDetails}
          event={viewingEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />

        {/* Delete confirmation */}
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDeleteEvent}
          title="Delete this event?"
          message={
            viewingEvent
              ? `"${viewingEvent.title}" will be permanently removed.`
              : 'This event will be permanently removed.'
          }
        />
      </div>
    </div>
  );
}
