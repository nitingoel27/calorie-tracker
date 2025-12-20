// src/pages/Landing.tsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../public/logowithoutbg.png"

export default function Landing() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setIsIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white dark:from-slate-900 dark:to-slate-950">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-r from-purple-600 to-indigo-500 text-white">
      <img
  src={logo}
  alt="CalMate Logo"
  className="w-35 h-30 drop-shadow-lg animate-fade-in"
/>


        <p className="text-lg md:text-2xl mb-6 max-w-2xl mx-auto">
          No signup. No cloud. Just track your calories and macros the way you want.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {!isInstalled && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="bg-white text-purple-700 font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Install App
            </button>
          )}

          <Link
            to="/dashboard"
            className="bg-indigo-900 bg-opacity-20 backdrop-blur text-white font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform border border-white/30"
          >
            Start Tracking
          </Link>
        </div>

        {isIOS && !isInstalled && (
          <p className="mt-4 text-sm text-white/80">
            On iPhone: Tap <strong>Share → Add to Home Screen</strong>
          </p>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-20 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose CalMate?</h2>
        
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Complete Privacy</h3>
            <p>No signup, no cloud storage. Your data stays on your device.</p>
          </div>
          
          <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Quick & Simple</h3>
            <p>Add meals or workouts in seconds. Track calories effortlessly.</p>
          </div>

          <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">AI-Powered Macros</h3>
            <p>
              Our AI calculates your ideal daily calories and macros 
              based on your weight, height, age, activity level, and goals. 
              Get personalized recommendations instantly.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">PWA Ready</h3>
            <p>Install directly from your browser and use it like a native app.</p>
          </div>

          <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">No Ads</h3>
            <p>Completely free and ad-free. Focus on your fitness, not distractions.</p>
          </div>

          <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Lightweight & Fast</h3>
            <p>Works instantly on any device. Minimal load times.</p>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-16 px-6 text-center bg-indigo-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100">
        <h2 className="text-3xl font-bold mb-4">Personalized Macros with AI</h2>
        <p className="max-w-xl mx-auto mb-6">
          Just enter your age, weight, height, gender, activity level, and fitness goal, 
          and our AI will calculate the optimal daily calories, protein, fat, and carbs for you.
        </p>
        <Link
          to="/settings"
          className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          Calculate Your Macros
        </Link>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-6 text-center bg-purple-600 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
        <p className="mb-6 max-w-xl mx-auto">
          Install the app and begin your calories tracking journey in seconds. No hassle, just results.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {!isInstalled && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="bg-white text-purple-700 font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Install App
            </button>
          )}

          <Link
            to="/dashboard"
            className="bg-indigo-900 bg-opacity-20 backdrop-blur text-white font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform border border-white/30"
          >
            Start Tracking Now
          </Link>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} CalMate. All rights reserved.
      </footer>
    </div>
  );
}
