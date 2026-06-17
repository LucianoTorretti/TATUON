import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    const unsub = init()
    return () => unsub && unsub()
  }, [init])

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#26241F',
            border: '1px solid #EDE4D3',
            borderRadius: '0.9rem',
            boxShadow: '0 8px 30px rgba(38,36,31,0.12)',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#2F4A3C', secondary: '#fff' } },
          error: { iconTheme: { primary: '#B5653F', secondary: '#fff' } },
        }}
      />
    </>
  )
}
