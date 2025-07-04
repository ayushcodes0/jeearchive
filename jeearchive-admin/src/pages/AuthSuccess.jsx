// pages/AuthSuccess.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext';

export default function AuthSuccess() {
  const { search } = useLocation();    // ?token=xxxx
  const navigate  = useNavigate();
  const { refreshUser } = useContext(AuthContext);  // ✅

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token  = params.get('token');

    if (!token) return navigate('/register');

    try {
      const payload = jwtDecode(token);          // { id, email, exp }

      if (!payload || !payload.exp) throw new Error();

      localStorage.setItem('token', token);
      localStorage.setItem('admin_token', token);

      // ✅ Call refreshUser to fetch full user details into context
      refreshUser();

      // Redirect after success
      navigate('/user');
    } catch {
      navigate('/register');
    }
  }, [search]);

  return <p className="signing-in">Signing you in…</p>;
}
