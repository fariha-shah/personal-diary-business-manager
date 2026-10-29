import { db, auth } from '../../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = collection(db, 'users', uid, 'expenses');

    const unsub = onSnapshot(ref, (snap) => {
      setExpenses(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return unsub;
  }, []);

  const addExpense = (expense) => {
    const uid = auth.currentUser?.uid;
    return addDoc(collection(db, 'users', uid, 'expenses'), expense);
  };

  const updateExpense = (id, updates) => {
    const uid = auth.currentUser?.uid;
    return updateDoc(doc(db, 'users', uid, 'expenses', id), updates);
  };

  const deleteExpense = (id) => {
    const uid = auth.currentUser?.uid;
    return deleteDoc(doc(db, 'users', uid, 'expenses', id));
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}