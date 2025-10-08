import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onIdTokenChanged, 
  getAuth, 
  signOut,
  // --- NEW: Import Firebase auth functions ---
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // For creating user documents
import { db } from '../firebase/client'; // Use client-side db
import { app } from '../firebase/config';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  // --- NEW: LOGIN/SIGNUP FUNCTIONS ---
  
  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // After signup, create a corresponding user document in Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      email: userCredential.user.email,
      tier: 'Community', // Assign a default tier
      createdAt: new Date(),
    });
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    // Check if a user document already exists, if not, create one
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      email: userCredential.user.email,
      name: userCredential.user.displayName,
      tier: 'Community',
    }, { merge: true }); // Use merge to avoid overwriting existing data
    return userCredential;
  };

  const logout = () => {
    return signOut(auth);
  };
  // --- END OF NEW CODE ---

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setLoading(true);
      setIsAdmin(false);

      if (user) {
        setUser(user);
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin === true);

        const token = await user.getIdToken();
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } else {
        setUser(null);
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: null }),
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // We now provide all auth functions to the rest of the application
  const value = { user, isAdmin, loading, signup, login, logout, loginWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);