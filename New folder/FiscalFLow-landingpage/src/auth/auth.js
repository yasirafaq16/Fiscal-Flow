const TOKEN_KEY = 'fiscalflow_jwt'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Ignore storage failures (private mode, etc.)
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

export function isAuthenticated() {
  const token = getToken()
  return typeof token === 'string' && token.trim().length > 10
}



const USER_KEY = 'fiscalflow_user'

export function getUser() {
  try {
    const userJson = localStorage.getItem(USER_KEY)
    return userJson ? JSON.parse(userJson) : null
  } catch {
    return null
  }
}

export function setUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    // Ignore storage failures
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY)
  } catch {
    // ignore
  }
}
