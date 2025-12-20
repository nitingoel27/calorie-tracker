import { useState, useEffect, useRef, useMemo } from "react";
import { useCalories } from "../context/CalorieContext";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { meals, workouts, dailyGoal, addMeal, addWorkout } = useCalories();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const endOfListRef = useRef<HTMLDivElement | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const todayEntries = [
    ...meals.map((m) => ({ ...m, type: "meal" as const })),
    ...workouts.map((w) => ({ ...w, type: "workout" as const })),
  ]
    .filter((e) => e.date?.slice(0, 10) === today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Keep the preview populated from the last entry for today so it persists
  // when navigating away and back. If the user manually types again we clear it.
  useEffect(() => {
    if (preview) return; // don't overwrite an active preview

    if (todayEntries.length === 0) return;

    // pick latest by ISO date string
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

  const nameCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of meals) {
      if (!m.name) continue;
      counts.set(m.name, (counts.get(m.name) ?? 0) + 1);
    }
    for (const w of workouts) {
      if (!w.name) continue;
      counts.set(w.name, (counts.get(w.name) ?? 0) + 1);
    }

    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [meals, workouts]);

  const autocompleteSuggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return nameCounts
      .filter(([name]) => name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(([name]) => name);
  }, [nameCounts, text]);

  // Auto-scroll to the latest entry / preview
  // useEffect(() => {
  //   if (!endOfListRef.current) return;
  //   endOfListRef.current.scrollIntoView({
  //     behavior: "smooth",
  //     block: "end",
  //   });
  // }, [todayEntries.length, preview]);

  return (
    <div className="h-[calc(100dvh-56px)] flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="px-4 pt-4 pb-2 border-b bg-white dark:bg-slate-900 dark:border-slate-800">
        
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Today&apos;s entries ({todayEntries.length}) · Chat with CalMate
        </p>
        <button className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          <Link to="/add">➕</Link>
        </button>
        </div>
      </div>

      {/* Fixed stats section (not scrollable) */}
      <div className="px-4 py-3 space-y-4">
        {meals.length === 0 && workouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-dashed border-purple-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              Welcome! Let&apos;s set you up.
            </h2>
            <p className="text-xs text-gray-600 mb-2">
              Start by adding your first meal or workout using the chat box
              below. We&apos;ll track your calories and macros for today.
            </p>
            <p className="text-xs text-gray-500">
              Tip: Try typing{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">
                1 bowl sweet corn
              </span>{" "}
              or use the quick buttons at the bottom.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                  Daily Goal
                </p>
                <p className="text-lg font-bold mt-1">{dailyGoal}</p>
              </div>

              <div
                className={`p-3 rounded-lg shadow-sm ${
                  remaining < 0
                    ? "bg-red-200 dark:bg-red-500/40"
                    : "bg-green-200 dark:bg-emerald-500/30"
                }`}
              >
                <p className="text-xs text-gray-600 dark:text-gray-100 uppercase tracking-wide">
                  Remaining
                </p>
                <p className="text-lg font-bold mt-1">{remaining}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-100 dark:bg-sky-500/20 p-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-100 uppercase tracking-wide">
                  Consumed
                </p>
                <p className="text-lg font-bold mt-1">{consumed}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {proteinTotal}g P • {fatTotal}g F • {carbsTotal}g C
                </p>
              </div>

              <div className="bg-orange-100 dark:bg-amber-500/30 p-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-100 uppercase tracking-wide">
                  Burned
                </p>
                <p className="text-lg font-bold mt-1">{burned}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Scrollable chat section */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 overscroll-contain">
        <div className="min-h-full flex flex-col justify-end space-y-3">
          {todayEntries.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-4">
              No entries yet for today. Tell me what you ate or your workout
              below.
            </p>
          ) : (
            todayEntries.map((entry) => {
              const isWorkout = entry.type === "workout";
              const timeLabel = new Date(entry.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={entry.id} className="flex justify-center w-full">
                  <div
                    className={`w-full rounded-2xl px-3 py-2 text-sm shadow-sm transition transform duration-200 ${
                      isWorkout
                        ? "bg-blue-50 text-gray-800 dark:bg-sky-900 dark:text-slate-50"
                        : "bg-purple-600 text-white dark:bg-violet-600"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium break-words">{entry.name}</p>
                      <span className="text-[10px] opacity-80">{timeLabel}</span>
                    </div>
                    <div className="mt-1 text-xs opacity-90 flex flex-wrap gap-2">
                      <span>{entry.calories} cal</span>
                      {entry.protein != null && (
                        <span>{entry.protein}g P</span>
                      )}
                      {entry.fat != null && <span>{entry.fat}g F</span>}
                      {entry.carbs != null && <span>{entry.carbs}g C</span>}
                      <span className="uppercase tracking-wide">
                        {isWorkout ? "Workout" : "Meal"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endOfListRef} />
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-white dark:bg-slate-900 px-3 py-2 space-y-2">
        <div className="max-w-2xl mx-auto flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
            onClick={() => setText("1 bowl paneer (approx 100g)")}
          >
            1 bowl paneer
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
            onClick={() => setText("2 eggs omelette")}
          >
            2 eggs omelette
          </button>
          {todayEntries.length > 0 && (
            <button
              type="button"
              className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
              onClick={() => {
                const last = todayEntries[todayEntries.length - 1];
                setText(last.name);
              }}
            >
              Repeat last
            </button>
          )}
        </div>
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setPreview(null);
            }}
            placeholder="Describe your meal or workout... e.g. Ate 1 bowl sweet corn"
            className="flex-1 resize-none rounded-2xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-h-28"
            rows={2}
          />
          <button
            onClick={handleAIAdd}
            disabled={loading || !text.trim()}
            className={`mb-1 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
              loading || !text.trim()
                ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400"
                : "bg-purple-600 text-white hover:bg-purple-700 dark:bg-violet-600 dark:hover:bg-violet-500"
            }`}
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  aria-hidden="true"
                ></span>
                <span>Sending</span>
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>
        {autocompleteSuggestions.length > 0 && (
          <div className="max-w-2xl mx-auto flex flex-wrap gap-1 text-[11px] text-gray-600">
            <span className="text-gray-400 mr-1">Suggestions:</span>
            {autocompleteSuggestions.map((name) => (
              <button
                key={name}
                type="button"
                className="px-2 py-1 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200"
                onClick={() => setText(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
