import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Self-hosted (was Google Fonts): the stylesheet ships in our own CSS bundle,
// so first paint no longer waits on fonts.googleapis.com + fonts.gstatic.com.
import '@fontsource-variable/plus-jakarta-sans/wght.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
