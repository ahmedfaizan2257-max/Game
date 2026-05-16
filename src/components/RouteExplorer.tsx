import React, { useState } from "react";
import { DriveRoute } from "../utils/fallbackData";
import { Compass, MapPin, Eye, Flag, Route, CheckCircle, Navigation } from "lucide-react";
import { motion } from "motion/react";

interface RouteExplorerProps {
  routes: DriveRoute[];
  onSelectRoute: (routeId: string) => void;
}

export default function RouteExplorer({ routes, onSelectRoute }: RouteExplorerProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || "");
  const [highlightedPoint, setHighlightedPoint] = useState<number | null>(null);

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  return (
    <div id="routes-section" className="space-y-12 py-6">
      {/* Editorial Header */}
      <div className="border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">SCENIC PASSES & BENDS</span>
          <h2 className="text-3xl lg:text-5xl font-light text-white font-sans mt-2 tracking-tight">
            Iconic South African <span className="text-[#D4AF37] font-medium">Drive Routes</span>
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mt-3 leading-relaxed">
            Unrivaled marine passes and racing circuits. Carefully mapped out parameters with custom-scheduled checkpoints to test downforce and engine notes.
          </p>
        </div>

        {/* Quick Selection pills */}
        <div className="flex gap-2 bg-zinc-950 border border-zinc-900 p-1 rounded-none">
          {routes.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRouteId(r.id)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                selectedRouteId === r.id
                  ? "bg-[#D4AF37] text-zinc-950"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {r.id === "chapmans-peak" ? "Chapman Coast" : r.id === "franschhoek-pass" ? "Franschhoek Run" : "Killarney Track"}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Pane Map & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Route Technical Specs */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/5 px-2.5 py-1 border border-[#D4AF37]/20 uppercase">
              <Compass className="w-3.5 h-3.5" />
              {activeRoute.difficulty}
            </span>
            <h3 className="text-3xl font-light text-white tracking-tight mt-3">{activeRoute.name}</h3>
            <p className="text-[#D4AF37] text-xs font-mono font-semibold mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Location Base: {activeRoute.location}, South Africa
            </p>
            <p className="text-zinc-400 text-sm mt-4 leading-relaxed font-sans">
              {activeRoute.description}
            </p>
          </div>

          {/* Technical Telemetry Grid */}
          <div className="grid grid-cols-3 gap-4 border-t border-b border-zinc-900 py-6">
            <div>
              <span className="block text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Pass Distance</span>
              <span className="text-2xl font-light text-white mt-1 block">
                {activeRoute.distanceKm} <span className="text-xs text-zinc-405 font-medium">km</span>
              </span>
            </div>
            <div className="border-l border-zinc-900 pl-4">
              <span className="block text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Cruise Duration</span>
              <span className="text-2xl font-light text-white mt-1 block">
                {activeRoute.durationText.split(" ")[0]} {activeRoute.durationText.split(" ")[1]}
              </span>
            </div>
            <div className="border-l border-zinc-900 pl-4">
              <span className="block text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Access Charge</span>
              <span className="text-2xl font-light text-[#D4AF37] mt-1 block font-mono font-semibold">
                R {activeRoute.basePrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Key Checkpoint Highlights with Map-Linked Hovering */}
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-4">
              ROUTE ROADWAY S-BENDS & HIGHLIGHTS
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRoute.highlights.map((hlt, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHighlightedPoint(idx)}
                  onMouseLeave={() => setHighlightedPoint(null)}
                  className={`p-4 border transition-all cursor-pointer flex gap-3 items-start ${
                    highlightedPoint === idx
                      ? "border-[#D4AF37] bg-[#D4AF37]/5 translate-x-1"
                      : "border-zinc-900 bg-zinc-950"
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                    highlightedPoint === idx ? "text-[#D4AF37]" : "text-zinc-650"
                  }`} />
                  <div>
                    <span className="block text-[10px] font-mono text-zinc-550">Node Point #0{idx+1}</span>
                    <span className="text-sm text-zinc-300 font-medium mt-0.5 block">{hlt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onSelectRoute(activeRoute.id)}
              className="px-8 py-4 bg-[#D4AF37] hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-widest text-xs font-mono shadow-[0_4px_10px_rgba(212,175,55,0.15)] transition-all cursor-pointer"
            >
              Configure Package for this Route →
            </button>
          </div>
        </div>

        {/* Right Side: High-End Vector Map Line Plotter */}
        <div className="lg:col-span-5 border border-zinc-800 bg-zinc-950 p-6 relative">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
            DIGITAL ROADWAY TRACKER
          </span>
          <span className="text-xs text-white uppercase tracking-tight block border-b border-zinc-900 pb-2 mb-6 font-semibold">
            Vector Outline Visualizer
          </span>

          {/* Vector Map stage */}
          <div className="aspect-square w-full rounded-none border border-zinc-900 bg-black/60 relative flex items-center justify-center overflow-hidden">
            {/* Background cyber grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="absolute top-4 right-4 flex items-center gap-1 bg-zinc-950/90 text-[10px] font-mono px-2 py-1 border border-zinc-900 text-zinc-400">
              <Route className="w-3.5 h-3.5 text-[#D4AF37]" />
              {activeRoute.location.toUpperCase()} V-GRID 2.6
            </div>

            {/* SVG Path drawing of route mapping wire */}
            <svg
              viewBox="0 0 100 100"
              className="w-4/5 h-4/5 text-zinc-800 hover:text-zinc-700 transition-colors"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            >
              {/* Reference pathway back gray line */}
              <path d={activeRoute.mapPoints[0]} strokeWidth="2.5" className="stroke-zinc-800" />

              {/* Gold overlay pathway that glows/moves */}
              <motion.path
                d={activeRoute.mapPoints[0]}
                stroke="#D4AF37"
                strokeWidth="2.5"
                strokeDasharray="200"
                initial={{ strokeDashoffset: 200 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="opacity-70 drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]"
              />

              {/* Dynamic point indicators linked to highlight index node */}
              {activeRoute.highlights.map((_, hIdx) => {
                // Approximate coordinate nodes along paths
                let x = 30 + hIdx * 20;
                let y = 60 - hIdx * 15;
                if (activeRoute.id === "franschhoek-pass") {
                  x = 25 + hIdx * 25;
                  y = 40 + (hIdx % 2 === 0 ? 25 : -25);
                } else if (activeRoute.id === "killarney-raceway") {
                  x = hIdx === 0 ? 30 : hIdx === 1 ? 70 : hIdx === 2 ? 70 : 30;
                  y = hIdx === 0 ? 30 : hIdx === 1 ? 30 : hIdx === 2 ? 70 : 70;
                }

                const isActive = highlightedPoint === hIdx;

                return (
                  <g key={hIdx} className="transition-all">
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? "4" : "2"}
                      fill={isActive ? "#ef4444" : "#D4AF37"}
                      className="transition-all cursor-pointer"
                    />
                    {isActive && (
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        stroke="#ef4444"
                        strokeWidth="1"
                        fill="none"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Compass rose or watermark visualizer at corner */}
            <div className="absolute bottom-4 left-4 text-[10px] text-zinc-650 font-mono">
              <Navigation className="w-5 h-5 mb-1.5 text-zinc-600 animate-spin" style={{ animationDuration: "12s" }} />
              DREAMDRIVE NAVIGATION SECURE
            </div>
          </div>

          {/* Instructions banner info */}
          <div className="mt-4 border-t border-zinc-900 pt-4 flex gap-3 text-xs text-zinc-400 font-sans leading-relaxed">
            <span className="text-[#D4AF37] font-semibold">ℹ</span>
            <p>
              Hover over route checkpoint tags on the left panel to display GPS node alignments and scenic photography lookout slots directly on the track telemetry map above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
