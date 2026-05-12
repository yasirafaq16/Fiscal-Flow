import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }
  return secret
}

function createToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, username: user.username },
    getJwtSecret(),
    { expiresIn: '1d' }
  )
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword
    })

    const token = createToken(user)
    return res.status(201).json({
      token,
      user: { id: user._id.toString(), username: user.username, email: user.email }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = createToken(user)
    return res.json({
      token,
      user: { id: user._id.toString(), username: user.username, email: user.email }
    })
  } catch {
    return res.status(500).json({ message: 'Login failed' })
  }
})

export default router




// import express from 'express'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'
// import User from '../models/User.js'

// const router = express.Router()

// function getJwtSecret() {
//   const secret = process.env.JWT_SECRET?.trim()
//   if (!secret) {
//     throw new Error('JWT_SECRET is not configured')
//   }
//   return secret
// }

// function createToken(user) {
//   return jwt.sign(
//     { userId: user._id.toString(), email: user.email, username: user.username },
//     getJwtSecret(),
//     { expiresIn: '1d' }
//   )
// }

// // REGISTER
// router.post('/register', async (req, res) => {
//   try {
//     const { username, email, password } = req.body
    
//     if (!username || !email || !password) {
//       return res.status(400).json({ message: 'Username, email and password are required' })
//     }

//     const normalizedEmail = email.trim().toLowerCase()
    
//     // Check if user exists
//     const existing = await User.findOne({ email: normalizedEmail })
//     if (existing) {
//       return res.status(409).json({ message: 'Email already registered' })
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10)
    
//     // Create user
//     const user = await User.create({
//       username: username.trim(),
//       email: normalizedEmail,
//       password: hashedPassword
//     })

//     const token = createToken(user)
    
//     return res.status(201).json({
//       token,
//       user: { id: user._id.toString(), username: user.username, email: user.email }
//     })
//   } catch (error) {
//     console.error('Register error:', error)
//     return res.status(500).json({ message: 'Registration failed' })
//   }
// })

// // LOGIN
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body
    
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' })
//     }

//     const normalizedEmail = email.trim().toLowerCase()
    
//     // Find user
//     const user = await User.findOne({ email: normalizedEmail })
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' })
//     }

//     // Check password
//     const valid = await bcrypt.compare(password, user.password)
//     if (!valid) {
//       return res.status(401).json({ message: 'Invalid credentials' })
//     }

//     const token = createToken(user)
    
//     return res.json({
//       token,
//       user: { id: user._id.toString(), username: user.username, email: user.email }
//     })
//   } catch (error) {
//     console.error('Login error:', error)
//     return res.status(500).json({ message: 'Login failed' })
//   }
// })

// export default router