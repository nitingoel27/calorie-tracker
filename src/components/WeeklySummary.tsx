import { useCalories } from "../context/CalorieContext"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const WeeklySummary = () => {
  const { meals, workouts } = useCalories()

  const today = new Date()
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(today.getDate() - i)
    return d.toISOString().slice(0, 10)
  }).reverse()

  const data = last7Days.map((date) => {
    const caloriesIn = meals
      .filter((m) => m?.date?.slice(0, 10) === date)
      .reduce((sum, m) => sum + m.calories, 0)

    const caloriesOut = workouts
      .filter((w) => w?.date?.slice(0, 10) === date)
      .reduce((sum, w) => sum + w.calories, 0)

    const protein = meals
      .filter((m) => m?.date?.slice(0, 10) === date)
      .reduce((sum, m) => sum + (m.protein ?? 0), 0)

    const fat = meals
      .filter((m) => m?.date?.slice(0, 10) === date)
      .reduce((sum, m) => sum + (m.fat ?? 0), 0)

    const carbs = meals
      .filter((m) => m?.date?.slice(0, 10) === date)
      .reduce((sum, m) => sum + (m.carbs ?? 0), 0)

    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      in: caloriesIn,
      out: caloriesOut,
      protein,
      fat,
      carbs,
    }
  })

  return (
    <div className="pt-[10vh] bg-white rounded-xl shadow-sm">
      <h3 className="font-medium mb-2">Weekly Summary</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="in" fill="#34D399" />
          <Bar dataKey="out" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>

      <div className="p-3">
        <h4 className="text-sm font-medium mb-2">Daily Macros</h4>
        <div className="grid grid-cols-7 gap-2 text-xs text-gray-600">
          {data.map((d) => (
            <div key={d.date} className="p-2 bg-gray-50 rounded">
              <div className="font-medium">{d.date}</div>
              <div>{d.protein}g P</div>
              <div>{d.fat}g F</div>
              <div>{d.carbs}g C</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WeeklySummary
