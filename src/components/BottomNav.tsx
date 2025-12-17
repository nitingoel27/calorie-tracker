import { NavLink } from "react-router-dom"

const BottomNav = () => {
  const base = "flex-1 text-center py-2 text-sm"

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex">
      <NavLink to="/" className={base}>
        Dashboard
      </NavLink>
      <NavLink to="/add" className={base}>
        Add
      </NavLink>
      <NavLink to="/history" className={base}>
        History
      </NavLink>
    </nav>
  )
}

export default BottomNav
