const Header = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  return (
    <header className="p-4 bg-white shadow-sm sticky top-0 z-10">
      <h1 className="text-xl font-semibold">CalMate</h1>
      <p className="text-sm text-gray-500">{today}</p>
    </header>
  )
}

export default Header
