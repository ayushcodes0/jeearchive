import React from 'react'
import AdminRoute from './routes/adminRoute'
import './font.css'
import { Toaster } from 'react-hot-toast';


const App = () => {
  return (<>
    <Toaster position="top-right" reverseOrder={false} />
    <AdminRoute/>
  </>
    
  )
}

export default App
