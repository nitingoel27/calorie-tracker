import { useState, useEffect, useRef, useMemo } from "react";
import { useCalories } from "../context/CalorieContext";
import { v4 as uuidv4 } from "uuid";

export default function Dashboard() {
  const { meals, workouts, dailyGoal, addMeal, addWorkout } = useCalories();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);

  const endOfListRef = useRef<HTMLDivElement | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  /* ---------- Today entries ---------- */
  const todayEntries = [
    ...meals.map((m) => ({ ...m, type: "meal" as const })),
    ...workouts.map((w) => ({ ...w, type: "workout" as const })),
  ]
    .filter((e) => e.date?.slice(0, 10) === today)
    .sort((a, b) => a.date.localeCompare(b.date));

  /* ---------- Persist preview ---------- */
  useEffect(() => {
    if (preview || todayEntries.length === 0) return;

    const latest = [...todayEntries].sort((a, b) =>
      b.date.localeCompare(a.date)
    )[0];

    setPreview({
      name: latest.name,
      calories: latest.calories,
      protein: latest.protein ?? 0,
      fat: latest.fat ?? 0,
      carbs: latest.carbs ?? 0,
      type: latest.type,
    });
  }, [todayEntries, preview]);

  /* ---------- Add via AI ---------- */
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
      if (!data?.name) throw new Error("Invalid response");

      const entry = {
        id: uuidv4(),
        name: data.name,
        calories: Number(data.calories) || 0,
        protein: data.protein != null ? Number(data.protein) || 0 : undefined,
        fat: data.fat != null ? Number(data.fat) || 0 : undefined,
        carbs: data.carbs != null ? Number(data.carbs) || 0 : undefined,
        date: new Date().toISOString(),
      };

      data.type === "meal" ? addMeal(entry) : addWorkout(entry);

      setText("");
      setPreview(null);
    } catch (e) {
      alert("Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Totals ---------- */
  const consumed = meals
    .filter((m) => m.date?.slice(0, 10) === today)
    .reduce((s, m) => s + m.calories, 0);

  const burned = workouts
    .filter((w) => w.date?.slice(0, 10) === today)
    .reduce((s, w) => s + w.calories, 0);

  const proteinTotal = meals
    .filter((m) => m.date?.slice(0, 10) === today)
    .reduce((s, m) => s + (m.protein ?? 0), 0);

  const fatTotal = meals
    .filter((m) => m.date?.slice(0, 10) === today)
    .reduce((s, m) => s + (m.fat ?? 0), 0);

  const carbsTotal = meals
    .filter((m) => m.date?.slice(0, 10) === today)
    .reduce((s, m) => s + (m.carbs ?? 0), 0);

  const remaining = dailyGoal - (consumed - burned);

  /* ---------- Autocomplete ---------- */
  const nameCounts = useMemo(() => {
    const map = new Map<string, number>();
    [...meals, ...workouts].forEach((e) => {
      if (e.name) map.set(e.name, (map.get(e.name) ?? 0) + 1);
    });
    return Array.from(map.keys());
  }, [meals, workouts]);

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return nameCounts.filter((n) => n.toLowerCase().includes(q)).slice(0, 5);
  }, [text, nameCounts]);

  /* ---------- Auto scroll ---------- */
  useEffect(() => {
    endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [todayEntries.length, preview]);

  /* ---------- INPUT BAR (single instance) ---------- */
  const InputBar = (
    <div className="border-t bg-white dark:bg-slate-900 px-3 py-2 space-y-2">
      <div className="max-w-2xl mx-auto flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(null);
          }}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
          placeholder="Describe your meal or workout..."
          className="flex-1 resize-none rounded-2xl border px-3 py-2 text-sm max-h-28"
          rows={2}
        />

        <button
          onClick={handleAIAdd}
          disabled={loading || !text.trim()}
          className="rounded-full px-4 py-2 text-sm font-medium bg-purple-600 text-white disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="max-w-2xl mx-auto flex flex-wrap gap-1 text-[11px]">
          {suggestions.map((name) => (
            <button
              key={name}
              onClick={() => setText(name)}
              className="px-2 py-1 rounded-full bg-gray-100 border"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100dvh-56px)] flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* HEADER */}
      <div className="px-4 py-3 border-b bg-white dark:bg-slate-900">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-xs text-gray-500">
          Today’s entries ({todayEntries.length})
        </p>
      </div>

      {/* STATS */}
      <div className="px-4 py-3 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Daily Goal</p>
            <p className="font-bold">{dailyGoal}</p>
          </div>
          <div
            className={`p-3 rounded-lg ${
              remaining < 0 ? "bg-red-200" : "bg-green-200"
            }`}
          >
            <p className="text-xs">Remaining</p>
            <p className="font-bold">{remaining}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-xs">Consumed</p>
            <p className="font-bold">{consumed}</p>
            <p className="text-xs">
              {proteinTotal}g P • {fatTotal}g F • {carbsTotal}g C
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <p className="text-xs">Burned</p>
            <p className="font-bold">{burned}</p>
          </div>
        </div>
      </div>

      {/* INPUT ON TOP WHEN TYPING */}
      {isTyping && InputBar}

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto px-4">
        {todayEntries.map((e) => (
          <div key={e.id} className="my-2 rounded-xl bg-purple-600 text-white p-3">
            <div className="flex justify-between text-sm">
              <span>{e.name}</span>
              <span className="opacity-70">
                {new Date(e.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="text-xs mt-1">
              {e.calories} cal
              {e.protein != null && ` • ${e.protein}g P`}
              {e.fat != null && ` • ${e.fat}g F`}
              {e.carbs != null && ` • ${e.carbs}g C`}
            </div>
          </div>
        ))}
        <div ref={endOfListRef} />
      </div>

      {/* INPUT AT BOTTOM WHEN NOT TYPING */}
      {!isTyping && InputBar}
    </div>
  );
}
