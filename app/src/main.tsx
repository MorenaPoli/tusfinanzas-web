import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import ErrorBoundary from '@/components/ErrorBoundary'
import App from './App.tsx'

// Tus Finanzas v2 - force cache invalidation
console.log('[Tus Finanzas] v2 initialized')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
