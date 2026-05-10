export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'kasir'
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category_id: string | null
  description: string | null
  price: number
  cost_price: number
  stock: number
  min_stock: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Transaction {
  id: string
  invoice_number: string
  total_amount: number
  payment_method: string
  amount_paid: number
  change_amount: number
  cashier_name: string | null
  notes: string | null
  created_at: string
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  subtotal: number
  product?: Product
}

export interface StockAlert {
  id: string
  product_id: string
  product_name: string
  current_stock: number
  min_stock: number
  alert_type: string
  is_resolved: boolean
  created_at: string
  resolved_at: string | null
}

export interface LowStockProduct {
  id: string
  name: string
  sku: string
  stock: number
  min_stock: number
  category_name: string | null
  alert_level: 'habis' | 'kritis' | 'menipis'
}
