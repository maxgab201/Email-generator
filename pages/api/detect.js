export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Vamos a esconder tu Private Key en Vercel
  const apiKey = process.env.SAPLING_API_KEY;
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Falta el texto a analizar." });
  if (!apiKey) return res.status(500).json({ error: "SAPLING_API_KEY no configurada." });

  try {
    const response = await fetch("https://api.sapling.ai/api/v1/aidetect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: apiKey,
        text: text
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error("Error en Sapling API.");
    
    // Sapling devuelve un "score" donde 1.0 es IA y 0.0 es Humano.
    // Lo convertimos a porcentaje de IA:
    const aiPercentage = Math.round(data.score * 100);
    
    return res.status(200).json({ 
      aiScore: aiPercentage, 
      humanScore: 100 - aiPercentage 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
}
