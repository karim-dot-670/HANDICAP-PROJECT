import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './index.css'
import { ContentProvider } from './lib/content'
import Layout from './components/Layout'
import Home from './pages/Home'
import ConditionPage from './pages/ConditionPage'
import Quiz from './pages/Quiz'
import Contact from './pages/Contact'
import About from './pages/About'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'handicap/:slug', element: <ConditionPage /> },
      { path: 'idees-recues', element: <Quiz /> },
      { path: 'contact', element: <Contact /> },
      { path: 'a-propos', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <RouterProvider router={router} />
    </ContentProvider>
  </StrictMode>,
)
