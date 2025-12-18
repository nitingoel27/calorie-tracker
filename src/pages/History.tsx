import { useCalories } from "../context/CalorieContext";
import HistoryItem from "../components/HistoryItem";

export default function History() {
  const { meals, workouts, deleteMeal, deleteWorkout, updateMeal, updateWorkout } = useCalories();

  const allEntries = [
    ...meals.map((m) => ({ ...m, type: "meal" as const })),
    ...workouts.map((w) => ({ ...w, type: "workout" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">History</h2>
          {allEntries.length > 0 && (
            <span className="text-xs text-gray-500">
              {allEntries.length} {allEntries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {allEntries.length === 0 ? (
          <p className="text-gray-400 mt-2 text-sm">
            No entries yet. Add meals or workouts and they&apos;ll show up here.
          </p>
        ) : (
          <div className="space-y-3">
            {allEntries.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                isWorkout={entry.type === "workout"}
                onDelete={() =>
                  entry.type === "meal"
                    ? deleteMeal(entry.id)
                    : deleteWorkout(entry.id)
                }
                onEdit={(updated) =>
                  entry.type === "meal"
                    ? updateMeal(updated as any)
                    : updateWorkout(updated as any)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
