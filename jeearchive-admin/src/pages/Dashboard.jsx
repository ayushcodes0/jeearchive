// src/pages/Dashboard.jsx
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1) Remove everything auth‑related
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');   // if you also store a user token
    // localStorage.clear();            // <- wipe all keys if you want

    // 2) Optional: clear any app state (contexts, query caches, etc.)
    // queryClient.clear(); or dispatch({ type: 'LOGOUT' })

    // 3) Send them to the public page
    navigate('/register', { replace: true });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>This is my dashboard</h1>

      <button onClick={handleLogout}>
        Log&nbsp;Out
      </button>
    </div>
  );
};

export default Dashboard;
