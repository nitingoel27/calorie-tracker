import { useCalories } from "../context/CalorieContext"
import { useRef, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"


const WeeklySummary = () => {
  const { meals, workouts, dailyGoal, macroTargets } = useCalories()
  const navigate = useNavigate()

  const todayRef = useRef<HTMLDivElement | null>(null)
  const didScrollRef = useRef(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"  
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

  const insights = useMemo(() => {
    if (data.length === 0) {
      return { avgCalories: 0, avgProtein: 0, streak: 0 }
    }

    const daysWithAny = data.filter((d) => d.in > 0 || d.out > 0)
    const base = daysWithAny.length > 0 ? daysWithAny : data

    const avgCalories =
      base.reduce((s, d) => s + (d.in - d.out), 0) / base.length
    const avgProtein = base.reduce((s, d) => s + d.protein, 0) / base.length

    // streak = consecutive days (from latest backwards) where net calories are within ±200 of dailyGoal
    let streak = 0
    const reversed = [...data].reverse()
    for (const d of reversed) {
      const net = d.in - d.out
      if (Math.abs(net - dailyGoal) <= 200) {
        streak += 1
      } else if (d.in === 0 && d.out === 0) {
        // ignore completely empty days in streak
        continue
      } else {
        break
      }
    }

    return {
      avgCalories: Math.round(avgCalories),
      avgProtein: Math.round(avgProtein),
      streak,
    }
  }, [data, dailyGoal])

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
    <div className="
    pt-[10vh]
    bg-white dark:bg-slate-900
    text-gray-900 dark:text-slate-100
    rounded-xl shadow-sm
  ">  
      <h3 className="font-medium mb-2">Weekly Summary</h3>
      <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
  <XAxis
    dataKey="date"
    stroke={isDark ? "#CBD5E1" : "#4B5563"}
    tick={{ fill: isDark ? "#CBD5E1" : "#4B5563" }}
  />
  <YAxis
    stroke={isDark ? "#CBD5E1" : "#4B5563"}
    tick={{ fill: isDark ? "#CBD5E1" : "#4B5563" }}
  />
  <Tooltip
    contentStyle={{
      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
      border: isDark ? "1px solid #334155" : "1px solid #E5E7EB",
      color: isDark ? "#E5E7EB" : "#111827",
    }}
    labelStyle={{
      color: isDark ? "#E5E7EB" : "#111827",
    }}
  />
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
  ? 'bg-indigo-50 dark:bg-indigo-900/30'
  : protein >= fat && protein >= carbs
  ? 'bg-green-50 dark:bg-green-900/30'
  : fat >= protein && fat >= carbs
  ? 'bg-amber-50 dark:bg-amber-900/30'
  : 'bg-blue-50 dark:bg-blue-900/30'


            return (
              <div
                key={d.date}
                ref={isToday ? (el => { if (el) (todayRef as any).current = el }) : undefined}
                className={`min-w-[140px] snap-center p-3 rounded-lg shadow-sm text-center cursor-pointer ${bgClass} ${isToday ? 'ring-2 ring-indigo-300' : ''}`}
                aria-label={`Macros for ${d.date}`}
                onClick={() => navigate(`/day/${d.iso}`)}
              >
                <div className="text-sm font-medium">{d.date}</div>
                <div className="mt-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
  {d.in} cal
</div>

                <div className="mt-2 flex flex-col gap-1 items-center">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-green-100 text-green-800 break-words w-full max-w-[120px]">
                    {d.protein}g P
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-800 break-words w-full max-w-[120px]">
                    {d.fat}g F
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-blue-100 text-blue-800 break-words w-full max-w-[120px]">
                    {d.carbs}g C
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {(["protein", "fat", "carbs"] as const).map((key) => {
                    const value = d[key]
                    const target = macroTargets[key]
                    const pct =
                      target > 0
                        ? Math.min(100, Math.round((value / target) * 100))
                        : 0
                    const barClass =
                      key === "protein"
                        ? "bg-green-500"
                        : key === "fat"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    return (
                      <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">

                        <div
                          className={`h-full ${barClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="
  mt-3 text-xs
  text-gray-700 dark:text-slate-300
  bg-gray-50 dark:bg-slate-800
  rounded-lg p-3
">

          <div>
            <span className="font-semibold">This week</span>: approx{" "}
            <span className="font-semibold">
              {insights.avgCalories} net cal
            </span>{" "}
            · {insights.avgProtein}g avg protein
          </div>
          <div>
            <span className="font-semibold">Streak</span>:{" "}
            {insights.streak > 0
              ? `${insights.streak} day${
                  insights.streak === 1 ? "" : "s"
                } near your goal`
              : "No current streak yet — log a few days close to your goal."}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklySummary
