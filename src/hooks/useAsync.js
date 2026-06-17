import { useState, useEffect, useCallback } from 'react'

// Hook genérico para cargar datos async con estados loading/error
export const useAsync = (asyncFn, deps = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn()
      setData(result)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    let active = true
    setLoading(true)
    asyncFn()
      .then((result) => active && setData(result))
      .catch((e) => active && setError(e))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, reload: run, setData }
}
