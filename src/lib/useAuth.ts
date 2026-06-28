import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const googleProvider = new GoogleAuthProvider();

/**
 * Manages Firebase Google authentication.
 * - `signInWithGoogle()` triggers the Google OAuth popup
 * - `signOut()` clears the session
 * - Auth state persists via Firebase's built-in session storage
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<{ user: User | null; loading: boolean; error: string | null }>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false, error: null });
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will update state automatically
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      console.error("[Firebase Auth] Google sign-in error:", msg);
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("[Firebase Auth] Sign-out error:", err);
    }
  };

  return { ...state, signInWithGoogle, signOut };
}
