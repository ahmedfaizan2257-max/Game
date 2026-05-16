import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, ShieldCheck, ChevronDown, ChevronUp, Bot, User, HelpCircle, RefreshCw } from "lucide-react";

interface SupportDeskProps {
  onSendSupportTicket: (query: string, category: string) => Promise<string>;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function SupportDesk({ onSendSupportTicket }: SupportDeskProps) {
  const [ticketCategory, setTicketCategory] = useState("Shipping Manifests");
  const [ticketQuery, setTicketQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      id: "welc-1",
      sender: "bot",
      text: "Vapor AI Grid Assistant logged in. Let me solve any queries about physical merchandise shipping, arcade block alignments, ticket verification or CRT frame diagnostics! System is online.",
      timestamp: new Date()
    }
  ]);

  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(0);

  const faqData = [
    {
      q: "How are prizes verified and delivered physically?",
      a: "Once a tournament timer hits absolute zero and is 'sealed', the #1 player is instantly verified using recorded CRT keyframe input telemetry to prevent automation or bot abuse. We email you within 15 minutes to confirm your mailing address. All items are shipped brand new from certified retail outlets, fully insured internationally via DHL Priority or FedEx, with active tracking manifest links logged on our Winners Hall!"
    },
    {
      q: "Is there an entry play limit per competition?",
      a: "No! You can buy as many tickets as your balance permits. Every single play credits you 1 Stacker game attempt. Only your single highest block altitude is registered on the active leaderboard. If you score 10 rows and then 14 rows, only 14 rows is logged as your permanent standing."
    },
    {
      q: "How do perfect block streaks work?",
      a: "If you drop a vertical block within 6 coordinate coordinates of the underlying base, it aligns PERFECTLY. In this sweet spot, the system triggers a neon strobe flash. This awards you double multiplier streaks, prevents any slicing, and locks the segment size so you can build your tower of power with perfect base support."
    },
    {
      q: "What countries support safe shipping manifesting?",
      a: "We currently support physical shipment validation across North America, Europe, United Kingdom, Japan, South Korea, Kyoto hubs, Berlin express networks, and Austin Texas corridors. All customs fees are fully covered by the VaporPrize protocol!"
    }
  ];

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;

    const userText = ticketQuery;
    setTicketQuery("");
    setLoading(true);

    // Append user message to log
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date()
    };
    setChatLog((prev) => [...prev, userMsg]);

    // Query backend model agent
    const response = await onSendSupportTicket(userText, ticketCategory);

    // Append bot message to log
    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: response,
      timestamp: new Date()
    };
    setChatLog((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="support-desk-block">
      
      {/* FAQ Guide Accordions (Col 5) */}
      <div className="lg:col-span-5 flex flex-col gap-4" id="faq-accordions-side">
        <div className="flex items-center gap-1.5 pb-2 border-b border-neutral-800">
          <HelpCircle className="w-4 h-4 text-[#ff007f]" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white font-display">
            Frequencies & Guidelines FAQ
          </h3>
        </div>

        <div className="flex flex-col gap-2.5">
          {faqData.map((item, idx) => {
            const isOpen = faqOpenIdx === idx;
            return (
              <div
                key={idx}
                className="border border-neutral-800 bg-neutral-900/10 hover:border-neutral-700 transition-colors"
              >
                <button
                  onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex justify-between items-center text-xs font-bold text-white uppercase tracking-tight"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 border-t border-neutral-800 text-[11px] leading-relaxed text-neutral-400 font-mono">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live AI Operator terminal (Col 7) */}
      <div className="lg:col-span-7 flex flex-col border border-neutral-800 bg-neutral-900/20" id="live-chat-panel">
        
        {/* Chat Chrome Header */}
        <div className="p-4 border-b border-neutral-800 bg-black flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00f0ff] animate-pulse" />
            <span className="text-xs font-black uppercase text-white tracking-wider">
              AI Arcade Assistant Console
            </span>
          </div>

          <span className="text-[8px] font-mono text-neutral-500">
            [Gemini Powered Telemetry]
          </span>
        </div>

        {/* Chat log displays */}
        <div className="flex-1 p-4 flex flex-col gap-3 min-h-[280px] max-h-[380px] overflow-y-auto select-text font-mono text-xs">
          {chatLog.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isBot ? "self-start" : "self-end flex-row-reverse"}`}
              >
                <div className={`w-6 h-6 shrink-0 flex items-center justify-center border ${
                  isBot 
                    ? "bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]" 
                    : "bg-blue-600/10 border-blue-500/30 text-blue-400"
                }`}>
                  {isBot ? <Bot className="w-3.5 h-3.5 animate-pulse" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-3 border ${
                  isBot 
                    ? "bg-[#00f0ff]/5 border-neutral-800 text-neutral-200" 
                    : "bg-blue-600/15 border-blue-500/10 text-white"
                }`}>
                  <p className="leading-relaxed text-[11px]">{msg.text}</p>
                  <span className="block text-[8px] text-neutral-500 uppercase mt-1.5 text-right font-bold leading-none">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2 items-center text-neutral-500 animate-pulse font-mono text-[10px] p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00f0ff]" />
              <span>GRID SYNCHRONIZING WITH SYSTEM DECODER AGENT...</span>
            </div>
          )}
        </div>

        {/* Send message text form input field */}
        <form onSubmit={handleSendQuery} className="p-3 border-t border-neutral-800 bg-black flex gap-2">
          
          <select
            value={ticketCategory}
            onChange={(e) => setTicketCategory(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 p-2 text-neutral-300 font-mono text-[11px] uppercase focus:outline-none focus:border-[#ff007f] hidden sm:block pointer-events-auto"
            title="Ticket priority tags"
          >
            <option value="Shipping Manifests">Shipping</option>
            <option value="Block Speeds & Controls">Gameplay</option>
            <option value="Pricing & Refunds">Refunds</option>
            <option value="Winner Verification">Verification</option>
            <option value="Regulatory Compliance">Regulatory</option>
          </select>

          <input
            type="text"
            placeholder="Type support question or shipping route check..."
            value={ticketQuery}
            onChange={(e) => setTicketQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-neutral-900 border border-neutral-850 p-2 text-white placeholder-neutral-600 font-mono text-[12px] focus:outline-none focus:border-[#00f0ff]"
          />

          <button
            type="submit"
            disabled={loading || !ticketQuery.trim()}
            className={`px-4 py-2 flex items-center justify-center border transition-colors ${
              loading || !ticketQuery.trim()
                ? "bg-neutral-800 text-neutral-600 border-neutral-850"
                : "bg-blue-600 hover:bg-[#00f0ff] text-white hover:text-black border-transparent"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
}
