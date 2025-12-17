import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

export type Meal = { id: string; name: string; calories: number; date: string }
export type Workout = { id: string; name: string; calories: number; date: string }

type CalorieContextType = {
  meals: Meal[]
  workouts: Workout[]
  addMeal: (meal: Meal) => void
  addWorkout: (workout: Workout) => void
  deleteEntry: (id: string) => void
}

const CalorieContext = createContext<CalorieContextType | undefined>(undefined)

const MEALS_KEY = "calorieTracker_meals"
const WORKOUTS_KEY = "calorieTracker_workouts"

export const CalorieProvider = ({ children }: { children: ReactNode }) => {
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem(MEALS_KEY)
    return saved ? JSON.parse(saved) : []
  })

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem(WORKOUTS_KEY)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(MEALS_KEY, JSON.stringify(meals))
  }, [meals])

  useEffect(() => {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts))
  }, [workouts])

  const addMeal = (meal: Meal) => setMeals((prev) => [...prev, meal])
  const addWorkout = (workout: Workout) => setWorkouts((prev) => [...prev, workout])

  const deleteEntry = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id))
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <CalorieContext.Provider value={{ meals, workouts, addMeal, addWorkout, deleteEntry }}>
      {children}
    </CalorieContext.Provider>
  )
}

export const useCalories = () => {
  const context = useContext(CalorieContext)
  if (!context) throw new Error("useCalories must be used within CalorieProvider")
  return context
}
