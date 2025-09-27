import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { app } from '../firebase/config'; // Core app is safe to import

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState({ auth: null, db: null });
  const [loading, setLoading] = useState(true);
  const [authFunctions, setAuthFunctions] = useState({});

  useEffect(() => {
    const loadFirebase = async () => {
      console.log("[AuthContext] Starting to load Firebase services...");
      try {
        const { getAuth, onAuthStateChanged, ...authFuncs } = await import('firebase/auth');
        const { getFirestore } = await import('firebase/firestore');
        
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        console.log("[AuthContext] Firebase services loaded successfully.", { auth, db });
        setServices({ auth, db });
        setAuthFunctions(authFuncs);

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          console.log("[AuthContext] Auth state changed. Loading finished.", { currentUser });
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("[AuthContext] Firebase initialization error:", error);
        setLoading(false);
      }
    };

    loadFirebase();
  }, []);

  const signup = useCallback(async (email, password) => {
    if (!services.auth || !authFunctions.createUserWithEmailAndPassword) throw new Error("Auth service is not ready.");
    return authFunctions.createUserWithEmailAndPassword(services.auth, email, password);
  }, [services.auth, authFunctions]);

  const login = useCallback(async (email, password) => {
    if (!services.auth || !authFunctions.signInWithEmailAndPassword) throw new Error("Auth service is not ready.");
    return authFunctions.signInWithEmailAndPassword(services.auth, email, password);
  }, [services.auth, authFunctions]);

  const logout = useCallback(async () => {
    if (!services.auth || !authFunctions.signOut) throw new Error("Auth service is not ready.");
    return authFunctions.signOut(services.auth);
  }, [services.auth, authFunctions]);

  const value = { user, db: services.db, loading, signup, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};