'use client'

import * as React from 'react'
import { Toast } from './toast'

export interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  icon?: React.ReactNode
  duration?: number
}

interface ToasterContextType {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(
  undefined
)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])
    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToasterContext.Provider
      value={{ toasts, addToast, removeToast, clearToasts }}
    >
      {children}
      <Toaster />
    </ToasterContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToasterProvider')
  }
  return context
}

function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right-full duration-300"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            icon={toast.icon}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}
