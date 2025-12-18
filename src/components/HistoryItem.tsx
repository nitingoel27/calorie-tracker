import { useState } from "react"
import { useSwipeable } from "react-swipeable"

type Props = {
  entry: any
  isWorkout: boolean
  onDelete: (id: string) => void
}

const HistoryItem = ({ entry, isWorkout, onDelete }: Props) => {
  const [swipeX, setSwipeX] = useState(0)

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // only allow horizontal swipe left
      if (eventData.deltaX < 0) setSwipeX(eventData.deltaX)
    },
    onSwipedLeft: (eventData) => {
      if (eventData.absX > 80) onDelete(entry.id) // threshold to delete
      setSwipeX(0)
    },
    onSwipedRight: () => setSwipeX(0), // reset if swiped right
    trackMouse: true,
  })

  return (
    <div className="relative">
      {/* Red delete background */}
      <div
        className="absolute inset-0 bg-red-500 rounded-lg flex justify-end items-center pr-4 text-white font-medium"
        style={{ opacity: Math.min(Math.abs(swipeX) / 80, 1) }}
      >
        Delete
      </div>

      {/* Foreground content */}
      <div
        {...handlers}
        className="relative flex justify-between p-2 bg-white rounded-lg shadow-sm transition-transform"
        style={{
          transform: `translateX(${swipeX}px)`,
        }}
      >
        <div className="flex items-center gap-2">
          <span>{isWorkout ? "🏋️" : "🍔"}</span>
          <div>
            <p className="font-medium">{entry.name}</p>
            <p className="text-xs text-gray-500">
              {entry.date.slice(0, 10)} • {isWorkout ? "Workout" : "Meal"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <span>{entry.calories} cal</span>
          {entry.protein !== undefined && (
            <span className="text-xs text-gray-500">• {entry.protein}g P</span>
          )}
          {entry.fat !== undefined && (
            <span className="text-xs text-gray-500">• {entry.fat}g F</span>
          )}
          {entry.carbs !== undefined && (
            <span className="text-xs text-gray-500">• {entry.carbs}g C</span>
          )}
          <button
            onClick={() => onDelete(entry.id)}
            className="text-red-500 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoryItem
