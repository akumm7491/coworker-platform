import { BrowserRouter as Router } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import AppRoutes from './routes'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <Router>
      {isAuthenticated ? (
        <Layout>
          <AppRoutes />
        </Layout>
      ) : (
        <AppRoutes />
      )}
    </Router>
  )
}

export default App
