import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCalories } from "../context/CalorieContext";
import { v4 as uuidv4 } from "uuid";

export default function Add() {
  const { addMeal, addWorkout } = useCalories();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [type, setType] = useState<"meal" | "workout">("meal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;

    // IMPORTANT: keep date format consistent
    const today = new Date().toISOString().slice(0, 10);

    const entry = {
      id: uuidv4(),
      name,
      calories: Number(calories),
      date: today,
    };

    if (type === "meal") {
      addMeal(entry);
    } else {
      addWorkout(entry);
    }

    navigate("/");
  };

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
          required
        />

        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "meal" | "workout")}
          className="w-full p-3 border rounded-lg"
        >
          <option value="meal">Meal (Calories In)</option>
          <option value="workout">Workout (Calories Out)</option>
        </select>

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-lg active:scale-95"
        >
          Add Entry
        </button>
      </form>
    </div>
  );
}
