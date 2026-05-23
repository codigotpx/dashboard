import { useContext } from 'react'
import { DataContext } from './data-context'

export const useData = () => {
  const context = useContext(DataContext)
  if (context === null) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
