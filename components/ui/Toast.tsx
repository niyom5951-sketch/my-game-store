"use client"
import { useEffect, useState, createContext, useContext, useCallback } from "react"

type ToastType = "success" | "error" | "info"
type ToastItem = { id: number; message: string; type: ToastType }

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void
}>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10)
    return () => clearTimeout(t)
  }, [])

  const styles = {
    success: {
      bg: "bg-emerald-600",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: "bg-red-600",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    info: {
      bg: "bg-blue-600",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }[toast.type]

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 ${styles.bg} text-white pl-4 pr-5 py-3 rounded-2xl shadow-2xl min-w-[260px] max-w-sm transition-all duration-300 ${
        show ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
      }`}
    >
      <div className="bg-white/20 rounded-full p-1.5 flex-shrink-0">{styles.icon}</div>
      <p className="font-bold text-sm">{toast.message}</p>
    </div>
  )
}