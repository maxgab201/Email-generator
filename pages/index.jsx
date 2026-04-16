import { useState, useRef } from "react";
import Head from "next/head";

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const VOCAB_COMPLEXITY = ["Simple", "Intermediate", "Complex"];

export default function Home() {
  const [form, setForm] = useState({
    consigna: "", idioma: "English", longitudType: "range", longitudMin: "100", longitudMax: "250", longitudSpecific: "", nivel: "B1", vocabulario: "Intermediate", vocabularioExtra: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const buildPrompt = () => {
    let lengthInstruction = form.longitudType === "range" 
      ? `between ${form.longitudMin} and ${form.longitudMax} words` 
      : `exactly ${form.longitudSpecific} words`;
    const vocabExtra = form.vocabularioExtra.trim() ? `\n- Include these words: ${form.vocabularioExtra}.` : "";
    return `Write a professional email in ${form.idioma}:\n- Topic: ${form.consigna}\n- Level: ${form.nivel} (CEFR)\n- Length: ${lengthInstruction}\n- Vocab: ${form.vocabulario} complexity${vocabExtra}\nOnly output the email itself.`;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.consigna.trim()) return setError("Please enter a topic.");
    setLoading(true); setResult(null); setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col md:flex-row antialiased selection:bg-primary-container selection:text-on-primary-container dark">
      <Head>
        <title>MailCraft - AI Editorial Suite</title>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
        
        {/* MAGIA: Tailwind por CDN directo, sin instalar nada */}
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "on-secondary": "#353026", "surface-container-high": "#2a2a2a", "primary-fixed-dim": "#ebc162",
                  "on-tertiary-container": "#4c4600", "error": "#ffb4ab", "surface-dim": "#131313",
                  "inverse-primary": "#785a00", "on-primary": "#3f2e00", "surface-container": "#201f1f",
                  "surface-variant": "#353534", "tertiary": "#dad179", "surface-container-lowest": "#0e0e0e",
                  "error-container": "#93000a", "inverse-on-surface": "#313030", "surface-container-low": "#1c1b1b",
                  "background": "#131313", "primary": "#f4c969", "surface": "#131313",
                  "surface-container-highest": "#353534", "on-surface": "#e5e2e1", "primary-container": "#d6ad50",
                  "outline": "#99907c", "on-surface-variant": "#d0c5af", "outline-variant": "#4d4635"
                },
                fontFamily: {
                  headline: ["Newsreader", "serif"], body: ["Manrope", "sans-serif"],
                }
              }
            }
          }
        `}} />
      </Head>

      {/* SideNav (Web) */}
      <nav className="hidden md:flex flex-col h-screen py-8 border-r border-outline-variant/20 bg-[#0e0e0e] w-64 fixed left-0 top-0">
        <div className="px-6 mb-12">
          <h1 className="text-xl font-headline text-[#f4c969] italic">MailCraft</h1>
          <p className="text-xs text-on-surface-variant mt-1">AI Editorial Suite</p>
        </div>
        <div className="px-4 mb-8">
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#f4c969] to-[#d6ad50] text-[#3f2e00] py-3 rounded-lg font-medium hover:brightness-110 transition-all">
            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>add</span> New Draft
          </button>
        </div>
        <ul className="flex flex-col gap-2 px-2 flex-grow">
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-md text-[#f4c969] border-r-2 border-[#f4c969] bg-gradient-to-r from-[#f4c969]/10 to-transparent font-medium text-sm" href="#">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span> Generator
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-12 md:pt-16 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <header className="text-center mb-10 flex flex-col items-center">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface italic mb-2 tracking-tight">MailCraft</h2>
          <p className="text-on-surface-variant text-sm md:text-base font-medium mb-4">AI-powered email generator</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant/30">
            <span className="material-symbols-outlined text-[14px] text-primary">star</span>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Gemini 3.1 Pro Preview</span>
          </div>
        </header>

        <div className="bg-surface-container rounded-xl p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          <form className="space-y-8" onSubmit={handleGenerate}>
            
            {/* Consigna */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">TOPIC / ASSIGNMENT</label>
              <textarea 
                value={form.consigna} onChange={(e) => handleChange("consigna", e.target.value)}
                className="w-full bg-surface-container-low border-0 rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-highest transition-all resize-none shadow-inner outline-none" 
                placeholder="e.g. Write an email to the marketing team requesting an update..." rows="4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Idioma */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">LANGUAGE</label>
                <div className="relative">
                  <select 
                    value={form.idioma} onChange={(e) => handleChange("idioma", e.target.value)}
                    className="w-full appearance-none bg-surface-container-low border-0 rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-highest transition-all shadow-inner pr-10 outline-none">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Longitud */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">LENGTH (WORDS)</label>
                  <div className="flex bg-surface-container-highest rounded p-0.5">
                    <button type="button" onClick={() => handleChange("longitudType", "range")} className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${form.longitudType === "range" ? "bg-primary-container text-on-primary-fixed shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>Range</button>
                    <button type="button" onClick={() => handleChange("longitudType", "specific")} className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${form.longitudType === "specific" ? "bg-primary-container text-on-primary-fixed shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>Specific</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {form.longitudType === "range" ? (
                    <>
                      <input type="number" value={form.longitudMin} onChange={(e) => handleChange("longitudMin", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg p-4 text-on-surface text-center shadow-inner outline-none focus:ring-1 focus:ring-primary/40" placeholder="Min" />
                      <span className="text-outline-variant font-bold">—</span>
                      <input type="number" value={form.longitudMax} onChange={(e) => handleChange("longitudMax", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg p-4 text-on-surface text-center shadow-inner outline-none focus:ring-1 focus:ring-primary/40" placeholder="Max" />
                    </>
                  ) : (
                    <input type="number" value={form.longitudSpecific} onChange={(e) => handleChange("longitudSpecific", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg p-4 text-on-surface text-center shadow-inner outline-none focus:ring-1 focus:ring-primary/40" placeholder="e.g. 150" />
                  )}
                </div>
              </div>
            </div>

            {/* Nivel CEFR */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">LANGUAGE LEVEL (CEFR)</label>
              <div className="flex flex-wrap gap-3">
                {LEVELS.map(lvl => (
                  <button key={lvl} type="button" onClick={() => handleChange("nivel", lvl)} className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-colors shadow-sm ${form.nivel === lvl ? "bg-primary-container text-on-primary-fixed font-bold shadow-[0_0_15px_rgba(244,201,105,0.3)] ring-2 ring-primary/20" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-outline-variant/20"}`}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Vocabulario Opcional */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">REQUIRED VOCABULARY <span className="text-outline lowercase font-normal italic">(optional)</span></label>
              </div>
              <input type="text" value={form.vocabularioExtra} onChange={(e) => handleChange("vocabularioExtra", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary/40 transition-all shadow-inner outline-none" placeholder="synergy, pivot, robust..." />
            </div>

            {error && <div className="text-[#ffb4ab] text-sm bg-[#93000a]/20 p-3 rounded-lg border border-[#93000a]/50">{error}</div>}

            <div className="pt-6">
              <button type="submit" disabled={loading} className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg py-5 rounded-xl shadow-[0_10px_20px_rgba(244,201,105,0.15)] hover:shadow-[0_10px_25px_rgba(244,201,105,0.25)] hover:brightness-105 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                <span className="material-symbols-outlined text-[24px]">{loading ? 'hourglass_empty' : 'mail'}</span>
                {loading ? 'Crafting Email...' : 'Generate Email'}
              </button>
            </div>
          </form>
        </div>

        {/* Caja de Resultado */}
        {result && (
          <div ref={resultRef} className="mt-8 bg-surface-container rounded-xl p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-primary/20">
             <h3 className="font-headline text-2xl text-primary mb-4">Generated Result</h3>
             <div className="bg-surface-container-low p-5 rounded-lg border border-outline-variant/20">
               <pre className="text-on-surface font-body whitespace-pre-wrap text-sm leading-relaxed">{result}</pre>
             </div>
             <button onClick={() => navigator.clipboard.writeText(result)} className="mt-4 px-4 py-2 bg-surface-container-highest text-primary rounded-lg text-sm font-bold hover:bg-surface-bright transition-colors border border-outline-variant/30 flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px]">content_copy</span> Copy to clipboard
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
