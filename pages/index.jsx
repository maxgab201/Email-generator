import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const VOCAB_COMPLEXITY = ["Simple", "Intermediate", "Complex"];

export default function Home() {
  // --- ESTADOS ---
  const [currentView, setCurrentView] = useState("generator"); // 'generator' o 'history'
  const [history, setHistory] = useState([]);
  
  const [form, setForm] = useState({
    consigna: "", idioma: "English", longitudType: "range", longitudMin: "100", longitudMax: "250", longitudSpecific: "", nivel: "B1", vocabulario: "Intermediate", vocabularioExtra: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  // --- CARGAR HISTORIAL (Al iniciar) ---
  useEffect(() => {
    const savedHistory = localStorage.getItem("mailcraft_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // --- LÓGICA DEL FORMULARIO ---
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
      
      const newEmail = data.result;
      setResult(newEmail);
      
      // Guardar en Historial
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        topic: form.consigna,
        level: form.nivel,
        vocab: form.vocabulario,
        content: newEmail
      };
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("mailcraft_history", JSON.stringify(updatedHistory));

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DEL HISTORIAL ---
  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("mailcraft_history", JSON.stringify(updatedHistory));
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex antialiased selection:bg-primary-container selection:text-on-primary-container dark h-screen w-full overflow-hidden">
      <Head>
        <title>MailCraft - AI Editorial Suite</title>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
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
                fontFamily: { headline: ["Newsreader", "serif"], body: ["Manrope", "sans-serif"] }
              }
            }
          }
        `}} />
        <style>{`
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
          .icon-fill { font-variation-settings: 'FILL' 1, 'wght' 400; }
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: #131313; }
          ::-webkit-scrollbar-thumb { background: #353534; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #4d4635; }
        `}</style>
      </Head>

      {/* --- SIDEBAR --- */}
      <aside className="hidden md:flex flex-col h-full py-8 border-r border-[#353534]/20 bg-[#0e0e0e] w-64 flex-shrink-0 z-20 relative">
        <div className="px-8 mb-12">
          <h1 className="text-xl font-headline text-[#f4c969] tracking-tight italic">MailCraft</h1>
          <p className="text-[#e5e2e1]/50 mt-1 font-body text-xs tracking-wide uppercase">AI Editorial Suite</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1 mt-4">
          <button onClick={() => setCurrentView('generator')} className={`flex items-center gap-4 px-8 py-3.5 font-body text-sm font-medium transition-all duration-300 w-full text-left ${currentView === 'generator' ? 'text-[#f4c969] border-r-2 border-[#f4c969] bg-gradient-to-r from-[#f4c969]/10 to-transparent translate-x-1' : 'text-[#e5e2e1]/50 hover:bg-[#201f1f] hover:text-[#e5e2e1] group'}`}>
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'generator' ? 'icon-fill' : 'group-hover:text-[#f4c969] transition-colors'}`}>auto_awesome</span>
            Generator
          </button>
          
          <button onClick={() => setCurrentView('history')} className={`flex items-center gap-4 px-8 py-3.5 font-body text-sm font-medium transition-all duration-300 w-full text-left ${currentView === 'history' ? 'text-[#f4c969] border-r-2 border-[#f4c969] bg-gradient-to-r from-[#f4c969]/10 to-transparent translate-x-1' : 'text-[#e5e2e1]/50 hover:bg-[#201f1f] hover:text-[#e5e2e1] group'}`}>
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'history' ? 'icon-fill' : 'group-hover:text-[#f4c969] transition-colors'}`}>history</span>
            History
          </button>
        </nav>
        <div className="px-6 mt-auto">
          <button onClick={() => setCurrentView('generator')} className="w-full py-3.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-[0_4px_20px_rgba(244,201,105,0.15)] hover:shadow-[0_4px_25px_rgba(244,201,105,0.25)] hover:brightness-110 transition-all flex justify-center items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">edit</span> New Draft
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full overflow-y-auto relative z-10 bg-background pt-8 pb-20 md:pt-0">
        <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none mix-blend-screen"></div>
        
        {/* VISTA 1: GENERATOR */}
        {currentView === 'generator' && (
          <div className="px-4 py-8 md:px-8 max-w-4xl mx-auto w-full relative z-10 md:pt-16">
            <header className="text-center mb-10 flex flex-col items-center">
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface italic mb-2 tracking-tight">MailCraft</h2>
              <p className="text-on-surface-variant text-sm md:text-base font-medium mb-4">AI-powered email generator</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant/30">
                <span className="material-symbols-outlined text-[14px] text-primary icon-fill">star</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Mistral Large</span>
              </div>
            </header>

            <div className="bg-surface-container rounded-xl p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
              <form className="space-y-8" onSubmit={handleGenerate}>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">TOPIC / ASSIGNMENT</label>
                  <textarea value={form.consigna} onChange={(e) => handleChange("consigna", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-highest transition-all resize-none shadow-inner outline-none" placeholder="e.g. Write an email to the marketing team requesting an update..." rows="4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">LANGUAGE</label>
                    <div className="relative">
                      <select value={form.idioma} onChange={(e) => handleChange("idioma", e.target.value)} className="w-full appearance-none bg-surface-container-low border-0 rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-highest transition-all shadow-inner pr-10 outline-none">
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                      </div>
                    </div>
                  </div>

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

                {/* EL NIVEL DE VOCABULARIO (Conectado y funcional) */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">VOCABULARY COMPLEXITY</label>
                  <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-1 rounded-lg">
                    {VOCAB_COMPLEXITY.map((v) => (
                      <button key={v} type="button" onClick={() => handleChange("vocabulario", v)} className={`py-3 px-2 rounded-md text-sm transition-colors ${form.vocabulario === v ? "font-bold bg-surface-container-highest text-primary shadow-sm border border-outline-variant/20" : "font-medium text-on-surface-variant hover:text-on-surface"}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">REQUIRED VOCABULARY <span className="text-outline lowercase font-normal italic">(optional)</span></label>
                  </div>
                  <input type="text" value={form.vocabularioExtra} onChange={(e) => handleChange("vocabularioExtra", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg p-4 text-on-surface focus:ring-1 focus:ring-primary/40 transition-all shadow-inner outline-none" placeholder="synergy, pivot, robust..." />
                </div>

                {error && <div className="text-[#ffb4ab] text-sm bg-[#93000a]/20 p-3 rounded-lg border border-[#93000a]/50">{error}</div>}

                <div className="pt-6">
                  <button type="submit" disabled={loading} className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg py-5 rounded-xl shadow-[0_10px_20px_rgba(244,201,105,0.15)] hover:shadow-[0_10px_25px_rgba(244,201,105,0.25)] hover:brightness-110 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <span className="material-symbols-outlined text-[24px]">{loading ? 'hourglass_empty' : 'mail'}</span>
                    {loading ? 'Crafting Email...' : 'Generate Email'}
                  </button>
                </div>
              </form>
            </div>

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
          </div>
        )}

        {/* VISTA 2: HISTORY */}
        {currentView === 'history' && (
          <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 lg:py-16 relative z-10">
            <header className="mb-14">
              <h2 className="text-5xl font-headline text-on-surface tracking-tight mb-3">Email History</h2>
              <p className="text-on-surface-variant text-lg font-body max-w-2xl leading-relaxed">Your archive of crafted correspondence. Review, replicate, or refine past communications.</p>
            </header>

            {history.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">inbox</span>
                <h3 className="text-xl font-headline text-on-surface mb-2">No history yet</h3>
                <p className="text-on-surface-variant text-sm">Emails you generate will automatically be saved here.</p>
                <button onClick={() => setCurrentView('generator')} className="mt-6 px-6 py-2 bg-primary-container text-on-primary-fixed rounded-lg text-sm font-bold shadow-sm hover:brightness-110">Go Generate One</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {history.map((item) => (
                  <article key={item.id} className="bg-surface-container rounded-xl p-7 flex flex-col gap-5 group hover:-translate-y-1 transition-all duration-400 border border-transparent hover:border-primary/20 hover:shadow-[0_10px_40px_-10px_rgba(244,201,105,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] text-on-surface-variant/60 font-body uppercase tracking-widest font-semibold">{item.date}</span>
                      <div className="flex gap-2">
                        <span className="bg-surface-container-highest text-primary/90 text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-primary/10">{item.level}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-headline text-2xl text-on-surface leading-snug mb-3 group-hover:text-primary transition-colors duration-300">{item.topic || "Untitled Draft"}</h3>
                      <p className="text-sm text-on-surface-variant/80 line-clamp-3 leading-relaxed font-body">
                        {item.content}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-5 flex justify-between items-center border-t border-surface-container-highest group-hover:border-outline-variant/20 transition-colors">
                      <div className="flex gap-2">
                        <span className="text-on-surface-variant/50 text-[11px] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">psychology</span> {item.vocab}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => navigator.clipboard.writeText(item.content)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded-lg transition-colors" title="Copy to clipboard">
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button onClick={() => deleteHistoryItem(item.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-lg transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
