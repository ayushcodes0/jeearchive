import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <main className={styles.dashboardLayoutOutlet}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
