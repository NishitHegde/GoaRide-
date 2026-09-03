import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const verifyUserSession = () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.token) {
            setUser(parsed);
            API.get('/auth/me')
              .then(({ data }) => {
                const freshUser = { ...data, token: parsed.token };
                setUser(freshUser);
                localStorage.setItem('userInfo', JSON.stringify(freshUser));
              })
              .catch((err) => {
                if (err?.response?.status === 401) {
                  localStorage.removeItem('userInfo');
                  setUser(null);
                }
              });
          } else {
            localStorage.removeItem('userInfo');
            setUser(null);
          }
        } catch (e) {
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      showToast(`Welcome back, ${data.name}!`, 'success');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      // Don't show toast for unverified email since the UI renders the OTP card
      if (!error.response?.data?.isVerified === false) {
        showToast(message, 'error');
      }
      throw error;
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, phone, password });
      showToast(data.message || 'Registration successful! Check your inbox for the verification email.', 'info');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please check form details.';
      showToast(message, 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      // Ignore network errors on logout API call
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
      showToast('Logged out successfully', 'info');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
