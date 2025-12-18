import { useState } from "react"
import { useCalories } from "../context/CalorieContext"
import { v4 as uuidv4 } from "uuid"

type AIParsedEntry = {
  type: "meal" | "workout"
  name: string
  calories: number
}

export default function Add() {
  const { addMeal, addWorkout } = useCalories()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAIAdd = async () => {
    if (!text.trim()) return
    setLoading(true)

    const res = await fetch("/api/parse-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    const data = (await res.json()) as AIParsedEntry

    // accept 0 calories (e.g. water) — only reject when calories is null/undefined
    if (!data || !data.name || data.calories === undefined || data.calories === null) {
      alert("Could not understand entry")
      setLoading(false)
      return
    }

    const entry = {
      id: uuidv4(),
      name: data.name,
      calories: data.calories,
      date: new Date().toISOString(),
    }

    if (data.type === "meal") addMeal(entry)
    else addWorkout(entry)

    setText("")
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Add with AI</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ate 1 bowl sweet corn"
        className="w-full p-3 border rounded-lg"
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
