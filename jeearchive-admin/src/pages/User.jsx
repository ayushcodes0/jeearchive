import React from 'react'
import useAuth from '../hooks/useAuth';

const User = () => {
  const {user} = useAuth();
  return (
    <div>
      Users page {user?.firstName || user?.fullName}
    </div>
  )
}

export default User
