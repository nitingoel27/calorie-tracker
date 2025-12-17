import { useState } from "react"
import { useCalories } from "../context/CalorieContext"
import { v4 as uuidv4 } from "uuid"

const Add = () => {
  const { addMeal, addWorkout } = useCalories()
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [type, setType] = useState<"meal" | "workout">("meal")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !calories) return

    const today = new Date().toISOString()
    const entry = { id: uuidv4(), name, calories: parseInt(calories), date: today }

    if (type === "meal") addMeal(entry)
    else addWorkout(entry)

    setName("")
    setCalories("")
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Add Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "meal" | "workout")}
          className="w-full p-3 border rounded-lg"
        >
          <option value="meal">Meal</option>
          <option value="workout">Workout</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg"
        >
          Add Entry
        </button>
      </form>
    </div>
  )
}

export default Add
