
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Fetch fresh profile data on reload
                const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
                setUser(userData);
            } catch (e) {
                console.error("Auth initialization failed");
                logout();
            }
        }
        setLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('token', userData.token || '');
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
