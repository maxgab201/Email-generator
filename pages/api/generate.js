// pages/api/generate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENROUTER_API_KEY not configured." });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // IMPORTANTE: OpenRouter requiere esto para sus modelos gratuitos
        "HTTP-Referer": "https://email-generator6000.vercel.app/", 
        "X-Title": "MailCraft"
      },
      body: JSON.stringify({
        // Si este modelo sigue tirando error, cámbialo por "google/gemini-2.5-pro:free" o "meta-llama/llama-3.3-70b-instruct:free"
        //model: "qwen/qwen3-next-80b-a3b-instruct:free",
        model: "google/gemini-2.5-flash:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter API error."
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: "No response from model." });
    }

    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
}
