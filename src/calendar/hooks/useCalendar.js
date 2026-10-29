import { useCallback, useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

import { getRandomEventColor } from '../services/eventColors';

export default function useCalendar() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const eventsRef = collection(db, 'users', uid, 'calendarEvents');
    const q = query(eventsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setEvents(
          snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id, // real Firestore id always wins
          }))
        );
        setIsLoading(false);
      },
      (err) => {
        console.error('Failed to load calendar events from Firestore:', err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addEvent = useCallback((event) => {
    const uid = auth.currentUser?.uid;

    const newEvent = {
      type: 'event',
      ...event,
      color: event.color || getRandomEventColor(),
      createdAt: new Date().toISOString(),
    };

    addDoc(collection(db, 'users', uid, 'calendarEvents'), newEvent).catch(
      (err) => console.error('Failed to add calendar event:', err)
    );

    return newEvent;
  }, []);

  const updateEvent = useCallback((eventId, updates) => {
    const uid = auth.currentUser?.uid;

    updateDoc(doc(db, 'users', uid, 'calendarEvents', eventId), updates).catch(
      (err) => console.error('Failed to update calendar event:', err)
    );
  }, []);

  const deleteEvent = useCallback((eventId) => {
    const uid = auth.currentUser?.uid;

    deleteDoc(doc(db, 'users', uid, 'calendarEvents', eventId)).catch((err) =>
      console.error('Failed to delete calendar event:', err)
    );
  }, []);

  return {
    events,
    holidays: [],
    addEvent,
    updateEvent,
    deleteEvent,
    loadHolidays: async () => {},
    isLoadingHolidays: false,
    holidayError: '',
    isLoading,
  };
}