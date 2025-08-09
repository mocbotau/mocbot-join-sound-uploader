import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@/components/theme-provider"
import { Auth0Provider } from '@auth0/auth0-react'

import "./index.css"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Auth0Provider domain={import.meta.env.VITE_AUTH0_DOMAIN} clientId={import.meta.env.VITE_AUTH0_CLIENT_ID} authorizationParams={{
        redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL
      }}>
      <App />
      </Auth0Provider>
    </ThemeProvider>
  </StrictMode>,
)
