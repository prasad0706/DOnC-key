import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    uid: 'anonymous-user',
    email: 'anonymous@example.com',
    displayName: 'Anonymous User'
  });
  const [loading, setLoading] = useState(false);

  // Mock authentication functions
  const signup = async (email, password) => {
    console.log('Signup mock function called');
    return Promise.resolve();
  };

  // Mock login
  const login = async (email, password) => {
    console.log('Login mock function called');
    setCurrentUser({
      uid: 'mock-user',
      email,
      displayName: email.split('@')[0]
    });
    return Promise.resolve();
  };

  // Mock logout
  const logout = async () => {
    console.log('Logout mock function called');
    setCurrentUser(null);
    return Promise.resolve();
  };

  // Mock reset password
  const resetPassword = async (email) => {
    console.log('Reset password mock function called');
    return Promise.resolve();
  };

  useEffect(() => {
    // Simulate loading completion
    setLoading(false);
  }, []);

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
