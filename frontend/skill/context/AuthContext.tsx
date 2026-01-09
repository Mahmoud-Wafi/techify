
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { User } from '../types';
// import { api } from '../api/client';

// interface AuthContextType {
//   user: User | null;
//   login: (userData: User) => void;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const initAuth = async () => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             try {
//                 // Fetch fresh profile data on reload
//                 const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
//                 setUser(userData);
//             } catch (e) {
//                 console.error("Auth initialization failed");
//                 logout();
//             }
//         }
//         setLoading(false);
//     };
//     initAuth();
//   }, []);

//   const login = (userData: User) => {
//     setUser(userData);
//     localStorage.setItem('token', userData.token || '');
//     localStorage.setItem('user_data', JSON.stringify(userData));
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('refresh_token');
//     localStorage.removeItem('user_data');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


// File: frontend/skill/context/AuthContext.tsx
/**
 * Authentication Context with API integration
 * Provides authentication state and methods throughout the app
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';
import { User } from '../api/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Check if token is still valid by fetching current user
          try {
            const userData = await authService.getCurrentUser();
            setUser({ ...userData, token });
          } catch (error) {
            // Token is invalid or expired
            console.error('Auth initialization failed:', error);
            handleLogout();
          }
        } else {
          // No token found - check if we have stored user data
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login handler - updates context state
   */
  const login = (userData: User) => {
    setUser(userData);
    setError(null);
    
    // Ensure token is stored
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  /**
   * Logout handler - clears context and storage
   */
  const logout = () => {
    handleLogout();
  };

  const handleLogout = () => {
    setUser(null);
    setError(null);
    authService.logout();
  };

  /**
   * Update user data in context
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser({ ...userData, token: user?.token });
      localStorage.setItem('user_data', JSON.stringify({ ...userData, token: user?.token }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setError('Failed to refresh user data');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;