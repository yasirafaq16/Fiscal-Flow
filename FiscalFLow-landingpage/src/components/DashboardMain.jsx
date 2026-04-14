import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Sparkles, ShieldCheck } from 'lucide-react'
import { createTransaction, deleteTransaction, getTransactions, getXgboostInsights } from '../api/client'
import { getToken } from '../auth/auth'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts'

function formatMoney(n) {
  const v = Number.isFinite(n) ? n : 0
  // Keep it simple (no locale assumptions about currency).
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
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

const CHART_COLORS = ['#2563eb', '#16a34a', '#eab308', '#ea580c', '#9333ea', '#0d9488', '#334155']
const GUEST_STORAGE_KEY = 'fiscalflow_guest_transactions_v1'

function localId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function generateAiRecommendation({
  savingsItems,
  expenditureItems,
  targetSavingsRate,
  savingsCategories,
  expenditureCategories
}) {
  const totalSavings = computeTotals(savingsItems)
  const totalExpenditure = computeTotals(expenditureItems)
  const denom = totalSavings + totalExpenditure

  if (denom === 0) {
    return [
      'Add at least one savings and/or expenditure entry to unlock AI insights.',
      'Once you start tracking, Fiscal Flow will highlight your biggest spending categories and suggest practical adjustments.'
    ]
  }

  const savingsRate = denom === 0 ? 0 : totalSavings / denom
  const topExCats = totalsByCategory(expenditureItems).sort(sortDesc).slice(0, 3)
  const topSavingsCats = totalsByCategory(savingsItems).sort(sortDesc).slice(0, 2)

  const insights = []

  // Savings rate insight
  if (savingsRate < targetSavingsRate) {
    const gap = targetSavingsRate - savingsRate
    const needed = gap * denom // How much more savings you likely need
    const suggestionReduce = totalExpenditure > 0 ? needed * (1 - targetSavingsRate) : needed

    const reduceText =
      totalExpenditure > 0
        ? `try reducing spending by about ${formatMoney(suggestionReduce)} (or increasing savings by ~${formatMoney(needed)}).`
        : `try increasing savings by ~${formatMoney(needed)}.`

    insights.push(
      `Your current savings rate is ~${Math.round(savingsRate * 100)}%. To reach your target (${Math.round(
        targetSavingsRate * 100
      )}%), ${reduceText}`
    )
  } else {
    insights.push(
      `Nice work: your savings rate is ~${Math.round(savingsRate * 100)}%, which meets/exceeds your target (${Math.round(
        targetSavingsRate * 100
      )}%). Keep it up!`
    )
  }

  // Spending category concentration insight
  if (totalExpenditure > 0 && topExCats.length > 0) {
    const top = topExCats[0]
    const share = top.total / totalExpenditure
    if (share >= 0.3) {
      insights.push(
        `Your largest expenditure category is “${top.category}” (~${Math.round(share * 100)}% of total spending). Consider setting a weekly cap and using that cap to guide smaller decisions.`
      )
    } else {
      insights.push(
        `Your spending is fairly diversified (top category is ~${Math.round(share * 100)}%). A good next step is to optimize one category instead of trying to cut everything.`
      )
    }
  }

  // Actionable category suggestions
  if (totalExpenditure > 0 && topExCats.length >= 2) {
    const second = topExCats[1]
    const secondShare = second.total / totalExpenditure
    if (secondShare >= 0.15) {
      insights.push(
        `Target “${second.category}” for a small change: reducing it by ~10% could free up ~${formatMoney(
          second.total * 0.1
        )} without impacting your whole month.`
      )
    }
  }

  // Savings concentration insight
  if (topSavingsCats.length > 0) {
    const best = topSavingsCats[0]
    insights.push(
      `Your strongest savings category is “${best.category}” (${formatMoney(best.total)}). If that category is tied to a goal, consider adding a recurring contribution to keep it consistent.`
    )
  }

  // Category hygiene suggestions
  if (savingsCategories.length === 0 || expenditureCategories.length === 0) {
    insights.push('Create a few categories (e.g., “Food”, “Transport”, “Emergency Fund”) so recommendations can be more specific.')
  }

  insights.push('Want more accuracy? Add dates to your entries (so recommendations can learn from recent patterns).')

  return insights
}

const DashboardMain = () => {
  const [earningCategories, setEarningCategories] = useState(['Salary', 'Freelance', 'Business', 'Other'])
  const [savingsCategories, setSavingsCategories] = useState(['Emergency Fund', 'Retirement', 'Goals'])
  const [expenditureCategories, setExpenditureCategories] = useState(['Food', 'Transport', 'Utilities', 'Entertainment'])

  const [earningItems, setEarningItems] = useState([])
  const [savingsItems, setSavingsItems] = useState([])
  const [expenditureItems, setExpenditureItems] = useState([])

  const [activeTab, setActiveTab] = useState('both') // 'savings' | 'expenditure' | 'both'

  const [newEarningCategory, setNewEarningCategory] = useState('')
  const [newSavingsCategory, setNewSavingsCategory] = useState('')
  const [newExpenditureCategory, setNewExpenditureCategory] = useState('')

  const todayStr = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const [earningForm, setEarningForm] = useState({
    label: '',
    category: '',
    newCategory: '',
    amount: '',
    savedAmount: '',
    date: todayStr
  })

  const [savingsForm, setSavingsForm] = useState({
    label: '',
    category: '',
    newCategory: '',
    amount: '',
    date: todayStr
  })

  const [expenditureForm, setExpenditureForm] = useState({
    label: '',
    category: '',
    newCategory: '',
    amount: '',
    date: todayStr
  })

  const [targetSavingsRate, setTargetSavingsRate] = useState(0.25)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState([])
  const [actionError, setActionError] = useState('')

  // Load user transactions from backend (auth) or local storage (guest)
  useEffect(() => {
    let mounted = true
    async function loadTransactions() {
      const token = getToken()
      if (!token) {
        try {
          const raw = localStorage.getItem(GUEST_STORAGE_KEY)
          const parsed = raw ? JSON.parse(raw) : []
          if (!mounted || !Array.isArray(parsed)) return
          setEarningItems(parsed.filter((x) => x.type === 'earning'))
          setSavingsItems(parsed.filter((x) => x.type === 'savings'))
          setExpenditureItems(parsed.filter((x) => x.type === 'expenditure'))
        } catch {
          // ignore malformed local guest data
        }
        return
      }
      try {
        const items = await getTransactions()
        if (!mounted) return
        setEarningItems(items.filter((x) => x.type === 'earning'))
        setSavingsItems(items.filter((x) => x.type === 'savings'))
        setExpenditureItems(items.filter((x) => x.type === 'expenditure'))
      } catch (e) {
        if (!mounted) return
        setAiInsights(['Could not load transactions from backend. Make sure API is running on port 5000.'])
      }
    }
    loadTransactions()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (getToken()) return
    const combined = [...earningItems, ...savingsItems, ...expenditureItems]
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(combined))
  }, [earningItems, savingsItems, expenditureItems])

  const totalEarnings = useMemo(() => computeTotals(earningItems), [earningItems])
  const totalSavings = useMemo(() => computeTotals(savingsItems), [savingsItems])
  const totalExpenditure = useMemo(() => computeTotals(expenditureItems), [expenditureItems])
  const savingsRate = totalEarnings === 0 ? 0 : totalSavings / totalEarnings
  const netBalance = totalEarnings - totalExpenditure

  const earningsByCategory = useMemo(() => totalsByCategory(earningItems).sort(sortDesc), [earningItems])
  const savingsByCategory = useMemo(() => totalsByCategory(savingsItems).sort(sortDesc), [savingsItems])
  const expenditureByCategory = useMemo(() => totalsByCategory(expenditureItems).sort(sortDesc), [expenditureItems])
  const comparisonData = useMemo(
    () => [
      { name: 'Earnings', total: totalEarnings },
      { name: 'Savings', total: totalSavings },
      { name: 'Expenditure', total: totalExpenditure }
    ],
    [totalEarnings, totalSavings, totalExpenditure]
  )

  const monthlyTrendData = useMemo(() => {
    const map = new Map()
    const pushItem = (item, key) => {
      const month = (item.date || '').slice(0, 7) || 'Unknown'
      const curr = map.get(month) || { month, earning: 0, expenditure: 0, savings: 0 }
      curr[key] += Number(item.amount) || 0
      map.set(month, curr)
    }
    earningItems.forEach((x) => pushItem(x, 'earning'))
    expenditureItems.forEach((x) => pushItem(x, 'expenditure'))
    savingsItems.forEach((x) => pushItem(x, 'savings'))
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
  }, [earningItems, expenditureItems, savingsItems])

  const canRemoveCategory = (category, items) => !items.some((x) => x.category === category)

  const addCategory = (type) => {
    if (type === 'earning') {
      const name = newEarningCategory.trim()
      if (!name) return
      setEarningCategories((prev) => (prev.includes(name) ? prev : [...prev, name]))
      setNewEarningCategory('')
      return
    }
    if (type === 'savings') {
      const name = newSavingsCategory.trim()
      if (!name) return
      setSavingsCategories((prev) => (prev.includes(name) ? prev : [...prev, name]))
      setNewSavingsCategory('')
      return
    }
    const name = newExpenditureCategory.trim()
    if (!name) return
    setExpenditureCategories((prev) => (prev.includes(name) ? prev : [...prev, name]))
    setNewExpenditureCategory('')
  }

  const removeCategory = (type, category) => {
    if (type === 'earning') {
      if (!canRemoveCategory(category, earningItems)) return
      setEarningCategories((prev) => prev.filter((c) => c !== category))
      return
    }
    if (type === 'savings') {
      if (!canRemoveCategory(category, savingsItems)) return
      setSavingsCategories((prev) => prev.filter((c) => c !== category))
      return
    }
    if (!canRemoveCategory(category, expenditureItems)) return
    setExpenditureCategories((prev) => prev.filter((c) => c !== category))
  }

  const addSavings = async (e) => {
    e.preventDefault()
    setActionError('')
    const amount = Number(savingsForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) return

    const categoryChoice =
      savingsForm.category === '__new__'
        ? savingsForm.newCategory.trim()
        : savingsForm.category.trim()

    if (!categoryChoice) return

    // If user entered a new category, add it to the category list.
    if (savingsForm.category === '__new__') {
      setSavingsCategories((prev) => (prev.includes(categoryChoice) ? prev : [...prev, categoryChoice]))
    }

    const payload = {
      label: savingsForm.label.trim() || 'Savings',
      category: categoryChoice,
      amount,
      date: savingsForm.date,
      type: 'savings'
    }
    try {
      if (getToken()) {
        const created = await createTransaction(payload)
        setSavingsItems((prev) => [...prev, created])
      } else {
        setSavingsItems((prev) => [...prev, { ...payload, id: localId() }])
      }
    } catch (err) {
      setActionError(err.message || 'Could not add savings entry')
      return
    }

    setSavingsForm({ label: '', category: '', newCategory: '', amount: '', date: todayStr })
  }

  const addEarning = async (e) => {
    e.preventDefault()
    setActionError('')
    const amount = Number(earningForm.amount)
    const savedAmount = Number(earningForm.savedAmount || 0)
    if (!Number.isFinite(amount) || amount <= 0) return
    if (!Number.isFinite(savedAmount) || savedAmount < 0 || savedAmount > amount) {
      setActionError('Saved amount should be between 0 and earning amount')
      return
    }

    const categoryChoice =
      earningForm.category === '__new__'
        ? earningForm.newCategory.trim()
        : earningForm.category.trim()

    if (!categoryChoice) return
    if (earningForm.category === '__new__') {
      setEarningCategories((prev) => (prev.includes(categoryChoice) ? prev : [...prev, categoryChoice]))
    }

    const earningPayload = {
      label: earningForm.label.trim() || 'Earning',
      category: categoryChoice,
      amount,
      date: earningForm.date,
      type: 'earning'
    }
    const savingsPayload = {
      label: `Saved from ${earningPayload.label}`,
      category: 'Income Savings',
      amount: savedAmount,
      date: earningForm.date,
      type: 'savings'
    }

    try {
      if (getToken()) {
        const createdEarning = await createTransaction(earningPayload)
        setEarningItems((prev) => [...prev, createdEarning])
        if (savedAmount > 0) {
          const createdSaving = await createTransaction(savingsPayload)
          setSavingsItems((prev) => [...prev, createdSaving])
          setSavingsCategories((prev) => (prev.includes('Income Savings') ? prev : [...prev, 'Income Savings']))
        }
      } else {
        setEarningItems((prev) => [...prev, { ...earningPayload, id: localId() }])
        if (savedAmount > 0) {
          setSavingsItems((prev) => [...prev, { ...savingsPayload, id: localId() }])
          setSavingsCategories((prev) => (prev.includes('Income Savings') ? prev : [...prev, 'Income Savings']))
        }
      }
    } catch (err) {
      setActionError(err.message || 'Could not add earning entry')
      return
    }
    setEarningForm({ label: '', category: '', newCategory: '', amount: '', savedAmount: '', date: todayStr })
  }

  const addExpenditure = async (e) => {
    e.preventDefault()
    setActionError('')
    const amount = Number(expenditureForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) return

    const categoryChoice =
      expenditureForm.category === '__new__'
        ? expenditureForm.newCategory.trim()
        : expenditureForm.category.trim()

    if (!categoryChoice) return

    if (expenditureForm.category === '__new__') {
      setExpenditureCategories((prev) => (prev.includes(categoryChoice) ? prev : [...prev, categoryChoice]))
    }

    const payload = {
      label: expenditureForm.label.trim() || 'Expenditure',
      category: categoryChoice,
      amount,
      date: expenditureForm.date,
      type: 'expenditure'
    }
    try {
      if (getToken()) {
        const created = await createTransaction(payload)
        setExpenditureItems((prev) => [...prev, created])
      } else {
        setExpenditureItems((prev) => [...prev, { ...payload, id: localId() }])
      }
    } catch (err) {
      setActionError(err.message || 'Could not add expenditure entry')
      return
    }

    setExpenditureForm({ label: '', category: '', newCategory: '', amount: '', date: todayStr })
  }

  const removeItem = async (type, id) => {
    setActionError('')
    try {
      if (getToken()) {
        await deleteTransaction(id)
      }
      if (type === 'savings') setSavingsItems((prev) => prev.filter((x) => x.id !== id))
      else setExpenditureItems((prev) => prev.filter((x) => x.id !== id))
    } catch (err) {
      setActionError(err.message || 'Could not remove entry')
    }
  }

  const resetAll = () => {
    const ok = window.confirm('Reset all savings and expenditure entries?')
    if (!ok) return
    setEarningItems([])
    setSavingsItems([])
    setExpenditureItems([])
    setEarningCategories(['Salary', 'Freelance', 'Business', 'Other'])
    setSavingsCategories(['Emergency Fund', 'Retirement', 'Goals'])
    setExpenditureCategories(['Food', 'Transport', 'Utilities', 'Entertainment'])
    setTargetSavingsRate(0.25)
    setAiInsights([])
  }

  const onGenerateAi = async () => {
    setAiLoading(true)
    setAiInsights([])
    try {
      const result = await getXgboostInsights({
        earnings: earningItems,
        savings: savingsItems,
        expenditures: expenditureItems,
        targetSavingsRate
      })
      if (Array.isArray(result?.insights) && result.insights.length > 0) {
        setAiInsights(result.insights)
      } else {
        throw new Error('No insights from model')
      }
    } catch {
      const insights = generateAiRecommendation({
        savingsItems,
        expenditureItems,
        targetSavingsRate,
        savingsCategories,
        expenditureCategories
      })
      setAiInsights([
        'XGBoost endpoint unavailable, showing fallback insights.',
        ...insights
      ])
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Add savings and expenditures, categorize them, and get smart recommendations at the end.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={
                'px-4 py-2 rounded-xl border transition ' +
                (activeTab === 'both' ? 'bg-black text-white border-black' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50')
              }
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('savings')}
              className={
                'px-4 py-2 rounded-xl border transition ' +
                (activeTab === 'savings'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-white border-slate-200 text-slate-700 hover:bg-slate-50')
              }
            >
              Savings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('expenditure')}
              className={
                'px-4 py-2 rounded-xl border transition ' +
                (activeTab === 'expenditure'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-white border-slate-200 text-slate-700 hover:bg-slate-50')
              }
            >
              Expenditure
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="ml-2 px-4 py-2 rounded-xl border border-slate-200 text-white text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'both' && (
            <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Earnings</h2>
                  <p className="text-slate-600 mt-1">Add earnings and auto-track the saved part.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="text-2xl font-black text-slate-900">{formatMoney(totalEarnings)}</div>
                </div>
              </div>

              <form onSubmit={addEarning} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Label</label>
                  <input
                    value={earningForm.label}
                    onChange={(e) => setEarningForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g., Salary"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Category</label>
                  <select
                    value={earningForm.category}
                    onChange={(e) => setEarningForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  >
                    <option value="">Select</option>
                    {earningCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">+ New category</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={earningForm.amount}
                    onChange={(e) => setEarningForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Saved Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={earningForm.savedAmount}
                    onChange={(e) => setEarningForm((p) => ({ ...p, savedAmount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Date</label>
                  <input
                    type="date"
                    value={earningForm.date}
                    onChange={(e) => setEarningForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                {earningForm.category === '__new__' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New Category</label>
                    <input
                      value={earningForm.newCategory}
                      onChange={(e) => setEarningForm((p) => ({ ...p, newCategory: e.target.value }))}
                      placeholder="Type category name"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                    />
                  </div>
                ) : (
                  <div />
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                  >
                    Add Earning
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <h3 className="font-bold text-slate-900">Categories</h3>
                <div className="mt-3 flex gap-2">
                  <input
                    value={newEarningCategory}
                    onChange={(e) => setNewEarningCategory(e.target.value)}
                    placeholder="Add category..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => addCategory('earning')}
                    className="px-4 py-3 rounded-xl bg-black text-white font-bold hover:bg-slate-800 transition"
                    disabled={!newEarningCategory.trim()}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {(activeTab === 'both' || activeTab === 'savings') && (
            <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Savings</h2>
                  <p className="text-slate-600 mt-1">Track what you save and where it goes.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="text-2xl font-black text-slate-900">{formatMoney(totalSavings)}</div>
                </div>
              </div>

              <form onSubmit={addSavings} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Label</label>
                  <input
                    value={savingsForm.label}
                    onChange={(e) => setSavingsForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g., Salary savings"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Category</label>
                  <select
                    value={savingsForm.category}
                    onChange={(e) => setSavingsForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  >
                    <option value="">Select</option>
                    {savingsCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">+ New category</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={savingsForm.amount}
                    onChange={(e) => setSavingsForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Date</label>
                  <input
                    type="date"
                    value={savingsForm.date}
                    onChange={(e) => setSavingsForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                {savingsForm.category === '__new__' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New Category</label>
                    <input
                      value={savingsForm.newCategory}
                      onChange={(e) => setSavingsForm((p) => ({ ...p, newCategory: e.target.value }))}
                      placeholder="Type category name"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                    />
                  </div>
                ) : (
                  <div />
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Savings
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-900">Categories</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {savingsCategories.map((c) => {
                    const used = savingsItems.some((x) => x.category === c)
                    return (
                      <span
                        key={c}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        {c}
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-700"
                          title={used ? 'Category in use (remove transactions first)' : 'Remove category'}
                          onClick={() => !used && removeCategory('savings', c)}
                          disabled={used}
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    )
                  })}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={newSavingsCategory}
                    onChange={(e) => setNewSavingsCategory(e.target.value)}
                    placeholder="Add category..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => addCategory('savings')}
                    className="px-4 py-3 rounded-xl bg-black text-white font-bold hover:bg-slate-800 transition"
                    disabled={!newSavingsCategory.trim()}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-slate-900">Saved Entries</h3>
                {savingsItems.length === 0 ? (
                  <p className="text-slate-500 mt-3">No savings entries yet.</p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500">
                          <th className="py-2">Label</th>
                          <th className="py-2">Category</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Date</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {savingsItems.map((item) => (
                          <tr key={item.id} className="border-t border-slate-100">
                            <td className="py-3">{item.label}</td>
                            <td className="py-3">{item.category}</td>
                            <td className="py-3 font-semibold text-slate-900">{formatMoney(item.amount)}</td>
                            <td className="py-3 text-slate-600">{item.date}</td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => removeItem('savings', item.id)}
                                className="text-slate-400 hover:text-slate-800 transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {savingsByCategory.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-slate-900">Savings by Category</h3>
                  <div className="mt-3 space-y-2">
                    {savingsByCategory.slice(0, 5).map((x) => (
                      <div key={x.category} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{x.category}</span>
                        <span className="font-semibold text-slate-900">{formatMoney(x.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {(activeTab === 'both' || activeTab === 'expenditure') && (
            <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Expenditure</h2>
                  <p className="text-slate-600 mt-1">Track your spending so you can plan better.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="text-2xl font-black text-slate-900">{formatMoney(totalExpenditure)}</div>
                </div>
              </div>

              <form onSubmit={addExpenditure} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Label</label>
                  <input
                    value={expenditureForm.label}
                    onChange={(e) => setExpenditureForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g., Groceries"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Category</label>
                  <select
                    value={expenditureForm.category}
                    onChange={(e) => setExpenditureForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  >
                    <option value="">Select</option>
                    {expenditureCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">+ New category</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenditureForm.amount}
                    onChange={(e) => setExpenditureForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Date</label>
                  <input
                    type="date"
                    value={expenditureForm.date}
                    onChange={(e) => setExpenditureForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                </div>

                {expenditureForm.category === '__new__' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">New Category</label>
                    <input
                      value={expenditureForm.newCategory}
                      onChange={(e) => setExpenditureForm((p) => ({ ...p, newCategory: e.target.value }))}
                      placeholder="Type category name"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                    />
                  </div>
                ) : (
                  <div />
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Expenditure
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-900">Categories</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {expenditureCategories.map((c) => {
                    const used = expenditureItems.some((x) => x.category === c)
                    return (
                      <span
                        key={c}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        {c}
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-700"
                          title={used ? 'Category in use (remove transactions first)' : 'Remove category'}
                          onClick={() => !used && removeCategory('expenditure', c)}
                          disabled={used}
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    )
                  })}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={newExpenditureCategory}
                    onChange={(e) => setNewExpenditureCategory(e.target.value)}
                    placeholder="Add category..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => addCategory('expenditure')}
                    className="px-4 py-3 rounded-xl bg-black text-white font-bold hover:bg-slate-800 transition"
                    disabled={!newExpenditureCategory.trim()}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-slate-900">Expenditure Entries</h3>
                {expenditureItems.length === 0 ? (
                  <p className="text-slate-500 mt-3">No expenditure entries yet.</p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500">
                          <th className="py-2">Label</th>
                          <th className="py-2">Category</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Date</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenditureItems.map((item) => (
                          <tr key={item.id} className="border-t border-slate-100">
                            <td className="py-3">{item.label}</td>
                            <td className="py-3">{item.category}</td>
                            <td className="py-3 font-semibold text-slate-900">{formatMoney(item.amount)}</td>
                            <td className="py-3 text-slate-600">{item.date}</td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => removeItem('expenditure', item.id)}
                                className="text-slate-400 hover:text-slate-800 transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {expenditureByCategory.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-slate-900">Expenditure by Category</h3>
                  <div className="mt-3 space-y-2">
                    {expenditureByCategory.slice(0, 5).map((x) => (
                      <div key={x.category} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{x.category}</span>
                        <span className="font-semibold text-slate-900">{formatMoney(x.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <section className="mt-6 bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
          {actionError ? <p className="text-sm text-red-600 mb-3">{actionError}</p> : null}
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={20} /> AI Recommendations
              </h2>
              <p className="text-slate-600 mt-1">Track earnings first, then spending and savings for more realistic insights.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Target</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.01"
                  value={targetSavingsRate}
                  onChange={(e) => setTargetSavingsRate(Number(e.target.value))}
                />
                <span className="font-bold text-slate-900 w-16 text-right">{Math.round(targetSavingsRate * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Earnings</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatMoney(totalEarnings)}</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Savings</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatMoney(totalSavings)}</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Expenditure</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatMoney(totalExpenditure)}</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Savings Rate</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{Math.round(savingsRate * 100)}%</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Balance</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatMoney(netBalance)}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <h3 className="font-bold text-slate-900">Monthly Trend</h3>
              {monthlyTrendData.length === 0 ? (
                <p className="text-sm text-slate-600 mt-3">Add entries with dates to see monthly trend.</p>
              ) : (
                <div className="h-64 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatMoney(Number(value))} />
                      <Legend />
                      <Area type="monotone" dataKey="earning" stackId="1" stroke="#2563eb" fill="#93c5fd" />
                      <Area type="monotone" dataKey="savings" stackId="2" stroke="#16a34a" fill="#86efac" />
                      <Area type="monotone" dataKey="expenditure" stackId="3" stroke="#ef4444" fill="#fca5a5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <h3 className="font-bold text-slate-900">Earnings, Savings, Expenditure</h3>
              {totalEarnings === 0 && totalSavings === 0 && totalExpenditure === 0 ? (
                <p className="text-sm text-slate-600 mt-3">Add entries to compare totals visually.</p>
              ) : (
                <div className="h-64 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatMoney(Number(value))} />
                      <Bar dataKey="total">
                        <Cell fill="#2563eb" />
                        <Cell fill="#16a34a" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
            <h3 className="font-bold text-slate-900">Category Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {[{ title: 'Earnings', data: earningsByCategory }, { title: 'Savings', data: savingsByCategory }, { title: 'Expenditure', data: expenditureByCategory }].map((block, blockIdx) => (
                <div key={block.title} className="border border-slate-100 rounded-xl p-3">
                  <p className="font-semibold text-slate-800">{block.title}</p>
                  {block.data.length === 0 ? (
                    <p className="text-sm text-slate-500 mt-2">No data</p>
                  ) : (
                    <div className="h-44 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={block.data} dataKey="total" nameKey="category" outerRadius={60}>
                            {block.data.map((_, idx) => (
                              <Cell key={`${blockIdx}-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatMoney(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-start">
            <div className="flex-1">
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <ShieldCheck className="text-blue-700 mt-0.5" size={18} />
                <div>
                  <div className="font-bold text-slate-900">How the “AI” works</div>
                  <p className="text-slate-700 text-sm mt-1">
                    It analyzes category totals and your target savings rate to produce actionable guidance.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={onGenerateAi}
                  className="mb-3 bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 inline-flex items-center gap-2"
                  disabled={aiLoading}
                >
                  <Sparkles size={18} />
                  {aiLoading ? 'Thinking...' : 'Get Insight'}
                </button>
                {aiLoading && (
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="text-slate-700">Generating recommendations...</p>
                  </div>
                )}

                {!aiLoading && aiInsights.length > 0 && (
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="font-bold text-slate-900">Your insights</div>
                    <div className="mt-3 space-y-2">
                      {aiInsights.map((t, idx) => (
                        <p key={idx} className="text-slate-700 text-sm leading-relaxed">
                          {t}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {!aiLoading && aiInsights.length === 0 && (
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="text-slate-700">
                      Click <span className="font-bold">Generate</span> to get recommendations based on your current entries.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="w-full md:w-80">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="font-bold text-slate-900">Top Categories</div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Expenditure</div>
                    {expenditureByCategory.length === 0 ? (
                      <p className="text-sm text-slate-600 mt-2">Add expenses to see the top categories.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {expenditureByCategory.slice(0, 4).map((x) => (
                          <div key={x.category} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 truncate pr-3">{x.category}</span>
                            <span className="font-semibold text-slate-900">{formatMoney(x.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Savings</div>
                    {savingsByCategory.length === 0 ? (
                      <p className="text-sm text-slate-600 mt-2">Add savings to see the top categories.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {savingsByCategory.slice(0, 4).map((x) => (
                          <div key={x.category} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 truncate pr-3">{x.category}</span>
                            <span className="font-semibold text-slate-900">{formatMoney(x.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardMain

