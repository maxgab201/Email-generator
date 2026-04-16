// pages/api/generate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Asegurate de que en Vercel la variable tenga  (¡con hf en minúscula!)
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "HUGGINGFACE_API_KEY not configured." });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt." });
  }

  try {
    // Usamos Zephyr 7B: excelente para textos, nunca pide aceptar términos y la ruta es simple
    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `<|system|>\nYou are an expert email writer.\n<|user|>\n${prompt}\n<|assistant|>\n`,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      }
    );

    const textResponse = await response.text();
    
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      // Si llegás a ver esto, significa que el token en Vercel sigue con algún espacio en blanco o mayúscula
      return res.status(500).json({ error: "Error de conexión. Chequeá que en Vercel el token sea exacto: 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" });
    }

    if (!response.ok) {
      const errorMsg = data.error?.includes("is currently loading") 
        ? "El servidor de Hugging Face se está encendiendo. Esperá 20 segundos y volvé a darle a generar." 
        : (data.error || "Error de la API de Hugging Face.");
      return res.status(response.status).json({ error: errorMsg });
    }

    // Hugging face devuelve un array en este endpoint
    const text = data[0]?.generated_text;

    if (!text) {
      return res.status(500).json({ error: "El modelo no generó respuesta." });
    }

    return res.status(200).json({ result: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error interno del servidor." });
  }
}
