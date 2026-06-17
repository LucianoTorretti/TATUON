import { useState, useCallback } from 'react'
import { DEFAULT_CENTER } from '@/lib/geo'

// Hook de geolocalización (CU-02). Con fallback a comuna por defecto (2.a).
export const useGeolocation = () => {
  const [coords, setCoords] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | granted | denied
  const [error, setError] = useState(null)

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('denied')
      setError('Geolocalización no soportada por el navegador.')
      setCoords(DEFAULT_CENTER)
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('granted')
      },
      () => {
        // Permiso denegado -> fallback a centro por defecto
        setStatus('denied')
        setError('No pudimos acceder a tu ubicación. Usa una comuna manualmente.')
        setCoords(DEFAULT_CENTER)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  const setManual = useCallback((c) => {
    setCoords(c)
    setStatus('granted')
  }, [])

  return { coords, status, error, request, setManual }
}
