import React, { useState, useEffect, useRef } from 'react';
import './UsersCard.css';
import placeholderProfileImage from '../assets/placeholder-profile.jpg';
import ProfileImagePopup from './ProfileImagePopup';

const UsersCard = ({ user }) => {
  const [profileImagePopup, setProfileImagePopup] = useState(false);
  const popupRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setProfileImagePopup(false);
      }
    };

    if (profileImagePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileImagePopup]);

  const roleClass = user.role === 'admin' ? 'admin' : 'user';
  const providerClass = user.provider === 'google' ? 'google' : 'local';

  return (
    <>
      <div className="user-card">
        {profileImagePopup && (
          <div className='profile-popup' ref={popupRef}>
            <ProfileImagePopup />
          </div>
        )}

        <p className="profile-image" onClick={() => setProfileImagePopup(true)}>
          <img src={placeholderProfileImage} alt="" />
        </p>
        <p className="name">
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.fullName}
        </p>
        <p className="email">{user.email}</p>
        <p className={roleClass}>{user.role}</p>
        <p className={providerClass}>{user.provider}</p>
      </div>
    </>
  );
};

export default UsersCard;
