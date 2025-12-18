import { useState, useEffect, useRef } from "react";
import { useCalories } from "../context/CalorieContext";
import { v4 as uuidv4 } from "uuid";

export default function Dashboard() {
  const { meals, workouts, dailyGoal, addMeal, addWorkout } = useCalories();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const today = new Date().toISOString().slice(0, 10);

  // Keep the preview populated from the last entry for today so it persists
  // when navigating away and back. If the user manually types again we clear it.
  useEffect(() => {
    if (preview) return; // don't overwrite an active preview

    const todayEntries = [
      ...meals.map((m) => ({ ...m, type: "meal" })),
      ...workouts.map((w) => ({ ...w, type: "workout" })),
    ].filter((e) => e.date?.slice(0, 10) === today);

    if (todayEntries.length === 0) return;

    // pick latest by ISO date string
    todayEntries.sort((a, b) => b.date.localeCompare(a.date));
    const latest = todayEntries[0];
    setPreview({
      name: latest.name,
      calories: latest.calories,
      protein: latest.protein ?? 0,
      fat: latest.fat ?? 0,
      carbs: latest.carbs ?? 0,
      type: latest.type,
    });
  }, [meals, workouts, preview]);

  const handleAIAdd = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/parse-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      // normalize numeric macros
      const normalized = {
        ...data,
        calories: Number(data.calories) || 0,
        protein: data.protein !== undefined ? Number(data.protein) || 0 : 0,
        fat: data.fat !== undefined ? Number(data.fat) || 0 : 0,
        carbs: data.carbs !== undefined ? Number(data.carbs) || 0 : 0,
      };
      setPreview(normalized);
      if (!data || !data.name || data.calories === undefined || data.calories === null) {
        alert("Could not understand entry");
        setLoading(false);
        return;
      }

      const entry = {
        id: uuidv4(),
        name: data.name,
        calories: Number(data.calories) || 0,
        protein: data.protein !== undefined ? Number(data.protein) || 0 : undefined,
        fat: data.fat !== undefined ? Number(data.fat) || 0 : undefined,
        carbs: data.carbs !== undefined ? Number(data.carbs) || 0 : undefined,
        date: new Date().toISOString(),
      };

      if (data.type === "meal") addMeal(entry);
      else addWorkout(entry);

      setText("");
    } catch (e) {
      console.error(e);
      alert("Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  const consumed = meals
    .filter((m) => m?.date?.slice(0, 10) === today)
    .reduce((sum, m) => sum + m.calories, 0);

  const burned = workouts
    .filter((w) => w?.date?.slice(0, 10) === today)
    .reduce((sum, w) => sum + w.calories, 0);

  const proteinTotal = meals
    .filter((m) => m?.date?.slice(0, 10) === today)
    .reduce((sum, m) => sum + (m.protein ?? 0), 0);

  const fatTotal = meals
    .filter((m) => m?.date?.slice(0, 10) === today)
    .reduce((sum, m) => sum + (m.fat ?? 0), 0);

  const carbsTotal = meals
    .filter((m) => m?.date?.slice(0, 10) === today)
    .reduce((sum, m) => sum + (m.carbs ?? 0), 0);

  const netCalories = consumed - burned;
  const remaining = dailyGoal - netCalories;

  // auto-scroll chat to bottom when entries or preview change
  const chatRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = chatRef.current
    if (!el) return
    // scroll to bottom smoothly
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [meals, workouts, preview])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-500">Daily Goal</p>
          <p className="text-lg font-bold">{dailyGoal}</p>
        </div>

        <div
          className={`p-3 rounded ${
            remaining < 0 ? "bg-red-200" : "bg-green-200"
          }`}
        >
          <p className="text-sm text-gray-600">Remaining</p>
          <p className="text-lg font-bold">{remaining}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-100 p-3 rounded">
          <p className="text-sm text-gray-600">Consumed</p>
          <p className="text-lg font-bold">{consumed}</p>
          <p className="text-xs text-gray-600 mt-1">{proteinTotal}g P • {fatTotal}g F • {carbsTotal}g C</p>
        </div>

        <div className="bg-orange-100 p-3 rounded">
          <p className="text-sm text-gray-600">Burned</p>
          <p className="text-lg font-bold">{burned}</p>
        </div>
      </div>

      {/* Chat area: list all today's entries */}
      <div className="pb-32">{/* extra bottom padding for fixed input */}
        <div ref={chatRef} className="space-y-3 max-h-[50vh] overflow-auto p-2">
          {/* Combine meals and workouts for today, sorted ascending */}
          {([
            ...meals.map((m) => ({ ...m, type: "meal" })),
            ...workouts.map((w) => ({ ...w, type: "workout" })),
          ] as Array<import('../context/CalorieContext').Meal & { type: 'meal' } | import('../context/CalorieContext').Workout & { type: 'workout' }>)
            .filter((e) => e.date?.slice(0, 10) === today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((entry) => (
              <div
                key={entry.id}
                className={`max-w-[85%] p-3 rounded-lg shadow-sm ${entry.type === 'meal' ? 'bg-gray-100 self-start' : 'bg-orange-100 self-end'}`}
              >
                <div className="font-medium">{entry.name}</div>
                <div className="text-xs text-gray-600">{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="mt-2 text-sm">
                  <span className="font-semibold">{entry.calories} cal</span>
                  {entry.protein !== undefined && <span className="ml-2 text-xs text-gray-600">• {entry.protein}g P</span>}
                  {entry.fat !== undefined && <span className="ml-2 text-xs text-gray-600">• {entry.fat}g F</span>}
                  {entry.carbs !== undefined && <span className="ml-2 text-xs text-gray-600">• {entry.carbs}g C</span>}
                </div>
              </div>
            ))}

          {/* Preview (AI assistant) shown as a bot bubble if present */}
          {preview && (
            <div className="max-w-[85%] p-3 rounded-lg shadow-sm bg-indigo-50 self-start">
              <div className="font-medium">{preview.name}</div>
              <div className="text-xs text-gray-600">AI suggestion</div>
              <div className="mt-2 text-sm">
                <span className="font-semibold">{preview.calories} cal</span>
                <span className="ml-2 text-xs text-gray-600">• {preview.protein ?? 0}g P</span>
                <span className="ml-2 text-xs text-gray-600">• {preview.fat ?? 0}g F</span>
                <span className="ml-2 text-xs text-gray-600">• {preview.carbs ?? 0}g C</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed chat input at bottom-right */}
      <div className="fixed left-0 right-0 bottom-4 px-4 pointer-events-none">
        <div className="mx-auto max-w-2xl flex items-end gap-2 pointer-events-auto">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setPreview(null); }}
            placeholder="Type a meal or workout (e.g. '2 eggs and toast')"
            className="flex-1 p-3 border rounded-lg resize-none h-14"
          />
          <button
            onClick={handleAIAdd}
            disabled={loading}
            className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg"
            aria-label="Send"
          >
            {loading ? '…' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
}
