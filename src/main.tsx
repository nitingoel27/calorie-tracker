import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { CalorieProvider } from "./context/CalorieContext"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CalorieProvider>
      <App />
    </CalorieProvider>
  </React.StrictMode>
)
