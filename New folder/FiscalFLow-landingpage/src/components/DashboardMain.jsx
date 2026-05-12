import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Sparkles, LayoutGrid, Wallet, PiggyBank, TrendingUp, Calendar, ChevronDown, Upload } from 'lucide-react'
import logo from '../assets/letter-f.png'
import * as XLSX from 'xlsx'
import { createTransaction, deleteTransaction, getTransactions, loginUser, registerUser, getXgboostInsights } from '../api/client'
import { getToken, setToken, setUser, getUser } from '../auth/auth'
import {
  ResponsiveContainer,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts'

function formatMoney(n) {
  const v = Number.isFinite(n) ? n : 0
  return '₹' + v.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function formatMoneyShort(n) {
  const v = Number.isFinite(n) ? n : 0
  if (v >= 100000) return '₹' + (v / 100000).toFixed(1) + 'L'
  if (v >= 1000) return '₹' + (v / 1000).toFixed(1) + 'K'
  return '₹' + v.toFixed(0)
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function computeTotals(items) {
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
}

function totalsByCategory(items) {
  const map = new Map()
  for (const item of items) {
    const cat = item.category?.trim() || 'Uncategorized'
    map.set(cat, (map.get(cat) || 0) + (Number(item.amount) || 0))
  }
  return Array.from(map.entries()).map(([category, total]) => ({ category, total }))
}

function sortDesc(a, b) {
  return b.total - a.total
}

const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b', '#f97316']

const GUEST_STORAGE_KEY = 'fiscalflow_guest_data_v2'

function localId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function getItemId(item) {
  return item?.id || item?._id
}

function normalizeTransaction(item) {
  if (!item) return item
  return {
    ...item,
    id: item.id || item._id || localId()
  }
}

function generateAiInsights({ totalEarnings, totalSavings, totalExpenditure, savingsRate, targetSavingsRate }) {
  const insights = []
  
  if (totalEarnings === 0 && totalExpenditure === 0 && totalSavings === 0) {
    insights.push('Start by adding your earnings and expenses to get personalized AI insights.')
    return insights
  }

  if (savingsRate >= targetSavingsRate) {
    insights.push(`Great work! Your savings rate is ${Math.round(savingsRate * 100)}%, meeting your ${Math.round(targetSavingsRate * 100)}% target.`)
  } else {
    const gap = targetSavingsRate - savingsRate
    const needed = gap * totalEarnings
    insights.push(`Your savings rate is ${Math.round(savingsRate * 100)}%. To reach your ${Math.round(targetSavingsRate * 100)}% target, try saving an additional ${formatMoney(needed)}.`)
  }

  if (totalExpenditure > 0) {
    const burnRate = totalExpenditure / 30
    const runway = totalSavings / (burnRate || 1)
    if (runway < 30) {
      insights.push(`Your savings could cover ${Math.round(runway)} days of expenses. Consider building a larger emergency fund.`)
    } else {
      insights.push(`Your savings could cover ${Math.round(runway)} days of expenses. Good emergency fund!`)
    }
  }

  if (totalEarnings > 0) {
    const expenseRatio = totalExpenditure / totalEarnings
    if (expenseRatio > 0.8) {
      insights.push(`You're spending ${Math.round(expenseRatio * 100)}% of your earnings. Try to keep this under 70% for healthy finances.`)
    } else {
      insights.push(`You're spending ${Math.round(expenseRatio * 100)}% of your earnings. Good expense control!`)
    }
  }

  return insights
}

function DashboardMain() {
  // Try to load from localStorage FIRST (before setting initial state)
  const savedData = typeof window !== 'undefined' ? localStorage.getItem(GUEST_STORAGE_KEY) : null
  const parsedData = savedData ? JSON.parse(savedData) : null

  const [activeTab, setActiveTab] = useState('ALL')
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken())
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')

  // Data states - use saved data or defaults
  const [earningItems, setEarningItems] = useState(parsedData?.earningItems || [
    { id: '1', label: 'Salary', category: 'Salary', amount: 65000, date: '2026-02-01', type: 'earning' },
    { id: '2', label: 'Salary', category: 'Salary', amount: 65000, date: '2026-01-01', type: 'earning' }
  ])
  const [savingsItems, setSavingsItems] = useState(parsedData?.savingsItems || [
    { id: '3', label: 'Emergency Fund', category: 'Emergency Fund', amount: 50000, date: '2026-02-01', type: 'savings' }
  ])
  const [expenditureItems, setExpenditureItems] = useState(parsedData?.expenditureItems || [])

  // Categories
  const [categories, setCategories] = useState({
    earning: ['Salary', 'Freelance', 'Business', 'Investment', 'Other'],
    savings: ['Emergency Fund', 'Retirement', 'Investment', 'Goals', 'Other'],
    expenditure: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Rent', 'Other']
  })

  // AI states
  const [aiInsights, setAiInsights] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [targetSavingsRate, setTargetSavingsRate] = useState(0.30)

  // Form states
  const [formType, setFormType] = useState('Earning')
  const [formLabel, setFormLabel] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formDate, setFormDate] = useState(() => {
    const d = new Date()
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
  })
  const [formCategory, setFormCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  // Auth form states
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authUsername, setAuthUsername] = useState('')

  // Load data from backend on mount if logged in
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoggedIn(false)
      return
    }
    
    const loadData = async () => {
      try {
        const items = await getTransactions()
        setEarningItems(items.filter(x => x.type === 'earning').map(normalizeTransaction))
        setSavingsItems(items.filter(x => x.type === 'savings').map(normalizeTransaction))
        setExpenditureItems(items.filter(x => x.type === 'expenditure').map(normalizeTransaction))
        setIsLoggedIn(true)
      } catch (err) {
        console.error('Failed to load transactions:', err)
        setIsLoggedIn(false)
      }
    }
    loadData()
  }, [])

  // Save to localStorage for guest mode (when not logged in)
  useEffect(() => {
    if (getToken()) return // Don't save if logged in (backend handles it)
    const data = { earningItems, savingsItems, expenditureItems }
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data))
  }, [earningItems, savingsItems, expenditureItems])

  // Calculate totals
  const totalEarnings = useMemo(() => computeTotals(earningItems), [earningItems])
  const totalSavings = useMemo(() => computeTotals(savingsItems), [savingsItems])
  const totalExpenditure = useMemo(() => computeTotals(expenditureItems), [expenditureItems])
  const netBalance = totalEarnings - (totalExpenditure + totalSavings)
  const savingsRate = totalEarnings > 0 ? totalSavings / totalEarnings : 0

  // Cash Flow Analytics Data
  const monthlyTrendData = useMemo(() => {
    const map = new Map()
    
    earningItems.forEach(item => {
      const month = (item.date || '').slice(0, 7) || 'Unknown'
      const curr = map.get(month) || { month, earning: 0, savings: 0, expenditure: 0 }
      curr.earning += Number(item.amount) || 0
      map.set(month, curr)
    })
    
    savingsItems.forEach(item => {
      const month = (item.date || '').slice(0, 7) || 'Unknown'
      const curr = map.get(month) || { month, earning: 0, savings: 0, expenditure: 0 }
      curr.savings += Number(item.amount) || 0
      map.set(month, curr)
    })
    
    expenditureItems.forEach(item => {
      const month = (item.date || '').slice(0, 7) || 'Unknown'
      const curr = map.get(month) || { month, earning: 0, savings: 0, expenditure: 0 }
      curr.expenditure += Number(item.amount) || 0
      map.set(month, curr)
    })
    
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
  }, [earningItems, savingsItems, expenditureItems])

  // Categories Data
  const categoriesData = useMemo(() => {
    const allItems = [...earningItems, ...savingsItems, ...expenditureItems]
    const byCat = totalsByCategory(allItems).sort(sortDesc).slice(0, 8)
    return byCat
  }, [earningItems, savingsItems, expenditureItems])

  // Handle transaction submission
  const handlePostTransaction = async (e) => {
    e.preventDefault()
    const amount = Number(formAmount)
    if (!formLabel || !amount || amount <= 0) return

    const category = showNewCategory ? newCategory.trim() : formCategory
    if (!category) return

    if (showNewCategory && newCategory.trim()) {
      const typeKey = formType.toLowerCase()
      setCategories(prev => ({
        ...prev,
        [typeKey]: prev[typeKey].includes(newCategory.trim()) 
          ? prev[typeKey] 
          : [...prev[typeKey], newCategory.trim()]
      }))
    }

    const type = formType.toLowerCase()
    const newItem = {
      id: localId(),
      label: formLabel.trim(),
      category: category,
      amount: amount,
      date: formDate.split('-').reverse().join('-'),
      type: type
    }

    try {
      if (isLoggedIn) {
        const created = await createTransaction(newItem)
        const normalized = normalizeTransaction(created)
        if (type === 'earning') setEarningItems(prev => [...prev, normalized])
        else if (type === 'savings') setSavingsItems(prev => [...prev, normalized])
        else setExpenditureItems(prev => [...prev, normalized])
      } else {
        if (type === 'earning') setEarningItems(prev => [...prev, newItem])
        else if (type === 'savings') setSavingsItems(prev => [...prev, newItem])
        else setExpenditureItems(prev => [...prev, newItem])
      }
    } catch (err) {
      console.error('Failed to add transaction:', err)
      alert('Failed to save transaction. Please try again.')
    }

    setFormLabel('')
    setFormAmount('')
    setFormCategory('')
    setNewCategory('')
    setShowNewCategory(false)
  }

  // Delete item
  const deleteItem = async (type, id) => {
    // Remove from local state immediately (regardless of backend result)
    if (type === 'earning') setEarningItems(prev => prev.filter(x => getItemId(x) !== id))
    else if (type === 'savings') setSavingsItems(prev => prev.filter(x => getItemId(x) !== id))
    else setExpenditureItems(prev => prev.filter(x => getItemId(x) !== id))

    // Try to delete from backend too
    if (isLoggedIn) {
      try {
        await deleteTransaction(id)
      } catch (err) {
        console.error('Failed to delete from backend:', err)
      }
    }
  }

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    try {
      const result = await loginUser({ email: authEmail, password: authPassword })
      if (result.token) {
        setToken(result.token)
        setUser(result.user)
        setIsLoggedIn(true)
        setShowAuthModal(false)
        // Load user data
        const items = await getTransactions()
        setEarningItems(items.filter(x => x.type === 'earning').map(normalizeTransaction))
        setSavingsItems(items.filter(x => x.type === 'savings').map(normalizeTransaction))
        setExpenditureItems(items.filter(x => x.type === 'expenditure').map(normalizeTransaction))
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your credentials.')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthError('')
    if (!authUsername || !authEmail || !authPassword) {
      setAuthError('Please fill in all fields')
      return
    }
    try {
      const result = await registerUser({ username: authUsername, email: authEmail, password: authPassword })
      if (result.token) {
        setToken(result.token)
        setUser(result.user)
        setIsLoggedIn(true)
        setShowAuthModal(false)
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Email might already exist.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('fiscalflow_token')
    localStorage.removeItem('fiscalflow_user')
    setIsLoggedIn(false)
    setEarningItems([])
    setSavingsItems([])
    setExpenditureItems([])
  }

  // Run AI Diagnostics
  const runAiDiagnostics = async () => {
    setAiLoading(true)
    try {
      if (isLoggedIn) {
        const result = await getXgboostInsights({
          earnings: earningItems,
          savings: savingsItems,
          expenditures: expenditureItems,
          targetSavingsRate
        })
        if (result?.insights?.length > 0) {
          setAiInsights(result.insights)
        } else {
          throw new Error('No insights from API')
        }
      } else {
        throw new Error('Guest mode - using local AI')
      }
    } catch (err) {
      const insights = generateAiInsights({
        totalEarnings,
        totalSavings,
        totalExpenditure,
        savingsRate,
        targetSavingsRate
      })
      setAiInsights(insights)
    } finally {
      setAiLoading(false)
    }
  }

  // Get last 10 items for display
  const getRecentItems = (items) => {
    return [...items].reverse().slice(0, 10)
  }

  const displayedEarnings = activeTab === 'ALL' || activeTab === 'EARNINGS' ? earningItems : []
  const displayedSavings = activeTab === 'ALL' || activeTab === 'SAVINGS' ? savingsItems : []
  const displayedExpenditure = activeTab === 'ALL' || activeTab === 'EXPENDITURE' ? expenditureItems : []

  const recentEarnings = getRecentItems(displayedEarnings)
  const recentSavings = getRecentItems(displayedSavings)
  const recentExpenditure = getRecentItems(displayedExpenditure)

  const currentCategories = categories[formType.toLowerCase()] || []

  // Import from Excel
  const importFromExcel = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onerror = () => {
      console.error('[FiscalFlow] FileReader error')
      alert('Failed to read the file. Please try again.')
    }
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        console.log('[FiscalFlow] Workbook sheets:', wb.SheetNames)

        const currentUser = getUser()
        const userId = currentUser?._id || currentUser?.id || null

        const newEarnings = []
        const newSavings = []
        const newExpenditure = []

        // Helper: normalize row keys by trimming whitespace (Excel headers often have extra spaces)
        const normalizeRow = (row) => {
          const normalized = {}
          for (const key of Object.keys(row)) {
            const cleanKey = key.trim()
            normalized[cleanKey] = row[key]
            // Also add lowercase version for case-insensitive matching
            normalized[cleanKey.toLowerCase()] = row[key]
          }
          return normalized
        }

        // Helper: get value from row by trying multiple header variations
        const getVal = (row, ...keys) => {
          for (const k of keys) {
            if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k]
          }
          return undefined
        }

        // Helper: parse amount robustly — strips currency symbols, commas,
        // handles accounting parentheses (5,000) → 5000, and always returns
        // a positive number since the type field already determines the category.
        const parseAmount = (raw) => {
          if (raw === undefined || raw === null) return 0
          if (typeof raw === 'number') return Math.abs(raw)
          let s = String(raw).trim()
          // Accounting parentheses: (5,000) or (5000)
          const parenMatch = s.match(/^\((.+)\)$/)
          if (parenMatch) s = '-' + parenMatch[1]
          // Strip currency symbols and spaces
          s = s.replace(/[₹$€£\s]/g, '')
          // Remove thousands separators (commas between digits)
          s = s.replace(/(\d),(?=\d)/g, '$1')
          const n = Number(s)
          return Math.abs(isFinite(n) ? n : 0)
        }

        // Helper: convert Excel date serial number or string to YYYY-MM-DD
        const parseExcelDate = (val) => {
          if (!val) return new Date().toISOString().split('T')[0]
          if (typeof val === 'number') {
            const utc_days = Math.floor(val - 25569)
            const utc_secs = utc_days * 86400
            const date = new Date(utc_secs * 1000)
            const y = date.getUTCFullYear()
            const m = String(date.getUTCMonth() + 1).padStart(2, '0')
            const d = String(date.getUTCDate()).padStart(2, '0')
            return `${y}-${m}-${d}`
          }
          const str = String(val).trim()
          if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
          const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
          if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
          const mdy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
          if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`
          const parsed = new Date(str)
          if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear()
            const m = String(parsed.getMonth() + 1).padStart(2, '0')
            const d = String(parsed.getDate()).padStart(2, '0')
            return `${y}-${m}-${d}`
          }
          return new Date().toISOString().split('T')[0]
        }

        // Helper: determine item type from sheet name or row data
        const inferType = (sheetName, row) => {
          const nameLower = sheetName.toLowerCase()
          if (nameLower.includes('earning') || nameLower.includes('income') || nameLower.includes('revenue')) return 'earning'
          if (nameLower.includes('saving')) return 'savings'
          if (nameLower.includes('expenditure') || nameLower.includes('expense')) return 'expenditure'
          // Check if row has a Type column
          const typeVal = String(getVal(row, 'Type', 'type', 'TransactionType', 'transactionType', 'Transaction_Type') || '').toLowerCase()
          if (typeVal.includes('earning') || typeVal.includes('income')) return 'earning'
          if (typeVal.includes('saving')) return 'savings'
          if (typeVal.includes('expenditure') || typeVal.includes('expense')) return 'expenditure'
          // Default to expenditure so data is not lost
          return 'expenditure'
        }

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName]
          const rawRows = XLSX.utils.sheet_to_json(ws, { raw: true, defval: '' })
          console.log(`[FiscalFlow] Sheet "${sheetName}": ${rawRows.length} raw rows`)
          if (rawRows.length > 0) {
            console.log(`[FiscalFlow] Sheet "${sheetName}" headers:`, Object.keys(rawRows[0]))
            console.log(`[FiscalFlow] Sheet "${sheetName}" first row:`, rawRows[0])
          }

          // Normalize row keys to handle whitespace and case differences
          const rows = rawRows.map(normalizeRow)

          for (const row of rows) {
            const label = getVal(row, 'Label', 'label', 'Name', 'name', 'Description', 'description', 'Item', 'item') || ''
            const category = getVal(row, 'Category', 'category', 'Cat', 'cat', 'Group', 'group') || 'Other'
            const amountRaw = getVal(row, 'Amount', 'amount', 'Value', 'value', 'Total', 'total', 'Price', 'price')
            const amount = parseAmount(amountRaw)
            const dateRaw = getVal(row, 'Date', 'date', 'Dt', 'dt')
            const date = parseExcelDate(dateRaw)
            const type = inferType(sheetName, row)

            if (amount === 0 && !label) continue // skip completely empty rows

            const item = {
              id: localId(),
              label: String(label).trim(),
              category: String(category).trim() || 'Other',
              amount,
              date,
              type,
              ...(userId && { userId })
            }

            if (type === 'earning') newEarnings.push(item)
            else if (type === 'savings') newSavings.push(item)
            else newExpenditure.push(item)
          }
        }

        const totalImported = newEarnings.length + newSavings.length + newExpenditure.length
        console.log('[FiscalFlow] Import result:', { newEarnings: newEarnings.length, newSavings: newSavings.length, newExpenditure: newExpenditure.length, totalImported })

        // Save to backend or localStorage
        // Always add to local state first so data is visible immediately.
        // If logged in, also try to persist to backend (failures don't lose data).
        if (newEarnings.length > 0) {
          setEarningItems(prev => [...prev, ...newEarnings])
          if (isLoggedIn) {
            for (const item of newEarnings) {
              try {
                await createTransaction(item)
              } catch (e) {
                console.error('[FiscalFlow] Error saving earning to backend (kept locally):', e?.message || e)
              }
            }
          }
        }
        if (newSavings.length > 0) {
          setSavingsItems(prev => [...prev, ...newSavings])
          if (isLoggedIn) {
            for (const item of newSavings) {
              try {
                await createTransaction(item)
              } catch (e) {
                console.error('[FiscalFlow] Error saving saving to backend (kept locally):', e?.message || e)
              }
            }
          }
        }
        if (newExpenditure.length > 0) {
          setExpenditureItems(prev => [...prev, ...newExpenditure])
          if (isLoggedIn) {
            for (const item of newExpenditure) {
              try {
                await createTransaction(item)
              } catch (e) {
                console.error('[FiscalFlow] Error saving expenditure to backend (kept locally):', e?.message || e)
              }
            }
          }
        }

        if (totalImported === 0) {
          alert('No data found in the Excel file. Make sure your sheet has columns: Label, Category, Amount, Date and the sheet name includes "earning", "saving", or "expenditure".')
        } else {
          alert(`Data imported successfully! ${newEarnings.length} earnings, ${newSavings.length} savings, ${newExpenditure.length} expenditures.`)
        }
      } catch (err) {
        console.error('[FiscalFlow] Import error:', err)
        alert('Import failed: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src={logo} alt="Fiscal Flow" className="w-8 h-8 rounded-lg" />
              <h1 className="text-3xl font-bold text-slate-900">Fiscal Flow</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Professional Financial Oversight</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/import-guide" className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline transition">Sample format</Link>
            <label className="flex items-center gap-2 px-4 py-2 text-emerald-600 shadow-sm border hover:border-green-600 h rounded-xl text-sm font-semibold transition cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Excel
              <input type="file" accept=".xlsx,.xls,.csv" onChange={importFromExcel} className="hidden" />
            </label>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">{authMode === 'login' ? 'Login' : 'Register'}</h2>
                <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              {authError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{authError}</div>
              )}
              
              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3">
                {authMode === 'register' && (
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                >
                  {authMode === 'login' ? 'Login' : 'Register'}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login')
                    setAuthError('')
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
              </div>
              
              <p className="mt-3 text-xs text-slate-400 text-center">
                Guest mode: Your data is saved locally on this device.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">Total Income</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatMoney(totalEarnings)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">Total Savings</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatMoney(totalSavings)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">Expenditure</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatMoney(totalExpenditure)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">Net Balance</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatMoney(netBalance)}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cash Flow Analytics */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-900">Cash Flow Analytics</h3>
            </div>
            <div className="h-64">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatMoneyShort} />
                    <Tooltip formatter={(value, name) => [formatMoney(Number(value)), name]} />
                    <Line type="monotone" dataKey="earning" stroke="#3b82f6" strokeWidth={2} dot={{r: 3}} name="Earnings" />
                    <Line type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} dot={{r: 3}} name="Savings" />
                    <Line type="monotone" dataKey="expenditure" stroke="#f97316" strokeWidth={2} dot={{r: 3}} name="Expenditure" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Add transactions to see cash flow analytics
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Categories</h3>
              </div>
            </div>
            <div className="h-64">
              {categoriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriesData} layout="vertical" margin={{ left: 80, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="category" width={75} tick={{fontSize: 10}} interval={0} />
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
                      {categoriesData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Add categorized transactions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI + Transaction Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Optimization */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <h3 className="font-semibold">AI Optimization</h3>
              </div>
              <button 
                onClick={runAiDiagnostics}
                disabled={aiLoading}
                className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-medium hover:bg-slate-700 transition disabled:opacity-50"
              >
                {aiLoading ? 'Analyzing...' : 'Run Diagnostics'}
              </button>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 max-h-32 overflow-y-auto">
              {aiInsights.length > 0 ? (
                <ul className="space-y-2">
                  {aiInsights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-yellow-400">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Click "Run Diagnostics" to get AI-powered insights about your finances.</p>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">Target Savings Rate:</span>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={targetSavingsRate}
                onChange={(e) => setTargetSavingsRate(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-xs text-yellow-400">{Math.round(targetSavingsRate * 100)}%</span>
            </div>
          </div>

          {/* Record Transaction */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4">Record Transaction</h3>
            <form onSubmit={handlePostTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select 
                  value={formType} 
                  onChange={(e) => {
                    setFormType(e.target.value)
                    setFormCategory('')
                    setShowNewCategory(false)
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Earning</option>
                  <option>Savings</option>
                  <option>Expenditure</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="Entry Label"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="Amount"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Category Selection */}
              <div className="space-y-2">
                <select 
                  value={showNewCategory ? '__new__' : formCategory} 
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setShowNewCategory(true)
                      setFormCategory('')
                    } else {
                      setShowNewCategory(false)
                      setFormCategory(e.target.value)
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {currentCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__new__">+ Add New Category</option>
                </select>
                
                {showNewCategory && (
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                )}
              </div>
              
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Post Transaction
              </button>
            </form>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['ALL', 'EARNINGS', 'SAVINGS', 'EXPENDITURE'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Earnings</h3>
              <span className="text-xs text-slate-500">{displayedEarnings.length} total</span>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {recentEarnings.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No entries yet.</p>
              ) : (
                recentEarnings.map(item => (
                  <div key={getItemId(item)} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.category} • {formatDate(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-semibold text-slate-900 whitespace-nowrap">{formatMoney(item.amount)}</span>
                      <button onClick={() => deleteItem('earning', getItemId(item))} className="p-1.5 text-slate-400 hover:text-red-500 transition flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {displayedEarnings.length > 10 && (
              <p className="text-xs text-slate-400 text-center mt-2">Scroll to see more...</p>
            )}
          </div>

          {/* Savings */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Savings</h3>
              <span className="text-xs text-slate-500">{displayedSavings.length} total</span>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {recentSavings.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No entries yet.</p>
              ) : (
                recentSavings.map(item => (
                  <div key={getItemId(item)} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.category} • {formatDate(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-semibold text-slate-900 whitespace-nowrap">{formatMoney(item.amount)}</span>
                      <button onClick={() => deleteItem('savings', getItemId(item))} className="p-1.5 text-slate-400 hover:text-red-500 transition flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {displayedSavings.length > 10 && (
              <p className="text-xs text-slate-400 text-center mt-2">Scroll to see more...</p>
            )}
          </div>

          {/* Expenditure */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Expenditure</h3>
              <span className="text-xs text-slate-500">{displayedExpenditure.length} total</span>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {recentExpenditure.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No entries yet.</p>
              ) : (
                recentExpenditure.map(item => (
                  <div key={getItemId(item)} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.category} • {formatDate(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-semibold text-slate-900 whitespace-nowrap">{formatMoney(item.amount)}</span>
                      <button onClick={() => deleteItem('expenditure', getItemId(item))} className="p-1.5 text-slate-400 hover:text-red-500 transition flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {displayedExpenditure.length > 10 && (
              <p className="text-xs text-slate-400 text-center mt-2">Scroll to see more...</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default DashboardMain