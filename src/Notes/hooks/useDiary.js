import { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

export function useDiary() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const entriesRef = collection(db, 'users', uid, 'diaryEntries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setEntries(
          snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          }))
        );
        setIsLoading(false);
      },
      (err) => {
        console.error('Failed to load diary entries from Firestore:', err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addEntry = (data) => {
    const uid = auth.currentUser?.uid;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newEntry = {
      title: '',
      content: '',
      date: now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
      ...data,
    };

    setDoc(doc(db, 'users', uid, 'diaryEntries', id), newEntry).catch((err) =>
      console.error('Failed to add diary entry:', err)
    );

    return id;
  };

  const updateEntry = (id, updates) => {
    const uid = auth.currentUser?.uid;
    updateDoc(doc(db, 'users', uid, 'diaryEntries', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    }).catch((err) => console.error('Failed to update diary entry:', err));
  };

  const deleteEntry = (id) => {
    const uid = auth.currentUser?.uid;
    deleteDoc(doc(db, 'users', uid, 'diaryEntries', id)).catch((err) =>
      console.error('Failed to delete diary entry:', err)
    );
  };

  return { entries, addEntry, updateEntry, deleteEntry, isLoading };
}