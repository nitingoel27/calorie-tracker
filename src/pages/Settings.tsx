import { useState } from "react";
import { useCalories } from "../context/CalorieContext";

export default function Settings() {
  const { dailyGoal, setDailyGoal, macroTargets, setMacroTargets } =
    useCalories();

  const [goal, setGoal] = useState(dailyGoal);
  const [proteinTarget, setProteinTarget] = useState(macroTargets.protein);
  const [fatTarget, setFatTarget] = useState(macroTargets.fat);
  const [carbTarget, setCarbTarget] = useState(macroTargets.carbs);

  const [saved, setSaved] = useState(false);

  const numberInputClass =
    "w-full rounded-lg border appearance-none " +
    "bg-white text-gray-900 " +
    "dark:bg-slate-800 dark:text-slate-100 " +
    "border-gray-200 dark:border-slate-700 " +
    "placeholder-gray-400 dark:placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setDailyGoal(Number(goal));
    setMacroTargets({
      protein: Number(proteinTarget) || 0,
      fat: Number(fatTarget) || 0,
      carbs: Number(carbTarget) || 0,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Settings</h2>

      {/* ✅ Success message */}
      {saved && (
        <div className="rounded-lg bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/40 px-3 py-2 text-sm text-green-700 dark:text-green-300">
          Goals changed successfully🔥
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm">
            Daily Calorie Goal
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className={`${numberInputClass} p-3 mt-1`}
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
                className={`${numberInputClass} p-3 mt-1`}
              />
            </label>

            <label className="block">
              Fat (g)
              <input
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(Number(e.target.value))}
                className={`${numberInputClass} p-3 mt-1`}
              />
            </label>

            <label className="block">
              Carbs (g)
              <input
                type="number"
                value={carbTarget}
                onChange={(e) => setCarbTarget(Number(e.target.value))}
                className={`${numberInputClass} p-3 mt-1`}
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-slate-100 dark:bg-slate-800 dark:text-slate-100 p-3 rounded-lg active:scale-95 text-sm font-medium"
        >
          Save
        </button>
      </form>
    </div>
  );
}
