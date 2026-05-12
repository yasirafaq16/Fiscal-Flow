import dotenv from 'dotenv'
import app from './app.js'
import { connectDb } from './config/db.js'
import dns from "node:dns/promises"
dns.setServers(["8.8.8.8","1.1.1.1"])
dotenv.config()

const port = Number(process.env.PORT) || 5000
const jwtSecret = process.env.JWT_SECRET?.trim()
if (!jwtSecret) {
  console.error('JWT_SECRET is missing. Set JWT_SECRET in .env before starting FiscalFLow backend.')
  process.exit(1)
}

async function startServer() {
  await connectDb()
  app.listen(port, () => {
    console.log(`FiscalFLow backend running on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error.message)
  process.exit(1)
})
