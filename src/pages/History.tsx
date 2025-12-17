import { useCalories } from "../context/CalorieContext"
import HistoryItem from "../components/HistoryItem"

const History = () => {
  const { meals, workouts, deleteEntry } = useCalories()

  const allEntries = [...meals, ...workouts]
    .filter((e) => e && e.date)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-medium">History</h2>

      {allEntries.length === 0 ? (
        <p className="text-gray-400 mt-2">No entries yet</p>
      ) : (
        allEntries.map((entry) => {
          const isWorkout = workouts.some((w) => w.id === entry.id)
          return (
            <HistoryItem
              key={entry.id}
              entry={entry}
              isWorkout={isWorkout}
              onDelete={deleteEntry}
            />
          )
        })
      )}
    </div>
  )
}

export default History
