import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logoutUser } from '@/store/authSlice'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const { user, accessToken } = useAppSelector((s) => s.auth)

  const label = user?.name || user?.email || 'User'

  return (
    <div className="min-h-full bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
        <p className="mt-1 text-sm text-gray-600">
          You are logged in. Access token is stored in memory (Redux). Refresh token is in an
          HttpOnly cookie.
        </p>

        <div className="mt-6 rounded-xl border bg-gray-50 p-4">
          <div className="text-sm text-gray-700">
            Signed in as <span className="font-medium">{label}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Access token (first 20 chars):{' '}
            <span className="font-mono">{accessToken.slice(0, 20) || '(empty)'}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => dispatch(logoutUser())}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

