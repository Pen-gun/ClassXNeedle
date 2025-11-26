import { Route, Routes } from 'react-router-dom'
import Home from './Pages/HomePage'
import { Query, QueryClient, QueryClientProvider } from '@tanstack/react-query'

function App() {

  return (
    <QueryClientProvider client={new QueryClient()}>
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
    </QueryClientProvider>
  )
}

export default App
