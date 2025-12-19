import { useState } from "react"
import { useSwipeable } from "react-swipeable"

type Props = {
  entry: any
  isWorkout: boolean
  onDelete: (id: string) => void
  onEdit: (updated: {
    id: string
    name: string
    calories: number
    protein?: number
    fat?: number
    carbs?: number
    date: string
  }) => void
}

const HistoryItem = ({ entry, isWorkout, onDelete, onEdit }: Props) => {
  const [swipeX, setSwipeX] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const textInputClass =
  "w-full px-2 py-1 text-xs rounded border " +
  "bg-white text-gray-900 " +
  "dark:bg-slate-800 dark:text-slate-100 " +
  "border-gray-200 dark:border-slate-700 " +
  "placeholder-gray-400 dark:placeholder-slate-500 " +
  "focus:outline-none focus:ring-1 focus:ring-indigo-500"

  const numberInputClass =
  "w-full px-2 py-1 text-xs rounded border appearance-none " +
  "bg-white text-gray-900 " +
  "dark:bg-slate-800 dark:text-slate-100 " +
  "border-gray-200 dark:border-slate-700 " +
  "placeholder-gray-400 dark:placeholder-slate-500 " +
  "focus:outline-none focus:ring-1 focus:ring-indigo-500"



  const [draft, setDraft] = useState(() => ({
    name: entry.name as string,
    calories: entry.calories as number,
    protein: entry.protein as number | undefined,
    fat: entry.fat as number | undefined,
    carbs: entry.carbs as number | undefined,
    date: entry.date as string,
  }))

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isDeleting) return
      // only allow horizontal swipe left and gently clamp distance
      if (eventData.deltaX < 0) {
        const clamped = Math.max(eventData.deltaX, -140)
        setSwipeX(clamped)
      }
    },
    onSwipedLeft: (eventData) => {
      if (isDeleting) return
      if (eventData.absX > 80) {
        // animate card fully off-screen, then delete
        setIsDeleting(true)
        setSwipeX(-260)
        setTimeout(() => {
          onDelete(entry.id)
        }, 180)
      } else {
        setSwipeX(0)
      }
    },
    onSwipedRight: () => {
      if (isDeleting) return
      setSwipeX(0)
    },
    trackMouse: true,
  })

  return (
    <div className="relative rounded-xl overflow-hidden bg-transparent">
      {/* Red delete background */}
      <div
        className="absolute inset-0 bg-red-500 flex justify-end items-center pr-4 text-white font-medium"
        style={{ opacity: Math.min(Math.abs(swipeX) / 80, 1) }}
      >
        Delete
      </div>

      {/* Foreground content */}
      <div
        {...handlers}
        className="relative flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 shadow-sm transition-transform"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isDeleting ? "transform 0.18s ease-out" : "transform 0.15s ease-out",
        }}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="
  mt-0.5 flex h-8 w-8 items-center justify-center rounded-full
  bg-yellow-50 dark:bg-yellow-900/30
  border border-yellow-200 dark:border-yellow-700
  text-lg
">
            {isWorkout ? "🏋️" : "🍽️"}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-1">
                <input
  value={draft.name}
  onChange={(e) =>
    setDraft((d) => ({ ...d, name: e.target.value }))
  }
  className={textInputClass}
/>

<div className="grid grid-cols-2 gap-2 text-[11px]">
  {/* Calories */}
  <div className="flex flex-col gap-0.5">
    <label className="text-gray-500 dark:text-slate-400">
      Calories (kcal)
    </label>
    <input
      type="number"
      value={draft.calories}
      onChange={(e) =>
        setDraft((d) => ({
          ...d,
          calories: Number(e.target.value) || 0,
        }))
      }
      className={numberInputClass}
      placeholder="kcal"
    />
  </div>

  {/* Protein */}
  <div className="flex flex-col gap-0.5">
    <label className="text-gray-500 dark:text-slate-400">
      Protein (g)
    </label>
    <input
      type="number"
      value={draft.protein ?? ""}
      onChange={(e) =>
        setDraft((d) => ({
          ...d,
          protein:
            e.target.value === ""
              ? undefined
              : Number(e.target.value) || 0,
        }))
      }
      className={numberInputClass}
      placeholder="g"
    />
  </div>

  {/* Fat */}
  <div className="flex flex-col gap-0.5">
    <label className="text-gray-500 dark:text-slate-400">
      Fat (g)
    </label>
    <input
      type="number"
      value={draft.fat ?? ""}
      onChange={(e) =>
        setDraft((d) => ({
          ...d,
          fat:
            e.target.value === ""
              ? undefined
              : Number(e.target.value) || 0,
        }))
      }
      className={numberInputClass}
      placeholder="g"
    />
  </div>

  {/* Carbs */}
  <div className="flex flex-col gap-0.5">
    <label className="text-gray-500 dark:text-slate-400">
      Carbs (g)
    </label>
    <input
      type="number"
      value={draft.carbs ?? ""}
      onChange={(e) =>
        setDraft((d) => ({
          ...d,
          carbs:
            e.target.value === ""
              ? undefined
              : Number(e.target.value) || 0,
        }))
      }
      className={numberInputClass}
      placeholder="g"
    />
  </div>
</div>



              </div>
            ) : (
              <>
                  <p className="font-medium text-sm text-gray-900 dark:text-slate-100 truncate">
                  {entry.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                  {new Date(entry.date).toLocaleDateString()} •{" "}
                  {isWorkout ? "Workout" : "Meal"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-600 dark:text-slate-300">
                <span className="font-semibold text-gray-900 dark:text-slate-100">
                    {entry.calories} cal
                  </span>
                  {entry.protein !== undefined && (
                    <span>{entry.protein}g P</span>
                  )}
                  {entry.fat !== undefined && <span>{entry.fat}g F</span>}
                  {entry.carbs !== undefined && <span>{entry.carbs}g C</span>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 pl-2">
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <button
            className="text-[11px] font-medium text-green-600 dark:text-green-400"
                onClick={() => {
                  onEdit({
                    id: entry.id,
                    name: draft.name || entry.name,
                    calories: draft.calories,
                    protein: draft.protein,
                    fat: draft.fat,
                    carbs: draft.carbs,
                    date: entry.date,
                  })
                  setIsEditing(false)
                }}
              >
                Save
              </button>
              <button
                className="text-[11px] text-gray-500 dark:text-slate-400"
                onClick={() => {
                  setDraft({
                    name: entry.name,
                    calories: entry.calories,
                    protein: entry.protein,
                    fat: entry.fat,
                    carbs: entry.carbs,
                    date: entry.date,
                  })
                  setIsEditing(false)
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="text-xs font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                aria-label={`Delete ${entry.name}`}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryItem
