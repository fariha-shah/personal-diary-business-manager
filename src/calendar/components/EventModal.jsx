import { useEffect, useState } from 'react';
import { FiBell, FiCalendar, FiClock, FiFileText, FiX } from 'react-icons/fi';

import Button from '../../components/common/Button';
import { EVENT_COLORS } from '../services/eventColors';
import {
  REMINDER_OPTIONS,
  requestNotificationPermission,
} from '../services/reminderService';

const EMPTY_FORM = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  color: 'purple',
  reminder: 0,
};

export default function EventModal({
  isOpen,
  onClose,
  selectedDate,
  editingEvent,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;

    if (editingEvent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing form with which event/date was just opened, not derivable during render since the modal stays mounted between opens
      setForm({
        title: editingEvent.title || '',
        date: editingEvent.date || selectedDate || '',
        startTime: editingEvent.startTime || '',
        endTime: editingEvent.endTime || '',
        description: editingEvent.description || '',
        color: editingEvent.color || 'purple',
        reminder:
          editingEvent.reminder !== undefined ? editingEvent.reminder : 0,
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        date: selectedDate || '',
      });
    }
  }, [isOpen, editingEvent, selectedDate]);
  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleReminderChange = (event) => {
    const { value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      reminder: value,
    }));

    // Ask for browser notification permission right here, triggered by the
    // user's own click — browsers reliably show the permission prompt only
    // when it's requested from a genuine user gesture like this, not from
    // a passive effect on page load.
    if (Number(value) > 0) {
      requestNotificationPermission();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.date) {
      return;
    }

    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      reminder: Number(form.reminder) || 0,
    });
  };

  const isEditing = Boolean(editingEvent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-violet-100 px-5 py-4">
          <div>
            <h2
              id="event-modal-title"
              className="text-base font-semibold text-slate-800"
            >
              {isEditing ? 'Edit Event' : 'Add Event'}
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {isEditing
                ? 'Update your event details.'
                : 'Create a new calendar event.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-violet-50 hover:text-violet-600"
            aria-label="Close"
          >
            <FiX size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {/* Title */}
            <div>
              <label
                htmlFor="event-title"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Title
              </label>

              <div className="relative">
                <FiFileText
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="event-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Team meeting"
                  autoFocus
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="event-date"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Date
              </label>

              <div className="relative">
                <FiCalendar
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="event-date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="event-start-time"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Start Time
                </label>

                <div className="relative">
                  <FiClock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="event-start-time"
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-2 text-sm text-slate-700 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-end-time"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  End Time
                </label>

                <div className="relative">
                  <FiClock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="event-end-time"
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-2 text-sm text-slate-700 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>
            </div>

            {/* Reminder */}
            <div>
              <label
                htmlFor="event-reminder"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Reminder
              </label>

              <div className="relative">
                <FiBell
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="event-reminder"
                  name="reminder"
                  value={form.reminder}
                  onChange={handleReminderChange}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  {REMINDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {Number(form.reminder) > 0 && !form.startTime && (
                <p className="mt-1.5 text-[11px] text-amber-600">
                  Add a start time above so this reminder has something to count
                  down to.
                </p>
              )}
            </div>

            {/* Color */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-600">
                Event Color
              </p>

              <div className="flex flex-wrap gap-2">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        color: color.id,
                      }))
                    }
                    className={`
                    flex items-center gap-2 rounded-lg border px-2.5 py-1.5
                    text-[10px] font-medium transition-all
                    ${
                      form.color === color.id
                        ? `${color.bg} ${color.border} ${color.text} ring-2 ring-violet-100`
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }
                  `}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />

                    {color.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="event-description"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Description
              </label>

              <textarea
                id="event-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Add any additional details..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit" size="sm">
              {isEditing ? 'Save Changes' : 'Add Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
