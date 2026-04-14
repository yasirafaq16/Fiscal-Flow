import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import Transaction from '../models/Transaction.js'

const router = express.Router()

router.use(requireAuth)

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

router.post('/', async (req, res) => {
  const { label, category, amount, date, type } = req.body
  if (!label || !category || !date || !type || !Number.isFinite(Number(amount))) {
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
      date,
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
    const next = {
      label: req.body.label ? String(req.body.label).trim() : current.label,
      category: req.body.category ? String(req.body.category).trim() : current.category,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : current.amount,
      date: req.body.date || current.date,
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
