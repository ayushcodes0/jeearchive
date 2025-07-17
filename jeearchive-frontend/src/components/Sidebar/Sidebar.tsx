import { NavLink } from 'react-router-dom';
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <div className={styles.sidebarContainer}>
      <h3>Menu</h3>
      <ul>
        <li><NavLink to="pyq">PYQ</NavLink></li>
        <li><NavLink to="coaching">Coaching</NavLink></li>
        <li><NavLink to="analytics">Analytics</NavLink></li>
      </ul>
    </div>
  );
};

export default Sidebar;
