import React, { useState } from "react";
import { UserProfile, LedgerEntry } from "../utils/fallbackData";
import { DollarSign, Award, CreditCard, ShieldCheck, Clock, Ticket, Database, FileText } from "lucide-react";

interface PilotDashboardProps {
  userProfile: UserProfile;
  ledger: LedgerEntry[];
  onDeposit: (amount: number) => void;
  onUpdateProfile: (updatedData: { fullName: string; licenseClass: string; driverLicenseNumber: string; username: string }) => void;
}

export default function PilotDashboard({
  userProfile,
  ledger,
  onDeposit,
  onUpdateProfile
}: PilotDashboardProps) {
  const [depositAmount, setDepositAmount] = useState<number>(25000);
  const [isDepositing, setIsDepositing] = useState(false);
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 9210");
  const [cardHolder, setCardHolder] = useState(userProfile.fullName);

  // Profile forms state
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [licenseClass, setLicenseClass] = useState(userProfile.licenseClass);
  const [licenseNumber, setLicenseNumber] = useState("GP-90182-ZA");
  const [username, setUsername] = useState(userProfile.username);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    setIsDepositing(true);
    // Simulate premium security delay
    setTimeout(async () => {
      try {
        const res = await fetch("/api/wallet/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: depositAmount })
        });
        if (res.ok) {
          onDeposit(depositAmount);
          // Play micro sound for deposit coin confirmation!
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5 note
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start();
            setTimeout(() => { try { osc.stop(); ctx.close(); } catch(e){} }, 700);
          } catch(e){}
        }
      } catch (err) {
        console.warn("Wallet deposit error:", err);
      } finally {
        setIsDepositing(false);
      }
    }, 1200);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile/update-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, licenseClass, driverLicenseNumber: licenseNumber, username })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateProfile({ fullName, licenseClass, driverLicenseNumber: licenseNumber, username });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.warn("Update profile error:", e);
    }
  };

  return (
    <div id="dashboard-section" className="space-y-12 py-6">
      {/* Editorial Header */}
      <div className="border-b border-zinc-800 pb-8">
        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">RACER CABIN</span>
        <h2 className="text-3xl lg:text-5xl font-light text-white font-sans mt-2 tracking-tight">
          Pilot Telemetry & <span className="text-[#D4AF37] font-medium">Dashboard</span>
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mt-3 leading-relaxed">
          Manage your elite driving credentials, verify license classifications with South African Road Traffic, top up your experience token balance, and view print-ready boarding passes.
        </p>
      </div>

      {/* Top row: Balance and licence check cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Experience Wallet Card */}
        <div className="bg-zinc-950 border border-zinc-800 p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">
              ESTABLISHED PILOT CREDITS
            </span>
            <span className="text-4xl lg:text-5xl font-bold font-mono text-[#D4AF37] block mt-4 leading-none">
              R {userProfile.walletBalanceZar.toLocaleString()}
            </span>
          </div>
          <div className="mt-8 border-t border-zinc-900 pt-4 flex gap-2 items-center text-xs text-zinc-500">
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
            <span>SA Rand experience credits in active loop.</span>
          </div>
        </div>

        {/* Licence Verification Card */}
        <div className="bg-zinc-950 border border-zinc-800 p-8 relative overflow-hidden flex flex-col justify-between md:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono text-[rgb(16,185,129)] uppercase tracking-widest block font-bold">
                TELEMETRY REGISTRY STATE
              </span>
              <h4 className="text-xl font-light text-white mt-3 font-sans">{userProfile.fullName}</h4>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Pilot Tag: @{userProfile.username} • Credentials: {userProfile.licenseClass}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 rounded-none uppercase">
                <ShieldCheck className="w-4 h-4" />
                Keys Handover Verified
              </span>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 border-t border-zinc-900 pt-4 text-xs text-zinc-500 leading-relaxed font-sans">
            Authorized for all high-performance engines, including natural-aspirated 5.2L V10 and manual classic roadsters. Fully verified to sign zero-excess protection hold waivers.
          </div>
        </div>
      </div>

      {/* Main Content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Aspect: Pilot info and ledger loops */}
        <div className="lg:col-span-8 space-y-12">
          {/* Active Bookings - boarding pass styled */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-zinc-550 uppercase tracking-widest block font-bold">
              ESTABLISHED RESERVED RUN BOARDING PASSES
            </span>

            {userProfile.bookedExperiences.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-900 bg-zinc-950 text-center rounded">
                <Ticket className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                <span className="block text-sm text-zinc-500">No active vehicle reservations held in database.</span>
                <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto">
                  Utilize the 'Bespoke Builder' tab to secure a scenic road tour in any supercar from our stables.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {userProfile.bookedExperiences.map(bkg => {
                  const dayText = bkg.date;
                  return (
                    <div
                      key={bkg.id}
                      className="group relative border border-zinc-800 bg-zinc-950 block overflow-hidden"
                    >
                      {/* Boarding pass accent border */}
                      <div className="absolute left-0 inset-y-0 w-1.5 bg-[#D4AF37]" />

                      {/* Top ribbon */}
                      <div className="border-b border-zinc-900 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex gap-2 items-center">
                          <span className="text-xs uppercase font-mono bg-zinc-900 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 font-bold">
                            PASS ID: {bkg.id}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            Booked on: {new Date(bkg.bookingTime || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                          ● STATUS VERIFIED CONFIRMED
                        </span>
                      </div>

                      {/* Main ticket mesh */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Car and Route */}
                        <div className="md:col-span-7 space-y-3">
                          <div>
                            <span className="text-[9px] text-zinc-550 uppercase font-mono block">Vehicle Registered</span>
                            <span className="text-xl font-light text-white block mt-0.5">
                              {bkg.carId === "ferrari-488"
                                ? "Ferrari 488 Spider Roadster"
                                : bkg.carId === "lambo-huracan"
                                ? "Lamborghini Huracán LP610-4"
                                : bkg.carId === "shelby-cobra"
                                ? "Shelby Cobra Roadster AC (Vintage)"
                                : bkg.carId === "porsche-gt3rs"
                                ? "Porsche 911 GT3 RS"
                                : "Nissan GT-R 'Godzilla'"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] text-zinc-550 uppercase font-mono block">Scenic Route Pass</span>
                            <span className="text-sm font-semibold text-[#D4AF37] block mt-0.5">
                              {bkg.routeId === "chapmans-peak"
                                ? "Chapman's Peak Coast scenic loop"
                                : bkg.routeId === "franschhoek-pass"
                                ? "Franschhoek Wine mountain Switchbacks"
                                : "Killarney Raceway High-speed track session"}
                            </span>
                          </div>

                          {/* Extras checked */}
                          {bkg.extras.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[9px] text-zinc-550 uppercase font-mono block">Concession Extras</span>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {bkg.extras.map((ex, exIdx) => (
                                  <span key={exIdx} className="text-[10px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                                    ✓ {ex}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Schedule & Telemetry barcode */}
                        <div className="md:col-span-5 md:border-l border-zinc-900 md:pl-6 flex flex-col justify-between gap-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[8px] text-zinc-500 uppercase font-mono block">Run date</span>
                              <span className="text-sm text-white font-semibold font-mono">{dayText}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 uppercase font-mono block">Slot Window</span>
                              <span className="text-xs text-white font-semibold font-mono">{bkg.timeSlot}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 uppercase font-mono block">Duration Pass</span>
                              <span className="text-xs text-zinc-400 font-mono">{bkg.durationHours} Hours Session</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 uppercase font-mono block">Deduct total</span>
                              <span className="text-xs text-[#D4AF37] font-semibold font-mono">R {bkg.totalCostZar.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Technical Barcode Layout */}
                          <div className="bg-zinc-900 p-2 text-center rounded-none font-mono">
                            <div className="h-6 flex items-center justify-center gap-0.5 bg-zinc-910 overflow-hidden px-1">
                              {Array.from({ length: 42 }).map((_, i) => {
                                const widths = ["w-0.5", "w-[1px]", "w-1", "w-1.5"];
                                const w = widths[Math.floor(Math.sin(i * 92.1) * 2 + 2)] || "w-0.5";
                                return <div key={i} className={`${w} h-full bg-white opacity-95`} />;
                              })}
                            </div>
                            <span className="text-[8px] text-zinc-550 block mt-1 tracking-[4px] uppercase">
                              *DREAMDRIVE-{bkg.id}*
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ledger Table grid */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-zinc-550 uppercase tracking-widest block font-bold">
              ACCOUNT HISTORY STATEMENT & LEDGER
            </span>

            <div className="border border-zinc-800 overflow-x-auto bg-zinc-950">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-zinc-900/65 text-zinc-400 border-b border-zinc-800">
                    <th className="p-4 uppercase tracking-wider font-semibold">Transaction ID</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Timestamp</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Type</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Description</th>
                    <th className="p-4 uppercase tracking-wider font-semibold text-right">Rand Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {ledger.map(entry => (
                    <tr key={entry.id} className="hover:bg-zinc-900/25 transition-colors">
                      <td className="p-4 font-semibold text-zinc-350">{entry.id}</td>
                      <td className="p-4 text-zinc-500">
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 uppercase font-bold text-[10px]">
                        {entry.type === "deposit" ? (
                          <span className="text-emerald-400">DEPOSIT</span>
                        ) : entry.type === "booking_purchase" ? (
                          <span className="text-amber-400">PURCHASE</span>
                        ) : (
                          <span className="text-[#D4AF37]">BONUS</span>
                        )}
                      </td>
                      <td className="p-4 text-zinc-4 w-1/3 leading-normal font-sans">{entry.details}</td>
                      <td className={`p-4 text-right font-bold font-mono ${entry.type === "deposit" || entry.type === "promo_credit" ? "text-emerald-400" : "text-[#D4AF37]"}`}>
                        {entry.type === "deposit" || entry.type === "promo_credit" ? "+" : "-"} R {entry.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Aspect: Secure top-up terminal and profile updates */}
        <div className="lg:col-span-4 space-y-12">
          {/* SECURE PAYMENT PORTAL */}
          <div className="bg-zinc-905 border border-zinc-800 p-6 relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold mb-1">
              CREDIT TERMINAL
            </span>
            <span className="text-white text-base font-semibold block border-b border-zinc-900 pb-3 mb-6">
              Vault Credit Injection
            </span>

            <form onSubmit={handleDepositSubmit} className="space-y-6">
              {/* Card visual template */}
              <div className="aspect-[1.586/1] w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 flex flex-col justify-between font-mono text-xs text-white shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-zinc-550 uppercase font-mono">DREAM PRIVILEGE CLUB</span>
                  <Database className="w-5 h-5 text-zinc-500 animate-pulse" />
                </div>
                {/* Chip represent */}
                <div className="w-8 h-6 bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded-sm mt-2" />

                <div className="space-y-4">
                  <div className="text-right text-sm tracking-widest font-semibold">{cardNumber}</div>
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span className="uppercase">{cardHolder.toUpperCase()}</span>
                    <span>EXP 12/29</span>
                  </div>
                </div>
              </div>

              {/* Deposit Quick selections */}
              <div className="grid grid-cols-3 gap-2 py-2">
                {[
                  { label: "R10k", val: 10000 },
                  { label: "R25k", val: 25000 },
                  { label: "R50k", val: 50000 }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setDepositAmount(opt.val)}
                    className={`py-2 border text-xs font-mono font-bold transition-colors ${
                      depositAmount === opt.val
                        ? "border-[#D4AF37] text-[#D4AF37] bg-zinc-900"
                        : "border-zinc-900 text-zinc-500 hover:text-white bg-zinc-950/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Input amount */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono text-zinc-500">
                  Custom Top-up Amount (ZAR Rands)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">R</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(parseInt(e.target.value) || 0)}
                    placeholder="Enter Custom Amount"
                    className="w-full bg-black border border-zinc-800 text-white font-mono text-sm pl-10 pr-4 py-3 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isDepositing || depositAmount <= 0}
                className={`w-full py-3.5 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  isDepositing
                    ? "bg-zinc-900 text-zinc-650 border border-zinc-800"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_10px_rgba(16,185,129,0.15)]"
                }`}
              >
                {isDepositing ? "SECURING CLEARANCE LINK..." : "✓ INJECT EXPERIENCE CREDITS"}
              </button>
            </form>
          </div>

          {/* EDITABLE PROFILE PARAMETERS */}
          <div className="bg-zinc-955 border border-zinc-800 p-6 relative">
            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block font-bold mb-1">
              REGISTRATION DESK
            </span>
            <span className="text-white text-base font-semibold block border-b border-zinc-900 pb-3 mb-6">
              Liaison Registry File
            </span>

            <form onSubmit={handleProfileSave} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-widest block text-[9px] font-mono">Pilot Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => {
                    setFullName(e.target.value);
                    setCardHolder(e.target.value);
                  }}
                  className="w-full bg-black/80 border border-zinc-850 text-white px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-widest block text-[9px] font-mono">Pilot Tag Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-black/80 border border-zinc-850 text-white px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-widest block text-[9px] font-mono">License classing</label>
                <input
                  type="text"
                  value={licenseClass}
                  onChange={e => setLicenseClass(e.target.value)}
                  className="w-full bg-black/80 border border-zinc-850 text-white px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-widest block text-[9px] font-mono">License Number Tagus</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value.toUpperCase())}
                  className="w-full bg-black/80 border border-zinc-855 text-white px-3 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono rounded">
                  ✓ Registry credentials updated in backend!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 border border-[#D4AF37]/50 hover:border-[#D4AF37] text-white bg-zinc-950 hover:bg-[#D4AF37]/5 font-mono uppercase tracking-widest text-xs transition-colors cursor-pointer font-bold"
              >
                LOCK REGISTER PARTICULARS
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
