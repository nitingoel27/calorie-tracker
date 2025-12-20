import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Add from "./pages/Add";
import Summary from "./pages/Summary";
import FloatingAddButton from "./components/FloatingAddButton";
import { useTheme } from "./context/ThemeContext";
import DayDetail from "./pages/DayDetail";
import Landing from "./pages/Landing";
import {Home} from "lucide-react";
 

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const linkClass = (path: string) => {
    const isActive =
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path));

    return [
      "text-sm px-1 pb-1 border-b-2 border-transparent hover:border-indigo-300 hover:text-indigo-600",
      isActive ? "font-semibold text-indigo-600 border-indigo-500" : "text-gray-700",
    ].join(" ");
  };

  return (
    // wrapper controlling dark mode; we keep it but hide the toggle for now
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <nav className="p-4 flex items-center justify-between border-b bg-gray-100/90 backdrop-blur-sm dark:bg-slate-900/90 dark:border-slate-800">
  <div className="flex gap-4 overflow-x-auto whitespace-nowrap scrollbar -hide">
  <Link to="/" className={`${linkClass("/")} flex-shrink-0`} ><Home className="w-6 h-6 text-purple-600"/></Link>
    <Link to="/dashboard" className={`${linkClass("/Dashboard")} flex-shrink-0`}>Dashboard</Link>
    <Link to="/summary" className={`${linkClass("/summary")} flex-shrink-0`}>Summary</Link>
    <Link to="/history" className={`${linkClass("/history")} flex-shrink-0`}>History</Link>
    <Link to="/settings" className={`${linkClass("/settings")} flex-shrink-0`}>Settings</Link>
  </div>

  {/* 🌗 Theme Toggle */}
  <button
    onClick={toggleTheme}
    className="px-1 py-1 rounded-md text-sm font-medium
               bg-indigo-100 text-indigo-700
               hover:bg-indigo-200
               dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
    aria-label="Toggle theme"
  >
    {theme === "dark" ? "☀" : "🌙"}
  </button>
</nav>
        <Routes>
        <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/summary" element={<Summary />} />
          {/* <Route path="/app" element={<Add />} /> */}
          <Route path="/add" element={<Add />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/day/:date" element={<DayDetail />} />
        </Routes>
        <FloatingAddButton />
      </div>
    </div>
  );
}
