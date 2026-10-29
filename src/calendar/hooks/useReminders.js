import { useEffect, useRef } from 'react';

import {
  isReminderDue,
  requestNotificationPermission,
  showEventNotification,
} from '../services/reminderService';

export default function useReminders(events = [], onReminderDue) {
  const notifiedEvents = useRef(new Set());

  useEffect(() => {
    const reminderEvents = events.filter(
      (event) => Number(event.reminder || 0) > 0
    );

    if (reminderEvents.length === 0) {
      return undefined;
    }

    requestNotificationPermission();

    const checkReminders = () => {
      reminderEvents.forEach((event) => {
        const reminderKey = `${event.id}-${event.reminder}`;

        if (notifiedEvents.current.has(reminderKey) || !isReminderDue(event)) {
          return;
        }

        notifiedEvents.current.add(reminderKey);

        showEventNotification(event);

        if (onReminderDue) {
          onReminderDue(event);
        }
      });
    };

    checkReminders();

    const intervalId = window.setInterval(checkReminders, 30 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [events, onReminderDue]);

  useEffect(() => {
    const eventIds = new Set(
      events.map((event) => `${event.id}-${event.reminder}`)
    );

    notifiedEvents.current.forEach((key) => {
      if (!eventIds.has(key)) {
        notifiedEvents.current.delete(key);
      }
    });
  }, [events]);
}
