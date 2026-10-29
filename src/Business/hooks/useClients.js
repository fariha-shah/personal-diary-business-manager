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

export function useClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const clientsRef = collection(db, 'users', uid, 'clients');
    const q = query(clientsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setClients(
          snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          }))
        );
        setIsLoading(false);
      },
      (err) => {
        console.error('Failed to load clients from Firestore:', err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addClient = async (data) => {
    const uid = auth.currentUser?.uid;
    const safeData = { ...data };
    delete safeData.id;

    await addDoc(collection(db, 'users', uid, 'clients'), {
      ...safeData,
      createdAt: new Date().toISOString(),
    });
  };

  const updateClient = async (id, updates) => {
    const uid = auth.currentUser?.uid;
    const safeUpdates = { ...updates };
    delete safeUpdates.id;

    await updateDoc(doc(db, 'users', uid, 'clients', id), safeUpdates);
  };

  const deleteClientById = async (id) => {
    const uid = auth.currentUser?.uid;
    await deleteDoc(doc(db, 'users', uid, 'clients', id));
  };

  return { clients, addClient, updateClient, deleteClientById, isLoading };
}