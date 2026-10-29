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

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const paymentsRef = collection(db, 'users', uid, 'payments');
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPayments(
          snapshot.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id, // real Firestore id always wins over any stored "id" field
          }))
        );
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addPayment = async (paymentData) => {
    const uid = auth.currentUser?.uid;

    const safeData = { ...paymentData };
    delete safeData.receiptFile;


    await withUploads(async (upload) => {
      const image = paymentData.screenshot || paymentData.receiptFile?.data;
      if (image) safeData.screenshot = await upload(image, 'payments');
      return addDoc(collection(db, 'users', uid, 'payments'), { ...safeData, createdAt: new Date().toISOString() });
    });
  };

  const updatePayment = async (id, updates) => {
    const uid = auth.currentUser?.uid;

    const safeUpdates = { ...updates };
    delete safeUpdates.receiptFile;


    await withUploads(async (upload) => {
      const image = updates.screenshot || updates.receiptFile?.data;
      if (image) safeUpdates.screenshot = await upload(image, 'payments');
      return updateDoc(doc(db, 'users', uid, 'payments', id), safeUpdates);
    });
  };

  const deletePaymentById = async (id) => {
    const uid = auth.currentUser?.uid;
    await deleteDoc(doc(db, 'users', uid, 'payments', id));
  };

  return { payments, addPayment, updatePayment, deletePaymentById, isLoading };
}