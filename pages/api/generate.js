// pages/api/generate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "HUGGINGFACE_API_KEY not configured." });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt." });
  }

  try {
    // Usamos Mistral, un modelo excelente y rápido para la capa gratuita
    const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // El formato [INST] es necesario para que Mistral entienda que es una orden
          inputs: `<s>[INST] ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            return_full_text: false // Para que no repita tu consigna en la respuesta
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Hugging Face a veces "despierta" el modelo, si devuelve error 503, avisa
      const errorMsg = data.error?.includes("is currently loading") 
        ? "El modelo se está despertando, reintentá en 20 segundos." 
        : (data.error || "Error de Hugging Face.");
        
      return res.status(response.status).json({ error: errorMsg });
    }

    const text = data[0]?.generated_text;

    if (!text) {
      return res.status(500).json({ error: "El modelo no generó respuesta." });
    }

    return res.status(200).json({ result: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error interno del servidor." });
  }
}
