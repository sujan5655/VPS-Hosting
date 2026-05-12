import axios from 'axios'

/**
 * Beginner friendly setup (like your example) updated for the recent feature:
 * - Access token: stored in memory (Redux), not localStorage
 * - Refresh token: stored in HttpOnly cookie => `withCredentials: true`
 */
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5000/api'

export type AuthHandlers = {
  logout: () => void
  setAccessToken: (token: string) => void
  getAccessToken: () => string
}

let authHandlers: AuthHandlers | null = null

export function injectAuthHandlers(handlers: AuthHandlers) {
  authHandlers = handlers
}

export const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const APIWITHTOKEN = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach access token from memory (Redux via injected handlers)
APIWITHTOKEN.interceptors.request.use((config) => {
  const token = authHandlers?.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }
  return config
})

// If a protected request returns 401, try refresh once and retry the request.
export const refreshAccessToken = async () => {
  const res = await API.post('auth/refresh')
  return res.data?.data?.accessToken
}

export const handleLogout = () => {
  authHandlers?.logout()
}

APIWITHTOKEN.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    // 1. Ignore non-axios errors
    if (!axios.isAxiosError(error) || !originalRequest) {
      return Promise.reject(error)
    }

    // 2. Only handle unauthorized errors
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    // 3. Prevent infinite retry loops
    if (originalRequest._retry) {
      handleLogout()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      // 4. Get new access token using refresh token
      const newToken = await refreshAccessToken()

      if (!newToken) {
        handleLogout()
        return Promise.reject(error)
      }

      // 5. Save new token
      authHandlers?.setAccessToken(newToken)

      // 6. Retry original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      return APIWITHTOKEN(originalRequest)

    } catch (err) {
      handleLogout()
      return Promise.reject(err)
    }
  }
)

// Simple alias used across the app for protected calls
export const api = APIWITHTOKEN

