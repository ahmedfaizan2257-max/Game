import React, { useState, useEffect } from "react";
import neonIphone from "./assets/images/neon_iphone_pro_1778968589318.png";
import neonPs5 from "./assets/images/neon_ps5_pro_1778968613943.png";
import neonAirpods from "./assets/images/neon_airpods_max_1778968640657.png";
import {
  Trophy,
  Coins,
  CreditCard,
  User,
  Clock,
  Zap,
  Volume2,
  Plus,
  Sparkles,
  Gamepad2,
  AlertTriangle,
  RefreshCw,
  Award,
  CirclePlay,
  HelpCircle,
  History
} from "lucide-react";
import StackerGame from "./components/StackerGame";
import { playSoundCoin } from "./utils/sounds";
import WinnersHall, { PastCompetition } from "./components/WinnersHall";
import DepositVault, { LedgerEntry } from "./components/DepositVault";
import SupportDesk from "./components/SupportDesk";

interface ScoreEntry {
  username: string;
  score: number;
  timestamp: string;
  isUser: boolean;
}

interface Competition {
  id: string;
  title: string;
  prizeName: string;
  prizeValue: number;
  entryFee: number;
  description: string;
  imageAlt: string;
  endsAt: string;
  status: "active" | "ended";
  leaderboard: ScoreEntry[];
  ticketCost: number;
  timeLeftMs: number;
  winner?: {
    username: string;
    score: number;
  } | null;
}

interface UserProfile {
  username: string;
  balance: number;
  tickets: Record<string, number>;
  scoresSubmissions: Record<string, number[]>;
}

interface ActivityLog {
  id: string;
  username: string;
  type: "deposit" | "enter" | "score" | "ended";
  details: string;
  timestamp: string;
}

export default function App() {
  // Navigation Routing Tabs State
  const [currentTab, setCurrentTab] = useState<"arena" | "history" | "vault" | "support">("arena");

  // Core game data states
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: "ArcadeRacer_99",
    balance: 15.00,
    tickets: {},
    scoresSubmissions: {},
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string>("iphone");
  const [loading, setLoading] = useState(true);

  // New page specific backend synced states
  const [pastComps, setPastComps] = useState<PastCompetition[]>([]);
  const [ledgerList, setLedgerList] = useState<LedgerEntry[]>([]);

  // Simple Modals (profile, quick-deposit)
  const [showTopUp, setShowTopUp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Topup modal inputs
  const [topUpAmount, setTopUpAmount] = useState<string>("10.00");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");

  // Profile modal inputs
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Game commentary states
  const [isGameActive, setIsGameActive] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [aiCommentary, setAiCommentary] = useState<string>("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Synchronise state from backend APIs
  const fetchState = async () => {
    try {
      const res = await fetch("/api/competitions");
      const data = await res.json();
      setCompetitions(data.competitions);
      setUserProfile(data.user);
      
      const resAct = await fetch("/api/activity");
      const dataAct = await resAct.json();
      setActivities(dataAct.activities);

      // Fetch expanded multi-page records
      const resPast = await fetch("/api/past-competitions");
      const dataPast = await resPast.json();
      setPastComps(dataPast.pastCompetitions);

      const resLedger = await fetch("/api/wallet/ledger");
      const dataLedger = await resLedger.json();
      setLedgerList(dataLedger.ledger);

      setLoading(false);
    } catch (e) {
      console.error("Error communicating with VaporPrize server:", e);
    }
  };

  useEffect(() => {
    fetchState();
    // Poll state every 7 seconds to keep rankings, live commentary, tickers synced smoothly
    const interval = setInterval(fetchState, 7000);
    return () => clearInterval(interval);
  }, []);

  // Purchase Stacker game credits pass
  const handlePurchaseTicket = async (compId: string, fee: number) => {
    if (userProfile.balance < fee) {
      setPaymentError("");
      setPaymentSuccess("");
      setTopUpAmount(Math.max(10, Math.ceil(fee - userProfile.balance)).toFixed(2));
      setShowTopUp(true);
      return;
    }

    try {
      const res = await fetch(`/api/competitions/${compId}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      
      if (res.ok) {
        playSoundCoin();
        fetchState();
      } else {
        alert(data.error || "Failed buying entry pass");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Log score when blocks drop
  const handleGameOver = async (score: number) => {
    setLastScore(score);
    setIsGameActive(false);

    try {
      const res = await fetch(`/api/competitions/${selectedCompId}/submit-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score })
      });
      const data = await res.json();

      if (res.ok) {
        await fetchState();
        triggerAiCommentary(score, data.rank);
      } else {
        alert(data.error || "Could not log arcade score");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger Gemini sport referee announcers
  const triggerAiCommentary = async (pscore: number, rank: number) => {
    setAiGenerating(true);
    setAiCommentary("SYSTEM: Scanning video footage... Referee generating commentary...");
    
    const activeComp = competitions.find(c => c.id === selectedCompId);
    if (!activeComp) return;

    const leader = activeComp.leaderboard[0] || { username: "None", score: 0 };

    try {
      const res = await fetch("/api/gemini/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: pscore,
          username: userProfile.username,
          rank: rank,
          prizeName: activeComp.prizeName,
          leaderName: leader.username,
          leaderScore: leader.score
        })
      });
      const data = await res.json();
      setAiCommentary(data.commentary);
    } catch (err) {
      console.warn(err);
      setAiCommentary("SYSTEM: Noise levels elevated. Neon grid feedback logged.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Handle support ticketing query via Gemini Chatbot
  const handleSendSupportTicket = async (query: string, category: string): Promise<string> => {
    try {
      const res = await fetch("/api/help/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category })
      });
      const data = await res.json();
      return data.answer || "Virtual operator signal lost. Contact systems.";
    } catch (err) {
      console.warn(err);
      return "SYSTEM ERROR: Cyber link severed. Refuel vault to stabilize logs.";
    }
  };

  // Direct Vault Deposit Handler inside DepositVault component
  const handleDepositVaultSubmit = async (amount: string, cardDetails: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          ...cardDetails
        })
      });

      if (res.ok) {
        playSoundCoin();
        fetchState();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Simple modal topup payment
  const handleModalDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");
    setPaymentSuccess("");

    const success = await handleDepositVaultSubmit(topUpAmount, {
      cardNumber,
      cardHolder,
      expiry,
      cvv
    });

    if (success) {
      setPaymentSuccess(`Vault credited +$${parseFloat(topUpAmount).toFixed(2)} successfully.`);
      setTimeout(() => {
        setShowTopUp(false);
        setCardNumber("");
        setCardHolder("");
        setExpiry("");
        setCvv("");
        setPaymentSuccess("");
      }, 1200);
    } else {
      setPaymentError("Direct gateway rejected. Verify details.");
    }
  };

  // Signature profile update
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");

    if (!newUsername.trim()) {
      setUsernameError("Provide registered username.");
      return;
    }
    const cleaned = newUsername.trim().replace(/[^a-zA-Z0-9_]/g, "");

    try {
      const res = await fetch("/api/profile/update-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleaned })
      });
      if (res.ok) {
        fetchState();
        setShowProfile(false);
        setNewUsername("");
      } else {
        const errorData = await res.json();
        setUsernameError(errorData.error || "Profile validation issue.");
      }
    } catch (e) {
      setUsernameError("Gateway lost.");
    }
  };

  // Sim handlers
  const handleDevSimulateOpponent = async () => {
    await fetch("/api/admin/simulate-opponent", { method: "POST" });
    fetchState();
  };

  const handleDevEndCompetition = async (id: string) => {
    await fetch(`/api/admin/end-competition/${id}`, { method: "POST" });
    fetchState();
  };

  const handleDevRestartCompetition = async (id: string) => {
    await fetch(`/api/admin/restart-competition/${id}`, { method: "POST" });
    fetchState();
  };

  const formatTimeLeft = (endTimeStr: string) => {
    const msLeft = new Date(endTimeStr).getTime() - Date.now();
    if (msLeft <= 0) return { hours: "00", mins: "00", secs: "00", completed: true };

    const hours = Math.floor(msLeft / (3600 * 1000));
    const mins = Math.floor((msLeft % (3600 * 1000)) / (60 * 1000));
    const secs = Math.floor((msLeft % (60 * 1000)) / 1000);

    return {
      hours: hours.toString().padStart(2, "0"),
      mins: mins.toString().padStart(2, "0"),
      secs: secs.toString().padStart(2, "0"),
      completed: false
    };
  };

  const activeComp = competitions.find(c => c.id === selectedCompId);
  const ticketCount = userProfile.tickets[selectedCompId] || 0;
  const timerDetails = activeComp ? formatTimeLeft(activeComp.endsAt) : { hours: "00", mins: "00", secs: "00", completed: true };

  const getPrizeImage = (id: string) => {
    if (id === "iphone") {
      return neonIphone;
    }
    if (id === "ps5") {
      return neonPs5;
    }
    return neonAirpods;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between overflow-x-hidden select-none" id="vaporprize-root">
      
      {/* 🚀 MAIN HEADER SECTION & NAVIGATION BAR */}
      <header className="flex flex-col md:flex-row justify-between items-center px-4 md:px-10 py-5 border-b border-neutral-800 bg-neutral-950 z-20 gap-4">
        
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-black text-white rounded-none select-none text-md">V</div>
          <span className="font-black text-2xl tracking-tighter uppercase font-display select-none">
            VAPOR<span className="text-blue-500">PRIZE</span><span className="text-neutral-500 text-xs font-mono ml-1 font-normal tracking-tight">.io</span>
          </span>
        </div>

        {/* 🗺️ PREMIUM NAVIGATION BAR TAB BUTTONS */}
        <nav className="flex items-center bg-neutral-900 border border-neutral-800 p-1 font-mono text-[11px] uppercase tracking-wider font-bold" id="main_navigation_bar">
          <button
            onClick={() => { setCurrentTab("arena"); setIsGameActive(false); }}
            className={`px-4 py-2 transition-colors ${
              currentTab === "arena" 
                ? "bg-blue-600 text-white" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            🏟️ Arena
          </button>
          <button
            onClick={() => { setCurrentTab("history"); setIsGameActive(false); }}
            className={`px-4 py-2 transition-colors ${
              currentTab === "history" 
                ? "bg-blue-600 text-white" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            🏆 Winners
          </button>
          <button
            onClick={() => { setCurrentTab("vault"); setIsGameActive(false); }}
            className={`px-4 py-2 transition-colors ${
              currentTab === "vault" 
                ? "bg-blue-600 text-white" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            💳 Vault Ledger
          </button>
          <button
            onClick={() => { setCurrentTab("support"); setIsGameActive(false); }}
            className={`px-4 py-2 transition-colors ${
              currentTab === "support" 
                ? "bg-blue-600 text-white" 
                : "text-[#ff007f]"
            }`}
          >
            🔌 AI Help
          </button>
        </nav>

        {/* User profile / coin credits controls */}
        <div className="flex items-center gap-2 md:gap-5">
          <button
            onClick={() => {
              setNewUsername(userProfile.username);
              setShowProfile(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 border border-neutral-800 bg-neutral-900/40 text-[11px] font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            id="userprofile-panel-trigger"
          >
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-white">@{userProfile.username}</span>
          </button>

          <div className="flex items-center border border-neutral-700 bg-black">
            <div className="px-3 py-1.5 border-r border-neutral-700 text-[10px] font-bold text-neutral-400 flex items-center gap-1 select-none">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span>VAULT</span>
            </div>
            <button
              onClick={() => {
                setPaymentError("");
                setPaymentSuccess("");
                setShowTopUp(true);
              }}
              className="px-3 py-1.5 text-xs font-black text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5 bg-neutral-900"
              id="wallet-credits-trigger"
            >
              <span className="text-[#00f0ff] font-mono">${userProfile.balance.toFixed(2)}</span>
              <Plus className="w-3.5 h-3.5 text-blue-500 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* DYNAMIC REAL-TIME EVENT STREAM BANNER */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 md:px-10 py-2.5 flex items-center gap-3 text-xs overflow-hidden select-none">
        <span className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/30 text-[9px] font-black uppercase text-blue-400 tracking-widest shrink-0 animate-pulse">
          ARENA STATS
        </span>
        <div className="flex gap-8 animate-marquee whitespace-nowrap overflow-x-auto scrollbar-none font-mono text-neutral-400 text-[11px] w-full">
          {activities.slice(0, 3).map((act, i) => (
            <span key={act.id} className="inline-flex items-center gap-1 shrink-0">
              <span className="text-[#00f0ff] font-bold">●</span> {act.details}
            </span>
          ))}
          {activities.length === 0 && (
            <span>Grid state completed. Connect play chips to climb top ranks live!</span>
          )}
        </div>
      </div>

      {/* 🔮 PAGE ROUTING CONTROLLER BODY */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4" id="arena-loader">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-500 animate-pulse">
              [Syncing with regional Vapor Arcade servers...]
            </span>
          </div>
        ) : (
          <div className="animate-fadeIn">
            
            {/* TABVIEW 1: PRIMARY ARCADE CHALLENGE ARENA */}
            {currentTab === "arena" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="arena_parent_grid">
                
                {/* Screen left: Prize overview / canvas active cabinet (Col 7) */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  
                  {/* Internal tabs for game choice Selection */}
                  <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 border border-neutral-850" id="arcade_active_challenges_hud">
                    {competitions.map((comp) => {
                      const isActive = comp.id === selectedCompId;
                      return (
                        <button
                          key={comp.id}
                          onClick={() => {
                            setSelectedCompId(comp.id);
                            setIsGameActive(false);
                            setLastScore(null);
                            setAiCommentary("");
                          }}
                          className={`py-2 px-1 text-center transition-all flex flex-col items-center justify-center rounded-none border ${
                            isActive
                              ? "bg-blue-600 border-blue-500 text-white font-black"
                              : "text-neutral-400 hover:text-white hover:bg-neutral-800 border-transparent"
                          }`}
                        >
                          <span className="text-[11px] uppercase tracking-wider font-bold">
                            {comp.id === "iphone" ? "📱 iPhone 16" : comp.id === "ps5" ? "🕹️ PS5 Pro" : "🎧 AirPods Max"}
                          </span>
                          <span className="text-[9px] opacity-75 font-mono">
                            Pass: ${comp.entryFee.toFixed(0)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active prize visual details */}
                  {activeComp ? (
                    <div className="flex flex-col">
                      
                      {activeComp.status === "ended" && (
                        <div className="mb-6 p-4 border border-yellow-500 bg-yellow-500/10 text-yellow-500 text-center animate-pulse flex flex-col items-center">
                          <Award className="w-8 h-8 mb-2" />
                          <h3 className="font-extrabold uppercase text-sm tracking-widest">TOURNAMENT CONCLUDED (SEALED)</h3>
                          <p className="text-[11px] mt-1 text-neutral-300">
                            The countdown timer slam zero. All active heights registered are final.
                          </p>
                          {activeComp.winner ? (
                            <div className="mt-3 bg-yellow-500 text-black px-4 py-1.5 font-bold uppercase text-xs">
                              Winner: @{activeComp.winner.username} scored {activeComp.winner.score} stacks!
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-500 font-mono italic mt-1">[Null score submissions registered]</span>
                          )}
                        </div>
                      )}

                      {!isGameActive ? (
                        <div className="border border-neutral-805 bg-neutral-900/10 p-5 md:p-6 flex flex-col gap-5">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            
                            {/* Left Graphic placeholder */}
                            <div className="md:col-span-5 border border-neutral-800 bg-neutral-950 p-3 flex flex-col justify-center items-center relative overflow-hidden group">
                              <img
                                src={getPrizeImage(activeComp.id)}
                                alt={activeComp.imageAlt}
                                referrerPolicy="no-referrer"
                                className="object-contain w-35 h-35 mix-blend-lighten max-h-[160px] transform group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute top-2 left-2 bg-blue-600 px-1.5 py-0.5 text-[8px] font-mono uppercase text-white tracking-widest font-black leading-none">
                                EST VALUE ${activeComp.prizeValue.toFixed(0)}
                              </div>
                            </div>

                            {/* Right Prize description */}
                            <div className="md:col-span-7 flex flex-col justify-between">
                              <div>
                                <span className="inline-block px-2 py-0.5 text-[8px] bg-blue-600/15 border border-blue-500/30 font-mono text-blue-400 font-extrabold uppercase mb-2">
                                  {activeComp.status === "active" ? "NOW PLAYING" : "CLOSED TOURNAMENT"}
                                </span>
                                <h3 className="text-xl md:text-2xl font-black uppercase text-white font-display">
                                  {activeComp.title}
                                </h3>
                                <p className="text-neutral-400 text-xs mt-2 leading-relaxed font-mono">
                                  {activeComp.description}
                                </p>
                              </div>

                              {/* Game pass details */}
                              <div className="mt-4 p-3 border border-neutral-805 bg-neutral-950 flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                  <Gamepad2 className="w-4 h-4 text-blue-500" />
                                  <div>
                                    <span className="block text-[8px] text-neutral-500 uppercase font-bold">YOUR RUN TICKETS</span>
                                    <span className="font-bold text-white font-mono">{ticketCount} runs loaded</span>
                                  </div>
                                </div>
                                {activeComp.status === "active" && (
                                  <button
                                    onClick={() => handlePurchaseTicket(activeComp.id, activeComp.entryFee)}
                                    className="bg-neutral-800 hover:bg-blue-600 text-white border border-neutral-700 px-3 py-1 font-bold text-[10px] uppercase transition-colors font-mono"
                                  >
                                    BUY TICKET (+${activeComp.entryFee.toFixed(1)})
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Initiate game button */}
                          {activeComp.status === "active" ? (
                            <div className="mt-2">
                              {ticketCount > 0 ? (
                                <button
                                  onClick={() => {
                                    setIsGameActive(true);
                                    setLastScore(null);
                                    setAiCommentary("");
                                  }}
                                  className="w-full py-4 text-black bg-white hover:bg-[#00f0ff] hover:text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 duration-100 cursor-pointer"
                                  id="start-level-play-btn"
                                >
                                  <CirclePlay className="w-4 h-4 animate-pulse" />
                                  INITIATE SKILL-STACK COMP (SPEND 1 PASS)
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePurchaseTicket(activeComp.id, activeComp.entryFee)}
                                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs transition-colors cursor-pointer"
                                  id="purchase-ticket-play-btn"
                                >
                                  DEDUCT ENTRY CHIPS & SECURE GAME TICKET (${activeComp.entryFee.toFixed(2)})
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-red-950/25 border border-red-500/25 text-red-500 text-center font-mono text-[11px] uppercase">
                              Tournament closed on time manifest block. Purchases and uploads are frozen.
                            </div>
                          )}

                        </div>
                      ) : (
                        /* Active canvas module state */
                        <div className="flex flex-col items-center p-3 border border-neutral-800 bg-neutral-950">
                          <StackerGame
                            gameId={activeComp.id}
                            entryFee={activeComp.entryFee}
                            hasTicket={ticketCount > 0}
                            onUseTicket={() => {
                              setUserProfile(prev => ({
                                ...prev,
                                tickets: {
                                  ...prev.tickets,
                                  [selectedCompId]: Math.max(0, (prev.tickets[selectedCompId] || 0) - 1)
                                }
                              }));
                            }}
                            onGameOver={handleGameOver}
                          />

                          <button
                            onClick={() => setIsGameActive(false)}
                            className="mt-4 text-[10px] font-mono text-neutral-500 hover:text-white uppercase tracking-widest hover:underline"
                          >
                            [Quit current arcade session]
                          </button>
                        </div>
                      )}

                      {/* AI Referee commentators desk */}
                      <div className="mt-5 border border-neutral-850 bg-neutral-900/40 p-4 font-mono select-text">
                        <div className="flex justify-between items-center pb-2 border-b border-neutral-800 mb-3">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                            <Sparkles className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
                            <span>Vapor AI Referee Coach</span>
                          </div>
                          <span className="text-[9px] text-blue-500 uppercase font-black">
                            {aiGenerating ? "● TELEMETRY ANALYSIS..." : "● CALIBRATED"}
                          </span>
                        </div>
                        {aiCommentary ? (
                          <p className="text-xs text-[#00f0ff] leading-relaxed">
                            &gt;_ {aiCommentary}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-500 leading-relaxed italic">
                            &gt;_ Calibrated. Spend a ticket and begin stacking nodes. Maximize horizontal alignments to lock perfect double score multipliers and conquer leader standings!
                          </p>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center p-12 border border-neutral-800 text-neutral-600 font-mono text-xs uppercase">
                      Awaiting tournament choice syncing...
                    </div>
                  )}

                </div>

                {/* Screen right: Live leaderboards rankings (Col 5) */}
                <div className="lg:col-span-5 flex flex-col border border-neutral-850 bg-neutral-900/25">
                  
                  <div className="p-5 border-b border-neutral-850 flex justify-between items-end">
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">REALTIME LEDGER</span>
                      <h4 className="text-sm font-black uppercase text-white font-display mt-0.5">Live Leaderboard standings</h4>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] text-[#00f0ff] font-mono uppercase tracking-widest animate-pulse font-bold">
                      <span className="w-1.5 h-1.5 bg-[#00f0ff]"></span>
                      CRT Verified
                    </span>
                  </div>

                  {/* Player rankings list rows */}
                  <div className="divide-y divide-neutral-800/60 overflow-y-auto max-h-[340px]">
                    {activeComp && activeComp.leaderboard.length > 0 ? (
                      activeComp.leaderboard.map((player, idx) => {
                        const rank = idx + 1;
                        const isUser = player.username === userProfile.username;
                        return (
                          <div
                            key={idx}
                            className={`flex justify-between items-center px-5 py-4 ${
                              isUser 
                                ? "bg-blue-600/10 border-l-4 border-blue-500 font-bold" 
                                : "hover:bg-neutral-800/15"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className={`text-lg font-black italic tracking-tighter ${
                                rank === 1 ? "text-yellow-400 font-display" : rank === 2 ? "text-neutral-300 font-display" : rank === 3 ? "text-amber-600 font-display" : "text-neutral-500"
                              }`}>
                                {rank.toString().padStart(2, "0")}
                              </span>
                              <div>
                                <span className={`text-xs uppercase tracking-wider ${isUser ? "text-[#00f0ff]" : "text-neutral-200"}`}>
                                  {player.username}
                                </span>
                                {isUser && <span className="text-[7px] bg-blue-600 font-mono font-black text-white px-1 py-0.5 ml-1.5 inline-block">YOU</span>}
                                <span className="block text-[8px] text-neutral-500 font-mono mt-0.5 uppercase">
                                  {new Date(player.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="font-mono font-black text-white">{player.score}</span>
                              <span className="text-[10px] text-neutral-500 uppercase font-black">rows</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center font-mono text-neutral-600 text-[11px] uppercase">
                        Establishing active play stream feeds...
                      </div>
                    )}
                  </div>

                  {/* Remaining round timer segment */}
                  <div className="p-5 border-t border-neutral-850 bg-black/50">
                    <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-widest font-black mb-1.5">ROUND CLOSE COUNTDOWN</span>
                    <div className="flex items-baseline justify-between">
                      <div className="flex gap-1 text-center font-mono text-lg font-black text-[#00f0ff]" id="countdown_banner">
                        <span className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.5">{timerDetails.hours}</span>
                        <span className="text-neutral-700">:</span>
                        <span className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.5">{timerDetails.mins}</span>
                        <span className="text-neutral-700">:</span>
                        <span className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.5">{timerDetails.secs}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase text-right leading-none">
                        1,280+ active grids matching
                      </span>
                    </div>
                  </div>

                  {/* Dev operator controls footer panel */}
                  <div className="p-4 border-t border-neutral-850 bg-stone-900/10 font-mono text-[10px]">
                    <div className="flex items-center gap-1.5 text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                      <Zap className="w-3.5 h-3.5 text-yellow-500" />
                      <span>Operator Diagnostics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={handleDevSimulateOpponent}
                        className="p-2 border border-neutral-800 bg-neutral-950 text-neutral-400 font-mono uppercase text-[9px] hover:text-white transition-colors"
                      >
                        [TICK NEXT MOVES]
                      </button>
                      {activeComp && (
                        <button
                          onClick={() => {
                            if (activeComp.status === "active") {
                              handleDevEndCompetition(activeComp.id);
                            } else {
                              handleDevRestartCompetition(activeComp.id);
                            }
                          }}
                          className={`p-2 border uppercase font-mono text-[9px] font-black transition-colors ${
                            activeComp.status === "active"
                              ? "bg-red-950/20 border-red-900/40 text-red-400"
                              : "bg-green-950/20 border-green-900/40 text-green-400"
                          }`}
                        >
                          {activeComp.status === "active" ? "[SEAL TIMER]" : "[RESTART TOURNEY]"}
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TABVIEW 2: WINNERS HISTORICAL HALL */}
            {currentTab === "history" && (
              <WinnersHall pastComps={pastComps} />
            )}

            {/* TABVIEW 3: DEPOSIT VAULT CREDITS LEDGER */}
            {currentTab === "vault" && (
              <DepositVault
                balance={userProfile.balance}
                ledger={ledgerList}
                onDeposit={handleDepositVaultSubmit}
              />
            )}

            {/* TABVIEW 4: INTERACTIVE SUPPORT TERMINAL CHAT */}
            {currentTab === "support" && (
              <SupportDesk onSendSupportTicket={handleSendSupportTicket} />
            )}

          </div>
        )}

      </main>

      {/* FOOTER BAR METRICS */}
      <footer className="h-12 border-t border-neutral-800 bg-neutral-950 flex items-center px-4 md:px-10 gap-10 text-[9px] text-[#00f0ff] uppercase tracking-widest font-mono select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-none animate-ping"></span>
          <span>Grid Signal: Online</span>
        </div>
        <div className="hidden md:inline text-neutral-500 font-mono">
          <span>Active Cabinets: 3 calibrated</span>
        </div>
        <div className="ml-auto text-neutral-500 max-w-sm truncate text-right">
          <span>Verified platform. Physical items dispatched under SSL physical protocol.</span>
        </div>
      </footer>

      {/* QUICK PAY CHECKOUT POPUP MODAL */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-mono">
          <div className="bg-neutral-900 border-2 border-neutral-800 max-w-md w-full p-5 relative">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800 mb-4 select-none">
              <h4 className="font-extrabold text-sm uppercase text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-500" />
                VAPOR REVENUE PORTAL
              </h4>
              <button
                onClick={() => setShowTopUp(false)}
                className="text-neutral-500 hover:text-white text-xs hover:underline"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleModalDepositSubmit} className="flex flex-col gap-3 text-xs font-mono">
              <div>
                <label className="block text-[9px] font-bold uppercase text-neutral-500 mb-1">
                  CHOOSE FUNDS DEDUCTION
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["5.00", "10.00", "25.00", "50.00"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTopUpAmount(level)}
                      className={`py-1.5 text-center transition-colors font-mono font-black border ${
                        topUpAmount === level
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-neutral-805 hover:bg-neutral-750 text-neutral-400 border-transparent"
                      }`}
                    >
                      ${level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">
                  16-Digit Card Credentials
                </label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-blue-550 focus:outline-none focus:ring-0"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">
                  Cardholder Registered Name
                </label>
                <input
                  type="text"
                  placeholder="F. AHMED"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white uppercase focus:border-blue-550 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-blue-550 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">
                    CVV Code
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="***"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-black border border-neutral-800 p-2 text-white focus:border-blue-550 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {paymentError && (
                <div className="p-2 border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] uppercase">
                  ERROR: {paymentError}
                </div>
              )}

              {paymentSuccess && (
                <div className="p-2 border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] uppercase">
                  {paymentSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-white hover:bg-blue-600 hover:text-white text-black font-black uppercase tracking-widest text-[11px]"
              >
                PROCEED GATEWAY DEPOSIT (${parseFloat(topUpAmount).toFixed(2)})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RACER USERNAME SIGNATURE CHANGE POPUP MODAL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-mono">
          <div className="bg-neutral-900 border-2 border-neutral-800 max-w-sm w-full p-5 relative">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800 mb-4 select-none">
              <h4 className="font-extrabold text-xs uppercase text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                UPDATE USERNAME PROFILE
              </h4>
              <button
                onClick={() => setShowProfile(false)}
                className="text-neutral-500 hover:text-white text-xs hover:underline"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[8px] font-bold text-neutral-500 uppercase mb-1">
                  NEW REGISTERED PILOT SHIELD ID
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white focus:outline-none focus:border-blue-550"
                  placeholder="NeonStriker_88"
                  required
                />
              </div>

              {usernameError && (
                <div className="text-red-500 text-[9px] uppercase font-bold font-mono">
                  ERROR: {usernameError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-white hover:bg-blue-600 hover:text-white text-black font-black uppercase text-[10px]"
              >
                COMMIT PILOT IDENTITY
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
