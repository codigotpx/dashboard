import { useCallback, useMemo, useState } from 'react'
import { DataContext } from './data-context'
import { fetchDashboardData } from '../services/api'

export const DataProvider = ({ children }) => {
  const [resources, setResources] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})

  const fetchData = useCallback(async () => {
    setLoading(prev => ({ ...prev, dashboard: true }))
    setErrors(prev => ({ ...prev, dashboard: null }))
    try {
      const result = await fetchDashboardData()
      setResources(prev => ({ ...prev, dashboard: result }))
      return result
    } catch (err) {
      setErrors(prev => ({ ...prev, dashboard: err }))
      throw err
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }))
    }
  }, [])

  const fetchResource = useCallback(async (name, apiFn) => {
    setLoading(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: null }))
    try {
      const result = await apiFn()
      setResources(prev => ({ ...prev, [name]: result }))
      return result
    } catch (err) {
      setErrors(prev => ({ ...prev, [name]: err }))
      throw err
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }, [])

  const clearData = useCallback(() => {
    setResources({})
    setErrors({})
  }, [])

  const value = useMemo(
    () => ({
      resources,
      loading,
      errors,
      fetchData,
      fetchResource,
      clearData
    }),
    [resources, loading, errors, fetchData, fetchResource, clearData]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
