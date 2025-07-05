// src/context/TestProvider.jsx
import React, { useEffect, useState } from 'react';
import TestContext from './TestContext';
import api from '../services/api';

const TestProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/test');  // endpoint: /api/test/
      setTests(res.data.tests || []);
    } catch (err) {
      console.error('Error fetching tests:', err.message);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <TestContext.Provider value={{ tests, loading, error, fetchTests }}>
      {children}
    </TestContext.Provider>
  );
};

export default TestProvider;
