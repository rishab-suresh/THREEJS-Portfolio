import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/portfolio', element: <Navigate to="https://portfolio-kappa-gilt-97.vercel.app/" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
