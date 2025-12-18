import { useCalories } from "../context/CalorieContext";
import WeeklySummary from "../components/WeeklySummary";

export default function Dashboard() {
  const { meals, workouts, dailyGoal } = useCalories();

  const today = new Date().toISOString().slice(0, 10);

  const consumed = meals
    .filter((m) => m?.date?.slice(0, 10) === today)
    .reduce((sum, m) => sum + m.calories, 0);

  const burned = workouts
    .filter((w) => w?.date?.slice(0, 10) === today)
    .reduce((sum, w) => sum + w.calories, 0);

  const netCalories = consumed - burned;
  const remaining = dailyGoal - netCalories;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-500">Daily Goal</p>
          <p className="text-lg font-bold">{dailyGoal}</p>
        </div>

        <div
          className={`p-3 rounded ${
            remaining < 0 ? "bg-red-200" : "bg-green-200"
          }`}
        >
          <p className="text-sm text-gray-600">Remaining</p>
          <p className="text-lg font-bold">{remaining}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-100 p-3 rounded">
          <p className="text-sm text-gray-600">Consumed</p>
          <p className="text-lg font-bold">{consumed}</p>
        </div>

        <div className="bg-orange-100 p-3 rounded">
          <p className="text-sm text-gray-600">Burned</p>
          <p className="text-lg font-bold">{burned}</p>
        </div>
      </div>
      <div className="pt-8">
        <WeeklySummary />
      </div>
    </div>
  );
}
