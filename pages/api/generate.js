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
    // Usamos Qwen 2.5, un modelo espectacular, rapidísimo y sin restricciones
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800,
          temperature: 0.7
        }),
      }
    );

    // Leemos la respuesta como texto primero para evitar el error <!DOCTYPE HTML>
    const textResponse = await response.text();
    
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      return res.status(500).json({ error: "Hugging Face devolvió una página web en lugar de datos. Revisá que tu API Key empiece con 'hf_' en minúscula." });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Error de Hugging Face." });
    }

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: "El modelo no generó respuesta." });
    }

    return res.status(200).json({ result: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error interno del servidor." });
  }
}
