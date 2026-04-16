import { useState, useRef } from "react";
import Head from "next/head";

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian",
  "Portuguese", "Chinese", "Japanese", "Korean", "Arabic",
  "Russian", "Dutch", "Swedish", "Polish", "Turkish",
];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const VOCAB_COMPLEXITY = ["Simple", "Intermediate", "Complex"];

export default function Home() {
  const [form, setForm] = useState({
    consigna: "",
    idioma: "English",
    longitudType: "range",
    longitudMin: "",
    longitudMax: "",
    longitudSpecific: "",
    nivel: "B1",
    vocabulario: "Intermediate",
    vocabularioExtra: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const buildPrompt = () => {
    let lengthInstruction = "";
    if (form.longitudType === "range") {
      if (form.longitudMin && form.longitudMax)
        lengthInstruction = `between ${form.longitudMin} and ${form.longitudMax} words`;
      else if (form.longitudMin)
        lengthInstruction = `at least ${form.longitudMin} words`;
      else if (form.longitudMax)
        lengthInstruction = `at most ${form.longitudMax} words`;
      else lengthInstruction = "medium length (around 150–200 words)";
    } else {
      lengthInstruction = form.longitudSpecific
        ? `exactly ${form.longitudSpecific} words`
        : "medium length (around 150 words)";
    }

    const vocabExtra = form.vocabularioExtra.trim()
      ? `\n- You MUST naturally include the following vocabulary words or phrases: ${form.vocabularioExtra}.`
      : "";

    return `Write a professional email in ${form.idioma} with the following specifications:

- Topic / Assignment: ${form.consigna}
- Language proficiency level: ${form.nivel} (CEFR scale) — adapt vocabulary, grammar complexity, and sentence structure accordingly
- Email length: ${lengthInstruction}
- Vocabulary complexity: ${form.vocabulario} — use ${form.vocabulario.toLowerCase()} vocabulary appropriate for a ${form.nivel} learner${vocabExtra}

Format the email properly with: Subject line, Greeting, Body paragraphs, Closing, and Signature.
Only output the email itself — no explanations, no meta-commentary.`;
  };

  const handleGenerate = async () => {
    if (!form.consigna.trim()) {
      setError("Please enter a topic or assignment.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error.");
      setResult(data.result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>MailCraft — AI Email Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="root">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />

        <div className="container">
          {/* Header */}
          <header className="header">
            <div className="logo-mark">✉</div>
            <h1 className="title">MailCraft</h1>
            <p className="subtitle">AI-powered email generator</p>
            <div className="model-badge">
              <span className="model-dot" />
              Gemini 3.1 Pro Preview
            </div>
          </header>

          {/* Form */}
          <div className="card">
            {/* Consigna */}
            <div className="field-group">
              <label className="label">
                <span>📝</span> Topic / Assignment <span className="required">*</span>
              </label>
              <textarea
                className="textarea"
                rows={3}
                value={form.consigna}
                onChange={(e) => handleChange("consigna", e.target.value)}
                placeholder="e.g. Write an email to your professor apologizing for missing class..."
              />
            </div>

            {/* Language */}
            <div className="field-group">
              <label className="label"><span>🌍</span> Language</label>
              <select
                className="select"
                value={form.idioma}
                onChange={(e) => handleChange("idioma", e.target.value)}
              >
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Length */}
            <div className="field-group">
              <label className="label"><span>📏</span> Length (words)</label>
              <div className="toggle-row">
                <button
                  className={`toggle-btn${form.longitudType === "range" ? " active" : ""}`}
                  onClick={() => handleChange("longitudType", "range")}
                >Range</button>
                <button
                  className={`toggle-btn${form.longitudType === "specific" ? " active" : ""}`}
                  onClick={() => handleChange("longitudType", "specific")}
                >Specific</button>
              </div>
              {form.longitudType === "range" ? (
                <div className="range-row">
                  <input className="input-half" type="number" placeholder="Min"
                    value={form.longitudMin} onChange={(e) => handleChange("longitudMin", e.target.value)} />
                  <span className="range-sep">—</span>
                  <input className="input-half" type="number" placeholder="Max"
                    value={form.longitudMax} onChange={(e) => handleChange("longitudMax", e.target.value)} />
                </div>
              ) : (
                <input className="input" type="number" placeholder="e.g. 150"
                  value={form.longitudSpecific} onChange={(e) => handleChange("longitudSpecific", e.target.value)} />
              )}
            </div>

            {/* Level */}
            <div className="field-group">
              <label className="label"><span>🎓</span> Language Level (CEFR)</label>
              <div className="chip-row">
                {LEVELS.map((lvl) => (
                  <button key={lvl} className={`chip${form.nivel === lvl ? " active" : ""}`}
                    onClick={() => handleChange("nivel", lvl)}>{lvl}</button>
                ))}
              </div>
            </div>

            {/* Vocab Complexity */}
            <div className="field-group">
              <label className="label"><span>🔤</span> Vocabulary Complexity</label>
              <div className="chip-row">
                {VOCAB_COMPLEXITY.map((v) => (
                  <button key={v} className={`chip${form.vocabulario === v ? " active" : ""}`}
                    onClick={() => handleChange("vocabulario", v)}>{v}</button>
                ))}
              </div>
            </div>

            {/* Optional Vocab */}
            <div className="field-group">
              <label className="label">
                <span>✨</span> Required Vocabulary
                <span className="optional-tag">optional</span>
              </label>
              <input className="input" type="text"
                placeholder="e.g. apologize, circumstances, sincere..."
                value={form.vocabularioExtra}
                onChange={(e) => handleChange("vocabularioExtra", e.target.value)} />
              <span className="hint">Separate words with commas</span>
            </div>

            {error && <div className="error-box">⚠️ {error}</div>}

            <button
              className={`generate-btn${loading ? " disabled" : ""}`}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-inner">
                  <span className="spinner" />
                  Generating...
                </span>
              ) : "Generate Email ✉"}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div ref={resultRef} className="result-card">
              <div className="result-header">
                <div>
                  <h2 className="result-title">Generated Email</h2>
                  <p className="result-meta">{form.nivel} · {form.vocabulario} · {form.idioma}</p>
                </div>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <div className="result-divider" />
              <pre className="result-text">{result}</pre>
              <button className="reset-btn" onClick={handleReset}>← Generate Another</button>
            </div>
          )}

          <p className="footer">Powered by Google Gemini 3.1 Pro Preview</p>
        </div>
      </div>
    </>
  );
}

