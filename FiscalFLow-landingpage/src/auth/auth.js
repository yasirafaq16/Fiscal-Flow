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

