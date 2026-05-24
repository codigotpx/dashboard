import { useEffect } from 'react'
import { useData } from '../../context/useData'
import {
  fetchOrders,
  fetchLowStockProducts,
  fetchBestSellingProducts,
  fetchMonthlyIncome,
  fetchProducts,
  fetchCategories,
} from '../../services/api'
import InfoCard from './components/InfoCard'

const Home = () => {
  const { resources, loading, errors, fetchResource } = useData()

  useEffect(() => {
    fetchResource('orders', fetchOrders)
    fetchResource('lowStock', fetchLowStockProducts)
    fetchResource('bestSelling', fetchBestSellingProducts)
    fetchResource('monthlyIncome', fetchMonthlyIncome)
    fetchResource('products', () => fetchProducts(0, 1))
    fetchResource('categories', fetchCategories)
  }, [fetchResource])

  const orders = resources.orders ?? []
  const products = resources.products
  const totalProducts = products?.totalElements ?? 0

  return (
    <section className=''>
      <InfoCard
        orders={orders}
        lowStock={resources.lowStock}
        bestSelling={resources.bestSelling}
        monthlyIncome={resources.monthlyIncome}
        totalProducts={totalProducts}
        categories={resources.categories}
        loading={loading}
        errors={errors}
      />
    </section>
  )
}

export default Home
