import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

const OWNER_EMAIL = (
  import.meta.env.VITE_OWNER_EMAIL || 'ranazahid@example.com'
)
  .trim()
  .toLowerCase();
const DEMO_EMAIL = (
  import.meta.env.VITE_DEMO_EMAIL || 'demo@ranazahid.com'
)
  .trim()
  .toLowerCase();
const DEMO_PASSWORD = (
  import.meta.env.VITE_DEMO_PASSWORD || 'DemoUser123!'
).trim();
const OWNER_NAME = 'Rana Zahid';

const isAllowedEmail = (email) => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === OWNER_EMAIL || normalized === DEMO_EMAIL;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firebase listener: ensures only authorized users (Rana Zahid or Demo Recruiter) can maintain a session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = (firebaseUser.email || '').toLowerCase();
        if (!isAllowedEmail(userEmail)) {
          console.warn(
            `Unauthorized login attempt blocked for ${firebaseUser.email}. Exclusively configured for ${OWNER_NAME} (${OWNER_EMAIL}) and Portfolio Reviewers.`
          );
          await signOut(auth);
          setUser(null);
          setAuthLoading(false);
          return;
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Guard: Prevent non-authorized emails from attempting login
    if (!isAllowedEmail(trimmedEmail)) {
      throw new Error(
        `Access denied. This personal diary is exclusively restricted to ${OWNER_NAME} (${OWNER_EMAIL}) or demo reviewers.`
      );
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      const loggedInEmail = (userCredential.user?.email || '').toLowerCase();
      if (!isAllowedEmail(loggedInEmail)) {
        await signOut(auth);
        throw new Error(
          `Access denied. This account (${loggedInEmail}) is not authorized.`
        );
      }
    } catch (error) {
      if (error.message && error.message.includes('Access denied')) {
        throw error;
      }
      throw new Error('The email or password is incorrect.', { cause: error });
    }
  };

  // 1-Click Recruiter Demo access for portfolio reviewers
  const loginAsDemo = async () => {
    try {
      await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
    } catch (error) {
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        try {
          // Automatically create demo user in Firebase Auth so manual creation is not mandatory
          await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
          return;
        } catch (createErr) {
          console.warn('Could not auto-create demo user:', createErr);
        }
      }

      // Fallback guest session so recruiters are NEVER blocked even offline
      setUser({
        uid: 'demo-recruiter-guest',
        email: DEMO_EMAIL,
        displayName: 'Portfolio Recruiter / Guest',
        isDemo: true,
      });
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to change your password.');
    }
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      throw new Error('Your current password is incorrect.', { cause: error });
    }
  };

  const isDemo = Boolean(
    user && (user.isDemo || user.email?.toLowerCase() === DEMO_EMAIL)
  );

  const contextValue = useMemo(
    () => ({
      user,
      isDemo,
      authLoading,
      isAuthenticated: Boolean(user),
      ownerEmail: OWNER_EMAIL,
      ownerName: OWNER_NAME,
      demoEmail: DEMO_EMAIL,
      demoPassword: DEMO_PASSWORD,
      login,
      loginAsDemo,
      logout,
      changePassword,
    }),
    [user, isDemo, authLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
};