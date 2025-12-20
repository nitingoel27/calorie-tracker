import { useState } from "react";
import { useCalories } from "../context/CalorieContext";

export default function Settings() {
  const { dailyGoal, setDailyGoal, macroTargets, setMacroTargets } =
    useCalories();

  const [goal, setGoal] = useState(dailyGoal);
  const [proteinTarget, setProteinTarget] = useState(macroTargets.protein);
  const [fatTarget, setFatTarget] = useState(macroTargets.fat);
  const [carbTarget, setCarbTarget] = useState(macroTargets.carbs);

  const [saved, setSaved] = useState(false);
  const [showAICalc, setShowAICalc] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // AI inputs
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState("moderate");
  const [goalType, setGoalType] = useState("maintain");

  const numberInputClass =
    "w-full rounded-lg border appearance-none " +
    "bg-white text-gray-900 " +
    "dark:bg-slate-800 dark:text-slate-100 " +
    "border-gray-200 dark:border-slate-700 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setDailyGoal(Number(goal));
    setMacroTargets({
      protein: Number(proteinTarget) || 0,
      fat: Number(fatTarget) || 0,
      carbs: Number(carbTarget) || 0,
    });
    setAiMessage(null);
    setShowAICalc(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const extractJSON = (text: string) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    return JSON.parse(match[0]);
  };
  
  const handleAICalculate = async () => {
    setAiLoading(true);
  
    const prompt = `
  You are a nutrition expert.
  
  TASK:
  Calculate daily calorie and macro requirements.
  
  INPUT:
  Age: ${age}
  Gender: ${gender}
  Height: ${height} cm
  Weight: ${weight} kg
  Activity level: ${activity}
  Goal: ${goalType}
  
  OUTPUT FORMAT (IMPORTANT):
  Return ONLY valid JSON.
  No markdown.
  No explanation.
  No text.
  
  JSON TEMPLATE:
  {
    "calories": number,
    "protein": number,
    "fat": number,
    "carbs": number
  }
  `;
  
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-small",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      });
  
      const data = await res.json();
      const content = data.choices[0].message.content;
  
      const parsed = extractJSON(content);
  
      setGoal(() => Number(parsed.calories) || 0);
      setProteinTarget(() => Number(parsed.protein) || 0);
      setFatTarget(() => Number(parsed.fat) || 0);
      setCarbTarget(() => Number(parsed.carbs) || 0);
  
      setAiMessage("AI suggested values are filled below. Please review and tap Save")
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to calculate macros");
    } finally {
      setAiLoading(false);
    }
  };
  

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Settings</h2>
      {saved && (
        <div className="rounded-lg bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/40 px-3 py-2 text-sm text-green-700 dark:text-green-300">
          Goals saved successfully 🔥
        </div>
      )}
      {aiMessage && (
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 px-3 py-2 text-sm text-indigo-700 dark:text-indigo-300">
          {aiMessage}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAICalc((v) => !v)}
        className="text-sm text-indigo-600 underline"
      >
        {showAICalc ? "Close AI calculator" : "Calculate macros with AI"}
      </button>

      {showAICalc && (
        <div className="rounded-lg border p-3 space-y-2 text-sm bg-slate-50 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className={numberInputClass + " p-2"} />
            <input placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} className={numberInputClass + " p-2"} />
            <input placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className={numberInputClass + " p-2"} />

            <select value={gender} onChange={(e) => setGender(e.target.value)} className={numberInputClass + " p-2"}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select value={activity} onChange={(e) => setActivity(e.target.value)} className={numberInputClass + " p-2 col-span-2"}>
              <option value="low">Low activity</option>
              <option value="moderate">Moderate activity</option>
              <option value="high">High activity</option>
            </select>

            <select value={goalType} onChange={(e) => setGoalType(e.target.value)} className={numberInputClass + " p-2 col-span-2"}>
              <option value="lose">Fat loss</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Muscle gain</option>
            </select>
          </div>

          <button
            onClick={handleAICalculate}
            disabled={aiLoading}
            className="w-full bg-indigo-600 text-white rounded-lg p-2 text-sm"
          >
            {aiLoading ? "Calculating..." : "Get AI suggestion"}
          </button>
        </div>
      )}

      {/* Manual Save */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          Daily Calorie Goal
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className={`${numberInputClass} p-3 mt-1`}
          />
        </label>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <label>
            Protein (g)
            <input type="number" value={proteinTarget} onChange={(e) => setProteinTarget(Number(e.target.value))} className={`${numberInputClass} p-3 mt-1`} />
          </label>
          <label>
            Fat (g)
            <input type="number" value={fatTarget} onChange={(e) => setFatTarget(Number(e.target.value))} className={`${numberInputClass} p-3 mt-1`} />
          </label>
          <label>
            Carbs (g)
            <input type="number" value={carbTarget} onChange={(e) => setCarbTarget(Number(e.target.value))} className={`${numberInputClass} p-3 mt-1`} />
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 dark:bg-slate-800 text-white p-3 rounded-lg text-sm font-medium"
        >
          Save
        </button>
      </form>
    </div>
  );
}
