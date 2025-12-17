import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import BottomNav from "./components/BottomNav"
import Dashboard from "./pages/Dashboard"
import Add from "./pages/Add"
import History from "./pages/History"

function App() {
  return (
    <BrowserRouter>
      <div className="pb-16">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<Add />} />
          <Route path="/history" element={<History />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
