import { useState, useEffect } from 'react';
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

export function useFollowUps() {
  const [followups, setFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const followupsRef = collection(db, 'users', uid, 'followups');
    const q = query(followupsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setFollowups(
          snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          }))
        );
        setIsLoading(false);
      },
      (err) => {
        console.error('Failed to load follow-ups from Firestore:', err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addFollowUp = async (data) => {
    const uid = auth.currentUser?.uid;
    const safeData = { ...data };
    delete safeData.id;

    await addDoc(collection(db, 'users', uid, 'followups'), {
      ...safeData,
      createdAt: new Date().toISOString(),
    });
  };

  const updateFollowUp = async (id, updates) => {
    const uid = auth.currentUser?.uid;
    const safeUpdates = { ...updates };
    delete safeUpdates.id;

    await updateDoc(doc(db, 'users', uid, 'followups', id), safeUpdates);
  };

  const deleteFollowUpById = async (id) => {
    const uid = auth.currentUser?.uid;
    await deleteDoc(doc(db, 'users', uid, 'followups', id));
  };

  return {
    followups,
    addFollowUp,
    updateFollowUp,
    deleteFollowUpById,
    isLoading,
  };
}