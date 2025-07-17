import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import Pyq from './pages/Pyq/Pyq';
import Coaching from './pages/Coaching/Coaching';
import Analytics from './pages/Analytics/Analytics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Default route on dashboard -> pyq */}
        <Route index element={<Navigate to="pyq" replace />} />
        <Route path="pyq" element={<Pyq />} />
        <Route path="coaching" element={<Coaching />} />
        <Route path="analytics" element={<Analytics />} />
        {/* fallback route inside dashboard */}
        <Route path="*" element={<div>Not Found</div>} />
      </Route>
      {/* fallback route for unknown paths */}
      <Route path="*" element={<div>404 - Not Found</div>} />
    </Routes>
  );
}

export default App;
