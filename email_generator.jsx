import { useState, useRef } from "react";

const GEMINI_API_KEY = "AQ.Ab8RN6KZML-DDsOYzHqyOlXp22x3Rtesz8iLyndpgMCDeE4nxQ";
const GEMINI_MODEL = "gemini-3.1-pro-preview";

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian",
  "Portuguese", "Chinese", "Japanese", "Korean", "Arabic",
  "Russian", "Dutch", "Swedish", "Polish", "Turkish"
];

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const VOCAB_COMPLEXITY = ["Simple", "Intermediate", "Complex"];

export default function EmailGenerator() {
  const [form, setForm] = useState({
    consigna: "",
    idioma: "English",
    longitudType: "range", // "range" or "specific"
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
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const buildPrompt = () => {
    let lengthInstruction = "";
    if (form.longitudType === "range") {
      if (form.longitudMin && form.longitudMax) {
        lengthInstruction = `between ${form.longitudMin} and ${form.longitudMax} words`;
      } else if (form.longitudMin) {
        lengthInstruction = `at least ${form.longitudMin} words`;
      } else if (form.longitudMax) {
        lengthInstruction = `at most ${form.longitudMax} words`;
      } else {
        lengthInstruction = "medium length (around 150–200 words)";
      }
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
      const prompt = buildPrompt();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
        throw new Error(errData?.error?.message || "API request failed.");
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No response received from Gemini.");
      setResult(text);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.root}>
      {/* Background decoration */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logoMark}>✉</div>
          <h1 style={styles.title}>MailCraft</h1>
          <p style={styles.subtitle}>AI-powered email generator</p>
          <div style={styles.modelBadge}>
            <span style={styles.modelDot} />
            Gemini 3.1 Pro Preview
          </div>
        </header>

        {/* Form Card */}
        <div style={styles.card}>

          {/* Consigna */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📝</span>
              Topic / Assignment
              <span style={styles.required}>*</span>
            </label>
            <textarea
              value={form.consigna}
              onChange={e => handleChange("consigna", e.target.value)}
              placeholder="e.g. Write an email to your professor apologizing for missing class..."
              style={styles.textarea}
              rows={3}
            />
          </div>

          {/* Language */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🌍</span>
              Language
            </label>
            <select
              value={form.idioma}
              onChange={e => handleChange("idioma", e.target.value)}
              style={styles.select}
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Length */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📏</span>
              Length (words)
            </label>
            <div style={styles.toggleRow}>
              <button
                onClick={() => handleChange("longitudType", "range")}
                style={{
                  ...styles.toggleBtn,
                  ...(form.longitudType === "range" ? styles.toggleBtnActive : {})
                }}
              >
                Range
              </button>
              <button
                onClick={() => handleChange("longitudType", "specific")}
                style={{
                  ...styles.toggleBtn,
                  ...(form.longitudType === "specific" ? styles.toggleBtnActive : {})
                }}
              >
                Specific
              </button>
            </div>
            {form.longitudType === "range" ? (
              <div style={styles.rangeRow}>
                <input
                  type="number"
                  value={form.longitudMin}
                  onChange={e => handleChange("longitudMin", e.target.value)}
                  placeholder="Min"
                  style={styles.inputHalf}
                  min="10"
                />
                <span style={styles.rangeSep}>—</span>
                <input
                  type="number"
                  value={form.longitudMax}
                  onChange={e => handleChange("longitudMax", e.target.value)}
                  placeholder="Max"
                  style={styles.inputHalf}
                  min="10"
                />
              </div>
            ) : (
              <input
                type="number"
                value={form.longitudSpecific}
                onChange={e => handleChange("longitudSpecific", e.target.value)}
                placeholder="e.g. 150"
                style={styles.input}
                min="10"
              />
            )}
          </div>

          {/* Level */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🎓</span>
              Language Level (CEFR)
            </label>
            <div style={styles.chipRow}>
              {LEVELS.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => handleChange("nivel", lvl)}
                  style={{
                    ...styles.chip,
                    ...(form.nivel === lvl ? styles.chipActive : {})
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Vocabulary Complexity */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔤</span>
              Vocabulary Complexity
            </label>
            <div style={styles.chipRow}>
              {VOCAB_COMPLEXITY.map(v => (
                <button
                  key={v}
                  onClick={() => handleChange("vocabulario", v)}
                  style={{
                    ...styles.chip,
                    ...(form.vocabulario === v ? styles.chipActive : {})
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Vocabulary */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>✨</span>
              Required Vocabulary
              <span style={styles.optionalTag}>optional</span>
            </label>
            <input
              type="text"
              value={form.vocabularioExtra}
              onChange={e => handleChange("vocabularioExtra", e.target.value)}
              placeholder="e.g. apologize, circumstances, sincere..."
              style={styles.input}
            />
            <span style={styles.hint}>Separate words with commas</span>
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              ...styles.generateBtn,
              ...(loading ? styles.generateBtnDisabled : {})
            }}
          >
            {loading ? (
              <span style={styles.loadingInner}>
                <span style={styles.spinner} />
                Generating...
              </span>
            ) : (
              "Generate Email ✉"
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div ref={resultRef} style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <div>
                <h2 style={styles.resultTitle}>Generated Email</h2>
                <p style={styles.resultMeta}>
                  {form.nivel} · {form.vocabulario} · {form.idioma}
                </p>
              </div>
              <button onClick={handleCopy} style={styles.copyBtn}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <div style={styles.resultDivider} />
            <pre style={styles.resultText}>{result}</pre>
            <button onClick={handleReset} style={styles.resetBtn}>
              ← Generate Another
            </button>
          </div>
        )}

        <p style={styles.footer}>Powered by Google Gemini 3.1 Pro Preview</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        textarea:focus, input:focus, select:focus {
          outline: none;
          border-color: #c9a84c !important;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.15) !important;
        }

        textarea::placeholder, input::placeholder {
          color: #8a8070;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        select option { background: #1e1a14; color: #e8dfc8; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9a84c55; border-radius: 4px; }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0f0d09",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgOrb1: {
    position: "fixed",
    top: "-20%",
    right: "-20%",
    width: "60vw",
    height: "60vw",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  bgOrb2: {
    position: "fixed",
    bottom: "-30%",
    left: "-15%",
    width: "70vw",
    height: "70vw",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(120,90,40,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "480px",
    margin: "0 auto",
    padding: "24px 16px 48px",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
    paddingTop: "8px",
  },
  logoMark: {
    fontSize: "32px",
    marginBottom: "8px",
    display: "block",
    filter: "drop-shadow(0 0 12px rgba(201,168,76,0.4))",
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: "34px",
    fontWeight: 700,
    color: "#e8dfc8",
    letterSpacing: "-0.5px",
    marginBottom: "4px",
  },
  subtitle: {
    color: "#8a8070",
    fontSize: "13px",
    letterSpacing: "0.5px",
    marginBottom: "12px",
  },
  modelBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(201,168,76,0.1)",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "11px",
    color: "#c9a84c",
    fontWeight: 500,
    letterSpacing: "0.3px",
  },
  modelDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#c9a84c",
    animation: "pulse 2s ease-in-out infinite",
    flexShrink: 0,
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px",
    padding: "24px",
    backdropFilter: "blur(10px)",
    animation: "fadeSlideUp 0.4s ease",
  },
  fieldGroup: {
    marginBottom: "22px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#c5b99a",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.3px",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  labelIcon: {
    fontSize: "14px",
  },
  required: {
    color: "#c9a84c",
    marginLeft: "2px",
  },
  optionalTag: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "4px",
    padding: "1px 6px",
    fontSize: "10px",
    color: "#8a8070",
    fontWeight: 400,
    textTransform: "none",
    letterSpacing: 0,
    marginLeft: "4px",
  },
  textarea: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "14px",
    color: "#e8dfc8",
    fontSize: "14px",
    lineHeight: 1.6,
    resize: "vertical",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px 14px",
    color: "#e8dfc8",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  select: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px 14px",
    color: "#e8dfc8",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a84c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  toggleRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
  },
  toggleBtn: {
    flex: 1,
    padding: "8px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#8a8070",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  toggleBtnActive: {
    background: "rgba(201,168,76,0.15)",
    border: "1px solid rgba(201,168,76,0.35)",
    color: "#c9a84c",
    fontWeight: 500,
  },
  rangeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  inputHalf: {
    flex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px 14px",
    color: "#e8dfc8",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
  },
  rangeSep: {
    color: "#8a8070",
    fontSize: "18px",
    flexShrink: 0,
  },
  chipRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  chip: {
    padding: "7px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    color: "#9a9080",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  chipActive: {
    background: "rgba(201,168,76,0.18)",
    border: "1px solid rgba(201,168,76,0.4)",
    color: "#e8c84c",
  },
  hint: {
    color: "#6a6055",
    fontSize: "11px",
    marginTop: "5px",
    display: "block",
  },
  errorBox: {
    background: "rgba(255,80,80,0.1)",
    border: "1px solid rgba(255,80,80,0.2)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#ff9090",
    fontSize: "13px",
    marginBottom: "16px",
  },
  generateBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #c9a84c 0%, #a07830 100%)",
    border: "none",
    borderRadius: "14px",
    color: "#0f0d09",
    fontSize: "16px",
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.3px",
    transition: "opacity 0.2s, transform 0.1s",
    boxShadow: "0 4px 20px rgba(201,168,76,0.25)",
  },
  generateBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  loadingInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(0,0,0,0.2)",
    borderTop: "2px solid #0f0d09",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
    display: "inline-block",
  },
  resultCard: {
    marginTop: "20px",
    background: "rgba(201,168,76,0.04)",
    border: "1px solid rgba(201,168,76,0.18)",
    borderRadius: "20px",
    padding: "24px",
    animation: "fadeSlideUp 0.4s ease",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  resultTitle: {
    fontFamily: "'Fraunces', serif",
    color: "#e8dfc8",
    fontSize: "20px",
    fontWeight: 500,
    marginBottom: "2px",
  },
  resultMeta: {
    color: "#8a8070",
    fontSize: "12px",
  },
  copyBtn: {
    background: "rgba(201,168,76,0.12)",
    border: "1px solid rgba(201,168,76,0.25)",
    borderRadius: "8px",
    color: "#c9a84c",
    padding: "6px 14px",
    fontSize: "12px",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    fontWeight: 600,
    flexShrink: 0,
    transition: "all 0.2s",
  },
  resultDivider: {
    height: "1px",
    background: "rgba(201,168,76,0.12)",
    marginBottom: "16px",
  },
  resultText: {
    color: "#d4c9a8",
    fontSize: "14px",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    fontFamily: "'DM Sans', sans-serif",
    wordBreak: "break-word",
  },
  resetBtn: {
    marginTop: "20px",
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#8a8070",
    padding: "10px 16px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s",
  },
  footer: {
    textAlign: "center",
    color: "#4a4035",
    fontSize: "11px",
    marginTop: "24px",
    letterSpacing: "0.3px",
  },
};
