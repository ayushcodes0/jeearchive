import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import AuthSuccess from '../pages/AuthSuccess';
import User from '../pages/User';
import Test from '../pages/Test';
import Question from '../pages/Question';


const AdminRoute = () => {
  return (
    <BrowserRouter>
        <Routes>

            <Route path='/register' element={<Register/>}/>
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/*" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
              <Route path="user"         element={<User />} />
              <Route path="test"         element={<Test />} />
              <Route path="question"    element={<Question />} />
            
            </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default AdminRoute
