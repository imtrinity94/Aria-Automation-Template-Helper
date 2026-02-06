import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from "@/contexts/ThemeContext"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <HelmetProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </HelmetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
