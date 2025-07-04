import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import AuthSuccess from '../pages/AuthSuccess';


const AdminRoute = () => {
  return (
    <BrowserRouter>
        <Routes>

            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path="/auth/success" element={<AuthSuccess />} />

        </Routes>
    </BrowserRouter>
  )
}

export default AdminRoute
