import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

import { CalorieProvider } from "./context/CalorieContext"
import { ThemeProvider } from "./context/ThemeContext"
import { registerSW } from "virtual:pwa-register"

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <CalorieProvider>
        <App />
      </CalorieProvider>
    </ThemeProvider>
  </React.StrictMode>
)
