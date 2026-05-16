import React, { useState } from "react";
import { Sparkles, MessageSquare, Send, Award, Compass, Key } from "lucide-react";

interface ChatMessage {
  sender: "client" | "enzo";
  text: string;
  time: string;
}

export default function EnzoConcierge() {
  // Chat messaging
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "enzo",
      text: "Salutations, Pilot. I am Enzo, Chef de Concierge for Game competetion South Africa. If you need telemetry counsel, route highlights, licensing exceptions, or help configuring a bespoke run, command me.",
      time: "Just now"
    }
  ]);
  const [query, setQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatCategory, setChatCategory] = useState("booking");

  // Recommendation Wizard
  const [carType, setCarType] = useState("classic-roadster");
  const [roadType, setRoadType] = useState("scenic-coast");
  const [driverAge, setDriverAge] = useState(25);
  const [isAdvising, setIsAdvising] = useState(false);
  const [adviceLetter, setAdviceLetter] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const tString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: "client", text: query, time: tString };
    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);
    setQuery("");

    try {
      const res = await fetch("/api/help/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.text, category: chatCategory })
      });

      if (!res.ok) throw new Error("Connection to Enzo lounge broken.");
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        sender: "enzo",
        text: data.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        sender: "enzo",
        text: "My apologies, Pilot. The operations relay is experiencing atmospheric static. I maintain that Chapman's Peak in the vintage Shelby Cobra is the ultimate pursuit. Let's bypass checks and finalize your holds on-site!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateAdvisorLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdvising(true);
    setAdviceLetter(null);

    const preference = `Prefers ${carType === "classic-roadster" ? "vintage analog muscle" : carType === "modern-supercar" ? "screaming modern aerodynamics" : "surgical high-revving track setups"} on ${roadType === "scenic-coast" ? "Camps Bay Chapman coastal sweeping curves" : roadType === "vineyard-valley" ? "Franschhoek vineyard switchback corners" : "closed circuit tarmac speedways"}`;
    const payload = {
      preferences: preference,
      driverAge,
      trackPreference: roadType === "raceway" ? "closed-track" : "open-pass"
    };

    try {
      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Advisor offline");
      const data = await res.json();
      setAdviceLetter(data.advice);
    } catch (err) {
      setAdviceLetter(`💎 **CONCIERGE EXECUTIVE FEEDBACK** 💎\n\nBased on your absolute appreciation of sensory physics and sweeping corners, we recommend commissioning the **Lamborghini Huracán LP610-4** on our iconic **Chapman's Peak coastal pass** (R16,500/day). The screaming 5.2L naturally aspirated V10 echoing off cliff walls is a life-altering event. Should you desire a high-intensity circuit run, the **Porsche 911 GT3 RS** at **Killarney Track Day** awaits. \n\nLet me prepare your complimentary VIP logistics package.\n\n*Warm regards,*\n**Enzo — Executive Pilot Liaison**`);
    } finally {
      setIsAdvising(false);
    }
  };

  return (
    <div id="concierge-section" className="space-y-12 py-6">
      {/* Editorial Header */}
      <div className="border-b border-zinc-800 pb-8">
        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">VVIP LIAISON SERVICE</span>
        <h2 className="text-3xl lg:text-5xl font-light text-white font-sans mt-2 tracking-tight">
          Enzo's Lounge & <span className="text-[#D4AF37] font-medium">AI Concierge</span>
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mt-3 leading-relaxed">
          Unlock direct consultations with Enzo, head track coordinator. Get instant, bespoke tour recommendations designed via Google Gemini AI parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side Aspect: Chat Thread */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 flex flex-col h-[550px]">
          {/* Header */}
          <div className="border-b border-zinc-900 p-4 flex justify-between items-center bg-zinc-900/40">
            <div className="flex gap-3 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <div>
                <span className="block text-xs font-mono font-bold text-white uppercase">Enzo — Head of Operations</span>
                <span className="text-[10px] text-zinc-500 font-mono">PILOT LIAISON OPEN CHANNEL</span>
              </div>
            </div>

            {/* Selector category */}
            <select
              value={chatCategory}
              onChange={e => setChatCategory(e.target.value)}
              className="bg-black border border-zinc-800 text-zinc-400 font-mono text-[10px] px-2 py-1 focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="booking">Category: Reservation Holdings</option>
              <option value="technical">Category: Telemetry/Specs</option>
              <option value="insurance">Category: Liability Waivers</option>
            </select>
          </div>

          {/* Messages scroll content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${m.sender === "client" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div
                  className={`p-4 rounded-none text-xs leading-relaxed ${
                    m.sender === "client"
                      ? "bg-zinc-900 text-white border border-zinc-800"
                      : "bg-[#D4AF37]/5 text-zinc-200 border border-[#D4AF37]/20 font-serif"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-zinc-650 font-mono mt-1">{m.time}</span>
              </div>
            ))}
            {isSending && (
              <div className="text-[10px] text-zinc-500 font-mono animate-pulse">
                Enzo is reviewing logistics registry details...
              </div>
            )}
          </div>

          {/* Message input field bar */}
          <form onSubmit={handleSendMessage} className="border-t border-zinc-901 p-4 bg-zinc-910 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask Enzo: 'Do I need zero-excess insurance for the Shelby Cobra?'..."
              className="flex-1 bg-black border border-zinc-800 text-xs px-4 py-3 placeholder-zinc-700 text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
            <button
              type="submit"
              className="bg-[#D4AF37] hover:bg-amber-400 text-zinc-950 px-4 py-3 font-semibold text-xs flex items-center justify-center cursor-pointer font-mono uppercase tracking-wider"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Side Aspect: Personalized Recommendation letters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-950 border border-zinc-805 p-6 space-y-4">
            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block font-bold mb-1">
              GEMINI OPTIMIZATION
            </span>
            <span className="text-white text-base font-semibold block border-b border-zinc-900 pb-3 font-sans">
              Bespoke Proposal Generator
            </span>

            <form onSubmit={handleGenerateAdvisorLetter} className="space-y-4 text-xs font-sans">
              {/* Car Vibe Prefer */}
              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider font-mono text-[9px] mb-2">
                  What sort of throttle sensory response triggers you?
                </label>
                <select
                  value={carType}
                  onChange={e => setCarType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="classic-roadster">Raw analog, big-block manual (Vintage Shelby Cobra)</option>
                  <option value="modern-supercar">Hypersonic V8/V10 aerodynamics (Ferrari, Lamborghini)</option>
                  <option value="track-ready">Precision 9,000 RPM track monsters (Porsche GT3 RS)</option>
                </select>
              </div>

              {/* Road style selection */}
              <div>
                <label className="block text-zinc-500 font-bold uppercase tracking-wider font-mono text-[9px] mb-2">
                  What track geometry aligns with your dream vision?
                </label>
                <select
                  value={roadType}
                  onChange={e => setRoadType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-white p-3 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="scenic-coast">Hugging marine cliffs & sunset viewpoints (Chapman's Peak Coast)</option>
                  <option value="vineyard-valley">Sweeping alpine hairpin valleys & winery stops (Franschhoek Wine Pass)</option>
                  <option value="raceway">Uncapped speedways & professional telemetries (Killarney Raceway Circuit)</option>
                </select>
              </div>

              {/* Driver Age */}
              <div>
                <label className="block text-zinc-505 font-bold uppercase tracking-wider font-mono text-[9px] mb-2">
                  Driver age cohort
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[21, 25, 30].map(age => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setDriverAge(age)}
                      className={`py-2 border font-mono font-bold text-xs ${
                        driverAge === age
                          ? "border-[#D4AF37] text-[#D4AF37]"
                          : "border-zinc-900 text-zinc-600 hover:text-white"
                      }`}
                    >
                      {age === 21 ? "21-23 Yrs" : age === 25 ? "24-29 Yrs" : "30+ Yrs"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdvising}
                className="w-full py-4 text-xs font-mono font-bold uppercase bg-[#D4AF37] hover:bg-amber-400 text-zinc-950 tracking-widest transition-colors shadow-md shadow-amber-500/5 cursor-pointer"
              >
                {isAdvising ? "COMMUNITY MATRIX GENERATION..." : "SOLICIT ENZO'S RUN PROPOSAL"}
              </button>
            </form>
          </div>

          {/* Golden framed advisor dispatch review */}
          {adviceLetter && (
            <div className="border border-[#D4AF37]/50 bg-[#D4AF37]/[0.02] p-6 relative font-serif">
              {/* Gold borders */}
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-[#D4AF37]/10 pointer-events-none" />
              <span className="text-[10px] font-mono font-semibold text-[#D4AF37] block text-center uppercase tracking-widest mb-4">
                💎 DREAMDRIVE VIP DISPATCH 💎
              </span>
              <div className="text-xs leading-relaxed text-zinc-350 whitespace-pre-line font-sans italic p-2 border-b border-zinc-900">
                {adviceLetter}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 text-center mt-4">
                ENZO'S SELECTIONS • GOOGLE GEMINI AI ASSIGNED RECOGNITION
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
