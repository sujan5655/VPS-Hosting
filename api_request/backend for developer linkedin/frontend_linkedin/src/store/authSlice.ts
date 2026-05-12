import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/lib/http'
import { Status, type AuthStatus } from '@/lib/types'
import type { AppDispatch, RootState } from '@/store/store'

type User = {
  id?: string
  name?: string
  email?: string
}

type AuthState = {
  user: User | null
  accessToken: string
  status: AuthStatus
  error: string | null
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: '',
  status: Status.IDLE,
  error: null,
  isInitialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload
    },
    setStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload
    },
    logout(state) {
      state.user = null
      state.accessToken = ''
      state.status = Status.IDLE
      state.error = null
    },
  },
})

export const { setUser, setAccessToken, setStatus, setError, setInitialized, logout } =
  authSlice.actions
export default authSlice.reducer

export const selectIsAuthed = (s: RootState) => Boolean(s.auth.accessToken)

export function loginUser(credentials: { email: string; password: string }) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(Status.LOADING))
    dispatch(setError(null))
    try {
      const res = await api.post('auth/login', credentials)
      const payload = res.data?.data
      const accessToken: string = payload?.accessToken ?? payload?.token ?? ''
      const user: User | undefined = payload?.user

      if (!accessToken) {
        dispatch(setStatus(Status.ERROR))
        dispatch(setError('Login failed: no access token returned'))
        return
      }

      dispatch(setAccessToken(accessToken))
      dispatch(setUser(user ?? null))
      dispatch(setStatus(Status.SUCCESS))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      dispatch(setStatus(Status.ERROR))
      dispatch(setError('Invalid email/password or server not reachable'))
    }
  }
}

export function registerUser(data: { name: string; email: string; password: string }) {
  return async (dispatch: AppDispatch) => {
    dispatch(setStatus(Status.LOADING))
    dispatch(setError(null))
    try {
      const res = await api.post('auth/register', data)
      if (res.status === 201 || res.status === 200) {
        dispatch(setStatus(Status.SUCCESS))
      } else {
        dispatch(setStatus(Status.ERROR))
        dispatch(setError('Registration failed'))
      }
    } catch {
      dispatch(setStatus(Status.ERROR))
      dispatch(setError('Registration failed'))
    }
  }
}

export function refreshAuth() {
  return async (dispatch: AppDispatch) => {
    try {
      // Refresh cookie is HttpOnly; browser attaches it automatically.
      const res = await api.post('auth/refresh')
      const payload = res.data?.data
      const accessToken: string = payload?.accessToken ?? ''
      const user: User | undefined = payload?.user

      if (accessToken) dispatch(setAccessToken(accessToken))
      if (user) dispatch(setUser(user))
      dispatch(setStatus(Status.SUCCESS))
    } catch {
      dispatch(logout())
    } finally {
      dispatch(setInitialized(true))
    }
  }
}

export function logoutUser() {
  return async (dispatch: AppDispatch) => {
    try {
      await api.post('auth/logout')
    } catch {
      // ignore
    } finally {
      dispatch(logout())
    }
  }
}

