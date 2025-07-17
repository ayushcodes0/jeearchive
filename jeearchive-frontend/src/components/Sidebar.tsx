import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div style={{ width: '200px', background: '#eee', padding: '1rem' }}>
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
