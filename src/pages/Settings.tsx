import { useState } from "react";
import { useCalories } from "../context/CalorieContext";

export default function Settings() {
  const { dailyGoal, setDailyGoal, macroTargets, setMacroTargets } =
    useCalories();
  const [goal, setGoal] = useState(dailyGoal);
  const [proteinTarget, setProteinTarget] = useState(macroTargets.protein);
  const [fatTarget, setFatTarget] = useState(macroTargets.fat);
  const [carbTarget, setCarbTarget] = useState(macroTargets.carbs);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDailyGoal(Number(goal));
    setMacroTargets({
      protein: Number(proteinTarget) || 0,
      fat: Number(fatTarget) || 0,
      carbs: Number(carbTarget) || 0,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm">
            Daily Calorie Goal
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="w-full p-3 border rounded-lg mt-1"
            />
          </label>
        </div>

        <div className="space-y-2 border-t pt-3">
          <h3 className="text-sm font-medium">Daily macro targets</h3>
          <p className="text-xs text-gray-500">
            Used for progress bars in the Summary and Day details screens.
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <label className="block">
              Protein (g)
              <input
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(Number(e.target.value))}
                className="w-full p-2 border rounded-lg mt-1 text-sm"
              />
            </label>
            <label className="block">
              Fat (g)
              <input
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(Number(e.target.value))}
                className="w-full p-2 border rounded-lg mt-1 text-sm"
              />
            </label>
            <label className="block">
              Carbs (g)
              <input
                type="number"
                value={carbTarget}
                onChange={(e) => setCarbTarget(Number(e.target.value))}
                className="w-full p-2 border rounded-lg mt-1 text-sm"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-lg active:scale-95 text-sm font-medium"
        >
          Save
        </button>
      </form>
    </div>
  );
}
