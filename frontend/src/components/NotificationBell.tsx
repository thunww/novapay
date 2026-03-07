import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { notificationApi } from '../api/notification'
import { useAuthStore } from '../stores/auth.store'
import { Notification } from '../types'
import { Badge } from '@/components/ui/badge'

export default function NotificationBell() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    notificationApi.getAll()
      .then(res => setNotifications(res.data.data || []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!user?.id) return

    // Disconnect cũ nếu có
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const socket = io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join', user.id)
    })

    socket.on('notification', (data: Notification) => {
      setNotifications(prev => [data, ...prev])
    })


    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user?.id])

  const handleMarkAll = async () => {
    await notificationApi.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-slate-100">
        🔔
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {unreadCount}
          </Badge>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-medium text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-blue-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-500">No notifications</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`p-3 border-b text-sm ${!n.isRead ? "bg-blue-50" : ""}`}>
                  <p>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
