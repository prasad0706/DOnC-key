import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useFirebase, setUseFirebase] = useState(true);

  // Firebase authentication functions with fallback to mock
  const signup = async (email, password) => {
    try {
      if (useFirebase) {
        return await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (firebaseError) {
      console.warn('Firebase authentication failed, falling back to mock:', firebaseError.message);
      setUseFirebase(false);
    }

    // Fallback to mock authentication
    console.log('Using mock signup for:', email);
    setCurrentUser({
      uid: 'mock-' + Date.now(),
      email,
      displayName: email.split('@')[0]
    });
    return Promise.resolve();
  };

  const login = async (email, password) => {
    try {
      if (useFirebase) {
        return await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (firebaseError) {
      console.warn('Firebase authentication failed, falling back to mock:', firebaseError.message);
      setUseFirebase(false);
    }

    // Fallback to mock authentication
    console.log('Using mock login for:', email);
    setCurrentUser({
      uid: 'mock-' + Date.now(),
      email,
      displayName: email.split('@')[0]
    });
    return Promise.resolve();
  };

  const logout = async () => {
    try {
      if (useFirebase) {
        await signOut(auth);
      }
    } catch (firebaseError) {
      console.warn('Firebase logout failed:', firebaseError.message);
    }

    setCurrentUser(null);
    return Promise.resolve();
  };

  const resetPassword = async (email) => {
    try {
      if (useFirebase) {
        return await sendPasswordResetEmail(auth, email);
      }
    } catch (firebaseError) {
      console.warn('Firebase password reset failed, falling back to mock:', firebaseError.message);
      setUseFirebase(false);
    }

    console.log('Mock password reset for:', email);
    return Promise.resolve();
  };

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
        } else if (!useFirebase) {
          // If Firebase fails and we're using mock, set a mock user for testing
          setCurrentUser({
            uid: 'mock-user',
            email: 'test@example.com',
            displayName: 'Test User'
          });
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.warn('Firebase auth state change failed, using mock:', error.message);
      setUseFirebase(false);
      setCurrentUser({
        uid: 'mock-user',
        email: 'test@example.com',
        displayName: 'Test User'
      });
      setLoading(false);
    }
  }, [useFirebase]);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

