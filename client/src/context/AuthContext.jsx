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
                console.warn('Background token check note:', err?.message);
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
      showToast(message, 'error');
      throw error;
    }
  };

  const register = async (name, email, phone, password, role = 'USER') => {
    try {
      const { data } = await API.post('/auth/register', { name, email, phone, password, role });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      showToast(`Welcome to GoaRide, ${data.name}!`, 'success');
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

  const updateProfile = async (updatedData) => {
    try {
      const { data } = await API.put(`/users/${user._id}`, updatedData);
      const newUserData = { ...user, ...data };
      setUser(newUserData);
      localStorage.setItem('userInfo', JSON.stringify(newUserData));
      showToast('Profile updated successfully!', 'success');
      return newUserData;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      showToast(message, 'error');
      throw error;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatarFile', file);

      const { data } = await API.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newUserData = { ...user, ...data };
      setUser(newUserData);
      localStorage.setItem('userInfo', JSON.stringify(newUserData));
      showToast('Profile image updated successfully!', 'success');
      return newUserData;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload profile image.';
      showToast(message, 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
