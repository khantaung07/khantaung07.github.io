import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { portfolio } from './portfolio'
import './index.css'
import App from './App.tsx'

document.title = portfolio.meta.title
const description = document.createElement('meta')
description.name = 'description'
description.content = portfolio.meta.description
document.head.append(description)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
