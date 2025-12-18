  import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
  import { CalorieProvider } from "./context/CalorieContext";
  import Dashboard from "./pages/Dashboard";
  import History from "./pages/History";
  import Settings from "./pages/Settings";
  import Add from "./pages/Add";
  import FloatingAddButton from "./components/FloatingAddButton";


  export default function App() {
    return (
      <CalorieProvider>
        <BrowserRouter>
          <nav className="p-4 flex gap-4 border-b">
            <Link to="/">Dashboard</Link>
            <Link to="/history">History</Link>
            <Link to="/settings">Settings</Link>
          </nav>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/app" element={<Add />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
                  <FloatingAddButton />
        </BrowserRouter>
      </CalorieProvider>
    );
  }
