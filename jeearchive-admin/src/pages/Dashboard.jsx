import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import placeholderProfileImage from '../assets/placeholder-profile.jpg';
import { IoIosLogOut } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { FaRegNoteSticky } from "react-icons/fa6";
import { BsQuestionSquare } from "react-icons/bs";
import { NavLink, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';


const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    navigate('/register', { replace: true });
  };

    const linkClass = ({ isActive }) => `menu${isActive ? 'active' : ''}`;
    const {user} = useAuth()

  return (
    <div className='dashboard-body'>
      <div className="dashboard-left">
        <div className="dashboard-left-top">
          <NavLink to={'/user'} className={`users menu ${linkClass}`}><FaUser className='user-icon'/>User</NavLink>
          <NavLink to={'/test'} className={`tests menu ${linkClass}`}><FaRegNoteSticky className='test-icon'/>Test</NavLink>
          <NavLink to={'/question'} className={`questions menu ${linkClass}`}><BsQuestionSquare className='question-icon'/>Question</NavLink>
        </div>
        <div className="dashboard-left-bottom">
          <p className="admin-logout" onClick={()=>handleLogout()}><IoIosLogOut className='logout-icon'/></p>
          <p className="admin-profile"><img src={user?.avatar || placeholderProfileImage} alt="" /></p>
        </div>
      </div>
      <div className="dashboard-right">
        <div className="dashboard-right-content"><Outlet/></div>
      </div>
    </div>
  );
};

export default Dashboard;
