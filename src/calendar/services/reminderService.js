export const REMINDER_OPTIONS = [
  {
    value: 0,
    label: 'No reminder',
  },
  {
    value: 5,
    label: '5 minutes before',
  },
  {
    value: 10,
    label: '10 minutes before',
  },
  {
    value: 15,
    label: '15 minutes before',
  },
  {
    value: 30,
    label: '30 minutes before',
  },
  {
    value: 60,
    label: '1 hour before',
  },
  {
    value: 1440,
    label: '1 day before',
  },
];

export function getReminderTime(event) {
  if (!event?.date || !event?.startTime) {
    return null;
  }

  const [hours, minutes] = event.startTime.split(':').map(Number);

  const eventDate = new Date(
    `${event.date}T${String(hours).padStart(
      2,
      '0'
    )}:${String(minutes).padStart(2, '0')}:00`
  );

  const reminderMinutes = Number(event.reminder || 0);

  if (!reminderMinutes) {
    return null;
  }

  return new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);
}

export function isReminderDue(event) {
  const reminderTime = getReminderTime(event);

  if (!reminderTime) {
    return false;
  }

  const now = new Date();

  return (
    reminderTime <= now && now.getTime() - reminderTime.getTime() < 60 * 1000
  );
}

export function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('unsupported');
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }

  if (Notification.permission === 'denied') {
    return Promise.resolve('denied');
  }

  return Notification.requestPermission();
}

export function showEventNotification(event) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  new Notification(event.title, {
    body:
      event.description ||
      `Your event starts at ${event.startTime || 'the scheduled time'}.`,
  });
}
