import React from 'react'
import useUser from '../hooks/useUser';
import "./Users.css"
import UsersCard from '../components/UsersCard';

const User = () => {
  const {users} = useUser();
  console.log("Users: ", users)
  return (
    <div className='users-container'>
      {users.map((user, idx)=>{
        return (
          <UsersCard key={idx} user={user} />
        )
      })}
    </div>
  )
}

export default User
