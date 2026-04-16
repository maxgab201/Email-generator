// pages/api/generate.js
// Volvemos a la API directa de Google con un modelo estable

const GEMINI_MODEL = "gemini-1.5-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured." });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({
        error: errData?.error?.message || "Gemini API error.",
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: "No response from Gemini." });
    }

    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
}
