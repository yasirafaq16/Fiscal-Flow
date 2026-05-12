import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import Transaction from '../models/Transaction.js'

const router = express.Router()

router.use(requireAuth)

function parseDateOrNull(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

router.get('/', async (req, res) => {
  try {
    const userItems = await Transaction.find({ userId: req.user.userId }).sort({ createdAt: 1 }).lean()
    return res.json(
      userItems.map((item) => ({
        ...item,
        id: item._id.toString()
      }))
    )
  } catch {
    return res.status(500).json({ message: 'Failed to fetch transactions' })
  }
})

// Distinct categories (optionally filtered by type)
router.get('/categories', async (req, res) => {
  try {
    const { type } = req.query
    if (type && type !== 'earning' && type !== 'savings' && type !== 'expenditure') {
      return res.status(400).json({ message: "type must be 'earning', 'savings' or 'expenditure'" })
    }

    const filter = { userId: req.user.userId }
    if (type) filter.type = type
    const categories = await Transaction.distinct('category', filter)
    return res.json(categories.sort((a, b) => String(a).localeCompare(String(b))))
  } catch {
    return res.status(500).json({ message: 'Failed to fetch categories' })
  }
})

// Summary totals (optional from/to ISO date strings)
router.get('/summary', async (req, res) => {
  try {
    const from = parseDateOrNull(req.query.from)
    const to = parseDateOrNull(req.query.to)
    if ((req.query.from && !from) || (req.query.to && !to)) {
      return res.status(400).json({ message: 'from/to must be valid date strings' })
    }

    const match = { userId: req.user.userId }
    if (from || to) {
      match.date = {}
      if (from) match.date.$gte = from
      if (to) match.date.$lte = to
    }

    const rows = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' }
        }
      }
    ])

    const totalsByType = { earning: 0, savings: 0, expenditure: 0 }
    const totalsByCategory = { earning: {}, savings: {}, expenditure: {} }

    for (const r of rows) {
      const type = r?._id?.type
      const category = r?._id?.category
      const total = Number(r?.total || 0)
      if (!type || !totalsByType[type]) {
        // allow zeros, but skip unknown types
      }
      if (type === 'earning' || type === 'savings' || type === 'expenditure') {
        totalsByType[type] += total
        totalsByCategory[type][category] = (totalsByCategory[type][category] || 0) + total
      }
    }

    return res.json({ totalsByType, totalsByCategory })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch summary' })
  }
})

router.post('/', async (req, res) => {
  const { label, category, amount, date, type } = req.body
  const parsedDate = parseDateOrNull(date)
  if (!label || !category || !parsedDate || !type || !Number.isFinite(Number(amount))) {
    return res.status(400).json({ message: 'label, category, amount, date and type are required' })
  }
  if (type !== 'earning' && type !== 'savings' && type !== 'expenditure') {
    return res.status(400).json({ message: "type must be 'earning', 'savings' or 'expenditure'" })
  }

  try {
    const item = await Transaction.create({
      userId: req.user.userId,
      label: String(label).trim(),
      category: String(category).trim(),
      amount: Number(amount),
      date: parsedDate,
      type
    })
    return res.status(201).json({
      ...item.toObject(),
      id: item._id.toString()
    })
  } catch {
    return res.status(500).json({ message: 'Failed to create transaction' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const current = await Transaction.findOne({ _id: id, userId: req.user.userId })
    if (!current) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    const nextDate = req.body.date ? parseDateOrNull(req.body.date) : current.date
    if (req.body.date && !nextDate) {
      return res.status(400).json({ message: 'date must be a valid date string' })
    }
    const next = {
      label: req.body.label ? String(req.body.label).trim() : current.label,
      category: req.body.category ? String(req.body.category).trim() : current.category,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : current.amount,
      date: nextDate,
      type: req.body.type || current.type
    }

    if (!Number.isFinite(next.amount) || next.amount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' })
    }
    if (next.type !== 'earning' && next.type !== 'savings' && next.type !== 'expenditure') {
      return res.status(400).json({ message: "type must be 'earning', 'savings' or 'expenditure'" })
    }

    current.label = next.label
    current.category = next.category
    current.amount = next.amount
    current.date = next.date
    current.type = next.type
    const saved = await current.save()
    return res.json({
      ...saved.toObject(),
      id: saved._id.toString()
    })
  } catch {
    return res.status(400).json({ message: 'Invalid transaction id or update failed' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Transaction.findOneAndDelete({ _id: id, userId: req.user.userId })
    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' })
    }
    return res.status(204).send()
  } catch {
    return res.status(400).json({ message: 'Invalid transaction id or delete failed' })
  }
})

export default router
