import { useState } from "react";
import { useCalories } from "../context/CalorieContext";

export default function Settings() {
  const { dailyGoal, setDailyGoal } = useCalories();
  const [goal, setGoal] = useState(dailyGoal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDailyGoal(Number(goal));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          Daily Calorie Goal
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="w-full p-3 border rounded-lg mt-1"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-lg active:scale-95"
        >
          Save Goal
        </button>
      </form>
    </div>
  );
}
