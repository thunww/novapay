import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { authApi } from '../../api/auth'
import { Button } from '@/components/ui/button'
import NotificationBell from '../NotificationBell'

export default function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    clearAuth()
    navigate('/login')
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-blue-600 text-lg">NovaPay</span>
            <nav className="flex gap-4">
              <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to="/transactions" className={navClass}>Transactions</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="text-sm text-slate-600">{user?.username}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
