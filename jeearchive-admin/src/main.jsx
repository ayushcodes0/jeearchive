import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './font.css'
import AuthProvider from './context/AuthProvider.jsx'
import TestProvider from './context/TestProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TestProvider>
        <App />
      </TestProvider>
    </AuthProvider>
  </StrictMode>,
)
