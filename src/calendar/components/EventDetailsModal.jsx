import {
  FiCalendar,
  FiClock,
  FiEdit2,
  FiFileText,
  FiTrash2,
} from 'react-icons/fi';

import { REMINDER_OPTIONS } from '../services/reminderService';

import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
}) {
  if (!event) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Event Details">
      <div className="space-y-4">
        {/* Event title */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Event
          </p>

          <h3 className="mt-1 text-lg font-semibold text-text-primary">
            {event.title}
          </h3>
        </div>

        {/* Date */}
        <div className="flex items-start gap-3 rounded-lg border border-navy-700 bg-navy-900/40 p-3">
          <FiCalendar size={17} className="mt-0.5 shrink-0 text-accent-blue" />

          <div>
            <p className="text-xs text-text-muted">Date</p>

            <p className="mt-0.5 text-sm text-text-primary">{event.date}</p>
          </div>
        </div>

        {/* Time */}
        {(event.startTime || event.endTime) && (
          <div className="flex items-start gap-3 rounded-lg border border-navy-700 bg-navy-900/40 p-3">
            <FiClock size={17} className="mt-0.5 shrink-0 text-accent-blue" />

            <div>
              <p className="text-xs text-text-muted">Time</p>

              <p className="mt-0.5 text-sm text-text-primary">
                {event.startTime || '--'}
                {event.endTime ? ` - ${event.endTime}` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Reminder */}
        {event.reminder > 0 && (
          <div className="rounded-lg border border-navy-700 bg-navy-900/40 p-3">
            <p className="text-xs text-text-muted">Reminder</p>

            <p className="mt-0.5 text-sm text-text-primary">
              {
                REMINDER_OPTIONS.find(
                  (option) => Number(option.value) === Number(event.reminder)
                )?.label
              }
            </p>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="flex items-start gap-3 rounded-lg border border-navy-700 bg-navy-900/40 p-3">
            <FiFileText
              size={17}
              className="mt-0.5 shrink-0 text-accent-blue"
            />

            <div>
              <p className="text-xs text-text-muted">Description</p>

              <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-text-secondary">
                {event.description}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-navy-700 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="danger"
            icon={FiTrash2}
            onClick={onDelete}
          >
            Delete
          </Button>

          <Button type="button" icon={FiEdit2} onClick={onEdit}>
            Edit Event
          </Button>
        </div>
      </div>
    </Modal>
  );
}
