import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { ListsProvider } from './context/ListsContext.tsx'

createRoot(document.getElementById('root')!).render(
  // Punto de inicio de la aplicaion
  <StrictMode>
    <AuthProvider>
      <ListsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ListsProvider>
    </AuthProvider>
  </StrictMode>,
)
