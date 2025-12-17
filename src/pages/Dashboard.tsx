import StatCard from "../components/StatCard"
import { useCalories } from "../context/CalorieContext"
import WeeklySummary from "../components/WeeklySummary"

const Dashboard = () => {
  const { meals, workouts } = useCalories()
  const todayDate = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const caloriesIn = meals
    .filter((m) => m?.date?.slice(0, 10) === todayDate)
    .reduce((sum, m) => sum + m.calories, 0)

  const caloriesOut = workouts
    .filter((w) => w?.date?.slice(0, 10) === todayDate)
    .reduce((sum, w) => sum + w.calories, 0)

  const remaining = 2000 - caloriesIn + caloriesOut
  const progress = Math.min((caloriesIn / 2000) * 100, 100)

  const todayEntries = meals
    .concat(workouts)
    .filter((e) => e?.date?.slice(0, 10) === todayDate)
    .sort((a, b) => (a.id || "").localeCompare(b.id || ""))

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Today</h2>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="In" value={caloriesIn} color="bg-green-100" />
        <StatCard label="Out" value={caloriesOut} color="bg-blue-100" />
        <StatCard
          label="Left"
          value={remaining}
          color={remaining >= 0 ? "bg-yellow-100" : "bg-red-200"}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">Progress</p>
        <div className="w-full bg-gray-200 h-3 rounded-full mt-1">
          <div
            className={`h-3 rounded-full ${
              remaining >= 0 ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="font-medium">Meals & Workouts</h3>
        {todayEntries.length === 0 ? (
          <p className="text-gray-400">No entries yet</p>
        ) : (
          todayEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between bg-white rounded-lg p-2 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span>
                  {workouts.find((w) => w.id === entry.id) ? "🏋️" : "🍔"}
                </span>
                <span>{entry.name}</span>
              </div>
              <span>{entry.calories} cal</span>
            </div>
          ))
        )}
      </div>

      {/* Weekly Summary Chart */}
      <div className="mt-6">
        <WeeklySummary />
      </div>
    </div>
  )
}

export default Dashboard
