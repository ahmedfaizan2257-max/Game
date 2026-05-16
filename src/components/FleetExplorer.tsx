import React, { useState, useRef, useEffect } from "react";
import { Supercar } from "../utils/fallbackData";
import { Volume2, VolumeX, Eye, Flame, Gauge, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FleetExplorerProps {
  cars: Supercar[];
  onSelectCar: (carId: string) => void;
  onLikeCar: (carId: string) => void;
  likedCars: string[];
}

export default function FleetExplorer({ cars, onSelectCar, onLikeCar, likedCars }: FleetExplorerProps) {
  const [filter, setFilter] = useState<"all" | "modern-supercar" | "classic-roadster" | "track-ready">("all");
  const [activeCar, setActiveCar] = useState<Supercar | null>(null);
  const [isRevving, setIsRevving] = useState(false);
  const [revValue, setRevValue] = useState(0.5); // throttle slider (0 to 1)

  // Web Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainOscRef = useRef<OscillatorNode | null>(null);
  const subOscRef = useRef<OscillatorNode | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    // If we switch cars while revving, stop the sound
    if (activeCar) {
      stopEngineSound();
    }
  }, [activeCar]);

  useEffect(() => {
    return () => {
      stopEngineSound();
    };
  }, []);

  // Sync rev value to synthesizer frequency
  useEffect(() => {
    if (isRevving && mainOscRef.current && subOscRef.current && activeCar && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const baseFreq = activeCar.frequencyHz;
      // Synthesize revving up
      let multiplier = 1 + revValue * 2.2; // up to 3.2x base frequency
      if (activeCar.id === "porsche-gt3rs") multiplier = 1 + revValue * 2.8; // higher pitch max for Porsche Flat-6
      if (activeCar.id === "shelby-cobra") multiplier = 1 + revValue * 1.5; // deeper rumble ceiling for Shelby V8

      mainOscRef.current.frequency.exponentialRampToValueAtTime(baseFreq * multiplier, now + 0.15);
      subOscRef.current.frequency.exponentialRampToValueAtTime(baseFreq * 0.5 * multiplier, now + 0.15);

      if (filterNodeRef.current) {
        filterNodeRef.current.frequency.exponentialRampToValueAtTime(baseFreq * multiplier * 2.2, now + 0.15);
      }

      // Slightly increase gain based on rev level
      if (mainGainRef.current) {
        mainGainRef.current.gain.linearRampToValueAtTime(0.18 + revValue * 0.1, now + 0.1);
      }
    }
  }, [revValue, isRevving, activeCar]);

  const startEngineSound = (car: Supercar) => {
    try {
      if (isRevving) {
        stopEngineSound();
        return;
      }

      // Create Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 1. Sawtooth Oscillator (Main throaty motor body)
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(car.frequencyHz, ctx.currentTime);
      mainOscRef.current = osc;

      // 2. Sine Oscillator (Deep sub-bass exhaust note)
      const subOsc = ctx.createOscillator();
      subOsc.type = "sawtooth"; // rougher vibration
      subOsc.frequency.setValueAtTime(car.frequencyHz * 0.5, ctx.currentTime);
      subOscRef.current = subOsc;

      // 3. Audio Filter to model exhaust muffler (eliminates sharp digital buzz)
      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(car.frequencyHz * 1.8, ctx.currentTime);
      filterNodeRef.current = lpFilter;

      // 4. Output Gain Node
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      // smoothly ramp up to avoid clicks
      gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15);
      mainGainRef.current = gainNode;

      // Connections
      osc.connect(lpFilter);
      subOsc.connect(lpFilter);
      lpFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      subOsc.start();
      setIsRevving(true);
      setRevValue(0); // reset throttle
    } catch (err) {
      console.warn("Failed to initialize Web Audio engine simulator:", err);
    }
  };

  const stopEngineSound = () => {
    if (mainGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      try {
        mainGainRef.current.gain.cancelScheduledValues(now);
        mainGainRef.current.gain.setValueAtTime(mainGainRef.current.gain.value, now);
        mainGainRef.current.gain.linearRampToValueAtTime(0, now + 0.15);
      } catch (e) {}

      const ctx = audioCtxRef.current;
      setTimeout(() => {
        try {
          mainOscRef.current?.stop();
          subOscRef.current?.stop();
          ctx.close();
        } catch (e) {}
        mainOscRef.current = null;
        subOscRef.current = null;
        mainGainRef.current = null;
        audioCtxRef.current = null;
        setIsRevving(false);
      }, 200);
    } else {
      setIsRevving(false);
    }
  };

  const quickRevTrigger = () => {
    if (!isRevving) return;
    setRevValue(0.85);
    setTimeout(() => {
      setRevValue(0.1);
    }, 400);
  };

  const filteredCars = cars.filter(car => filter === "all" || car.category === filter);

  return (
    <div id="fleet-section" className="space-y-12 py-6">
      {/* Editorial Header */}
      <div className="border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">PREMIUM STABLE</span>
          <h2 className="text-3xl lg:text-5xl font-light text-white font-sans mt-2 tracking-tight">
            The Dream <span className="text-[#D4AF37] font-medium">Drive Fleet</span>
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mt-3 leading-relaxed">
            Meticulously engineered masterpieces. From classic naturally aspirated blocks with manual control, to hyper-technical F1 paddle-shift systems, choose your weapon for the South African tarmac.
          </p>
        </div>

        {/* Filter Pill List */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "All Vehicles" },
              { id: "modern-supercar", label: "Modern Supercars" },
              { id: "classic-roadster", label: "Classic Muscle" },
              { id: "track-ready", label: "Track weapons" }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 border text-xs uppercase tracking-wider rounded-none font-medium transition-all ${
                filter === tab.id
                  ? "bg-[#D4AF37] border-[#D4AF37] text-zinc-950 font-semibold shadow-md shadow-amber-500/10"
                  : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 bg-zinc-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCars.map(car => {
          const isLiked = likedCars.includes(car.id);
          return (
            <div
              key={car.id}
              className="group relative border border-zinc-800 bg-zinc-950/60 transition-all hover:border-[#D4AF37]/50 overflow-hidden flex flex-col"
            >
              {/* Image & Badge overlay */}
              <div className="relative aspect-video overflow-hidden bg-zinc-900 border-b border-zinc-900">
                <img
                  src={car.image}
                  alt={car.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Visual Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                <div className="absolute top-4 left-4">
                  <span className="text-[10px] uppercase font-mono bg-zinc-950/90 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-1 tracking-wider">
                    {car.category === "modern-supercar"
                      ? "Modern V8/V10"
                      : car.category === "classic-roadster"
                      ? "Vintage Classic"
                      : "FIA Track-Ready"}
                  </span>
                </div>

                {/* Rating Info */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-zinc-950/80 px-2 py-0.5 rounded text-[11px] border border-zinc-800">
                  <span className="text-amber-400">★</span>
                  <span className="text-white font-medium">{car.rating.toFixed(1)}</span>
                  <span className="text-zinc-500">({car.reviewsCount} runs)</span>
                </div>

                <button
                  onClick={() => onLikeCar(car.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-950/80 border border-zinc-800 flex items-center justify-center hover:border-red-500/60 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <span className={isLiked ? "text-red-500 font-bold" : "text-zinc-500"}>
                    {isLiked ? "♥" : "♡"}
                  </span>
                </button>
              </div>

              {/* Specs and details card */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-light tracking-tight text-white">{car.name}</h3>
                  <p className="text-zinc-400 text-xs mt-1 italic font-serif line-clamp-1">{car.vibe}</p>
                  <p className="text-zinc-400 text-xs mt-3 leading-relaxed line-clamp-3">
                    {car.description}
                  </p>

                  {/* Core Telemetry Micro-stats */}
                  <div className="grid grid-cols-3 gap-2 border-t border-b border-zinc-900 py-3 my-4">
                    <div className="text-center">
                      <span className="block text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Power</span>
                      <span className="text-sm font-semibold text-[#D4AF37] flex items-center justify-center gap-0.5 mt-0.5">
                        <Flame className="w-3.5 h-3.5" />
                        {car.hp} HP
                      </span>
                    </div>
                    <div className="text-center border-l border-zinc-900">
                      <span className="block text-[10px] text-zinc-500 font-mono tracking-wider uppercase">0 - 100</span>
                      <span className="text-sm font-semibold text-white flex items-center justify-center gap-0.5 mt-0.5">
                        <Gauge className="w-3.5 h-3.5 text-zinc-500" />
                        {car.acceleration.split(" ")[0]}s
                      </span>
                    </div>
                    <div className="text-center border-l border-zinc-900">
                      <span className="block text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Max speed</span>
                      <span className="text-sm font-semibold text-white flex items-center justify-center gap-0.5 mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-zinc-500" />
                        {car.topSpeed.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rates & Actions */}
                <div>
                  <div className="flex justify-between items-baseline mb-4 font-mono">
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase">Track / Hour Rate</span>
                      <span className="text-base font-semibold text-white">R {car.hourlyRate.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] text-[#D4AF37] uppercase font-bold">★ Full Day Premium</span>
                      <span className="text-lg font-bold text-[#D4AF37]">R {car.dayRate.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => onSelectCar(car.id)}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white text-xs font-semibold uppercase tracking-wider py-3 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                      Specs Sheet
                    </button>
                    <button
                      onClick={() => setActiveCar(car)}
                      className="w-full bg-zinc-950 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-white hover:bg-[#D4AF37]/5 text-xs font-semibold uppercase tracking-wider py-3 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Listen Engine
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Immersive Soundboard Revving Overlay Modal */}
      <AnimatePresence>
        {activeCar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-xl p-8 relative overflow-hidden"
            >
              {/* Background gradient flare */}
              <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-start border-b border-zinc-900 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                    DREAMDRIVE AUDIO LAB
                  </span>
                  <h3 className="text-2xl font-light text-white mt-1">
                    {activeCar.name} <span className="text-[#D4AF37]">Engine Roar</span>
                  </h3>
                </div>
                <button
                  onClick={() => {
                    stopEngineSound();
                    setActiveCar(null);
                  }}
                  className="text-zinc-500 hover:text-white text-sm uppercase tracking-wider font-mono px-3 py-1 border border-zinc-900 hover:border-zinc-700 bg-zinc-950"
                >
                  [Close]
                </button>
              </div>

              {/* Synth visualizer feedback */}
              <div className="bg-zinc-900 rounded-none border border-zinc-800 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-xs uppercase font-mono tracking-widest text-zinc-500">
                  {isRevving ? "ENGINE STATE: IDLE ACTIVE" : "ENGINE STATE: KEY IGNITION STANDBY"}
                </span>

                <div className="h-16 flex items-center gap-1.5 justify-center w-full">
                  {/* Mock spectral wave columns responding to rev value */}
                  {Array.from({ length: 18 }).map((_, i) => {
                    const revFactor = isRevving ? (0.2 + revValue * 0.8) : 0.05;
                    const h = Math.max(
                      8,
                      Math.floor(Math.sin((i / 3) + Date.now() / 150) * 20 * revFactor + 25 * revFactor)
                    );
                    return (
                      <div
                        key={i}
                        style={{ height: `${h}px` }}
                        className={`w-1.5 transition-all duration-75 rounded-full ${
                          isRevving
                            ? revValue > 0.7
                              ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                              : "bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.3)]"
                            : "bg-zinc-800"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="text-xs text-zinc-400 font-mono text-center max-w-sm mt-2">
                  <span className="font-bold text-white uppercase">{activeCar.engine}</span>
                  <span className="block text-[10px] text-zinc-500 mt-1">
                    Sound Profile: {activeCar.soundSample} ({activeCar.frequencyHz}Hz base throttle)
                  </span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="mt-8 space-y-6">
                {/* Ignition switch */}
                <div className="flex flex-col items-center">
                  {!isRevving ? (
                    <button
                      onClick={() => startEngineSound(activeCar)}
                      className="bg-[#D4AF37] hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-widest px-8 py-4 text-xs font-mono shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all flex items-center gap-2 rounded-full cursor-pointer animate-pulse"
                    >
                      <Volume2 className="w-4 h-4" />
                      START ENGINE IGNITION
                    </button>
                  ) : (
                    <button
                      onClick={stopEngineSound}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest px-8 py-4 text-xs font-mono shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex items-center gap-2 rounded-full cursor-pointer"
                    >
                      <VolumeX className="w-4 h-4" />
                      KILL ENGINE SWITCH
                    </button>
                  )}
                </div>

                {/* Revving Accelerator Slider */}
                <div className={`space-y-3 transition-opacity duration-300 ${isRevving ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">IDLE (750 RPM)</span>
                    <span className={`font-semibold ${revValue > 0.85 ? "text-red-500 animate-pulse font-mono font-bold" : "text-[#D4AF37]"}`}>
                      {revValue > 0.85 ? "🚨 REDLINE RED ZONE" : `THROTTLE STAGE: ${Math.floor(revValue * 100)}%`}
                    </span>
                    <span className="text-zinc-500">REDLINE (9200 RPM)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-zinc-500">0.0G</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={revValue}
                      onChange={e => setRevValue(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-805 accent-[#D4AF37]"
                    />
                    <span className="text-xs font-mono text-zinc-500">1.2G</span>
                  </div>

                  {/* Kick Rev Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={quickRevTrigger}
                      className="px-4 py-2 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white text-[11px] font-mono uppercase bg-zinc-900/60 hover:bg-[#D4AF37]/5 transition-colors flex items-center gap-1.5"
                    >
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      Tap Accelerator Rev
                    </button>
                  </div>
                </div>
              </div>

              {/* Safety Warning micro cap */}
              <div className="mt-8 border-t border-zinc-900 pt-4 text-[10px] text-zinc-500 text-center font-mono">
                NOTICE: Built using WebAudio mathematical synth curves. Use headphones for deep cylinders resonance.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
