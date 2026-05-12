import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import transactionRoutes from "./routes/transactionRoutes.js"
import insightRoutes from "./routes/insightRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"

const app = express()

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const configured = process.env.CLIENT_URL?.trim()
      if (configured && origin === configured) return callback(null, true)
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
      if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true)
      return callback(new Error("Not allowed by CORS"))
    }
  })
)
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ ok: true })
})

app.use("/api/auth", authRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/insights", insightRoutes)
app.use("/api/profile", profileRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" })
})

export default app
