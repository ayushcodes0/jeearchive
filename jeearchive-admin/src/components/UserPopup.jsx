import React from 'react'
import './UserPopup.css'
import useAuth from '../hooks/useAuth'
import { SiNamecheap } from "react-icons/si";
import { MdEmail } from "react-icons/md";



const UserPopup = () => {
    const {user} = useAuth();
  return (
    <div className='user-popup-component'>
      <p className="name"><SiNamecheap className='icons'/>{user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
      <p className="email"><MdEmail className='icons'/>{user?.email}</p>
    </div>
  )
}

export default UserPopup
