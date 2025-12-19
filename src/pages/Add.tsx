import { useState } from "react"
import { useCalories } from "../context/CalorieContext"
import { v4 as uuidv4 } from "uuid"
import { useLocation } from "react-router-dom"

type AIParsedEntry = {
  type: "meal" | "workout"
  name: string
  calories: number
  protein?: number
  fat?: number
  carbs?: number
}

export default function Add() {
  const { addMeal, addWorkout } = useCalories()
  const location = useLocation()
  const textInputClass =
  "w-full px-2 py-1 text-xs rounded border " +
  "bg-white text-gray-900 " +
  "dark:bg-slate-800 dark:text-slate-100 " +
  "border-gray-200 dark:border-slate-700 " +
  "placeholder-gray-400 dark:placeholder-slate-500 " +
  "focus:outline-none focus:ring-1 focus:ring-indigo-500"
  // 🔑 date passed from DayDetail or default to today
  const targetDate =
    (location.state as { date?: string })?.date ??
    new Date().toISOString().slice(0, 10)

  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAIAdd = async () => {
    if (!text.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/parse-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = (await res.json()) as AIParsedEntry

      if (!data || !data.name || data.calories == null) {
        alert("Could not understand entry")
        return
      }

      const entry = {
        id: uuidv4(),
        name: data.name,
        calories: Number(data.calories) || 0,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        // 🔥 IMPORTANT: attach selected day
        date: `${targetDate}T${new Date().toISOString().slice(11)}`,
      }

      data.type === "meal" ? addMeal(entry) : addWorkout(entry)

      setText("")
    } catch (e) {
      console.error(e)
      alert("Failed to add entry")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">
        Add entry
        <span className="block text-xs text-gray-500">
          for {new Date(targetDate).toDateString()}
        </span>
      </h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ate 1 bowl sweet corn"
        className={textInputClass}
      />

      <button
        onClick={handleAIAdd}
        disabled={loading}
        className="w-full bg-purple-600 text-white p-3 rounded-lg"
      >
        {loading ? "Analyzing..." : "Add using AI"}
      </button>
    </div>
  )
}
