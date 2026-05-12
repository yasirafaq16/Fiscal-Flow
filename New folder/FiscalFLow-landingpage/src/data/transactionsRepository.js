import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from '../api/client'
import { getToken } from '../auth/auth'

const GUEST_STORAGE_KEY = 'fiscalflow_guest_transactions_v1'

const localId = () => Math.random().toString(16).slice(2) + Date.now().toString(16)
const getItemId = (item) => item?.id || item?._id

function readGuest() {
  const raw = localStorage.getItem(GUEST_STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? parsed : []
}

function writeGuest(items) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items))
}

export function getTransactionsRepository() {
  const token = getToken()
  const mode = token ? 'api' : 'guest'

  if (mode === 'api') {
    return {
      mode,
      async list() {
        return await getTransactions()
      },
      async create(payload) {
        return await createTransaction(payload)
      },
      async update(id, patch) {
        return await updateTransaction(id, patch)
      },
      async remove(id) {
        await deleteTransaction(id)
      }
    }
  }

  return {
    mode,
    async list() {
      return readGuest()
    },
    async create(payload) {
      const created = { ...payload, id: localId() }
      const next = [...readGuest(), created]
      writeGuest(next)
      return created
    },
    async update(id, patch) {
      const items = readGuest()
      const next = items.map((it) => (getItemId(it) === id ? { ...it, ...patch } : it))
      writeGuest(next)
      return next.find((it) => getItemId(it) === id)
    },
    async remove(id) {
      const items = readGuest()
      const next = items.filter((it) => getItemId(it) !== id)
      writeGuest(next)
    }
  }
}

export { GUEST_STORAGE_KEY, getItemId }

