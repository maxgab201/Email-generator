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

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #0f0d09; font-family: 'DM Sans', sans-serif; }

        .root {
          min-height: 100vh;
          background: #0f0d09;
          position: relative;
          overflow-x: hidden;
        }
        .bg-orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .orb1 {
          top: -20%; right: -20%;
          width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
        }
        .orb2 {
          bottom: -30%; left: -15%;
          width: 70vw; height: 70vw;
          background: radial-gradient(circle, rgba(120,90,40,0.06) 0%, transparent 70%);
        }
        .container {
          position: relative; z-index: 1;
          max-width: 480px; margin: 0 auto;
          padding: 24px 16px 48px;
        }
        .header { text-align: center; margin-bottom: 28px; padding-top: 8px; }
        .logo-mark { font-size: 32px; margin-bottom: 8px; display: block; filter: drop-shadow(0 0 12px rgba(201,168,76,0.4)); }
        .title { font-family: 'Fraunces', serif; font-size: 34px; font-weight: 700; color: #e8dfc8; letter-spacing: -0.5px; margin-bottom: 4px; }
        .subtitle { color: #8a8070; font-size: 13px; letter-spacing: 0.5px; margin-bottom: 12px; }
        .model-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2);
          border-radius: 20px; padding: 4px 12px;
          font-size: 11px; color: #c9a84c; font-weight: 500; letter-spacing: 0.3px;
        }
        .model-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #c9a84c;
          animation: pulse 2s ease-in-out infinite; flex-shrink: 0;
        }
        .card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 24px; backdrop-filter: blur(10px);
          animation: fadeUp 0.4s ease;
        }
        .field-group { margin-bottom: 22px; }
        .label {
          display: flex; align-items: center; gap: 6px;
          color: #c5b99a; font-size: 13px; font-weight: 500;
          letter-spacing: 0.3px; margin-bottom: 8px; text-transform: uppercase;
        }
        .required { color: #c9a84c; margin-left: 2px; }
        .optional-tag {
          background: rgba(255,255,255,0.06); border-radius: 4px;
          padding: 1px 6px; font-size: 10px; color: #8a8070;
          font-weight: 400; text-transform: none; letter-spacing: 0; margin-left: 4px;
        }
        .textarea, .input, .select {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          padding: 12px 14px; color: #e8dfc8; font-size: 14px;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .textarea { resize: vertical; line-height: 1.6; }
        .textarea:focus, .input:focus, .select:focus {
          outline: none; border-color: #c9a84c; box-shadow: 0 0 0 3px rgba(201,168,76,0.15);
        }
        .textarea::placeholder, .input::placeholder { color: #8a8070; }
        .select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a84c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; cursor: pointer;
        }
        select option { background: #1e1a14; color: #e8dfc8; }
        .toggle-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .toggle-btn {
          flex: 1; padding: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; color: #8a8070; font-size: 13px;
          cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .toggle-btn.active {
          background: rgba(201,168,76,0.15); border-color: rgba(201,168,76,0.35);
          color: #c9a84c; font-weight: 500;
        }
        .range-row { display: flex; align-items: center; gap: 10px; }
        .input-half {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          padding: 12px 14px; color: #e8dfc8; font-size: 14px;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-half:focus { outline: none; border-color: #c9a84c; box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
        .input-half::placeholder { color: #8a8070; }
        .range-sep { color: #8a8070; font-size: 18px; flex-shrink: 0; }
        .chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip {
          padding: 7px 14px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; color: #9a9080; font-size: 13px;
          cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-weight: 500;
        }
        .chip.active {
          background: rgba(201,168,76,0.18); border-color: rgba(201,168,76,0.4); color: #e8c84c;
        }
        .hint { color: #6a6055; font-size: 11px; margin-top: 5px; display: block; }
        .error-box {
          background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2);
          border-radius: 10px; padding: 12px 14px;
          color: #ff9090; font-size: 13px; margin-bottom: 16px;
        }
        .generate-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #c9a84c 0%, #a07830 100%);
          border: none; border-radius: 14px; color: #0f0d09;
          font-size: 16px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; letter-spacing: 0.3px; transition: opacity 0.2s, transform 0.1s;
          box-shadow: 0 4px 20px rgba(201,168,76,0.25);
        }
        .generate-btn.disabled { opacity: 0.6; cursor: not-allowed; }
        .loading-inner { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .spinner {
          width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0f0d09; border-radius: 50%;
          animation: spin 0.8s linear infinite; display: inline-block;
        }
        .result-card {
          margin-top: 20px;
          background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.18);
          border-radius: 20px; padding: 24px; animation: fadeUp 0.4s ease;
        }
        .result-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .result-title { font-family: 'Fraunces', serif; color: #e8dfc8; font-size: 20px; font-weight: 500; margin-bottom: 2px; }
        .result-meta { color: #8a8070; font-size: 12px; }
        .copy-btn {
          background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.25);
          border-radius: 8px; color: #c9a84c; padding: 6px 14px;
          font-size: 12px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; font-weight: 600; flex-shrink: 0; transition: all 0.2s;
        }
        .result-divider { height: 1px; background: rgba(201,168,76,0.12); margin-bottom: 16px; }
        .result-text {
          color: #d4c9a8; font-size: 14px; line-height: 1.8;
          white-space: pre-wrap; font-family: 'DM Sans', sans-serif; word-break: break-word;
        }
        .reset-btn {
          margin-top: 20px; background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #8a8070; padding: 10px 16px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; width: 100%; transition: all 0.2s;
        }
        .footer { text-align: center; color: #4a4035; font-size: 11px; margin-top: 24px; letter-spacing: 0.3px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </>
  );
}
