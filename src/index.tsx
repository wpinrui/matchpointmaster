import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
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
    <App />
  </React.StrictMode>
)
