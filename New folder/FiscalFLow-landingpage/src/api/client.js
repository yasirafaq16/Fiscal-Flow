import { getToken } from '../auth/auth'

const API_BASE = '/api'

async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function getTransactions() {
  return apiRequest('/transactions')
}

export async function createTransaction(transaction) {
  return apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction)
  })
}

export async function deleteTransaction(id) {
  return apiRequest(`/transactions/${id}`, {
    method: 'DELETE'
  })
}

export async function getXgboostInsights(data) {
  // This endpoint doesn't exist yet, so it will fall back to the local insights
  return apiRequest('/insights/xgboost', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}


// Auth functions
export async function loginUser(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

export async function registerUser(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
}
