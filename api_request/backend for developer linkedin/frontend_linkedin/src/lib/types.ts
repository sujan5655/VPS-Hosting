export type AuthStatus = 'idle' | 'loading' | 'success' | 'error'

export const Status = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const satisfies Record<string, AuthStatus>

