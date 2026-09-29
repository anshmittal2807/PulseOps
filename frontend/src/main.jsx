import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import Router from './router/Router.jsx'
import { DemoProvider } from './context/DemoContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DemoProvider>
        <Router />
      </DemoProvider>
    </AuthProvider>
    </StrictMode>,
)
