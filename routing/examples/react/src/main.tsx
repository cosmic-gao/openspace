import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from 'virtual:routing/routes'
import App from './App'
import './index.css'

const router = createBrowserRouter([
    {
        element: <App />,
        children: routes,
    }
])

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
