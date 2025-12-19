import { useState } from "react"
import { useCalories } from "../context/CalorieContext"
import { v4 as uuidv4 } from "uuid"
import { useLocation } from "react-router-dom"

type ManualType = "meal" | "workout"

export default function Add() {
  const { addMeal, addWorkout } = useCalories()
  const location = useLocation()

  const targetDate =
    (location.state as { date?: string })?.date ??
    new Date().toISOString().slice(0, 10)

  const [mode, setMode] = useState<"ai" | "manual">("ai")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  /* ------------------ AI STATE ------------------ */
  const [text, setText] = useState("")

  /* ------------------ MANUAL STATE ------------------ */
  const [manualType, setManualType] = useState<ManualType>("meal")
  const [manualName, setManualName] = useState("")
  const [manualCalories, setManualCalories] = useState<number | "">("")
  const [manualProtein, setManualProtein] = useState<number | "">("")
  const [manualFat, setManualFat] = useState<number | "">("")
  const [manualCarbs, setManualCarbs] = useState<number | "">("")

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-xl border bg-white text-gray-900 " +
    "dark:bg-slate-800 dark:text-slate-100 border-gray-200 dark:border-slate-700 " +
    "placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 2000)
  }

  /* ------------------ AI ADD ------------------ */
  const handleAIAdd = async () => {
    if (!text.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/parse-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await res.json()

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
        date: `${targetDate}T${new Date().toISOString().slice(11)}`,
      }

      data.type === "meal" ? addMeal(entry) : addWorkout(entry)
      setText("")
      showSuccess("Entry added successfully 🎉")
    } catch (e) {
      console.error(e)
      alert("Failed to add entry")
    } finally {
      setLoading(false)
    }
  }

  /* ------------------ MANUAL ADD ------------------ */
  const handleManualAdd = () => {
    if (!manualName || manualCalories === "") return

    const entry = {
      id: uuidv4(),
      name: manualName,
      calories: Number(manualCalories),
      protein: manualType === "meal" ? Number(manualProtein) || 0 : undefined,
      fat: manualType === "meal" ? Number(manualFat) || 0 : undefined,
      carbs: manualType === "meal" ? Number(manualCarbs) || 0 : undefined,
      date: `${targetDate}T${new Date().toISOString().slice(11)}`,
    }

    manualType === "meal" ? addMeal(entry) : addWorkout(entry)

    setManualName("")
    setManualCalories("")
    setManualProtein("")
    setManualFat("")
    setManualCarbs("")
    showSuccess("Entry added successfully 🎉")
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-bold">
        Add Entry
        <span className="block text-xs text-gray-500">
          for {new Date(targetDate).toDateString()}
        </span>
      </h2>

      {/* MODE TOGGLE */}
      <div className="flex gap-2">
        {(["ai", "manual"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 px-3 py-2 rounded-2xl text-sm font-medium border transition ${
              mode === m
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
            }`}
          >
            {m === "ai" ? "Add with AI" : "Add Manually"}
          </button>
        ))}
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="text-center text-sm text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 py-2 rounded-xl">
          {success}
        </div>
      )}

      {/* ------------------ AI UI ------------------ */}
      {mode === "ai" && (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ate 1 bowl paneer or Ran 3km"
            rows={3}
            className={inputClass}
          />
          <button
            onClick={handleAIAdd}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-2xl font-medium"
          >
            {loading ? "Analyzing..." : "Add using AI"}
          </button>
        </div>
      )}

      {/* ------------------ MANUAL UI ------------------ */}
      {mode === "manual" && (
        <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm">
          <div className="flex gap-2">
            {(["meal", "workout"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setManualType(t)}
                className={`flex-1 px-3 py-2 rounded-2xl text-sm font-medium border ${
                  manualType === t
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Name"
            className={inputClass}
          />

          <input
            type="number"
            value={manualCalories}
            onChange={(e) => setManualCalories(e.target.valueAsNumber || "")}
            placeholder="Calories"
            className={inputClass}
          />

          {manualType === "meal" && (
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={manualProtein}
                onChange={(e) => setManualProtein(e.target.valueAsNumber || "")}
                placeholder="Protein"
                className={inputClass}
              />
              <input
                type="number"
                value={manualFat}
                onChange={(e) => setManualFat(e.target.valueAsNumber || "")}
                placeholder="Fat"
                className={inputClass}
              />
              <input
                type="number"
                value={manualCarbs}
                onChange={(e) => setManualCarbs(e.target.valueAsNumber || "")}
                placeholder="Carbs"
                className={inputClass}
              />
            </div>
          )}

          <button
            onClick={handleManualAdd}
            className="w-full bg-purple-600 text-white py-3 rounded-2xl font-medium"
          >
            Add Entry
          </button>
        </div>
      )}
    </div>
  )
}
