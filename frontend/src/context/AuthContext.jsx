import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  login as loginUser,
  register as registerUser,
  getMe,
} from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'krishibandhu_token';
const USER_KEY = 'krishibandhu_user';

// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY),
  );
  const [loading, setLoading] = useState(true);

  // ========================================
  // LOAD USER FROM EXISTING TOKEN
  // ========================================

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem(
        TOKEN_KEY,
      );

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMe(storedToken);

        if (data.success) {
          setUser(data.user);

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(data.user),
          );
        }
      } catch (error) {
        console.error(
          'Authentication restore failed:',
          error,
        );

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ========================================
  // LOGIN
  // ========================================

  const login = async (email, password) => {
    const data = await loginUser(
      email,
      password,
    );

    if (data.success) {
      localStorage.setItem(
        TOKEN_KEY,
        data.token,
      );

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user),
      );

      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  // ========================================
  // REGISTER
  // ========================================

  const register = async (userData) => {
    const data = await registerUser(userData);

    if (data.success) {
      localStorage.setItem(
        TOKEN_KEY,
        data.token,
      );

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user),
      );

      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  // ========================================
  // LOGOUT
  // ========================================

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),

    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// USE AUTH HOOK
// ==========================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    );
  }

  return context;
};