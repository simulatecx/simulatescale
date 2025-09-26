import { createContext, useReducer, useEffect, useContext } from 'react'; // Import useContext
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'AUTH_IS_READY':
      return { ...state, user: action.payload, authIsReady: true };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { 
    user: null,
    authIsReady: false
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userProfile = { ...user, ...docSnap.data() };
          dispatch({ type: 'AUTH_IS_READY', payload: userProfile });
        } else {
          console.error("Critical Error: User profile not found in Firestore for UID:", user.uid);
          dispatch({ type: 'AUTH_IS_READY', payload: user });
        }
      } else {
        dispatch({ type: 'AUTH_IS_READY', payload: null });
      }
    });

    return () => unsub();
  }, []);

  console.log('AuthContext state:', state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      { children }
    </AuthContext.Provider>
  );
};

// ADD THIS EXPORTED HOOK
// This custom hook makes it easy to use the auth context in other components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw Error('useAuthContext must be used inside an AuthContextProvider');
  }
  return context;
};

