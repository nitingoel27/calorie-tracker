import { useCalories } from "../context/CalorieContext";
import HistoryItem from "../components/HistoryItem";

export default function History() {
  const {
    meals,
    workouts,
    deleteMeal,
    deleteWorkout,
    updateMeal,
    updateWorkout,
  } = useCalories();

  // Combine meals + workouts
  const allEntries = [
    ...meals.map((m) => ({ ...m, type: "meal" as const })),
    ...workouts.map((w) => ({ ...w, type: "workout" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // 🔹 Group entries by date (YYYY-MM-DD)
  const groupedByDate = allEntries.reduce<Record<string, typeof allEntries>>(
    (acc, entry) => {
      const dateKey = entry.date.slice(0, 10);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(entry);
      return acc;
    },
    {}
  );

  // 🔹 Helper to show friendly date labels
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 text-gray-900 dark:text-slate-100">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">History</h2>
          {allEntries.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {allEntries.length}{" "}
              {allEntries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {allEntries.length === 0 ? (
          <p className="text-gray-400 dark:text-slate-500 mt-2 text-sm">
            No entries yet. Add meals or workouts and they&apos;ll show up here.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, entries]) => (
              <div key={date} className="space-y-2">
                {/* Date header */}
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  {formatDateLabel(date)}
                </div>

                {/* Entries for that date */}
                <div className="space-y-3">
                  {entries.map((entry) => (
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
