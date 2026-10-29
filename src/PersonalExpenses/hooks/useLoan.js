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

export function useLoan() {
  const [loanRecords, setLoanRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const loansRef = collection(db, 'users', uid, 'loans');
    const q = query(loansRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setLoanRecords(
          snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id, // real Firestore id always wins over any stored "id" field
          }))
        );
        setIsLoading(false);
      },
      (err) => {
        console.error('Failed to load loan records from Firestore:', err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addLoan = (data) => {
    const uid = auth.currentUser?.uid;
    const now = new Date().toISOString();

    addDoc(collection(db, 'users', uid, 'loans'), {
      createdAt: now,
      updatedAt: now,
      ...data,
    }).catch((err) => console.error('Failed to add loan record:', err));
  };

  const updateLoan = (id, updates) => {
    const uid = auth.currentUser?.uid;
    updateDoc(doc(db, 'users', uid, 'loans', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    }).catch((err) => console.error('Failed to update loan record:', err));
  };

  const deleteLoan = (id) => {
    const uid = auth.currentUser?.uid;
    deleteDoc(doc(db, 'users', uid, 'loans', id)).catch((err) =>
      console.error('Failed to delete loan record:', err)
    );
  };

  const toggleStatus = (id) => {
    const uid = auth.currentUser?.uid;
    const record = loanRecords.find((r) => r.id === id);
    if (!record) return;

    updateDoc(doc(db, 'users', uid, 'loans', id), {
      status: record.status === 'Paid' ? 'Pending' : 'Paid',
      updatedAt: new Date().toISOString(),
    }).catch((err) => console.error('Failed to toggle loan status:', err));
  };

  return {
    loanRecords,
    addLoan,
    updateLoan,
    deleteLoan,
    toggleStatus,
    isLoading,
  };
}