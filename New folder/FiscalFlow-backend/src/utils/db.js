import fs from 'fs/promises'
import path from 'path'

const dataDir = path.resolve(process.cwd(), 'data')
const dbPath = path.join(dataDir, 'db.json')

const defaultDb = {
  users: [],
  transactions: []
}

async function ensureDbFile() {
  await fs.mkdir(dataDir, { recursive: true })
  try {
    await fs.access(dbPath)
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), 'utf8')
  }
}

export async function readDb() {
  await ensureDbFile()
  const raw = await fs.readFile(dbPath, 'utf8')
  const parsed = JSON.parse(raw)
  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
  }
}

export async function writeDb(nextDb) {
  await ensureDbFile()
  await fs.writeFile(dbPath, JSON.stringify(nextDb, null, 2), 'utf8')
}
