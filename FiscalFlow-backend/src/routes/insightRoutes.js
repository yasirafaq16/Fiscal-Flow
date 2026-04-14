import express from 'express'
import { spawn } from 'child_process'

const router = express.Router()

router.post('/xgboost', async (req, res) => {
  const { earnings = [], savings = [], expenditures = [], targetSavingsRate = 0.25 } = req.body || {}

  const pythonPayload = JSON.stringify({
    earnings,
    savings,
    expenditures,
    targetSavingsRate
  })

  const pythonCmd = process.env.PYTHON_CMD || 'python'
  const py = spawn(pythonCmd, ['src/ai/xgboost_insights.py'], {
    stdio: ['pipe', 'pipe', 'pipe']
  })

  let stdout = ''
  let stderr = ''

  py.stdout.on('data', (chunk) => {
    stdout += chunk.toString()
  })
  py.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  py.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({
        message: 'XGBoost insight generation failed',
        details: stderr || 'Python process exited with error'
      })
    }
    try {
      const parsed = JSON.parse(stdout || '{}')
      return res.json(parsed)
    } catch {
      return res.status(500).json({ message: 'Invalid XGBoost response format' })
    }
  })

  py.stdin.write(pythonPayload)
  py.stdin.end()
})

export default router
