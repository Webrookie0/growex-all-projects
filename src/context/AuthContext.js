import React, { createContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: currentUser.uid,
              username: userData.username,
              email: currentUser.email,
              ...userData
            });
            setIsAuthenticated(true);
          } else {
            // User document doesn't exist, log them out
            await signOut(auth);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  // Register a new user
  const signup = async (username, email, password) => {
    try {
      setLoading(true);
      
      // Check if username already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { success: false, message: 'Username already exists' };
      }
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;
      
      // Create user document in Firestore
      const userData = {
        username,
        email,
        createdAt: new Date().toISOString(),
        bio: '',
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
        role: 'influencer',
        socialLinks: {
          instagram: '',
          twitter: '',
          youtube: '',
          tiktok: ''
        },
        interests: [],
        location: ''
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      // Update state
      setUser({
        id: firebaseUser.uid,
        ...userData
      });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, message: 'Email already in use' };
      }
      
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Login existing user
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Update state
        setUser({
          id: firebaseUser.uid,
          ...userData
        });
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        // User document doesn't exist, log them out
        await signOut(auth);
        setUser(null);
        setIsAuthenticated(false);
        
        return { success: false, message: 'User account not found' };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, message: 'Invalid email or password' };
      }
      
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Login with username instead of email
  const loginWithUsername = async (username, password) => {
    try {
      setLoading(true);
      
      // Find user by username
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, message: 'User not found' };
      }
      
      // Get the first matching user (usernames should be unique)
      const userData = querySnapshot.docs[0].data();
      const email = userData.email;
      
      // Sign in with email and password
      return await login(email, password);
    } catch (error) {
      console.error('Login with username error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        signup,
        login,
        loginWithUsername,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 