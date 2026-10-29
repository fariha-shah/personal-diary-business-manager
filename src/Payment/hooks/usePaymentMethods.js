import { withUploads } from '../../services/uploads';
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

export function usePaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const methodsRef = collection(db, 'users', uid, 'paymentMethods');
    const q = query(methodsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setMethods(
          snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id, // real Firestore id always wins
          }))
        );
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addMethod = async (form) => {
    const uid = auth.currentUser?.uid;

    const safeForm = { ...form };


    await withUploads(async (upload) => {
      if (safeForm.screenshot) safeForm.screenshot = await upload(safeForm.screenshot, 'paymentMethods');
      return addDoc(collection(db, 'users', uid, 'paymentMethods'), { ...safeForm, createdAt: new Date().toISOString() });
    });
  };

  const updateMethod = async (id, form) => {
    const uid = auth.currentUser?.uid;

    const safeForm = { ...form };


    await withUploads(async (upload) => {
      if (safeForm.screenshot) safeForm.screenshot = await upload(safeForm.screenshot, 'paymentMethods');
      return updateDoc(doc(db, 'users', uid, 'paymentMethods', id), safeForm);
    });
  };

  const deleteMethodById = async (id) => {
    const uid = auth.currentUser?.uid;
    await deleteDoc(doc(db, 'users', uid, 'paymentMethods', id));
  };

  return { methods, addMethod, updateMethod, deleteMethodById, isLoading };
}