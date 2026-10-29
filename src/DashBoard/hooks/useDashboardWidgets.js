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

function useFirestoreList(collectionName) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = collection(db, 'users', uid, collectionName);
    const q = query(ref, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setItems(
          snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }))
        );
        setIsLoading(false);
      },
      (err) => {
        console.error(`Failed to load ${collectionName}:`, err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName]);

  const addItem = async (data) => {
    const uid = auth.currentUser?.uid;
    const safeData = { ...data };
    delete safeData.id;

    await addDoc(collection(db, 'users', uid, collectionName), {
      ...safeData,
      createdAt: new Date().toISOString(),
    });
  };

  const updateItem = async (id, updates) => {
    const uid = auth.currentUser?.uid;
    await updateDoc(doc(db, 'users', uid, collectionName, id), updates);
  };

  const deleteItem = async (id) => {
    const uid = auth.currentUser?.uid;
    await deleteDoc(doc(db, 'users', uid, collectionName, id));
  };

  return { items, addItem, updateItem, deleteItem, isLoading };
}

export function useDashboardTasks() {
  const { items, addItem, updateItem, deleteItem } =
    useFirestoreList('dashboardTasks');
  return { tasks: items, addTask: addItem, updateTask: updateItem, deleteTask: deleteItem };
}

export function useDashboardNotes() {
  const { items, addItem, deleteItem } = useFirestoreList('dashboardNotes');
  return { notes: items, addNote: addItem, deleteNote: deleteItem };
}

export function useDashboardProperties() {
  const { items, addItem } = useFirestoreList('dashboardProperties');
  return { dashboardProperties: items, addDashboardProperty: addItem };
}

export function useDashboardBuyers() {
  const { items, addItem } = useFirestoreList('dashboardBuyers');
  return { dashboardBuyers: items, addDashboardBuyer: addItem };
}

export function useDashboardDeals() {
  const { items, addItem } = useFirestoreList('dashboardDeals');
  return { deals: items, addDeal: addItem };
}