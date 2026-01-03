
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

import { ClerkProvider } from '@clerk/clerk-react'


// it is given cleark website //https://dashboard.clerk.com/apps/app_2zouNbIuGCDokoGPq7OZRsqA5tt/instances/ins_2zouNXXvpCRCBcsx44P6pUL1zic
//steps to integrate
// const PUBLISHABLE_KEY="pk_test_d2FudGVkLWNyYW5lLTk5LmNsZXJrLmFjY291bnRzLmRldiQ"
const PUBLISHABLE_KEY=import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
// console.log('Clerk Key:', PUBLISHABLE_KEY); 
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}


createRoot(document.getElementById('root')).render(

  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
)
