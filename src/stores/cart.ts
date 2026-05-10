import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { CartItem, Transaction } from '@/types'
import { sendCheckoutAlert } from '@/lib/telegram'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const cashierName = ref('')
  const paymentMethod = ref<string>('cash')
  const amountPaid = ref(0)

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  )

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const change = computed(() => amountPaid.value - totalAmount.value)

  function addToCart(product: CartItem['product'], quantity = 1) {
    const existing = items.value.find((item) => item.product.id === product.id)
    if (existing) {
      if (existing.quantity < product.stock) {
        existing.quantity += quantity
      }
    } else {
      items.value.push({ product, quantity })
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find((item) => item.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        items.value = items.value.filter((i) => i.product.id !== productId)
      } else if (quantity <= item.product.stock) {
        item.quantity = quantity
      }
    }
  }

  function removeFromCart(productId: string) {
    items.value = items.value.filter((item) => item.product.id !== productId)
  }

  function clearCart() {
    items.value = []
    amountPaid.value = 0
  }

  async function checkout(): Promise<{ data: Transaction | null; error: any }> {
    if (items.value.length === 0 || amountPaid.value < totalAmount.value) {
      return { data: null, error: 'Invalid checkout' }
    }

    // 1. Insert transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        total_amount: totalAmount.value,
        payment_method: paymentMethod.value,
        amount_paid: amountPaid.value,
        change_amount: change.value,
        cashier_name: cashierName.value || null,
      })
      .select()
      .single()

    if (txError || !transaction) return { data: null, error: txError }

    // 2. Insert transaction items
    const itemsToInsert = items.value.map((item) => ({
      transaction_id: transaction.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      subtotal: item.product.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(itemsToInsert)

    if (itemsError) return { data: null, error: itemsError }

    // 3. Update stock using relative decrement
    for (const item of items.value) {
      const { error: stockErr } = await supabase
        .from('products')
        .update({ stock: item.product.stock - item.quantity })
        .eq('id', item.product.id)

      if (stockErr) {
        console.error('Failed to update stock for', item.product.name, stockErr.message)
      }

      // 4. Create stock alert if below threshold
      const newStock = item.product.stock - item.quantity
      if (newStock <= item.product.min_stock) {
        const { error: alertErr } = await supabase
          .from('stock_alerts')
          .insert({
            product_id: item.product.id,
            product_name: item.product.name,
            current_stock: newStock,
            min_stock: item.product.min_stock,
            alert_type: newStock <= 0 ? 'out_of_stock' : 'low_stock',
          })
        if (alertErr) console.error('Failed to create stock alert:', alertErr.message)
      }

      // 5. Auto-deactivate product when stock is 0 or less
      if (newStock <= 0) {
        const { error: deactErr } = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', item.product.id)
        if (deactErr) console.error('Failed to deactivate product:', deactErr.message)
      }
    }

    // 5. Telegram notification
    sendCheckoutAlert(
      transaction.invoice_number,
      transaction.total_amount,
      items.value.map((i) => ({ name: i.product.name, quantity: i.quantity }))
    )

    clearCart()

    return { data: transaction as Transaction, error: null }
  }

  return {
    items,
    cashierName,
    paymentMethod,
    amountPaid,
    totalAmount,
    totalItems,
    change,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
  }
})
