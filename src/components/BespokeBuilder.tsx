import React, { useState, useEffect } from "react";
import { Supercar, DriveRoute } from "../utils/fallbackData";
import { ShieldAlert, Compass, Sparkles, Key, DollarSign, Users, Award, Check } from "lucide-react";

interface BespokeBuilderProps {
  cars: Supercar[];
  routes: DriveRoute[];
  userBalanceZar: number;
  onBookingSuccess: (bookingDetails: any) => void;
  selectedCarId?: string;
  selectedRouteId?: string;
}

export default function BespokeBuilder({
  cars,
  routes,
  userBalanceZar,
  onBookingSuccess,
  selectedCarId = "",
  selectedRouteId = ""
}: BespokeBuilderProps) {
  // Option Selectors
  const [carId, setCarId] = useState(selectedCarId || cars[0]?.id || "");
  const [routeId, setRouteId] = useState(selectedRouteId || routes[0]?.id || "");
  const [durationHours, setDurationHours] = useState(3); // Default 3 hours

  // Add-on options
  const [gopro, setGopro] = useState(false);
  const [drone, setDrone] = useState(false);
  const [picnic, setPicnic] = useState(false);
  const [instructor, setInstructor] = useState(false);
  const [insuranceElite, setInsuranceElite] = useState(true);

  // License verification details
  const [licenseNumber, setLicenseNumber] = useState("GP-91208-ZA");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic calculated totals
  const [totals, setTotals] = useState({
    carBase: 0,
    routeBase: 0,
    extras: 0,
    insurance: 0,
    instructor: 0,
    subtotal: 0,
    vat: 0,
    grandTotal: 0
  });

  const selectedCar = cars.find(c => c.id === carId) || cars[0];
  const selectedRoute = routes.find(r => r.id === routeId) || routes[0];

  // Recalculate totals instantly
  useEffect(() => {
    if (!selectedCar || !selectedRoute) return;

    // Car Cost calculations
    let carBase = selectedCar.hourlyRate * durationHours;
    if (durationHours >= 24) {
      const days = Math.ceil(durationHours / 24);
      carBase = selectedCar.dayRate * days;
    }

    // Route cost
    const routeBase = selectedRoute.basePrice;

    // Extras cost
    let extras = 0;
    if (gopro) extras += 1200;
    if (drone) extras += 3500;
    if (picnic) extras += 2500;

    // Fees for core requirements
    const instructorCost = instructor ? 2500 : 0;
    const insurance = insuranceElite ? 3800 : 0;

    const subtotal = carBase + routeBase + extras + instructorCost + insurance;
    const vat = subtotal * 0.15; // 15% South African VAT
    const grandTotal = subtotal + vat;

    setTotals({
      carBase,
      routeBase,
      extras,
      insurance,
      instructor: instructorCost,
      subtotal,
      vat,
      grandTotal
    });
  }, [carId, routeId, durationHours, gopro, drone, picnic, instructor, insuranceElite, selectedCar, selectedRoute]);

  // Handle selected car/route override updates
  useEffect(() => {
    if (selectedCarId) setCarId(selectedCarId);
  }, [selectedCarId]);

  useEffect(() => {
    if (selectedRouteId) setRouteId(selectedRouteId);
  }, [selectedRouteId]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!licenseNumber || licenseNumber.trim().length < 6) {
      setFormError("A valid National or International Driver's Licence is required to verify vehicle keys handover.");
      return;
    }

    if (userBalanceZar < totals.grandTotal) {
      setFormError(`Insufficient pilot credits. Your requested run total is R ${totals.grandTotal.toLocaleString()} but your experience vault has only R ${userBalanceZar.toLocaleString()}. Top up in the 'Pilot Dashboard' panel to proceed.`);
      return;
    }

    setIsSubmitting(true);

    const extrasList: string[] = [];
    if (gopro) extrasList.push("GoPro Onboard Footage Master");
    if (drone) extrasList.push("VIP Aerial Cinematic Drone Recording");
    if (picnic) extrasList.push("Gourmet Seaside Luxury Hamper");

    const payload = {
      carId,
      carName: selectedCar.name,
      routeId,
      routeName: selectedRoute.name,
      date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().substring(0, 10), // +2 days out
      timeSlot: durationHours >= 12 ? "08:00 - 18:00 Day Booking" : "13:30 - 16:30 Slot",
      durationHours,
      totalCostZar: totals.grandTotal,
      extras: extrasList,
      instructorRequired: instructor,
      insuranceTier: insuranceElite ? "Elite-Zero-Excess" : "Standard",
      licenseNumber
    };

    try {
      const res = await fetch("/api/bookings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit booking.");
      }

      const verifiedProfile = await res.json();
      
      // Play a custom revving exhaust sound notification to trigger sheer adrenaline!
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sawtooth";
        // simulate engine start! Vroom!
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.3);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.9);
        
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        
        osc.start();
        setTimeout(() => {
          try { osc.stop(); ctx.close(); } catch(e){}
        }, 1300);
      } catch (ae) {}

      onBookingSuccess(verifiedProfile);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred during keys handover validation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="booking-section" className="space-y-12 py-6">
      {/* Editorial Header */}
      <div className="border-b border-zinc-800 pb-8">
        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">CUSTOM EXPERIENCE</span>
        <h2 className="text-3xl lg:text-5xl font-light text-white font-sans mt-2 tracking-tight">
          Bespoke Experience <span className="text-[#D4AF37] font-medium">Configurator</span>
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mt-3 leading-relaxed">
          Stitch together your perfect supercar escape. Select your vehicle, map it to a scenic Pass/Circuit, toggle VVIP add-ons, and instantly verify road legal booking parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Aspect: Selections Panel */}
        <form onSubmit={handleCheckout} className="lg:col-span-7 space-y-8">
          {/* 1. SELECT SUPERCAR */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-zinc-550 uppercase tracking-widest block font-bold">
              01. CUSTOM CHASSIS SELECTION
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cars.map(c => (
                <div
                  key={c.id}
                  onClick={() => setCarId(c.id)}
                  className={`p-4 border cursor-pointer transition-all flex justify-between items-center ${
                    carId === c.id
                      ? "border-[#D4AF37] bg-amber-500/[0.03]"
                      : "border-zinc-900 bg-zinc-950 hover:border-zinc-800"
                  }`}
                >
                  <div>
                    <span className="block text-sm font-semibold text-white">{c.name}</span>
                    <span className="block text-xs font-mono text-zinc-500 mt-1 uppercase">
                      Base Rate: R {c.hourlyRate.toLocaleString()} / Hr
                    </span>
                  </div>
                  {carId === c.id && (
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. SELECT DRIVING PASS */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-zinc-550 uppercase tracking-widest block font-bold">
              02. CHOOSE DRIVE ROADWAY / PASS
            </span>
            <div className="space-y-3">
              {routes.map(r => (
                <div
                  key={r.id}
                  onClick={() => setRouteId(r.id)}
                  className={`p-4 border cursor-pointer transition-all flex justify-between items-center ${
                    routeId === r.id
                      ? "border-[#D4AF37] bg-amber-500/[0.03]"
                      : "border-zinc-900 bg-zinc-950 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <Compass className={`w-5 h-5 ${routeId === r.id ? "text-[#D4AF37]" : "text-zinc-600"}`} />
                    <div>
                      <span className="block text-sm font-semibold text-white">{r.name}</span>
                      <span className="block text-xs text-zinc-450 mt-1">
                        {r.distanceKm}km Curve Run • Base highway access: R {r.basePrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {routeId === r.id && (
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. DURATION SLIDER */}
          <div className="space-y-4 bg-zinc-950 border border-zinc-900 p-6">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-xs text-zinc-500 uppercase font-bold">03. PILOT DURATION PASS</span>
              <span className="text-sm font-bold text-[#D4AF37] uppercase">
                {durationHours === 24 ? "1 Full Day Pass" : `${durationHours} Hours Session`}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="24"
              value={durationHours}
              onChange={e => setDurationHours(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] my-4"
            />

            <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
              <span>1 Hour Sprint</span>
              <span>6 Hours Complete Tour</span>
              <span>12 Hours Cruise</span>
              <span>24 Hours (Full Day Rate)</span>
            </div>
          </div>

          {/* 4. DRIVER LICENSING & EXTRAS COGNITIVE CARD */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-zinc-550 uppercase tracking-widest block font-bold">
              04. PILOT REGISTRATION & DECKING
            </span>
            <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
              <div className="flex gap-4 items-start">
                <Key className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
                <div className="flex-1">
                  <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 font-semibold">
                    Driving License Tag / Passport ID
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value.toUpperCase())}
                    placeholder="Enter License No (e.g. GP-90182-ZA)"
                    className="w-full bg-black/90 border border-zinc-800 text-white font-mono placeholder-zinc-700 text-sm px-4 py-3 mt-2 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  <p className="text-[10px] text-zinc-550 mt-1 leading-relaxed">
                    License holders must be 23+ (25+ for Cobra AC manual roadsters). Real driving telemetry validation occurs prior to key handover.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. ADD ON EXTRAS */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-zinc-550 uppercase tracking-widest block font-bold">
              05. EXCLUSIVE CHAUFFEUR & RETREAT ADD-ONS
            </span>
            <div className="space-y-3">
              {/* GoPro */}
              <label className="flex items-center justify-between p-4 border border-zinc-900 bg-zinc-950/60 cursor-pointer hover:border-zinc-800 transition-colors">
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={gopro}
                    onChange={e => setGopro(e.target.checked)}
                    className="h-4 w-4 rounded bg-black text-[#D4AF37] border-zinc-800 focus:ring-[#D4AF37]"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-white">GoPro Onboard Dual-Angle Video rig</span>
                    <span className="block text-xs text-zinc-500">Dual bumper-mounted 4K telemetry cameras keeping your exhaust notes</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white uppercase">+ R 1,200</span>
              </label>

              {/* Drone pilot */}
              <label className="flex items-center justify-between p-4 border border-zinc-900 bg-zinc-950/60 cursor-pointer hover:border-zinc-800 transition-colors">
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={drone}
                    onChange={e => setDrone(e.target.checked)}
                    className="h-4 w-4 rounded bg-black text-[#D4AF37] border-zinc-800 focus:ring-[#D4AF37]"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-white">Dedicated Cinematic Drone Pursuit Pilot</span>
                    <span className="block text-xs text-zinc-500">Autonomous drone following your run through Chapman's curves</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">+ R 3,500</span>
              </label>

              {/* Gourmet picnic */}
              <label className="flex items-center justify-between p-4 border border-zinc-900 bg-zinc-950/60 cursor-pointer hover:border-zinc-800 transition-colors">
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={picnic}
                    onChange={e => setPicnic(e.target.checked)}
                    className="h-4 w-4 rounded bg-black text-[#D4AF37] border-zinc-800 focus:ring-[#D4AF37]"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-white">Luxury Vineyard Gourmet Hamper Picnic</span>
                    <span className="block text-xs text-zinc-500">Handcrafted local charcuterie, organic cheeses, and non-alcoholic sparkling nectar</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white uppercase">+ R 2,500</span>
              </label>

              {/* Driving Coach */}
              <label className="flex items-center justify-between p-4 border border-zinc-900 bg-zinc-950/60 cursor-pointer hover:border-zinc-800 transition-colors">
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={instructor}
                    onChange={e => setInstructor(e.target.checked)}
                    className="h-4 w-4 rounded bg-black text-[#D4AF37] border-zinc-800 focus:ring-[#D4AF37]"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-[#D4AF37] flex items-center gap-1">
                      <Award className="w-4 h-4 text-[#D4AF37]" />
                      Personal 1-on-1 Pro Driving Coach
                    </span>
                    <span className="block text-xs text-zinc-500">Essential for active track-day racing apex lines and lap times coaching</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">+ R 2,500</span>
              </label>

              {/* Insurance Zero deductible */}
              <label className="flex items-center justify-between p-4 border border-zinc-900 bg-zinc-900/60 cursor-pointer hover:border-zinc-800 transition-colors">
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={insuranceElite}
                    onChange={e => setInsuranceElite(e.target.checked)}
                    className="h-4 w-4 rounded bg-black text-[#D4AF37] border-zinc-800 focus:ring-[#D4AF37]"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-white">Elite-Zero-Deductible Damage Shield</span>
                    <span className="block text-xs text-zinc-505">Eliminate absolute standard deductible holds. Secure zero-liability peace.</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white uppercase">+ R 3,800</span>
              </label>
            </div>
          </div>
        </form>

        {/* Right Aspect: Receipt & Dynamic Submittals Summary Panel */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 p-6 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#D4AF37]" />
          <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block font-bold mb-1">
            DREAMDRIVE VERIFICATION OFFICE
          </span>
          <span className="text-white text-base font-semibold block border-b border-zinc-901 pb-3 mb-6">
            Liaison Cost Statement
          </span>

          <div className="space-y-4 font-mono">
            {/* Selected car and route highlights preview */}
            <div className="p-4 bg-black/60 border border-zinc-900 space-y-2">
              <span className="text-[10px] text-zinc-550 block">CHOSEN TARGET PARAMETERS:</span>
              <span className="block text-sm font-semibold text-white">{selectedCar?.name}</span>
              <span className="block text-[11px] text-zinc-400 font-sans leading-relaxed">{selectedRoute?.name}</span>
            </div>

            {/* Line items list */}
            <div className="space-y-2.5 text-xs py-2 border-b border-zinc-900">
              <div className="flex justify-between">
                <span className="text-zinc-500">Vehicle Frame hire:</span>
                <span className="text-white">R {totals.carBase.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Highway/Track Permission fee:</span>
                <span className="text-white">R {totals.routeBase.toLocaleString()}.00</span>
              </div>
              {totals.extras > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">GoPro / Picnic hampers:</span>
                  <span className="text-[#D4AF37]">R {totals.extras.toLocaleString()}.00</span>
                </div>
              )}
              {totals.instructor > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#D4AF37]">Pro Racing Instructor:</span>
                  <span className="text-white">R {totals.instructor.toLocaleString()}.00</span>
                </div>
              )}
              {totals.insurance > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Zeroexcess Damage shield:</span>
                  <span className="text-white">R {totals.insurance.toLocaleString()}.00</span>
                </div>
              )}
            </div>

            {/* Subtotal & taxes */}
            <div className="space-y-2.5 text-xs py-2 border-b border-zinc-910">
              <div className="flex justify-between text-zinc-400">
                <span>Net Subtotal:</span>
                <span>R {totals.subtotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>SA VAT Taxes (15% Included):</span>
                <span>R {Math.floor(totals.vat).toLocaleString()}.00</span>
              </div>
            </div>

            {/* Grand final total */}
            <div className="flex justify-between items-baseline py-4 border-b border-zinc-900">
              <span className="text-sm text-white font-semibold">PILOT COST TOTAL:</span>
              <span className="text-2xl font-bold text-[#D4AF37]">R {Math.floor(totals.grandTotal).toLocaleString()}</span>
            </div>

            {/* Wallet indicators warning */}
            <div className="py-2 flex justify-between text-xs items-center">
              <span className="text-zinc-500">Your Experience Vault:</span>
              <span className={`font-semibold ${userBalanceZar < totals.grandTotal ? "text-red-500 animate-pulse font-bold" : "text-[#D4AF37]"}`}>
                R {userBalanceZar.toLocaleString()} ZAR
              </span>
            </div>
          </div>

          {formError && (
            <div className="mt-6 p-4 bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-sans leading-relaxed rounded">
              <ShieldAlert className="w-5 h-5 shrink-0 inline mr-2 text-red-400 align-middle" />
              <span className="align-middle">{formError}</span>
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-4 text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-all ${
                userBalanceZar < totals.grandTotal
                  ? "bg-zinc-900 text-zinc-650 border border-zinc-800 pointer-events-none"
                  : "bg-[#D4AF37] hover:bg-amber-400 text-zinc-950 shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
              }`}
            >
              {isSubmitting ? "SWEEPING ROAD ACCESS KEYS..." : "✓ SECURE MY SUPERCAR RUN"}
            </button>
          </div>

          {/* Luxury guarantee logo tags */}
          <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-around text-center">
            <div className="space-y-1">
              <ShieldAlert className="w-4 h-4 mx-auto text-zinc-600" />
              <span className="block text-[8px] text-zinc-500 font-mono tracking-wider uppercase">ZERO SATIS-FAIL</span>
            </div>
            <div className="space-y-1 border-l border-zinc-900 pl-4 w-full">
              <Users className="w-4 h-4 mx-auto text-[#D4AF37]" />
              <span className="block text-[8px] text-zinc-500 font-mono tracking-wider uppercase">VVIP LIAISON ONBOARD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
