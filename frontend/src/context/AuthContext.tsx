import React, { useEffect, useState, createContext, useContext } from 'react';
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  nativeLanguage: string;
  targetLanguage: string;
  level: number;
  xp: number;
  streak: number;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// Mock user data for demonstration
const MOCK_USER: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  nativeLanguage: 'English',
  targetLanguage: 'Spanish',
  level: 7,
  xp: 3240,
  streak: 12
};
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);
  const login = async (email: string, password: string) => {
    // Mock login - in a real app, this would be an API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setUser(MOCK_USER);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        resolve();
      }, 1000);
    });
  };
  const signup = async (name: string, email: string, password: string) => {
    // Mock signup - in a real app, this would be an API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const newUser = {
          ...MOCK_USER,
          name,
          email,
          level: 1,
          xp: 0,
          streak: 0
        };
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(newUser));
        resolve();
      }, 1000);
    });
  };
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };
  return <AuthContext.Provider value={{
    user,
    isAuthenticated,
    login,
    signup,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
};