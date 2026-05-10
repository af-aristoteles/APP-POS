import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Transaction, TransactionItem } from '@/types'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const selectedTransaction = ref<Transaction | null>(null)
  const transactionItems = ref<TransactionItem[]>([])
  const loading = ref(false)

  async function fetchTransactions() {
    loading.value = true
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) transactions.value = data as Transaction[]
    loading.value = false
  }

  async function fetchTransactionItems(transactionId: string) {
    const { data, error } = await supabase
      .from('transaction_items')
      .select('*, product:products(*)')
      .eq('transaction_id', transactionId)
    if (!error && data) transactionItems.value = data as TransactionItem[]
  }

  async function getDailySales(date?: string) {
    const query = supabase
      .from('transactions')
      .select('total_amount')
    if (date) {
      query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`)
    }
    const { data, error } = await query
    if (error) return { total: 0, count: 0 }
    return {
      total: data.reduce((sum, t) => sum + Number(t.total_amount), 0),
      count: data.length,
    }
  }

  async function getMonthlySales(month?: string) {
    const query = supabase
      .from('transactions')
      .select('total_amount, created_at')
    if (month) {
      query.gte('created_at', `${month}-01T00:00:00`).lte('created_at', `${month}-31T23:59:59`)
    }
    const { data, error } = await query
    if (error) return { total: 0, count: 0, dailyData: [] }

    const dailyMap: Record<string, number> = {}
    data.forEach((t) => {
      const day = new Date(t.created_at).toISOString().split('T')[0] ?? ''
      dailyMap[day] = (dailyMap[day] || 0) + Number(t.total_amount)
    })

    return {
      total: data.reduce((sum, t) => sum + Number(t.total_amount), 0),
      count: data.length,
      dailyData: Object.entries(dailyMap).map(([date, total]) => ({ date, total })),
    }
  }

  return {
    transactions,
    selectedTransaction,
    transactionItems,
    loading,
    fetchTransactions,
    fetchTransactionItems,
    getDailySales,
    getMonthlySales,
  }
})
