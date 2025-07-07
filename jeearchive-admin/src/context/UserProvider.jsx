// src/context/TestProvider.jsx
import React, { useEffect, useState } from 'react';
import UserContext from './UserContext';
import api from '../services/api';

const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user');  // endpoint: /api/user/
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching tests:', err.message);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, error, fetchUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
