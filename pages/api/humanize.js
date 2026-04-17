export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.MISTRAL_API_KEY;
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Falta el texto a humanizar." });

  const prompt = `You are an expert editor. Rewrite the following email to sound completely human, natural, and conversational. Remove any AI-like phrasing (like "delve", "synergy", "testament", "I hope this email finds you well"), corporate jargon, or robotic structures. Make it sound like a real person typing casually but professionally. Keep the same language as the original. Only output the rewritten email.\n\nOriginal Text:\n${text}`;

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8, // Un poco más alto para mayor creatividad humana
        max_tokens: 1000
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Error en Mistral.");
    
    return res.status(200).json({ result: data.choices[0].message.content.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
}
