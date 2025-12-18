import { useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { CalorieProvider } from "./context/CalorieContext";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Add from "./pages/Add";
import Summary from "./pages/Summary";
import FloatingAddButton from "./components/FloatingAddButton";


export default function App() {
    // Inner component that handles swipe gestures and renders routes with animation
    function SwipeArea() {
      const navigate = useNavigate();
      const location = useLocation();
      const startXRef = useRef<number | null>(null);
      const deltaXRef = useRef<number>(0);

      const routes = ["/", "/summary", "/history", "/settings"];
      const currentIndex = Math.max(0, routes.indexOf(location.pathname));

      const [deltaX, setDeltaX] = useState(0); // px during drag
      const [animating, setAnimating] = useState(false);
      const [targetIndex, setTargetIndex] = useState<number | null>(null);

      const onTouchStart = (e: React.TouchEvent) => {
        if (animating) return;
        startXRef.current = e.touches[0]?.clientX ?? null;
        deltaXRef.current = 0;
        setDeltaX(0);
      };

      const onTouchMove = (e: React.TouchEvent) => {
        if (startXRef.current == null || animating) return;
        const x = e.touches[0]?.clientX ?? 0;
        const dx = x - startXRef.current;
        // dampen vertical drags and limit drag distance
        const limited = Math.max(-window.innerWidth, Math.min(window.innerWidth, dx));
        deltaXRef.current = limited;
        setDeltaX(limited);
      };

      const finishDrag = (dx: number) => {
        const threshold = Math.min(120, window.innerWidth * 0.15);
        if (dx <= -threshold && currentIndex < routes.length - 1) {
          // swipe left -> go next
          setTargetIndex(currentIndex + 1);
          setAnimating(true);
          setDeltaX(-window.innerWidth);
        } else if (dx >= threshold && currentIndex > 0) {
          // swipe right -> go prev
          setTargetIndex(currentIndex - 1);
          setAnimating(true);
          setDeltaX(window.innerWidth);
        } else {
          // snap back
          setAnimating(true);
          setDeltaX(0);
        }
      };

      const onTouchEnd = () => {
        if (startXRef.current == null || animating) return;
        finishDrag(deltaXRef.current);
        startXRef.current = null;
        deltaXRef.current = 0;
      };

      // after animation completes, navigate if targetIndex set
      const onTransitionEnd = () => {
        if (targetIndex !== null && targetIndex !== currentIndex) {
          navigate(routes[targetIndex]);
        }
        // reset
        setAnimating(false);
        setTargetIndex(null);
        setDeltaX(0);
      };

      // style for transform and transition
      const style: React.CSSProperties = {
        transform: `translateX(${deltaX}px)`,
        transition: animating ? 'transform 260ms ease' : undefined,
        touchAction: 'pan-y',
      };

      return (
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTransitionEnd={onTransitionEnd}
          style={{ overflow: 'hidden' }}
        >
          <div style={style}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/app" element={<Add />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      );
    }

    return (
      <CalorieProvider>
        <BrowserRouter>
          <nav className="p-4 flex gap-4 border-b">
            <Link to="/">Dashboard</Link>
            <Link to="/summary">Summary</Link>
            <Link to="/history">History</Link>
            <Link to="/settings">Settings</Link>
          </nav>

          <SwipeArea />
          <FloatingAddButton />
        </BrowserRouter>
      </CalorieProvider>
    );
  }
