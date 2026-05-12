import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import './index.css'
import { store } from '@/store/store'
import { injectAuthHandlers } from '@/lib/http'
import { logout, setAccessToken } from '@/store/authSlice'

injectAuthHandlers({
  logout: () => store.dispatch(logout()),
  setAccessToken: (token: string) => store.dispatch(setAccessToken(token)),
  getAccessToken: () => store.getState().auth.accessToken,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
