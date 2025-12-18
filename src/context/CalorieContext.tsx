import { createContext, useContext, useEffect, useState } from "react";

export type Meal = { id: string; name: string; calories: number; date: string; };
export type Workout = { id: string; name: string; calories: number; date: string; };

type CalorieContextType = {
  meals: Meal[];
  workouts: Workout[];
  addMeal: (meal: Meal) => void;
  addWorkout: (workout: Workout) => void;
  deleteMeal: (id: string) => void;
  deleteWorkout: (id: string) => void;
  dailyGoal: number;
  setDailyGoal: (goal: number) => void;
};

const CalorieContext = createContext<CalorieContextType | undefined>(undefined);

export function CalorieProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>(() => {
    const stored = localStorage.getItem("meals");
    return stored ? JSON.parse(stored) : [];
  });

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const stored = localStorage.getItem("workouts");
    return stored ? JSON.parse(stored) : [];
  });

  const [dailyGoal, setDailyGoalState] = useState<number>(() => {
    const stored = localStorage.getItem("daily_goal");
    return stored ? Number(stored) : 2000;
  });

  // Persist changes
  useEffect(() => { localStorage.setItem("meals", JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem("workouts", JSON.stringify(workouts)); }, [workouts]);
  useEffect(() => { localStorage.setItem("daily_goal", String(dailyGoal)); }, [dailyGoal]);

  const addMeal = (meal: Meal) => setMeals((prev) => [...prev, meal]);
  const addWorkout = (workout: Workout) => setWorkouts((prev) => [...prev, workout]);
  const deleteMeal = (id: string) => setMeals((prev) => prev.filter((m) => m.id !== id));
  const deleteWorkout = (id: string) => setWorkouts((prev) => prev.filter((w) => w.id !== id));
  const setDailyGoal = (goal: number) => setDailyGoalState(goal);

  return (
    <CalorieContext.Provider
      value={{ meals, workouts, addMeal, addWorkout, deleteMeal, deleteWorkout, dailyGoal, setDailyGoal }}
    >
      {children}
    </CalorieContext.Provider>
  );
}

export function useCalories() {
  const context = useContext(CalorieContext);
  if (!context) throw new Error("useCalories must be used within CalorieProvider");
  return context;
}
