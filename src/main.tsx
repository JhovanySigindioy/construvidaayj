import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { ListsProvider } from './context/ListsContext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  // Punto de inicio de la aplicaion
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ListsProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ListsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)