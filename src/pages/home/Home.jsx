import { useEffect } from 'react'
import { useData } from '../../context/useData'
import { fetchOrders, fetchLowStockProducts, fetchBestSellingProducts } from '../../services/api'
import InfoCard from './components/InfoCard'

const Home = () => {
  const { resources, loading, errors, fetchResource } = useData()

  useEffect(() => {
    fetchResource('orders', fetchOrders)
    fetchResource('lowStock', fetchLowStockProducts)
    fetchResource('bestSelling', fetchBestSellingProducts)
  }, [fetchResource])

  const orders = resources.orders ?? []

  const delivered = orders.filter(o => o.status === 'DELIVERED')
  const shipped = orders.filter(o => o.status === 'SHIPPED')
  const cancelled = orders.filter(o => o.status === 'CANCELLED')

  return (
    <section className=''>
      <InfoCard
        totalOrders={orders.length}
        deliveredCount={delivered.length}
        shippedCount={shipped.length}
        cancelledCount={cancelled.length}
        lowStock={resources.lowStock}
        bestSelling={resources.bestSelling}
        loading={loading}
        errors={errors}
      />
    </section>
  )
}

export default Home
