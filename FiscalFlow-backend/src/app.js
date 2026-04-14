import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import insightRoutes from './routes/insightRoutes.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/insights', insightRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

export default app
