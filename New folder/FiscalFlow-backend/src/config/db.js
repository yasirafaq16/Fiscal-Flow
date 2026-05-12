import mongoose from 'mongoose'

export async function connectDb() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/'
  const dbName = (process.env.MONGODB_DB || 'fiscalflow').trim()

  console.log(`Connecting to MongoDB at ${mongoUri} (db: ${dbName})...`)
  await mongoose.connect(mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 5000
  })

  const actualDbName = mongoose.connection?.name || dbName
  console.log(`MongoDB connected (${actualDbName})`)
}
