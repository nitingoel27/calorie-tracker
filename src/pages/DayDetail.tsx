import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCalories } from "../context/CalorieContext"

export default function DayDetail() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { meals, workouts, macroTargets } = useCalories()

  const isoDate = date ?? new Date().toISOString().slice(0, 10)

  const { dayMeals, dayWorkouts, totals } = useMemo(() => {
    const dayMeals = meals.filter((m) => m.date?.slice(0, 10) === isoDate)
    const dayWorkouts = workouts.filter((w) => w.date?.slice(0, 10) === isoDate)

    const mealCals = dayMeals.reduce((s, m) => s + m.calories, 0)
    const workoutCals = dayWorkouts.reduce((s, w) => s + w.calories, 0)

    const protein = dayMeals.reduce((s, m) => s + (m.protein ?? 0), 0)
    const fat = dayMeals.reduce((s, m) => s + (m.fat ?? 0), 0)
    const carbs = dayMeals.reduce((s, m) => s + (m.carbs ?? 0), 0)

    return {
      dayMeals,
      dayWorkouts,
      totals: {
        in: mealCals,
        out: workoutCals,
        protein,
        fat,
        carbs,
      },
    }
  }, [isoDate, meals, workouts])

  const niceDate = new Date(isoDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const macroProgress = (value: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0

  return (
    <div className="p-4 space-y-4">
      <button
  className="text-xs text-gray-500 dark:text-gray-400 mb-1"
  onClick={() => navigate(-1)}
>
  ← Back
</button>

<h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
  Day details
</h1>


<p className="text-xs text-gray-500 dark:text-gray-400">{niceDate}</p>
<button
  onClick={() =>
    navigate("/add", {
      state: { date: isoDate },
    })
  }
  className="w-full bg-purple-600 text-white p-2 rounded-lg text-sm font-medium"
>
  + Add entry for this day
</button>

<div className="grid grid-cols-2 gap-3 text-center text-xs">
  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
    <p className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      Calories In
    </p>
    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
      {totals.in}
    </p>
  </div>

  <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg">
    <p className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      Calories Out
    </p>
    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
      {totals.out}
    </p>
  </div>
</div>


<div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-xs space-y-2">
  <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
    Macros vs targets
  </h2>

        {(["protein", "fat", "carbs"] as const).map((key) => {
          const value = totals[key]
          const target = macroTargets[key]
          const pct = macroProgress(value, target)
          const label =
            key === "protein" ? "Protein" : key === "fat" ? "Fat" : "Carbs"

          return (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span>{label}</span>
                <span>
                  {value}g / {target}g
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div
                  className={
                    key === "protein"
                      ? "h-full bg-green-500"
                      : key === "fat"
                      ? "h-full bg-amber-500"
                      : "h-full bg-blue-500"
                  }
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <h2 className="font-semibold mb-1 dark:text-gray-100">Meals</h2>
          {dayMeals.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500">No meals logged.</p>
          ) : (
            <div className="space-y-2">
              {dayMeals.map((m) => (
                <div
                key={m.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-2 flex justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                    {m.name}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {new Date(m.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              
                <div className="text-right text-[11px] text-gray-600 dark:text-gray-300">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {m.calories} cal
                  </div>
                  <div>
                    {(m.protein ?? 0)}g P · {(m.fat ?? 0)}g F · {(m.carbs ?? 0)}g C
                  </div>
                </div>
              </div>
              
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-1 dark:text-gray-100">Workouts</h2>
          {dayWorkouts.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500">No workouts logged.</p>
          ) : (
            <div className="space-y-2">
              {dayWorkouts.map((w) => (
               <div
               key={w.id}
               className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-2 flex justify-between gap-2"
             >
               <div>
                 <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                   {w.name}
                 </p>
                 <p className="text-[11px] text-gray-500 dark:text-gray-400">
                   {new Date(w.date).toLocaleTimeString([], {
                     hour: "2-digit",
                     minute: "2-digit",
                   })}
                 </p>
               </div>
             
               <div className="text-right text-[11px] text-gray-600 dark:text-gray-300">
                 <div className="font-semibold text-gray-900 dark:text-gray-100">
                   {w.calories} cal
                 </div>
               </div>
             </div>
             
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


