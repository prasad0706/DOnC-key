import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock authentication functions
  const signup = async (email, password) => {
    console.warn("🔥 MOCK SIGNUP ACTIVE — Firebase DISABLED");
    console.log("Mock user:", email);

    const mockUser = {
      uid: "mock-user-" + Date.now(),
      email,
      name: email.split("@")[0],
    };

    setCurrentUser(mockUser);
    setIsAuthenticated(true);

    return { success: true };
  };

  const login = async (email, password) => {
    console.warn("🔥 MOCK LOGIN ACTIVE — Firebase DISABLED");
    console.log("Mock user:", email);

    const mockUser = {
      uid: "mock-user-001",
      email,
      name: email.split("@")[0],
    };

    setCurrentUser(mockUser);
    setIsAuthenticated(true);

    return { success: true };
  };

  const logout = async () => {
    console.warn("🔥 MOCK LOGOUT ACTIVE — Firebase DISABLED");
    setCurrentUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  const resetPassword = async (email) => {
    console.warn("🔥 MOCK PASSWORD RESET ACTIVE — Firebase DISABLED");
    console.log('Mock password reset for:', email);
    return { success: true };
  };

  const googleLogin = async (user) => {
    console.log("Google Login User:", user.email);

    const googleUser = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL,
      provider: 'google'
    };

    setCurrentUser(googleUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    googleLogin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

