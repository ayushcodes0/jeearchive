import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import placeholderProfileImage from '../assets/placeholder-profile.jpg';
import { IoIosLogOut } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { FaRegNoteSticky } from "react-icons/fa6";
import { BsQuestionSquare } from "react-icons/bs";
import { NavLink, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import UserPopup from '../components/UserPopup';
import { FiSidebar } from "react-icons/fi";


const Dashboard = () => {
  const navigate = useNavigate();
  const [userPopup, setUserPopup] = useState(false);
  const popupRef = useRef(null); // 👈 Ref for popup
  const [showSidebar, setShowSidebar] = useState(false);

  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    navigate('/register', { replace: true });
  };

  const linkClass = ({ isActive }) => `menu${isActive ? 'active' : ''}`;

  // 👇 useEffect to handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setUserPopup(false);
      }
    };

    if (userPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userPopup]);

  return (
    <div className='dashboard-body'>
      <div className="dashboard-left" style={{transform: showSidebar ? 'translateX(0)' : '', transition: 'transform 0.3s ease'}}>
        <div className="menu-close-icon"><FiSidebar onClick={()=>setShowSidebar(false)}/></div>
        <div className="dashboard-left-top">
          <NavLink to={'/user'} className={`users menu ${linkClass}`}><FaUser className='user-icon' />User</NavLink>
          <NavLink to={'/test'} className={`tests menu ${linkClass}`}><FaRegNoteSticky className='test-icon' />Test</NavLink>
          <NavLink to={'/question'} className={`questions menu ${linkClass}`}><BsQuestionSquare className='question-icon' />Question</NavLink>
        </div>
        <div className="dashboard-left-bottom">
          <p className="admin-logout" onClick={handleLogout}><IoIosLogOut className='logout-icon' /><span className="logout-hover">Log Out</span></p>
          <p className="admin-profile" onClick={() => setUserPopup(!userPopup)}>
            <img src={user?.avatar || placeholderProfileImage} alt="Admin" />
          </p>

          {userPopup && (
            <div className='user-popup' ref={popupRef}>
              <UserPopup />
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-right">
        <div className='menu-icon'><FiSidebar onClick={()=>setShowSidebar(true)}/></div>
        <div className="dashboard-right-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}; 

export default Dashboard;
