import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './stores/auth.store'
import axios from 'axios'

const token = localStorage.getItem('accessToken')
if (token) {
  axios.get('/api/me', { headers: { Authorization: `Bearer ${token}` } })
    .then(res => {
      useAuthStore.getState().setAuth(res.data.data, token)
    })
    .catch(() => {
      useAuthStore.getState().clearAuth()
    })
    .finally(() => {
      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
    })
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
