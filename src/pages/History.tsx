import { useCalories } from "../context/CalorieContext";
import HistoryItem from "../components/HistoryItem";

export default function History() {
  const { meals, workouts, deleteMeal, deleteWorkout } = useCalories();

  const allEntries = [
    ...meals.map((m) => ({ ...m, type: "meal" as const })),
    ...workouts.map((w) => ({ ...w, type: "workout" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-medium">History</h2>

      {allEntries.length === 0 ? (
        <p className="text-gray-400 mt-2">No entries yet</p>
      ) : (
        allEntries.map((entry) => (
          <HistoryItem
            key={entry.id}
            entry={entry}
            isWorkout={entry.type === "workout"}
            onDelete={() =>
              entry.type === "meal"
                ? deleteMeal(entry.id)
                : deleteWorkout(entry.id)
            }
          />
        ))
      )}
    </div>
  );
}
