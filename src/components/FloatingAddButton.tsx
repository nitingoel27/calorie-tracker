import { Link, useLocation } from "react-router-dom";

export default function FloatingAddButton() {
  const location = useLocation();

  // Hide button on Add page itself
  if (location.pathname === "/app") return null;

  return (
    <Link
      to="/app"
      className="fixed bottom-6 right-6 bg-black text-white w-14 h-14 rounded-full
                 flex items-center justify-center text-3xl shadow-lg active:scale-95"
      aria-label="Add entry"
    >
      +
    </Link>
  );
}
