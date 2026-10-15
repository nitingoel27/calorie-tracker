import type { VercelRequest, VercelResponse } from "@vercel/node"

const allowedValues = {
  gender: ["male", "female"],
  activity: ["low", "moderate", "high"],
  goal: ["lose", "maintain", "gain"],
} as const

function parseBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === "string") {
    try {
      const parsed: unknown = JSON.parse(body)
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null
    } catch {
      return null
    }
  }

  return body && typeof body === "object" && !Array.isArray(body)
    ? body as Record<string, unknown>
    : null
}

function parseNumber(value: unknown): number | null {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !value.trim())
  ) {
    return null
  }

  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const body = parseBody(req.body)
  if (!body) {
    return res.status(400).json({ error: "Invalid request body" })
  }

  const age = parseNumber(body.age)
  const height = parseNumber(body.height)
  const weight = parseNumber(body.weight)
  const { gender, activity, goal } = body

  if (
    age === null || age < 13 || age > 120 ||
    height === null || height < 80 || height > 250 ||
    weight === null || weight < 20 || weight > 500 ||
    typeof gender !== "string" ||
    !(allowedValues.gender as readonly string[]).includes(gender) ||
    typeof activity !== "string" ||
    !(allowedValues.activity as readonly string[]).includes(activity) ||
    typeof goal !== "string" ||
    !(allowedValues.goal as readonly string[]).includes(goal)
  ) {
    return res.status(400).json({ error: "Invalid age, height, weight, or selection" })
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    console.error("MISTRAL_API_KEY is not configured")
    return res.status(500).json({ error: "AI macro calculation is not configured" })
  }

  const prompt = `You are a nutrition expert. Calculate daily calorie and macro requirements for the person described below.

Age: ${age}
Gender: ${gender}
Height: ${height} cm
Weight: ${weight} kg
Activity level: ${activity}
Goal: ${goal}

Return ONLY valid JSON, with no markdown or explanation, in this format:
{"calories": number, "protein": number, "fat": number, "carbs": number}`

  try {
    const upstream = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!upstream.ok) {
      console.error("Mistral API returned status", upstream.status)
      return res.status(502).json({ error: "AI macro calculation failed" })
    }

    const data: unknown = await upstream.json()
    const content = (data as {
      choices?: Array<{ message?: { content?: unknown } }>
    })?.choices?.[0]?.message?.content

    if (typeof content !== "string") {
      console.error("Mistral API returned an invalid response")
      return res.status(502).json({ error: "AI returned an invalid response" })
    }

    const match = content.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error("Mistral API response did not contain JSON")
      return res.status(502).json({ error: "AI returned an invalid response" })
    }

    const result: unknown = JSON.parse(match[0])
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return res.status(502).json({ error: "AI returned an invalid response" })
    }

    const macros = result as Record<string, unknown>
    const calories = parseNumber(macros.calories)
    const protein = parseNumber(macros.protein)
    const fat = parseNumber(macros.fat)
    const carbs = parseNumber(macros.carbs)

    if (
      calories === null || calories <= 0 ||
      protein === null || protein < 0 ||
      fat === null || fat < 0 ||
      carbs === null || carbs < 0
    ) {
      return res.status(502).json({ error: "AI returned invalid macro values" })
    }

    return res.status(200).json({ calories, protein, fat, carbs })
  } catch (error) {
    console.error("Mistral macro calculation failed:", error)
    return res.status(502).json({ error: "AI macro calculation failed" })
  }
}
