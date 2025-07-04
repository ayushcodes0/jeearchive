// src/context/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import api from '../services/api';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Error fetching user:', err.message);
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
