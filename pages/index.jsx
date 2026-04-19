import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const VOCAB_COMPLEXITY = ["Simple", "Intermediate", "Complex"];

// DICCIONARIO PARA LA INTERFAZ EXPANDIDO
const UI = {
  EN: {
    appDesc: "AI-powered email generator",
    genTab: "Generator",
    histTab: "History",
    newDraft: "New Draft",
    topic: "TOPIC / ASSIGNMENT",
    topicPl: "e.g. Write an email to the marketing team...",
    sender: "SENDER NAME",
    senderPl: "e.g. Max...",
    recipient: "RECIPIENT NAME",
    recipientPl: "e.g. John Doe...",
    lang: "EMAIL LANGUAGE",
    length: "LENGTH (WORDS)",
    range: "Range",
    specific: "Specific",
    level: "LANGUAGE LEVEL (CEFR)",
    vocab: "VOCABULARY COMPLEXITY",
    reqVocab: "REQUIRED VOCABULARY",
    opt: "(optional)",
    vocabPl: "synergy, pivot, robust...",
    btnGen: "Generate Email",
    btnGenIng: "Crafting Email...",
    resTitle: "Generated Result",
    btnCopy: "Copy",
    btnHum: "Humanize Text",
    btnHumIng: "Humanizing...",
    histTitle: "Email History",
    histSub: "Your archive of crafted correspondence. Review, replicate, or refine past communications.",
    noHist: "No history yet",
    noHistSub: "Emails you generate will automatically be saved here.",
    goGen: "Go Generate One",
    settings: "Settings",
    theme: "Theme",
    appLang: "App Language"
  },
  ES: {
    appDesc: "Generador de correos con IA",
    genTab: "Generador",
    histTab: "Historial",
    newDraft: "Nuevo Borrador",
    topic: "TEMA / CONSIGNA",
    topicPl: "ej. Escribir un correo al equipo de marketing...",
    sender: "NOMBRE DEL REMITENTE",
    senderPl: "ej. Max...",
    recipient: "NOMBRE DEL DESTINATARIO",
    recipientPl: "ej. Juan Pérez...",
    lang: "IDIOMA DEL CORREO",
    length: "LONGITUD (PALABRAS)",
    range: "Rango",
    specific: "Exacto",
    level: "NIVEL DE IDIOMA (CEFR)",
    vocab: "COMPLEJIDAD DEL VOCABULARIO",
    reqVocab: "VOCABULARIO REQUERIDO",
    opt: "(opcional)",
    vocabPl: "sinergia, pivote, robusto...",
    btnGen: "Generar Email",
    btnGenIng: "Creando Email...",
    resTitle: "Resultado Generado",
    btnCopy: "Copiar",
    btnHum: "Humanizar Texto",
    btnHumIng: "Humanizando...",
    histTitle: "Historial de Emails",
    histSub: "Tu archivo de correos. Revisa, copia o refina tus comunicaciones pasadas.",
    noHist: "No hay historial aún",
    noHistSub: "Los emails que generes se guardarán automáticamente aquí.",
    goGen: "Ir a Generar Uno",
    settings: "Ajustes",
    theme: "Tema",
    appLang: "Idioma de la App"
  }
};

export default function Home() {
  const [currentView, setCurrentView] = useState("generator");
  const [history, setHistory] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // NUEVOS ESTADOS DE CONFIGURACIÓN
  const [theme, setTheme] = useState("dark");
  const [uiLang, setUiLang] = useState("EN");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [form, setForm] = useState({
    consigna: "", 
    idioma: "English", 
    longitudType: "range", 
    longitudMin: "120", 
    longitudMax: "140", 
    longitudSpecific: "", 
    nivel: "B1", 
    vocabulario: "Intermediate", 
    vocabularioExtra: "", 
    nombreRemitente: "", 
    nombreDestinatario: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const resultRef = useRef(null);

  const t = UI[uiLang]; // Traducciones dinámicas

  useEffect(() => {
    const savedHistory = localStorage.getItem("mailcraft_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const buildPrompt = () => {
    let lengthInstruction = form.longitudType === "range" 
      ? `between ${form.longitudMin} and ${form.longitudMax} words` 
      : `exactly ${form.longitudSpecific} words`;
      
    const vocabExtra = form.vocabularioExtra.trim() ? `\n- Include these words: ${form.vocabularioExtra}.` : "";
    const senderInfo = form.nombreRemitente.trim() ? `\n- Sender Name: ${form.nombreRemitente}` : "";
    const recipientInfo = form.nombreDestinatario.trim() ? `\n- Recipient Name: ${form.nombreDestinatario}` : "";

    return `Write a professional email in ${form.idioma}:\n- Topic: ${form.consigna}\n- Level: ${form.nivel} (CEFR)\n- Length: ${lengthInstruction}\n- Vocab: ${form.vocabulario} complexity${vocabExtra}${senderInfo}${recipientInfo}\nOnly output the email itself.`;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.consigna.trim()) return setError("Please enter a topic.");
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
      if (!res.ok) throw new Error(data.error);
      
      const newEmail = data.result;
      setResult(newEmail);
      
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

  const handleHumanize = async () => {
    if (!result) return;
    setIsHumanizing(true);
    setError(null);
    try {
      const res = await fetch("/api/humanize", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      setError(err.message || "Error al humanizar.");
    } finally {
      setIsHumanizing(false);
    }
  };

  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("mailcraft_history", JSON.stringify(updatedHistory));
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  // MINI-COMPONENTE: Menú de Ajustes
  const SettingsMenu = () => (
    <div className="relative">
      <button 
        onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
        className="p-2 rounded-full bg-surface-container shadow-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary active:scale-90 transition-all duration-200 flex items-center justify-center z-50"
      >
        <span className="material-symbols-outlined text-[24px]">settings</span>
      </button>
      
      {isSettingsOpen && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-surface-container-high/95 backdrop-blur-xl rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-outline-variant/30 p-4 flex flex-col gap-4 z-[100]">
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">{t.theme}</label>
            <div className="flex bg-surface-container-lowest rounded-lg p-1 border border-outline-variant/10">
              <button 
                onClick={() => setTheme('light')} 
                className={`flex-1 py-1.5 text-sm rounded-md transition-all active:scale-95 flex justify-center items-center ${theme === 'light' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`flex-1 py-1.5 text-sm rounded-md transition-all active:scale-95 flex justify-center items-center ${theme === 'dark' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">{t.appLang}</label>
            <div className="flex bg-surface-container-lowest rounded-lg p-1 border border-outline-variant/10">
              <button 
                onClick={() => setUiLang('EN')} 
                className={`flex-1 py-1 text-xs tracking-wider rounded-md transition-all active:scale-95 ${uiLang === 'EN' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setUiLang('ES')} 
                className={`flex-1 py-1 text-xs tracking-wider rounded-md transition-all active:scale-95 ${uiLang === 'ES' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
              >
                ES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const levelIndex = LEVELS.indexOf(form.nivel);
  const vocabIndex = VOCAB_COMPLEXITY.indexOf(form.vocabulario);

  return (
    <div className={`font-body min-h-screen flex antialiased h-screen w-full overflow-hidden ${theme === 'dark' ? 'dark' : ''} bg-background text-on-surface`}>
      <Head>
        <title>MailCraft - AI Editorial Suite</title>
        <link rel="manifest" href="/manifest.json" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "background": "var(--bg-color)",
                  "surface": "var(--surface-color)",
                  "surface-container": "var(--surface-container)",
                  "surface-container-low": "var(--surface-container-low)",
                  "surface-container-high": "var(--surface-container-high)",
                  "surface-container-highest": "var(--surface-container-highest)",
                  "surface-container-lowest": "var(--surface-container-lowest)",
                  "on-surface": "var(--text-main)",
                  "on-surface-variant": "var(--text-muted)",
                  "primary": "#f4c969",
                  "primary-container": "#d6ad50",
                  "on-primary": "#3f2e00",
                  "error": "#ffb4ab",
                  "error-container": "#93000a",
                  "outline-variant": "var(--outline-var)",
                },
                fontFamily: { headline: ["Newsreader", "serif"], body: ["Manrope", "sans-serif"] }
              }
            }
          }
        `}} />
        <style>{`
          :root {
            --bg-color: #f4f4f5;
            --surface-color: #ffffff;
            --surface-container: #ffffff;
            --surface-container-low: #fafafa;
            --surface-container-high: #f0f0f0;
            --surface-container-highest: #e4e4e7;
            --surface-container-lowest: #f4f4f5;
            --text-main: #18181b;
            --text-muted: #52525b;
            --outline-var: #d4d4d8;
          }
          .dark {
            --bg-color: #131313;
            --surface-color: #131313;
            --surface-container: #201f1f;
            --surface-container-low: #1c1b1b;
            --surface-container-high: #2a2a2a;
            --surface-container-highest: #353534;
            --surface-container-lowest: #0e0e0e;
            --text-main: #e5e2e1;
            --text-muted: #d0c5af;
            --outline-var: #4d4635;
          }
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
          .icon-fill { font-variation-settings: 'FILL' 1, 'wght' 400; }
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: var(--bg-color); }
          ::-webkit-scrollbar-thumb { background: var(--surface-container-highest); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: var(--outline-var); }
        `}</style>
      </Head>

      {/* MOBILE TOP BAR - SÓLIDA */}
      <nav className="md:hidden fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-surface-container-lowest border-b border-outline-variant/20 shadow-md">
        <div className="text-xl font-headline italic text-primary">MailCraft</div>
        <div className="flex gap-3 items-center">
          <SettingsMenu />
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="text-primary active:scale-90 transition-all p-1 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </button>
        </div>
      </nav>

      {/* OVERLAY OSCURO PARA EL MENÚ MOBILE */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMobileMenuOpen(false)} 
      />

      {/* ASIDE - CON FONDO SÓLIDO Y BLUR */}
      <aside className={`fixed md:relative top-0 left-0 h-full py-8 border-r border-outline-variant/20 bg-surface-container-lowest/98 backdrop-blur-xl w-64 flex-shrink-0 z-50 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <button 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="md:hidden absolute top-5 right-5 text-on-surface-variant hover:text-primary active:scale-90 transition-all"
        >
           <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <div className="px-8 mb-12 mt-2 md:mt-0">
          <h1 className="text-xl font-headline text-primary tracking-tight italic">MailCraft</h1>
          <p className="text-on-surface-variant mt-1 font-body text-xs tracking-wide uppercase">{t.appDesc}</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1 mt-4">
          <button 
            onClick={() => {setCurrentView('generator'); setIsMobileMenuOpen(false);}} 
            className={`flex items-center gap-4 px-8 py-3.5 font-body text-sm font-medium transition-all duration-300 active:scale-95 w-full text-left ${currentView === 'generator' ? 'text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent translate-x-1' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface group'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'generator' ? 'icon-fill' : 'group-hover:text-primary transition-colors'}`}>auto_awesome</span>
            {t.genTab}
          </button>
          
          <button 
            onClick={() => {setCurrentView('history'); setIsMobileMenuOpen(false);}} 
            className={`flex items-center gap-4 px-8 py-3.5 font-body text-sm font-medium transition-all duration-300 active:scale-95 w-full text-left ${currentView === 'history' ? 'text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent translate-x-1' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface group'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'history' ? 'icon-fill' : 'group-hover:text-primary transition-colors'}`}>history</span>
            {t.histTab}
          </button>
        </nav>

        <div className="px-6 mt-auto">
          <button 
            onClick={() => handleNavClick('generator')} 
            className="w-full py-3.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-[0_4px_20px_rgba(244,201,105,0.15)] hover:shadow-[0_4px_25px_rgba(244,201,105,0.25)] hover:brightness-110 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span> {t.newDraft}
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto relative z-10 bg-background pt-24 pb-20 md:pt-0">
        
        {/* SETTINGS MENU PARA DESKTOP */}
        <div className="hidden md:block absolute top-6 right-8 z-50">
          <SettingsMenu />
        </div>

        <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none mix-blend-screen"></div>
        
        {currentView === 'generator' && (
          <div className="px-4 py-8 md:px-8 max-w-4xl mx-auto w-full relative z-10 md:pt-16">
            <header className="text-center mb-10 flex flex-col items-center">
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface italic mb-2 tracking-tight">MailCraft</h2>
              <p className="text-on-surface-variant text-sm md:text-base font-medium mb-4">{t.appDesc}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant/30">
                <span className="material-symbols-outlined text-[14px] text-primary icon-fill">star</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Mistral Large</span>
              </div>
            </header>

            <div className="bg-surface-container rounded-2xl p-6 md:p-8 shadow-xl border border-outline-variant/10 backdrop-blur-sm">
              <form className="space-y-8" onSubmit={handleGenerate}>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.topic}</label>
                  <textarea 
                    value={form.consigna} 
                    onChange={(e) => handleChange("consigna", e.target.value)} 
                    className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all resize-none shadow-inner outline-none" 
                    placeholder={t.topicPl} 
                    rows="4" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.sender} <span className="text-outline-variant lowercase font-normal italic">{t.opt}</span></label>
                    <input 
                      type="text" 
                      value={form.nombreRemitente} 
                      onChange={(e) => handleChange("nombreRemitente", e.target.value)} 
                      className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all shadow-inner outline-none" 
                      placeholder={t.senderPl} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.recipient} <span className="text-outline-variant lowercase font-normal italic">{t.opt}</span></label>
                    <input 
                      type="text" 
                      value={form.nombreDestinatario} 
                      onChange={(e) => handleChange("nombreDestinatario", e.target.value)} 
                      className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all shadow-inner outline-none" 
                      placeholder={t.recipientPl} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.lang}</label>
                    <div className="relative">
                      <select 
                        value={form.idioma} 
                        onChange={(e) => handleChange("idioma", e.target.value)} 
                        className="w-full appearance-none bg-surface-container-low border-0 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-highest transition-all shadow-inner pr-10 outline-none"
                      >
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.length}</label>
                      <div className="bg-surface-container-highest rounded p-0.5">
                        <div className="relative flex w-full">
                          <div className="absolute top-0 bottom-0 w-1/2 bg-primary-container rounded shadow-sm transition-transform duration-300 ease-out z-0" style={{ transform: form.longitudType === "specific" ? "translateX(100%)" : "translateX(0)" }}></div>
                          <button type="button" onClick={() => handleChange("longitudType", "range")} className={`relative z-10 flex-1 px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors duration-300 ${form.longitudType === "range" ? "text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}>{t.range}</button>
                          <button type="button" onClick={() => handleChange("longitudType", "specific")} className={`relative z-10 flex-1 px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors duration-300 ${form.longitudType === "specific" ? "text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}>{t.specific}</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {form.longitudType === "range" ? (
                        <>
                          <input type="number" value={form.longitudMin} onChange={(e) => handleChange("longitudMin", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-on-surface text-center shadow-inner outline-none focus:ring-2 focus:ring-primary/40" placeholder="Min" />
                          <span className="text-outline-variant font-bold">—</span>
                          <input type="number" value={form.longitudMax} onChange={(e) => handleChange("longitudMax", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-on-surface text-center shadow-inner outline-none focus:ring-2 focus:ring-primary/40" placeholder="Max" />
                        </>
                      ) : (
                        <input type="number" value={form.longitudSpecific} onChange={(e) => handleChange("longitudSpecific", e.target.value)} className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-on-surface text-center shadow-inner outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. 150" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.level}</label>
                  <div className="relative flex justify-between items-center w-full bg-surface-container-low p-2 rounded-full h-14 border border-outline-variant/10">
                    <div 
                      className="absolute top-2 h-10 bg-primary rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(244,201,105,0.3)] z-0" 
                      style={{ width: 'calc(100% / 6 - 8px)', left: `calc(${levelIndex} * (100% / 6) + 4px)` }}
                    ></div>
                    {LEVELS.map(lvl => (
                      <button 
                        key={lvl} 
                        type="button" 
                        onClick={() => handleChange("nivel", lvl)} 
                        className={`relative z-10 flex-1 flex justify-center items-center h-full text-sm font-bold transition-colors duration-300 ${form.nivel === lvl ? "text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.vocab}</label>
                  <div className="bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
                    <div className="relative flex w-full">
                      <div className="absolute top-0 bottom-0 w-[33.333%] bg-surface-container-highest shadow-sm border border-outline-variant/20 rounded-lg transition-transform duration-300 ease-out z-0" style={{ transform: `translateX(${vocabIndex * 100}%)` }}></div>
                      {VOCAB_COMPLEXITY.map((v) => (
                        <button 
                          key={v} 
                          type="button" 
                          onClick={() => handleChange("vocabulario", v)} 
                          className={`relative z-10 flex-1 py-3 px-1 sm:px-2 rounded-lg text-[11px] sm:text-sm transition-colors duration-300 ${form.vocabulario === v ? "font-bold text-primary" : "font-medium text-on-surface-variant hover:text-on-surface"}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t.reqVocab} <span className="text-outline-variant lowercase font-normal italic">{t.opt}</span></label>
                  </div>
                  <input 
                    type="text" 
                    value={form.vocabularioExtra} 
                    onChange={(e) => handleChange("vocabularioExtra", e.target.value)} 
                    className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all shadow-inner outline-none" 
                    placeholder={t.vocabPl} 
                  />
                </div>

                {error && <div className="text-error text-sm bg-error-container/20 p-4 rounded-xl border border-error/50">{error}</div>}

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg py-5 rounded-2xl shadow-[0_10px_20px_rgba(244,201,105,0.15)] hover:shadow-[0_10px_25px_rgba(244,201,105,0.25)] hover:brightness-110 transition-all active:scale-[0.97] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{loading ? 'hourglass_empty' : 'mail'}</span>
                    {loading ? t.btnGenIng : t.btnGen}
                  </button>
                </div>
              </form>
            </div>

            {result && (
              <div ref={resultRef} className="mt-8 bg-surface-container rounded-2xl p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-primary/20">
                 <h3 className="font-headline text-2xl text-primary mb-4">{t.resTitle}</h3>
                 
                 <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/20 mb-6">
                   <pre className="text-on-surface font-body whitespace-pre-wrap text-sm leading-relaxed">{result}</pre>
                 </div>
                 
                 <div className="border-t border-surface-container-highest pt-6">
                   <div className="flex flex-wrap gap-3">
                     <button 
                       onClick={() => navigator.clipboard.writeText(result)} 
                       className="flex-1 px-4 py-3 bg-surface-container-highest text-primary rounded-xl text-sm font-bold active:scale-95 hover:brightness-110 transition-all border border-outline-variant/30 flex justify-center items-center gap-2"
                     >
                       <span className="material-symbols-outlined text-[18px]">content_copy</span> {t.btnCopy}
                     </button>
                     
                     <button 
                       onClick={handleHumanize} 
                       disabled={isHumanizing} 
                       className={`flex-[1.5] px-4 py-3 bg-transparent text-primary rounded-xl text-sm font-bold active:scale-95 hover:bg-primary/10 transition-all border-2 border-primary/40 flex justify-center items-center gap-2 ${isHumanizing ? 'opacity-70 cursor-not-allowed' : ''}`}
                     >
                       <span className="material-symbols-outlined text-[18px]">{isHumanizing ? 'sync' : 'psychology_alt'}</span> 
                       {isHumanizing ? t.btnHumIng : t.btnHum}
                     </button>
                   </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'history' && (
          <div className="max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-16 relative z-10 md:pt-16">
            <header className="mb-14">
              <h2 className="text-4xl md:text-5xl font-headline text-on-surface tracking-tight mb-3">{t.histTitle}</h2>
              <p className="text-on-surface-variant text-sm md:text-lg font-body max-w-2xl leading-relaxed">{t.histSub}</p>
            </header>

            {history.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">inbox</span>
                <h3 className="text-xl font-headline text-on-surface mb-2">{t.noHist}</h3>
                <p className="text-on-surface-variant text-sm">{t.noHistSub}</p>
                <button 
                  onClick={() => handleNavClick('generator')} 
                  className="mt-6 px-6 py-3 bg-primary-container text-on-primary rounded-xl text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  {t.goGen}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {history.map((item) => (
                  <article key={item.id} className="bg-surface-container rounded-2xl p-7 flex flex-col gap-5 group hover:-translate-y-1 transition-all duration-400 border border-transparent hover:border-primary/20 hover:shadow-[0_10px_40px_-10px_rgba(244,201,105,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] text-on-surface-variant/60 font-body uppercase tracking-widest font-semibold">{item.date}</span>
                      <div className="flex gap-2">
                        <span className="bg-surface-container-highest text-primary/90 text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-primary/10">{item.level}</span>
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
                        <button 
                          onClick={() => navigator.clipboard.writeText(item.content)} 
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded-lg active:scale-90 transition-all" 
                          title="Copy to clipboard"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button 
                          onClick={() => deleteHistoryItem(item.id)} 
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-lg active:scale-90 transition-all" 
                          title="Delete"
                        >
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
