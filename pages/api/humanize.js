export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.MISTRAL_API_KEY;
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Falta el texto a humanizar." });

  // PROMPT ULTRA DETALLADO Y RESTRICTIVO
  const prompt = `You are an expert copyeditor specializing in humanizing AI-generated text. Your objective is to rewrite the provided email so it reads as if written by a real human professional, STRICTLY following these constraints:
1. ZERO AI-ISMS: Remove entirely robotic and cliché phrasing (e.g., 'I hope this email finds you well', 'delve', 'synergy', 'testament to', 'seamless', 'in conclusion').
2. PRESERVE LENGTH: The word count must remain practically identical to the original. Do not expand or summarize.
3. PRESERVE NAMES: Do not add, modify, or remove the sender's or recipient's names. Leave them exactly as they are.
4. PRESERVE MEANING: Do not change the topic, intent, tone, or any core information.
5. MINIMAL INTERVENTION: Change ONLY what is strictly necessary to make it sound natural, realistic, and slightly conversational. Do not over-edit.

Output ONLY the final rewritten email text, without any commentary, markdown blocks, or introductory text.

Original Text:
${text}`;

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Temperatura baja para que no invente cosas nuevas, solo corrija
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
