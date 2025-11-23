import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import App from './App'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './theme/theme'
import { muiTheme } from './theme/muiTheme'
import './index.css'

// This resolves the issue where rebuilding produces different hashes for the same file,
// causing the browser to load the old filename (which doesn't exist).
// https://vitejs.dev/guide/build#load-error-handling
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault()
  window.location.reload()
})

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <MuiThemeProvider theme={muiTheme}>
      <EmotionThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        <App />
      </EmotionThemeProvider>
    </MuiThemeProvider>
  </React.StrictMode>
)
