import { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, getAuth } from 'firebase/auth';
import { app } from '../firebase/config';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // NEW: State to hold admin status
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setLoading(true);
      setIsAdmin(false); // Reset admin status on change

      if (user) {
        setUser(user);
        const tokenResult = await user.getIdTokenResult(); // Get the full token result
        
        // THE FIX: Check for the 'admin' custom claim
        setIsAdmin(tokenResult.claims.admin === true);

        const token = await user.getIdToken();
        // Set the session cookie by calling our API route
        fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

      } else {
        setUser(null);
        // Clear the session cookie by calling our API route
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

  // We now provide 'isAdmin' to the rest of the application
  const value = { user, isAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);