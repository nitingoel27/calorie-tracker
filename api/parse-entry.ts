import type { VercelRequest, VercelResponse } from "@vercel/node"
import * as https from "https"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log("🔥 parse-entry route hit")

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  try {
    // ✅ SAFELY PARSE BODY
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body

    const text = body?.text

    if (!text) {
      return res.status(400).json({ error: "Missing text" })
    }

    const apiKey = process.env.GEMINI_API_KEY
    console.log("🔑 GEMINI KEY exists:", !!apiKey)

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key" })
    }

    const prompt = `
You are a calorie tracking assistant.
The response needs to be very acurate.
Convert the user input into VALID JSON ONLY.
DO NOT add explanation, markdown, or text.
MAKE SURE RESPONSE VALUES ARE ACCURATE.
INPUT:
"${text}"

OUTPUT FORMAT (JSON ONLY):
{
  "type": "meal" | "workout",
  "name": string, //add quantity as well in the name in grams if it is bowl plate convert accordingly
  "calories": number,
  "protein": number,   // grams
  "fat": number,       // grams
  "carbs": number      // grams
}
`
    // Use the v1beta endpoint for Gemini models which may not be available
    // for the v1 API or for the generateContent RPC. If you still get a 404,
    // call the ListModels endpoint to see available models and supported methods.
    // Use a small https POST helper with agent:false to avoid shared socket
    // keep-alive issues on Windows/dev servers (prevents UV_HANDLE_CLOSING).
    const postJson = (url: string, body: any) =>
      new Promise<any>((resolve, reject) => {
        const data = JSON.stringify(body)
        const u = new URL(url)

        const options: https.RequestOptions = {
          hostname: u.hostname,
          port: u.port ? Number(u.port) : 443,
          path: u.pathname + u.search,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
          },
          // disable keep-alive / shared sockets
          agent: false,
        }

        const request = https.request(options, (response) => {
          let raw = ""
          response.setEncoding("utf8")
          response.on("data", (chunk) => (raw += chunk))
          response.on("end", () => {
            try {
              const parsed = JSON.parse(raw)
              resolve(parsed)
            } catch (e) {
              // return raw text if not JSON
              resolve(raw)
            }
          })
        })

        request.on("error", reject)
        request.write(data)
        request.end()
      })

    const getJson = (url: string) =>
      new Promise<any>((resolve, reject) => {
        const u = new URL(url)
        const options: https.RequestOptions = {
          hostname: u.hostname,
          port: u.port ? Number(u.port) : 443,
          path: u.pathname + u.search,
          method: "GET",
          agent: false,
        }

        const req = https.request(options, (res) => {
          let raw = ""
          res.setEncoding("utf8")
          res.on("data", (c) => (raw += c))
          res.on("end", () => {
            try {
              resolve(JSON.parse(raw))
            } catch (e) {
              resolve(raw)
            }
          })
        })

        req.on("error", reject)
        req.end()
      })

    // Helper to try a single model + rpc combination
    const tryCall = async (modelName: string, rpc: string) => {
      const base = `https://generativelanguage.googleapis.com/v1beta/${modelName}:${rpc}?key=${apiKey}`
      try {
        if (rpc === "generateContent") {
          return await postJson(base, {
            contents: [{ parts: [{ text: prompt }] }],
          })
        }

        if (rpc === "generateMessage") {
          return await postJson(base, {
            messages: [
              {
                author: "user",
                content: [{ type: "text", text: prompt }],
              },
            ],
          })
        }

        if (rpc === "generateText") {
          // best-effort payload for generateText
          return await postJson(base, { text: prompt })
        }

        return null
      } catch (e) {
        return { error: String(e) }
      }
    }

    // First, attempt to list models to discover supported models/RPCs
    let data: any = null
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      const list = await getJson(listUrl)
      const models = Array.isArray(list?.models) ? list.models : []

      // prefer models that include 'gemini'
      const candidates = models
        .filter((m: any) => typeof m.name === "string")
        .sort((a: any, b: any) => {
          const ai = (a.name.includes("gemini") ? 0 : 1)
          const bi = (b.name.includes("gemini") ? 0 : 1)
          return ai - bi
        })

      const rpcs = ["generateContent", "generateMessage", "generateText"]

      for (const m of candidates) {
        for (const rpc of rpcs) {
          const attempt = await tryCall(m.name, rpc)
          if (!attempt) continue
          if (attempt && typeof attempt === "object" && "error" in attempt) {
            // try next
            continue
          }
          data = attempt
          break
        }
        if (data) break
      }
    } catch (e) {
      // If ListModels fails, fall back to trying the well-known path
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
      data = await postJson(url, { contents: [{ parts: [{ text: prompt }] }] })
    }

    // If we still have an API-level error
    if (data && typeof data === "object" && "error" in data) {
      console.error("❌ Gemini API error:", JSON.stringify(data, null, 2))
      return res.status(500).json({ error: "Gemini API failed" })
    }

    const raw =
      data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!raw) {
      return res.status(500).json({ error: "Empty AI response" })
    }

    // ✅ SAFELY EXTRACT JSON
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error("❌ Invalid AI format:", raw)
      return res.status(500).json({ error: "Invalid AI output" })
    }

    const parsed = JSON.parse(match[0])

    return res.status(200).json(parsed)
  } catch (err) {
    console.error("💥 Parse Entry Error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}
