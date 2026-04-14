import mongoose from 'mongoose'

export async function connectDb() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in .env')
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB || 'FiscalFLow'
  })
}
