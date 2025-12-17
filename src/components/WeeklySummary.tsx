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

    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      in: caloriesIn,
      out: caloriesOut,
    }
  })

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
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
    </div>
  )
}

export default WeeklySummary
