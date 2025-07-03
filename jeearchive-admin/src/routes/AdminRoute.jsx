import React from 'react'
import { BrowserRouter,Router, Routes, Route } from "react-router-dom";
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';



const AdminRoute = () => {
  return (
    <BrowserRouter>
        <Routes>

            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
            <Route path='/register' element={<Register/>}/>

        </Routes>
    </BrowserRouter>
  )
}

export default AdminRoute
