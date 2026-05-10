import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Product, Category, LowStockProduct } from '@/types'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)

  const lowStockProducts = computed(() =>
    products.value.filter((p) => p.stock <= p.min_stock && p.is_active)
  )

  const lowStockCount = computed(() => lowStockProducts.value.length)

  async function fetchProducts() {
    loading.value = true
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('name')
    if (!error && data) products.value = data as Product[]
    loading.value = false
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (!error && data) categories.value = data
  }

  async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    if (!error && data) products.value.push(data as Product)
    return { data, error }
  }

  async function updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) products.value[index] = data as Product
    }
    return { data, error }
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) products.value = products.value.filter((p) => p.id !== id)
    return error
  }

  async function addCategory(category: { name: string; description?: string }) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()
    if (!error && data) categories.value.push(data)
    return { data, error }
  }

  async function updateCategory(id: string, updates: { name: string; description?: string }) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      const index = categories.value.findIndex((c) => c.id === id)
      if (index !== -1) categories.value[index] = data
    }
    return { data, error }
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) categories.value = categories.value.filter((c) => c.id !== id)
    return error
  }

  async function fetchLowStockProducts() {
    const { data, error } = await supabase
      .from('v_low_stock_products')
      .select('*')
    return { data: data as LowStockProduct[] | null, error }
  }

  async function fetchLowStockProductsToAlert() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('stock_alerts')
      .select(`
        *,
        product:products(id, name, sku, stock, min_stock, is_active, category:categories(name))
      `)
      .is('is_resolved', false)
      .gte('created_at', today)

    const alertedProductIds = new Set(
      (data || []).map((a: any) => a.product_id)
    )

    const { data: lowStock, error: lowStockErr } = await supabase
      .from('v_low_stock_products')
      .select('*')

    const toAlert = (lowStock || []).filter(
      (p: LowStockProduct) => !alertedProductIds.has(p.id)
    )

    return { data: toAlert as LowStockProduct[], error: error || lowStockErr }
  }

  async function markAlerted(productId: string) {
    await supabase
      .from('stock_alerts')
      .insert({
        product_id: productId,
        product_name: '',
        current_stock: 0,
        min_stock: 0,
        alert_type: 'low_stock',
        is_resolved: false,
      })
  }

  return {
    products,
    categories,
    loading,
    lowStockProducts,
    lowStockCount,
    fetchProducts,
    fetchCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchLowStockProducts,
    fetchLowStockProductsToAlert,
    markAlerted,
  }
})
