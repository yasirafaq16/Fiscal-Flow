import jwt from 'jsonwebtoken'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) return null
  return secret
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' })
  }

  try {
    const secret = getJwtSecret()
    if (!secret) {
      return res.status(500).json({ message: 'Server auth configuration error (JWT_SECRET missing)' })
    }
    const payload = jwt.verify(token, secret)
    req.user = payload
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
