import { useCalories } from "../context/CalorieContext"
import { useRef, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const WeeklySummary = () => {
  const { meals, workouts } = useCalories()

  const todayRef = useRef<HTMLDivElement | null>(null)
  const didScrollRef = useRef(false)

  const today = new Date()
  // compute Monday of the current week (Monday = start)
  const dayIndex = today.getDay() // 0 (Sun) .. 6 (Sat)
  const diffToMonday = (dayIndex + 6) % 7 // days to go back to Monday
  const monday = new Date(today)
  monday.setDate(today.getDate() - diffToMonday)

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })

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
      iso: date,
      in: caloriesIn,
      out: caloriesOut,
      protein,
      fat,
      carbs,
    }
  })

  // auto-scroll to today's card on first render
  useEffect(() => {
    if (didScrollRef.current) return
    const el = todayRef.current
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      didScrollRef.current = true
    }
  }, [])

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
        {/* horizontally scrollable cards for small screens; snaps into place */}
        <div className="flex gap-3 overflow-x-auto py-2 snap-x snap-mandatory">
          {data.map((d) => {
            const isToday = d.iso === new Date().toISOString().slice(0, 10)
            // choose bg color based on dominant macro
            const protein = d.protein ?? 0
            const fat = d.fat ?? 0
            const carbs = d.carbs ?? 0
            const bgClass = isToday
              ? 'bg-indigo-50'
              : protein >= fat && protein >= carbs
              ? 'bg-green-50'
              : fat >= protein && fat >= carbs
              ? 'bg-amber-50'
              : 'bg-blue-50'

            return (
              <div
                key={d.date}
                ref={isToday ? (el => { if (el) (todayRef as any).current = el }) : undefined}
                className={`min-w-[140px] snap-center p-3 rounded-lg shadow-sm text-center ${bgClass} ${isToday ? 'ring-2 ring-indigo-300' : ''}`}
                aria-label={`Macros for ${d.date}`}
              >
                <div className="text-sm font-medium">{d.date}</div>
                <div className="mt-2 text-sm font-semibold text-gray-800">{d.in} cal</div>
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                  <div className="px-2 py-1 rounded bg-green-100 text-green-800 truncate">Protein: {Math.round(d.protein)}g</div>
                  <div className="px-2 py-1 rounded bg-amber-100 text-amber-800 truncate">Fat: {Math.round(d.fat)}g</div>
                  <div className="px-2 py-1 rounded bg-blue-100 text-blue-800 truncate">Carbs: {Math.round(d.carbs)}g</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default WeeklySummary
