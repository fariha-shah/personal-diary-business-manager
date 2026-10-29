import { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const OWNER_EMAIL = (
  import.meta.env.VITE_OWNER_EMAIL || 'ranazahid@example.com'
).trim();

const DEFAULT_SETTINGS = {
  profile: {
    name: 'Rana Zahid',
    email: OWNER_EMAIL,
    diaryTitle: "Rana Zahid's Personal Diary",
    defaultView: 'grid',
    autoSave: true,
  },
  theme: 'system',
  notifications: {
    dailyReminder: true,
    reminderTime: '20:00',
    emailAlerts: false,
    dealUpdates: true,
  },
  security: {
    enablePasscode: false,
    passcode: '',
    autoLock: '15',
  },
};

// All settings live in a single document: users/{uid}/settings/profile
export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(() => Boolean(auth.currentUser));

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const load = async () => {
      try {
        const ref = doc(db, 'users', uid, 'settings', 'profile');
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setSettings((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const saveSettings = async (updates) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(db, 'users', uid, 'settings', 'profile');
    await setDoc(ref, updates, { merge: true });

    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return { settings, saveSettings, isLoading };
}