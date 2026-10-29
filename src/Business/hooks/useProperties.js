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

// Shared between PropertiesPage.jsx and PropertyGallery.jsx so both
// read/write the same list of properties — fixes the disconnect
// mentioned in the README where Gallery had its own separate state.
export function useProperties() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const propertiesRef = collection(db, 'users', uid, 'properties');
    const q = query(propertiesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setProperties(
          snap.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id, // real Firestore id always wins
          }))
        );
        setIsLoading(false);
      },
      (err) => {
        console.error('Failed to load properties from Firestore:', err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addProperty = async (data) => {
    const uid = auth.currentUser?.uid;
    const safeData = { ...data };
    delete safeData.id; // let Firestore assign the real id

    await withUploads(async (upload) => {
      if (safeData.images) {
        const images = [];
        for (const image of safeData.images) images.push(await upload(image, 'properties'));
        safeData.images = images;
      }
      return addDoc(collection(db, 'users', uid, 'properties'), { ...safeData, createdAt: new Date().toISOString() });
    });
  };

  const updateProperty = async (id, updates) => {
    const uid = auth.currentUser?.uid;
    const safeUpdates = { ...updates };
    delete safeUpdates.id;

    await withUploads(async (upload) => {
      if (safeUpdates.images) {
        const images = [];
        for (const image of safeUpdates.images) images.push(await upload(image, 'properties'));
        safeUpdates.images = images;
      }
      return updateDoc(doc(db, 'users', uid, 'properties', id), safeUpdates);
    });
  };

  const deletePropertyById = async (id) => {
    const uid = auth.currentUser?.uid;
    await deleteDoc(doc(db, 'users', uid, 'properties', id));
  };

  return {
    properties,
    addProperty,
    updateProperty,
    deletePropertyById,
    isLoading,
  };
}