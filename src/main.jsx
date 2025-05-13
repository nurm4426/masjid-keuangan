import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // Mengimpor file index.css untuk menerapkan Tailwind
import App from './App'
import { StrictMode } from 'react'

const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
