// pages/AuthSuccess.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export default function AuthSuccess() {
  const { search } = useLocation();    // ?token=xxxx
  const navigate  = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token  = params.get('token');

    if (!token) return navigate('/register');

    try {
      const payload = jwtDecode(token);          // { id, email, isAdmin?, exp }
      if (!payload || !payload.exp) throw new Error();

      // OPTIONAL: make sure it's an admin token the way your backend flags it
      // if (!payload.isAdmin) return navigate('/');   // or show 403

      localStorage.setItem('admin_token', token);
      navigate('/');                         // landing page for admins
    } catch {
      navigate('/register');
    }
  }, [search]);

  return <p className="signing-in">Signing you in…</p>;
}
